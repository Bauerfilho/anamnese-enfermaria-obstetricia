/* ============================================================================
   templates.js — Modelos VERBATIM do template da preceptora (isana).
   REGRA SUPREMA: texto clínico é CONTRATO. A ordem e os campos seguem o
   template original, sem resumir / reordenar / embelezar.
   Placeholders usam a sintaxe {{campo}} e são preenchidos por app.js.
   Cada linha de um array vira uma linha do documento final.
   ========================================================================== */

const TEMPLATES = {

  /* ------------------------------------------------------------------------
     BLOCO 1 — EVOLUÇÃO MÉDICA ENFERMARIA (pós-parto / puerpério)
     Fonte: isana-template.txt, linhas 16–63. Ordem preservada.
     ------------------------------------------------------------------------ */
  evolucaoPuerperio: [
    "#EVOLUÇÃO MÉDICA ENFERMARIA#",
    "",
    "Nome: {{nome}}",
    "Acompanhada por: {{acompanhante}}",
    "GPA: {{gpa}}",
    "Parto: {{parto}}",
    "IG do dia do parto: {{ig_parto}}",
    "",
    "Comorbidades: {{comorbidades}}",
    "Alergias: {{alergias}}",
    "Vícios: {{vicios}}",
    "Possui ATA de laqueadura? {{ata_laqueadura}}",
    "",
    "Exames da internação",
    "Tipagem sanguinea: {{tipagem}}",
    "HIV: {{hiv}}",
    "Teste rápido de Sífilis: {{teste_sifilis}}",
    "VDRL: {{vdrl}}",
    "",
    "################### Nota de parto ####################",
    "{{nota_parto}}",
    "",
    "* Evolução:",
    "{{evo_texto}}",
    "",
    "Exame físico:",
    "{{exame_geral}}",
    "PA: {{pa}}",
    "• Mamas: {{mamas}}",
    "• Abdome: {{abdome}}",
    "• Útero: {{utero}}",
    "• Ferida operatória: {{ferida}}",
    "• Lóquios: {{loquios}}",
    "• Membros inferiores: {{mmii}}",
    "",
    "Hipótese Diagnóstica:",
    "• {{hipotese}}",
    "",
    "CONDUTA",
    "{{conduta}}",
    "",
    "{{alta}}"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 2 — EVOLUÇÃO MÉDICA PÓS CURETAGEM
     Fonte: linhas 66–86.
     ------------------------------------------------------------------------ */
  evolucaoCuretagem: [
    "EVOLUÇÃO MÉDICA PÓS CURETAGEM",
    "",
    "GPA: {{gpa}}   IG: {{ig}}   CURETAGEM",
    "Comorbidades: {{comorbidades}}   MUC: {{muc}}   Alergias: {{alergias}}   Vícios: {{vicios}}",
    "Exames da internação — Tipagem sanguinea: {{tipagem}}   HIV: {{hiv}}   Teste rápido de Sífilis: {{teste_sifilis}}   VDRL: {{vdrl}}",
    "",
    "################## Nota de procedimento ####################",
    "{{nota_procedimento}}",
    "",
    "* Evolução:",
    "{{evo_texto}}",
    "",
    "Exame físico:",
    "{{exame_geral}}",
    "PA: {{pa}}",
    "• Abdome: {{abdome}}",
    "• {{sangramento}}",
    "• Membros inferiores: {{mmii}}",
    "",
    "Hipótese Diagnóstica:",
    "• {{hipotese}}",
    "",
    "CONDUTA",
    "{{conduta}}"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 3 — EVOLUÇÃO MÉDICA LAPAROTOMIA
     Fonte: linhas 87–126.
     ------------------------------------------------------------------------ */
  evolucaoLaparotomia: [
    "EVOLUÇÃO MÉDICA LAPAROTOMIA",
    "",
    "Nome: {{nome}}",
    "Acompanhada por: {{acompanhante}}",
    "GPA: {{gpa}}",
    "IG: {{ig}}",
    "LAPAROTOMIA",
    "",
    "Comorbidades: {{comorbidades}}",
    "Medicações em uso: {{medicacoes}}",
    "Alergias: {{alergias}}",
    "Vícios: {{vicios}}",
    "",
    "Exames da internação",
    "Tipagem sanguinea: {{tipagem}}",
    "HIV: {{hiv}}",
    "Teste rápido de Sífilis: {{teste_sifilis}}",
    "VDRL: {{vdrl}}",
    "",
    "################## Nota de procedimento ####################",
    "{{nota_procedimento}}",
    "",
    "* Evolução:",
    "{{evo_texto}}",
    "",
    "Exame físico:",
    "{{exame_geral}}",
    "PA: {{pa}}",
    "Abdome: {{abdome}}",
    "Ferida operatória: {{ferida}}",
    "Sangramento vaginal: {{sangramento}}",
    "Membros inferiores: {{mmii}}",
    "",
    "Hipótese Diagnóstica:",
    "• {{hipotese}}",
    "",
    "CONDUTA",
    "{{conduta}}"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 4 — LICENÇA MATERNIDADE (atestado)
     Fonte: linhas 130–134.
     ------------------------------------------------------------------------ */
  licencaMaternidade: [
    "#LICENÇA MATERNIDADE#",
    "",
    "Atesto, para os devidos fins, que a paciente esteve internada nesta instituição (Hospital Estadual Maternidade Nossa Senhora de Lourdes), necessitando de afastamento das suas atividades laborais por 120 (cento e vinte) dias, para fins de licença maternidade, a partir do dia {{data_inicio}}.",
    "",
    "CID: LICENÇA MATERNIDADE"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 5 — PRESCRIÇÃO Sd. HIPERTENSIVAS NA GESTAÇÃO
     Fonte: linhas 138–145. Doses verbatim.
     ------------------------------------------------------------------------ */
  prescricaoSdHipertensiva: [
    "#Sd. HIPERTENSIVAS NA GESTAÇÃO#",
    "USO ORAL:",
    "Anti hipertensivo",
    "1) Nifedipino ---------------- 20mg ---------------- contínuo, até o dia do retorno no médico",
    "Tomar 01 comprimido de 12/12 horas.",
    "",
    "Anotar a pressão todos os dias e levar no médico onde realizou pré-natal, 10 dias após alta.",
    "Retornar na Maternidade mais próxima de casa se PRESSÃO > 160/110, dor de cabeça intensa, \"visão embaralhada\"."
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 6 — PRESCRIÇÃO ALTA CESARIANA (+ anticoncepção)
     Fonte: linhas 149–181. Doses verbatim.
     ------------------------------------------------------------------------ */
  prescricaoCesariana: [
    "#PRESCRIÇÃO ALTA CESARIANA#",
    "",
    "USO ORAL:",
    "1) SULFATO FERROSO 60 MG ---------------- contínuo",
    "TOMAR 01 COMPRIMIDO ANTES DO ALMOÇO E JANTAR POR 60 DIAS.",
    "",
    "2) DIPIRONA 500MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 6/6 HORAS SE DOR.",
    "",
    "3) SIMETICONA 40MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 8/8 HORAS, SE GASES.",
    "",
    "4) IBUPROFENO 600MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 12/12 HORAS, POR 3 DIAS.",
    "",
    "USO TÓPICO",
    "1) MILLAR ou LANOSINOH ou MAMYLAN --- 1 TUBO (OPCIONAL)",
    "APLICAR NOS MAMILOS, APÓS AMAMENTAR, EM CASO DE FISSURAS OU FERIDAS. NÃO É NECESSÁRIO LAVAR ANTES DE AMAMENTAR.",
    "",
    "#ANTICONCEPÇÃO#",
    "ANTICONCEPCIONAL — É prescrito 2 opções; caso desejar usar, a puérpera usa injetável (intramuscular) OU faz uso da medicação oral. NUNCA fazer uso dos dois.",
    "{{anticoncepcao}}"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 7 — ORIENTAÇÕES ALTA — PARTO CESÁREA
     Fonte: linhas 184–197. Verbatim.
     ------------------------------------------------------------------------ */
  orientacoesCesariana: [
    "#ORIENTAÇÕES DE ALTA HOSPITALAR — PARTO CESÁREA#",
    "",
    "- RETIRAR OS PONTOS A PARTIR DE 10 DIAS PÓS PARTO NO POSTO DE SAÚDE",
    "- NÃO PASSAR POMADAS OU ÁLCOOL NA CICATRIZ, EXCETO SE TIVER RECOMENDAÇÃO MÉDICA.",
    "- LAVAR O LOCAL DO CORTE, DURANTE O BANHO, 2 VEZES POR DIA, COM ÁGUA E SABONETE COMUM E MANTER SEMPRE BEM SECO.",
    "- O USO DE CINTA NÃO É RECOMENDADO E NÃO TRAZ BENEFÍCIOS NO PÓS-PARTO. SE DESEJAR, USE CALCINHAS COM CÓS ALTO, CONFORTÁVEIS E QUE NÃO DEVEM TRAZER DOR OU DESCONFORTO DURANTE O USO.",
    "- NOS PRIMEIROS 15 DIAS, EVITE PEGAR PESO, FAZER ATIVIDADES PESADAS, AGACHAR E LEVANTAR COM FREQUÊNCIA.",
    "- PROCURE CAMINHAR, ISSO DIMINUI O INCHAÇO E OS GASES. NÃO FIQUE O TEMPO TODO DEITADA.",
    "- RELAÇÕES SEXUAIS SÃO LIBERADAS APÓS 40 DIAS DO PARTO.",
    "- ATIVIDADES FÍSICAS LEVES, COMO CAMINHADAS, PODEM SER REINICIADAS COM 30 DIAS. ACADEMIA E OUTRAS ATIVIDADES MAIS INTENSAS SÓ PODEM SER REINICIADAS APÓS 60 DIAS.",
    "- MANTENHA UMA ALIMENTAÇÃO SAUDÁVEL, EVITE FRITURAS, GORDURAS E EXCESSO DE SAL E AÇÚCAR. AS RECOMENDAÇÕES DE ALIMENTAÇÃO SÃO AS MESMAS DO PERÍODO DA GESTAÇÃO.",
    "- TOME MUITA ÁGUA, CERCA DE 3 LITROS POR DIA.",
    "- SE FEBRE, SANGRAMENTO VAGINAL VOLUMOSO OU FÉTIDO, DOR ABDOMINAL INTENSA OU ALTERAÇÕES NA FERIDA OPERATÓRIA, PROCURAR ATENDIMENTO MÉDICO.",
    "- CONSULTA DE PUERPÉRIO EM UNIDADE BÁSICA DE SAÚDE COM 10 DIAS"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 8 — PRESCRIÇÃO ALTA — PARTO NORMAL (+ anticoncepção)
     Fonte: linhas 201–232. Doses verbatim.
     ------------------------------------------------------------------------ */
  prescricaoPartoNormal: [
    "#PRESCRIÇÃO ALTA — PARTO NORMAL#",
    "",
    "USO ORAL:",
    "1) SULFATO FERROSO 60MG ---------------- 60 COMPRIMIDOS",
    "TOMAR 01 COMPRIMIDO ANTES DO ALMOÇO POR 60 DIAS.",
    "",
    "2) DIPIRONA 500MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 6/6 HORAS SE DOR.",
    "",
    "3) IBUPROFENO 600MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 12/12 HORAS, POR 03 DIAS, SE DOR MAIS INTENSA",
    "",
    "USO TÓPICO nas mamas",
    "1) MILLAR ou LANOSINOH ou MAMYLAN --- 1 TUBO (OPCIONAL)",
    "APLICAR NOS MAMILOS, APÓS AMAMENTAR, EM CASO DE FISSURAS OU FERIDAS. NÃO É NECESSÁRIO LAVAR ANTES DE AMAMENTAR.",
    "",
    "USO TÓPICO na vulva",
    "1) ANDOLBA SPRAY --- 1 FRASCO (OPCIONAL)",
    "APLICAR NA VULVA E PERÍNEO 2 VEZES AO DIA APÓS O BANHO, SE DOR OU INCHAÇO.",
    "",
    "ANTICONCEPCIONAL — (caso deseje usar, escolher UMA opção, NUNCA fazer uso dos dois)",
    "{{anticoncepcao}}"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 9 — ORIENTAÇÕES ALTA — PARTO NORMAL
     Fonte: linhas 234–247. Verbatim.
     ------------------------------------------------------------------------ */
  orientacoesPartoNormal: [
    "#ORIENTAÇÕES DE ALTA HOSPITALAR — PARTO NORMAL#",
    "",
    "- PARTO NORMAL: PONTOS TENDEM A SE SOLTAREM SOZINHOS (se houver) ENTRE 7 A 14 DIAS",
    "- O SANGRAMENTO PODE DURAR ATÉ CERCA 45 DIAS.",
    "- O USO DE CINTA NÃO É RECOMENDADO E NÃO TRAZ BENEFÍCIOS NO PÓS-PARTO. SE DESEJAR, USE CALCINHAS COM CÓS ALTO, CONFORTÁVEIS E QUE NÃO DEVEM TRAZER DOR OU DESCONFORTO DURANTE O USO.",
    "- NOS PRIMEIROS 15 DIAS, EVITE PEGAR PESO, FAZER ATIVIDADES PESADAS, AGACHAR E LEVANTAR COM FREQUÊNCIA.",
    "- PROCURE CAMINHAR, ISSO DIMINUI O INCHAÇO E OS GASES. NÃO FIQUE O TEMPO TODO DEITADA.",
    "- RELAÇÕES SEXUAIS SÃO LIBERADAS APÓS 40 DIAS DO PARTO.",
    "- ATIVIDADES FÍSICAS LEVES, COMO CAMINHADAS, PODEM SER REINICIADAS COM 30 DIAS. ACADEMIA E OUTRAS ATIVIDADES MAIS INTENSAS SÓ PODEM SER REINICIADAS APÓS 60 DIAS.",
    "- MANTENHA UMA ALIMENTAÇÃO SAUDÁVEL, EVITE FRITURAS, GORDURAS E EXCESSO DE SAL E AÇÚCAR. AS RECOMENDAÇÕES DE ALIMENTAÇÃO SÃO AS MESMAS DO PERÍODO DA GESTAÇÃO.",
    "- TOME MUITA ÁGUA, CERCA DE 3 LITROS POR DIA.",
    "- SE FEBRE, SANGRAMENTO VAGINAL VOLUMOSO OU FÉTIDO, DOR ABDOMINAL INTENSA, PROCURAR ATENDIMENTO MÉDICO",
    "- CONSULTA DE PUERPÉRIO EM UNIDADE BÁSICA DE SAÚDE COM 10 DIAS"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 10 — RECEITA ALTA LAPAROTOMIA + ORIENTAÇÕES
     Fonte: linhas 251–280. Doses verbatim.
     ------------------------------------------------------------------------ */
  prescricaoLaparotomia: [
    "#RECEITA DE ALTA — LAPAROTOMIA#",
    "",
    "USO ORAL:",
    "1) SULFATO FERROSO 60MG ---------------- contínuo",
    "TOMAR 01 COMPRIMIDO ANTES DO ALMOÇO E JANTAR POR 60 DIAS.",
    "",
    "2) DIPIRONA 500MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 6/6 HORAS SE DOR.",
    "",
    "3) SIMETICONA 40MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 8/8 HORAS, SE GASES.",
    "",
    "4) IBUPROFENO 600MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 12/12 HORAS, POR 3 DIAS."
  ].join("\n"),

  orientacoesLaparotomia: [
    "#ORIENTAÇÕES DE ALTA HOSPITALAR — LAPAROTOMIA#",
    "",
    "- LAVAR O LOCAL DO CORTE, DURANTE O BANHO, 2 VEZES POR DIA, COM ÁGUA E SABONETE COMUM E MANTER SEMPRE BEM SECO. NÃO UTILIZAR CREMES, POMADAS OU ÁLCOOL NA CICATRIZ, EXCETO SE TIVER RECOMENDAÇÃO MÉDICA.",
    "- RETIRAR OS PONTOS A PARTIR DE 10 DIAS PÓS CIRURGIA NO POSTO DE SAÚDE",
    "- O USO DE CINTA NÃO É RECOMENDADO E NÃO TRAZ BENEFÍCIOS NO PÓS-OPERATÓRIO. SE DESEJAR, USE CALCINHAS COM CÓS ALTO, CONFORTÁVEIS E QUE NÃO DEVEM TRAZER DOR OU DESCONFORTO DURANTE O USO.",
    "- NOS PRIMEIROS 15 DIAS, EVITE PEGAR PESO, FAZER ATIVIDADES PESADAS, AGACHAR E LEVANTAR COM FREQUÊNCIA.",
    "- PROCURE CAMINHAR, ISSO DIMINUI O INCHAÇO E OS GASES. NÃO FIQUE O TEMPO TODO DEITADA.",
    "- ATIVIDADES FÍSICAS LEVES, COMO CAMINHADAS, PODEM SER REINICIADAS COM 30 DIAS. ACADEMIA E OUTRAS ATIVIDADES MAIS INTENSAS PODEM SER REINICIADAS APÓS 60 DIAS.",
    "- MANTENHA UMA ALIMENTAÇÃO SAUDÁVEL, EVITE FRITURAS, GORDURAS E EXCESSO DE SAL E AÇÚCAR.",
    "- TOME MUITA ÁGUA, CERCA DE 3 LITROS POR DIA. ISSO EVITA A FADIGA E CANSAÇO.",
    "- SE FEBRE, SANGRAMENTO VAGINAL VOLUMOSO OU FÉTIDO, DOR ABDOMINAL INTENSA OU ALTERAÇÕES NA FERIDA OPERATÓRIA, PROCURAR ATENDIMENTO MÉDICO"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 11 — RECEITA ALTA CURETAGEM + ORIENTAÇÕES
     Fonte: linhas 284–303. Doses verbatim.
     ------------------------------------------------------------------------ */
  prescricaoCuretagem: [
    "#RECEITA DE ALTA — CURETAGEM#",
    "",
    "USO ORAL:",
    "1) SULFATO FERROSO 40MG ---------------- 30 COMPRIMIDOS",
    "TOMAR 01 COMPRIMIDO ANTES DO ALMOÇO POR 30 DIAS.",
    "",
    "2) DIPIRONA 500MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 6/6 HORAS SE DOR.",
    "",
    "3) NIMESULIDA 100MG ---------------- 1 CAIXA",
    "TOMAR 01 COMPRIMIDO DE 12/12 HORAS, POR 3 DIAS."
  ].join("\n"),

  orientacoesCuretagem: [
    "#ORIENTAÇÕES DE ALTA — CURETAGEM#",
    "",
    "- NOS PRIMEIROS 10 DIAS, EVITE FAZER ATIVIDADES PESADAS, AGACHAR E LEVANTAR COM FREQUÊNCIA.",
    "- PROCURE CAMINHAR, ISSO DIMINUI O INCHAÇO E OS GASES. NÃO FIQUE O TEMPO TODO DEITADA.",
    "- ATIVIDADES FÍSICAS LEVES, COMO CAMINHADAS, PODEM SER REINICIADAS COM 10 DIAS.",
    "- MANTENHA UMA ALIMENTAÇÃO SAUDÁVEL, EVITE FRITURAS, GORDURAS E EXCESSO DE SAL E AÇÚCAR.",
    "- TOME MUITA ÁGUA",
    "- SE FEBRE, SANGRAMENTO VAGINAL VOLUMOSO OU FÉTIDO, DOR ABDOMINAL INTENSA, PROCURAR ATENDIMENTO MÉDICO"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 12 — ATESTADO DE CURETAGEM
     Fonte: linhas 307–312.
     ------------------------------------------------------------------------ */
  atestadoCuretagem: [
    "#ATESTADO DE CURETAGEM#",
    "",
    "Relato, para os devidos fins, que a paciente esteve internada nesta instituição (Hospital Estadual Maternidade Nossa Senhora de Lourdes — HEMNSL), necessitando de afastamento das suas atividades laborais por 14 (quatorze) dias para recuperação, a partir do dia {{data_inicio}}.",
    "",
    "CID Z54"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 13 — ANTICONCEPÇÃO (sub-bloco reutilizável; alimenta {{anticoncepcao}})
     Fonte: linhas 173–181 (cesárea) / 223–232 (parto normal).
     ------------------------------------------------------------------------ */
  anticoncepcaoInjetavel: [
    "USO INTRAMUSCULAR:",
    "1) ACETATO MEDROXIPROGESTERONA (ANTICONCEPCIONAL) 150 MG ................ USO CONTÍNUO",
    "APLICAR 01 AMPOLA, INTRAMUSCULAR NO 40° DIA PÓS PARTO. REAPLICAR A CADA 90 DIAS (3 MESES)"
  ].join("\n"),

  anticoncepcaoOral: [
    "USO ORAL:",
    "1) DESOGESTREL (ANTICONCEPCIONAL) 75 MCG ................ USO CONTÍNUO",
    "TOMAR 01 COMPRIMIDO AO DIA, SEMPRE NO MESMO HORÁRIO, SEM PAUSA (EMENDAR UMA CARTELA NA OUTRA). INICIAR 40 DIAS APÓS O PARTO."
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 14 — OBSTETRÍCIA: 1ª CONSULTA (anamnese completa)
     Fonte: linhas 315–404. A peça mais longa. Ordem preservada.
     ------------------------------------------------------------------------ */
  primeiraConsulta: [
    "#Obstetrícia: 1ª consulta#",
    "",
    "Queixa e duração: {{queixa_duracao}}",
    "",
    "Nome: {{nome}}                                  FETO: {{feto}}",
    "Idade: {{idade}}",
    "Estado civil: {{estado_civil}}",
    "Nome do parceiro: {{nome_parceiro}}",
    "GPA: {{gpa}}",
    "DUM: {{dum}}",
    "IG DUM: {{ig_dum}}",
    "IG USG ({{ig_usg_param}}): {{ig_usg}} sem e {{ig_usg_dias}} dias.    DPP: {{dpp}}",
    "Tipo sg: {{tipo_sg}}",
    "Toxoplasmose: {{toxoplasmose}}",
    "Método de anticoncepção antes de engravidar: {{metodo_previo}}",
    "Vacinas: dTPa({{vac_dtpa}})",
    "Hep B — 1 dose({{vac_hepb1}})   2 dose({{vac_hepb2}})   3 dose({{vac_hepb3}})      Anti HBs: {{anti_hbs}}",
    "Influenza ({{vac_influenza}})",
    "COVID ({{vac_covid}})",
    "Comorbidade: {{comorbidades}}",
    "Alergia: {{alergias}}",
    "Medicação em uso: {{medicacoes}}",
    "",
    "História da doença atual",
    "Queixa principal: {{queixa_principal}}",
    "HDA: {{hda}}",
    "",
    "Interrogatório sintomatológico",
    "Queixas urinárias: {{queixas_urinarias}}       ITU prévia: {{itu_previa}}",
    "Queixas intestinais: {{queixas_intestinais}}",
    "Queixas mamárias: {{queixas_mamarias}}",
    "Alimentação: {{alimentacao}}",
    "Ingesta hídrica: {{ingesta_hidrica}}",
    "Sangramento vaginal: {{sangramento_vaginal}}",
    "Leucorreia: {{leucorreia}}",
    "",
    "Antecedentes pessoais: {{ant_pessoais}}",
    "",
    "Antecedentes ginecológicos:",
    "Menarca: {{menarca}} anos",
    "Infecção sexualmente transmissível: {{ist}}",
    "Último colpocitológico: há {{colpo_anos}} anos.",
    "",
    "Antecedentes obstétricos:",
    "{{ant_obstetricos}}",
    "",
    "Antecedentes cirúrgicos: {{ant_cirurgicos}}",
    "",
    "Antecedentes familiares:",
    "Mãe, pai e irmãos: {{ant_familiares}}",
    "",
    "Hábitos de vida",
    "Tabagismo: {{tabagismo}}",
    "Etilismo: {{etilismo}}",
    "Atividade física: {{atividade_fisica}}",
    "",
    "Medicações em uso: {{medicacoes_uso}}",
    "",
    "Exame físico:",
    "Peso antes de engravidar: {{peso_antes}}",
    "Peso atual: {{peso_atual}}",
    "Ganho total: {{ganho_total}}",
    "Altura: {{altura}}",
    "IMC: {{imc}}",
    "PA: {{pa}}",
    "",
    "Aparelho cardiovascular: {{ap_cardiovascular}}",
    "Abdominal: {{abdominal}}",
    "Mamas: {{mamas_consulta}}",
    "Altura de fundo uterino: {{altura_fu}}",
    "Batimento cardíaco fetal: {{bcf}}",
    "Tônus uterino: {{tonus}}",
    "Dinâmica uterina: {{dinamica}}",
    "Movimentos Fetais: {{movimentos_fetais}}",
    "Toque vaginal: {{toque_vaginal}}",
    "",
    "Exames prévios: {{exames_previos}}",
    "Hipótese diagnóstica: {{hipotese}}",
    "Conduta: {{conduta_consulta}}",
    "{{conduta_exames}}",
    "{{conduta_medicacao}}",
    "{{conduta_outras}}"
  ].join("\n"),

  /* ------------------------------------------------------------------------
     BLOCO 15 — RELATÓRIO MÉDICO (DMG / insumos glicemia)
     Fonte: linhas 408–422.
     ------------------------------------------------------------------------ */
  relatorioDMG: [
    "#RELATÓRIO MÉDICO#",
    "",
    "PACIENTE {{nome}}, GESTANTE DE {{ig_semanas}} SEMANAS E {{ig_dias}} DIAS COM DIAGNÓSTICO DE DIABETES GESTACIONAL.",
    "",
    "INDICADO VERIFICAÇÕES DIÁRIAS, 3X AO DIA, DE GLICEMIA CAPILAR.",
    "",
    "INSUMOS:",
    "",
    "GLICOSIMETRO -------------------- 01 UNIDADE",
    "",
    "FITAS REAGENTES ---------------- 90 UNIDADES",
    "",
    "LANCETAS ------------------------- 90 UNIDADES"
  ].join("\n")
};

/* Exporta para uso em app.js (e para testes em node, se necessário). */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TEMPLATES };
}
