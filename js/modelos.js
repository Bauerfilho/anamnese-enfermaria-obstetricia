/* ============================================================================
   modelos.js — Auto-personalização: a médica adiciona MODELOS EXTRAS de
   evolução/documento sem ligar pro Bauer. Simples no olhar; poderoso ao abrir.

   REGRA DE OURO (Regra Suprema): NUNCA toca nos modelos originais da preceptora
   (templates.js). Os extras vivem à parte, em localStorage próprio, e entram no
   menu como seções novas. Originais ficam intactos e intocados.

   Um modelo extra = { id, titulo, corpo }. O corpo aceita placeholders {{campo}}
   (ex.: {{nome}}, {{idade}}) que são preenchidos com os dados do formulário.

   API (pura, testável em node):
     abrir(store)                -> { extras: [ ... ] }
     salvar(store, box)
     adicionar(box, {titulo, corpo}) -> modelo (com id)
     remover(box, id)
     listar(box)                 -> array de modelos
     preencher(modelo, dados)    -> corpo com {{campo}} substituído
   ========================================================================== */

(function (root) {
  "use strict";

  const KEY = "isana_modelos_v1";

  function novoBox() { return { v: 1, extras: [] }; }

  function abrir(store) {
    try {
      const raw = store.getItem(KEY);
      if (!raw) return novoBox();
      const box = JSON.parse(raw);
      if (!box || !Array.isArray(box.extras)) return novoBox();
      return box;
    } catch (e) { return novoBox(); }
  }

  function salvar(store, box) {
    store.setItem(KEY, JSON.stringify(box));
  }

  function uid() {
    return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function adicionar(box, dados) {
    const modelo = {
      id: uid(),
      titulo: String(dados.titulo || "Modelo sem título").trim(),
      corpo: String(dados.corpo || ""),
      ts: Date.now()
    };
    box.extras.push(modelo);
    return modelo;
  }

  function remover(box, id) {
    box.extras = box.extras.filter(function (m) { return m.id !== id; });
  }

  function listar(box) {
    return box.extras.slice().sort(function (a, b) { return a.ts - b.ts; });
  }

  /* Substitui {{campo}} pelo valor em `dados`. Campo sem dado some (vira ""). */
  function preencher(modelo, dados) {
    return String(modelo.corpo || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      function (todo, campo) {
        const v = dados[campo];
        return (v === undefined || v === null) ? "" : String(v);
      });
  }

  const API = { abrir, salvar, adicionar, remover, listar, preencher };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.MODELOS = API;

})(typeof window !== "undefined" ? window : globalThis);
