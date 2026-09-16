#!/usr/bin/env node
/* ============================================================================
   tools/check-vault.js — GATE do cofre local (binário).
   Prova: (1) poda de entradas > 20 dias; (2) retenção de ≤ 20 dias;
   (3) interconexão por nome normalizado (mesmo nome → mesma paciente);
   (4) export → import é idempotente E poda o que voltou velho demais.
   Exit 0 = PASS; exit 3 = BLOCK.   Uso: node tools/check-vault.js
   ========================================================================== */
"use strict";
const path = require("path");
const V = require(path.join(__dirname, "..", "js", "vault.js"));

let falhas = 0;
function assert(cond, msg) {
  if (cond) console.log("  ✓ " + msg);
  else { console.log("  ✗ " + msg); falhas++; }
}

const DIA = 24 * 60 * 60 * 1000;
const agora = Date.now();

/* storage fake em memória (o módulo aceita injeção p/ teste) */
function memStore() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; }
  };
}

console.log("\n[1] Criação na primeira entrada + retenção de 20 dias");
let store = memStore();
let vault = V.abrir(store);           // primeira entrada → cria
assert(vault && Array.isArray(vault.entradas), "vault criado na primeira entrada");
assert(typeof vault.criadoEm === "number" && vault.criadoEm > 0 && vault.criadoEm <= Date.now() + 1000, "carimbo de criação presente");

V.gravar(vault, { paciente: "Ana Beatriz Rocha", bloco: "Evolução — Puerpério", texto: "doc de hoje", ts: agora });
V.gravar(vault, { paciente: "Ana Beatriz Rocha", bloco: "Alta", texto: "doc de 5 dias", ts: agora - 5 * DIA });
V.gravar(vault, { paciente: "Ana Beatriz Rocha", bloco: "Antigo", texto: "doc de 21 dias", ts: agora - 21 * DIA });
V.salvar(store, vault);

let lido = V.abrir(store);            // reabre → poda automática
assert(lido.entradas.length === 2, `poda removeu > 20 dias (ficaram ${lido.entradas.length}, esperado 2)`);
assert(lido.entradas.every(e => (agora - e.ts) <= 20 * DIA), "todas as entradas ≤ 20 dias");

console.log("\n[2] Interconexão por nome (mesmo nome → mesma paciente)");
const grupos = V.porPaciente(lido.entradas);
const chaveAna = V.normalizar("Ana Beatriz Rocha");
assert(grupos[chaveAna] && grupos[chaveAna].length === 2, "2 docs agrupados sob 'ana beatriz rocha'");
/* variação com acento/caixa diferente deve cair no mesmo grupo */
V.gravar(lido, { paciente: "ana beatriz rocha", bloco: "Outra", texto: "x", ts: agora });
let g2 = V.porPaciente(lido.entradas);
assert(g2[chaveAna].length === 3, "acento/caixa diferente cai no MESMO grupo");

console.log("\n[3] Sync — export / import idempotente e podado");
const json = V.exportar(lido);
const store2 = memStore();
const importado = V.importar(store2, json);
assert(importado.entradas.length === lido.entradas.length, "import preserva entradas válidas");
/* import de arquivo com entrada velha demais deve podar */
const velho = JSON.parse(json);
velho.entradas.push({ id: "velha", paciente: "Maria", bloco: "x", texto: "y", ts: agora - 30 * DIA });
const store3 = memStore();
const imp2 = V.importar(store3, JSON.stringify(velho));
assert(!imp2.entradas.some(e => e.id === "velha"), "import PODA entrada > 20 dias vinda de fora");
/* re-importar o mesmo não duplica (dedup por id) */
const store4 = memStore();
V.importar(store4, json);
const reimp = V.importar(store4, json);
assert(reimp.entradas.length === importado.entradas.length, "re-import NÃO duplica (dedup por id)");

console.log("\n==================================================");
if (falhas === 0) { console.log("VEREDITO: PASS — cofre local íntegro (20d, interconexão, sync)."); process.exit(0); }
console.log(`VEREDITO: BLOCK — ${falhas} falha(s).`); process.exit(3);
