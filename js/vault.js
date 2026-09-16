/* ============================================================================
   vault.js — Cofre LOCAL do histórico de documentos. SEM backend, SEM nuvem.

   Respaldo LGPD (desenho):
   - 100% no dispositivo (localStorage). Nada sai pra servidor.
   - RETENÇÃO: entradas com mais de RETENCAO_DIAS são apagadas automaticamente
     (na gravação, na leitura e na importação). Default: 20 dias.
   - O botão Sync EXPORTA/IMPORTA o cofre como arquivo .json (offline) para a
     médica levar entre dispositivos. O arquivo exportado é responsabilidade de
     quem o guarda (contém dados) — o app avisa.
   - Interconexão: documentos da MESMA paciente (nome normalizado) agrupam,
     dando o histórico completo dos últimos dias daquela gestante.

   Estrutura de uma entrada:
   { id, paciente (nome normalizado), pacienteExib (nome como digitado),
     bloco (tipo de documento), texto, ts (timestamp ms do sistema) }
   ========================================================================== */

(function (root) {
  "use strict";

  const CHAVE = "isana_vault_v1";
  const RETENCAO_DIAS = 20;                 /* decisão do Bauer (pielo) */
  const DIA = 24 * 60 * 60 * 1000;
  const LIMITE = RETENCAO_DIAS * DIA;

  /* ---------- utilidades ---------- */

  /* Normaliza nome pra interconectar: minúsculas, sem acento, sem espaço extra. */
  function normalizar(nome) {
    return String(nome || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")   // remove acentos
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function novoId() {
    return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* Remove entradas com mais de RETENCAO_DIAS (a partir de agora). */
  function podar(vault, agora) {
    const ref = agora || Date.now();
    vault.entradas = vault.entradas.filter((e) => (ref - e.ts) <= LIMITE);
    return vault;
  }

  function vaultVazio() {
    return { versao: 1, criadoEm: Date.now(), entradas: [] };
  }

  /* ---------- API ---------- */

  /* Abre (ou cria na 1ª entrada) o cofre a partir de um storage.
     `store` é localStorage no navegador; em teste, um objeto compatível. */
  function abrir(store) {
    let v = null;
    try {
      const raw = store.getItem(CHAVE);
      if (raw) v = JSON.parse(raw);
    } catch (e) { v = null; }
    if (!v || !Array.isArray(v.entradas)) {
      v = vaultVazio();                        /* primeira entrada → cria */
      salvar(store, v);
    }
    return podar(v);                           /* poda ao abrir */
  }

  function salvar(store, vault) {
    podar(vault);
    try { store.setItem(CHAVE, JSON.stringify(vault)); } catch (e) {}
    return vault;
  }

  /* Grava uma entrada e persiste (com poda). Retorna a entrada criada. */
  function gravar(vault, entrada) {
    const e = {
      id: entrada.id || novoId(),
      paciente: normalizar(entrada.paciente),
      pacienteExib: String(entrada.paciente || "").trim(),
      bloco: entrada.bloco || "Documento",
      texto: entrada.texto || "",
      ts: entrada.ts || Date.now()
    };
    vault.entradas.push(e);
    podar(vault);
    return e;
  }

  /* Agrupa por paciente (chave = nome normalizado), ordenado por data desc. */
  function porPaciente(entradas) {
    const g = {};
    entradas.forEach((e) => {
      (g[e.paciente] = g[e.paciente] || []).push(e);
    });
    Object.keys(g).forEach((k) => g[k].sort((a, b) => b.ts - a.ts));
    return g;
  }

  /* ---------- Sync (export / import, offline) ---------- */

  /* Serializa o cofre PODADO pra download. */
  function exportar(vault) {
    return JSON.stringify(podar(vault), null, 2);
  }

  /* Importa um .json: mescla por id (sem duplicar), poda > 20 dias, salva. */
  function importar(store, json) {
    let incoming = null;
    try { incoming = JSON.parse(json); } catch (e) { incoming = null; }
    const vault = abrir(store);
    if (incoming && Array.isArray(incoming.entradas)) {
      const ids = new Set(vault.entradas.map((e) => e.id));
      incoming.entradas.forEach((e) => {
        if (e && e.id && !ids.has(e.id)) {
          vault.entradas.push({
            id: e.id,
            paciente: normalizar(e.pacienteExib || e.paciente),
            pacienteExib: e.pacienteExib || e.paciente || "",
            bloco: e.bloco || "Documento",
            texto: e.texto || "",
            ts: e.ts || Date.now()
          });
        }
      });
    }
    return salvar(store, vault);               /* salvar já poda */
  }

  const API = {
    CHAVE, RETENCAO_DIAS,
    normalizar, abrir, salvar, gravar, porPaciente, exportar, importar, podar
  };

  /* exporta tanto pro navegador (window.VAULT) quanto pro node (module) */
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.VAULT = API;

})(typeof window !== "undefined" ? window : globalThis);
