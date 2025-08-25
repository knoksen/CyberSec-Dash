/* eslint-env node */
// Electron main process (CommonJS to avoid ESM friction with type: module)
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const { createServer } = require('./server.cjs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#0b0b0b',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    // Icon used for Windows taskbar when packaged; electron-builder also embeds from build/icon.ico
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
  });

  win.once('ready-to-show', () => win.show());

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
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
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
  const server = global.__APP_HTTP_SERVER__;
  if (server && typeof server.close === 'function') {
    try { server.close(); } catch { /* ignore */ }
  }
});
