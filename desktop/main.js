// HSK 단어장 Windows 앱: 웹 앱(GitHub Pages)을 창으로 띄움.
// 앱 내용은 항상 최신 웹 버전을 받아오고, 한 번 열면 오프라인에서도 열림(서비스 워커 캐시).
const { app, BrowserWindow, shell, Menu, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const URL = process.env.HSK_URL || 'https://t43ky.github.io/HSK/';
const ORIGIN = new globalThis.URL(URL).origin;

if (!app.requestSingleInstanceLock()) app.quit();

const stateFile = () => path.join(app.getPath('userData'), 'window.json');
const loadState = () => {
  try {
    return JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
  } catch {
    return { width: 1200, height: 820 };
  }
};

let win;
function create() {
  const st = loadState();
  const area = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: Math.min(st.width || 1200, area.width),
    height: Math.min(st.height || 820, area.height),
    x: st.x,
    y: st.y,
    minWidth: 360,
    minHeight: 560,
    title: 'HSK 단어장',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    backgroundColor: '#f7f7f8',
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: false },
  });
  if (st.max) win.maximize();
  Menu.setApplicationMenu(null);

  // 앱 밖 링크는 기본 브라우저로
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(ORIGIN)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  // 처음 실행인데 인터넷이 안 될 때
  win.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
    if (!isMain || code === -3) return;
    win.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui,'Malgun Gothic';display:grid;place-items:center;height:90vh;color:#444">
        <div style="text-align:center"><h2>인터넷에 연결할 수 없어요</h2><p>처음 한 번은 인터넷이 필요해요. 그 다음부터는 오프라인에서도 열려요.</p>
        <button onclick="location.href='${URL}'" style="padding:10px 18px;border-radius:10px;border:1px solid #ccc;font-size:15px">다시 시도</button></div>`),
    );
  });
  // F5 새로고침, Ctrl+Shift+I 개발자 도구, Ctrl +/-/0 확대·축소
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    const wc = win.webContents;
    if (input.key === 'F5') wc.reload();
    else if (input.control && input.shift && input.key.toLowerCase() === 'i') wc.toggleDevTools();
    else if (input.control && (input.key === '=' || input.key === '+')) wc.setZoomLevel(wc.getZoomLevel() + 0.5);
    else if (input.control && input.key === '-') wc.setZoomLevel(wc.getZoomLevel() - 0.5);
    else if (input.control && input.key === '0') wc.setZoomLevel(0);
    else return;
    e.preventDefault();
  });
  win.on('close', () => {
    const b = win.getNormalBounds();
    try {
      fs.writeFileSync(stateFile(), JSON.stringify({ ...b, max: win.isMaximized() }));
    } catch {}
  });
  win.loadURL(URL);
}

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});
app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
