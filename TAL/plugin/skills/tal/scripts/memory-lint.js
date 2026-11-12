#!/usr/bin/env node
// Lints a memory folder: MEMORY.md index vs files, required fields, duplicates, stale entries.
// Usage: node memory-lint.js <memory-dir> [--days 90]
// Exit 1 if there is an error (dead link, missing field). Warnings and info never fail.
'use strict';
const fs = require('fs');
const path = require('path');

const TYPES = new Set(['user', 'feedback', 'project', 'reference']);

function parseFront(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const out = {};
  let inMeta = false;
  for (const line of m[1].split('\n')) {
    const top = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (top) { inMeta = top[1] === 'metadata'; if (!inMeta) out[top[1]] = top[2].trim(); continue; }
    const sub = line.match(/^\s+([A-Za-z_]+):\s*(.*)$/);
    if (sub && inMeta) out['metadata.' + sub[1]] = sub[2].trim();
  }
  return out;
}
function tokens(s) { return new Set(s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2)); }
const BLOCK_SCALARS = new Set(['>', '|', '>-', '|-', '>+', '|+']);
const REL_DATE = /\b(today|yesterday|tomorrow|next week|last week|hoje|ontem|amanh[ãa]|semana que vem|semana passada|monday|tuesday|wednesday|thursday|friday|saturday|sunday|segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)\b/i;
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/;
const SECRET = /(\bsk-[A-Za-z0-9]{16,}|\bghp_[A-Za-z0-9]{20,}|\bAKIA[0-9A-Z]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY|\bpassword\s*[:=]\s*\S+)/i;
function jaccard(a, b) { let i = 0; for (const x of a) if (b.has(x)) i++; const u = a.size + b.size - i; return u ? i / u : 0; }

function lint(dir, days = 90) {
  const out = { errors: [], warnings: [], info: [], files: 0 };
  const err = (m) => out.errors.push(m), warn = (m) => out.warnings.push(m), info = (m) => out.info.push(m);
  const indexPath = path.join(dir, 'MEMORY.md');
  if (!fs.existsSync(indexPath)) { err('MEMORY.md not found'); return out; }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'MEMORY.md');
  out.files = files.length;
  const idx = fs.readFileSync(indexPath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const linked = new Set();
  idx.forEach((l, i) => {
    const m = l.match(/^- \[([^\]]+)\]\(([^)]+)\)\s+[—-]\s+\S/);
    if (!m) { warn(`MEMORY.md line ${i + 1} is not "- [Title](file.md) — hook": ${l.slice(0, 60)}`); const l2 = l.match(/^- \[([^\]]+)\]\(([^)]+)\)/); if (l2) { linked.add(l2[2]); if (!fs.existsSync(path.join(dir, l2[2]))) err(`MEMORY.md links to missing file ${l2[2]}`); } return; }
    linked.add(m[2]);
    if (!fs.existsSync(path.join(dir, m[2]))) err(`MEMORY.md links to missing file ${m[2]}`);
    if (l.length > 160) warn(`MEMORY.md line ${i + 1} is ${l.length} chars; keep index lines short`);
  });
  if (idx.length > 40) warn(`index has ${idx.length} lines; consolidate or group (our budget is 40 or fewer)`);
  const rawIdx = fs.readFileSync(indexPath, 'utf8');
  if (rawIdx.split(/\r?\n/).length > 200 || Buffer.byteLength(rawIdx) > 25 * 1024) warn('MEMORY.md exceeds 200 lines or 25 KB: Claude Code loads only the first 200 lines / 25 KB');
  const metas = [];
  const slugs = new Set(files.map((f) => f.replace(/\.md$/, '')));
  const now = Date.now();
  for (const f of files) {
    const p = path.join(dir, f);
    const text = fs.readFileSync(p, 'utf8');
    const fm = parseFront(text);
    if (!fm) { err(`${f}: no frontmatter`); continue; }
    for (const k of ['name', 'description', 'metadata.type']) if (!fm[k] || BLOCK_SCALARS.has(fm[k])) err(`${f}: missing ${k}`);
    if (fm['metadata.type'] && !TYPES.has(fm['metadata.type'])) err(`${f}: type "${fm['metadata.type']}" is not one of ${[...TYPES].join(', ')}`);
    if (fm.name && fm.name !== f.replace(/\.md$/, '')) warn(`${f}: name "${fm.name}" differs from the file name`);
    if (!linked.has(f)) warn(`${f}: not in the index (orphan)`);
    if (['feedback', 'project'].includes(fm['metadata.type'])) {
      if (!/\*\*Why:\*\*/i.test(text)) info(`${f}: ${fm['metadata.type']} memory without a **Why:** line`);
      if (!/\*\*How to apply:\*\*/i.test(text)) info(`${f}: ${fm['metadata.type']} memory without a **How to apply:** line`);
    }
    const upd = fm['metadata.updated'] && ISO_DATE.test(fm['metadata.updated']) ? Date.parse(fm['metadata.updated'].match(ISO_DATE)[0]) : NaN;
    const age = Math.floor((now - (Number.isNaN(upd) ? fs.statSync(p).mtimeMs : upd)) / 86400000);
    if (age > days) info(`${f}: not updated in ${age} days; re-verify or delete`);
    const until = fm['metadata.valid_until'] && fm['metadata.valid_until'].match(ISO_DATE);
    if (until && Date.parse(until[0]) < now) warn(`${f}: valid_until ${until[0]} has passed; delete or renew`);
    const body = text.replace(/^---[\s\S]*?\n---\n?/, '');
    if (REL_DATE.test(body) && !ISO_DATE.test(body)) warn(`${f}: relative date without an absolute YYYY-MM-DD date in the file`);
    if (SECRET.test(text)) warn(`${f}: looks like it contains a secret; remove it`);
    for (const l of body.matchAll(/\[\[([^\]]+)\]\]/g)) if (!slugs.has(l[1].trim())) info(`${f}: [[${l[1]}]] points to no memory file`);
    if (Buffer.byteLength(text) > 8 * 1024) info(`${f}: over 8 KB; one fact per file, consider splitting`);
    metas.push({ f, t: tokens((fm.name || f) + ' ' + (fm.description || '')) });
  }
  for (let i = 0; i < metas.length; i++) for (let j = i + 1; j < metas.length; j++) {
    const s = jaccard(metas[i].t, metas[j].t);
    if (s >= 0.6) warn(`${metas[i].f} and ${metas[j].f} look alike (${Math.round(s * 100)}% word overlap); merge?`);
  }
  return out;
}

module.exports = { lint, parseFront };

if (require.main === module) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith('--'));
  const di = args.indexOf('--days');
  if (!dir) { console.error('Usage: node memory-lint.js <memory-dir> [--days 90]'); process.exit(2); }
  if (!fs.existsSync(dir)) { console.error('Folder not found: ' + dir); process.exit(2); }
  const r = lint(dir, di >= 0 ? Number(args[di + 1]) : 90);
  r.errors.forEach((m) => console.log('ERROR ' + m));
  r.warnings.forEach((m) => console.log('WARN  ' + m));
  r.info.forEach((m) => console.log('INFO  ' + m));
  console.log(`\n${r.files} memory file(s). ${r.errors.length} error(s), ${r.warnings.length} warning(s), ${r.info.length} info.`);
  process.exit(r.errors.length ? 1 : 0);
}
