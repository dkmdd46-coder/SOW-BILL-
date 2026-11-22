// Change ce numéro à chaque mise à jour de l'application
const V = "sbb-v1";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n !== V).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Le cache répond d'abord (hors ligne garanti), puis se met à jour en arrière-plan.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(V).then(async c => {
    const cache = await c.match(e.request, { ignoreSearch: true });
    const reseau = fetch(e.request)
      .then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })
      .catch(() => cache || c.match("./"));
    return cache || reseau;
  }));
});
