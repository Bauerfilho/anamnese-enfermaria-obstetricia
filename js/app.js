/* ============================================================================
   app.js — Motor da calculadora de anamnese.
   Renderiza o formulário a partir de SECTIONS e, a cada interação, gera o
   documento ao vivo interpolando {{campo}} no template ativo. A saída segue
   a ORDEM EXATA do template da preceptora (Regra Suprema).
   100% client-side: nenhum dado sai do dispositivo.
   ========================================================================== */

(function () {
  "use strict";

  /* Estado: mapa campo -> valor atual. Começa com os defaults do schema. */
  const estado = {};
  let secaoAtiva = null;

  /* ---------- Utilidades ---------- */

  function $(sel, el) { return (el || document).querySelector(sel); }
  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  /* Interpola {{campo}} com o valor do estado (ou linha vazia se ausente). */
  function interpolar(texto) {
    return texto.replace(/\{\{(\w+)\}\}/g, function (_, chave) {
      const v = estado[chave];
      return (v == null || v === "") ? "__________" : String(v);
    });
  }

  /* Monta o texto do documento conforme a seção ativa. */
  function gerarDocumento() {
    if (!secaoAtiva) return "";
    const tplKey = secaoAtiva.tpl;

    /* Blocos compostos (alta / atestados) escolhem sub-templates. */
    if (tplKey === "__composto__") return montarAlta();
    if (tplKey === "__atestados__") return montarAtestado();

    const tpl = TEMPLATES[tplKey];
    return tpl ? interpolar(tpl) : "";
  }

  /* Monta a alta conforme a via escolhida + anticoncepção. */
  function montarAlta() {
    const via = estado.via_alta || "Cesariana";
    const partes = [];
    if (via === "Cesariana") {
      partes.push(interpolar(TEMPLATES.prescricaoCesariana));
      partes.push("\n\n" + interpolar(TEMPLATES.orientacoesCesariana));
    } else if (via === "Parto Normal") {
      partes.push(interpolar(TEMPLATES.prescricaoPartoNormal));
      partes.push("\n\n" + interpolar(TEMPLATES.orientacoesPartoNormal));
    } else if (via === "Laparotomia") {
      partes.push(interpolar(TEMPLATES.prescricaoLaparotomia));
      partes.push("\n\n" + interpolar(TEMPLATES.orientacoesLaparotomia));
    } else if (via === "Curetagem") {
      partes.push(interpolar(TEMPLATES.prescricaoCuretagem));
      partes.push("\n\n" + interpolar(TEMPLATES.orientacoesCuretagem));
    } else if (via === "Sd. Hipertensiva") {
      partes.push(interpolar(TEMPLATES.prescricaoSdHipertensiva));
    }
    return partes.join("");
  }

  /* Monta atestado / relatório conforme o tipo. */
  function montarAtestado() {
    const t = estado.doc_tipo || "Licença Maternidade";
    if (t === "Licença Maternidade") return interpolar(TEMPLATES.licencaMaternidade);
    if (t === "Atestado Curetagem") return interpolar(TEMPLATES.atestadoCuretagem);
    if (t === "Relatório DMG") return interpolar(TEMPLATES.relatorioDMG);
    return "";
  }

  /* Anticoncepção: injeta o sub-bloco escolhido no placeholder {{anticoncepcao}}. */
  function resolverAnticoncepcao() {
    const esc = estado.anticoncepcao || "oral";
    if (esc === "oral") return TEMPLATES.anticoncepcaoOral;
    if (esc === "injetavel") return TEMPLATES.anticoncepcaoInjetavel;
    return "(a puérpera optou por não usar método no momento)";
  }

  /* ---------- Renderização ---------- */

  function renderNav() {
    const nav = $("#nav");
    nav.innerHTML = "";
    SECTIONS.forEach(function (s) {
      const b = el("button", "nav-item", s.titulo);
      b.dataset.secao = s.id;
      b.addEventListener("click", function () { ativar(s.id); });
      nav.appendChild(b);
    });
  }

  function ativar(id) {
    secaoAtiva = SECTIONS.find(function (s) { return s.id === id; });
    document.querySelectorAll(".nav-item").forEach(function (b) {
      b.classList.toggle("ativo", b.dataset.secao === id);
    });
    renderForm();
    gerar();
  }

  function renderForm() {
    const root = $("#form-root");
    /* innerHTML usado SÓ com string vazia para limpar o container.
       Conteúdo de usuário NUNCA passa por innerHTML — vai por textContent/value.
       Sem superfície de XSS aqui. */
    root.innerHTML = "";
    if (!secaoAtiva) return;

    const h = el("h2", "secao-titulo", secaoAtiva.titulo);
    root.appendChild(h);

    secaoAtiva.campos.forEach(function (c) {
      root.appendChild(renderCampo(c));
    });
  }

  function renderCampo(c) {
    /* Valor inicial: default do schema, se ainda não setado. */
    if (estado[c.id] === undefined && c.def !== undefined) estado[c.id] = c.def;

    const wrap = el("div", "campo");
    const lab = el("label", "campo-label", c.label);
    lab.htmlFor = "f_" + c.id;
    wrap.appendChild(lab);

    let input;
    if (c.tipo === "textarea") {
      input = el("textarea", "campo-input");
      input.rows = 3;
      input.value = estado[c.id] || "";
    } else if (c.tipo === "single" || c.tipo === "multi") {
      input = renderOpcoes(c);
    } else {
      input = el("input", "campo-input");
      input.type = c.tipo === "numero" ? "number" : (c.tipo === "data" ? "date" : "text");
      input.value = estado[c.id] || "";
    }

    if (input.classList && input.classList.contains("campo-input")) {
      input.id = "f_" + c.id;
      input.addEventListener("input", function () {
        estado[c.id] = input.value;
        gerar();
      });
    }
    wrap.appendChild(input);
    return wrap;
  }

  /* Opções single/multi com cor por frequência e gaveta se muitas. */
  function renderOpcoes(c) {
    const usarGaveta = c.gaveta || (c.opcoes && c.opcoes.length > 4);
    const container = el(usarGaveta ? "details" : "div", "opcoes" + (usarGaveta ? " gaveta" : ""));
    if (usarGaveta) {
      const sum = el("summary", "gaveta-titulo", estado[c.id] ? ("Selecionado: " + estado[c.id]) : "Escolher…");
      container.appendChild(sum);
      container._sum = sum;
    }
    const lista = el("div", "opcoes-lista");
    c.opcoes.forEach(function (o) {
      const b = el("button", "opcao freq-" + o.f, o.v);
      b.type = "button";
      if (estado[c.id] === o.v) b.classList.add("sel");
      b.addEventListener("click", function () {
        estado[c.id] = o.v;
        lista.querySelectorAll(".opcao").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel");
        if (container._sum) container._sum.textContent = "Selecionado: " + o.v;
        gerar();
      });
      lista.appendChild(b);
    });
    container.appendChild(lista);
    return container;
  }

  /* ---------- Saída ---------- */

  let timer = null;
  function gerar() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      /* Anticoncepção precisa estar resolvida antes de interpolar. */
      estado.anticoncepcao = estado.anticoncepcao || "oral";
      const texto = gerarDocumento().replace("{{anticoncepcao}}", resolverAnticoncepcao());
      $("#output").textContent = texto;
      $("#contador").textContent = texto.length + " caracteres";
    }, 120);
  }

  function copiar() {
    const txt = $("#output").textContent;
    navigator.clipboard.writeText(txt).then(function () {
      const b = $("#btn-copiar");
      const old = b.textContent;
      b.textContent = "✓ Copiado";
      b.classList.add("ok");
      setTimeout(function () { b.textContent = old; b.classList.remove("ok"); }, 1600);
    });
  }

  function limpar() {
    if (!secaoAtiva) return;
    secaoAtiva.campos.forEach(function (c) {
      estado[c.id] = (c.def !== undefined) ? c.def : "";
    });
    renderForm();
    gerar();
  }

  /* ---------- Tema ---------- */
  function tema() {
    const html = document.documentElement;
    const novo = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema", novo); } catch (e) {}
  }

  /* ---------- Login (portão de cortesia, client-side) ----------
     Credenciais definidas pelo dono da ferramenta. Ofuscadas (não em texto
     puro) — mas client-side NÃO é cofre: quem abre o DevTools as encontra.
     Serve para "quem tem o link + a senha usa". */
  const _c = { u: "RHJhLiBJc2FuYQ==", p: "TWF0ZXJuaWRhZGUxMjM0" };  // base64
  function credOk(u, p) {
    try { return btoa(u.trim()) === _c.u && btoa(p) === _c.p; }
    catch (e) { return false; }
  }
  function revelarApp() {
    const login = $("#login-screen");
    const app = $("#app");
    login.classList.add("saindo");
    setTimeout(function () {
      login.hidden = true;
      app.hidden = false;
      app.classList.add("entrando");
      /* garante o form renderizado ao revelar */
      if (SECTIONS.length && !secaoAtiva) ativar(SECTIONS[0].id);
    }, 420);
  }
  function initLogin() {
    const form = $("#login-form");
    if (!form) return;
    /* já logado nesta aba? entra direto */
    try {
      if (sessionStorage.getItem("isana_auth") === "1") { revelarApp(); return; }
    } catch (e) {}
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const u = $("#login-user").value;
      const p = $("#login-pass").value;
      if (credOk(u, p)) {
        $("#login-erro").hidden = true;
        try { sessionStorage.setItem("isana_auth", "1"); } catch (e) {}
        revelarApp();
      } else {
        const card = $("#login-card");
        $("#login-erro").hidden = false;
        card.classList.remove("erro");
        void card.offsetWidth; /* reinicia a animação */
        card.classList.add("erro");
      }
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    try {
      const t = localStorage.getItem("tema");
      if (t) document.documentElement.setAttribute("data-theme", t);
    } catch (e) {}

    renderNav();
    $("#btn-copiar").addEventListener("click", copiar);
    $("#btn-limpar").addEventListener("click", limpar);
    $("#btn-tema").addEventListener("click", tema);

    /* Login primeiro; a calculadora só monta após o acesso. */
    initLogin();

    /* PWA */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  });
})();
