/* ============================================================================
   schema.js — Definição do questionário que ALIMENTA os templates.
   Dirige tudo: ordem das seções (obstetrícia no topo), campos, tipos de
   controle, opções com frequência (para cor e gaveta) e defaults verbatim.

   Cada campo:
   {
     id:      string  — casa com o {{placeholder}} do template
     label:   string  — rótulo na tela
     tipo:    "texto" | "textarea" | "numero" | "data" | "single" | "multi"
     opcoes:  [{ v: valor, f: "alta"|"media"|"baixa" }]   (single/multi)
     gaveta:  bool    — true = vira <details> colapsável (muitas alternativas)
     def:     string  — default verbatim (pré-marcado; economiza tempo)
   }
   Regra de gaveta: single/multi com > 4 opções vira gaveta automaticamente.
   ========================================================================== */

/* Defaults fisiológicos reutilizáveis (o que economiza tempo na correria). */
const DEF = {
  exameGeral: "Bom estado geral, corada, anictérica, acianótica, afebril ao toque, lúcida e orientada no tempo e no espaço, eupneica",
  evoPuerperio: "Avalio paciente em leito de enfermaria, refere ter passado bem o período. Nega dor abdominal, náuseas e vômito. Deambulando a beira leito. Dieta oral com boa aceitação. Diurese preservada, eliminando flatos, ainda não evacuou após o parto. NEGA SINAIS DE IMINÊNCIA DE ECLAMPSIA.",
  evoGenerico: "Avalio paciente em leito de enfermaria, refere ter passado bem o período. Nega queixas durante a visita. Deambulando a beira leito. Dieta oral com boa aceitação. Diurese preservada, eliminando flatos, ainda não evacuou.",
  abdome: "Flácido, RHA+, normotimpânico, indolor a palpação",
  mmii: "Ausência de edemas, panturrilhas livres",
  mamas: "Flácidas, secretivas, sem sinais de mastite, mamilos sem fissuras",
  utero: "Contraído, em involução",
  feridaCir: "com curativo oclusivo",
  loquios: "Fisiológicos",
  negaAlergia: "nega",
  negaVicios: "nega"
};

/* Opções reutilizáveis com frequência (f: alta salta em coral; baixa atenua). */
const OPT = {
  simNao: [
    { v: "Não", f: "alta" },
    { v: "Sim", f: "media" }
  ],
  tipagem: [
    { v: "O Rh+", f: "alta" },
    { v: "A Rh+", f: "alta" },
    { v: "O Rh−", f: "media" },
    { v: "B Rh+", f: "media" },
    { v: "A Rh−", f: "baixa" },
    { v: "B Rh+", f: "baixa" },
    { v: "AB Rh+", f: "baixa" },
    { v: "AB Rh−", f: "baixa" }
  ],
  resultadoExame: [
    { v: "não reagente", f: "alta" },
    { v: "reagente", f: "media" },
    { v: "pendente", f: "media" }
  ],
  viaParto: [
    { v: "Parto normal", f: "alta" },
    { v: "Cesariana", f: "alta" },
    { v: "Fórceps", f: "baixa" }
  ]
};

/* --------------------------------------------------------------------------
   SEÇÕES — ordem de uso na enfermaria. Obstetrícia sempre no topo.
   Cada seção referencia um template (chave `tpl`) e lista os campos.
   -------------------------------------------------------------------------- */
const SECTIONS = [
  /* === 1. EVOLUÇÃO PUERPÉRIO (a mais usada) ============================ */
  {
    id: "evolucao-puerperio",
    titulo: "Evolução — Puerpério / Pós-parto",
    tpl: "evolucaoPuerperio",
    campos: [
      { id: "nome", label: "Nome", tipo: "texto" },
      { id: "acompanhante", label: "Acompanhada por", tipo: "texto", def: "acompanhante" },
      { id: "gpa", label: "GPA", tipo: "texto", def: "G_P_A_" },
      { id: "parto", label: "Parto", tipo: "single", opcoes: OPT.viaParto, def: "Cesariana" },
      { id: "ig_parto", label: "IG do dia do parto", tipo: "texto", def: "__ sem __ dias" },
      { id: "comorbidades", label: "Comorbidades", tipo: "texto", def: "nega" },
      { id: "alergias", label: "Alergias", tipo: "texto", def: DEF.negaAlergia },
      { id: "vicios", label: "Vícios", tipo: "texto", def: DEF.negaVicios },
      { id: "ata_laqueadura", label: "Possui ATA de laqueadura?", tipo: "single", opcoes: OPT.simNao, def: "Não" },
      { id: "tipagem", label: "Tipagem sanguínea", tipo: "single", opcoes: OPT.tipagem, gaveta: true, def: "O Rh+" },
      { id: "hiv", label: "HIV", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "teste_sifilis", label: "Teste rápido de Sífilis", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "vdrl", label: "VDRL", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "nota_parto", label: "Nota de parto", tipo: "textarea", def: "" },
      { id: "evo_texto", label: "Evolução (texto)", tipo: "textarea", def: DEF.evoPuerperio },
      { id: "exame_geral", label: "Exame físico — geral", tipo: "textarea", def: DEF.exameGeral },
      { id: "pa", label: "PA", tipo: "texto", def: "120 x 80 mmHg" },
      { id: "mamas", label: "Mamas", tipo: "textarea", def: DEF.mamas },
      { id: "abdome", label: "Abdome", tipo: "textarea", def: DEF.abdome },
      { id: "utero", label: "Útero", tipo: "texto", def: DEF.utero },
      { id: "ferida", label: "Ferida operatória", tipo: "texto", def: DEF.feridaCir },
      { id: "loquios", label: "Lóquios", tipo: "texto", def: DEF.loquios },
      { id: "mmii", label: "Membros inferiores", tipo: "texto", def: DEF.mmii },
      { id: "hipotese", label: "Hipótese Diagnóstica", tipo: "texto", def: "Puerpério fisiológico" },
      { id: "conduta", label: "Conduta", tipo: "textarea", def: "Orientações gerais\nOriento deambulação\nPrescrição" },
      { id: "alta", label: "Se alta", tipo: "textarea", def: "Alta médica a depender de RN, com relatório médico, licença maternidade e receituário.\nOrientações gerais, seguimento ambulatorial ou retorno se necessário." }
    ]
  },

  /* === 2. EVOLUÇÃO PÓS-CURETAGEM ====================================== */
  {
    id: "evolucao-curetagem",
    titulo: "Evolução — Pós-Curetagem",
    tpl: "evolucaoCuretagem",
    campos: [
      { id: "gpa", label: "GPA", tipo: "texto", def: "G_ P_ A_" },
      { id: "ig", label: "IG", tipo: "texto", def: "__ semanas" },
      { id: "comorbidades", label: "Comorbidades", tipo: "texto", def: "nega" },
      { id: "muc", label: "MUC", tipo: "texto", def: "" },
      { id: "alergias", label: "Alergias", tipo: "texto", def: DEF.negaAlergia },
      { id: "vicios", label: "Vícios", tipo: "texto", def: DEF.negaVicios },
      { id: "tipagem", label: "Tipagem sanguínea", tipo: "single", opcoes: OPT.tipagem, gaveta: true, def: "O Rh+" },
      { id: "hiv", label: "HIV", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "teste_sifilis", label: "Teste rápido de Sífilis", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "vdrl", label: "VDRL", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "nota_procedimento", label: "Nota de procedimento", tipo: "textarea", def: "" },
      { id: "evo_texto", label: "Evolução (texto)", tipo: "textarea", def: DEF.evoGenerico },
      { id: "exame_geral", label: "Exame físico — geral", tipo: "textarea", def: DEF.exameGeral },
      { id: "pa", label: "PA", tipo: "texto", def: "120 x 80 mmHg" },
      { id: "abdome", label: "Abdome", tipo: "textarea", def: DEF.abdome },
      { id: "sangramento", label: "Sangramento vaginal", tipo: "texto", def: "Sangramento vaginal escasso" },
      { id: "mmii", label: "Membros inferiores", tipo: "texto", def: DEF.mmii },
      { id: "hipotese", label: "Hipótese Diagnóstica", tipo: "texto", def: "Aborto" },
      { id: "conduta", label: "Conduta", tipo: "textarea", def: "Alta médica com prescrição, orientações, seguimento ambulatorial ou retorno se necessário\nForneço atestado médico de 14 dias.\nOriento resgatar resultado de anatomopatológico em 40 dias." }
    ]
  },

  /* === 3. EVOLUÇÃO LAPAROTOMIA ======================================== */
  {
    id: "evolucao-laparotomia",
    titulo: "Evolução — Laparotomia",
    tpl: "evolucaoLaparotomia",
    campos: [
      { id: "nome", label: "Nome", tipo: "texto" },
      { id: "acompanhante", label: "Acompanhada por", tipo: "texto", def: "acompanhante" },
      { id: "gpa", label: "GPA", tipo: "texto", def: "G_ P_ A_" },
      { id: "ig", label: "IG", tipo: "texto", def: "__ semanas" },
      { id: "comorbidades", label: "Comorbidades", tipo: "texto", def: "nega" },
      { id: "medicacoes", label: "Medicações em uso", tipo: "texto", def: "" },
      { id: "alergias", label: "Alergias", tipo: "texto", def: DEF.negaAlergia },
      { id: "vicios", label: "Vícios", tipo: "texto", def: DEF.negaVicios },
      { id: "tipagem", label: "Tipagem sanguínea", tipo: "single", opcoes: OPT.tipagem, gaveta: true, def: "O Rh+" },
      { id: "hiv", label: "HIV", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "teste_sifilis", label: "Teste rápido de Sífilis", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "vdrl", label: "VDRL", tipo: "single", opcoes: OPT.resultadoExame, def: "não reagente" },
      { id: "nota_procedimento", label: "Nota de procedimento", tipo: "textarea", def: "" },
      { id: "evo_texto", label: "Evolução (texto)", tipo: "textarea", def: DEF.evoGenerico },
      { id: "exame_geral", label: "Exame físico — geral", tipo: "textarea", def: DEF.exameGeral },
      { id: "pa", label: "PA", tipo: "texto", def: "120 x 80 mmHg" },
      { id: "abdome", label: "Abdome", tipo: "textarea", def: DEF.abdome },
      { id: "ferida", label: "Ferida operatória", tipo: "texto", def: "limpa e seca, sem sinais flogísticos" },
      { id: "sangramento", label: "Sangramento vaginal", tipo: "texto", def: "escasso / ausente" },
      { id: "mmii", label: "Membros inferiores", tipo: "texto", def: DEF.mmii },
      { id: "hipotese", label: "Hipótese Diagnóstica", tipo: "texto", def: "Pós laparotomia" },
      { id: "conduta", label: "Conduta", tipo: "textarea", def: "Alta médica com prescrição, orientações, seguimento ambulatorial ou retorno se necessário\nForneço atestado médico de 30 dias.\nOriento resgatar resultado de anatomopatológico em 40 dias." }
    ]
  },

  /* === 4. PRIMEIRA CONSULTA (a anamnese completa) ===================== */
  {
    id: "primeira-consulta",
    titulo: "1ª Consulta — Anamnese completa",
    tpl: "primeiraConsulta",
    campos: [
      { id: "queixa_duracao", label: "Queixa e duração", tipo: "texto" },
      { id: "nome", label: "Nome", tipo: "texto" },
      { id: "feto", label: "FETO", tipo: "texto" },
      { id: "idade", label: "Idade", tipo: "numero" },
      { id: "estado_civil", label: "Estado civil", tipo: "single", gaveta: true, opcoes: [
        { v: "união estável", f: "alta" }, { v: "casada", f: "alta" },
        { v: "solteira", f: "media" }, { v: "divorciada", f: "baixa" }, { v: "viúva", f: "baixa" }
      ]},
      { id: "nome_parceiro", label: "Nome do parceiro", tipo: "texto" },
      { id: "gpa", label: "GPA", tipo: "texto", def: "G_ P_ A_" },
      { id: "dum", label: "DUM", tipo: "data" },
      { id: "ig_dum", label: "IG DUM", tipo: "texto", def: "__ sem __ dias" },
      { id: "ig_usg_param", label: "IG USG (parâmetro)", tipo: "texto" },
      { id: "ig_usg", label: "IG USG — semanas", tipo: "numero" },
      { id: "ig_usg_dias", label: "IG USG — dias", tipo: "numero" },
      { id: "dpp", label: "DPP", tipo: "data" },
      { id: "tipo_sg", label: "Tipo sanguíneo", tipo: "single", opcoes: OPT.tipagem, gaveta: true, def: "O Rh+" },
      { id: "toxoplasmose", label: "Toxoplasmose", tipo: "single", opcoes: [
        { v: "IgG reagente / IgM não reagente", f: "alta" }, { v: "não reagente", f: "media" }, { v: "pendente", f: "baixa" }
      ], def: "IgG reagente / IgM não reagente" },
      { id: "metodo_previo", label: "Método de anticoncepção antes de engravidar", tipo: "texto", def: "nega" },
      { id: "vac_dtpa", label: "Vacina dTPa", tipo: "single", opcoes: OPT.simNao, def: "Sim" },
      { id: "vac_hepb1", label: "Hep B — 1ª dose", tipo: "single", opcoes: OPT.simNao, def: "Sim" },
      { id: "vac_hepb2", label: "Hep B — 2ª dose", tipo: "single", opcoes: OPT.simNao, def: "Sim" },
      { id: "vac_hepb3", label: "Hep B — 3ª dose", tipo: "single", opcoes: OPT.simNao, def: "Não" },
      { id: "anti_hbs", label: "Anti HBs", tipo: "texto" },
      { id: "vac_influenza", label: "Influenza", tipo: "single", opcoes: OPT.simNao, def: "Sim" },
      { id: "vac_covid", label: "COVID", tipo: "single", opcoes: OPT.simNao, def: "Sim" },
      { id: "comorbidades", label: "Comorbidade", tipo: "texto", def: "nega" },
      { id: "alergias", label: "Alergia", tipo: "texto", def: DEF.negaAlergia },
      { id: "medicacoes", label: "Medicação em uso", tipo: "texto", def: "nega" },
      { id: "queixa_principal", label: "Queixa principal", tipo: "texto" },
      { id: "hda", label: "HDA", tipo: "textarea" },
      { id: "queixas_urinarias", label: "Queixas urinárias", tipo: "texto", def: "nega" },
      { id: "itu_previa", label: "ITU prévia", tipo: "single", opcoes: OPT.simNao, def: "Não" },
      { id: "queixas_intestinais", label: "Queixas intestinais", tipo: "texto", def: "bom funcionamento" },
      { id: "queixas_mamarias", label: "Queixas mamárias", tipo: "texto", def: "nega mastalgia" },
      { id: "alimentacao", label: "Alimentação", tipo: "texto" },
      { id: "ingesta_hidrica", label: "Ingesta hídrica", tipo: "texto" },
      { id: "sangramento_vaginal", label: "Sangramento vaginal", tipo: "texto", def: "nega" },
      { id: "leucorreia", label: "Leucorreia", tipo: "texto", def: "nega" },
      { id: "ant_pessoais", label: "Antecedentes pessoais", tipo: "textarea", def: "nega infecção urinária, infertilidade, cardiopatia, diabetes, hipertensão arterial, mal formação" },
      { id: "menarca", label: "Menarca (anos)", tipo: "numero" },
      { id: "ist", label: "Infecção sexualmente transmissível", tipo: "texto", def: "nega" },
      { id: "colpo_anos", label: "Último colpocitológico (há quantos anos)", tipo: "numero" },
      { id: "ant_obstetricos", label: "Antecedentes obstétricos", tipo: "textarea", def: "" },
      { id: "ant_cirurgicos", label: "Antecedentes cirúrgicos", tipo: "texto", def: "nega cirurgia pélvica uterina" },
      { id: "ant_familiares", label: "Antecedentes familiares", tipo: "textarea", def: "Nega DM, HAS, trombose, gemelaridade, mal formação, Ca de mama, ovário e intestino." },
      { id: "tabagismo", label: "Tabagismo", tipo: "texto", def: "nega" },
      { id: "etilismo", label: "Etilismo", tipo: "texto", def: "nega" },
      { id: "atividade_fisica", label: "Atividade física", tipo: "texto", def: "nega" },
      { id: "medicacoes_uso", label: "Medicações em uso", tipo: "texto", def: "nega" },
      { id: "peso_antes", label: "Peso antes de engravidar", tipo: "numero" },
      { id: "peso_atual", label: "Peso atual", tipo: "numero" },
      { id: "ganho_total", label: "Ganho total", tipo: "numero" },
      { id: "altura", label: "Altura", tipo: "numero" },
      { id: "imc", label: "IMC", tipo: "texto" },
      { id: "pa", label: "PA", tipo: "texto", def: "120 x 80 mmHg" },
      { id: "ap_cardiovascular", label: "Aparelho cardiovascular", tipo: "texto", def: "bulhas normorritmicas, normofonéticas, 2 tempos, sem sopro" },
      { id: "abdominal", label: "Abdominal", tipo: "texto" },
      { id: "mamas_consulta", label: "Mamas", tipo: "texto" },
      { id: "altura_fu", label: "Altura de fundo uterino", tipo: "texto" },
      { id: "bcf", label: "Batimento cardíaco fetal", tipo: "texto" },
      { id: "tonus", label: "Tônus uterino", tipo: "texto", def: "normal" },
      { id: "dinamica", label: "Dinâmica uterina", tipo: "texto", def: "ausente" },
      { id: "movimentos_fetais", label: "Movimentos Fetais", tipo: "texto", def: "presentes" },
      { id: "toque_vaginal", label: "Toque vaginal", tipo: "texto", def: "evitado" },
      { id: "exames_previos", label: "Exames prévios", tipo: "textarea" },
      { id: "hipotese", label: "Hipótese diagnóstica", tipo: "texto" },
      { id: "conduta_consulta", label: "Conduta", tipo: "textarea" },
      { id: "conduta_exames", label: "Conduta — Exames", tipo: "textarea", def: "Exames: Solicito Hemograma, Tipagem sanguínea e Rh, TSH e T4 livre, Glicemia de jejum, ANTI HBS, EAS COM UROCULTURA, vitamina D, LIPIDOGRAMA\n- TESTE DA MAMÃE 1.\n- Ecografia endovaginal (11-13 sem e 6 dias) — AVALIAR comprimento do COLO UTERINO, osso nasal, ducto venoso e TN (até 13 semanas e 6 dias)" },
      { id: "conduta_medicacao", label: "Conduta — Medicação", tipo: "textarea", def: "Medicação: Ácido fólico 400 mcg (01 comprimido às 08:00) até 12 semanas de gestação, Lavitan Pré Natal (01 comprimido às 08:00 a partir de 12 semanas), vit D 2000ui (01 comprimido às 08:00), sulfato ferroso 40 mg (01 comprimido às 10:00 acompanhado de fruta cítrica) após 20 semanas; cálcio 500mg pela manhã; buscoduo (de 8/8 horas, se dor tipo cólica), meclin 25 mg (01 comprimido de 8/8 horas, se náuseas)" },
      { id: "conduta_outras", label: "Conduta — Outras", tipo: "textarea", def: "Outras condutas: trazer cartão de vacinas e último COP\noriento dieta, atividade física, uso de repelente, protetor solar e cuidados de higiene pessoal" }
    ]
  },

  /* === 5. PRESCRIÇÕES / ORIENTAÇÕES DE ALTA =========================== */
  {
    id: "alta-prescricao",
    titulo: "Alta — Prescrição e Orientações",
    tpl: "__composto__",   /* montado por app.js conforme a via escolhida */
    campos: [
      { id: "via_alta", label: "Documento de alta", tipo: "single", gaveta: true, def: "Cesariana", opcoes: [
        { v: "Cesariana", f: "alta" },
        { v: "Parto Normal", f: "alta" },
        { v: "Laparotomia", f: "media" },
        { v: "Curetagem", f: "media" },
        { v: "Sd. Hipertensiva", f: "baixa" }
      ]},
      { id: "anticoncepcao", label: "Anticoncepção", tipo: "single", def: "oral", opcoes: [
        { v: "oral", f: "alta" }, { v: "injetavel", f: "media" }, { v: "nenhuma", f: "baixa" }
      ]}
    ]
  },

  /* === 6. ATESTADOS / RELATÓRIOS ====================================== */
  {
    id: "atestados",
    titulo: "Atestados / Relatórios",
    tpl: "__atestados__",
    campos: [
      { id: "doc_tipo", label: "Documento", tipo: "single", gaveta: true, def: "Licença Maternidade", opcoes: [
        { v: "Licença Maternidade", f: "alta" },
        { v: "Atestado Curetagem", f: "media" },
        { v: "Relatório DMG", f: "media" }
      ]},
      { id: "data_inicio", label: "A partir do dia", tipo: "data" },
      { id: "nome", label: "Nome (relatório DMG)", tipo: "texto" },
      { id: "ig_semanas", label: "IG — semanas (DMG)", tipo: "numero" },
      { id: "ig_dias", label: "IG — dias (DMG)", tipo: "numero" }
    ]
  }
];

/* Exporta para uso em app.js (e para testes em node). */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SECTIONS, DEF, OPT };
}
