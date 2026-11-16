// 오프라인용 캐시
// - 앱 파일(html/js/css/단어 데이터): 항상 인터넷에서 새로 받아 보여주고(브라우저 캐시도 건너뜀), 인터넷이 안 될 때만 저장해 둔 것을 보여줌
// - 획순 데이터: 한 번 받은 묶음은 저장해 두고 재사용
const VERSION = '2026-11-17-0406';
const APP = 'hsk-app-' + VERSION;
const STROKES = 'hsk-strokes-v2';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'lib/hanzi-writer.min.js', 'data/words.json', 'data/sentences.json', 'data/grammar.json', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(APP)
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== APP && k !== STROKES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/strokes/')) {
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
  e.respondWith(
    caches.open(APP).then(async (c) => {
      try {
        // 화면(HTML)만 느릴 때 저장본으로, 앱 파일(JS·CSS·데이터)은 끝까지 기다림 (화면과 앱 파일 버전이 엇갈리지 않게)
        const net = fetch(e.request, { cache: 'no-cache' });
        const res = e.request.mode === 'navigate' ? await Promise.race([net, timeout(8000)]) : await net;
        if (res.ok) c.put(e.request, res.clone());
        return res;
      } catch {
        const hit = await c.match(e.request, { ignoreSearch: true });
        if (hit) return hit;
        if (e.request.mode === 'navigate') {
          const home = await c.match('index.html');
          if (home) return home;
        }
        return Response.error();
      }
    }),
  );
});
