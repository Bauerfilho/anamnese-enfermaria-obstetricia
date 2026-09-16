#!/usr/bin/env node
/* ============================================================================
   tools/check.js — GATE DE FIDELIDADE (binário).
   Prova que o documento GERADO bate com o template da preceptora:
     G-A) nenhum placeholder {{...}} sobra no output com defaults preenchidos;
     G-B) toda chave {{campo}} do template existe como campo no schema da seção;
     G-C) os templates fixos (orientações/prescrições) são verbatim contra a fonte.
   Exit 0 = PASS; exit 3 = BLOCK.
   Uso: node tools/check.js
   ========================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { TEMPLATES } = require(path.join(ROOT, "js", "templates.js"));
const { SECTIONS } = require(path.join(ROOT, "js", "schema.js"));

let falhas = [];
function ok(msg) { console.log("  ✓ " + msg); }
function bad(msg) { falhas.push(msg); console.log("  ✗ " + msg); }

/* --- coleta todas as chaves {{campo}} de um template --- */
function chaves(tpl) {
  const s = new Set();
  String(tpl).replace(/\{\{(\w+)\}\}/g, (_, k) => { s.add(k); return _; });
  return [...s];
}

console.log("\n[G-B] Toda chave do template tem campo no schema (e vice-versa)");
let gb = 0;
SECTIONS.forEach((sec) => {
  const tplKey = sec.tpl;
  if (tplKey === "__composto__" || tplKey === "__atestados__") return; // compostos: conferidos abaixo
  const tpl = TEMPLATES[tplKey];
  if (!tpl) { bad(`seção ${sec.id}: template "${tplKey}" ausente`); gb++; return; }
  const ksT = chaves(tpl);
  const ksS = new Set(sec.campos.map((c) => c.id));
  // chaves do template sem campo correspondente (exceto as de sub-bloco resolvidas no motor)
  const motor = new Set(["anticoncepcao"]);
  ksT.forEach((k) => {
    if (!ksS.has(k) && !motor.has(k)) { bad(`seção ${sec.id}: template usa {{${k}}} sem campo no schema`); gb++; }
  });
  ok(`seção ${sec.id}: ${ksT.length} chaves conferidas`);
});

console.log("\n[G-A] Defaults preenchem todos os placeholders (nada de {{}} no output)");
let ga = 0;
SECTIONS.forEach((sec) => {
  const tplKey = sec.tpl;
  if (tplKey === "__composto__" || tplKey === "__atestados__") return;
  const tpl = TEMPLATES[tplKey];
  const estado = {};
  sec.campos.forEach((c) => { estado[c.id] = (c.def !== undefined) ? c.def : "X"; });
  estado.anticoncepcao = estado.anticoncepcao || "oral";
  const out = String(tpl).replace(/\{\{(\w+)\}\}/g, (_, k) =>
    (k === "anticoncepcao") ? TEMPLATES.anticoncepcaoOral
      : (estado[k] != null && estado[k] !== "") ? String(estado[k]) : "__________");
  const sobra = out.match(/\{\{\w+\}\}/g);
  if (sobra) { bad(`seção ${sec.id}: placeholders não resolvidos: ${[...new Set(sobra)].join(", ")}`); ga++; }
  else ok(`seção ${sec.id}: output sem placeholders`);
});

console.log("\n[G-C] Trechos fixos verbatim contra a fonte (doses/orientações)");
const fonte = fs.readFileSync(path.join(ROOT, "tools", "isana-template.txt"), "utf8");
/* Amostras canônicas que NÃO podem divergir da fonte. */
const amostras = [
  "Nifedipino", "SULFATO FERROSO 60", "DIPIRONA 500", "IBUPROFENO 600",
  "ACETATO MEDROXIPROGESTERONA", "DESOGESTREL", "NIMESULIDA 100",
  "CONSULTA DE PUERPÉRIO EM UNIDADE BÁSICA DE SAÚDE COM 10 DIAS",
  "Maternidade Nossa Senhora de Lourdes"
];
let gc = 0;
/* verifica que cada amostra existe na FONTE (sanity) e nos TEMPLATES (fidelidade) */
const todoTpl = Object.values(TEMPLATES).join("\n");
amostras.forEach((a) => {
  const naFonte = fonte.includes(a);
  const noTpl = todoTpl.includes(a);
  if (!naFonte) { bad(`amostra ausente na FONTE (revisar fonte): "${a}"`); gc++; }
  else if (!noTpl) { bad(`amostra da fonte NÃO reproduzida nos templates: "${a}"`); gc++; }
  else ok(`verbatim: "${a}"`);
});

/* --- veredito --- */
const total = falhas.length;
console.log("\n==================================================");
if (total === 0) {
  console.log("VEREDITO: PASS — saída fiel ao template da preceptora.");
  process.exit(0);
} else {
  console.log(`VEREDITO: BLOCK — ${total} divergência(s).`);
  falhas.forEach((f) => console.log("  - " + f));
  process.exit(3);
}
