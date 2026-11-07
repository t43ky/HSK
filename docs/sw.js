// 오프라인용 캐시: 앱 파일은 캐시로 먼저 보여주고 뒤에서 새로 받아 둠, 획순 데이터는 한 번 본 글자부터 캐시
const APP = 'hsk-app-v3';
const STROKES = 'hsk-strokes-v1';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'lib/hanzi-writer.min.js', 'data/words.json', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(APP).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== APP && k !== STROKES).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin === location.origin && url.pathname.includes('/strokes/')) {
    e.respondWith(
      caches.open(STROKES).then(async (c) => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      }),
    );
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.open(APP).then(async (c) => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request)
        .then((res) => {
          if (res.ok) c.put(e.request, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || net;
    }),
  );
});
