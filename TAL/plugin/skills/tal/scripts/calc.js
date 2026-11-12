#!/usr/bin/env node
// Formulas used by the T.A.L. references, so the numbers are computed, not remembered.
// Usage: node calc.js <command> [args]
//   loudness <measured_I> <measured_TP> <target_I> <target_TP>
//   spring <response_s>            stiffness and critical damping for unit mass
//   frames <seconds> <fps>
//   contrast <#fg> <#bg>
//   budget <hz>                    frame budget in ms
//   cache <context_tokens> <turns> <input_usd_per_mtok> <read_multiplier>
'use strict';

function loudness(measuredI, measuredTP, targetI, targetTP) {
  const gain = targetI - measuredI;
  const peakAfter = measuredTP + gain;
  return { gainDb: round(gain, 2), peakAfterDbTP: round(peakAfter, 2), linearOk: peakAfter <= targetTP,
    note: peakAfter <= targetTP ? 'linear gain fits under the true-peak limit' : 'gain would exceed the limit: expect dynamic mode (use -ar 48000) or a limiter' };
}
function spring(response) {
  const stiffness = (2 * Math.PI / response) ** 2;
  return { response, stiffness: round(stiffness, 2), criticalDamping: round(2 * Math.sqrt(stiffness), 2), settle1pctSeconds: round(1.06 * response, 3) };
}
function frames(seconds, fps) { return { frames: Math.round(seconds * fps), msPerFrame: round(1000 / fps, 2) }; }
function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
function lum(hex) {
  const h = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('colour must be #RRGGBB: ' + hex);
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(fg, bg) {
  const a = lum(fg), b = lum(bg);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return { ratio: round(ratio, 2), textAA: ratio >= 4.5, largeTextAndUiAA: ratio >= 3 };
}
function budget(hz) { return { hz, ms: round(1000 / hz, 2) }; }
function cache(contextTokens, turns, usdPerMtok, readMult) {
  const reread = contextTokens * turns;
  const full = reread / 1e6 * usdPerMtok;
  return { rereadTokens: reread, noCacheUsd: round(full, 2), cachedUsd: round(full * readMult, 2) };
}
function round(x, d) { const p = 10 ** d; return Math.round(x * p) / p; }

module.exports = { loudness, spring, frames, contrast, budget, cache };

if (require.main === module) {
  const [cmd, ...a] = process.argv.slice(2);
  const n = a.map(Number);
  const table = {
    loudness: () => loudness(...n), spring: () => spring(n[0]), frames: () => frames(n[0], n[1]),
    contrast: () => contrast(a[0], a[1]), budget: () => budget(n[0]), cache: () => cache(...n),
  };
  if (!table[cmd]) { console.error('Usage: node calc.js loudness|spring|frames|contrast|budget|cache ...'); process.exit(2); }
  try { console.log(JSON.stringify(table[cmd](), null, 2)); } catch (e) { console.error(e.message); process.exit(2); }
}
