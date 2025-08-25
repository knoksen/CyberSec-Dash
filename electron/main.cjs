/* eslint-env node */
/* global __dirname, process, console */
// Electron main process (CommonJS to avoid ESM friction with type: module)
const { app, BrowserWindow } = require('electron');
const path = require('path');

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
    },
  });

  win.once('ready-to-show', () => win.show());

  const devUrl = 'http://localhost:5173';
  const distIndex = path.join(__dirname, '..', 'dist', 'index.html');

  // Try dev server first; fall back to local file for production build.
  win
    .loadURL(devUrl)
    .catch(() => win.loadFile(distIndex))
    .catch((err) => {
      console.error('Failed to load app:', err);
    });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
