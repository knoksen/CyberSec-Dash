#!/usr/bin/env node
/* eslint-env node */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}

function bump(version, type) {
  const m = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)(.*)?$/);
  if (!m) throw new Error(`Unsupported version: ${version}`);
  let maj = parseInt(m[1], 10);
  let min = parseInt(m[2], 10);
  let pat = parseInt(m[3], 10);
  if (type === 'major') { maj += 1; min = 0; pat = 0; }
  else if (type === 'minor') { min += 1; pat = 0; }
  else { pat += 1; }
  return `${maj}.${min}.${pat}`;
}

const type = (process.argv[2] || 'patch').toLowerCase();
if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('Usage: node scripts/release.js [patch|minor|major]');
  process.exit(1);
}

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const next = bump(pkg.version, type);
pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

run('git', ['add', 'package.json']);
run('git', ['commit', '-m', `chore(release): bump to ${next}`]);
run('git', ['tag', `v${next}`]);
run('git', ['push', 'origin', `v${next}`]);
console.log(`\nTagged and pushed v${next}. CI will publish the release.`);
