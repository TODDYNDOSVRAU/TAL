#!/usr/bin/env node
// SessionStart: make sure the project has the T.A.L. block in CLAUDE.md, then put the criterion in context.
'use strict';
const path = require('path');
const { ensure } = require(path.join(__dirname, '..', 'skills', 'tal', 'scripts', 'init-claude-md.js'));

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let cwd = process.cwd();
  try { cwd = JSON.parse(raw).cwd || cwd; } catch { /* no usable stdin */ }
  const lines = [];
  try {
    const r = ensure(cwd);
    if (['created', 'appended', 'updated'].includes(r.action)) {
      lines.push(`T.A.L. plugin ${r.action} the standard block in ${r.file}. Tell the user in one line, and that it can be removed with a .tal-ignore file.`);
    }
  } catch (e) {
    lines.push(`T.A.L. plugin could not write CLAUDE.md (${e.message}). Tell the user in one line.`);
  }
  lines.push('T.A.L.: before adding, removing, publishing or approving, answer: the reason, the problem it solves, how we know it was done correctly. Do not call work done without verifying it; unverified items are pending. For code, video, motion, UI, reverse engineering, agents, tokens, memory or user-facing text, invoke the `tal` skill and read the one reference it routes to.');
  console.log(lines.join('\n'));
});
