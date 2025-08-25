/* eslint-env node */
const path = require('path');
const express = require('express');

let AGENTS = [];

function makeAgent(id) {
  const names = ['Nyx', 'Vex', 'Kade', 'Lyra', 'Mira', 'Aria', 'Zed', 'Rhea'];
  const roles = ['Analyst', 'Hunter', 'Responder', 'Engineer'];
  const teams = ['Blue Team', 'Red Team', 'Purple Team', 'Threat Intel'];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const risk = Math.floor(Math.random() * 50) + 25;
  return {
    id,
    name: `Agent ${pick(names)}`,
    handle: `agent${id}`,
    team: pick(teams),
    role: pick(roles),
    group: `G${1 + Math.floor(Math.random() * 5)}`,
    skills: ['SIEM', 'EDR', 'DFIR', 'OSINT', 'Malware'],
    location: 'UTC',
    risk,
    lastActive: new Date().toISOString(),
    alerts24h: [],
  };
}

function ensureSeed() {
  if (AGENTS.length === 0) {
    AGENTS = Array.from({ length: 24 }, (_, i) => makeAgent(i + 1));
  }
}

function createServer(rootDir) {
  const app = express();
  app.use(express.json());

  // Basic security headers suitable for a local Electron-served app
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    // Conservative CSP for local assets; loosen if you add remote resources
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );
    next();
  });

  // Simple API: /api/agents
  app.options('/api/agents', (_req, res) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }).sendStatus(204);
  });

  app.get('/api/agents', (req, res) => {
    ensureSeed();
    const q = (req.query.q || '').toString().toLowerCase();
    const team = (req.query.team || '').toString();
    const role = (req.query.role || '').toString();
    const data = AGENTS.filter((a) => {
      const matchesQ = !q || `${a.name} ${a.team} ${a.role} ${a.group} ${a.skills.join(' ')}`.toLowerCase().includes(q);
      const matchesTeam = !team || a.team === team;
      const matchesRole = !role || a.role === role;
      return matchesQ && matchesTeam && matchesRole;
    });
    res.set('Access-Control-Allow-Origin', '*').json({ items: data, total: AGENTS.length });
  });

  app.post('/api/agents', (req, res) => {
    ensureSeed();
    const { add, scale } = req.body || {};
    if (typeof add === 'number' && add > 0) {
      const base = AGENTS.length;
      const newOnes = Array.from({ length: add }, (_, i) => makeAgent(base + i + 1));
      AGENTS = AGENTS.concat(newOnes);
      return res.set('Access-Control-Allow-Origin', '*').json({ ok: true, added: newOnes.length, total: AGENTS.length });
    }
    if (typeof scale === 'number' && scale > 0) {
      if (AGENTS.length > scale) AGENTS = AGENTS.slice(0, scale);
      else AGENTS = AGENTS.concat(Array.from({ length: scale - AGENTS.length }, (_, i) => makeAgent(AGENTS.length + i + 1)));
      return res.set('Access-Control-Allow-Origin', '*').json({ ok: true, total: AGENTS.length });
    }
    return res.status(400).set('Access-Control-Allow-Origin', '*').send('Specify { add: n } or { scale: n }');
  });

  app.delete('/api/agents', (_req, res) => {
    AGENTS = [];
    res.set('Access-Control-Allow-Origin', '*').json({ ok: true, total: 0 });
  });

  // Minimal chat echo to avoid bundling API keys in desktop builds
  app.post('/api/chat', (req, res) => {
    const user = req.body?.content || req.body?.message || '';
    const reply = user ? `Acknowledged: ${String(user).slice(0, 240)}` : 'Acknowledged.';
    res.set('Access-Control-Allow-Origin', '*').json({ role: 'model', content: reply });
  });

  // Static files for production app
  const distDir = path.join(rootDir, 'dist');
  app.use(express.static(distDir));
  // Provide empty CSS if referenced in index.html
  app.get('/index.css', (_req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.send('/* placeholder */');
  });
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

  return app;
}

module.exports = { createServer };
