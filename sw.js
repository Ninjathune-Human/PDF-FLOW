/* Atelier PDF : fonctionnement hors ligne, depuis l'adresse publiée.
   L'application et ses bibliothèques sont gardées après le premier chargement.
   - Application (même origine) : réseau d'abord, pour recevoir les mises à jour dès qu'on est en ligne ; cache sinon.
   - Bibliothèques (CDN, versions figées) : cache d'abord ; à défaut, réseau, puis mise en cache.
     Les modules chargés à la demande (OCR, déverrouillage, Word) rejoignent le cache à leur premier usage.
   Changer CACHE à chaque changement de liste ou de versions de bibliothèques. */
const CACHE = 'atelier-pdf-v1';
const CORE = [
  './', './index.html', './atelier-pdf.html',
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/@fontsource-variable/geist@5.3.0/files/geist-latin-wght-normal.woff2',
  'https://cdn.jsdelivr.net/npm/@fontsource-variable/geist-mono@5.3.0/files/geist-mono-latin-wght-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('atelier-pdf-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function keep(req, res) {
  if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => keep(req, res)).catch(() =>
      caches.match(req, { ignoreSearch: true }).then(hit => hit
        || (req.mode === 'navigate' ? caches.match('./atelier-pdf.html') : Response.error()))));
    return;
  }
  if (url.protocol !== 'https:') return;
  e.respondWith(caches.match(req, { ignoreVary: true }).then(hit => hit || fetch(req).then(res => keep(req, res))));
});
