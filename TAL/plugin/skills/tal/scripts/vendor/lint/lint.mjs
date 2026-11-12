#!/usr/bin/env node
// T.A.L. lint: static scan of source files for patterns that break the T.A.L. identity or read as generated-page tells.
//
// Based on taste-skill's lint.mjs, Copyright (c) 2026 Leonxlnx, MIT License (see LICENSE in this folder).
// Modified for T.A.L.:
//   - Removed the bans on monospace type, hairline rules, outlined boxes and backdrop blur: the identity uses
//     JetBrains Mono for metrics, hairline borders for elevation, and glass materials (Haze in the app).
//   - Removed the "default font" rule (Inter and Space Grotesk are identity fonts), the em-dash count and the
//     data-ui / direction.json handling, which belonged to taste-skill's own workflow.
//   - Added: retired Signal Lime #C7FF32 (FAIL), colours outside the palette (WARN), fonts outside
//     Space Grotesk / Inter / JetBrains Mono (WARN), exclamation marks in UI text (WARN), PT stock phrases.
//   - Eyebrow, micro-label, numbering, gradient and shadow rules are WARN, not FAIL.
//   - Scans .kt, .kts and .xml as well (Android).
//   - Added --strict (WARN also fails), --allow (project-specific extra colours) and --help.
//
// Zero dependencies. Exit code: 1 on any FAIL (or any WARN with --strict), 2 when nothing could be scanned, else 0.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, resolve } from 'node:path';

const HELP = `T.A.L. lint

Usage: node lint.mjs [files or directories ...] [options]

Options
  --app             Screens of an app: also flag placeholder data and framework default colours.
  --json            Print the findings as JSON.
  --strict          Warnings fail too (exit 1).
  --allow=#RRGGBB,#RRGGBB
                    Extra colours this project is allowed to use (its own accent, recorded as an exception).
  -h, --help        This text.

Levels
  FAIL  Retired Signal Lime (#C7FF32), emoji, lorem ipsum, purple/indigo and Claude-brand colours.
  WARN  Colours outside the palette, fonts outside the identity, stock phrases, gradients, shadows, motion habits.
        A warning is a question: fix it, or record an exception (references/brand.md).

Palette: #080808 #F2F2F0 #6B6B6B #8C8C8C #7EE3EA #0D6C74 (an alpha channel counts as opacity of a base colour).
Fonts: Space Grotesk, Inter, JetBrains Mono.
Scans: .html .htm .css .scss .less .js .jsx .ts .tsx .vue .svelte .astro .mdx .kt .kts .xml
Ignore one line with the comment: tal-ignore

Limits: colours written as rgb()/hsl() or named colours are not checked; font names inside Kotlin string
literals are not checked; resource names for fonts are matched by name only.`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { console.log(HELP); process.exit(0); }
const asJson = args.includes('--json');
const strict = args.includes('--strict');
const appMode = args.includes('--app');
const allowArg = args.find((a) => a.startsWith('--allow='));
const roots = args.filter((a) => !a.startsWith('-'));
if (!roots.length) roots.push('.');

const hex6 = (s) => s.replace(/^#/, '').toUpperCase();
const PALETTE = new Set(['080808', 'F2F2F0', '6B6B6B', '8C8C8C', '7EE3EA', '0D6C74']);
const LIME = 'C7FF32';
const ALLOWED_EXTRA = new Set((allowArg ? allowArg.slice('--allow='.length).split(',') : []).map(hex6).filter(Boolean));
const FONTS = new Set(['space grotesk', 'inter', 'jetbrains mono']);
const GENERIC_FONTS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong', 'inherit', 'initial', 'unset', 'revert', '-apple-system', 'blinkmacsystemfont']);

const EXT = new Set(['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.mdx', '.kt', '.kts', '.xml']);
const SKIP = new Set(['node_modules', '.git', '.next', '.nuxt', '.svelte-kit', 'dist', 'build', 'out', '.vercel', '.taste-skill', 'coverage', '.turbo', 'vendor', '.gradle', '.idea']);

const files = []; const tooBig = [];
const walk = (p) => {
  let st; try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) { for (const f of readdirSync(p)) if (!SKIP.has(f) && !f.startsWith('.')) walk(join(p, f)); }
  else if (EXT.has(extname(p)) && !/\.min\.|\.d\.ts$|(^|[\\/])(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|[^\\/]+\.lock)$/.test(p)) { if (st.size < 4000000) files.push(p); else tooBig.push(p); }
};
for (const r of roots) {
  try { statSync(resolve(r)); } catch { console.error(`Not found: ${r}`); process.exit(2); }
  walk(resolve(r));
}
if (!files.length) { console.error(`No source files (${[...EXT].join(' ')}) under: ${roots.join(', ')}`); process.exit(2); }
if (tooBig.length) console.error(`Skipped (over 4 MB, check by hand): ${tooBig.join(', ')}`);

// Regex rules: [level, id, regex, message]. Tested per line.
const R = [
  ['FAIL', 'retired-lime', /#C7FF32\b|0x(?:[0-9a-f]{2})?C7FF32\b|rgba?\(\s*199\s*,\s*255\s*,\s*50\b/i, 'Signal Lime #C7FF32 is retired. Use Ice (#7EE3EA) on dark or Deep Teal (#0D6C74) on light.'],
  ['WARN', 'gradient', /(linear|radial|conic)-gradient\(|\bbg-(gradient|linear|radial|conic)-|\b(from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/, 'Gradient fill. The identity builds tones from opacity of the base colours; justify a gradient or use a flat tone.'],
  ['WARN', 'gradient-text', /bg-clip-text|background-clip\s*:\s*text|text-transparent/, 'Gradient / clipped text. Use solid colour.'],
  ['WARN', 'shadow', /box-shadow\s*:\s*(?!none|0 0 #0000|var\(--tw)|\bshadow(-(sm|md|lg|xl|2xl|inner|\[[^\]]+\]))?(?=["'\s`])(?<!-shadow)|drop-shadow\(|\bdrop-shadow(-|\b)|text-shadow\s*:\s*(?!none)/, 'Shadow. Elevation here comes from surface tint and a hairline border; only real overlays (menu, dialog, sticky bar) carry a shadow.'],
  ['WARN', 'numbering', />\s*[(\[]?0[1-9][)\]]?\.?\s*<|["'`]\s*0[1-9]\s*["'`]|decimal-leading-zero|>\s*(Step|Phase|No\.?|Chapter)\s*0?\d\s*</i, 'Decorative index numbering (01 / 02 / 03). Keep it only when it carries information.'],
  ['WARN', 'eyebrow', /class(Name)?\s*=\s*["'`{][^"'`}]*\b(eyebrow|kicker|overline|pretitle|pre-title|suptitle|sup-title|tagline-label|section-label|section-tag)\b|\.(eyebrow|kicker|overline|pretitle|section-label|section-tag)\b\s*[{,]/i, 'Eyebrow / kicker label above a heading. Allowed when it states something real (a state, a unit), not as decoration above every heading.'],
  ['WARN', 'micro-label', /(?=[^"'`]*\buppercase\b)(?=[^"'`]*\btracking-(wide|wider|widest|\[[^\]]+\])\b)(?=[^"'`]*\btext-(xs|\[1[0-3]px\]|\[0?\.[67]\d*rem\])\b)[^"'`]+/, 'Tiny uppercase letter-spaced label. Fine for technical data in JetBrains Mono; not as decoration.'],
  ['FAIL', 'purple', /\b(bg|text|from|to|via|border|ring|fill|stroke|shadow|decoration|outline)-(purple|violet|indigo|fuchsia)-\d{2,3}\b|#(6366f1|8b5cf6|7c3aed|a855f7|4f46e5|a78bfa|818cf8|9333ea|6d28d9|c084fc)\b/i, 'Indigo / violet: the generated-page accent. Not in the palette.'],
  ['FAIL', 'claude-palette', /#(d97757|da7756|c15f3c|cc785c|bd5d3a|f0eee6|faf9f5|f5f4ed|eeece2|e8e6dc)\b/i, 'Claude-brand cream / terracotta colour. Not in the palette.'],
  ['FAIL', 'emoji', /[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}\u{2600}-\u{26FF}]/u, 'Emoji used as UI. System messages carry none.'],
  ['FAIL', 'lorem', /lorem ipsum|dolor sit amet/i, 'Placeholder copy shipped.'],
  ['WARN', 'copy', /\b(unlock|unleash|supercharge|seamless(ly)?|elevate|empower(s|ing)?|revolutioni[sz]e|game[- ]chang(er|ing)|cutting[- ]edge|next[- ]gen(eration)?|world[- ]class|best[- ]in[- ]class|all[- ]in[- ]one|effortless(ly)?|blazing(ly)?[- ]fast|lightning[- ]fast|reimagin(e|ed|ing)|delve|tapestry|leverage|synergy|streamline|robust|holistic|turbocharge|transform the way|take your .{1,30} to the next level|say goodbye to|in today'?s|the future of|built for the modern|not just .{1,40}[,—-] (it'?s|but)|more than (just )?a)\b/i, 'Stock marketing phrase. Say the specific thing the product does, with the number (references/voice.md).'],
  ['WARN', 'copy-pt', /\b(revolucion[aá]ri[oa]|incr[ií]vel|sem esfor[cç]o|de [uú]ltima gera[cç][aã]o|libere o poder|o melhor do mundo|m[aá]gic[oa])\b/i, 'Frase de marketing. Diga o que o produto faz, com o número (references/voice.md).'],
  ['WARN', 'exclamation', /["'>][^"'<>]*\p{L}[^"'<>]*\s[^"'<>]*\p{L}!\s*["'<]/u, 'Exclamation mark in interface text. The voice is calm: no exclamation marks.'],
  ['WARN', 'cta-copy', />\s*(Learn more|Get started|Click here|Read more|Discover more|Explore now|Submit|Clique aqui|Saiba mais|Comece agora)\s*</i, 'Generic button label. Name the action or the thing ("Exportar vídeo", "Save changes").'],
  ['WARN', 'transition-all', /transition\s*:\s*all\b|\btransition-all\b/, 'transition: all. Name the properties (transform, opacity).'],
  ['WARN', 'ease-in', /(?<![-\w])ease-in(?!-out)\b/, 'ease-in on UI feels sluggish. Use ease-out for enters and exits.'],
  ['WARN', 'scale-zero', /scale\(\s*0\s*\)|\bscale-0\b/, 'Entering from scale(0). Start at 0.95–0.98 with opacity 0.'],
  ['WARN', 'h-screen', /\bh-screen\b|height\s*:\s*100vh/, '100vh jumps on mobile. Use 100svh / 100dvh.'],
  ['WARN', 'bounce', /animate-(bounce|ping|pulse)\b/, 'Looping attention animation (bounce / ping / pulse). Motion needs a purpose; it respects reduced motion.'],
];
if (appMode) {
  R.push(['FAIL', 'placeholder-data', /\b(John|Jane) Doe\b|\bAcme( Inc| Corp)?\b|\bexample\.com\b|\bFirstname Lastname\b|\b123 Main St\b/, 'Placeholder data. Use believable names, amounts that add up and real units for this product.']);
  R.push(['WARN', 'framework-colour', /#(3b82f6|2563eb|1d4ed8|60a5fa|10b981|22c55e|ef4444|f59e0b)\b/i, 'A framework default colour (Tailwind blue, green, red, amber). Take status colours from the identity or the product.']);
}

// Function checks: return a list of [level, id, match, message] for one line.
const normFont = (s) => s.replace(/^['"\s]+|['"\s]+$/g, '').replace(/[+_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const fontOk = (name) => FONTS.has(name);
const fontToken = /space.?grotesk|jetbrains.?mono|(^|[^a-z])inter([^a-z]|$)/i;

function colourChecks(line, ext) {
  const out = [];
  const android = ext === '.kt' || ext === '.kts' || ext === '.xml';
  const seen = new Set();
  const push = (raw, rgb) => {
    if (rgb === LIME || PALETTE.has(rgb) || ALLOWED_EXTRA.has(rgb)) return;
    if (seen.has(raw)) return; seen.add(raw);
    out.push(['WARN', 'off-palette', raw, `Colour ${raw} is outside the palette (#080808 #F2F2F0 #6B6B6B #8C8C8C #7EE3EA #0D6C74). Use a token, an opacity of a base colour, or record an exception.`]);
  };
  for (const m of line.matchAll(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6})(?![0-9a-zA-Z_-])/g)) {
    const h = m[1].toUpperCase();
    // Android #AARRGGBB drops the first byte; CSS #RRGGBBAA drops the last.
    const rgb = h.length === 8 ? (android ? h.slice(2) : h.slice(0, 6)) : h;
    push(m[0], rgb);
  }
  for (const m of line.matchAll(/\bColor\(\s*0x([0-9a-fA-F]{8}|[0-9a-fA-F]{6})\b/g)) {
    const h = m[1].toUpperCase();
    push(`0x${h}`, h.length === 8 ? h.slice(2) : h);
  }
  // 3-digit shorthand only where the line is clearly a colour declaration (avoids #anchors and ids).
  if (/(color|background|border|fill|stroke|shadow|outline|gradient)[^;]*#[0-9a-fA-F]{3}(?![0-9a-zA-Z_-])/i.test(line)) {
    for (const m of line.matchAll(/#([0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g)) {
      const s = m[1].toUpperCase(); push(m[0], s[0] + s[0] + s[1] + s[1] + s[2] + s[2]);
    }
  }
  return out;
}

function fontChecks(line) {
  const out = [];
  const bad = (name, where) => out.push(['WARN', 'off-font', name, `Font "${name}" (${where}) is outside the identity: Space Grotesk, Inter, JetBrains Mono.`]);
  const css = line.match(/font-family\s*:\s*([^;{}]+)/i);
  if (css && !/var\(/.test(css[1])) {
    for (const part of css[1].split(',')) {
      const raw = part.trim().replace(/^['"]|['"]$/g, '');
      if (!raw || GENERIC_FONTS.has(raw.toLowerCase())) continue; // generic fallbacks are fine after a named family
      if (!fontOk(normFont(raw))) bad(raw, 'font-family');
    }
  }
  const gf = line.match(/fonts\.googleapis\.com\/css2?\?([^"'\s>)]+)/);
  if (gf) for (const m of gf[1].matchAll(/family=([^&:;]+)/g)) { const n = normFont(decodeURIComponent(m[1])); if (n && !fontOk(n)) bad(n, 'Google Fonts'); }
  const fam = line.match(/android:fontFamily\s*=\s*"([^"]+)"/);
  if (fam) { const res = fam[1].replace(/^@font\//, ''); if (!/^@(string|attr)|^\?/.test(fam[1]) && !fontToken.test(res)) bad(res, 'android:fontFamily'); }
  for (const m of line.matchAll(/\bFont\(\s*R\.font\.([A-Za-z0-9_]+)/g)) if (!fontToken.test(m[1])) bad(m[1], 'R.font');
  const sys = line.match(/\bFontFamily\.(Default|SansSerif|Serif|Monospace|Cursive)\b/);
  if (sys) out.push(['WARN', 'off-font', sys[0], `${sys[0]} is a system font family. The identity fonts are bundled in res/font; use them or record the reason.`]);
  return out;
}

const findings = [];
for (const file of files) {
  const rel = relative(process.cwd(), file).split('\\').join('/');
  const ext = extname(file).toLowerCase();
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.length > 2000) return; // minified or data
    if (/\btal-ignore\b|taste-skill-ignore/.test(line)) return;
    const isComment = /^\s*(\/\/|\/\*|\*|<!--|#\s)/.test(line);
    for (const [level, id, re, message] of R) {
      if ((id === 'copy' || id === 'copy-pt' || id === 'cta-copy' || id === 'emoji' || id === 'exclamation') && /^\s*(\/\/|\/\*|\*|import |@import|<!--)/.test(line)) continue;
      const m = line.match(re);
      if (m) findings.push({ level, id, file: rel, line: i + 1, match: m[0].trim().slice(0, 70), message });
    }
    if (!isComment) for (const [level, id, match, message] of [...colourChecks(line, ext), ...fontChecks(line)]) findings.push({ level, id, file: rel, line: i + 1, match: String(match).slice(0, 70), message });
  });
}

const failCount = findings.filter((f) => f.level === 'FAIL').length;
const warnCount = findings.length - failCount;
const exitCode = failCount || (strict && warnCount) ? 1 : 0;

if (asJson) { console.log(JSON.stringify({ files: files.length, findings }, null, 1)); process.exit(exitCode); }

const byId = new Map();
for (const f of findings) { const k = f.level + ' ' + f.id; if (!byId.has(k)) byId.set(k, []); byId.get(k).push(f); }
console.log(`T.A.L. · LINT   ${files.length} file(s)`);
if (!findings.length) console.log('\nNo identity or tell patterns found in source. This does not replace the manual checks in references/brand.md.');
for (const lvl of ['FAIL', 'WARN']) {
  const keys = [...byId.keys()].filter((k) => k.startsWith(lvl));
  if (!keys.length) continue;
  console.log(`\n${lvl}`);
  for (const k of keys) {
    const list = byId.get(k);
    console.log(`  [${list[0].id}] ${list[0].message}  (${list.length}×)`);
    for (const f of list.slice(0, 6)) console.log(`      ${f.file}:${f.line}  ${f.match}`);
    if (list.length > 6) console.log(`      … ${list.length - 6} more`);
  }
}
console.log(`\nRESULT: ${failCount} FAIL, ${warnCount} WARN${exitCode ? (failCount ? ': fix the FAILs.' : ': --strict, warnings fail.') : '.'}`);
console.log('A line that must keep a flagged pattern for a documented reason can carry the comment tal-ignore.');
process.exit(exitCode);
