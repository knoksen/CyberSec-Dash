/* eslint-env node */
/* global process */
const { contextBridge } = require('electron');

// Expose a minimal, safe API to the renderer
contextBridge.exposeInMainWorld('api', {
  getVersion: () => process.versions.electron,
  ping: () => 'pong',
});
