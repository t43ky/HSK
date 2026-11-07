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
console.log('version', v);
