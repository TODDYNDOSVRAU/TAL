#!/usr/bin/env node
// Creates or updates the T.A.L. block in a project's CLAUDE.md. Idempotent. Never overwrites content outside the block.
// Usage: node init-claude-md.js [dir] [--force] [--check]
//   --force  ignore the project-marker and inherited-block checks
//   --check  report what would happen, write nothing
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const BEGIN = /<!-- tal:begin ([^ >]*) -->/;
const END = '<!-- tal:end -->';
const PROJECT_MARKERS = ['.git', 'package.json', 'build.gradle', 'build.gradle.kts', 'settings.gradle', 'settings.gradle.kts', 'pyproject.toml', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml', 'Package.swift', 'pubspec.yaml', 'composer.json', 'Gemfile', 'CMakeLists.txt'];
const ROOT = path.resolve(__dirname, '..', '..', '..');

function pluginVersion() {
  try { return 'v' + JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8')).version; } catch { return 'v0'; }
}
function template() {
  return fs.readFileSync(path.join(ROOT, 'templates', 'CLAUDE.md.tpl'), 'utf8').replace('{{VERSION}}', pluginVersion()).replace(/\r\n/g, '\n').trimEnd() + '\n';
}
function isProject(dir) { return PROJECT_MARKERS.some((m) => fs.existsSync(path.join(dir, m))); }
function readOr(file) { try { return fs.readFileSync(file, 'utf8'); } catch { return null; } }
function isTalText(t) { return !!t && (BEGIN.test(t) || /Totally Accurate Labs/.test(t)); }

// true if a CLAUDE.md above `dir` already carries T.A.L. content (it is inherited by this folder)
function inheritedFrom(dir) {
  let cur = path.dirname(path.resolve(dir));
  for (let prev = null; cur !== prev; prev = cur, cur = path.dirname(cur)) {
    if (isTalText(readOr(path.join(cur, 'CLAUDE.md')))) return path.join(cur, 'CLAUDE.md');
  }
  return null;
}
// true if this folder or an ancestor has T.A.L. content (used to decide if T.A.L.-only checks apply)
function isTalProject(dir) {
  for (let cur = path.resolve(dir), prev = null; cur !== prev; prev = cur, cur = path.dirname(cur)) {
    if (isTalText(readOr(path.join(cur, 'CLAUDE.md')))) return true;
  }
  return false;
}

function ensure(dir, opts = {}) {
  dir = path.resolve(dir);
  const file = path.join(dir, 'CLAUDE.md');
  const res = (action, extra = {}) => ({ action, file, ...extra });
  if (process.env.TAL_NO_BOOTSTRAP === '1') return res('skipped', { reason: 'TAL_NO_BOOTSTRAP=1' });
  if (fs.existsSync(path.join(dir, '.tal-ignore'))) return res('skipped', { reason: '.tal-ignore present' });
  if (!opts.force) {
    if (path.resolve(dir) === path.resolve(os.homedir())) return res('skipped', { reason: 'home folder' });
    if (!isProject(dir)) return res('skipped', { reason: 'not a project folder (no .git, package.json, build file...)' });
    const up = inheritedFrom(dir);
    if (up) return res('skipped', { reason: 'inherited from ' + up });
  }
  const block = template();
  const cur = readOr(file);
  let next, action;
  if (cur === null) { next = block; action = 'created'; }
  else {
    const m = cur.match(BEGIN);
    if (m) {
      const start = cur.indexOf(m[0]);
      const endIdx = cur.indexOf(END, start);
      if (endIdx < 0) return res('skipped', { reason: 'tal:begin without tal:end; fix by hand' });
      if (m[1] === pluginVersion()) return res('current');
      next = cur.slice(0, start) + block.trimEnd() + cur.slice(endIdx + END.length);
      action = 'updated';
    } else if (/Totally Accurate Labs/.test(cur) && !opts.force) {
      return res('skipped', { reason: 'file already holds hand-written T.A.L. content' });
    } else {
      next = cur.trimEnd() + '\n\n' + block;
      action = 'appended';
    }
  }
  if (opts.check) return res('would-' + action);
  const tmp = file + '.tal-tmp';
  fs.writeFileSync(tmp, next);
  fs.renameSync(tmp, file);
  return res(action);
}

module.exports = { ensure, isTalProject, inheritedFrom, isProject, pluginVersion };

if (require.main === module) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith('--')) || process.cwd();
  const r = ensure(dir, { force: args.includes('--force'), check: args.includes('--check') });
  console.log(`${r.action}${r.reason ? ' (' + r.reason + ')' : ''}: ${r.file}`);
}
