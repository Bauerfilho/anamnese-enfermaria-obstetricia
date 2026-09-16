/* ============================================================================
   sync.js — Sincronização do histórico entre computadores, via Supabase.

   DESENHO LGPD:
   - O texto e o nome da paciente sobem CIFRADOS (crypto.js, AES-GCM). O
     servidor guarda só ciphertext. A chave deriva da senha do app (PBKDF2).
   - O agrupamento por paciente usa um HASH (sha256 do nome normalizado), nunca
     o nome em claro.
   - Retenção: aplica-se a poda de 20 dias ao que vem da nuvem (e o vault local
     já poda ao salvar/ler). Nuvem não é arquivo permanente.
   - Offline-first: o localStorage (vault.js) é a fonte imediata; o Supabase é a
     réplica entre aparelhos. Sem rede, o app continua funcionando.

   API:
     init({url, anonKey, client?, cryptoKey})  — client injetável p/ testes.
     push(entrada)                              — cifra e sobe UMA entrada.
     pullAll(store, vault)                      — baixa tudo, decifra, mescla.
     sincronizar(store, vault)                  — pullAll + push do que falta.
     assinar(cb, store)                         — Realtime: insert remoto.
     aplicarRemoto(store, row)                  — decifra uma linha e mescla.
     online()                                   — navigator.onLine (ou true).

   Exporta SYNC em window (navegador) e module.exports (node, p/ testes).
   ========================================================================== */

(function (root) {
  "use strict";

  const CRYPTO = (typeof module !== "undefined" && module.exports)
    ? require("./crypto.js")
    : root.CRYPTO;
  const VAULT = (typeof module !== "undefined" && module.exports)
    ? require("./vault.js")
    : root.VAULT;

  const TABELA = "documentos";
  let _client = null;
  let _key = null;      /* CryptoKey de criptografia */
  let _canal = null;

  function online() {
    return (typeof navigator === "undefined") ? true : navigator.onLine !== false;
  }

  /* init aceita um `client` pronto (teste/mock) OU cria um real via window.__sb. */
  function init(opts) {
    _key = opts.cryptoKey || null;
    if (opts.client) { _client = opts.client; return; }
    if (opts.url && opts.anonKey && root.__sb && root.__sb.createClient) {
      _client = root.__sb.createClient(opts.url, opts.anonKey);
    }
  }

  function pronto() { return !!_client && !!_key; }

  /* Converte uma entrada local (vault) numa linha CIFRADA p/ o servidor. */
  async function entradaParaLinha(e) {
    const nomeExib = e.pacienteExib || e.paciente || "";
    return {
      id: e.id,
      paciente_hash: await CRYPTO.hashPaciente(nomeExib),
      paciente_enc: await CRYPTO.enc(nomeExib, _key),
      bloco: e.bloco || "Documento",
      texto_enc: await CRYPTO.enc(e.texto || "", _key),
      ts: e.ts || Date.now()
    };
  }

  /* Converte uma linha do servidor numa entrada local DECIFRADA. */
  async function linhaParaEntrada(row) {
    let nome = "", texto = "";
    try { nome = await CRYPTO.dec(row.paciente_enc, _key); } catch (e) { nome = "(ilegível)"; }
    try { texto = await CRYPTO.dec(row.texto_enc, _key); } catch (e) { texto = ""; }
    return {
      id: row.id,
      paciente: CRYPTO.normalizar(nome),
      pacienteExib: nome,
      bloco: row.bloco || "Documento",
      texto: texto,
      ts: row.ts || Date.now()
    };
  }

  /* Mescla uma entrada no vault SEM duplicar (por id) e já podada. */
  function mesclar(store, vault, entrada) {
    const existe = vault.entradas.some(function (x) { return x.id === entrada.id; });
    if (!existe) {
      vault.entradas.push(entrada);
      VAULT.salvar(store, vault);   /* salvar já poda (>20 dias) */
    }
    return vault;
  }

  /* Sobe UMA entrada (cifrada). */
  async function push(entrada) {
    if (!pronto() || !online()) return { ok: false, motivo: "offline-ou-sem-config" };
    const linha = await entradaParaLinha(entrada);
    const r = await _client.from(TABELA).upsert(linha);
    return { ok: !r.error, erro: r.error || null };
  }

  /* Baixa tudo, decifra, mescla (poda 20 dias via salvar). */
  async function pullAll(store, vault) {
    if (!pronto() || !online()) return { ok: false, inseridos: 0 };
    const r = await _client.from(TABELA).select("*").order("ts", { ascending: false });
    if (r.error) return { ok: false, inseridos: 0, erro: r.error };
    let inseridos = 0;
    const antes = new Set(vault.entradas.map(function (e) { return e.id; }));
    for (const row of (r.data || [])) {
      if (antes.has(row.id)) continue;
      const entrada = await linhaParaEntrada(row);
      /* só mescla se dentro da retenção — a poda no salvar garante, mas evitamos
         inserir lixo velho explicitamente */
      if ((Date.now() - entrada.ts) <= VAULT.RETENCAO_DIAS * 24 * 60 * 60 * 1000) {
        mesclar(store, vault, entrada);
        inseridos++;
      }
    }
    return { ok: true, inseridos: inseridos };
  }

  /* Sincronização completa: sobe o que falta, baixa o que veio. */
  async function sincronizar(store, vault) {
    if (!pronto()) return { ok: false, motivo: "sem-config" };
    /* sobe locais que (talvez) não estejam na nuvem */
    let subidos = 0, falhas = 0;
    for (const e of vault.entradas) {
      const r = await push(e);
      if (r.ok) subidos++; else falhas++;
    }
    const p = await pullAll(store, vault);
    return { ok: p.ok, subidos: subidos, falhas: falhas, recebidos: p.inseridos || 0 };
  }

  /* Aplica uma linha remota (Realtime) no vault local. Retorna a entrada. */
  async function aplicarRemoto(store, row) {
    const vault = VAULT.abrir(store);
    const entrada = await linhaParaEntrada(row);
    mesclar(store, vault, entrada);
    return entrada;
  }

  /* Assina inserts remotos (Realtime). cb recebe a entrada decifrada. */
  function assinar(cb, store) {
    if (!pronto()) return null;
    _canal = _client.channel("doc-changes")
      .on("postgres_changes",
          { event: "INSERT", schema: "public", table: TABELA },
          async function (payload) {
            const entrada = await aplicarRemoto(store, payload.new);
            if (cb) cb(entrada);
          })
      .subscribe();
    return _canal;
  }

  const API = {
    init, push, pullAll, sincronizar, assinar, aplicarRemoto, online,
    _pronto: pronto
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.SYNC = API;

})(typeof window !== "undefined" ? window : globalThis);
