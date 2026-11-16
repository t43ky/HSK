// 예문(data-src/sentences/*.tsv) → docs/data/sentences.json
// 각 줄: 중국어(단어 사이 띄어쓰기)<TAB>한국어. 급수는 들어간 단어의 가장 높은 급수로 계산.
const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');
const root = path.join(__dirname, '..');
const words = require(path.join(root, 'docs/data/words.json'));
const BY = new Map(words.map((w) => [w.w, w]));
const PUNCT = /^[，。？！、：；“”‘’（）…,.?!]+$/;
const dir = path.join(root, 'data-src/sentences');
const out = [];
const unknown = {};
const hi = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.tsv')).sort()) {
  for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [zh, ko] = line.split('\t');
    if (!zh || !ko) throw new Error('형식 오류: ' + line);
    // 띄어쓰기로 단어를 나누고, 문장부호는 따로 떼어 냄
    const toks = zh.trim().split(/\s+/).flatMap((t) => t.split(/([，。？！、：；“”‘’（）…]+)/)).filter(Boolean);
    // 병음 직접 지정: 得|děi 처럼 쓰면 그 병음을 씀. 得 은 따로 지정이 없으면 정도보어 de
    const force = {};
    toks.forEach((t, i) => {
      const m = t.match(/^(.+)\|(.+)$/);
      if (m) {
        toks[i] = m[1];
        force[i] = m[2];
      } else if (t === '得') force[i] = 'de';
    });
    const text = toks.join('');
    // 문장 전체로 병음을 구한 뒤 단어별로 나눔 (다음자·성조 변화가 문맥에 맞게)
    const py = pinyin(text, { type: 'array', toneSandhi: true });
    let k = 0;
    const p = [];
    let n = 1, o = 1;
    for (const [ti, t] of toks.entries()) {
      const len = [...t].length;
      if (PUNCT.test(t)) { p.push(''); k += len; continue; }
      const w = BY.get(t);
      let syl = py.slice(k, k + len);
      k += len;
      // 단어장에 있는 단어는 단어장 병음(경성 등)을 우선
      // 두 글자 이상 단어는 단어장 병음(경성·고유명사 대문자)을 우선, 한 글자는 문맥에 맞는 병음(得 de/dé 등)
      if (w && len > 1 && w.p.split(/\s+/).length === len) syl = w.p.split(/\s+/);
      p.push(force[ti] || syl.join(''));
      if (w) {
        n = Math.max(n, w.n || 7);
        o = Math.max(o, w.o || 7);
        if (process.env.SHOW && (w.n || 7) > 1) (hi[f] = hi[f] || []).push(t + (w.n || 7));
      }
      else if (/[一-鿿]/.test(t)) (unknown[t] = unknown[t] || []).push(f);
    }
    out.push({ z: toks, p, k: ko.trim(), n, o });
  }
}
fs.writeFileSync(path.join(root, 'docs/data/sentences.json'), JSON.stringify(out));
const cnt = {};
for (const s of out) cnt[s.n] = (cnt[s.n] || 0) + 1;
console.log('sentences', out.length, 'by level', cnt);
if (Object.keys(unknown).length) console.log('단어장에 없는 토큰:', Object.entries(unknown).map(([t, f]) => t + '(' + [...new Set(f)].join(',') + ')').join(' '));
if (process.env.SHOW) for (const [f, l] of Object.entries(hi)) console.log(f, [...new Set(l)].join(' '));
