/* ============================================================================
   crypto.js — Criptografia NO CLIENTE (LGPD). O servidor (Supabase) NUNCA vê
   o nome da paciente nem o texto do documento em claro — só ciphertext.

   - deriveKey(senha): PBKDF2 -> chave AES-GCM 256. A senha é a MESMA do app
     (decisão do Bauer): quem entra no app já consegue decifrar o sync.
   - enc(texto, key): AES-GCM com IV aleatório -> base64(iv || ciphertext).
     IV aleatório => cifrar o mesmo texto duas vezes dá ciphertexts diferentes.
   - dec(b64, key): inverso. Com chave errada, REJEITA (GCM auth tag).
   - hashPaciente(nome): SHA-256 hex do nome NORMALIZADO (sem acento, minúsculo,
     espaços colapsados) — permite agrupar histórico sem expor o nome.

   Sem dependências: usa Web Crypto API (navegador) ou node:crypto.webcrypto.
   ========================================================================== */

(function (root) {
  "use strict";

  /* Fonte do subtle crypto conforme o ambiente (navegador x node). */
  const subtle = (typeof crypto !== "undefined" && crypto.subtle)
    ? crypto.subtle
    : (typeof require === "function" ? require("node:crypto").webcrypto.subtle : null);

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  /* Salt fixo do app: deriva a chave da senha da equipe de forma estável.
     (O sigilo está na senha, não no salt. Trocar o salt invalidaria o sync.) */
  const SALT = enc.encode("anamnese-go:lourdinha:v1");
  const ITERACOES = 120000;      /* PBKDF2 — suficiente p/ senha humana */
  const IV_BYTES = 12;           /* recomendado p/ AES-GCM */

  function bytesParaB64(bytes) {
    let bin = "";
    const arr = new Uint8Array(bytes);
    for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
    if (typeof btoa === "function") return btoa(bin);
    return Buffer.from(arr).toString("base64");   /* node */
  }
  function b64ParaBytes(b64) {
    if (typeof atob === "function") {
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    }
    return new Uint8Array(Buffer.from(b64, "base64"));   /* node */
  }
  function aleatorio(n) {
    const arr = new Uint8Array(n);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      const rv = require("node:crypto").webcrypto.getRandomValues(arr);
      return rv;
    }
    return arr;
  }

  /* Normaliza nome p/ agrupar (igual ao vault): sem acento, minúsculo, espaço único. */
  function normalizar(nome) {
    return String(nome || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  async function deriveKey(senha) {
    const base = await subtle.importKey("raw", enc.encode(String(senha)), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey(
      { name: "PBKDF2", salt: SALT, iterations: ITERACOES, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encTexto(texto, key) {
    const iv = aleatorio(IV_BYTES);
    const cipher = await subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(String(texto)));
    const pacote = new Uint8Array(IV_BYTES + cipher.byteLength);
    pacote.set(iv, 0);
    pacote.set(new Uint8Array(cipher), IV_BYTES);
    return bytesParaB64(pacote);
  }

  async function decTexto(b64, key) {
    const pacote = b64ParaBytes(b64);
    const iv = pacote.slice(0, IV_BYTES);
    const cipher = pacote.slice(IV_BYTES);
    const claro = await subtle.decrypt({ name: "AES-GCM", iv: iv }, key, cipher);
    return dec.decode(claro);
  }

  async function hashPaciente(nome) {
    const digest = await subtle.digest("SHA-256", enc.encode(normalizar(nome)));
    return Array.prototype.map.call(new Uint8Array(digest), function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  const API = { deriveKey, enc: encTexto, dec: decTexto, hashPaciente, normalizar };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.CRYPTO = API;

})(typeof window !== "undefined" ? window : globalThis);
