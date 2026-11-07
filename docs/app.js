/* HSK 단어장 · 문제풀이 · 오답노트 · 쓰기 연습 */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const isHan = (c) => /[㐀-鿿]/.test(c);
  const plain = (p) => p.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').replace(/[\s']/g, '').toLowerCase();
  const fmtDate = (t) => {
    const d = new Date(t);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // claude.ai 링크(iframe) 안에서는 history/hash/다운로드/confirm 을 쓰지 않음
  const IN_FRAME = (() => {
    try {
      return window.top !== window;
    } catch {
      return true;
    }
  })();


  /* ---------------- 아이콘 (선 아이콘, 글자색을 따름: 라이트 검정 / 다크 흰색) ---------------- */
  const ICON_PATHS = {
    book: '<path d="M12 6.5C10.5 5.2 8.3 4.5 4 4.5v14c4.3 0 6.5.7 8 2 1.5-1.3 3.7-2 8-2v-14c-4.3 0-6.5.7-8 2z"/><path d="M12 6.5v14"/>',
    pencil: '<path d="M15.2 4.8l4 4L8.5 19.5 4 20l.5-4.5z"/><path d="M13 7l4 4"/>',
    notes: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9.8 9.8l4.4 4.4M14.2 9.8l-4.4 4.4"/>',
    sliders: '<path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9"/><circle cx="15" cy="7.5" r="2"/><circle cx="9" cy="16.5" r="2"/>',
    theme: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/>',
    sound: '<path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10"/>',
    play: '<path d="M8 5.5l10.5 6.5L8 18.5z"/>',
    redo: '<path d="M5 12a7 7 0 1 0 2-4.9L5 9"/><path d="M5 4.5V9h4.5"/>',
    write: '<path d="M15.2 4.8l4 4L8.5 19.5 4 20l.5-4.5z"/><path d="M13 20h7"/>',
    star: '<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>',
    starFill: '<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z" fill="currentColor"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    chevronLeft: '<path d="M14.5 6l-6 6 6 6"/>',
    chevronRight: '<path d="M9.5 6l6 6-6 6"/>',
    home: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    cards: '<rect x="4" y="7" width="12" height="13" rx="2.5"/><path d="M8 4h9.5A2.5 2.5 0 0 1 20 6.5V16"/>',
    square: '<rect x="4.5" y="4.5" width="15" height="15" rx="3.5"/>',
    checkSquare: '<rect x="4.5" y="4.5" width="15" height="15" rx="3.5" fill="currentColor"/><path d="M8.5 12.2l2.5 2.5 4.6-5" stroke="var(--bg)" stroke-width="2.2"/>',
  };
  const ic = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
  document.querySelectorAll('[data-ic]').forEach((el) => (el.innerHTML = ic(el.dataset.ic)));

  const APP_VERSION = '2026-11-07-2349'; // tools/bump.js 가 sw.js 와 함께 올림

  /* ---------------- 저장 ---------------- */
  const KEY = 'hsk-study-v1';
  const DEFAULTS = {
    set: { track: 'n', level: 1, theme: 'system', rate: '0.8', autoSpeak: true, hint: '3', showPy: true, showKo: true,
      filter: 'all', qScope: 'level', qTypes: ['meaning', 'word', 'pinyin'], qCount: 10, noteFilter: 'open', noteSort: 'recent' },
    st: {}, // 단어 상태: 1 학습 중(모름), 2 외움
    star: {},
    wrong: {}, // 오답노트: { c 틀린 횟수, s 연속 정답, t 마지막 오답, f 처음, ok 해결, log:[{t,ty,a}], m 메모 }
    hist: [], // 문제 기록 [{t, n, ok, scope}]
  };
  let DB;
  try {
    DB = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {}
  if (!DB || typeof DB !== 'object') DB = {};
  for (const k of Object.keys(DEFAULTS)) if (DB[k] == null) DB[k] = structuredClone(DEFAULTS[k]);
  DB.set = { ...DEFAULTS.set, ...DB.set };
  let saveT = 0;
  const save = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(DB));
      } catch (e) {
        toast('저장하지 못했습니다: ' + e.message);
      }
    }, 150);
  };
  window.addEventListener('pagehide', () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(DB));
    } catch {}
  });

  /* ---------------- 테마 ---------------- */
  function applyTheme() {
    const t = DB.set.theme;
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  applyTheme();
  const isDark = () => {
    const t = DB.set.theme;
    return t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };
  $('#themeBtn').onclick = () => {
    DB.set.theme = isDark() ? 'light' : 'dark';
    applyTheme();
    $('#setTheme').value = DB.set.theme;
    save();
  };

  /* ---------------- 발음 (브라우저 내장 음성) ---------------- */
  let zhVoice = null;
  const pickVoice = () => {
    const vs = speechSynthesis.getVoices();
    zhVoice = vs.find((v) => /zh[-_]CN/i.test(v.lang)) || vs.find((v) => /^zh/i.test(v.lang) && !/HK|TW/i.test(v.lang)) || vs.find((v) => /^zh/i.test(v.lang)) || null;
  };
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) return toast('이 브라우저는 발음 듣기를 지원하지 않습니다');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    if (zhVoice) u.voice = zhVoice;
    u.rate = +DB.set.rate || 0.8;
    speechSynthesis.speak(u);
  }

  /* ---------------- 토스트 ---------------- */
  let toastT = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => (el.hidden = true), 2200);
  }

  /* ---------------- 데이터 ---------------- */
  let WORDS = [];
  const BY = new Map();
  const levelOf = (w, track = DB.set.track) => w[track] || 0;
  const levelName = (track, lv) => (track === 'n' && lv === 7 ? '7–9급' : lv + '급');
  const meaning = (w) => w.k || w.e || '';
  const levelWords = (track = DB.set.track, lv = DB.set.level) => WORDS.filter((w) => w[track] === lv);

  /* ---------------- 탭 ---------------- */
  let curTab = 'home';
  function showTab(name) {
    if (!['home', 'words', 'quiz', 'notes', 'settings'].includes(name)) name = 'home';
    curTab = name;
    $$('main > section').forEach((s) => (s.hidden = s.dataset.tab !== name));
    $$('#tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === name));
    if (name === 'home') renderHome();
    if (name === 'words') renderWords();
    if (name === 'quiz') renderQuizTab();
    if (name === 'notes') renderNotes();
    if (name === 'settings') renderSettings();
    window.scrollTo(0, 0);
  }
  $$('#tabbar a').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (!IN_FRAME) history.replaceState(history.state, '', '#' + a.dataset.tab);
      showTab(a.dataset.tab);
    }),
  );

  /* ---------------- 레이어 (뒤로 가기 지원) ---------------- */
  const stack = [];
  function openLayer({ title, render, onClose, right, cls }) {
    const el = document.createElement('div');
    el.className = 'layer' + (cls ? ' ' + cls : '');
    el.innerHTML = `<div class="layer-head"><button class="ghost back">${ic('chevronLeft')} 닫기</button><div class="title">${esc(title)}</div><div class="right">${right || '<span style="display:inline-block;min-width:64px"></span>'}</div></div><div class="layer-body"></div>`;
    $('#layers').appendChild(el);
    document.body.style.overflow = 'hidden';
    const L = { el, body: $('.layer-body', el), onClose, setTitle: (t) => ($('.title', el).textContent = t) };
    stack.push(L);
    if (!IN_FRAME) history.pushState({ layer: stack.length }, '');
    $('.back', el).onclick = () => closeTopLayer();
    render(L);
    return L;
  }
  function popLayer() {
    const L = stack.pop();
    if (!L) return;
    try {
      L.onClose && L.onClose();
    } catch {}
    L.el.remove();
    if (!stack.length) {
      document.body.style.overflow = '';
      refreshCurrent();
    }
  }
  window.addEventListener('popstate', () => {
    const depth = (history.state && history.state.layer) || 0;
    while (stack.length > depth) popLayer();
  });
  function closeTopLayer() {
    if (IN_FRAME) popLayer();
    else history.back();
  }

  // 페이지 안 확인 창 (confirm 대체)
  function ask(msg, okLabel = '확인', danger = false) {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'modal';
      el.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true"><p></p><div class="actions" style="justify-content:flex-end"><button data-r="0">취소</button><button data-r="1" class="primary ${danger ? 'danger-fill' : ''}"></button></div></div>`;
      $('p', el).textContent = msg;
      $('[data-r="1"]', el).textContent = okLabel;
      document.body.appendChild(el);
      $('[data-r="1"]', el).focus();
      el.onclick = (e) => {
        const b = e.target.closest('[data-r]');
        if (!b && e.target !== el) return;
        el.remove();
        resolve(!!b && b.dataset.r === '1');
      };
    });
  }
  function refreshCurrent() {
    updateBadge();
    if (curTab === 'home') renderHome();
    if (curTab === 'words') renderWords(true);
    if (curTab === 'quiz') renderQuizTab();
    if (curTab === 'notes') renderNotes();
  }

  /* ---------------- 홈 메뉴 ---------------- */
  function goTab(name) {
    if (!IN_FRAME) history.replaceState(history.state, '', '#' + name);
    showTab(name);
  }
  function renderHome() {
    const s = DB.set;
    const ws = levelWords();
    const known = ws.filter((w) => DB.st[w.w] === 2).length;
    const left = ws.length - known;
    const wrong = Object.values(DB.wrong).filter((x) => !x.ok).length;
    const stars = Object.keys(DB.star).length;
    const pct = ws.length ? Math.round((known / ws.length) * 100) : 0;
    const tile = (go, icon, title, sub) =>
      `<button class="tile" data-go="${go}"><span class="tile-ic">${ic(icon)}</span><span class="tile-t">${title}</span><span class="tile-s">${sub}</span></button>`;
    $('#homeBox').innerHTML = `
      <button class="home-level" data-go="level">
        <span class="hl-top"><span>HSK ${s.track === 'n' ? '3.0' : '2.0'}</span><b>${levelName(s.track, s.level)}</b><span class="hl-change">바꾸기 ${ic('chevronRight')}</span></span>
        <span class="hl-num"><b>${known}</b> / ${ws.length} 외움 <span>${pct}%</span></span>
        <span class="pbar"><i style="width:${pct}%"></i></span>
      </button>
      <div class="tiles">
        ${tile('words', 'book', '단어장', `${ws.length}단어`)}
        ${tile('cards', 'cards', '카드 외우기', left ? `안 외운 ${left}개` : '다 외웠어요')}
        ${tile('quiz', 'pencil', '문제 풀기', '뜻 · 한자 · 병음 · 듣기')}
        ${tile('notes', 'notes', '오답노트', wrong ? `복습할 오답 ${wrong}개` : '오답 없음')}
        ${tile('write', 'write', '쓰기 연습', '획순대로 직접 쓰기')}
        ${tile('star', 'star', '별표 단어', stars ? `${stars}개` : '아직 없음')}
      </div>
      <button class="home-settings" data-go="settings">${ic('sliders')}<span>설정 · 백업</span>${ic('chevronRight')}</button>`;
  }
  $('#homeBox').onclick = (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    const g = b.dataset.go;
    if (g === 'words' || g === 'quiz' || g === 'notes' || g === 'settings') return goTab(g);
    if (g === 'level') return pickLevel();
    if (g === 'cards') {
      const ws = levelWords();
      const left = ws.filter((w) => DB.st[w.w] !== 2);
      return startCards(left.length ? left : ws);
    }
    if (g === 'write') {
      const ws = levelWords().filter(canWrite);
      const left = ws.filter((w) => DB.st[w.w] !== 2);
      return startQuiz({ pool: left.length ? left : ws, label: '쓰기 연습', types: ['write'], count: 10 });
    }
    if (g === 'star') {
      DB.set.filter = 'star';
      save();
      return goTab('words');
    }
  };
  function pickLevel() {
    openLayer({
      title: '급수 고르기',
      render: (L) => {
        const draw = () => {
          const s = DB.set;
          const max = s.track === 'n' ? 7 : 6;
          L.body.innerHTML = `
            <div class="seg" style="display:flex;margin-bottom:14px">
              <button style="flex:1" data-t="n" class="${s.track === 'n' ? 'on' : ''}">HSK 3.0</button>
              <button style="flex:1" data-t="o" class="${s.track === 'o' ? 'on' : ''}">HSK 2.0</button>
            </div>
            <div class="level-list">${Array.from({ length: max }, (_, i) => i + 1)
              .map((lv) => {
                const ws = levelWords(s.track, lv);
                const k = ws.filter((w) => DB.st[w.w] === 2).length;
                return `<button data-lv="${lv}" class="${lv === s.level ? 'on' : ''}"><b>${levelName(s.track, lv)}</b><span>${k} / ${ws.length}</span>${lv === s.level ? ic('check') : ''}</button>`;
              })
              .join('')}</div>`;
        };
        draw();
        L.body.onclick = (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          if (b.dataset.t) {
            DB.set.track = b.dataset.t;
            if (DB.set.level > (DB.set.track === 'n' ? 7 : 6)) DB.set.level = 1;
            save();
            draw();
          }
          if (b.dataset.lv) {
            DB.set.level = +b.dataset.lv;
            save();
            closeTopLayer();
          }
        };
      },
    });
  }

  /* ---------------- 단어장 ---------------- */
  let listCache = [];
  let listShown = 0;
  const PAGE = 120;

  function renderTrackAndLevels() {
    const s = DB.set;
    $$('#trackSeg button').forEach((b) => b.classList.toggle('on', b.dataset.track === s.track));
    $('#trackHint').textContent = s.track === 'n' ? '2021 새 기준 · 9개 급수' : '기존 기준 · 6개 급수';
    const max = s.track === 'n' ? 7 : 6;
    if (s.level > max) s.level = max;
    $('#levelChips').innerHTML = Array.from({ length: max }, (_, i) => i + 1)
      .map((lv) => `<button data-lv="${lv}" class="${lv === s.level ? 'on' : ''}">${levelName(s.track, lv)}</button>`)
      .join('');
  }
  $('#trackSeg').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.track = b.dataset.track;
    save();
    renderWords();
  };
  $('#levelChips').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.level = +b.dataset.lv;
    save();
    renderWords();
  };
  $('#wordFilter').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.filter = b.dataset.f;
    save();
    renderWords();
  };
  let searchT = 0;
  $('#wordSearch').addEventListener('input', () => {
    clearTimeout(searchT);
    searchT = setTimeout(() => renderWords(), 180);
  });

  function filteredList() {
    const q = $('#wordSearch').value.trim();
    let list;
    if (q) {
      // 검색은 모든 급수에서
      const qp = plain(q);
      const hasHan = [...q].some(isHan);
      list = WORDS.filter((w) => {
        if (hasHan) return w.w.includes(q) || (w.t && w.t.includes(q));
        if (/^[a-zü\s]+$/i.test(q) && plain(w.p).startsWith(qp)) return true;
        return (w.k && w.k.includes(q)) || (w.h && w.h.includes(q)) || (/^[a-z\s]+$/i.test(q) && w.e && w.e.toLowerCase().includes(q.toLowerCase()));
      });
      const rank = (w) => (w.w === q ? 0 : plain(w.p) === qp ? 1 : w.k && w.k.split(/[,;]\s*/).includes(q) ? 2 : 3);
      list.sort((a, b) => rank(a) - rank(b) || a.w.length - b.w.length || (a.n || 9) - (b.n || 9));
    } else list = levelWords();
    const f = DB.set.filter;
    if (f === 'new') list = list.filter((w) => DB.st[w.w] !== 2);
    if (f === 'known') list = list.filter((w) => DB.st[w.w] === 2);
    if (f === 'star') list = list.filter((w) => DB.star[w.w]);
    return list;
  }

  function renderProgress() {
    const ws = levelWords();
    const known = ws.filter((w) => DB.st[w.w] === 2).length;
    const learn = ws.filter((w) => DB.st[w.w] === 1).length;
    const wrong = ws.filter((w) => DB.wrong[w.w] && !DB.wrong[w.w].ok).length;
    const noKo = ws.filter((w) => !w.k).length;
    const pct = (n) => (ws.length ? (n / ws.length) * 100 : 0);
    $('#levelProgress').innerHTML = `
      <div class="nums"><span><b>${known}</b> / ${ws.length} 외움 · 학습 중 ${learn}</span><span>오답 ${wrong}</span></div>
      <div class="pbar"><i style="width:${pct(known)}%"></i><i class="learn" style="width:${pct(learn)}%"></i></div>
      ${noKo ? `<div class="muted small" style="margin-top:6px">이 급수는 한국어 뜻을 아직 넣는 중이라 ${noKo === ws.length ? '' : '일부 단어는 '}영어 뜻으로 보입니다.</div>` : ''}`;
  }

  function wordRow(w) {
    const s = DB.st[w.w] || 0;
    const ko = meaning(w);
    return `<li data-w="${esc(w.w)}">
      <span class="dot s${s}" title="${s === 2 ? '외움' : s === 1 ? '학습 중' : '새 단어'}"></span>
      <span class="w zh">${esc(w.w)}</span>
      <span class="info">${DB.set.showPy ? `<div class="py">${esc(w.p)}</div>` : ''}${DB.set.showKo ? `<div class="ko${w.k ? '' : ' en'}">${esc(ko)}</div>` : ''}</span>
      ${DB.star[w.w] ? `<span class="star">${ic('starFill')}</span>` : ''}
      ${DB.wrong[w.w] && !DB.wrong[w.w].ok ? `<span class="cnt">${ic('x')}${DB.wrong[w.w].c}</span>` : ''}
    </li>`;
  }

  function renderWords(keepScroll) {
    renderTrackAndLevels();
    $$('#wordFilter button').forEach((b) => b.classList.toggle('on', b.dataset.f === DB.set.filter));
    renderProgress();
    const y = window.scrollY;
    listCache = filteredList();
    const showN = keepScroll ? Math.max(listShown, PAGE) : PAGE;
    listShown = Math.min(showN, listCache.length);
    $('#wordList').innerHTML = listCache.length
      ? listCache.slice(0, listShown).map(wordRow).join('')
      : `<li class="empty" style="display:block;cursor:default">${$('#wordSearch').value.trim() ? '검색 결과가 없습니다' : '해당하는 단어가 없습니다'}</li>`;
    updateMore();
    $('#startCards').disabled = !listCache.length;
    $('#startLevelQuiz').disabled = listCache.length < 4;
    if (keepScroll) window.scrollTo(0, y);
  }
  function updateMore() {
    $('#wordMore').textContent = listShown < listCache.length ? `${listShown} / ${listCache.length}개 · 아래로 내리면 더 보입니다` : listCache.length ? `${listCache.length}개` : '';
  }
  new IntersectionObserver((ents) => {
    if (!ents[0].isIntersecting || listShown >= listCache.length || curTab !== 'words') return;
    const add = listCache.slice(listShown, listShown + PAGE);
    listShown += add.length;
    $('#wordList').insertAdjacentHTML('beforeend', add.map(wordRow).join(''));
    updateMore();
  }, { rootMargin: '400px' }).observe($('#wordMore'));

  $('#wordList').onclick = (e) => {
    const li = e.target.closest('li[data-w]');
    if (li) openWord(li.dataset.w);
  };
  $('#startCards').onclick = () => startCards(listCache.slice());
  $('#startLevelQuiz').onclick = () => startQuiz({ pool: listCache.slice(), label: '단어장 목록' });

  /* ---------------- 단어 상세 ---------------- */
  function openWord(word) {
    const w = BY.get(word);
    if (!w) return;
    openLayer({
      title: '단어',
      cls: 'has-dock',
      render: (L) => {
        const draw = () => {
          const s = DB.st[w.w] || 0;
          const note = DB.wrong[w.w];
          const chars = [...w.w].filter(isHan);
          L.body.innerHTML = `
            <div class="hero">
              <div class="big-w zh">${esc(w.w)}</div>
              <div class="big-py">${esc(w.p)} <button class="ghost speak icon-btn" data-act="speak" aria-label="발음 듣기">${ic('sound')}</button></div>
              <div class="big-ko">${esc(w.k || '')}</div>
              ${!w.k && w.e ? `<div class="sub">${esc(w.e)}</div>` : ''}
            </div>
            <dl class="kv">
              ${w.t ? `<dt>번체</dt><dd class="zh">${esc(w.t)}</dd>` : ''}
              ${w.h ? `<dt>한자음</dt><dd>${esc(w.h)}</dd>` : ''}
              ${w.k && w.e ? `<dt>영어</dt><dd class="muted">${esc(w.e)}</dd>` : ''}
              ${w.c ? `<dt>양사</dt><dd class="zh">${esc([...w.c].join(', '))}</dd>` : ''}
              <dt>급수</dt><dd>${w.n ? `HSK 3.0 ${levelName('n', w.n)}` : ''}${w.n && w.o ? ' · ' : ''}${w.o ? `HSK 2.0 ${w.o}급` : ''}</dd>
              ${note ? `<dt>오답</dt><dd>${note.c}번 틀림 · ${note.ok ? '해결' : '복습 필요'}</dd>` : ''}
            </dl>
            ${chars.length ? `<h3>한 글자씩 쓰기 연습</h3>
            <div class="char-row">${chars
              .map((c) => `<button class="char-btn" data-act="write" data-c="${esc(c)}"><span class="c zh">${esc(c)}</span><span class="h">${esc(CHAR_HANJA(c))}</span></button>`)
              .join('')}</div>
            <button class="big" data-act="writeAll">${ic('write')} ‘${esc(w.w)}’ 전체 쓰기</button>` : ''}
            <div class="dock" role="toolbar" aria-label="단어 표시">
              <button class="dock-btn ${DB.star[w.w] ? 'on' : ''}" data-act="star" aria-pressed="${!!DB.star[w.w]}" aria-label="별표" title="별표">${ic(DB.star[w.w] ? 'starFill' : 'star')}</button>
              <button class="dock-btn" data-act="speak" aria-label="발음 듣기" title="발음 듣기">${ic('sound')}</button>
              <button class="dock-btn ${s === 2 ? 'on' : ''}" data-act="known" aria-pressed="${s === 2}" aria-label="외웠어요" title="외웠어요">${ic(s === 2 ? 'checkSquare' : 'square')}</button>
            </div>
          `;
        };
        draw();
        L.body.onclick = (e) => {
          const b = e.target.closest('[data-act]');
          if (!b) return;
          const a = b.dataset.act;
          if (a === 'speak') speak(w.w);
          if (a === 'star') {
            if (DB.star[w.w]) delete DB.star[w.w];
            else DB.star[w.w] = Date.now();
            save();
            draw();
            toast(DB.star[w.w] ? '별표 했어요' : '별표를 뺐어요');
          }
          if (a === 'known') {
            if (DB.st[w.w] === 2) delete DB.st[w.w];
            else DB.st[w.w] = 2;
            save();
            draw();
            toast(DB.st[w.w] === 2 ? '외운 단어로 표시했어요' : '외운 단어에서 뺐어요');
          }
          if (a === 'write') openWriting(w, [...w.w].filter(isHan).indexOf(b.dataset.c));
          if (a === 'writeAll') openWriting(w, 0);
        };
        if (DB.set.autoSpeak) speak(w.w);
      },
    });
  }
  let HANJA_ONE = null;
  const CHAR_HANJA = (c) => {
    if (!HANJA_ONE) {
      HANJA_ONE = new Map();
      for (const w of WORDS) if (w.h && [...w.w].length === 1) HANJA_ONE.set(w.w, w.h);
    }
    return HANJA_ONE.get(c) || '';
  };

  /* ---------------- 플래시카드 ---------------- */
  const CARD_BATCH = 20;
  function startCards(all) {
    if (!all.length) return;
    // 안 외운 단어 먼저, 20장씩
    all.sort((a, b) => (DB.st[a.w] === 2) - (DB.st[b.w] === 2));
    let from = 0;
    let list = all.slice(0, CARD_BATCH);
    let i = 0;
    let knew = 0;
    let missed = 0;
    openLayer({
      title: '카드로 외우기',
      render: (L) => {
        const show = () => {
          if (i >= list.length) {
            L.body.innerHTML = `<div class="result-score"><div class="muted">카드 끝</div><b>${knew}</b><div class="muted">알아요 ${knew} · 몰라요 ${missed}</div></div>
              <div class="actions" style="justify-content:center">${from + CARD_BATCH < all.length ? `<button class="primary" data-act="more">다음 ${Math.min(CARD_BATCH, all.length - from - CARD_BATCH)}장</button>` : ''}<button data-act="again">이 카드 다시</button><button data-act="close">닫기</button></div>`;
            return;
          }
          const w = list[i];
          L.body.innerHTML = `
            <div class="fc-progress">${i + 1} / ${list.length}${all.length > CARD_BATCH ? ` <span class="small">(전체 ${from + i + 1} / ${all.length})</span>` : ''}</div>
            <div class="flash" data-act="flip">
              <div class="big-w zh">${esc(w.w)}</div>
              <div class="back" hidden>
                <div class="big-py" style="color:var(--accent);font-size:20px">${esc(w.p)}</div>
                <div style="font-size:19px;margin-top:6px">${esc(meaning(w))}</div>
                ${w.h ? `<div class="muted small" style="margin-top:6px">한자음 ${esc(w.h)}</div>` : ''}
              </div>
              <div class="tap">탭해서 뜻 보기</div>
            </div>
            <div class="actions" style="justify-content:center"><button class="ghost" data-act="speak">${ic('sound')} 발음</button><button class="ghost" data-act="detail">자세히</button></div>
            <div class="fc-btns"><button class="no" data-act="no">몰라요</button><button class="yes" data-act="yes">알아요</button></div>`;
          if (DB.set.autoSpeak) speak(w.w);
        };
        show();
        L.body.onclick = (e) => {
          const b = e.target.closest('[data-act]');
          if (!b) return;
          const a = b.dataset.act;
          const w = list[i];
          if (a === 'flip') {
            const back = $('.back', L.body);
            back.hidden = !back.hidden;
            $('.tap', L.body).hidden = !back.hidden;
          } else if (a === 'speak') speak(w.w);
          else if (a === 'detail') openWord(w.w);
          else if (a === 'yes' || a === 'no') {
            DB.st[w.w] = a === 'yes' ? 2 : 1;
            a === 'yes' ? knew++ : missed++;
            save();
            i++;
            show();
          } else if (a === 'again') {
            i = knew = missed = 0;
            show();
          } else if (a === 'more') {
            from += CARD_BATCH;
            list = all.slice(from, from + CARD_BATCH);
            i = knew = missed = 0;
            show();
          } else if (a === 'close') closeTopLayer();
        };
      },
    });
  }

  /* ---------------- 쓰기 (Hanzi Writer) ---------------- */
  function writerColors() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    return {
      strokeColor: v('--fg'),
      radicalColor: null,
      outlineColor: isDark() ? '#3a3a40' : '#dedee3',
      drawingColor: v('--accent'),
      highlightColor: v('--accent'),
      highlightCompleteColor: v('--accent'),
    };
  }
  const gridSvg = (size) =>
    `<svg class="grid" width="${size}" height="${size}"><line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}"/><line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}"/><line x1="0" y1="0" x2="${size}" y2="${size}"/><line x1="${size}" y1="0" x2="0" y2="${size}"/></svg>`;
  const boxSize = () => Math.max(220, Math.min(340, window.innerWidth - 48, window.innerHeight - 380));

  // 획순 데이터: 글자 코드 % 16 으로 나눈 묶음 파일 (strokes/s00.json ~ s15.json)
  const packs = {};
  const strokePack = (c) => {
    const i = String(c.codePointAt(0) % 16).padStart(2, '0');
    if (!packs[i])
      packs[i] = fetch(`strokes/s${i}.json`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .catch((e) => {
          delete packs[i];
          throw e;
        });
    return packs[i];
  };

  // 쓰기 판 하나 만들기. opts: { char, outline, hint, onDone(mistakes), onMistake, onLoadError }
  function makeWriter(host, opts) {
    const size = boxSize();
    host.innerHTML = `<div class="write-box" style="width:${size + 4}px;height:${size + 4}px">${gridSvg(size)}<div class="hw" id="hw"></div></div>`;
    const target = $('.hw', host);
    const writer = HanziWriter.create(target, opts.char, {
      width: size,
      height: size,
      padding: 14,
      showCharacter: false,
      showOutline: !!opts.outline,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 120,
      drawingWidth: 26,
      showHintAfterMisses: +opts.hint || false,
      highlightOnComplete: true,
      ...writerColors(),
      charDataLoader: (c, ok, fail) =>
        strokePack(c)
          .then((pack) => (pack[c] ? ok(pack[c]) : fail(new Error('no data')))),
      onLoadCharDataError: () => opts.onLoadError && opts.onLoadError(),
    });
    return writer;
  }

  // 단어 상세에서 여는 쓰기 연습
  function openWriting(w, startIdx = 0) {
    const chars = [...w.w].filter(isHan);
    if (!chars.length) return;
    let idx = Math.max(0, startIdx);
    let mode = 'trace'; // trace 따라 쓰기(윤곽 보임) / free 혼자 쓰기
    let writer = null;
    let mistakes = 0;
    openLayer({
      title: '쓰기 연습',
      onClose: () => writer && writer.cancelQuiz && writer.cancelQuiz(),
      render: (L) => {
        L.body.innerHTML = `<div class="write-wrap">
          <div class="muted small" style="text-align:center">${esc(w.p)} · ${esc(meaning(w))}</div>
          <div class="write-chars" style="margin-top:8px"></div>
          <div class="pad"></div>
          <div class="write-status"></div>
          <div class="write-tools">
            <button data-act="mode" data-m="trace">따라 쓰기</button>
            <button data-act="mode" data-m="free">보지 않고 쓰기</button>
          </div>
          <div class="write-tools" style="margin-top:8px">
            <button data-act="anim">${ic('play')} 획순 보기</button>
            <button data-act="retry">${ic('redo')} 다시</button>
            <button data-act="speak" class="icon-btn" aria-label="발음 듣기">${ic('sound')}</button>
          </div></div>`;
        const status = (t, cls) => {
          const s = $('.write-status', L.body);
          s.textContent = t;
          s.style.color = cls === 'ok' ? 'var(--ok)' : cls === 'bad' ? 'var(--bad)' : '';
        };
        const start = () => {
          if (writer && writer.cancelQuiz) writer.cancelQuiz();
          mistakes = 0;
          $('.write-chars', L.body).innerHTML = chars.map((c, i) => `<span class="zh ${i === idx ? 'cur' : ''}" data-act="char" data-i="${i}">${esc(c)}</span>`).join('');
          $$('[data-act=mode]', L.body).forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
          status(mode === 'trace' ? '흐린 글자를 따라 획순대로 써 보세요' : '보지 않고 획순대로 써 보세요');
          writer = makeWriter($('.pad', L.body), {
            char: chars[idx],
            outline: mode === 'trace',
            hint: DB.set.hint,
            onLoadError: () => status('이 글자의 획순 데이터를 불러오지 못했습니다', 'bad'),
          });
          writer.quiz({
            onMistake: () => {
              mistakes++;
              status(`틀린 획 ${mistakes}개`, 'bad');
            },
            onCorrectStroke: (d) => status(`${d.strokeNum + 1} / ${d.strokeNum + 1 + d.strokesRemaining} 획${mistakes ? ` · 틀린 획 ${mistakes}개` : ''}`),
            onComplete: (d) => {
              const m = d.totalMistakes;
              status(m === 0 ? '완벽해요!' : `완성 · 틀린 획 ${m}개`, m === 0 ? 'ok' : 'bad');
              if (m >= 3) addWrong(w, 'write', `쓰기 ${chars[idx]} (틀린 획 ${m})`);
              if (idx < chars.length - 1) setTimeout(() => { if (writer && !document.contains(L.el)) return; idx++; start(); }, 1200);
            },
          });
        };
        start();
        L.body.onclick = (e) => {
          const b = e.target.closest('[data-act]');
          if (!b) return;
          const a = b.dataset.act;
          if (a === 'mode') {
            mode = b.dataset.m;
            start();
          } else if (a === 'retry') start();
          else if (a === 'speak') speak(chars[idx]);
          else if (a === 'anim') {
            writer.cancelQuiz();
            writer.showOutline();
            status('획순 보는 중…');
            writer.animateCharacter({ onComplete: () => setTimeout(start, 600) });
          } else if (a === 'char') {
            idx = +b.dataset.i;
            start();
          }
        };
      },
    });
  }

  /* ---------------- 오답노트 기록 ---------------- */
  function addWrong(w, type, answer) {
    const n = DB.wrong[w.w] || (DB.wrong[w.w] = { c: 0, s: 0, f: Date.now(), log: [] });
    n.c++;
    n.s = 0;
    n.ok = false;
    n.t = Date.now();
    n.log.unshift({ t: n.t, ty: type, a: answer || '' });
    n.log = n.log.slice(0, 5);
    if (DB.st[w.w] === 2) DB.st[w.w] = 1;
    save();
  }
  function markRight(w) {
    const n = DB.wrong[w.w];
    if (!n || n.ok) return false;
    n.s = (n.s || 0) + 1;
    if (n.s >= 2) {
      n.ok = true;
      n.done = Date.now();
      save();
      return true; // 이번에 해결됨
    }
    save();
    return false;
  }

  /* ---------------- 문제 ---------------- */
  const TYPE_NAME = { meaning: '뜻 고르기', word: '한자 고르기', pinyin: '병음 고르기', listen: '듣고 고르기', write: '직접 쓰기' };
  function scopePool(scope) {
    const lv = levelWords();
    if (scope === 'new') return lv.filter((w) => DB.st[w.w] !== 2);
    if (scope === 'star') return WORDS.filter((w) => DB.star[w.w]);
    if (scope === 'wrong') return WORDS.filter((w) => DB.wrong[w.w] && !DB.wrong[w.w].ok);
    return lv;
  }
  function renderQuizTab() {
    const s = DB.set;
    $('#quizScopeLabel').textContent = `선택한 급수: HSK ${s.track === 'n' ? '3.0' : '2.0'} ${levelName(s.track, s.level)} (단어장 탭에서 바꿀 수 있어요)`;
    $$('#quizScope button').forEach((b) => {
      b.classList.toggle('on', b.dataset.s === s.qScope);
      const n = scopePool(b.dataset.s).length;
      b.textContent = b.textContent.replace(/ \(\d+\)$/, '') + ` (${n})`;
    });
    $$('#quizTypes button').forEach((b) => b.classList.toggle('on', s.qTypes.includes(b.dataset.t)));
    $$('#quizCount button').forEach((b) => b.classList.toggle('on', +b.dataset.c === +s.qCount));
    const n = scopePool(s.qScope).length;
    $('#quizStart').disabled = n < 1 || !s.qTypes.length;
    $('#quizStartNote').textContent = !s.qTypes.length ? '문제 유형을 하나 이상 고르세요' : n < 1 ? '이 범위에는 단어가 없습니다' : '';
    const h = DB.hist.slice(0, 8);
    $('#quizHistory').innerHTML = h.length
      ? h.map((r) => `${fmtDate(r.t)} · ${esc(r.label || '')} · <b style="color:var(--fg)">${r.ok}/${r.n}</b>`).join('<br>')
      : '아직 기록이 없습니다';
  }
  $('#quizScope').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.qScope = b.dataset.s;
    save();
    renderQuizTab();
  };
  $('#quizTypes').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const t = b.dataset.t;
    const ts = DB.set.qTypes;
    DB.set.qTypes = ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t];
    save();
    renderQuizTab();
  };
  $('#quizCount').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.qCount = +b.dataset.c;
    save();
    renderQuizTab();
  };
  $('#quizStart').onclick = () => {
    const s = DB.set;
    const labels = { level: `HSK ${s.track === 'n' ? '3.0' : '2.0'} ${levelName(s.track, s.level)}`, new: '안 외운 단어', star: '별표', wrong: '오답노트' };
    startQuiz({ pool: scopePool(s.qScope), label: labels[s.qScope], review: s.qScope === 'wrong' });
  };

  // 보기(오답) 만들기
  function distractors(w, type, n = 3) {
    // 보기는 같은 급수(지금 고른 기준)에서, 한국어 뜻이 있는 단어로 (영어 보기가 섞이지 않게)
    const tr = w[DB.set.track] ? DB.set.track : w.n ? 'n' : 'o';
    const lv = w[tr];
    const hasKo = (x) => !w.k || x.k;
    let cand = WORDS.filter((x) => x[tr] === lv && x.w !== w.w && hasKo(x));
    if (cand.length < 30) cand = WORDS.filter((x) => x.w !== w.w && hasKo(x) && Math.abs((x[tr] || 9) - lv) <= 1);
    if (cand.length < 30) cand = WORDS.filter((x) => x.w !== w.w && hasKo(x));
    const key = type === 'pinyin' ? (x) => plain(x.p) + x.p : type === 'meaning' ? (x) => meaning(x) : (x) => x.w;
    const myKey = key(w);
    const out = [];
    const seen = new Set([myKey]);
    // 병음/한자 문제는 글자 수가 같은 단어를 먼저
    const sameLen = cand.filter((x) => [...x.w].length === [...w.w].length);
    const pools = type === 'meaning' ? [shuffle(cand.slice())] : [shuffle(sameLen), shuffle(cand.slice())];
    for (const pool of pools)
      for (const x of pool) {
        if (out.length >= n) break;
        const k = key(x);
        if (!k || seen.has(k)) continue;
        if (type === 'meaning' && meaning(w) && meaning(x).split(/[,;]\s*/)[0] === meaning(w).split(/[,;]\s*/)[0]) continue;
        seen.add(k);
        out.push(x);
      }
    return out;
  }
  const canWrite = (w) => [...w.w].every(isHan) && [...w.w].length <= 4;

  function buildQuestions(pool, types, count) {
    const picked = shuffle(pool.slice()).slice(0, count);
    return picked.map((w) => {
      let ts = types.filter((t) => t !== 'write' || canWrite(w));
      if (!ts.length) ts = ['meaning'];
      const type = ts[(Math.random() * ts.length) | 0];
      const q = { w, type };
      if (type !== 'write') q.opts = shuffle([w, ...distractors(w, type)]);
      return q;
    });
  }

  function startQuiz({ pool, label, review = false, types = DB.set.qTypes, count = DB.set.qCount }) {
    if (!pool.length) return toast('문제를 낼 단어가 없습니다');
    if (!types.length) types = ['meaning'];
    const n = Math.min(count, pool.length);
    const regen = () => buildQuestions(pool, types, n);
    runQuiz(regen(), label, review, regen);
  }

  // 문제 화면: 위 = 진행 상황, 가운데 = 큰 문제, 아래(엄지 위치) = 보기와 버튼
  const zhSize = (w) => {
    const n = [...w].length;
    return n <= 2 ? 96 : n === 3 ? 80 : n === 4 ? 64 : 48;
  };
  function runQuiz(qs, label, review, regen) {
    let i = 0;
    let results = [];
    let writer = null;
    let answered = false;
    openLayer({
      title: label || '문제',
      cls: 'quiz-layer',
      onClose: () => writer && writer.cancelQuiz && writer.cancelQuiz(),
      render: (L) => {
        const restart = (list) => {
          i = 0;
          results = [];
          qs = list;
          L.body.onclick = onAnswer;
          show();
        };
        const remake = (r) => {
          const q = { w: r.w, type: r.type };
          if (r.type !== 'write') q.opts = shuffle([r.w, ...distractors(r.w, r.type)]);
          return q;
        };

        const finish = () => {
          const ok = results.filter((r) => r.ok).length;
          const n = results.length;
          DB.hist.unshift({ t: Date.now(), n, ok, label });
          DB.hist = DB.hist.slice(0, 50);
          save();
          const wrongs = results.filter((r) => !r.ok);
          const solved = results.filter((r) => r.solved).length;
          const pct = n ? ok / n : 0;
          const C = 2 * Math.PI * 52;
          const msg = ok === n ? '전부 맞혔어요' : pct >= 0.8 ? '잘했어요' : pct >= 0.5 ? '조금만 더' : '틀린 단어부터 다시 봐요';
          const uniq = [...new Map(wrongs.map((r) => [r.w.w, r.w])).values()];
          L.body.innerHTML = `<div class="qz">
            <div class="qz-prompt result">
              <div class="ring">
                <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="ring-bg"/><circle cx="60" cy="60" r="52" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
                <div class="ring-num"><b>${ok}</b><span>/ ${n}</span></div>
              </div>
              <div class="result-msg">${msg}</div>
              <div class="result-stats"><span>정답 <b>${ok}</b></span><span>오답 <b>${wrongs.length}</b></span>${solved ? `<span>오답 해결 <b>${solved}</b></span>` : ''}</div>
              ${uniq.length ? `<div class="wrong-chips" aria-label="틀린 단어">${uniq.map((w) => `<button class="zh" data-w="${esc(w.w)}">${esc(w.w)}</button>`).join('')}</div><div class="muted small">틀린 단어는 오답노트에 담겼어요 · 누르면 단어 보기</div>` : ''}
            </div>
            <div class="qz-bottom">
              ${wrongs.length ? `<button class="primary big-btn" data-act="retryWrong">틀린 ${wrongs.length}문제 다시 풀기</button>` : ''}
              ${regen ? `<button class="${wrongs.length ? '' : 'primary '}big-btn" data-act="more">새 문제 ${qs.length}개 더 풀기</button>` : ''}
              <div class="row2"><button data-act="notes">${ic('notes')} 오답노트</button><button data-act="home">${ic('home')} 홈으로</button></div>
            </div></div>`;
          L.body.onclick = (e) => {
            const chip = e.target.closest('[data-w]');
            if (chip) return openWord(chip.dataset.w);
            const b = e.target.closest('[data-act]');
            if (!b) return;
            const a = b.dataset.act;
            if (a === 'retryWrong') restart(shuffle(wrongs.map(remake)));
            if (a === 'more') restart(regen());
            if (a === 'notes' || a === 'home') {
              closeTopLayer();
              setTimeout(() => goTab(a), 0);
            }
          };
        };

        const record = (q, ok, answer) => {
          answered = true;
          const r = { w: q.w, type: q.type, ok };
          if (ok) {
            r.solved = markRight(q.w);
            if (!DB.st[q.w.w]) DB.st[q.w.w] = 1;
          } else addWrong(q.w, q.type, answer);
          results.push(r);
          save();
          return r;
        };

        // 답한 뒤: 문제 아래에 짧은 결과 한 줄, 맨 아래 버튼은 [발음][단어][다음]
        const feedback = (q, r) => {
          $('.qz', L.body).classList.add('answered');
          const fb = $('.qz-fb', L.body);
          fb.className = 'qz-fb ' + (r.ok ? 'ok' : 'bad');
          fb.innerHTML = `<span class="fb-mark">${ic(r.ok ? 'check' : 'x')}</span><span class="fb-t"><b>${r.ok ? '정답' : '오답'}</b>${r.solved ? ' · 오답 해결' : ''}<span class="fb-ans"><span class="zh">${esc(q.w.w)}</span> <span class="py">${esc(q.w.p)}</span> ${esc(meaning(q.w))}</span></span>`;
          $('.qz-actions', L.body).innerHTML = `<button data-act="speakAns" class="icon-btn sq" aria-label="발음 듣기">${ic('sound')}</button><button data-act="detail">단어 보기</button><button class="primary grow" data-act="next">${i + 1 >= qs.length ? '결과 보기' : '다음 ' + ic('chevronRight')}</button>`;
          $('[data-act=next]', L.body).focus({ preventScroll: true });
        };

        const head = (q) =>
          `<div class="qz-top"><div class="q-progress"><i style="width:${(i / qs.length) * 100}%"></i></div><div class="q-kind"><span>${TYPE_NAME[q.type]}</span><span>${i + 1} / ${qs.length}</span></div></div>`;

        const show = () => {
          if (writer && writer.cancelQuiz) writer.cancelQuiz();
          writer = null;
          answered = false;
          if (i >= qs.length) return finish();
          const q = qs[i];
          const w = q.w;
          if (q.type === 'write') return showWrite(q);
          let prompt = '';
          const big = `<div class="qz-zh zh" style="font-size:${zhSize(w.w)}px">${esc(w.w)}</div>`;
          if (q.type === 'meaning') prompt = `${big}<div class="qz-ask">이 단어의 뜻은?</div>`;
          if (q.type === 'word') prompt = `<div class="qz-ko">${esc(meaning(w))}</div><div class="qz-ask">알맞은 한자는?</div>`;
          if (q.type === 'pinyin') prompt = `${big}<div class="qz-ask">알맞은 병음은?</div>`;
          if (q.type === 'listen') prompt = `<button class="listen" data-act="speakQ" aria-label="다시 듣기">${ic('sound')}</button><div class="qz-ask">듣고 알맞은 단어를 고르세요</div>`;
          const zhOpts = q.type === 'word' || q.type === 'listen';
          const label = (o) => (q.type === 'meaning' ? esc(meaning(o)) : q.type === 'pinyin' ? esc(o.p) : esc(o.w));
          L.body.innerHTML = `<div class="qz">${head(q)}
            <div class="qz-prompt">${prompt}</div>
            <div class="qz-fb"></div>
            <div class="qz-bottom">
              <div class="opts ${zhOpts ? 'grid2' : ''}">${q.opts.map((o, k) => `<button data-k="${k}" class="${zhOpts ? 'zh zh-opt' : ''}">${label(o)}</button>`).join('')}</div>
              <div class="qz-actions"><button class="ghost" data-act="idk">모르겠어요</button></div>
            </div></div>`;
          if (q.type === 'listen' || (DB.set.autoSpeak && q.type !== 'word' && q.type !== 'pinyin')) setTimeout(() => speak(w.w), 150);
        };

        const showWrite = (q) => {
          const w = q.w;
          const chars = [...w.w];
          let ci = 0;
          let worst = 0;
          let total = 0;
          L.body.innerHTML = `<div class="qz">${head(q)}
            <div class="qz-prompt write"><div class="qz-ko">${esc(meaning(w))}</div><div class="qz-py">${esc(w.p)} <button class="ghost icon-btn" data-act="speakQ" aria-label="발음 듣기">${ic('sound')}</button></div></div>
            <div class="write-wrap"><div class="write-chars"></div><div class="pad"></div><div class="write-status muted"></div></div>
            <div class="qz-fb"></div>
            <div class="qz-bottom"><div class="qz-actions"><button class="ghost" data-act="idk">모르겠어요 (정답 보기)</button></div></div></div>`;
          const status = (t, c) => {
            const s = $('.write-status', L.body);
            s.textContent = t;
            s.style.color = c === 'bad' ? 'var(--bad)' : c === 'ok' ? 'var(--ok)' : '';
          };
          const drawChars = () =>
            ($('.write-chars', L.body).innerHTML = chars
              .map((c, k) => `<span class="zh ${k < ci ? 'done' : k === ci ? 'cur blank' : 'blank'}">${k < ci ? esc(c) : '□'}</span>`)
              .join(''));
          const next = () => {
            drawChars();
            if (ci >= chars.length) {
              const ok = worst < 3;
              const r = record(q, ok, `쓰기 (틀린 획 ${total})`);
              status(ok ? (total ? `완성 · 틀린 획 ${total}개` : '완벽해요!') : `틀린 획이 많아요 (${total}개)`, ok ? 'ok' : 'bad');
              feedback(q, r);
              return;
            }
            let m = 0;
            status(`${ci + 1}번째 글자를 쓰세요${chars.length > 1 ? ` (${chars.length}글자)` : ''}`);
            writer = makeWriter($('.pad', L.body), {
              char: chars[ci],
              outline: false,
              hint: DB.set.hint,
              onLoadError: () => status('이 글자의 획순 데이터를 불러오지 못했습니다', 'bad'),
            });
            writer.quiz({
              onMistake: () => {
                m++;
                status(`틀린 획 ${m}개`, 'bad');
              },
              onComplete: (d) => {
                worst = Math.max(worst, d.totalMistakes);
                total += d.totalMistakes;
                ci++;
                setTimeout(next, 450);
              },
            });
          };
          next();
          if (DB.set.autoSpeak) setTimeout(() => speak(w.w), 150);
        };

        const onAnswer = (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          const q = qs[i];
          if (!q) return;
          const act = b.dataset.act;
          if (act === 'speakQ' || act === 'speakAns') return speak(q.w.w);
          if (act === 'detail') return openWord(q.w.w);
          if (act === 'next') {
            i++;
            return show();
          }
          if (answered) return;
          if (act === 'idk') {
            if (q.type === 'write') {
              if (writer && writer.cancelQuiz) writer.cancelQuiz();
              const r = record(q, false, '쓰기 (모름)');
              $('.write-chars', L.body).innerHTML = [...q.w.w].map((c) => `<span class="zh miss">${esc(c)}</span>`).join('');
              if (writer) {
                writer.showOutline();
                writer.animateCharacter();
              }
              $('.write-status', L.body).textContent = '획순을 보여 드릴게요';
              return feedback(q, r);
            }
            const r = record(q, false, '모르겠어요');
            $$('.opts button', L.body).forEach((x) => {
              x.disabled = true;
              if (q.opts[+x.dataset.k] === q.w) x.classList.add('right');
            });
            return feedback(q, r);
          }
          if (b.dataset.k != null) {
            const o = q.opts[+b.dataset.k];
            const ok = o === q.w;
            const mine = q.type === 'meaning' ? meaning(o) : q.type === 'pinyin' ? o.p : o.w;
            const r = record(q, ok, `${mine}${q.type === 'meaning' || q.type === 'pinyin' ? '' : ` (${o.p})`}`);
            $$('.opts button', L.body).forEach((x) => {
              x.disabled = true;
              if (q.opts[+x.dataset.k] === q.w) x.classList.add('right');
            });
            if (!ok) b.classList.add('wrong');
            if (q.type !== 'listen') speak(q.w.w);
            feedback(q, r);
          }
        };
        L.body.onclick = onAnswer;
        show();
      },
    });
  }

  /* ---------------- 오답노트 ---------------- */
  function updateBadge() {
    const n = Object.values(DB.wrong).filter((x) => !x.ok).length;
    const b = $('#noteBadge');
    b.hidden = !n;
    b.textContent = n > 99 ? '99+' : n;
  }
  function renderNotes() {
    const all = Object.entries(DB.wrong).map(([w, n]) => ({ w: BY.get(w), n })).filter((x) => x.w);
    const open = all.filter((x) => !x.n.ok);
    const done = all.filter((x) => x.n.ok);
    const todayN = all.filter((x) => x.n.t && new Date(x.n.t).toDateString() === new Date().toDateString()).length;
    $('#noteSummary').innerHTML = `<div><b>${open.length}</b><span>복습 필요</span></div><div><b>${done.length}</b><span>해결</span></div><div><b>${todayN}</b><span>오늘 틀림</span></div>`;
    const f = DB.set.noteFilter;
    $$('#noteFilter button').forEach((b) => b.classList.toggle('on', b.dataset.f === f));
    $('#noteSort').value = DB.set.noteSort;
    let list = f === 'done' ? done : open;
    const so = DB.set.noteSort;
    list.sort((a, b) =>
      so === 'count' ? b.n.c - a.n.c || b.n.t - a.n.t : so === 'level' ? (a.w.n || 9) - (b.w.n || 9) || b.n.t - a.n.t : (f === 'done' ? (b.n.done || 0) - (a.n.done || 0) : b.n.t - a.n.t),
    );
    $('#noteReview').disabled = !open.length;
    $('#noteWrite').disabled = !open.some((x) => canWrite(x.w));
    $('#noteList').innerHTML = list.length
      ? list
          .map(({ w, n }) => {
            const last = n.log && n.log[0];
            return `<li data-w="${esc(w.w)}">
              <span class="w zh">${esc(w.w)}</span>
              <span class="info">
                <div><span style="color:var(--accent)">${esc(w.p)}</span> · ${esc(meaning(w))}</div>
                ${last && last.a ? `<div class="mine">내 답: ${esc(last.a)} <span class="tag">${TYPE_NAME[last.ty] || ''}</span></div>` : ''}
                <div class="meta">${fmtDate(n.t)} 틀림${n.ok ? ` · ${fmtDate(n.done || n.t)} 해결` : n.s ? ` · 연속 정답 ${n.s}/2` : ''}${w.n ? ` · ${levelName('n', w.n)}` : ''}</div>
                ${n.m ? `<div class="memo">${esc(n.m)}</div>` : ''}
              </span>
              <span class="cnt ${n.ok ? 'ok' : ''}">${n.ok ? '해결' : ic('x') + n.c}</span>
            </li>`;
          })
          .join('')
      : `<li class="empty" style="display:block;cursor:default">${f === 'done' ? '아직 해결한 오답이 없습니다' : '복습할 오답이 없습니다'}</li>`;
    updateBadge();
  }
  $('#noteFilter').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.noteFilter = b.dataset.f;
    save();
    renderNotes();
  };
  $('#noteSort').onchange = (e) => {
    DB.set.noteSort = e.target.value;
    save();
    renderNotes();
  };
  const openWrongWords = () => Object.keys(DB.wrong).filter((w) => !DB.wrong[w].ok).map((w) => BY.get(w)).filter(Boolean);
  $('#noteReview').onclick = () => {
    const pool = openWrongWords();
    // 틀렸던 유형으로 다시 (쓰기 제외), 없으면 기본 유형
    startQuiz({ pool, label: '오답 다시 풀기', review: true, types: ['meaning', 'word', 'pinyin', 'listen'], count: Math.min(20, pool.length) });
  };
  $('#noteWrite').onclick = () => {
    const pool = openWrongWords().filter(canWrite);
    startQuiz({ pool, label: '오답 쓰기', review: true, types: ['write'], count: Math.min(10, pool.length) });
  };
  $('#noteList').onclick = (e) => {
    const li = e.target.closest('li[data-w]');
    if (li) openNote(li.dataset.w);
  };
  function openNote(word) {
    const w = BY.get(word);
    const n = DB.wrong[word];
    if (!w || !n) return;
    openLayer({
      title: '오답 노트',
      render: (L) => {
        L.body.innerHTML = `
          <div class="hero"><div class="big-w zh">${esc(w.w)}</div><div class="big-py">${esc(w.p)} <button class="ghost speak icon-btn" data-act="speak" aria-label="발음 듣기">${ic('sound')}</button></div><div class="big-ko">${esc(meaning(w))}</div>
          ${w.h ? `<div class="sub">한자음 ${esc(w.h)}</div>` : ''}</div>
          <dl class="kv">
            <dt>틀린 횟수</dt><dd>${n.c}번 ${n.ok ? '<span class="cnt ok">해결</span>' : `<span class="muted small">연속 정답 ${n.s || 0}/2</span>`}</dd>
            <dt>처음</dt><dd>${new Date(n.f).toLocaleDateString('ko-KR')}</dd>
          </dl>
          <h3>틀린 기록</h3>
          <ul class="result-list">${(n.log || [])
            .map((l) => `<li><span class="mark x">X</span><span class="info small">${fmtDate(l.t)} · ${TYPE_NAME[l.ty] || ''}<div class="mine" style="color:var(--bad)">${esc(l.a)}</div></span></li>`)
            .join('')}</ul>
          <h3>메모</h3>
          <textarea class="memo-box" placeholder="헷갈린 이유, 비슷한 단어, 외우는 요령 등을 적어 두세요">${esc(n.m || '')}</textarea>
          <div class="actions">
            <button class="primary" data-act="quiz">이 단어 다시 풀기</button>
            ${canWrite(w) ? '<button data-act="write">쓰기 연습</button>' : ''}
            <button data-act="detail">단어 보기</button>
          </div>
          <div class="actions">
            ${n.ok ? '<button data-act="reopen">다시 복습 필요로</button>' : '<button data-act="solve">해결로 표시</button>'}
            <button class="danger" data-act="del">오답노트에서 지우기</button>
          </div>`;
        const ta = $('textarea', L.body);
        ta.addEventListener('input', () => {
          n.m = ta.value.trim() ? ta.value : undefined;
          save();
        });
        L.body.onclick = (e) => {
          const b = e.target.closest('[data-act]');
          if (!b) return;
          const a = b.dataset.act;
          if (a === 'speak') speak(w.w);
          if (a === 'detail') openWord(w.w);
          if (a === 'write') openWriting(w, 0);
          if (a === 'quiz') {
            const types = canWrite(w) ? ['meaning', 'word', 'pinyin', 'listen', 'write'] : ['meaning', 'word', 'pinyin', 'listen'];
            runQuiz(
              shuffle(types).slice(0, 3).map((type) => {
                const q = { w, type };
                if (type !== 'write') q.opts = shuffle([w, ...distractors(w, type)]);
                return q;
              }),
              '오답: ' + w.w,
              true,
            );
          }
          if (a === 'solve' || a === 'reopen') {
            n.ok = a === 'solve';
            n.s = n.ok ? 2 : 0;
            if (n.ok) n.done = Date.now();
            save();
            closeTopLayer();
          }
          if (a === 'del')
            ask(`‘${w.w}’를 오답노트에서 지울까요?`, '지우기', true).then((ok) => {
              if (!ok) return;
              delete DB.wrong[word];
              save();
              closeTopLayer();
            });
        };
      },
    });
  }

  /* ---------------- 설정 ---------------- */
  function renderSettings() {
    const s = DB.set;
    $('#setTheme').value = s.theme;
    $('#setRate').value = s.rate;
    $('#setAutoSpeak').checked = !!s.autoSpeak;
    $('#setHint').value = s.hint;
    $('#setShowPy').checked = !!s.showPy;
    $('#setShowKo').checked = !!s.showKo;
    const cov = [1, 2, 3, 4, 5, 6, 7].map((lv) => {
      const ws = WORDS.filter((w) => w.n === lv);
      return `${levelName('n', lv)} ${Math.round((ws.filter((w) => w.k).length / (ws.length || 1)) * 100)}%`;
    });
    $('#koCoverage').textContent = '한국어 뜻 (HSK 3.0): ' + cov.join(' · ');
    $('#appVersion').textContent = '버전 ' + APP_VERSION;
  }
  const bindSet = (id, key, conv = (v) => v, after) =>
    ($(id).onchange = (e) => {
      DB.set[key] = conv(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
      save();
      after && after();
    });
  bindSet('#setTheme', 'theme', undefined, applyTheme);
  bindSet('#setRate', 'rate', undefined, () => speak('你好'));
  bindSet('#setAutoSpeak', 'autoSpeak');
  bindSet('#setHint', 'hint');
  bindSet('#setShowPy', 'showPy');
  bindSet('#setShowKo', 'showKo');

  const backupText = () => JSON.stringify({ app: 'hsk-study', v: 1, at: new Date().toISOString(), data: DB });
  async function restoreFrom(text) {
    try {
      const j = JSON.parse(text);
      const d = j && j.app === 'hsk-study' ? j.data : null;
      if (!d || typeof d !== 'object' || !d.set) throw new Error('이 앱의 백업 내용이 아닙니다');
      if (!(await ask('지금 기록을 백업 내용으로 바꿀까요?', '바꾸기'))) return false;
      DB = d;
      for (const k of Object.keys(DEFAULTS)) if (DB[k] == null) DB[k] = structuredClone(DEFAULTS[k]);
      DB.set = { ...DEFAULTS.set, ...DB.set };
      save();
      applyTheme();
      renderSettings();
      updateBadge();
      toast('백업을 불러왔습니다');
      return true;
    } catch (err) {
      toast('불러오기 실패: ' + err.message);
      return false;
    }
  }
  $('#backupExport').onclick = () =>
    openLayer({
      title: '백업',
      render: (L) => {
        L.body.innerHTML = `<p class="muted small">아래 글을 통째로 복사해서 메모 앱 등에 보관하세요. 나중에 ‘백업 불러오기’에 붙여 넣으면 기록이 돌아옵니다.</p>
          <textarea id="backupOut" class="memo-box" style="min-height:180px;font-size:12px" readonly></textarea>
          <div class="actions"><button class="primary" data-act="copy">복사하기</button>${IN_FRAME ? '' : '<button data-act="file">파일로 저장</button>'}</div>`;
        const ta = $('textarea', L.body);
        ta.value = backupText();
        L.body.onclick = async (e) => {
          const b = e.target.closest('[data-act]');
          if (!b) return;
          if (b.dataset.act === 'copy') {
            try {
              await navigator.clipboard.writeText(ta.value);
              toast('복사했습니다');
            } catch {
              ta.focus();
              ta.select();
              toast('글이 선택됐어요. 길게 눌러 복사하세요');
            }
          }
          if (b.dataset.act === 'file') {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([ta.value], { type: 'application/json' }));
            a.download = `hsk-단어장-백업-${today()}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 1000);
          }
        };
      },
    });
  $('#backupImport').onclick = () =>
    openLayer({
      title: '백업 불러오기',
      render: (L) => {
        L.body.innerHTML = `<p class="muted small">복사해 둔 백업 글을 붙여 넣거나, 백업 파일을 고르세요.</p>
          <textarea id="backupIn" class="memo-box" style="min-height:180px;font-size:12px" placeholder="여기에 붙여 넣기"></textarea>
          <div class="actions"><button class="primary" data-act="load">불러오기</button><button data-act="file">파일 고르기</button></div>`;
        L.body.onclick = async (e) => {
          const b = e.target.closest('[data-act]');
          if (!b) return;
          if (b.dataset.act === 'file') $('#backupFile').click();
          if (b.dataset.act === 'load' && (await restoreFrom($('textarea', L.body).value))) closeTopLayer();
        };
      },
    });
  $('#backupFile').onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f && (await restoreFrom(await f.text())) && stack.length) closeTopLayer();
  };
  $('#resetAll').onclick = async () => {
    if (!(await ask('외운 단어, 별표, 오답노트, 문제 기록을 모두 지울까요? 되돌릴 수 없습니다.', '모두 지우기', true))) return;
    const keepSet = DB.set;
    DB = structuredClone(DEFAULTS);
    DB.set = keepSet;
    save();
    updateBadge();
    toast('기록을 모두 지웠습니다');
  };

  /* ---------------- 시작 ---------------- */
  async function boot() {
    $('#wordList').innerHTML = '<li class="empty" style="display:block">단어를 불러오는 중…</li>';
    try {
      const r = await fetch('data/words.json');
      WORDS = await r.json();
    } catch (e) {
      $('#wordList').innerHTML = '<li class="empty" style="display:block">단어 데이터를 불러오지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.</li>';
      return;
    }
    for (const w of WORDS) BY.set(w.w, w);
    if (!IN_FRAME) history.replaceState({ layer: 0 }, '', '#home');
    showTab('home');
    updateBadge();
  }
  boot();

  // 업데이트: 앱을 다시 볼 때마다 새 버전을 확인하고, 새 버전이 적용되면 화면을 한 번 새로 고침
  if (!IN_FRAME && 'serviceWorker' in navigator && window.isSecureContext) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded || stack.length) return; // 문제 푸는 중에는 새로 고치지 않음
      reloaded = true;
      location.reload();
    });
    navigator.serviceWorker
      .register('sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        const check = () => reg.update().catch(() => {});
        document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check());
        setInterval(check, 30 * 60 * 1000);
      })
      .catch(() => {});
  }
})();
