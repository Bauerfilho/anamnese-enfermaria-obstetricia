/* check-modelos.js — gate binário da Fase 4 (auto-personalização / modelos extras).
   Validamos SEM rede e SEM navegador:
   - criar modelo extra com título + corpo (com placeholders {{campo}});
   - NUNCA tocar nos modelos originais (templates.js);
   - persistir em localStorage e recarregar;
   - preencher placeholders com dados;
   - remover um modelo extra.
   modelos.js exporta MODELOS { abrir, adicionar, remover, listar, preencher, salvar }. */

"use strict";

let MODELOS;
try {
  MODELOS = require("../js/modelos.js");
} catch (e) {
  console.log("FALHOU: js/modelos.js não existe ou não exporta. " + e.message);
  process.exit(1);
}

function assert(c, m) { if (!c) { console.log("FALHOU: " + m); process.exit(1); } }

function novoStore() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; }
  };
}

(function () {
  const store = novoStore();
  const box = MODELOS.abrir(store);
  assert(box && Array.isArray(box.extras), "abrir deve retornar { extras: [] }");
  assert(box.extras.length === 0, "começa sem modelos extras");

  /* 1) adicionar modelo extra */
  const m1 = MODELOS.adicionar(box, {
    titulo: "Evolução Pós-Parto Vaginal",
    corpo: "Paciente {{nome}}, {{idade}} anos.\nEvolução: {{evolucao}}"
  });
  assert(box.extras.length === 1, "adicionou 1 modelo");
  assert(m1.id && m1.id.length > 0, "modelo tem id");
  assert(m1.titulo.includes("Pós-Parto"), "título preservado");
  MODELOS.salvar(store, box);

  /* 2) persistência: reabre e o modelo está lá */
  const box2 = MODELOS.abrir(store);
  assert(box2.extras.length === 1, "modelo persiste após reabrir");
  assert(box2.extras[0].titulo === m1.titulo, "título persiste");

  /* 3) preencher placeholders */
  const saida = MODELOS.preencher(box2.extras[0], { nome: "Ana", idade: "28", evolucao: "Bom estado geral." });
  assert(saida.includes("Paciente Ana, 28 anos."), "placeholder {{nome}}/{{idade}} preenchido");
  assert(saida.includes("Evolução: Bom estado geral."), "placeholder {{evolucao}} preenchido");
  assert(!saida.includes("{{"), "não pode sobrar placeholder vazio quando há dado");

  /* 4) originais intactos: modelos.js NÃO expõe os templates da preceptora */
  assert(typeof MODELOS.TEMPLATES === "undefined", "modelos extras não tocam nos originais");

  /* 5) remover */
  MODELOS.remover(box2, m1.id);
  assert(box2.extras.length === 0, "removeu o modelo");
  MODELOS.salvar(store, box2);
  assert(MODELOS.abrir(store).extras.length === 0, "remoção persiste");

  /* 6) ids únicos */
  const a = MODELOS.adicionar(box2, { titulo: "A", corpo: "x" });
  const b = MODELOS.adicionar(box2, { titulo: "B", corpo: "y" });
  assert(a.id !== b.id, "ids únicos");

  console.log("PASS: modelos extras íntegros (criar/persistir/preencher/remover, originais intactos).");
  process.exit(0);
})();
