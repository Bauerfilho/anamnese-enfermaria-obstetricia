# Opções de Sincronização — Anamnese Enfermaria (Maternidade Lourdinha)

**Contexto:** o app hoje é 100% local (sem backend). Para "sincronizar em todos os
computadores" de forma **automática**, é preciso uma **ponte na rede**. Não há como
um agente Hermes fazer isso sozinho — o sync acontece quando ninguém está olhando
(PC da enfermaria ↔ notebook da médica), e o GitHub Pages é estático (sem servidor).

Abaixo, as opções avaliadas, com custo LGPD e técnico de cada uma.

---

## ✅ ESCOLHIDA — Supabase (Pro)

- **O que é:** banco de dados Postgres gerenciado, com API REST + **Realtime**.
- **Sync:** tempo real (as telas abertas recebem push quando outra salva).
- **Segurança:** TLS em trânsito; dados criptografados em repouso; **Row Level
  Security (RLS)** pra isolar quem lê/escreve. Você tem a versão **Pro**.
- **LGPD:** o dado de paciente **passa por servidor** — mas criptografado e com
  controle de acesso. É a opção mais profissional das listadas.
- **Custo:** você já tem Pro. Grátis cobriria até ~500MB; Pro sobe o teto.
- **Offline-first:** a app continua funcionando offline; sincroniza quando volta
  a rede (fila local → push). 
- **Observação sobre Google AI Ultra:** o Google AI Ultra (Gemini) **não é um banco
  nem um serviço de sync** — é um modelo de IA. Ele **não substitui** o Supabase
  para este trabalho. Onde ele *poderia* ajudar no futuro: gerar/ revisar texto,
  extrair dados, ou alimentar o modo "adicionar modelo" com IA. Para o **sync**,
  quem resolve é o Supabase. (Se você quiser, a gente explora o Google AI Ultra
  depois, na parte de auto-personalização inteligente dos modelos.)

---

## Demais opções consideradas (para registro)

### Firebase (Google)
- Sync em tempo real maduro, offline-first **nativo** (Firestore).
- Dado fica no Google; regras de segurança próprias.
- Grátis no plano Spark. Bom, mas Supabase Pro já está pago e é Postgres puro.

### Relay mínimo (servidor próprio em Node)
- Eu escreveria um servidorzinho que só **ecoa** o histórico criptografado entre
  os aparelhos (sem guardar nada, ou guardando pouco).
- **Mais controle**, mas **mais trabalho seu** (hospedar, manter, ligar).
- Sync não seria "tempo real" tão simples quanto Supabase.

### GitHub Gist privado (gambiarra elegante)
- Usa um Gist privado como "caixa" criptografada que os aparelhos puxam/empurram.
- **Zero custo**, mas dado passa pelo GitHub, **sem tempo real** (precisaria de
  polling), e é frágil pra uso clínico. Não recomendo pra dado de paciente.

### Local + QR code (descartada por não ser automática)
- O sync viraria um QR code na tela que outro aparelho escaneia pra puxar.
- Sem servidor, mas **exige os dois aparelhos perto** e ação manual — não é o
  "automático em todos os computadores" que você pediu.

### Arquivo de 1 clique (descartada por não ser automática)
- Botão SYNCH baixaria um `.json`; a médica levaria e importaria nos outros PCs.
- Sem nuvem, LGPD ótimo, mas **manual** — não é "automático".

---

## Decisão

**Supabase Pro**, com:
1. Tabela de documentos/histórico com **RLS** (só quem tem a chave lê/escreve).
2. **Criptografia** dos campos sensíveis (nome da paciente e texto) — idealmente
   criptografia **no cliente** (a chave fica com vocês, o Supabase guarda só
   ciphertext). Isso blinda ainda mais no LGPD.
3. **Retenção de 20 dias** mantida: poda local + poda no servidor.
4. Botão **SYNCH vermelho** embaixo de cada documento.
5. **Auto-personalização:** "modelos extras" salvos por usuária (sem tocar nos
   modelos originais da preceptora), também sincronizados.

> ⚠️ **LGPD:** dado de paciente real em servidor exige cuidado. Vou desenhar com
> criptografia no cliente + RLS + retenção, e deixo o aviso no README. A decisão
> final de colocar dado real é sua/da equipe.
