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
    circle: '<circle cx="12" cy="12" r="8"/>',
    brush: '<path d="M20 4l-8.2 8.2"/><path d="M13.6 10.4l-2-2"/><path d="M10.6 13.4c-1.6-1.4-4-1-4.8 1-.6 1.6-.5 3.4-2.3 4.6 3 .8 6.2.3 7.6-1.6.9-1.3.8-2.9-.5-4z"/>',
    brushFill: '<path d="M20 4l-8.2 8.2"/><path d="M13.6 10.4l-2-2"/><path d="M10.6 13.4c-1.6-1.4-4-1-4.8 1-.6 1.6-.5 3.4-2.3 4.6 3 .8 6.2.3 7.6-1.6.9-1.3.8-2.9-.5-4z" fill="currentColor"/>',
    layers: '<path d="M12 4l8.5 4.3L12 12.6 3.5 8.3z"/><path d="M3.5 12.2L12 16.5l8.5-4.3"/><path d="M3.5 16L12 20.3 20.5 16"/>',
    blocks: '<rect x="3.5" y="5" width="7" height="5.5" rx="1.5"/><rect x="13.5" y="5" width="7" height="5.5" rx="1.5"/><rect x="7" y="13.5" width="10" height="5.5" rx="1.5"/>',
    wave: '<path d="M3 15c2.5 0 2.5-6 5-6s2.5 6 5 6 2.5-6 5-6 2.5 6 3 6"/>',
    keyboard: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M8 14h8"/>',
    chat: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5V16.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"/><path d="M8 10h8M8 13h5"/>',
    snail: '<path d="M3.5 18h12.5a4 4 0 0 0 4-4V9.5"/><circle cx="10.5" cy="12" r="5"/><path d="M10.5 12a1.8 1.8 0 1 0 1.8-1.8"/><path d="M20 9.5l1.2-3M18.4 9.5l-.8-3"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    circleCheck: '<circle cx="12" cy="12" r="8.5" fill="currentColor"/><path d="M8.3 12.3l2.6 2.6 4.8-5.2" stroke="var(--panel)" stroke-width="2.2"/>',
  };
  const ic = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
  document.querySelectorAll('[data-ic]').forEach((el) => (el.innerHTML = ic(el.dataset.ic)));

  const APP_VERSION = '2026-11-17-0336'; // tools/bump.js 가 sw.js 와 함께 올림

  // 화면(HTML)과 앱 파일 버전이 다르면(예전 저장본이 섞이면) 저장본을 비우고 한 번 새로 고침
  (() => {
    const m = document.querySelector('meta[name=app-version]');
    if (!m || m.content === APP_VERSION || IN_FRAME) return;
    let tried = false;
    try {
      tried = sessionStorage.getItem('vfix') === m.content;
      sessionStorage.setItem('vfix', m.content);
    } catch {}
    if (tried) return;
    Promise.resolve(window.caches ? caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('hsk-app')).map((k) => caches.delete(k)))) : 0)
      .catch(() => {})
      .then(() => location.reload());
  })();

  /* ---------------- 저장 ---------------- */
  const KEY = 'hsk-study-v1';
  const DEFAULTS = {
    set: { track: 'n', level: 1, unit: 0, goal: 20, theme: 'system', rate: '0.8', autoSpeak: true, hint: '3', showPy: true, showKo: true,
      filter: 'all', qScope: 'level', qTypes: ['meaning', 'word', 'pinyin'], qCount: 10, noteFilter: 'open', noteSort: 'recent' },
    st: {}, // 단어 상태: 1 학습 중(모름), 2 외움
    star: {},
    wrong: {}, // 오답노트: { c 틀린 횟수, s 연속 정답, t 마지막 오답, f 처음, ok 해결, log:[{t,ty,a}], m 메모 }
    hist: [], // 문제 기록 [{t, n, ok, scope}]
    sent: {}, // 예문을 마지막으로 본 시각 { 문장: ts }
    wr: {}, // 쓰기 상태 { 단어: { ok: 쓸 수 있음, s: 안 보고 쓰기 연속 통과 } } — '외움'과 별개
    wwrong: {}, // 쓰기 오답노트 (단어 오답노트 DB.wrong 과 별개, 모양은 같음)
    srs: {}, // 간격 반복 { 단어: { r: {b 단계, due 다음 복습}, w: {...} } } — r 뜻(외움), w 쓰기
    daily: {}, // 날짜별 푼 개수 { '2026-11-16': 23 }
    gram: {}, // 문법 { id: { v 본 시각, ok 맞힌 수, x 틀린 수 } }
  };
  let DB;
  try {
    DB = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {}
  if (!DB || typeof DB !== 'object') DB = {};
  for (const k of Object.keys(DEFAULTS)) if (DB[k] == null) DB[k] = structuredClone(DEFAULTS[k]);
  DB.set = { ...DEFAULTS.set, ...DB.set };
  if (DB.set.qScope === 'new') DB.set.qScope = 'level'; // 예전 '안 외운 단어' 범위 → 지금의 기본 범위
  DB.set.qTypes = (DB.set.qTypes || []).filter((t) => t !== 'trzh' && t !== 'trko'); // 작문·번역은 홈의 별도 메뉴로 옮김
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
  function speak(text, rate) {
    if (!('speechSynthesis' in window)) return toast('이 브라우저는 발음 듣기를 지원하지 않습니다');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    if (zhVoice) u.voice = zhVoice;
    u.rate = rate || +DB.set.rate || 0.8;
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
  let SENTS = []; // 예문 [{z:[단어], p:[병음], k:한국어, n, o}]
  let GRAM = []; // 문법 [{id, lv, t 제목, f 문형, d 설명, ex:[예문], q:[빈칸 문제]}]
  const BY = new Map();
  const levelOf = (w, track = DB.set.track) => w[track] || 0;
  const levelName = (track, lv) => (track === 'n' && lv === 7 ? '7–9급' : lv + '급');
  const meaning = (w) => w.k || w.e || '';
  const levelWords = (track = DB.set.track, lv = DB.set.level) => WORDS.filter((w) => w[track] === lv);
  // 단원: 급수 안을 자주 쓰는 순서대로 20단어씩 (HSK 교재처럼 작은 단위로 진도)
  const UNIT = 20;
  const unitCount = (track = DB.set.track, lv = DB.set.level) => Math.ceil(levelWords(track, lv).length / UNIT);
  const scopeWords = () => {
    const ws = levelWords();
    const u = DB.set.unit || 0;
    return u ? ws.slice((u - 1) * UNIT, u * UNIT) : ws;
  };
  const scopeName = () => `HSK ${DB.set.track === 'n' ? '3.0' : '2.0'} ${levelName(DB.set.track, DB.set.level)}${DB.set.unit ? ` · ${DB.set.unit}과` : ''}`;

  /* ---------------- 탭 ---------------- */
  let curTab = 'home';
  function showTab(name) {
    if (!['home', 'words', 'grammar', 'quiz', 'notes', 'settings'].includes(name)) name = 'home';
    curTab = name;
    $$('main > section').forEach((s) => (s.hidden = s.dataset.tab !== name));
    const TITLE = { home: 'HSK 단어장', words: '단어장', grammar: '문법', quiz: '문제', notes: '오답노트', settings: '설정' };
    $('.logo').textContent = TITLE[name];
    $('#homeBtn').hidden = name === 'home';
    if (name === 'home') renderHome();
    if (name === 'words') renderWords();
    if (name === 'grammar') renderGrammar();
    if (name === 'quiz') renderQuizTab();
    if (name === 'notes') renderNotes();
    if (name === 'settings') renderSettings();
    window.scrollTo(0, 0);
  }
  $('#homeBtn').onclick = () => goTab('home');

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

  // 화면 왼쪽 가장자리에서 오른쪽으로 밀면 뒤로 (홈 화면 앱은 Safari 의 뒤로 가기 제스처가 없음)
  (() => {
    const EDGE = 30;
    let g = null;
    document.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        if (t.clientX > EDGE) return;
        if (e.target.closest('.write-box, .modal, input, textarea, select')) return;
        const layer = stack.length ? stack[stack.length - 1].el : null;
        if (!layer && curTab === 'home') return;
        g = { x: t.clientX, y: t.clientY, t: Date.now(), el: layer || $('#main'), layer: !!layer, on: false, dx: 0 };
      },
      { passive: true },
    );
    document.addEventListener(
      'touchmove',
      (e) => {
        if (!g) return;
        const t = e.touches[0];
        const dx = t.clientX - g.x;
        const dy = t.clientY - g.y;
        if (!g.on) {
          if (Math.abs(dy) > 12 && Math.abs(dy) > dx) return (g = null); // 세로 스크롤이면 포기
          if (dx < 10) return;
          g.on = true;
          g.el.style.transition = 'none';
        }
        e.preventDefault();
        g.dx = Math.max(0, dx);
        g.el.style.transform = `translateX(${g.dx}px)`;
        g.el.style.boxShadow = '-8px 0 24px rgba(0,0,0,.12)';
      },
      { passive: false },
    );
    const end = () => {
      if (!g) return;
      const { el, dx, on, layer } = g;
      const fast = dx / Math.max(1, Date.now() - g.t) > 0.5;
      g = null;
      if (!on) return;
      const go = dx > window.innerWidth * 0.33 || (fast && dx > 40);
      el.style.transition = 'transform .2s ease-out';
      el.style.transform = go ? 'translateX(100%)' : '';
      setTimeout(() => {
        el.style.transition = '';
        el.style.boxShadow = '';
        if (go) {
          if (layer) closeTopLayer();
          else goTab('home');
          if (!layer) el.style.transform = '';
        } else el.style.transform = '';
      }, 200);
    };
    document.addEventListener('touchend', end, { passive: true });
    document.addEventListener('touchcancel', end, { passive: true });
  })();

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
    if (curTab === 'grammar') renderGrammar();
    if (curTab === 'words') renderWords(true);
    if (curTab === 'quiz') renderQuizTab();
    if (curTab === 'notes') renderNotes();
  }

  /* ---------------- 홈 메뉴 ---------------- */
  function goTab(name) {
    if (!IN_FRAME) history.replaceState(history.state, '', '#' + name);
    showTab(name);
  }
  function levelCard() {
    const ws = scopeWords();
    const known = ws.filter((w) => DB.st[w.w] === 2).length;
    const pct = ws.length ? Math.round((known / ws.length) * 100) : 0;
    return `<button class="home-level" data-go="level">
        <span class="hl-top"><span>HSK ${DB.set.track === 'n' ? '3.0' : '2.0'}</span><b>${levelName(DB.set.track, DB.set.level)}${DB.set.unit ? ` <small>${DB.set.unit}과</small>` : ''}</b><span class="hl-change">바꾸기 ${ic('chevronRight')}</span></span>
        <span class="hl-num"><b>${known}</b> / ${ws.length} 외움 · 쓰기 ${ws.filter(canWriteW).length} <span>${pct}%</span></span>
        <span class="pbar"><i style="width:${pct}%"></i></span>
      </button>`;
  }
  function todayCard() {
    const goal = +DB.set.goal || 20;
    const done = DB.daily[today()] || 0;
    const st = streak();
    const dr = dueWords('r').length;
    const dw = dueWords('w').length;
    const pct = Math.min(1, done / goal);
    const C = 2 * Math.PI * 22;
    return `<div class="today-card">
        <div class="today-top">
          <div class="mini-ring"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22" class="ring-bg"/><circle cx="26" cy="26" r="22" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg><span>${done >= goal ? ic('check') : done}</span></div>
          <div class="today-txt"><b>오늘 ${done} / ${goal}</b><span>${st ? `${st}일 연속 목표 달성` : '오늘 목표를 채워 연속 기록을 시작하세요'}</span></div>
        </div>
        <div class="qmain-btns">
          <button class="${dr ? 'primary' : ''}" data-go="dueR" ${dr ? '' : 'disabled'}>오늘 복습 · 단어 <b>${dr}</b></button>
          <button class="${dw ? 'primary' : ''}" data-go="dueW" ${dw ? '' : 'disabled'}>오늘 복습 · 쓰기 <b>${dw}</b></button>
        </div>
      </div>`;
  }
  const startDueR = () => startQuiz({ pool: () => dueWords('r'), label: '오늘 복습 · 단어', count: 20 });
  const startDueW = () => startQuiz({ pool: () => dueWords('w'), label: '오늘 복습 · 쓰기', types: ['write'], count: 20, guided: false });
  function renderHome() {
    const s = DB.set;
    const ws = levelWords();
    const known = ws.filter((w) => DB.st[w.w] === 2).length;
    const left = ws.length - known;
    const wrong = Object.values(DB.wrong).filter((x) => !x.ok).length + Object.values(DB.wwrong).filter((x) => !x.ok).length;
    const favs = Object.keys(DB.star).length;
    const pct = ws.length ? Math.round((known / ws.length) * 100) : 0;
    const tile = (go, icon, title, sub) =>
      `<button class="tile" data-go="${go}"><span class="tile-ic">${ic(icon)}</span><span class="tile-t">${title}</span><span class="tile-s">${sub}</span></button>`;
    $('#homeBox').innerHTML = `
      ${todayCard()}
      ${levelCard()}
      <div class="tiles">
        ${tile('words', 'book', '단어장', `${ws.length}단어${favs ? ` · 즐겨찾기 ${favs}` : ''}`)}
        ${tile('grammar', 'layers', '문법', `HSK ${DB.set.gLevel || 1}급 문법 ${GRAM.filter((g) => g.lv === (DB.set.gLevel || 1)).length || ''}`)}
        ${tile('quiz', 'pencil', '문제', left ? `안 외운 단어 ${left}개` : '복습할 차례')}
        ${tile('notes', 'notes', '오답노트', wrong ? `복습할 오답 ${wrong}개` : '오답 없음')}
      </div>
      <button class="home-settings" data-go="settings">${ic('sliders')}<span>설정 · 백업</span>${ic('chevronRight')}</button>`;
  }
  $('#homeBox').onclick = (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    const g = b.dataset.go;
    if (g === 'level') return pickLevel();
    if (g === 'dueR') return startDueR();
    if (g === 'dueW') return startDueW();
    goTab(g);
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
              .join('')}</div>
            <h3>단원 <span class="muted small">(자주 쓰는 순서로 ${UNIT}단어씩)</span></h3>
            <div class="unit-grid">${unitChips()}</div>`;
        };
        draw();
        L.body.onclick = (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          if (b.dataset.t) {
            DB.set.track = b.dataset.t;
            if (DB.set.level > (DB.set.track === 'n' ? 7 : 6)) DB.set.level = 1;
            DB.set.unit = 0;
            save();
            draw();
          }
          if (b.dataset.lv) {
            DB.set.level = +b.dataset.lv;
            DB.set.unit = 0;
            save();
            draw(); // 급수를 고르면 단원을 고를 수 있게 그대로 둠
          }
          if (b.dataset.unit != null) {
            DB.set.unit = +b.dataset.unit;
            save();
            closeTopLayer();
          }
        };
      },
    });
  }

  function unitChips() {
    const ws = levelWords();
    const n = Math.ceil(ws.length / UNIT);
    let html = `<button data-unit="0" class="${!DB.set.unit ? 'on' : ''}"><b>전체</b><span>${ws.length}</span></button>`;
    for (let u = 1; u <= n; u++) {
      const part = ws.slice((u - 1) * UNIT, u * UNIT);
      const k = part.filter((w) => DB.st[w.w] === 2).length;
      html += `<button data-unit="${u}" class="${DB.set.unit === u ? 'on' : ''} ${k === part.length ? 'done' : ''}"><b>${u}과</b><span>${k}/${part.length}</span></button>`;
    }
    return html;
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
    if ((s.unit || 0) > unitCount()) s.unit = 0;
    $('#unitChips').innerHTML = unitChips();
  }
  $('#unitChips').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.unit = +b.dataset.unit;
    save();
    renderWords();
  };
  $('#trackSeg').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.track = b.dataset.track;
    DB.set.unit = 0;
    save();
    renderWords();
  };
  $('#levelChips').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.level = +b.dataset.lv;
    DB.set.unit = 0;
    save();
    renderWords();
  };
  $('#wordView').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.wordView = b.dataset.v;
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
    } else if (DB.set.wordView === 'fav') {
      // 즐겨찾기: 급수와 상관없이 모아서, 최근에 추가한 순
      list = WORDS.filter((w) => DB.star[w.w]).sort((a, b) => DB.star[b.w] - DB.star[a.w]);
    } else list = scopeWords();
    const f = DB.set.wordView === 'fav' ? 'all' : DB.set.filter;
    if (f === 'new') list = list.filter((w) => DB.st[w.w] !== 2);
    if (f === 'known') list = list.filter((w) => DB.st[w.w] === 2);
    if (f === 'canwrite') list = list.filter(canWriteW);
    if (f === 'star') list = list.filter((w) => DB.star[w.w]);
    return list;
  }

  function renderProgress() {
    const ws = scopeWords();
    const known = ws.filter((w) => DB.st[w.w] === 2).length;
    const learn = ws.filter((w) => DB.st[w.w] === 1).length;
    const wrong = ws.filter((w) => DB.wrong[w.w] && !DB.wrong[w.w].ok).length;
    const noKo = ws.filter((w) => !w.k).length;
    const pct = (n) => (ws.length ? (n / ws.length) * 100 : 0);
    $('#levelProgress').innerHTML = `
      <div class="nums"><span><b>${known}</b> / ${ws.length} 외움 · 학습 중 ${learn}</span><span>쓰기 ${ws.filter(canWriteW).length} · 오답 ${wrong}</span></div>
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
      ${canWriteW(w) ? `<span class="wr-mark" title="쓸 수 있음">${ic('brushFill')}</span>` : ''}
      ${DB.star[w.w] ? `<span class="star">${ic('starFill')}</span>` : ''}
      ${DB.wrong[w.w] && !DB.wrong[w.w].ok ? `<span class="cnt">${ic('x')}${DB.wrong[w.w].c}</span>` : ''}
    </li>`;
  }

  function renderWords(keepScroll) {
    if (DB.set.filter === 'star') DB.set.filter = 'all';
    const fav = DB.set.wordView === 'fav';
    $$('#wordView button').forEach((b) => b.classList.toggle('on', b.dataset.v === (fav ? 'fav' : 'level')));
    $$('.lv-only').forEach((el) => (el.hidden = fav));
    renderTrackAndLevels();
    $$('#wordFilter button').forEach((b) => b.classList.toggle('on', b.dataset.f === DB.set.filter));
    renderProgress();
    const y = window.scrollY;
    listCache = filteredList();
    const showN = keepScroll ? Math.max(listShown, PAGE) : PAGE;
    listShown = Math.min(showN, listCache.length);
    $('#wordList').innerHTML = listCache.length
      ? listCache.slice(0, listShown).map(wordRow).join('')
      : `<li class="empty" style="display:block;cursor:default">${$('#wordSearch').value.trim() ? '검색 결과가 없습니다' : fav ? '즐겨찾기한 단어가 없습니다<br><span class="small">단어 화면 아래의 별을 누르면 여기에 모입니다</span>' : '해당하는 단어가 없습니다'}</li>`;
    updateMore();
    $('#startCards').disabled = !listCache.length;
    $('#startBlank').disabled = !listCache.length;
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
  $('#startBlank').onclick = () => startBlankTest(listCache.slice());
  $('#startLevelQuiz').onclick = () => {
    const snap = listCache.slice();
    const keepKnown = DB.set.filter === 'known'; // '외운 단어' 목록으로 풀 때만 외운 단어 포함
    startQuiz({ pool: () => (keepKnown ? snap : snap.filter((w) => DB.st[w.w] !== 2)), label: '단어장 목록' });
  };

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
              ${chars.some((c) => CHAR_RAD(c)) ? `<dt>부수</dt><dd class="zh">${chars.map((c) => (CHAR_RAD(c) ? `${esc(c)} <span class="muted">${esc(CHAR_RAD(c))}</span>` : '')).filter(Boolean).join(' · ')}</dd>` : ''}
              <dt>급수</dt><dd>${w.n ? `HSK 3.0 ${levelName('n', w.n)}` : ''}${w.n && w.o ? ' · ' : ''}${w.o ? `HSK 2.0 ${w.o}급` : ''}</dd>
              ${note ? `<dt>오답</dt><dd>${note.c}번 틀림 · ${note.ok ? '해결' : '복습 필요'}</dd>` : ''}
              ${DB.wwrong[w.w] ? `<dt>쓰기 오답</dt><dd>${DB.wwrong[w.w].c}번 틀림 · ${DB.wwrong[w.w].ok ? '해결' : '복습 필요'}</dd>` : ''}
            </dl>
            ${chars.length ? `<h3>한 글자씩 쓰기 연습</h3>
            <div class="char-row">${chars
              .map((c) => `<button class="char-btn" data-act="write" data-c="${esc(c)}"><span class="c zh">${esc(c)}</span><span class="h">${esc(CHAR_HANJA(c))}</span></button>`)
              .join('')}</div>
            <button class="big" data-act="writeAll">${ic('write')} ‘${esc(w.w)}’ 전체 쓰기</button>` : ''}
            ${(() => {
              const ex = SENTS.filter((x) => x.z.includes(w.w)).sort((a, b) => sentLv(a) - sentLv(b)).slice(0, 3);
              return ex.length
                ? `<h3>예문</h3><div class="ex-list">${ex.map((x) => `<div class="ex" data-say="${esc(sentText(x))}">${rubyHTML(x)}<div class="ex-ko">${esc(x.k)}</div></div>`).join('')}</div>`
                : '';
            })()}
            ${(() => {
              const rel = relatedWords(w);
              return rel.length
                ? `<h3>같은 글자가 들어간 단어</h3><div class="rel">${rel.map((x) => `<button data-w="${esc(x.w)}"><span class="zh">${esc(x.w)}</span><span>${esc(meaning(x).split(/[;,]/)[0])}</span></button>`).join('')}</div>`
                : '';
            })()}
            <div class="dock" role="toolbar" aria-label="단어 표시">
              <button class="dock-btn ${DB.star[w.w] ? 'star-on' : ''}" data-act="star" aria-pressed="${!!DB.star[w.w]}" aria-label="즐겨찾기" title="즐겨찾기">${ic(DB.star[w.w] ? 'starFill' : 'star')}</button>
              <button class="dock-btn" data-act="speak" aria-label="발음 듣기" title="발음 듣기">${ic('sound')}</button>
              <button class="dock-btn ${s === 2 ? 'known-on' : ''}" data-act="known" aria-pressed="${s === 2}" aria-label="외운 단어" title="외운 단어">${ic(s === 2 ? 'circleCheck' : 'circle')}</button>
              ${canWrite(w) ? `<button class="dock-btn ${canWriteW(w) ? 'write-on' : ''}" data-act="wrToggle" aria-pressed="${canWriteW(w)}" aria-label="쓸 수 있음" title="쓸 수 있음">${ic(canWriteW(w) ? 'brushFill' : 'brush')}</button>` : ''}
            </div>
          `;
        };
        draw();
        L.body.onclick = (e) => {
          const wb = e.target.closest('[data-w]');
          if (wb && wb.dataset.w !== w.w) return openWord(wb.dataset.w);
          const ex = e.target.closest('[data-say]');
          if (ex) return speak(ex.dataset.say);
          const b = e.target.closest('[data-act]');
          if (!b) return;
          const a = b.dataset.act;
          if (a === 'speak') speak(w.w);
          if (a === 'star') {
            if (DB.star[w.w]) delete DB.star[w.w];
            else DB.star[w.w] = Date.now();
            save();
            draw();
            $('.dock [data-act=star]', L.body).classList.add('pop');
          }
          if (a === 'known') {
            setKnown(w, DB.st[w.w] !== 2);
            save();
            draw();
            $('.dock [data-act=known]', L.body).classList.add('pop');
          }
          if (a === 'wrToggle') {
            setWritable(w, !canWriteW(w));
            save();
            draw();
            $('.dock [data-act=wrToggle]', L.body).classList.add('pop');
          }
          if (a === 'write') openWriting(w, [...w.w].filter(isHan).indexOf(b.dataset.c));
          if (a === 'writeAll') openWriting(w, 0);
        };
        if (DB.set.autoSpeak) speak(w.w);
      },
    });
  }
  // 같은 글자가 들어간 다른 단어 (낮은 급수·자주 쓰는 것부터 8개)
  function relatedWords(w) {
    const cs = [...new Set([...w.w].filter(isHan))];
    const out = [];
    for (const x of WORDS) {
      if (x.w === w.w || !x.k) continue;
      if (cs.some((c) => x.w.includes(c))) out.push(x);
      if (out.length >= 40) break;
    }
    return out.sort((a, b) => (a.n || 9) - (b.n || 9)).slice(0, 8);
  }
  let RAD_ONE = null;
  const CHAR_RAD = (c) => {
    if (!RAD_ONE) {
      RAD_ONE = new Map();
      for (const w of WORDS) if (w.r && [...w.w].length === 1) RAD_ONE.set(w.w, w.r);
    }
    return RAD_ONE.get(c) || '';
  };
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
            if (a === 'yes') setKnown(w, true);
            else if (DB.st[w.w] === 2) setKnown(w, false);
            else DB.st[w.w] = 1;
            tick();
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
    writer.guide = { set() {}, hide() {} };
    if (opts.guide) writer.guide = makeGuide($('.write-box', host), opts.char, size);
    return writer;
  }

  // 흐린 글자 위에 획순 번호, 이번에 쓸 획은 진하게 + 시작점 + 방향 화살표
  // (Hanzi Writer 와 같은 좌표 변환: 1024 칸, y 위쪽, 아래 여백 124)
  function makeGuide(box, char, size) {
    const pad = 14;
    const sc = (size - 2 * pad) / 1024;
    const X = (x) => pad + x * sc;
    const Y = (y) => size - (124 * sc + pad) - y * sc;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'guide');
    svg.setAttribute('width', size + 4);
    svg.setAttribute('height', size + 4);
    box.appendChild(svg);
    let data = null;
    let cur = 0;
    let hidden = false;
    const draw = () => {
      if (!data || hidden) return (svg.innerHTML = '');
      const meds = data.medians;
      const strokeTr = `translate(${X(0)}, ${Y(0)}) scale(${sc}, ${-sc})`;
      let html = `<defs><marker id="gArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="g-arrowhead"/></marker></defs>`;
      if (cur < meds.length) {
        const m = meds[cur];
        html += `<path class="g-cur" d="${data.strokes[cur]}" transform="${strokeTr}"/>`;
        html += `<polyline class="g-dir" points="${m.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ')}" marker-end="url(#gArrow)"/>`;
        html += `<circle class="g-start" cx="${X(m[0][0])}" cy="${Y(m[0][1])}" r="7"/>`;
      }
      meds.forEach((m, k) => {
        if (k < cur) return;
        const [x, y] = m[0];
        html += `<g class="g-num ${k === cur ? 'now' : ''}"><circle cx="${X(x)}" cy="${Y(y)}" r="${k === cur ? 11 : 8}"/><text x="${X(x)}" y="${Y(y)}" dy=".35em">${k + 1}</text></g>`;
      });
      svg.innerHTML = html;
    };
    strokePack(char)
      .then((p) => {
        data = p[char] || null;
        draw();
      })
      .catch(() => {});
    return {
      set(n) {
        cur = n;
        draw();
      },
      hide() {
        hidden = true;
        draw();
      },
      show() {
        hidden = false;
        draw();
      },
    };
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
          status(mode === 'trace' ? '번호 순서대로, 화살표 방향으로 따라 써 보세요' : '보지 않고 획순대로 써 보세요');
          writer = makeWriter($('.pad', L.body), {
            char: chars[idx],
            outline: mode === 'trace',
            guide: mode === 'trace',
            hint: mode === 'trace' ? 1 : DB.set.hint,
            onLoadError: () => status('이 글자의 획순 데이터를 불러오지 못했습니다', 'bad'),
          });
          writer.quiz({
            onMistake: () => {
              mistakes++;
              status(mode === 'trace' ? '번호 순서대로, 화살표 방향으로 써 보세요' : `틀린 획 ${mistakes}개`, 'bad');
            },
            onCorrectStroke: (d) => {
              writer.guide.set(d.strokeNum + 1);
              status(`${d.strokeNum + 1} / ${d.strokeNum + 1 + d.strokesRemaining} 획${mistakes && mode !== 'trace' ? ` · 틀린 획 ${mistakes}개` : ''}`);
            },
            onComplete: (d) => {
              const m = d.totalMistakes;
              writer.guide.hide();
              status(mode === 'trace' ? '잘 따라 썼어요' : m === 0 ? '완벽해요!' : `완성 · 틀린 획 ${m}개`, mode === 'trace' || m === 0 ? 'ok' : 'bad');
              if (mode === 'free' && m >= 3) addWrong(w, 'write', `쓰기 ${chars[idx]} (틀린 획 ${m})`);
              else if (mode === 'free' && idx === chars.length - 1) writePass(w);
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
            writer.guide.hide();
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
  const canWriteW = (w) => !!(DB.wr[w.w] && DB.wr[w.w].ok);

  /* ---------------- 간격 반복 (외움 r / 쓰기 w 따로) ---------------- */
  const IV = [0, 1, 3, 7, 14, 30, 60, 120]; // 단계별 다음 복습까지 날짜
  const dayStart = (t = Date.now()) => new Date(new Date(t).toDateString()).getTime();
  const srsGet = (w, sk) => (DB.srs[w.w] || {})[sk];
  function srsSet(w, sk, b) {
    const e = DB.srs[w.w] || (DB.srs[w.w] = {});
    e[sk] = { b, due: dayStart() + IV[b] * 864e5 };
  }
  function srsDel(w, sk) {
    if (DB.srs[w.w]) delete DB.srs[w.w][sk];
  }
  // 맞히면 다음 단계(간격이 늘어남), 틀리면 처음으로
  function srsHit(w, sk, ok) {
    const c = srsGet(w, sk);
    srsSet(w, sk, ok ? Math.min((c ? c.b : 0) + 1, IV.length - 1) : 0);
  }
  const isDue = (w, sk) => {
    const c = srsGet(w, sk);
    return !!c && c.due <= Date.now();
  };
  const dueWords = (sk) => WORDS.filter((w) => (sk === 'r' ? DB.st[w.w] === 2 : canWriteW(w)) && isDue(w, sk));
  // 외움 표시를 바꾸는 곳은 모두 여기로 (복습 일정도 같이)
  function setKnown(w, on) {
    if (on) {
      DB.st[w.w] = 2;
      if (!srsGet(w, 'r')) srsSet(w, 'r', 1);
    } else {
      DB.st[w.w] = 1;
      srsDel(w, 'r');
    }
  }
  function setWritable(w, on) {
    DB.wr[w.w] = on ? { ok: true, s: 2 } : { ok: false, s: 0 };
    if (on && !srsGet(w, 'w')) srsSet(w, 'w', 1);
    if (!on) srsDel(w, 'w');
  }
  // 오늘 한 개수 (매일 목표, 연속 학습일)
  function tick(n = 1) {
    const d = today();
    DB.daily[d] = (DB.daily[d] || 0) + n;
  }
  function streak() {
    const goal = +DB.set.goal || 20;
    let n = 0;
    let t = dayStart();
    const key = (t) => {
      const d = new Date(t);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    if ((DB.daily[key(t)] || 0) < goal) t -= 864e5; // 오늘 아직이면 어제부터
    while ((DB.daily[key(t)] || 0) >= goal) {
      n++;
      t -= 864e5;
    }
    return n;
  }
  function addWrong(w, type, answer) {
    const book = type === 'write' ? DB.wwrong : DB.wrong;
    const n = book[w.w] || (book[w.w] = { c: 0, s: 0, f: Date.now(), log: [] });
    n.c++;
    n.s = 0;
    n.ok = false;
    n.t = Date.now();
    n.log.unshift({ t: n.t, ty: type, a: answer || '' });
    n.log = n.log.slice(0, 5);
    if (type === 'write') {
      // 쓰기에서 틀리면 '쓸 수 있음'만 풀림 (뜻을 외운 것과는 별개)
      DB.wr[w.w] = { ok: false, s: 0 };
      srsDel(w, 'w');
    } else if (DB.st[w.w] === 2) setKnown(w, false);
    save();
  }
  // 안 보고 쓰기를 통과: 2번 연속이면 '쓸 수 있음'
  function writePass(w) {
    const r = DB.wr[w.w] || (DB.wr[w.w] = { ok: false, s: 0 });
    r.s = (r.s || 0) + 1;
    if (r.ok) srsHit(w, 'w', true); // 이미 쓸 수 있으면 복습 간격을 늘림
    else if (r.s >= 2) {
      r.ok = true;
      srsSet(w, 'w', 1);
    }
    save();
    return markRight(w, DB.wwrong);
  }
  function markRight(w, book = DB.wrong) {
    const n = book[w.w];
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


  /* ---------------- 예문 ---------------- */
  const sid = (x) => x.z.join('');
  const sentLv = (x) => x[DB.set.track] || 9;
  const sentText = (x) => x.z.join('');
  const PUNCT_RE = /[，。？！、：；“”‘’（）…,.?!\s]/g;
  // 고른 급수 이하의 예문 중, 오래 안 본 것부터 (가능하면 단어 w 가 들어간 문장)
  function pickSentences(n, w, avoid = new Set()) {
    const lv = DB.set.level;
    let c = SENTS.filter((x) => sentLv(x) <= lv && !avoid.has(sid(x)));
    if (w) {
      const withW = c.filter((x) => x.z.includes(w.w));
      if (withW.length) c = withW;
    }
    if (!c.length) c = SENTS.filter((x) => sentLv(x) <= lv);
    if (!c.length) c = SENTS.slice();
    // 이번 급수 문장을 조금 더 자주, 오래 안 본 순서
    const score = (x) => (DB.sent[sid(x)] || 0) - (sentLv(x) === lv ? 3 * 864e5 : 0) + Math.random() * 864e5;
    return c.sort((a, b) => score(a) - score(b)).slice(0, n);
  }
  // 한자 위에 병음. missed: 모범 답안에서 내 답에 없던 글자의 위치(문장부호 뺀 순서)
  function rubyHTML(x, missed, boxed = false) {
    let ci = 0;
    const parts = x.z.map((t, k) => {
      if (!x.p[k]) return { punct: true, html: `<span class="rb punct zh">${esc(t)}</span>` };
      const chars = [...t]
        .map((c) => {
          const m = missed && missed.has(ci);
          ci++;
          return m ? `<mark>${esc(c)}</mark>` : esc(c);
        })
        .join('');
      const tag = BY.has(t) ? `button data-w="${esc(t)}"` : 'span';
      return { html: `<${tag} class="rb"><span class="rp">${esc(x.p[k])}</span><span class="rz zh">${chars}</span></${tag.split(' ')[0]}>` };
    });
    // 문장부호는 앞 단어와 한 덩어리로 (혼자 다음 줄로 넘어가지 않게)
    const groups = [];
    for (const pt of parts) {
      if (pt.punct && groups.length) groups[groups.length - 1] += pt.html;
      else groups.push(pt.html);
    }
    return `<div class="ruby${boxed ? ' boxed' : ''}">${groups.map((g) => `<span class="rgrp">${g}</span>`).join('')}</div>`;
  }
  // 모범 답안 글자 중 내 답과 순서대로 겹치는(LCS) 글자를 찾음
  function compareZh(model, mine) {
    const a = [...model.replace(PUNCT_RE, '')];
    const b = [...mine.replace(PUNCT_RE, '')];
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let x = a.length - 1; x >= 0; x--)
      for (let y = b.length - 1; y >= 0; y--) dp[x][y] = a[x] === b[y] ? dp[x + 1][y + 1] + 1 : Math.max(dp[x + 1][y], dp[x][y + 1]);
    const hit = new Set();
    for (let x = 0, y = 0; x < a.length && y < b.length; ) {
      if (a[x] === b[y]) {
        hit.add(x);
        x++;
        y++;
      } else if (dp[x + 1][y] >= dp[x][y + 1]) x++;
      else y++;
    }
    const missed = new Set(a.map((_, k) => k).filter((k) => !hit.has(k)));
    return { missed, pct: a.length ? Math.round((hit.size / a.length) * 100) : 0, exact: a.join('') === b.join('') };
  }

  // 문장 연습: 한자·병음·뜻을 보고 노트에 따라 써 보기. 채점 없음
  // 따라쓰기용 단어: 지금 급수에서 아직 못 쓰는 단어 (없으면 급수 전체), 무작위 n개 → 예문과 같은 모양으로
  const wordItem = (w) => ({ z: [w.w], p: [w.p.replace(/\s+/g, '')], k: meaning(w), word: true });
  function pickCopyWords(n) {
    const lv = scopeWords().filter(canWrite);
    const left = lv.filter((w) => !canWriteW(w));
    return shuffle((left.length ? left : lv).slice()).slice(0, n).map(wordItem);
  }
  // 따라쓰기: 단어 또는 문장을 보고(한자·병음·뜻) 노트에 따라 쓰기. 채점 없음
  function startSentences() {
    const mode = () => (DB.set.copyMode === 'sent' ? 'sent' : 'word');
    const make = () => (mode() === 'sent' ? pickSentences(10) : pickCopyWords(10));
    if (mode() === 'sent' && !SENTS.length) DB.set.copyMode = 'word';
    let list = make();
    let i = 0;
    openLayer({
      title: '따라쓰기',
      cls: 'quiz-layer',
      render: (L) => {
        const draw = () => {
          if (i >= list.length) {
            L.body.innerHTML = `<div class="qz"><div class="qz-prompt result">
                <div class="done-ic">${ic('check')}</div>
                <div class="result-msg">${list.length}${mode() === 'sent' ? '문장' : '단어'} 따라쓰기 끝</div></div>
              <div class="qz-bottom"><button class="primary big-btn" data-act="more">다음 ${list.length}${mode() === 'sent' ? '문장' : '단어'} ${ic('chevronRight')}</button>
              <button class="big-btn" data-act="home">${ic('home')} 홈으로</button></div></div>`;
            return;
          }
          const x = list[i];
          if (!x.word) {
            DB.sent[sid(x)] = Date.now();
            save();
          }
          L.body.innerHTML = `<div class="qz">
            <div class="qz-top"><div class="q-progress"><i style="width:${(i / list.length) * 100}%"></i></div>
              <div class="q-kind"><div class="seg sp-mode"><button data-copy="word" class="${mode() === 'word' ? 'on' : ''}">단어</button><button data-copy="sent" class="${mode() === 'sent' ? 'on' : ''}">문장</button></div><span>${i + 1} / ${list.length}</span></div></div>
            <div class="qz-prompt sp copy ${x.word ? 'single' : ''}">
              ${rubyHTML(x, null, true)}
              <div class="sp-ko">${esc(x.k)}</div>
            </div>
            <div class="qz-mid"><button class="replay" data-act="say" aria-label="듣기" title="듣기">${ic('sound')}</button><button class="replay" data-act="slow" aria-label="느리게 듣기" title="느리게 듣기">${ic('snail')}</button></div>
            <div class="qz-bottom"><div class="qz-actions">
              <button class="primary grow" data-act="next">${i + 1 >= list.length ? '다 썼어요' : '다 썼어요 · 다음 ' + ic('chevronRight')}</button></div></div></div>`;
          if (DB.set.autoSpeak) setTimeout(() => speak(sentText(x)), 150);
        };
        draw();
        L.body.onclick = (e) => {
          // 단어 상자를 누르면 그 단어의 획순 따라 쓰기
          const wb = e.target.closest('[data-w]');
          if (wb) return BY.get(wb.dataset.w) && openWriting(BY.get(wb.dataset.w), 0);
          const b = e.target.closest('button');
          if (!b) return;
          if (b.dataset.copy) {
            if (b.dataset.copy === 'sent' && !SENTS.length) return toast('예문을 불러오는 중이에요');
            DB.set.copyMode = b.dataset.copy;
            save();
            list = make();
            i = 0;
            return draw();
          }
          const a = b.dataset.act;
          const x = list[i];
          if (a === 'say') speak(sentText(x));
          if (a === 'slow') speak(sentText(x), 0.5);
          if (a === 'next') {
            tick();
            save();
            i++;
            draw();
          }
          if (a === 'more') {
            list = make();
            i = 0;
            draw();
          }
          if (a === 'home') {
            closeTopLayer();
            setTimeout(() => goTab('home'), 0);
          }
        };
      },
    });
  }

  function startTranslate() {
    if (!SENTS.length) return toast('예문을 불러오는 중이에요. 잠시 후 다시 눌러 주세요');
    const regen = () => pickSentences(10).map((x) => ({ type: DB.set.trMode || 'trzh', s: x, w: null }));
    runQuiz(regen(), '작문 · 번역', false, regen);
  }



  /* ---------------- 백지 테스트: 뜻만 보고 노트에 쓰고, 한 번에 정답 확인 ---------------- */
  function startBlankTest(src) {
    // 안 외운 단어 먼저, 최대 20개 (단원을 고르면 그 단원 20개)
    const list = src
      .slice()
      .sort((a, b) => (DB.st[a.w] === 2) - (DB.st[b.w] === 2))
      .slice(0, 20);
    if (!list.length) return toast('테스트할 단어가 없습니다');
    let shown = false;
    openLayer({
      title: '백지 테스트',
      cls: 'blank-layer',
      render: (L) => {
        const draw = () => {
          L.body.innerHTML = `
            <p class="blank-help">${shown ? '노트와 비교해 보세요. 못 쓴 단어는 별을 눌러 즐겨찾기해 두세요.' : '뜻을 보고 노트에 <b>한자와 병음</b>을 써 보세요. 다 쓰면 아래에서 정답을 한 번에 확인합니다.'}</p>
            <ol class="blank-list">${list
              .map(
                (w, k) => `<li>
                  <span class="bn">${k + 1}</span>
                  <span class="bk">${esc(meaning(w))}</span>
                  ${
                    shown
                      ? `<button class="ba" data-w="${esc(w.w)}"><span class="zh">${esc(w.w)}</span><span class="py">${esc(w.p)}</span></button>
                         <button class="bstar ${DB.star[w.w] ? 'on' : ''}" data-star="${esc(w.w)}" aria-label="즐겨찾기">${ic(DB.star[w.w] ? 'starFill' : 'star')}</button>`
                      : '<span class="bhide"></span>'
                  }
                </li>`,
              )
              .join('')}</ol>
            <div class="blank-bottom">${
              shown
                ? `<button class="primary big-btn" data-act="again">${ic('redo')} 같은 단어로 다시</button><button class="big-btn" data-act="close">끝내기</button>`
                : `<button class="primary big-btn" data-act="reveal">다 썼어요 · 정답 보기</button>`
            }</div>`;
        };
        draw();
        L.body.onclick = (e) => {
          const st = e.target.closest('[data-star]');
          if (st) {
            const w = BY.get(st.dataset.star);
            if (DB.star[w.w]) delete DB.star[w.w];
            else DB.star[w.w] = Date.now();
            save();
            st.classList.toggle('on', !!DB.star[w.w]);
            st.innerHTML = ic(DB.star[w.w] ? 'starFill' : 'star');
            return;
          }
          const wb = e.target.closest('[data-w]');
          if (wb) return openWord(wb.dataset.w);
          const b = e.target.closest('[data-act]');
          if (!b) return;
          const a = b.dataset.act;
          if (a === 'reveal') {
            shown = true;
            tick(list.length);
            save();
            draw();
            L.el.scrollTo(0, 0);
          }
          if (a === 'again') {
            shown = false;
            shuffle(list);
            draw();
            L.el.scrollTo(0, 0);
          }
          if (a === 'close') closeTopLayer();
        };
      },
    });
  }

  /* ---------------- 문형 바꿔 쓰기: 문형 + 예문 + 재료 단어로 노트에 3문장 ---------------- */
  function startPatternWrite(g) {
    const pickMaterials = () => {
      // 최근에 외운 단어(복습 일정이 짧은 것)를 우선, 없으면 지금 범위의 단어
      const known = WORDS.filter((w) => DB.st[w.w] === 2 && w.k && [...w.w].length <= 3);
      const pool = known.length >= 6 ? known : scopeWords().filter((w) => w.k && [...w.w].length <= 3);
      return shuffle(pool.slice()).slice(0, 6);
    };
    let mats = pickMaterials();
    let done = false;
    openLayer({
      title: '문형 바꿔 쓰기',
      render: (L) => {
        const draw = () => {
          L.body.innerHTML = `
            <div class="g-pattern zh">${esc(g.f)}</div>
            <p class="muted small" style="margin:8px 0 0">${esc(g.t)}</p>
            <h3>예문 (먼저 노트에 한 번 베껴 쓰기)</h3>
            <div class="ex-list">${g.ex.slice(0, 1).map((x) => `<div class="ex" data-say="${esc(sentText(x))}">${rubyHTML(x)}<div class="ex-ko">${esc(x.k)}</div></div>`).join('')}</div>
            <h3>재료 단어 <button class="ghost mini-link" data-act="reroll">${ic('redo')} 다른 단어</button></h3>
            <div class="rel">${mats.map((x) => `<button data-w="${esc(x.w)}"><span class="zh">${esc(x.w)}</span><span>${esc(meaning(x).split(/[;,]/)[0])}</span></button>`).join('')}</div>
            <div class="task-box">
              <b>과제</b>
              <span>위 문형에 재료 단어를 넣어 <b>노트에 3문장</b>을 만들어 보세요. 단어를 누르면 뜻과 획순을 볼 수 있어요.</span>
            </div>
            ${
              done
                ? `<div class="task-box ok"><b>확인 방법</b><span>예문과 어순을 비교해 보세요. 문장을 소리 내어 읽어 보고, 자신 없는 문장은 ‘작문 · 번역’에서 비슷한 예문과 맞춰 볼 수 있어요.</span></div>
                   <div class="blank-bottom"><button class="primary big-btn" data-act="more">${ic('redo')} 다른 재료로 한 번 더</button><button class="big-btn" data-act="close">끝내기</button></div>`
                : `<div class="blank-bottom"><button class="primary big-btn" data-act="done">3문장 다 썼어요</button></div>`
            }`;
        };
        draw();
        L.body.onclick = (e) => {
          const wb = e.target.closest('[data-w]');
          if (wb) return openWord(wb.dataset.w);
          const ex = e.target.closest('[data-say]');
          if (ex) return speak(ex.dataset.say);
          const b = e.target.closest('[data-act]');
          if (!b) return;
          const a = b.dataset.act;
          if (a === 'reroll') {
            mats = pickMaterials();
            draw();
          }
          if (a === 'done') {
            done = true;
            tick(3);
            const st = (DB.gram[g.id] = DB.gram[g.id] || {});
            st.w = (st.w || 0) + 1;
            save();
            draw();
          }
          if (a === 'more') {
            done = false;
            mats = pickMaterials();
            draw();
            L.el.scrollTo(0, 0);
          }
          if (a === 'close') closeTopLayer();
        };
      },
    });
  }

  /* ---------------- 문법 ---------------- */
  const gLevel = () => DB.set.gLevel || 1;
  const gStat = (g) => DB.gram[g.id] || {};
  function renderGrammar() {
    const lv = gLevel();
    const lvs = [...new Set(GRAM.map((g) => g.lv))].sort();
    const list = GRAM.filter((g) => g.lv === lv);
    const done = list.filter((g) => (gStat(g).ok || 0) >= 2).length;
    $('#gramBox').innerHTML = !GRAM.length
      ? '<div class="empty">문법을 불러오는 중…</div>'
      : `
      <div class="chips" id="gramLv">${lvs.map((l) => `<button data-glv="${l}" class="${l === lv ? 'on' : ''}">HSK ${l}급</button>`).join('')}</div>
      <div class="qmain">
        <div class="qmain-head"><span class="tile-ic">${ic('blocks')}</span><span><b>HSK ${lv}급 문법 ${list.length}개</b><span class="muted small">빈칸 문제를 2번 맞히면 익힘 표시 · 익힘 ${done}개</span></span></div>
        <div class="qmain-btns">
          <button class="primary" data-gq="gap">빈칸 문제</button>
          <button data-gq="order">어순 맞추기</button>
        </div>
      </div>
      <ul class="gram-list">${list
        .map((g) => {
          const st = gStat(g);
          const mark = (st.ok || 0) >= 2 ? `<span class="g-done">${ic('circleCheck')}</span>` : st.v ? '<span class="g-seen"></span>' : '';
          return `<li data-gid="${g.id}"><span class="info"><b>${esc(g.t)}</b><span class="zh g-f">${esc(g.f)}</span></span>${mark}${ic('chevronRight')}</li>`;
        })
        .join('')}</ul>`;
  }
  $('#gramBox').onclick = (e) => {
    const lvb = e.target.closest('[data-glv]');
    if (lvb) {
      DB.set.gLevel = +lvb.dataset.glv;
      save();
      return renderGrammar();
    }
    const qb = e.target.closest('[data-gq]');
    if (qb) {
      DB.set.gMode = qb.dataset.gq;
      save();
      return startGrammarQuiz();
    }
    const li = e.target.closest('[data-gid]');
    if (li) openGrammar(+li.dataset.gid);
  };
  function openGrammar(id) {
    const g = GRAM.find((x) => x.id === id);
    if (!g) return;
    (DB.gram[g.id] = DB.gram[g.id] || {}).v = Date.now();
    save();
    openLayer({
      title: '문법',
      render: (L) => {
        L.body.innerHTML = `
          <div class="g-head"><span class="tag">HSK ${g.lv}급</span><h2>${esc(g.t)}</h2><div class="g-pattern zh">${esc(g.f)}</div></div>
          <p class="g-desc">${esc(g.d)}</p>
          <h3>예문</h3>
          <div class="ex-list">${g.ex.map((x) => `<div class="ex" data-say="${esc(sentText(x))}">${rubyHTML(x)}<div class="ex-ko">${esc(x.k)}</div></div>`).join('')}</div>
          <div class="actions" style="margin-top:16px">
            <button class="primary" data-act="gap">이 문법 빈칸 문제</button>
            <button data-act="order">예문 어순 맞추기</button>
            <button data-act="pw">${ic('write')} 노트에 3문장 만들기</button>
          </div>`;
        L.body.onclick = (e) => {
          const wb = e.target.closest('[data-w]');
          if (wb) return openWord(wb.dataset.w);
          const ex = e.target.closest('[data-say]');
          if (ex) return speak(ex.dataset.say);
          const b = e.target.closest('[data-act]');
          if (!b) return;
          if (b.dataset.act === 'gap') runQuiz(shuffle(g.q.map((it) => ({ type: 'gap', g, it }))), g.t, false);
          if (b.dataset.act === 'order') runQuiz(shuffle(g.ex.map((x) => ({ type: 'order', g, s: x }))), g.t + ' · 어순', false);
          if (b.dataset.act === 'pw') startPatternWrite(g);
        };
      },
    });
  }
  // 문법 문제 10개: 빈칸(gap) 또는 어순(order). 고른 문법 급수 이하에서, 덜 맞힌 문법부터
  function grammarQs(mode) {
    const pts = GRAM.filter((g) => g.lv <= gLevel());
    const weight = (g) => (gStat(g).ok || 0) - (gStat(g).x || 0) + (g.lv === gLevel() ? -1 : 0) + Math.random() * 1.5;
    if (mode === 'order') {
      const fromG = pts.flatMap((g) => g.ex.map((x) => ({ g, s: x })));
      const fromS = SENTS.filter((x) => sentLv(x) <= Math.max(DB.set.level, gLevel()) && x.z.filter((t, k) => x.p[k]).length >= 3 && x.z.length <= 11).map((x) => ({ s: x }));
      return shuffle(fromG.concat(shuffle(fromS).slice(0, 10)))
        .slice(0, 10)
        .map((o) => ({ type: 'order', ...o }));
    }
    const items = pts.flatMap((g) => g.q.map((it) => ({ g, it })));
    return items
      .map((o) => ({ o, k: weight(o.g) }))
      .sort((a, b) => a.k - b.k)
      .slice(0, 10)
      .map(({ o }) => ({ type: 'gap', ...o }));
  }
  function startGrammarQuiz() {
    if (!GRAM.length) return toast('문법을 불러오는 중이에요. 잠시 후 다시 눌러 주세요');
    const regen = () => shuffle(grammarQs(DB.set.gMode === 'order' ? 'order' : 'gap'));
    runQuiz(regen(), '문법 · HSK ' + gLevel() + '급', false, regen);
  }

  /* ---------------- 문제 ---------------- */
  const TYPE_NAME = { gap: '문법 빈칸', order: '어순 맞추기', tone: '성조 고르기', meaning: '뜻 고르기', word: '한자 고르기', pinyin: '병음 고르기', listen: '듣고 고르기', write: '직접 쓰기', trzh: '작문 (한→중)', trko: '번역 (중→한)' };
  const isTr = (t) => t === 'trzh' || t === 'trko';
  const MIX = ['meaning', 'word', 'pinyin', 'listen', 'tone']; // 단어 문제는 이 유형들을 알아서 섞음

  /* ---------------- 성조 ---------------- */
  const TONE_MARK = { 1: '\u0304', 2: '\u0301', 3: '\u030C', 4: '\u0300' };
  function parseSyl(sy) {
    const d = sy.normalize('NFD');
    let t = 5;
    if (d.includes('\u0304')) t = 1;
    else if (d.includes('\u0301')) t = 2;
    else if (d.includes('\u030C')) t = 3;
    else if (d.includes('\u0300')) t = 4;
    return { base: d.replace(/[\u0300\u0301\u030C\u0304]/g, '').normalize('NFC'), t };
  }
  function markSyl(base, t) {
    if (t === 5) return base;
    const low = base.toLowerCase();
    let k = low.search(/[ae]/);
    if (k < 0) k = low.indexOf('ou');
    if (k < 0) {
      for (let j = low.length - 1; j >= 0; j--)
        if ('iouü'.includes(low[j])) {
          k = j;
          break;
        }
    }
    if (k < 0) return base;
    return (base.slice(0, k + 1) + TONE_MARK[t] + base.slice(k + 1)).normalize('NFC');
  }
  // 같은 음절에 성조만 다른 보기 3개
  function toneOptions(w) {
    const syl = w.p.split(/\s+/).map(parseSyl);
    const answer = w.p;
    const seen = new Set([answer]);
    const out = [];
    for (let tries = 0; tries < 60 && out.length < 3; tries++) {
      const changed = syl.map((x) => ({ ...x }));
      const nChange = syl.length === 1 ? 1 : 1 + ((Math.random() * Math.min(2, syl.length)) | 0);
      for (let c = 0; c < nChange; c++) {
        const j = (Math.random() * syl.length) | 0;
        const pool = [1, 2, 3, 4].filter((t) => t !== changed[j].t);
        changed[j].t = pool[(Math.random() * pool.length) | 0];
      }
      const p = changed.map((x) => markSyl(x.base, x.t)).join(' ');
      if (!seen.has(p)) {
        seen.add(p);
        out.push({ w: w.w, p });
      }
    }
    return out;
  }
  const lvLabel = () => `HSK ${DB.set.track === 'n' ? '3.0' : '2.0'} ${levelName(DB.set.track, DB.set.level)}`;
  function renderQuizTab() {
    const ws = scopeWords();
    const left = ws.filter((w) => DB.st[w.w] !== 2).length;
    const wLeft = ws.filter((w) => canWrite(w) && !canWriteW(w)).length;
    const dr = dueWords('r').length;
    const dw = dueWords('w').length;
    const tile = (go, icon, title, sub) =>
      `<button class="tile" data-go="${go}"><span class="tile-ic">${ic(icon)}</span><span class="tile-t">${title}</span><span class="tile-s">${sub}</span></button>`;
    $('#quizBox').innerHTML = `
      ${levelCard()}
      <div class="qmain">
        <div class="qmain-head"><span class="tile-ic">${ic('pencil')}</span><span><b>단어 문제</b><span class="muted small">뜻 · 한자 · 병음 · 성조 · 듣기를 섞어서</span></span></div>
        <div class="qmain-btns">
          <button class="primary" data-go="learn" ${left ? '' : 'disabled'}>안 외운 단어 <b>${left}</b></button>
          <button data-go="dueR" ${dr ? '' : 'disabled'}>오늘 복습 <b>${dr}</b></button>
        </div>
      </div>
      <div class="qmain">
        <div class="qmain-head"><span class="tile-ic">${ic('brush')}</span><span><b>쓰기 연습</b><span class="muted small">보고 쓰기 · 안 보고 쓰기 · 외운 단어부터</span></span></div>
        <div class="qmain-btns">
          <button class="primary" data-go="write" ${wLeft ? '' : 'disabled'}>아직 못 쓰는 단어 <b>${wLeft}</b></button>
          <button data-go="dueW" ${dw ? '' : 'disabled'}>오늘 쓰기 복습 <b>${dw}</b></button>
        </div>
      </div>
      <div class="tiles">
        ${tile('tone', 'wave', '성조', '듣고 성조 고르기')}
        ${tile('gram', 'blocks', '문법', '빈칸 · 어순 맞추기')}
        ${tile('sent', 'write', '따라쓰기', '단어 · 문장을 노트에')}
        ${tile('tr', 'keyboard', '작문 · 번역', '문장을 직접 입력')}
      </div>`;
    const h = DB.hist.slice(0, 8);
    $('#quizHistory').innerHTML = h.length
      ? h.map((r) => `${fmtDate(r.t)} · ${esc(r.label || '')} · <b style="color:var(--fg)">${r.ok}/${r.n}</b>`).join('<br>')
      : '아직 기록이 없습니다';
  }
  $('#quizBox').onclick = (e) => {
    const b = e.target.closest('[data-go]');
    if (!b || b.disabled) return;
    const g = b.dataset.go;
    if (g === 'level') return pickLevel();
    if (g === 'learn') return startQuiz({ pool: () => scopeWords().filter((w) => DB.st[w.w] !== 2), label: scopeName() });
    if (g === 'dueR') return startDueR();
    if (g === 'dueW') return startDueW();
    if (g === 'tone') return startQuiz({ pool: () => scopeWords(), label: '성조 · ' + scopeName(), types: ['tone'] });
    if (g === 'write') {
      // 아직 못 쓰는 단어 중 뜻을 외운 단어부터 (모자라면 나머지도)
      const pool = () => {
        const left = scopeWords().filter((w) => canWrite(w) && !canWriteW(w));
        const knownFirst = left.filter((w) => DB.st[w.w] === 2);
        return knownFirst.length >= 10 ? knownFirst : left;
      };
      return startQuiz({ pool, label: '쓰기 연습', types: ['write'], count: 10 });
    }
    if (g === 'sent') return startSentences();
    if (g === 'tr') return startTranslate();
    if (g === 'gram') return startGrammarQuiz();
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
    const usedS = new Set();
    return picked.map((w) => {
      let ts = types.filter((t) => (t !== 'write' || canWrite(w)) && (!isTr(t) || SENTS.length));
      if (!ts.length) ts = ['meaning'];
      const type = ts[(Math.random() * ts.length) | 0];
      const q = { w, type };
      if (isTr(type)) {
        // 그 단어가 들어간 예문을 우선 (없으면 같은 급수의 다른 예문)
        q.s = pickSentences(1, w, usedS)[0];
        usedS.add(sid(q.s));
      } else if (type === 'tone') q.opts = shuffle([w, ...toneOptions(w)]);
      else if (type !== 'write') q.opts = shuffle([w, ...distractors(w, type)]);
      return q;
    });
  }

  // pool: 단어 배열, 또는 그때그때 범위를 다시 계산하는 함수 (다음 문제를 누를 때 새로 외운 단어를 빼기 위해)
  function startQuiz({ pool, label, review = false, types = MIX, count = 10, guided = true }) {
    const getPool = typeof pool === 'function' ? pool : () => pool;
    const first = getPool();
    if (!first.length) return toast('문제를 낼 단어가 없습니다');
    if (!types.length) types = ['meaning'];
    const asked = new Set();
    const regen = () => {
      const all = getPool();
      const n = Math.min(count, all.length);
      if (!n) return [];
      // 이번에 아직 안 나온 단어를 먼저
      const fresh = all.filter((w) => !asked.has(w.w));
      const src = fresh.length >= n ? fresh : fresh.concat(shuffle(all.filter((w) => asked.has(w.w))).slice(0, n - fresh.length));
      const qs = buildQuestions(src, types, n);
      qs.forEach((q) => {
        asked.add(q.w.w);
        if (q.type === 'write') q.wmode = guided ? DB.set.wMode || 'trace' : 'free';
      });
      return qs;
    };
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
    let retryRound = false; // 틀린 문제 다시 풀기 중인지
    const firstCount = qs.length;
    openLayer({
      title: label || '문제',
      cls: 'quiz-layer',
      onClose: () => writer && writer.cancelQuiz && writer.cancelQuiz(),
      render: (L) => {
        const restart = (list, isRetry = false) => {
          retryRound = isRetry;
          i = 0;
          results = [];
          qs = list;
          L.body.onclick = onAnswer;
          show();
        };
        const remake = (r) => {
          if (r.q && (r.type === 'gap' || r.type === 'order')) return { type: r.type, g: r.q.g, it: r.q.it, s: r.q.s };
          const q = { w: r.w, type: r.type };
          if (r.type === 'tone') q.opts = shuffle([r.w, ...toneOptions(r.w)]);
          else if (isTr(r.type)) q.s = r.s;
          else if (r.type === 'write') q.wmode = 'free'; // 틀린 쓰기는 안 보고 다시
          else if (r.type !== 'write') q.opts = shuffle([r.w, ...distractors(r.w, r.type)]);
          return q;
        };

        const finish = () => {
          const graded = results.filter((r) => !r.practice);
          const practiced = results.length - graded.length;
          const ok = graded.filter((r) => r.ok).length;
          const n = graded.length;
          if (n) {
            DB.hist.unshift({ t: Date.now(), n, ok, label });
            DB.hist = DB.hist.slice(0, 50);
          }
          save();
          const wrongs = graded.filter((r) => !r.ok);
          const solved = results.filter((r) => r.solved).length;
          const pct = n ? ok / n : 1;
          const C = 2 * Math.PI * 52;
          const msg = !n ? '연습 끝' : retryRound ? (ok === n ? '틀린 문제를 모두 맞혔어요' : '틀린 문제 다시 풀기 끝') : ok === n ? '전부 맞혔어요' : pct >= 0.8 ? '잘했어요' : pct >= 0.5 ? '조금만 더' : '틀린 단어부터 다시 봐요';
          const uniq = [...new Map(wrongs.filter((r) => r.w).map((r) => [r.w.w, r.w])).values()];
          L.body.innerHTML = `<div class="qz">
            <div class="qz-prompt result">
              <div class="ring">
                <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="ring-bg"/><circle cx="60" cy="60" r="52" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
                <div class="ring-num">${n ? `<b>${ok}</b><span>/ ${n}</span>` : `<b>${practiced}</b><span>개</span>`}</div>
              </div>
              <div class="result-msg">${msg}</div>
              <div class="result-stats">${n ? `<span>정답 <b>${ok}</b></span><span>오답 <b>${wrongs.length}</b></span>` : ''}${solved ? `<span>오답 해결 <b>${solved}</b></span>` : ''}${practiced ? `<span>연습 <b>${practiced}</b></span>` : ''}</div>
              ${uniq.length ? `<div class="wrong-chips" aria-label="틀린 단어">${uniq.map((w) => `<button class="zh" data-w="${esc(w.w)}">${esc(w.w)}</button>`).join('')}</div><div class="muted small">틀린 단어는 오답노트에 담겼어요 · 누르면 단어 보기</div>` : ''}
            </div>
            <div class="qz-bottom">${
              retryRound
                ? // 틀린 문제까지 다시 푼 뒤: 다음 문제(같은 설정, 새 단어) / 홈으로
                  `${regen ? `<button class="primary big-btn" data-act="more">다음 문제 ${ic('chevronRight')}</button>` : ''}
              <button class="big-btn" data-act="home">${ic('home')} 홈으로</button>`
                : `${wrongs.length ? `<button class="primary big-btn" data-act="retryWrong">틀린 ${wrongs.length}문제 다시 풀기</button>` : ''}
              ${regen ? `<button class="${wrongs.length ? '' : 'primary '}big-btn" data-act="more">${n ? '다음 문제' : '다음'} ${firstCount}${n ? '개' : '문장'} ${ic('chevronRight')}</button>` : ''}
              <div class="row2"><button data-act="notes">${ic('notes')} 오답노트</button><button data-act="home">${ic('home')} 홈으로</button></div>`
            }
            </div></div>`;
          L.body.onclick = (e) => {
            const chip = e.target.closest('[data-w]');
            if (chip) return openWord(chip.dataset.w);
            const b = e.target.closest('[data-act]');
            if (!b) return;
            const a = b.dataset.act;
            if (a === 'retryWrong') {
              const left = wrongs.filter((r) => !r.w || DB.st[r.w.w] !== 2); // 그사이 외웠다고 표시한 단어는 빼고
              if (!left.length) return toast('틀린 단어를 모두 외운 단어로 표시했어요');
              restart(shuffle(left.map(remake)), true);
            }
            if (a === 'more') {
              const next = regen();
              if (!next.length) return toast('이 범위에 남은 단어가 없어요');
              restart(next);
            }
            if (a === 'notes' || a === 'home') {
              closeTopLayer();
              setTimeout(() => goTab(a), 0);
            }
          };
        };

        const record = (q, ok, answer) => {
          answered = true;
          const r = { w: q.w, type: q.type, ok };
          if (q.type === 'write') {
            if (ok) r.solved = writePass(q.w);
            else addWrong(q.w, 'write', answer);
          } else if (ok) {
            r.solved = markRight(q.w);
            if (DB.st[q.w.w] === 2) srsHit(q.w, 'r', true);
            else if (!DB.st[q.w.w]) DB.st[q.w.w] = 1;
          } else addWrong(q.w, q.type, answer);
          tick();
          results.push(r);
          save();
          return r;
        };

        // 답한 뒤: 문제 아래에 짧은 결과 한 줄, 맨 아래 버튼은 [발음][단어][다음]
        const feedback = (q, r) => {
          $('.qz', L.body).classList.add('answered');
          const fb = $('.qz-fb', L.body);
          fb.className = 'qz-fb ' + (r.practice ? 'note' : r.ok ? 'ok' : 'bad');
          fb.innerHTML = `<span class="fb-mark">${ic(r.practice ? 'brush' : r.ok ? 'check' : 'x')}</span><span class="fb-t"><b>${r.practice ? '따라 쓰기 완료' : r.ok ? '정답' : '오답'}</b>${r.solved ? ' · 오답 해결' : ''}<span class="fb-ans"><span class="zh">${esc(q.w.w)}</span> <span class="py">${esc(q.w.p)}</span> ${esc(meaning(q.w))}</span></span>`;
          const mid = $('.qz-mid', L.body);
          if (mid && !mid.innerHTML.trim() && q.type !== 'listen') mid.innerHTML = replayBtn();
          $('.qz-actions', L.body).innerHTML = `<button data-act="detail">단어 보기</button>${markBtns(q.w, q.type)}<button class="primary grow" data-act="next">${i + 1 >= qs.length ? '결과 보기' : '다음 ' + ic('chevronRight')}</button>`;
          $('[data-act=next]', L.body).focus({ preventScroll: true });
        };

        const replayBtn = () => `<button class="replay" data-act="speakQ" aria-label="다시 듣기" title="다시 듣기">${ic('sound')}</button>`;
        const markBtns = (w, type) =>
          `<button class="mini ${DB.star[w.w] ? 'star-on' : ''}" data-act="qStar" aria-pressed="${!!DB.star[w.w]}" aria-label="즐겨찾기" title="즐겨찾기">${ic(DB.star[w.w] ? 'starFill' : 'star')}</button>` +
          (type === 'write'
            ? `<button class="mini ${canWriteW(w) ? 'write-on' : ''}" data-act="qBrush" aria-pressed="${canWriteW(w)}" aria-label="쓸 수 있음" title="쓸 수 있음">${ic(canWriteW(w) ? 'brushFill' : 'brush')}</button>`
            : `<button class="mini ${DB.st[w.w] === 2 ? 'known-on' : ''}" data-act="qKnown" aria-pressed="${DB.st[w.w] === 2}" aria-label="외운 단어" title="외운 단어">${ic(DB.st[w.w] === 2 ? 'circleCheck' : 'circle')}</button>`);
        const head = (q) =>
          `<div class="qz-top"><div class="q-progress"><i style="width:${(i / qs.length) * 100}%"></i></div><div class="q-kind">${
            q.type === 'gap' || q.type === 'order'
              ? `<div class="seg sp-mode"><button data-gmode="gap" class="${q.type === 'gap' ? 'on' : ''}">빈칸</button><button data-gmode="order" class="${q.type === 'order' ? 'on' : ''}">어순</button></div>`
              : isTr(q.type)
              ? `<div class="seg sp-mode"><button data-trmode="trzh" class="${q.type === 'trzh' ? 'on' : ''}">작문 한→중</button><button data-trmode="trko" class="${q.type === 'trko' ? 'on' : ''}">번역 중→한</button></div>`
              : q.type === 'write'
                ? `<div class="seg sp-mode"><button data-wmode="trace" class="${q.wmode === 'trace' ? 'on' : ''}">보고 쓰기</button><button data-wmode="free" class="${q.wmode !== 'trace' ? 'on' : ''}">안 보고 쓰기</button></div>`
                : `<span>${TYPE_NAME[q.type]}</span>`
          }<span>${i + 1} / ${qs.length}</span></div></div>`;

        const show = () => {
          if (writer && writer.cancelQuiz) writer.cancelQuiz();
          writer = null;
          answered = false;
          if (i >= qs.length) return finish();
          const q = qs[i];
          const w = q.w;
          if (q.type === 'write') return showWrite(q);
          if (isTr(q.type)) return showTr(q);
          if (q.type === 'gap') return showGap(q);
          if (q.type === 'order') return showOrder(q);
          let prompt = '';
          const big = `<div class="qz-zh zh" style="font-size:${zhSize(w.w)}px">${esc(w.w)}</div>`;
          if (q.type === 'meaning') prompt = `${big}<div class="qz-ask">이 단어의 뜻은?</div>`;
          if (q.type === 'word') prompt = `<div class="qz-ko">${esc(meaning(w))}</div><div class="qz-ask">알맞은 한자는?</div>`;
          if (q.type === 'pinyin') prompt = `${big}<div class="qz-ask">알맞은 병음은?</div>`;
          if (q.type === 'tone') prompt = `${big}<div class="qz-ask">성조가 맞는 병음은?</div>`;
          if (q.type === 'listen') prompt = `<button class="listen" data-act="speakQ" aria-label="다시 듣기">${ic('sound')}</button><div class="qz-ask">듣고 알맞은 단어를 고르세요</div>`;
          const zhOpts = q.type === 'word' || q.type === 'listen';
          const label = (o) => (q.type === 'meaning' ? esc(meaning(o)) : q.type === 'pinyin' || q.type === 'tone' ? esc(o.p) : esc(o.w));
          L.body.innerHTML = `<div class="qz">${head(q)}
            <div class="qz-prompt">${prompt}</div>
            <div class="qz-mid">${q.type === 'meaning' || q.type === 'tone' ? replayBtn() : ''}</div>
            <div class="qz-fb"></div>
            <div class="qz-bottom">
              <div class="opts ${zhOpts ? 'grid2' : ''}">${q.opts.map((o, k) => `<button data-k="${k}" class="${zhOpts ? 'zh zh-opt' : ''}">${label(o)}</button>`).join('')}</div>
              <div class="qz-actions"><button class="ghost" data-act="idk">모르겠어요</button></div>
            </div></div>`;
          if (q.type === 'listen' || q.type === 'tone' || (DB.set.autoSpeak && q.type !== 'word' && q.type !== 'pinyin')) setTimeout(() => speak(w.w), 150);
        };



        // 문법 문제 기록 (단어 오답노트와는 별개, 문법별 맞힌/틀린 수)
        const recordG = (q, ok) => {
          answered = true;
          if (q.g) {
            const st = (DB.gram[q.g.id] = DB.gram[q.g.id] || {});
            if (ok) st.ok = (st.ok || 0) + 1;
            else st.x = (st.x || 0) + 1;
          }
          tick();
          const r = { type: q.type, ok, q };
          results.push(r);
          save();
          return r;
        };
        const gFeedback = (q, r, x) => {
          $('.qz', L.body).classList.add('answered');
          const fb = $('.qz-fb', L.body);
          fb.className = 'qz-fb ' + (r.ok ? 'ok' : 'bad');
          fb.innerHTML = `<span class="fb-mark">${ic(r.ok ? 'check' : 'x')}</span><span class="fb-t"><b>${r.ok ? '정답' : '오답'}</b>${q.g ? `<span class="fb-ans">${esc(q.g.t)}</span>` : ''}</span>`;
          $('.qz-mid', L.body).innerHTML = `<button class="replay" data-act="sayS" aria-label="듣기" title="듣기">${ic('sound')}</button>`;
          $('.qz-actions', L.body).innerHTML = `${q.g ? '<button data-act="gramOpen">문법 보기</button>' : ''}<button class="primary grow" data-act="next">${i + 1 >= qs.length ? '결과 보기' : '다음 ' + ic('chevronRight')}</button>`;
          speak(sentText(x));
        };
        // 빈칸: 문장 속 문법 글자를 고름
        const showGap = (q) => {
          const x = q.it;
          const sentHTML = x.z.map((t, k) => (k === x.b ? '<span class="gap-slot">　　</span>' : `<span class="zh">${esc(t)}</span>`)).join('');
          L.body.innerHTML = `<div class="qz">${head(q)}
            <div class="qz-prompt sp"><div class="gap-sent zh">${sentHTML}</div><div class="sp-ko">${esc(x.k)}</div><div class="qz-ask">빈칸에 알맞은 말은?</div></div>
            <div class="qz-mid"></div><div class="qz-fb"></div>
            <div class="qz-bottom"><div class="opts grid3">${shuffle(x.o.slice()).map((o) => `<button class="zh zh-opt" data-gopt="${esc(o)}">${esc(o)}</button>`).join('')}</div>
            <div class="qz-actions"><button class="ghost" data-act="gIdk">모르겠어요</button></div></div></div>`;
        };
        const answerGap = (q, pick) => {
          const x = q.it;
          const right = x.z[x.b];
          const ok = pick === right;
          const r = recordG(q, ok);
          $$('[data-gopt]', L.body).forEach((b) => {
            b.disabled = true;
            if (b.dataset.gopt === right) b.classList.add('right');
            else if (b.dataset.gopt === pick) b.classList.add('wrong');
          });
          $('.gap-sent', L.body).outerHTML = rubyHTML(x);
          gFeedback(q, r, x);
        };
        // 어순: 섞인 단어 상자를 순서대로 눌러 문장 완성
        const showOrder = (q) => {
          const x = q.s;
          const toks = x.z.map((t, k) => ({ t, k })).filter((o) => x.p[o.k]);
          const tail = x.z.filter((t, k) => !x.p[k] && k === x.z.length - 1).join('');
          let pool = shuffle(toks.slice());
          if (pool.every((o, j) => o.k === toks[j].k)) pool = pool.reverse();
          q.pick = [];
          q.pool = pool;
          q.tail = tail;
          L.body.innerHTML = `<div class="qz">${head(q)}
            <div class="qz-prompt sp"><div class="sp-ko">${esc(x.k)}</div><div class="qz-ask">단어를 순서대로 눌러 문장을 만드세요</div>
              <div class="ord-ans"></div><div class="ord-pool"></div></div>
            <div class="qz-mid"></div><div class="qz-fb"></div>
            <div class="qz-bottom"><div class="qz-actions"><button class="ghost" data-act="gIdk">모르겠어요</button><button class="primary grow" data-act="ordCheck" disabled>확인</button></div></div></div>`;
          drawOrder(q);
        };
        const drawOrder = (q) => {
          $('.ord-ans', L.body).innerHTML = q.pick.length
            ? q.pick.map((o, j) => `<button class="ord-chip zh" data-ans="${j}">${esc(o.t)}</button>`).join('') + (q.tail ? `<span class="zh ord-tail">${esc(q.tail)}</span>` : '')
            : '<span class="ord-hint">여기에 문장이 만들어져요</span>';
          $('.ord-pool', L.body).innerHTML = q.pool.map((o, j) => `<button class="ord-chip zh" data-pool="${j}" ${o.used ? 'disabled' : ''}>${esc(o.t)}</button>`).join('');
          const btn = $('[data-act=ordCheck]', L.body);
          if (btn) btn.disabled = q.pick.length !== q.pool.length;
        };
        const answerOrder = (q, giveUp) => {
          const x = q.s;
          const want = x.z.filter((t, k) => x.p[k]).join('|');
          const got = q.pick.map((o) => o.t).join('|');
          const ok = !giveUp && got === want;
          const r = recordG(q, ok);
          $$('.ord-chip', L.body).forEach((b) => (b.disabled = true));
          $('.ord-ans', L.body).classList.add(ok ? 'ok' : 'bad');
          $('.ord-pool', L.body).outerHTML = `<div class="ord-right">${rubyHTML(x)}</div>`;
          gFeedback(q, r, x);
        };

        // 문장 번역·작문 입력 (채점 없이 모범 답안과 비교)
        const showTr = (q) => {
          const x = q.s;
          const toZh = q.type === 'trzh';
          L.body.innerHTML = `<div class="qz">${head(q)}
            <div class="qz-prompt sp">
              ${toZh ? `<div class="sp-ko">${esc(x.k)}</div><div class="qz-ask">중국어로 옮겨 써 보세요</div>` : `<div class="sp-zh zh">${esc(sentText(x))}</div><div class="qz-ask">한국어로 옮겨 써 보세요</div>`}
              <textarea id="trIn" class="tr-in ${toZh ? 'zh' : ''}" rows="2" placeholder="${toZh ? '중국어로 입력' : '한국어로 입력'}" autocomplete="off" autocorrect="off" spellcheck="false"></textarea>
              <div class="sp-answer"></div>
            </div>
            <div class="qz-mid">${toZh ? '' : replayBtn()}</div>
            <div class="qz-fb"></div>
            <div class="qz-bottom"><div class="qz-actions"><button class="ghost" data-act="idk">모르겠어요</button><button class="primary grow" data-act="trSubmit">확인</button></div></div></div>`;
          setTimeout(() => $('#trIn', L.body) && $('#trIn', L.body).focus({ preventScroll: true }), 50);
          if (!toZh && DB.set.autoSpeak) setTimeout(() => speak(sentText(x)), 150);
        };
        const revealTr = (q) => {
          const x = q.s;
          const toZh = q.type === 'trzh';
          const ta = $('#trIn', L.body);
          const mine = ta.value.trim();
          ta.readOnly = true;
          answered = true;
          results.push({ w: q.w, type: q.type, s: x, practice: true });
          tick();
          DB.sent[sid(x)] = Date.now();
          save();
          let line = '';
          if (toZh) {
            const c = compareZh(sentText(x), mine);
            $('.sp-answer', L.body).innerHTML = `<div class="ans-label">모범 답안</div>${rubyHTML(x, mine ? c.missed : null)}<div class="ans-ko muted small">${esc(x.k)}</div>`;
            line = !mine ? '모범 답안을 보고 노트에 따라 써 보세요' : c.exact ? '모범 답안과 똑같아요' : `모범 답안과 겹치는 글자 ${c.pct}% · 표시된 글자가 내 답에 없어요`;
          } else {
            $('.sp-zh', L.body).outerHTML = rubyHTML(x); // 원문 자리에 병음을 달아서
            $('.sp-answer', L.body).innerHTML = `<div class="ans-label">모범 답안</div><div class="ans-ko">${esc(x.k)}</div>`;
            line = mine ? '뜻이 같으면 다르게 써도 괜찮아요' : '모범 답안을 확인해 보세요';
          }
          if (!mine) ta.remove();
          const fb = $('.qz-fb', L.body);
          fb.className = 'qz-fb note';
          fb.innerHTML = `<span class="fb-mark">${ic('chat')}</span><span class="fb-t">${line}</span>`;
          $('.qz', L.body).classList.add('answered');
          $('.qz-mid', L.body).innerHTML = `${replayBtn()}<button class="replay" data-act="slow" aria-label="느리게 듣기" title="느리게 듣기">${ic('snail')}</button>`;
          $('.qz-actions', L.body).innerHTML = `<button class="primary grow" data-act="next">${i + 1 >= qs.length ? '결과 보기' : '다음 ' + ic('chevronRight')}</button>`;
          if (toZh) speak(sentText(x));
        };

        const showWrite = (q) => {
          const w = q.w;
          const chars = [...w.w];
          let ci = 0;
          let worst = 0;
          let total = 0;
          const tr = (q.wmode || 'trace') === 'trace'; // 보고 쓰기(획순 안내, 채점 없음) / 안 보고 쓰기(채점)
          L.body.innerHTML = `<div class="qz">${head(q)}
            <div class="qz-prompt write"><div class="qz-ko">${esc(meaning(w))}</div><div class="qz-py">${esc(w.p)} <button class="ghost icon-btn" data-act="speakQ" aria-label="발음 듣기">${ic('sound')}</button></div></div>
            <div class="write-wrap"><div class="write-chars"></div><div class="pad"></div><div class="write-status muted"></div></div>
            <div class="qz-mid"></div>
            <div class="qz-fb"></div>
            <div class="qz-bottom"><div class="qz-actions">${
              tr ? `<button class="ghost" data-act="skipQ">건너뛰기</button>` : `<button class="ghost" data-act="idk">모르겠어요 (정답 보기)</button>`
            }</div></div></div>`;
          const status = (t, c) => {
            const s = $('.write-status', L.body);
            s.textContent = t;
            s.style.color = c === 'bad' ? 'var(--bad)' : c === 'ok' ? 'var(--ok)' : '';
          };
          const drawChars = () =>
            ($('.write-chars', L.body).innerHTML = chars
              .map((c, k) =>
                tr
                  ? `<span class="zh ${k < ci ? 'done' : k === ci ? 'cur' : ''}">${esc(c)}</span>`
                  : `<span class="zh ${k < ci ? 'done' : k === ci ? 'cur blank' : 'blank'}">${k < ci ? esc(c) : '□'}</span>`,
              )
              .join(''));
          const next = () => {
            drawChars();
            if (ci >= chars.length) {
              if (tr) {
                // 보고 쓰기는 연습: 채점하지 않음
                answered = true;
                const r = { w, type: 'write', practice: true };
                results.push(r);
                tick();
                save();
                status('다 따라 썼어요', 'ok');
                return feedback(q, r);
              }
              const ok = worst < 3;
              const r = record(q, ok, `쓰기 (틀린 획 ${total})`);
              status(ok ? (total ? `완성 · 틀린 획 ${total}개` : '완벽해요!') : `틀린 획이 많아요 (${total}개)`, ok ? 'ok' : 'bad');
              feedback(q, r);
              return;
            }
            let m = 0;
            status(tr ? '번호 순서대로, 화살표 방향으로 따라 써 보세요' : `${ci + 1}번째 글자를 쓰세요${chars.length > 1 ? ` (${chars.length}글자)` : ''}`);
            if (writer && writer.cancelQuiz) writer.cancelQuiz();
            writer = makeWriter($('.pad', L.body), {
              char: chars[ci],
              outline: tr,
              guide: tr,
              hint: tr ? 1 : DB.set.hint,
              onLoadError: () => status('이 글자의 획순 데이터를 불러오지 못했습니다', 'bad'),
            });
            const myWriter = writer;
            writer.quiz({
              onMistake: () => {
                m++;
                if (!tr) status(`틀린 획 ${m}개`, 'bad');
              },
              onCorrectStroke: (d) => myWriter.guide.set(d.strokeNum + 1),
              onComplete: (d) => {
                myWriter.guide.hide();
                if (myWriter !== writer) return;
                if (!tr) {
                  worst = Math.max(worst, d.totalMistakes);
                  total += d.totalMistakes;
                }
                ci++;
                setTimeout(() => myWriter === writer && next(), 450);
              },
            });
          };
          next();
          if (DB.set.autoSpeak) setTimeout(() => speak(w.w), 150);
        };

        const act0 = (b) => b.dataset.act;
        const onAnswer = (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          const q = qs[i];
          if (!q) return;
          if (b.dataset.w && !b.dataset.act) return openWord(b.dataset.w);
          if (b.dataset.gmode) {
            DB.set.gMode = b.dataset.gmode;
            save();
            if (regen) return restart(regen());
            return;
          }
          if (act0(b) === 'sayS') return speak(sentText(q.s || q.it));
          if (act0(b) === 'gramOpen') return q.g && openGrammar(q.g.id);
          if (!answered && b.dataset.gopt != null) return answerGap(q, b.dataset.gopt);
          if (!answered && q.type === 'order' && b.dataset.pool != null) {
            const o = q.pool[+b.dataset.pool];
            if (o.used) return;
            o.used = true;
            q.pick.push(o);
            return drawOrder(q);
          }
          if (!answered && q.type === 'order' && b.dataset.ans != null) {
            const o = q.pick.splice(+b.dataset.ans, 1)[0];
            o.used = false;
            return drawOrder(q);
          }
          if (!answered && act0(b) === 'ordCheck') return answerOrder(q, false);
          if (!answered && act0(b) === 'gIdk') return q.type === 'gap' ? answerGap(q, null) : answerOrder(q, true);
          if (b.dataset.wmode) {
            // 보고 쓰기 / 안 보고 쓰기 전환: 지금 문제(답하기 전)부터 끝까지
            DB.set.wMode = b.dataset.wmode;
            save();
            for (let k = answered ? i + 1 : i; k < qs.length; k++) if (qs[k].type === 'write') qs[k].wmode = b.dataset.wmode;
            if (!answered) return show();
            $$('[data-wmode]', L.body).forEach((y) => y.classList.toggle('on', y.dataset.wmode === b.dataset.wmode));
            return;
          }
          if (b.dataset.trmode) {
            // 작문/번역 전환: 지금 문제(답하기 전)부터 끝까지
            DB.set.trMode = b.dataset.trmode;
            save();
            for (let k = answered ? i + 1 : i; k < qs.length; k++) if (isTr(qs[k].type)) qs[k].type = b.dataset.trmode;
            if (!answered) return show();
            $$('[data-trmode]', L.body).forEach((y) => y.classList.toggle('on', y.dataset.trmode === b.dataset.trmode));
            return;
          }
          const act = b.dataset.act;
          if (act === 'speakQ' || act === 'speakAns') return speak(q.s ? sentText(q.s) : q.w.w);
          if (act === 'slow') return speak(q.s ? sentText(q.s) : q.w.w, 0.5);
          if (act === 'qStar' || act === 'qKnown' || act === 'qBrush') {
            const w = q.w;
            if (act === 'qStar') {
              if (DB.star[w.w]) delete DB.star[w.w];
              else DB.star[w.w] = Date.now();
            } else if (act === 'qBrush') setWritable(w, !canWriteW(w));
            else setKnown(w, DB.st[w.w] !== 2);
            save();
            const tmp = document.createElement('div');
            tmp.innerHTML = markBtns(w, q.type);
            const nb = tmp.querySelector(`[data-act=${act}]`);
            nb.classList.add('pop');
            b.replaceWith(nb);
            return;
          }
          if (act === 'detail') return openWord(q.w.w);
          if (act === 'next') {
            i++;
            return show();
          }
          if (act === 'skipQ') {
            i++;
            return show();
          }
          if (answered) return;
          if (isTr(q.type) && (act === 'trSubmit' || act === 'idk')) {
            if (act === 'idk') $('#trIn', L.body).value = '';
            return revealTr(q);
          }
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
            const mine = q.type === 'meaning' ? meaning(o) : q.type === 'pinyin' || q.type === 'tone' ? o.p : o.w;
            const r = record(q, ok, `${mine}${q.type === 'meaning' || q.type === 'pinyin' || q.type === 'tone' ? '' : ` (${o.p})`}`);
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
    if (!b) return;
    b.hidden = !n;
    b.textContent = n > 99 ? '99+' : n;
  }
  const noteBook = () => (DB.set.noteKind === 'write' ? DB.wwrong : DB.wrong);
  function renderNotes() {
    const kind = DB.set.noteKind === 'write' ? 'write' : 'word';
    $$('#noteKind button').forEach((b) => {
      b.classList.toggle('on', b.dataset.k === kind);
      const book = b.dataset.k === 'write' ? DB.wwrong : DB.wrong;
      const c = Object.values(book).filter((x) => !x.ok).length;
      b.textContent = (b.dataset.k === 'write' ? '쓰기' : '단어') + (c ? ` ${c}` : '');
    });
    $('#noteReview').hidden = kind !== 'word';
    $('#noteWrite').hidden = kind !== 'write';
    const all = Object.entries(noteBook()).map(([w, n]) => ({ w: BY.get(w), n })).filter((x) => x.w);
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
    $('#noteHelp').innerHTML =
      kind === 'write'
        ? '안 보고 쓰기에서 틀린 획이 많았던 단어가 모입니다. <b>쓰기로 다시 풀기</b>에서 <b>2번 연속</b> 통과하면 ‘해결’로 옮겨집니다.'
        : '단어 문제를 틀리면 자동으로 여기에 모입니다. 다시 풀어서 <b>2번 연속</b> 맞히면 ‘해결’로 옮겨집니다.';
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
  $('#noteKind').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    DB.set.noteKind = b.dataset.k;
    save();
    renderNotes();
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
  const openWrongWords = (book = DB.wrong) => Object.keys(book).filter((w) => !book[w].ok).map((w) => BY.get(w)).filter(Boolean);
  $('#noteReview').onclick = () => {
    const pool = openWrongWords();
    // 틀렸던 유형으로 다시 (쓰기 제외), 없으면 기본 유형
    startQuiz({ pool, label: '오답 다시 풀기', review: true, types: ['meaning', 'word', 'pinyin', 'listen'], count: Math.min(20, pool.length) });
  };
  $('#noteWrite').onclick = () => {
    const pool = openWrongWords(DB.wwrong).filter(canWrite);
    startQuiz({ pool: () => openWrongWords(DB.wwrong).filter(canWrite), label: '쓰기 오답', review: true, types: ['write'], count: Math.min(10, pool.length), guided: false });
  };
  $('#noteList').onclick = (e) => {
    const li = e.target.closest('li[data-w]');
    if (li) openNote(li.dataset.w, DB.set.noteKind === 'write');
  };
  function openNote(word, isWrite = false) {
    const book = isWrite ? DB.wwrong : DB.wrong;
    const w = BY.get(word);
    const n = book[word];
    if (!w || !n) return;
    openLayer({
      title: isWrite ? '쓰기 오답' : '오답 노트',
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
            if (isWrite) return runQuiz([{ w, type: 'write', wmode: 'free' }], '쓰기 오답: ' + w.w, true);
            const types = ['meaning', 'word', 'pinyin', 'listen'];
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
              delete book[word];
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
    $('#setGoal').value = String(s.goal || 20);
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
  bindSet('#setGoal', 'goal', (v) => +v);
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
      fetch('data/sentences.json')
        .then((r) => r.json())
        .then((d) => (SENTS = d))
        .catch(() => {});
      fetch('data/grammar.json')
        .then((r) => r.json())
        .then((d) => {
          GRAM = d;
          if (curTab === 'grammar') renderGrammar();
          if (curTab === 'home' && !stack.length) renderHome();
        })
        .catch(() => {});
    } catch (e) {
      $('#wordList').innerHTML = '<li class="empty" style="display:block">단어 데이터를 불러오지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.</li>';
      return;
    }
    for (const w of WORDS) BY.set(w.w, w);
    // 예전부터 외움/쓸 수 있음이던 단어는 내일부터 복습 일정에 넣음
    for (const w of WORDS) {
      if (DB.st[w.w] === 2 && !srsGet(w, 'r')) srsSet(w, 'r', 1);
      if (canWriteW(w) && !srsGet(w, 'w')) srsSet(w, 'w', 1);
    }
    save();
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
