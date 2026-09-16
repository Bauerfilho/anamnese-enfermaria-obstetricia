/* check-sync.js — gate binário da Fase 2 (sync com Supabase), SEM rede.
   O cliente Supabase é MOCKADO. Validamos:
   - push CIFRA antes de enviar (servidor só recebe ciphertext);
   - pull DECIFRA e MESCLA no vault por id (sem duplicar);
   - poda de 20 dias aplica ao que vem da nuvem;
   - assinar() registra callback de Realtime.
   sync.js exporta SYNC { init, push, pullAll, sincronizar, assinar } e aceita
   injeção de um client fake (para este teste). */

"use strict";

const CRYPTO = require("../js/crypto.js");
let SYNC, VAULT;
try {
  SYNC = require("../js/sync.js");
  VAULT = require("../js/vault.js");
} catch (e) {
  console.log("FALHOU: js/sync.js não existe ou não exporta. " + e.message);
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) { console.log("FALHOU: " + msg); process.exit(1); }
}

/* ---- mock mínimo de localStorage ---- */
function novoStore() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; },
    _dump: () => m
  };
}

/* ---- mock do Supabase: guarda linhas e registra chamadas ---- */
function novoSupabaseFake() {
  const linhas = {};        // id -> row (ciphertext)
  const calls = { upsert: 0, select: 0, channel: 0 };
  let onInsert = null;
  const client = {
    from: function () {
      return {
        upsert: async function (row) { calls.upsert++; linhas[row.id] = row; return { error: null }; },
        select: function () {
          return {
            order: function () {
              calls.select++;
              return Promise.resolve({ data: Object.values(linhas), error: null });
            }
          };
        },
        delete: function () { return { lt: async function () { return { error: null }; } }; }
      };
    },
    channel: function () {
      calls.channel++;
      return {
        on: function (tipo, filtro, cb) { onInsert = cb; return this; },
        subscribe: function () { return this; }
      };
    },
    _linhas: linhas,
    _calls: calls,
    _dispararInsert: function (row) { if (onInsert) onInsert({ new: row }); }
  };
  return client;
}

(async function () {
  const key = await CRYPTO.deriveKey("Maternidade1234");
  const store = novoStore();
  const sb = novoSupabaseFake();

  /* init com client injetado (sem rede) */
  SYNC.init({ url: "https://x.supabase.co", anonKey: "k", client: sb, cryptoKey: key });

  /* 1) PUSH: cifra antes de enviar */
  const vault = VAULT.abrir(store);
  const entrada = VAULT.gravar(vault, {
    paciente: "Ana Beatriz Rocha", bloco: "Evolução Puerpério",
    texto: "Texto claro com nome Ana Beatriz", ts: Date.now()
  });
  VAULT.salvar(store, vault);
  await SYNC.push(entrada);
  assert(sb._calls.upsert === 1, "push deve chamar upsert 1x");
  const enviado = sb._linhas[entrada.id];
  assert(enviado, "linha deve ter ido ao servidor (mock)");
  assert(typeof enviado.texto_enc === "string" && !enviado.texto_enc.includes("Ana Beatriz"),
    "texto_enc NÃO pode conter nome/texto em claro");
  assert(!enviado.paciente_enc.includes("Ana Beatriz"), "paciente_enc NÃO pode conter nome em claro");
  assert(/^[0-9a-f]{64}$/.test(enviado.paciente_hash), "paciente_hash = sha256 hex");

  /* 2) PULL: decifra e mescla sem duplicar */
  const store2 = novoStore();           /* outro aparelho (vault vazio) */
  const vault2 = VAULT.abrir(store2);
  await SYNC.pullAll(store2, vault2);
  assert(sb._calls.select >= 1, "pullAll deve consultar o servidor");
  const v2 = VAULT.abrir(store2);
  assert(v2.entradas.length === 1, "pull deve inserir 1 entrada no vault local");
  assert(v2.entradas[0].texto.includes("Ana Beatriz"), "pull deve DECIFRAR o texto");
  assert(v2.entradas[0].pacienteExib.includes("Ana"), "pull deve decifrar o nome de exibição");

  /* puxar de novo NÃO duplica (mescla por id) */
  await SYNC.pullAll(store2, VAULT.abrir(store2));
  assert(VAULT.abrir(store2).entradas.length === 1, "pull repetido não pode duplicar");

  /* 3) PODA: entrada da nuvem com mais de 20 dias some */
  const velho = await CRYPTO.enc("doc antigo", key);
  sb._linhas["velho1"] = {
    id: "velho1", paciente_hash: await CRYPTO.hashPaciente("Velha"),
    paciente_enc: await CRYPTO.enc("Velha", key), bloco: "Doc", texto_enc: velho,
    ts: Date.now() - (21 * 24 * 60 * 60 * 1000)
  };
  await SYNC.pullAll(store2, VAULT.abrir(store2));
  const ids = VAULT.abrir(store2).entradas.map((e) => e.id);
  assert(!ids.includes("velho1"), "entrada da nuvem com >20 dias deve ser podada");

  /* 4) ASSINAR (Realtime): registra callback e mescla insert novo */
  let recebeu = null;
  SYNC.assinar(async function (doc) { recebeu = doc; });
  assert(sb._calls.channel >= 1, "assinar deve abrir um channel");
  const novoRow = {
    id: "novo9", paciente_hash: await CRYPTO.hashPaciente("Maria Silva"),
    paciente_enc: await CRYPTO.enc("Maria Silva", key), bloco: "Alta",
    texto_enc: await CRYPTO.enc("Evolução da Maria", key), ts: Date.now()
  };
  /* o callback de realtime precisa de um vault-alvo; o sync deve expor um modo de
     aplicar num vault. Para o teste, validamos que o insert chega decifrado. */
  const aplicado = await SYNC.aplicarRemoto(store2, novoRow);
  assert(aplicado && aplicado.texto.includes("Maria"), "aplicarRemoto deve decifrar o insert");
  assert(VAULT.abrir(store2).entradas.some((e) => e.id === "novo9"), "insert remoto entra no vault");

  console.log("PASS: sync íntegro (cifra no push, decifra no pull, mescla por id, poda 20d, realtime).");
  process.exit(0);
})().catch(function (e) { console.log("FALHOU (exceção): " + e.message); process.exit(1); });
