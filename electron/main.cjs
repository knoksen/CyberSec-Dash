/* eslint-env node */
// Electron main process (CommonJS to avoid ESM friction with type: module)
const { app, BrowserWindow, Menu, dialog, ipcMain, shell, Tray, nativeImage } = require('electron');
const path = require('path');
const http = require('http');
const { createServer } = require('./server.cjs');
const fs = require('fs');
let autoUpdater = null;
try {
  // Lazy load electron-updater to avoid issues during dev if not installed yet
  ({ autoUpdater } = require('electron-updater'));
} catch { /* electron-updater optional in dev */ }

// Simple settings persisted in userData/settings.json
const DEFAULT_SETTINGS = { startMinimized: false, autoHideMenuBar: true, alwaysOnTop: false, closeToTray: false };
let SETTINGS = { ...DEFAULT_SETTINGS };
let PENDING_DEEP_LINKS = [];
let tray = null;
function getSettingsPath() {
  try { return path.join(app.getPath('userData'), 'settings.json'); } catch { return null; }
}
function loadSettings() {
  try {
    const p = getSettingsPath();
    if (!p) return;
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
      SETTINGS = { ...DEFAULT_SETTINGS, ...raw };
    }
  } catch { /* ignore */ }
}
function saveSettings() {
  try {
    const p = getSettingsPath();
    if (!p) return;
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(SETTINGS, null, 2), 'utf8');
  } catch { /* ignore */ }
}
function getLogDir() {
  try { return path.join(app.getPath('userData'), 'logs'); } catch { return null; }
}
function getDataDir() {
  try { return app.getPath('userData'); } catch { return null; }
}
function getStartOnLogin() {
  try { return !!app.getLoginItemSettings().openAtLogin; } catch { return false; }
}
function setStartOnLogin(val) {
  try { app.setLoginItemSettings({ openAtLogin: !!val }); } catch { /* ignore */ }
}
function logError(message, err) {
  try {
    const dir = getLogDir();
    if (!dir) return;
    fs.mkdirSync(dir, { recursive: true });
    const line = `[${new Date().toISOString()}] ${message}${err ? `\n${(err && err.stack) || String(err)}` : ''}\n\n`;
    fs.appendFileSync(path.join(dir, 'error.log'), line, 'utf8');
  } catch { /* ignore */ }
}

function maybeQueueDeepLinkFromArgv(argv) {
  try {
    const link = (argv || []).find((a) => typeof a === 'string' && a.startsWith('cyberdash://'));
    if (link) PENDING_DEEP_LINKS.push(link);
  } catch { /* ignore */ }
}

function deliverDeepLinks() {
  const [w] = BrowserWindow.getAllWindows();
  if (!w || PENDING_DEEP_LINKS.length === 0) return;
  const links = PENDING_DEEP_LINKS.splice(0, PENDING_DEEP_LINKS.length);
  for (const url of links) {
    try { w.webContents.send('deep-link', url); } catch { /* ignore */ }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#0b0b0b',
    show: false,
    autoHideMenuBar: !!SETTINGS.autoHideMenuBar,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    // Icon used for Windows taskbar when packaged; electron-builder also embeds from build/icon.ico
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
  });

  // Apply window-level settings
  try { win.setAlwaysOnTop(!!SETTINGS.alwaysOnTop); } catch { /* ignore */ }
  // Intercept close to support close-to-tray behavior
  win.on('close', (e) => {
    if (global.__IS_QUITTING__) return;
    if (SETTINGS.closeToTray) {
      e.preventDefault();
      try { win.hide(); } catch { /* ignore */ }
      return false;
    }
    return undefined;
  });
  win.once('ready-to-show', () => {
    if (SETTINGS.startMinimized) {
      try { win.minimize(); } catch { /* ignore */ }
    } else {
      win.show();
    }
    // After shown, attempt to deliver any queued deep links
    deliverDeepLinks();
  });

  // Harden window: block new windows and external navigation, open http(s) externally
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, navUrl) => {
    const isDev = process.env.NODE_ENV !== 'production';
    const allow = (u) => {
      if (isDev && u.startsWith('http://localhost:5173')) return true;
      if (u.startsWith('http://127.0.0.1')) return true;
      return false;
    };
    if (!allow(navUrl)) {
      event.preventDefault();
      try { if (/^https?:\/\//i.test(navUrl)) shell.openExternal(navUrl); } catch { /* ignore */ }
    }
  });

  const devUrl = 'http://localhost:5173';
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    win
      .loadURL(devUrl)
      .catch((err) => console.error('Failed to load dev server:', err));
  } else {
    // Start local HTTP server serving dist and API
    const appServer = createServer(path.join(__dirname, '..'));
    const server = http.createServer(appServer);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      const url = `http://127.0.0.1:${port}`;
      win.loadURL(url).catch((err) => console.error('Failed to load local server:', err));
    });
    // Remember server so we can close it on quit
    global.__APP_HTTP_SERVER__ = server;
  }
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const [win] = BrowserWindow.getAllWindows();
    maybeQueueDeepLinkFromArgv(argv);
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      deliverDeepLinks();
    } else {
      createWindow();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  // AppUserModelID ensures correct taskbar grouping on Windows
  app.setAppUserModelId('com.knoksen.cyberagentsdashboard');
  // Ensure a friendly app name (used by dialogs on some platforms)
  try { app.setName('Cyber Agents Dashboard'); } catch { /* ignore */ }
  // Load settings and hook global error handlers
  loadSettings();
  process.on('uncaughtException', (err) => { logError('uncaughtException', err); });
  process.on('unhandledRejection', (reason) => { logError('unhandledRejection', reason); });

  // Custom protocol handling
  if (process.platform === 'darwin') {
    app.on('open-url', (event, url) => {
      event.preventDefault();
      try { if (typeof url === 'string' && url.startsWith('cyberdash://')) PENDING_DEEP_LINKS.push(url); } catch { /* ignore */ }
      deliverDeepLinks();
    });
  }
  // On Windows, protocol URLs come via process.argv
  maybeQueueDeepLinkFromArgv(process.argv);
  // Register as default protocol in packaged builds (electron-builder also sets up registry)
  try { if (app.isPackaged) app.setAsDefaultProtocolClient('cyberdash'); } catch { /* ignore */ }

  // IPC: Expose basic app info to renderer via preload bridge
  ipcMain.handle('get-app-info', () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    };
  });
  ipcMain.handle('get-log-path', () => {
    return { directory: getLogDir(), file: getLogDir() ? path.join(getLogDir(), 'error.log') : null };
  });
  ipcMain.handle('get-pending-deep-link', () => {
    try { return PENDING_DEEP_LINKS.shift() || null; } catch { return null; }
  });
  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged || !autoUpdater) return { ok: false };
    try {
      await autoUpdater.checkForUpdates();
      return { ok: true };
    } catch (e) {
      logError('ipc check-for-updates failed', e);
      return { ok: false };
    }
  });

  // Create system tray
  try {
    const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
    const img = nativeImage.createFromPath(iconPath);
    tray = new Tray(img && !img.isEmpty() ? img : undefined);
    const buildTrayMenu = () => Menu.buildFromTemplate([
      {
        label: 'Show/Hide',
        click: () => {
          const [w] = BrowserWindow.getAllWindows();
          if (!w) return;
          if (w.isVisible()) { try { w.hide(); } catch { /* ignore */ } }
          else { try { w.show(); w.focus(); } catch { /* ignore */ } }
        },
      },
      { type: 'separator' },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: !!SETTINGS.alwaysOnTop,
        click: (item) => {
          SETTINGS.alwaysOnTop = item.checked;
          saveSettings();
          const [w] = BrowserWindow.getAllWindows();
          if (w) try { w.setAlwaysOnTop(!!SETTINGS.alwaysOnTop); } catch { /* ignore */ }
        },
      },
      {
        label: 'Start on System Login',
        type: 'checkbox',
        checked: getStartOnLogin(),
        click: (item) => setStartOnLogin(item.checked),
      },
      {
        label: 'Close to Tray on Close',
        type: 'checkbox',
        checked: !!SETTINGS.closeToTray,
        click: (item) => { SETTINGS.closeToTray = item.checked; saveSettings(); },
      },
      { type: 'separator' },
      { label: 'Quit', click: () => { global.__IS_QUITTING__ = true; app.quit(); } },
    ]);
    tray.setToolTip(app.getName());
    tray.setContextMenu(buildTrayMenu());
    tray.on('click', () => {
      const [w] = BrowserWindow.getAllWindows();
      if (!w) return;
      if (w.isVisible()) { try { w.hide(); } catch { /* ignore */ } }
      else { try { w.show(); w.focus(); } catch { /* ignore */ } }
    });
  } catch { /* ignore tray errors */ }

  // Auto-update (only when packaged and updater available)
  if (app.isPackaged && autoUpdater) {
    try {
      autoUpdater.autoDownload = true;
      autoUpdater.on('error', (err) => logError('autoUpdater error', err));
      autoUpdater.on('update-available', () => logError('autoUpdater: update available'));
      autoUpdater.on('update-not-available', () => logError('autoUpdater: no update'));
      autoUpdater.on('update-downloaded', async () => {
        try {
          const res = await dialog.showMessageBox({
            type: 'question',
            title: 'Update ready',
            message: 'An update has been downloaded. Restart now to apply?',
            buttons: ['Restart Now', 'Later'],
            noLink: true,
            defaultId: 0,
          });
          if (res.response === 0) {
            (globalThis.setImmediate || ((fn) => globalThis.setTimeout(fn, 0)))(() => {
              try { autoUpdater.quitAndInstall(); } catch { /* ignore */ }
            });
          }
        } catch (e) { logError('autoUpdater: prompt failed', e); }
      });
      if (process.env.ELECTRON_AUTOUPDATE === 'true') {
        // opt-in background check when explicitly enabled
  globalThis.setTimeout(() => { try { autoUpdater.checkForUpdatesAndNotify(); } catch { /* ignore */ } }, 1500);
      }
    } catch (e) {
      logError('autoUpdater init failed', e);
    }
  }

  // Basic application menu
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        ...(process.env.NODE_ENV !== 'production' ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Auto-hide Menu Bar',
          type: 'checkbox',
          checked: !!SETTINGS.autoHideMenuBar,
          click: (menuItem) => {
            SETTINGS.autoHideMenuBar = menuItem.checked;
            saveSettings();
            const [w] = BrowserWindow.getAllWindows();
            if (w) try { w.setAutoHideMenuBar(!!SETTINGS.autoHideMenuBar); } catch { /* ignore */ }
          },
        },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: !!SETTINGS.alwaysOnTop,
          click: (menuItem) => {
            SETTINGS.alwaysOnTop = menuItem.checked;
            saveSettings();
            const [w] = BrowserWindow.getAllWindows();
            if (w) try { w.setAlwaysOnTop(!!SETTINGS.alwaysOnTop); } catch { /* ignore */ }
          },
        },
        {
          label: 'Start Minimized',
          type: 'checkbox',
          checked: !!SETTINGS.startMinimized,
          click: (menuItem) => {
            SETTINGS.startMinimized = menuItem.checked;
            saveSettings();
          },
        },
        {
          label: 'Close to Tray on Close',
          type: 'checkbox',
          checked: !!SETTINGS.closeToTray,
          click: (menuItem) => {
            SETTINGS.closeToTray = menuItem.checked;
            saveSettings();
          },
        },
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'About',
          click: async () => {
            const info = {
              name: app.getName(),
              version: app.getVersion(),
              electron: process.versions.electron,
              chrome: process.versions.chrome,
              node: process.versions.node,
            };
            const message = `${info.name}\nVersion ${info.version}\n\nElectron ${info.electron} | Chromium ${info.chrome} | Node ${info.node}`;
            await dialog.showMessageBox({
              type: 'info',
              title: `About ${info.name}`,
              message,
              buttons: ['OK'],
              noLink: true,
            });
          },
        },
        {
          label: 'Open Data Folder',
          click: async () => {
            const dir = getDataDir();
            if (dir) {
              try { await shell.openPath(dir); } catch { /* ignore */ }
            }
          },
        },
        {
          label: 'Start on System Login',
          type: 'checkbox',
          checked: getStartOnLogin(),
          click: (menuItem) => {
            setStartOnLogin(menuItem.checked);
          },
        },
        {
          label: 'Check for Updates…',
          click: async () => {
            if (!app.isPackaged || !autoUpdater) {
              await dialog.showMessageBox({ type: 'info', title: 'Updates', message: 'Auto-update is not configured in this build.' });
              return;
            }
            try {
              const result = await autoUpdater.checkForUpdates();
              if (!result || !result.updateInfo) {
                await dialog.showMessageBox({ type: 'info', title: 'Updates', message: 'No updates available.' });
              }
            } catch (e) {
              logError('manual update check failed', e);
              await dialog.showMessageBox({ type: 'error', title: 'Updates', message: 'Failed to check for updates.' });
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Open Logs Folder',
          click: async () => {
            const dir = getLogDir();
            if (dir) {
              try { await shell.openPath(dir); } catch { /* ignore */ }
            }
          },
        },
        {
          label: 'Clear Cache',
          click: async () => {
            try {
              const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
              if (win) await win.webContents.session.clearCache();
              await dialog.showMessageBox({ type: 'info', title: 'Cache Cleared', message: 'Browser cache cleared.' });
            } catch (e) { logError('clear cache failed', e); }
          },
        },
        {
          label: 'Reset App Data',
          click: async () => {
            const res = await dialog.showMessageBox({
              type: 'warning',
              title: 'Reset App Data',
              message: 'This will clear settings and logs. Continue?',
              buttons: ['Cancel', 'Reset'],
              cancelId: 0,
              defaultId: 1,
              noLink: true,
            });
            if (res.response !== 1) return;
            try {
              const settingsPath = getSettingsPath();
              const logsDir = getLogDir();
              if (settingsPath && fs.existsSync(settingsPath)) fs.rmSync(settingsPath, { force: true });
              if (logsDir && fs.existsSync(logsDir)) fs.rmSync(logsDir, { recursive: true, force: true });
              SETTINGS = { ...DEFAULT_SETTINGS };
              saveSettings();
              await dialog.showMessageBox({ type: 'info', title: 'Reset Complete', message: 'App data cleared. Please restart the app.' });
            } catch (e) {
              logError('reset app data failed', e);
            }
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  global.__IS_QUITTING__ = true;
  const server = global.__APP_HTTP_SERVER__;
  if (server && typeof server.close === 'function') {
    try { server.close(); } catch { /* ignore */ }
  }
  try { if (tray) tray.destroy(); } catch { /* ignore */ }
});
