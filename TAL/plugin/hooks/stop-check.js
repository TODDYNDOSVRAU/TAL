#!/usr/bin/env node
// Stop: in a T.A.L. project, block "done" if a changed file still uses the retired Signal Lime (#C7FF32).
// Warnings never block. Runs once per stop (stop_hook_active prevents a loop).
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const skill = path.join(__dirname, '..', 'skills', 'tal', 'scripts');
const { scanText } = require(path.join(skill, 'brand-check.js'));
const { isTalProject } = require(path.join(skill, 'init-claude-md.js'));

const EXT = new Set(['.kt', '.xml', '.css', '.scss', '.html', '.js', '.jsx', '.ts', '.tsx', '.svg']);
let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch { /* ignore */ }
  const cwd = input.cwd || process.cwd();
  if (input.stop_hook_active) return;
  if (!isTalProject(cwd)) return;
  let out, root;
  try {
    out = execFileSync('git', ['status', '--porcelain', '-uall'], { cwd, encoding: 'utf8', timeout: 8000 });
    root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim();
  } catch { return; }
  const errors = [];
  for (const line of out.split(/\r?\n/)) {
    if (line.length < 4 || line[0] === 'D' || line[1] === 'D') continue;
    const rel = line.slice(3).replace(/^"|"$/g, '').split(' -> ').pop();
    if (!EXT.has(path.extname(rel).toLowerCase())) continue;
    let text;
    try { const f = path.join(root, rel); if (fs.statSync(f).size > 2000000) continue; text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const f of scanText(text, rel)) if (f.kind === 'error') errors.push(`${rel}:${f.line} ${f.detail}`);
  }
  if (errors.length) {
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: `T.A.L. brand check: ${errors.length} retired colour(s) in changed files. Fix before finishing:\n${errors.slice(0, 10).join('\n')}`,
    }));
  }
});
