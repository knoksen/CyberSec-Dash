/* eslint-env node */
const { contextBridge, ipcRenderer } = require('electron');

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
});
