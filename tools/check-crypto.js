/* check-crypto.js — gate binário da criptografia no cliente (Fase 1).
   Roda em node. crypto.js expõe CRYPTO { deriveKey, enc, dec, hashPaciente }
   tanto em window (navegador) quanto em module.exports (node, via WebCrypto). */

"use strict";

let CRYPTO;
try {
  CRYPTO = require("../js/crypto.js");
} catch (e) {
  console.log("FALHOU: js/crypto.js não existe ou não exporta. " + e.message);
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) { console.log("FALHOU: " + msg); process.exit(1); }
}

(async function () {
  const senha = "Maternidade1234";

  /* 1) deriveKey retorna uma CryptoKey utilizável */
  const key = await CRYPTO.deriveKey(senha);
  assert(key, "deriveKey deve retornar uma chave");

  /* 2) enc produz ciphertext diferente do texto, em base64 */
  const original = "Paciente Ana Beatriz Rocha — Puerpério fisiológico. PA 120x80.";
  const c1 = await CRYPTO.enc(original, key);
  assert(typeof c1 === "string" && c1.length > 0, "enc deve retornar string base64");
  assert(c1 !== original, "ciphertext NÃO pode ser igual ao texto claro");
  assert(!c1.includes("Ana Beatriz"), "ciphertext NÃO pode conter o nome em claro");

  /* 3) roundtrip: dec(enc(x)) === x */
  const decifrado = await CRYPTO.dec(c1, key);
  assert(decifrado === original, "dec(enc(x)) deve ser x");

  /* 4) duas cifragens do MESMO texto dão ciphertexts DIFERENTES (IV aleatório) */
  const c2 = await CRYPTO.enc(original, key);
  assert(c1 !== c2, "IV deve ser aleatório: enc(x) != enc(x)");

  /* 5) chave errada NÃO decifra */
  const outra = await CRYPTO.deriveKey("senha-errada");
  let falhou = false;
  try { await CRYPTO.dec(c1, outra); } catch (e) { falhou = true; }
  assert(falhou, "dec com chave errada DEVE falhar");

  /* 6) hashPaciente é determinístico e normaliza (acento/caixa/espaço) */
  const h1 = await CRYPTO.hashPaciente("Ana Beatriz Rocha");
  const h2 = await CRYPTO.hashPaciente("ana  beatriz   rocha");
  const h3 = await CRYPTO.hashPaciente("Ana Béatriz Rocha");
  assert(h1 === h2, "hash deve ignorar caixa/espaços extras");
  assert(h1 === h3, "hash deve ignorar acentos");
  assert(h1 !== original, "hash não expõe o nome");
  assert(/^[0-9a-f]{64}$/.test(h1), "hash SHA-256 em hex (64 chars)");

  console.log("PASS: criptografia no cliente íntegra (AES-GCM, IV aleatório, hash normalizado).");
  process.exit(0);
})().catch(function (e) { console.log("FALHOU (exceção): " + e.message); process.exit(1); });
