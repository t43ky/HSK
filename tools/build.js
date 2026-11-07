// HSK 데이터(complete.json, MIT) + 한국어 뜻(data-src/ko/*.tsv) + 한자음 → src/data/words.json
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const raw = require('./complete.json');
const hanjaSrc = fs.readFileSync(path.join(__dirname, 'hanja-data.js'), 'utf8');
const HANJA = JSON.parse(hanjaSrc.slice(hanjaSrc.indexOf('{'), hanjaSrc.lastIndexOf('}') + 1));

// 한국어 뜻
const KO = {};
const PY = {}; // 병음 지정 (tsv 3번째 칸)
const { pinyin } = require('pinyin-pro');
const norm = (s) => s.toLowerCase().replace(/[\s'·-]/g, '');
const koDir = path.join(root, 'data-src/ko');
for (const f of fs.readdirSync(koDir).filter((f) => f.endsWith('.tsv')).sort()) {
  for (const line of fs.readFileSync(path.join(koDir, f), 'utf8').split('\n')) {
    const [w, k, py] = line.split('\t');
    if (w && k && k.trim()) KO[w.trim()] = k.trim();
    if (w && py && py.trim()) PY[w.trim()] = py.trim();
  }
}

const BAD = /^(surname|variant|old variant|used in|unofficial variant|japanese variant|archaic variant|erhua variant|\(old\)|see )/i;
function pickForm(forms, word) {
  const want = norm(PY[word] || pinyin(word));
  const hit = forms.find((f) => norm(f.transcriptions.pinyin) === want && !BAD.test(f.meanings[0] || ''));
  if (hit) return hit;
  const score = (f) => {
    let s = 0;
    const m = f.meanings.join('; ');
    if (BAD.test(f.meanings[0] || '')) s -= 10;
    if (/^[A-Z]/.test(f.transcriptions.pinyin)) s -= 5;
    if (/\bused in\b|bound form/.test(m)) s -= 1;
    s += Math.min(f.meanings.length, 4) * 0.1;
    return s;
  };
  return forms.slice().sort((a, b) => score(b) - score(a))[0];
}

function hanjaOf(trad) {
  let out = '';
  for (const c of trad) {
    const r = HANJA[c];
    if (!r) return '';
    out += r;
  }
  return out;
}

const words = [];
for (const w of raw) {
  const n = w.level.filter((l) => /^new-/.test(l)).map((l) => +l.slice(4));
  const o = w.level.filter((l) => /^old-/.test(l)).map((l) => +l.slice(4));
  if (!n.length && !o.length) continue;
  const f = pickForm(w.forms, w.simplified);
  const trad = f.traditional;
  const en = f.meanings.filter((m) => !BAD.test(m)).slice(0, 3).join('; ');
  const cls = [...new Set(w.forms.flatMap((x) => x.classifiers || []))].slice(0, 3);
  const e = { w: w.simplified, p: (PY[w.simplified] || f.transcriptions.pinyin).replace(/ r\b/g, 'r') };
  if (trad && trad !== w.simplified) e.t = trad;
  if (n.length) e.n = Math.min(...n);
  if (o.length) e.o = Math.min(...o);
  if (KO[w.simplified]) e.k = KO[w.simplified];
  if (en) e.e = en.length > 90 ? en.slice(0, 88) + '…' : en;
  const h = /[一-鿿]/.test(w.simplified) ? hanjaOf(/[^eē é ě è\s]r$/.test(e.p) ? (trad || w.simplified).replace(/(.)[兒儿]$/, '$1') : trad || w.simplified) : '';
  if (h) e.h = h;
  if (cls.length) e.c = cls.join('');
  e.q = w.frequency;
  words.push(e);
}
words.sort((a, b) => (a.n || 99) - (b.n || 99) || (a.o || 99) - (b.o || 99) || a.q - b.q);
for (const w of words) delete w.q;

fs.mkdirSync(path.join(root, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/data/words.json'), JSON.stringify(words));
const withKo = (lv) => {
  const ws = words.filter((w) => w.n === lv);
  return `${lv}급 ${ws.filter((w) => w.k).length}/${ws.length}`;
};
console.log('words', words.length, [1, 2, 3, 4, 5, 6, 7].map(withKo).join(', '));

// 획순 데이터 (hanzi-writer-data, Arphic Public License): HSK 단어에 나오는 글자만 복사
const hwd = path.join(root, 'node_modules/hanzi-writer-data');
const outS = path.join(root, 'src/strokes');
fs.mkdirSync(outS, { recursive: true });
const chars = new Set();
for (const w of words) for (const c of w.w) if (/[㐀-鿿]/.test(c)) chars.add(c);
let copied = 0, missing = [];
for (const c of chars) {
  const src = path.join(hwd, c + '.json');
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outS, c + '.json'));
    copied++;
  } else missing.push(c);
}
for (const f of ['ARPHICPL.TXT']) fs.copyFileSync(path.join(hwd, f), path.join(outS, 'LICENSE-' + f));
console.log('strokes', copied, 'missing', missing.join(''));
