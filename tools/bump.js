// 배포할 때마다 실행: app.js 와 sw.js 의 버전을 함께 올림 → 설치된 앱이 새 버전을 받음
const fs = require('fs');
const path = require('path');
const d = new Date(Date.now() + 9 * 3600e3); // 한국 시간
const v = d.toISOString().slice(0, 16).replace('T', '-').replace(':', '');
for (const f of ['docs/app.js', 'docs/sw.js']) {
  const p = path.join(__dirname, '..', f);
  const s = fs.readFileSync(p, 'utf8');
  const out = s.replace(/(const (?:APP_)?VERSION = ')[^']*(')/, `$1${v}$2`);
  if (out === s) throw new Error('버전을 못 찾음: ' + f);
  fs.writeFileSync(p, out);
}
// index.html: 버전 표시와 app.js·app.css 주소(?v=)도 같이 → 새 버전이면 새 파일을 받음
{
  const p = path.join(__dirname, '..', 'docs/index.html');
  const s = fs.readFileSync(p, 'utf8');
  const out = s
    .replace(/(<meta name="app-version" content=")[^"]*(")/, `$1${v}$2`)
    .replace(/(app\.(?:js|css)\?v=)[^"]*/g, `$1${v}`);
  if (out === s) throw new Error('index.html 버전을 못 찾음');
  fs.writeFileSync(p, out);
}
console.log('version', v);
