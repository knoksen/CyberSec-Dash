/* eslint-env node */
const { contextBridge, ipcRenderer } = require('electron');
const { clipboard } = require('electron');

// Expose a minimal, safe API to the renderer
contextBridge.exposeInMainWorld('api', {
  getVersion: () => process.versions.electron,
  ping: () => 'pong',
  getAppInfo: async () => {
    try {
      return await ipcRenderer.invoke('get-app-info');
    } catch {
      return { name: 'Cyber Agents Dashboard', version: '0.0.0', electron: process.versions.electron };
    }
  },
  getLogPath: async () => {
    try {
      return await ipcRenderer.invoke('get-log-path');
    } catch {
      return { directory: null, file: null };
    }
  },
  getPendingDeepLink: async () => {
    try {
      return await ipcRenderer.invoke('get-pending-deep-link');
    } catch {
      return null;
    }
  },
  onDeepLink: (handler) => {
    if (typeof handler !== 'function') return () => {};
    const listener = (_event, url) => {
      try { handler(url); } catch { /* ignore handler errors */ }
    };
    ipcRenderer.on('deep-link', listener);
    return () => {
      try { ipcRenderer.removeListener('deep-link', listener); } catch { /* ignore */ }
    };
  },
  checkForUpdates: async () => {
    try {
      return await ipcRenderer.invoke('check-for-updates');
    } catch {
      return { ok: false };
    }
  },
  copyDiagnostics: async () => {
    try {
      const info = await ipcRenderer.invoke('get-app-info');
      const { directory, file } = await ipcRenderer.invoke('get-log-path');
      const text = `App: ${info.name} ${info.version}\nElectron: ${info.electron}\nLogs: ${file || directory || 'n/a'}`;
      clipboard.writeText(text);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
});
