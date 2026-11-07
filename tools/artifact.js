// claude.ai 링크용 페이지: src/index.html 에서 html/head/body 껍데기를 빼고 CSS·JS 를 안에 넣음
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const html = src('index.html');
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
  .replace(/<script src="[^"]+"><\/script>\s*/g, '');
const css = src('app.css')
  // 링크 페이지는 :root 가 안전 영역만큼 이미 띄워져 있음
  .replace('position: sticky; top: 0; z-index: 5; padding-top: env(safe-area-inset-top);', 'position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5;')
  .replace('padding-bottom: calc(64px + env(safe-area-inset-bottom));', 'padding-bottom: 64px;')
  + '\nbody::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }\n';
const out = `<title>HSK 단어장</title>
<style>
${css}
</style>
${body}
<script>
${src('lib/hanzi-writer.min.js')}
</script>
<script>
${src('app.js')}
</script>
`;
const dir = path.join(root, 'dist-artifact');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), out);
console.log('dist-artifact/index.html', out.length);
