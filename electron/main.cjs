/* eslint-env node */
/* global __dirname, process, console */
// Electron main process (CommonJS to avoid ESM friction with type: module)
const { app, BrowserWindow } = require('electron');
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
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
