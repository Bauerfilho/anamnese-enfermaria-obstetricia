# Anamnese Enfermaria — Obstetrícia

Calculadora de uso médico que transforma um questionário em **Anamnese / Evolução de Enfermaria de Obstetrícia**, no formato exato do template da preceptora. Você marca opções e completa campos; o documento é gerado ao vivo, na ordem certa, pronto para copiar.

## Por que existe

Medicina de enfermaria é corrida. Em vez de redigir cada evolução do zero, você toca nas opções (as mais frequentes já vêm destacadas) e o texto sai formatado como a preceptora espera.

## Como usar

1. Abra `index.html` (ou instale como app — é um PWA offline-first).
2. No menu (☰) escolha o bloco: Evolução Puerpério, Pós-Curetagem, Laparotomia, 1ª Consulta, Alta, Atestados.
3. Preencha/marque. O documento aparece à direita (ou abaixo, no celular).
4. **Copiar** → cole no prontuário.

## Decisões de desenho

- **Obstetrícia no topo:** os blocos mais usados no rodízio abrem primeiro.
- **Cores por frequência:** a opção mais comum (ex.: "O Rh+", "nega alergia") aparece em coral; as raras ficam atenuadas. Você acha o comum numa olhada.
- **Gavetas:** campos com muitas alternativas ficam colapsados até você tocar.
- **Defaults fisiológicos pré-marcados:** o documento já nasce ~80% preenchido ("nega", "Bom estado geral…"). Você só ajusta o que difere.
- **Ordem verbatim:** a saída segue o template original, sem resumir nem reordenar.

## Privacidade (LGPD) — leia se for guardar dados de paciente

- **Sem backend / sem nuvem.** Todo o processamento é 100% no dispositivo.
- **Credenciais do notepad original (LISNET etc.) ficaram de fora** de propósito — este app não carrega nem exibe senhas ou links internos.

### Histórico local (aba 🕘)

- O botão **Salvar** guarda o documento num **cofre local** (`localStorage`) **só neste dispositivo**, criado na primeira entrada.
- **Retenção automática: 20 dias.** Tudo que passa de 20 dias é **apagado sozinho** — ao salvar, ao abrir e ao importar.
- **Interconexão por nome:** documentos da mesma paciente (mesmo nome, ignorando acento/caixa) agrupam → histórico completo dos últimos dias dela.
- **Data/hora automática:** o app usa o relógio do sistema — você não precisa informar o dia.

### Botão Sync (⟳ Exportar / Importar)

- **Não é nuvem.** O Sync **exporta** o cofre como arquivo `.json` (baixar) e **importa** um `.json` (carregar) — para a médica levar o histórico entre dispositivos (ex.: do computador pro celular) **offline**.
- O arquivo exportado **contém dados de paciente** — guarde/apague com responsabilidade. A regra dos 20 dias também é aplicada ao importar.
- **Limitação honesta:** o cofre é por dispositivo+navegador. Não há sync automático entre pessoas — isso exigiria servidor (e dado de paciente em nuvem, que evitamos de propósito).
- O navegador/SO pode limpar `localStorage` em falta de espaço ou "limpar dados de site". **Exporte periodicamente** se quiser garantir.

## Stack

HTML/CSS/JS vanilla, offline-first, dark/light, estética Apple-like. Tokens semânticos (paleta coral/petróleo/off-white).

## Estrutura

```
index.html
css/style.css
js/templates.js   — modelos verbatim (a Regra Suprema: ordem/campos do template)
js/schema.js      — o questionário (seções, campos, frequências, defaults)
js/app.js         — motor (renderiza + gera o documento ao vivo)
manifest.webmanifest, sw.js — PWA offline
tools/isana-template.txt — fonte-contrato (referência interna)
```
