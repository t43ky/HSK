// 문법(data-src/grammar.txt) → docs/data/grammar.json
// 예문·빈칸 문장은 예문과 같은 방식으로 단어별 병음을 붙임
const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');
const root = path.join(__dirname, '..');
const words = require(path.join(root, 'docs/data/words.json'));
const BY = new Map(words.map((w) => [w.w, w]));
const PUNCT = /^[，。？！、：；“”‘’（）…,.?!]+$/;

function sent(zh, ko) {
  const toks = zh.trim().split(/\s+/).flatMap((t) => t.split(/([，。？！、：；“”‘’（）…]+)/)).filter(Boolean);
  const py = pinyin(toks.join(''), { type: 'array', toneSandhi: true });
  let k = 0;
  const p = toks.map((t) => {
    const len = [...t].length;
    if (PUNCT.test(t)) {
      k += len;
      return '';
    }
    const w = BY.get(t);
    let syl = py.slice(k, k + len);
    k += len;
    if (w && len > 1 && w.p.split(/\s+/).length === len) syl = w.p.split(/\s+/);
    if (t === '得') return 'de';
    return syl.join('');
  });
  return { z: toks, p, k: ko.trim() };
}

const out = [];
let cur = null;
for (const line of fs.readFileSync(path.join(root, 'data-src/grammar.txt'), 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  if (line.startsWith('@')) {
    const [lv, t, f] = line.slice(1).split('|').map((x) => x.trim());
    cur = { id: out.length + 1, lv: +lv, t, f, d: '', ex: [], q: [] };
    out.push(cur);
  } else if (line.startsWith('>')) {
    const [zh, ko] = line.slice(1).split('|');
    cur.ex.push(sent(zh, ko));
  } else if (line.startsWith('?')) {
    const [zh, opts, ko] = line.slice(1).split('|');
    const m = zh.match(/\[([^\]]+)\]/);
    if (!m) throw new Error('빈칸 없음: ' + line);
    const s = sent(zh.replace(/\[([^\]]+)\]/, '$1'), ko);
    const ans = m[1];
    const blank = s.z.indexOf(ans);
    if (blank < 0) throw new Error('정답 위치 못 찾음: ' + line);
    const o = opts.split(',').map((x) => x.trim());
    if (!o.includes(ans)) throw new Error('보기에 정답 없음: ' + line);
    cur.q.push({ ...s, b: blank, o });
  } else cur.d += (cur.d ? ' ' : '') + line.trim();
}
fs.writeFileSync(path.join(root, 'docs/data/grammar.json'), JSON.stringify(out));
const by = {};
for (const g of out) by[g.lv] = (by[g.lv] || 0) + 1;
console.log('grammar', out.length, by, 'gap', out.reduce((a, g) => a + g.q.length, 0), 'ex', out.reduce((a, g) => a + g.ex.length, 0));
