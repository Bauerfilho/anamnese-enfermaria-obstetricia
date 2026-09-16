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

## Privacidade (LGPD)

- **Sem backend.** Todo o processamento é 100% no dispositivo.
- Dados da paciente **nunca** saem do aparelho; nada é enviado à nuvem.
- **Credenciais do notepad original (LISNET etc.) ficaram de fora** de propósito — este app não carrega nem exibe senhas ou links internos.
- Nenhum dado identificável de paciente é persistido.

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
