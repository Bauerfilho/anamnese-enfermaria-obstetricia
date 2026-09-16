/* check-sync-real.js — valida o sync contra o Supabase REAL (integração).
   Lê credenciais de ~/.config/anamnese-go/supabase.env (NUNCA versionado).
   Sobe uma linha CIFRADA de teste, baixa, decifra, e limpa (apaga o teste). */

"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

const CRYPTO = require("../js/crypto.js");
const SYNC = require("../js/sync.js");
const VAULT = require("../js/vault.js");

function assert(c, m) { if (!c) { console.log("FALHOU: " + m); process.exit(1); } }

function novoStore() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; }
  };
}

/* lê SUPABASE_URL / SUPABASE_ANON_KEY do env local */
function credenciais() {
  const p = path.join(os.homedir(), ".config/anamnese-go/supabase.env");
  const txt = fs.readFileSync(p, "utf8");
  const out = {};
  txt.split(/\r?\n/).forEach((l) => {
    const i = l.indexOf("=");
    if (i > 0) out[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  });
  return out;
}

/* client Supabase mínimo via fetch REST (sem depender da lib no node) */
function restClient(url, key) {
  const H = { "apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates" };
  return {
    from: (t) => ({
      upsert: async (row) => {
        const r = await fetch(url + "/rest/v1/" + t, { method: "POST", headers: H, body: JSON.stringify(row) });
        return { error: r.ok ? null : await r.text() };
      },
      select: () => ({
        order: async () => {
          const r = await fetch(url + "/rest/v1/" + t + "?select=*", { headers: H });
          return { data: r.ok ? await r.json() : [], error: r.ok ? null : await r.text() };
        }
      }),
      delete: () => ({
        lt: async () => ({ error: null }),
        eq: async (col, val) => {
          const r = await fetch(url + "/rest/v1/" + t + "?id=eq." + encodeURIComponent(val), { method: "DELETE", headers: H });
          return { error: r.ok ? null : await r.text() };
        }
      })
    })
  };
}

(async function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = credenciais();
  assert(SUPABASE_URL && SUPABASE_ANON_KEY, "credenciais ausentes em ~/.config/anamnese-go/supabase.env");

  const key = await CRYPTO.deriveKey("Maternidade1234");
  const client = restClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  SYNC.init({ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, client, cryptoKey: key });

  /* 1) push de uma entrada de TESTE (marcada) */
  const store = novoStore();
  const vault = VAULT.abrir(store);
  const marca = "TESTE-SYNC-" + Date.now();
  const entrada = VAULT.gravar(vault, {
    paciente: "Paciente Teste Sync", bloco: "Teste",
    texto: "Conteúdo de teste " + marca, ts: Date.now()
  });
  VAULT.salvar(store, vault);
  const up = await SYNC.push(entrada);
  assert(up.ok, "push deve subir: " + JSON.stringify(up.erro || ""));

  /* 2) confere no servidor: NÃO pode ter texto claro */
  const sel = await client.from("documentos").select().order();
  const row = (sel.data || []).find((r) => r.id === entrada.id);
  assert(row, "linha de teste deve existir no servidor");
  assert(!row.texto_enc.includes("Paciente Teste"), "servidor NÃO pode guardar texto claro");
  assert(!row.texto_enc.includes(marca), "servidor NÃO pode guardar a marca em claro");
  assert(!row.paciente_enc.includes("Teste Sync"), "servidor NÃO pode guardar o nome em claro");

  /* 3) pull num vault VAZIO (outro aparelho) decifra */
  const store2 = novoStore();
  const vault2 = VAULT.abrir(store2);
  const p = await SYNC.pullAll(store2, vault2);
  assert(p.ok, "pullAll deve funcionar");
  const v2 = VAULT.abrir(store2);
  const recebido = v2.entradas.find((e) => e.id === entrada.id);
  assert(recebido, "pull deve trazer a entrada de teste");
  assert(recebido.texto.includes(marca), "pull deve DECIFRAR o texto");
  assert(recebido.pacienteExib.includes("Teste Sync"), "pull deve decifrar o nome");

  /* 4) limpeza: apaga a linha de teste do servidor */
  await client.from("documentos").delete().eq("id", entrada.id);
  const conf = await client.from("documentos").select().order();
  assert(!(conf.data || []).some((r) => r.id === entrada.id), "teste deve ser removido do servidor");

  console.log("PASS: sync REAL validado — subiu cifrado, servidor sem texto claro, pull decifrou, limpeza ok.");
  process.exit(0);
})().catch((e) => { console.log("FALHOU (exceção): " + e.message); process.exit(1); });
