/* sw.js — cache-first offline-first. Sem backend, sem envio de dados. */
const CACHE = "anamnese-go-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/templates.js",
  "./js/schema.js",
  "./js/vault.js",
  "./js/crypto.js",
  "./js/config.js",
  "./js/sync.js",
  "./js/modelos.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/marca-isana.svg",
  "./assets/logo-ml.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  /* Supabase (e qualquer origem externa) NUNCA passa pelo cache: sync precisa de
     rede fresca e o Realtime nem é GET cacheável. Deixa ir direto pra rede. */
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
