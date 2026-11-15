#!/usr/bin/env node
// SessionStart: make sure the project has the T.A.L. block in CLAUDE.md, then put the criterion in context.
// The criterion is injected only where T.A.L. rules apply (this folder or a parent carries the T.A.L. block,
// including one ensure() just wrote). Elsewhere (no project marker, .tal-ignore, home folder) the hook stays silent.
'use strict';
const path = require('path');
const { ensure, isTalProject } = require(path.join(__dirname, '..', 'skills', 'tal', 'scripts', 'init-claude-md.js'));

function lines(cwd) {
  const out = [];
  try {
    const r = ensure(cwd);
    if (['created', 'appended', 'updated'].includes(r.action)) {
      out.push(`T.A.L. plugin ${r.action} the standard block in ${r.file}. Tell the user in one line, and that it can be removed with a .tal-ignore file.`);
    }
  } catch (e) {
    out.push(`T.A.L. plugin could not write CLAUDE.md (${e.message}). Tell the user in one line.`);
  }
  if (isTalProject(cwd)) {
    out.push('T.A.L.: before adding, removing, publishing or approving, answer: the reason, the problem it solves, how we know it was done correctly. Do not call work done without verifying it; unverified items are pending. For code, video, motion, UI, reverse engineering, agents, tokens, memory or user-facing text, invoke the `tal` skill and read the one reference it routes to.');
  }
  return out;
}

module.exports = { lines };

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let cwd = process.cwd();
    try { cwd = JSON.parse(raw).cwd || cwd; } catch { /* no usable stdin */ }
    const out = lines(cwd);
    if (out.length) console.log(out.join('\n'));
  });
}
