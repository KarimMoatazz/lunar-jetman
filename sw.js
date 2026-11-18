// Lunar Jetman: keeps the game playable offline and quick to open from the home screen
const CACHE = "lj-v2";
const CORE = ["./", "index.html", "manifest.webmanifest", "music.mp3", "cover.png",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon-32.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const url = new URL(r.url);
  // the game page: newest version when online, the saved copy when offline
  if (r.mode === "navigate" || url.pathname.endsWith("/index.html")){
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return res; }).catch(() => caches.match("index.html")));
    return;
  }
  // everything else (music, images, fonts): from the cache, fetched once
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok && (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname))){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res; })));
});
