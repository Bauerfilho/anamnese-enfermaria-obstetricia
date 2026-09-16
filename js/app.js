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

  /* Auto-ajusta a altura do textarea ao conteúdo (sem scroll interno esmagado). */
  function autoAltura() {
    const out = $("#output");
    if (!out) return;
    out.style.height = "auto";
    out.style.height = Math.max(out.scrollHeight, 320) + "px";
  }

  let timer = null;
  function gerar() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      /* Se o usuário editou o documento à mão, NÃO sobrescrever. */
      if (outputSujo) return;
      estado.anticoncepcao = estado.anticoncepcao || "oral";
      const texto = gerarDocumento().replace("{{anticoncepcao}}", resolverAnticoncepcao());
      const out = $("#output");
      out.value = texto;
      $("#contador").textContent = texto.length + " caracteres";
      autoAltura();
    }, 120);
  }

  function copiar() {
    const out = $("#output");
    const txt = out.value;   /* textarea: lê o valor (inclui edições manuais) */
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
    outputSujo = false;   /* limpar destrava a re-geração automática */
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

  /* ---------- Cofre local (histórico 20 dias) ---------- */
  let vault = null;
  let outputSujo = false;   /* true se o usuário editou o documento à mão */

  function initVault() {
    if (typeof VAULT === "undefined") return;
    vault = VAULT.abrir(window.localStorage);
  }

  /* nome da paciente da seção ativa (para interconectar no histórico) */
  function nomePaciente() {
    return estado.nome || estado.paciente || "";
  }

  function salvarNoHistorico() {
    if (!vault) return;
    const texto = $("#output").value || "";
    if (!texto.trim()) { toast("Nada para salvar."); return; }
    const nome = nomePaciente().trim() || "(sem nome)";
    VAULT.gravar(vault, {
      paciente: nome,
      bloco: secaoAtiva ? secaoAtiva.titulo : "Documento",
      texto: texto,
      ts: Date.now()
    });
    VAULT.salvar(window.localStorage, vault);
    toast("✓ Salvo no histórico");
    renderHistorico();
  }

  /* ---------- Sync: exportar / importar (.json, offline) ---------- */
  function syncExportar() {
    if (!vault) return;
    const json = VAULT.exportar(vault);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    const d = new Date();
    const stamp = d.toISOString().slice(0, 10).replace(/-/g, "");
    a.href = URL.createObjectURL(blob);
    a.download = "isana-historico-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    toast("⟳ Histórico exportado (20 dias)");
  }

  function syncImportar(arquivo) {
    if (!vault || !arquivo) return;
    const reader = new FileReader();
    reader.onload = function () {
      vault = VAULT.importar(window.localStorage, String(reader.result || ""));
      renderHistorico();
      toast("✓ Histórico importado e podado (20 dias)");
    };
    reader.readAsText(arquivo);
  }

  /* ---------- Painel de histórico ---------- */
  function fmtData(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
      " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function renderHistorico() {
    const lista = $("#hist-lista");
    if (!lista) return;
    /* innerHTML só com string vazia pra limpar; itens entram via DOM (sem XSS). */
    lista.innerHTML = "";
    if (!vault || !vault.entradas.length) {
      lista.appendChild(el("p", "hist-vazio", "Nada ainda. Salve um documento e ele aparece aqui por 20 dias."));
      return;
    }
    const grupos = VAULT.porPaciente(vault.entradas);
    const nomes = Object.keys(grupos).sort(function (a, b) {
      return grupos[b][0].ts - grupos[a][0].ts;
    });
    nomes.forEach(function (chave) {
      const docs = grupos[chave];
      const nomeExib = docs[0].pacienteExib || "(sem nome)";
      const gWrap = el("div", "hist-grupo");
      gWrap.appendChild(el("div", "hist-paciente", "👤 " + nomeExib + " (" + docs.length + ")"));
      docs.forEach(function (doc) {
        const item = el("button", "hist-item");
        item.type = "button";
        const data = el("span", "hist-data", fmtData(doc.ts));
        const bloco = el("span", "hist-bloco", doc.bloco);
        item.appendChild(data); item.appendChild(bloco);
        item.addEventListener("click", function () { carregarDoHistorico(doc.id); });
        gWrap.appendChild(item);
      });
      lista.appendChild(gWrap);
    });
  }

  function carregarDoHistorico(id) {
    const doc = vault.entradas.find(function (e) { return e.id === id; });
    if (!doc) return;
    const out = $("#output");
    out.value = doc.texto;
    outputSujo = true;   /* não deixar a re-geração sobrescrever a revisão */
    $("#contador").textContent = doc.texto.length + " caracteres";
    autoAltura();
    fecharHistorico();
    toast("Documento carregado");
  }

  function abrirHistorico() {
    renderHistorico();
    $("#hist-panel").hidden = false;
    $("#hist-overlay").hidden = false;
  }
  function fecharHistorico() {
    $("#hist-panel").hidden = true;
    $("#hist-overlay").hidden = true;
  }

  /* ---------- toast simples ---------- */
  let toastTimer = null;
  function toast(msg) {
    let t = $("#toast");
    if (!t) {
      t = el("div", "", ""); t.id = "toast"; t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("visivel");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("visivel"); }, 1800);
  }

  /* ---------- Login (portão de cortesia, client-side) ----------
     Credenciais definidas pelo dono da ferramenta. Ofuscadas (não em texto
     puro) — mas client-side NÃO é cofre: quem abre o DevTools as encontra.
     Serve para "quem tem o link + a senha usa". */
  const _c = { u: "RHJhLiBJc2FuYQ==", p: "TWF0ZXJuaWRhZGUxMjM0" };  // base64
  /* Normaliza o login: ignora caixa, espaços e pontos — na correria da
     enfermaria ninguém decora "Dra. Isana" vs "dra isana" vs "Dra.Isana".
     A senha continua exata (case-sensitive). */
  function normLogin(s) {
    return String(s || "").toLowerCase().replace(/[.\s]/g, "");
  }
  function credOk(u, p) {
    try {
      const loginBase = atob(_c.u);
      return normLogin(u) === normLogin(loginBase) && btoa(p) === _c.p;
    } catch (e) { return false; }
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
  function sair() {
    /* limpa a sessão e volta pra tela de login (estado do formulário se mantém) */
    try { sessionStorage.removeItem("isana_auth"); } catch (e) {}
    const app = $("#app");
    const login = $("#login-screen");
    fecharHistorico();
    app.hidden = true;
    app.classList.remove("entrando");
    login.classList.remove("saindo");
    login.hidden = false;
    const lp = $("#login-pass");
    if (lp) lp.value = "";
    const lu = $("#login-user");
    if (lu) { lu.focus(); }
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
    $("#btn-sair").addEventListener("click", sair);

    /* cofre local + histórico + sync */
    initVault();
    $("#btn-salvar").addEventListener("click", salvarNoHistorico);
    $("#btn-hist").addEventListener("click", abrirHistorico);
    $("#btn-hist-fechar").addEventListener("click", fecharHistorico);
    $("#hist-overlay").addEventListener("click", fecharHistorico);
    $("#btn-sync-exp").addEventListener("click", syncExportar);
    $("#btn-sync-imp").addEventListener("click", function () { $("#imp-file").click(); });
    $("#imp-file").addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) syncImportar(e.target.files[0]);
      e.target.value = "";
    });

    /* documento editável: marcar como "sujo" ao digitar (pausa re-geração)
       e auto-ajustar a altura conforme digita */
    $("#output").addEventListener("input", function () {
      outputSujo = true;
      $("#contador").textContent = this.value.length + " caracteres";
      autoAltura();
    });

    /* olhinho da senha: alterna entre ••••• e texto legível */
    const olho = $("#btn-olho");
    const campoSenha = $("#login-pass");
    if (olho && campoSenha) {
      olho.addEventListener("click", function () {
        const mostrar = campoSenha.type === "password";
        campoSenha.type = mostrar ? "text" : "password";
        olho.setAttribute("aria-pressed", String(mostrar));
        olho.classList.toggle("ativo", mostrar);
        olho.textContent = mostrar ? "🙈" : "👁";
        campoSenha.focus();
      });
    }

    /* Login primeiro; a calculadora só monta após o acesso. */
    initLogin();

    /* PWA */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  });
})();
