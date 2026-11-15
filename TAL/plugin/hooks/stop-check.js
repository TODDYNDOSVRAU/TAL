#!/usr/bin/env node
// Stop: in a T.A.L. project, block "done" if a file THIS session changed still uses the retired Signal Lime (#C7FF32).
// Files come from this session's transcript (Edit/Write/MultiEdit/NotebookEdit), so a session is never blocked by a
// file another session on the same checkout is editing. Without a readable transcript it falls back to git status.
// Warnings never block. Runs once per stop (stop_hook_active prevents a loop).
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const skill = path.join(__dirname, '..', 'skills', 'tal', 'scripts');
const { scanText } = require(path.join(skill, 'brand-check.js'));
const { isTalProject } = require(path.join(skill, 'init-claude-md.js'));

const EXT = new Set(['.kt', '.xml', '.css', '.scss', '.html', '.js', '.jsx', '.ts', '.tsx', '.svg']);
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

// Absolute paths of files this session wrote, or null if the transcript can't be read.
function sessionFiles(transcript) {
  let text;
  try { text = fs.readFileSync(transcript, 'utf8'); } catch { return null; }
  const files = new Set();
  for (const line of text.split('\n')) {
    if (!line.includes('"tool_use"')) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const content = o && o.message && Array.isArray(o.message.content) ? o.message.content : [];
    for (const c of content) {
      if (c && c.type === 'tool_use' && EDIT_TOOLS.has(c.name) && c.input) {
        const f = c.input.file_path || c.input.notebook_path;
        if (typeof f === 'string') files.add(path.resolve(f));
      }
    }
  }
  return [...files];
}

function gitFiles(cwd) {
  try {
    const out = execFileSync('git', ['status', '--porcelain', '-uall'], { cwd, encoding: 'utf8', timeout: 8000 });
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8', timeout: 8000 }).trim();
    return out.split(/\r?\n/)
      .filter((l) => l.length >= 4 && l[0] !== 'D' && l[1] !== 'D')
      .map((l) => path.join(root, l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop()));
  } catch { return []; }
}

// True for files inside the T.A.L. plugin itself (source checkout or installed cache): the checker, its router
// and its tests name the retired colour on purpose, so scanning them would block every session that edits them.
const pluginRootCache = new Map();
function inTalPlugin(file) {
  let dir = path.dirname(path.resolve(file));
  const seen = [];
  for (;;) {
    if (pluginRootCache.has(dir)) { const v = pluginRootCache.get(dir); seen.forEach((d) => pluginRootCache.set(d, v)); return v; }
    seen.push(dir);
    let v = null;
    try { v = JSON.parse(fs.readFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), 'utf8')).name === 'tal'; } catch { /* no manifest here */ }
    const up = path.dirname(dir);
    if (v !== null || up === dir) { const r = v === true; seen.forEach((d) => pluginRootCache.set(d, r)); return r; }
    dir = up;
  }
}

function check(input) {
  const cwd = input.cwd || process.cwd();
  if (input.stop_hook_active) return null;
  if (!isTalProject(cwd)) return null;
  const files = (input.transcript_path && sessionFiles(input.transcript_path)) || gitFiles(cwd);
  const errors = [];
  for (const f of files) {
    if (!EXT.has(path.extname(f).toLowerCase())) continue;
    if (!isTalProject(path.dirname(f)) || inTalPlugin(f)) continue;
    let text;
    try { if (fs.statSync(f).size > 2000000) continue; text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const rel = path.relative(cwd, f) || f;
    for (const x of scanText(text, rel)) if (x.kind === 'error') errors.push(`${rel}:${x.line} ${x.detail}`);
  }
  if (!errors.length) return null;
  return {
    decision: 'block',
    reason: `T.A.L. brand check: ${errors.length} retired colour(s) in files this session changed. Fix before finishing:\n${errors.slice(0, 10).join('\n')}`,
  };
}

module.exports = { check, sessionFiles };

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let input = {};
    try { input = JSON.parse(raw); } catch { /* ignore */ }
    const out = check(input);
    if (out) process.stdout.write(JSON.stringify(out));
  });
}
