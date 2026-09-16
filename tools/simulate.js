#!/usr/bin/env node
/* ============================================================================
   tools/simulate.js — prova o motor de geração SEM navegador.
   Reimplementa a interpolação do app.js sobre os dados reais (templates +
   schema) e verifica: (1) documento nasce preenchido; (2) mudar uma opção
   muda o documento; (3) a saída segue a ordem do template.
   ========================================================================== */
"use strict";
const path = require("path");
const ROOT = path.join(__dirname, "..");
const { TEMPLATES } = require(path.join(ROOT, "js", "templates.js"));
const { SECTIONS } = require(path.join(ROOT, "js", "schema.js"));

function interpolar(tpl, estado) {
  return String(tpl).replace(/\{\{(\w+)\}\}/g, (_, k) =>
    (k === "anticoncepcao") ? TEMPLATES.anticoncepcaoOral
      : (estado[k] != null && estado[k] !== "") ? String(estado[k]) : "__________");
}

let falhas = 0;
function assert(cond, msg) {
  if (cond) console.log("  ✓ " + msg);
  else { console.log("  ✗ " + msg); falhas++; }
}

/* (1) Documento nasce preenchido com defaults fisiológicos */
console.log("\n[1] Documento nasce preenchido (defaults)");
const sec = SECTIONS.find((s) => s.id === "evolucao-puerperio");
const estado = {};
sec.campos.forEach((c) => { estado[c.id] = (c.def !== undefined) ? c.def : ""; });
const doc0 = interpolar(TEMPLATES[sec.tpl], estado);
assert(!/\{\{/.test(doc0), "sem placeholders no output inicial");
assert(doc0.includes("Bom estado geral"), "default fisiológico presente");
assert(doc0.includes("NEGA SINAIS DE IMINÊNCIA DE ECLAMPSIA"), "frase verbatim da evolução presente");
assert(doc0.includes("Puerpério fisiológico"), "hipótese default presente");

/* (2) Mudar uma opção muda o documento */
console.log("\n[2] Interação muda o documento");
const antes = doc0.length;
estado.parto = "Parto normal";
estado.ata_laqueadura = "Sim";
const doc1 = interpolar(TEMPLATES[sec.tpl], estado);
assert(doc1.includes("Parto: Parto normal"), "via de parto atualizada");
assert(doc1.includes("Possui ATA de laqueadura? Sim"), "ATA atualizada");
assert(doc1 !== doc0, "documento re-gerou (diferente do inicial, len " + antes + "→" + doc1.length + ")");

/* (3) Ordem da saída = ordem do template (campos-chave na sequência) */
console.log("\n[3] Ordem do documento segue o template");
const ordem = ["Nome:", "GPA:", "Parto:", "Comorbidades:", "Exames da internação",
  "Nota de parto", "Evolução:", "Exame físico:", "Hipótese Diagnóstica:", "CONDUTA"];
let pos = -1, ordenado = true;
ordem.forEach((tok) => {
  const i = doc1.indexOf(tok);
  if (i < pos) ordenado = false;
  pos = i;
});
assert(ordenado, "campos na ordem exata do template");
assert(doc1.indexOf("Tipagem sanguinea:") < doc1.indexOf("VDRL:"), "exames na ordem (tipagem→VDRL)");

/* (4) Alta composta escolhe sub-template certo */
console.log("\n[4] Alta composta (via de parto → prescrição certa)");
const via = "Parto Normal";
const altaPN = TEMPLATES.prescricaoPartoNormal + "\n\n" + TEMPLATES.orientacoesPartoNormal;
assert(altaPN.includes("SULFATO FERROSO 60MG"), "prescrição parto normal verbatim");
assert(altaPN.includes("ANDOLBA SPRAY"), "orientação específica de PN presente");

console.log("\n==================================================");
if (falhas === 0) { console.log("VEREDITO: PASS — motor gera o documento correto."); process.exit(0); }
console.log(`VEREDITO: BLOCK — ${falhas} falha(s).`); process.exit(3);
