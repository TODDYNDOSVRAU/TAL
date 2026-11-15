#!/usr/bin/env node
// T.A.L. brand check: scans a folder for colours and fonts outside the identity (v1.2).
// Usage: node brand-check.js <path> [--strict] [--json]
// Exit 0: no error. Exit 1: an error was found (retired colour; with --strict, any colour outside the palette).
'use strict';
const fs = require('fs');
const path = require('path');

const PALETTE = {
  '080808': 'Absolute Black',
  'F2F2F0': 'Precision White',
  '6B6B6B': 'Technical Gray (light)',
  '8C8C8C': 'Technical Gray (dark)',
  '7EE3EA': 'Ice',
  '0D6C74': 'Deep Teal',
};
const RETIRED = { 'C7FF32': 'Signal Lime, retired on 2026-10-30' };
const FONTS = ['space grotesk', 'inter', 'jetbrains mono'];
const GENERIC_FONTS = new Set(['sans-serif', 'serif', 'monospace', 'system-ui', 'inherit', 'initial', 'unset', 'ui-monospace', 'ui-sans-serif', 'cursive', 'fantasy']);
const EXT = new Set(['.kt', '.xml', '.css', '.scss', '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.svg', '.json', '.md']);
const SKIP_DIR = new Set(['node_modules', 'build', '.git', '.gradle', '.idea', 'dist', 'out', '.next', 'captures', 'shots']);
const SKIP_FILE = /(\.min\.|package-lock\.json|\.lock$)/;

function normalize(hex, ctx) {
  let h = hex.toUpperCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = ctx === 'argb' ? h.slice(2) : h.slice(0, 6); // alpha is opacity of a base colour
  return h.length === 6 ? h : null;
}

function scanText(text, file) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const push = (kind, detail, extra) => findings.push({ file, line: i + 1, kind, detail, ...extra });
    const ext = path.extname(file).toLowerCase();
    // Kotlin literals: 0xFF080808 or 0x080808
    for (const m of line.matchAll(/0x([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6})\b/g)) {
      const c = normalize(m[1], 'argb');
      if (c) classify(c, m[0]);
    }
    // #hex literals
    for (const m of line.matchAll(/#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g)) {
      const ctx = ext === '.xml' || ext === '.kt' ? 'argb' : 'rgba';
      const c = normalize(m[1], ctx);
      if (c) classify(c, m[0]);
    }
    function classify(c, raw) {
      if (RETIRED[c]) push('error', `${raw} is ${RETIRED[c]}`, { color: c });
      else if (!PALETTE[c]) push('warn', `${raw} is outside the palette`, { color: c });
    }
    // CSS font-family
    const ff = line.match(/font-family\s*:\s*([^;}]+)/i);
    if (ff) {
      for (let f of ff[1].split(',')) {
        f = f.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
        if (f && !GENERIC_FONTS.has(f) && !f.startsWith('var(') && !FONTS.includes(f)) push('warn', `font "${f}" is not Space Grotesk, Inter or JetBrains Mono`, { font: f });
      }
    }
  });
  return findings;
}

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIR.has(e.name)) walk(p, out); }
    else if (EXT.has(path.extname(e.name).toLowerCase()) && !SKIP_FILE.test(e.name)) out.push(p);
  }
}

function run(target) {
  const files = [];
  const st = fs.statSync(target);
  if (st.isDirectory()) walk(target, files); else files.push(target);
  const findings = [];
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    findings.push(...scanText(text, f));
  }
  return { files: files.length, findings };
}

module.exports = { scanText, normalize, run, PALETTE, RETIRED };

if (require.main === module) {
  const args = process.argv.slice(2);
  const target = args.find((a) => !a.startsWith('--'));
  if (!target) { console.error('Uso: node brand-check.js <pasta ou arquivo> [--strict] [--json]'); process.exit(2); }
  if (!fs.existsSync(target)) { console.error(`Caminho não encontrado: ${target}`); process.exit(2); }
  const strict = args.includes('--strict');
  const { files, findings } = run(target);
  const errors = findings.filter((f) => f.kind === 'error');
  const warns = findings.filter((f) => f.kind === 'warn');
  if (args.includes('--json')) console.log(JSON.stringify({ files, errors, warns }, null, 2));
  else {
    for (const f of errors) console.log(`ERRO  ${f.file}:${f.line}  ${f.detail}`);
    // group warnings by colour/font so a token file doesn't flood the output
    const groups = new Map();
    for (const f of warns) {
      const key = f.color || `font:${f.font}`;
      if (!groups.has(key)) groups.set(key, { n: 0, first: f });
      groups.get(key).n++;
    }
    for (const [k, g] of [...groups].sort((a, b) => b[1].n - a[1].n)) console.log(`AVISO ${k}  x${g.n}  primeiro em ${g.first.file}:${g.first.line}`);
    console.log(`\n${files} arquivos verificados. ${errors.length} erro(s), ${warns.length} aviso(s) em ${groups.size} valor(es) distinto(s).`);
    console.log('Não verificado por este script: Ice sobre fundo claro, logo com cor ou abaixo do tamanho mínimo, uso do destaque acima de ~5%. Revisar à mão.');
  }
  process.exit(errors.length || (strict && warns.length) ? 1 : 0);
}
