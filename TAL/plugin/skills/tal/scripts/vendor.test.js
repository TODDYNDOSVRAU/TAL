'use strict';
// Checks the bundled third-party tools in scripts/vendor/ and the plugin's size and attribution rules.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SKILL = path.resolve(__dirname, '..');
const ROOT = path.resolve(SKILL, '..', '..');
const VENDOR = path.join(__dirname, 'vendor');

function find(cmds, args) {
  for (const c of cmds) {
    const r = spawnSync(c, args, { encoding: 'utf8' });
    if (!r.error && r.status === 0) return c;
  }
  return null;
}
const PY = find(['py', 'python3', 'python'], ['-c', 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)']);
const FFMPEG = find(['ffmpeg'], ['-version']);
const py = (args, opts = {}) => spawnSync(PY, args, { encoding: 'utf8', timeout: 120000, ...opts });

const pyTools = (dir, skip = []) =>
  fs.readdirSync(path.join(VENDOR, dir)).filter((f) => f.endsWith('.py') && !f.startsWith('_') && !skip.includes(f));

test('vendor: every Python tool answers --help with exit 0', { skip: !PY && 'Python 3.10+ not found: pending' }, () => {
  const fails = [];
  const list = [
    ...pyTools('ffmpeg').map((f) => path.join('ffmpeg', f)),
    path.join('skill-eval', 'run_eval.py'), path.join('skill-eval', 'aggregate_benchmark.py'),
    path.join('webapp', 'with_server.py'),
  ];
  for (const rel of list) {
    const r = py([path.join(VENDOR, rel), '--help']);
    if (r.status !== 0) fails.push(`${rel}: exit ${r.status} ${String(r.stderr).split('\n').filter(Boolean).pop() || ''}`);
  }
  assert.deepStrictEqual(fails, []);
  assert.ok(list.length >= 30, 'too few vendored tools: ' + list.length);
});

test('vendor: check.py and look.py work on a generated 1080p clip', { skip: (!PY || !FFMPEG) && 'Python 3.10+ or ffmpeg not found: pending' }, () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tal-vendor-'));
  const clip = path.join(d, 'clip.mp4');
  const gen = spawnSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc=size=1920x1080:rate=30:duration=3',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3:sample_rate=48000', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-shortest', clip], { encoding: 'utf8' });
  assert.strictEqual(gen.status, 0, gen.stderr);
  const chk = py([path.join(VENDOR, 'ffmpeg', 'check.py'), clip, '--platform', 'youtube', '--json']);
  assert.ok([0, 1].includes(chk.status), 'check.py crashed: ' + chk.stderr);
  assert.ok(/PASS|FAIL|WARN/i.test(chk.stdout), 'check.py printed no verdict rows');
  const sheet = path.join(d, 'sheet.png');
  const look = py([path.join(VENDOR, 'ffmpeg', 'look.py'), clip, '--tiles', '2x2', '-o', sheet]);
  assert.strictEqual(look.status, 0, look.stderr);
  assert.ok(fs.existsSync(sheet) && fs.statSync(sheet).size > 1000, 'contact sheet missing');
  assert.deepStrictEqual([...fs.readFileSync(sheet).subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47], 'not a PNG');
});

test('vendor: lint.mjs runs and flags the retired colour', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tal-lint-'));
  fs.writeFileSync(path.join(d, 'clean.css'), 'body { color: #F2F2F0; background: #080808; font-family: Inter; }\n');
  const lint = path.join(VENDOR, 'lint', 'lint.mjs');
  const ok = spawnSync('node', [lint, d], { encoding: 'utf8' });
  assert.strictEqual(ok.status, 0, ok.stdout + ok.stderr);
  fs.writeFileSync(path.join(d, 'bad.css'), 'a { color: #C7FF32; font-family: Comic Sans MS; }\n');
  const bad = spawnSync('node', [lint, d], { encoding: 'utf8' });
  assert.notStrictEqual(bad.status, 0, 'retired colour must fail');
});

test('vendor: find-polluter.sh has valid shell syntax', { skip: !find(['bash'], ['-c', 'true']) && 'bash not found: pending' }, () => {
  const r = spawnSync('bash', ['-n', path.join(VENDOR, 'debug', 'find-polluter.sh')], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
});

test('every vendor folder keeps a licence file and is listed in NOTICE.md', () => {
  const notice = fs.readFileSync(path.join(ROOT, 'NOTICE.md'), 'utf8');
  for (const dir of fs.readdirSync(VENDOR, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
    assert.ok(fs.readdirSync(path.join(VENDOR, dir)).some((f) => /^LICENSE/.test(f)), `${dir}: no LICENSE file`);
    assert.ok(notice.includes('vendor/' + dir + '/'), `${dir}: not listed in NOTICE.md`);
  }
});

test('every reference stays within the 16 KB budget and SKILL.md within 4 KB', () => {
  const refDir = path.join(SKILL, 'references');
  const over = fs.readdirSync(refDir).filter((f) => f.endsWith('.md'))
    .map((f) => [f, fs.statSync(path.join(refDir, f)).size]).filter(([, n]) => n > 16 * 1024);
  assert.deepStrictEqual(over, [], 'references over 16 KB');
  assert.ok(fs.statSync(path.join(SKILL, 'SKILL.md')).size <= 4096, 'SKILL.md grew past 4 KB');
});
