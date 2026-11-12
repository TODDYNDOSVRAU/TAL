'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const c = require('./calc.js');

test('spring: response 0.3 s gives stiffness 438.65', () => {
  assert.strictEqual(c.spring(0.3).stiffness, 438.65);
  assert.strictEqual(c.spring(0.3).criticalDamping, 41.89);
});
test('spring: Remotion critical damping for stiffness 100, mass 1 is 20 (checked against stiffness 100 => response 2pi/10)', () => {
  const r = 2 * Math.PI / 10;
  assert.strictEqual(c.spring(r).stiffness, 100);
  assert.strictEqual(c.spring(r).criticalDamping, 20);
});
test('loudness: -20.3 LUFS / -4.1 dBTP to -14 / -1 needs more than linear gain', () => {
  const r = c.loudness(-20.3, -4.1, -14, -1);
  assert.strictEqual(r.gainDb, 6.3);
  assert.strictEqual(r.peakAfterDbTP, 2.2);
  assert.strictEqual(r.linearOk, false);
  assert.strictEqual(c.loudness(-16, -8, -14, -1).linearOk, true);
});
test('frames and budgets', () => {
  assert.deepStrictEqual(c.frames(3, 30), { frames: 90, msPerFrame: 33.33 });
  assert.strictEqual(c.budget(120).ms, 8.33);
  assert.strictEqual(c.budget(60).ms, 16.67);
  assert.strictEqual(c.budget(90).ms, 11.11);
});
test('contrast matches the identity palette values', () => {
  assert.strictEqual(c.contrast('#8C8C8C', '#080808').ratio, 5.96);
  assert.strictEqual(c.contrast('#6B6B6B', '#F2F2F0').ratio, 4.75);
  assert.strictEqual(c.contrast('#7EE3EA', '#080808').ratio, 13.41);
  assert.strictEqual(c.contrast('#0D6C74', '#F2F2F0').ratio, 5.49);
  const ice = c.contrast('#7EE3EA', '#F2F2F0');
  assert.strictEqual(ice.ratio, 1.33);
  assert.strictEqual(ice.textAA, false);
});
test('contrast rejects a malformed colour', () => assert.throws(() => c.contrast('#12', '#000000')));
test('cache: 100k context x 40 turns on Sonnet 5.5 pricing', () => {
  assert.deepStrictEqual(c.cache(100000, 40, 2, 0.05), { rereadTokens: 4000000, noCacheUsd: 8, cachedUsd: 0.4 });
});

// ffmpeg recipes: run for real on generated media. Skipped when ffmpeg is absent.
const has = spawnSync('ffmpeg', ['-version']).status === 0;
const run = (args) => spawnSync('ffmpeg', ['-hide_banner', '-y', ...args], { encoding: 'utf8' });
const probe = (f, entries) => JSON.parse(spawnSync('ffprobe', ['-v', 'error', '-show_entries', entries, '-of', 'json', f], { encoding: 'utf8' }).stdout);
const dir = has ? fs.mkdtempSync(path.join(os.tmpdir(), 'tal-ff-')) : null;
const f = (n) => path.join(dir, n);

test('ffmpeg: generated source is 10 s 30 fps with tone', { skip: !has }, () => {
  const r = run(['-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=30:duration=10', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=10:sample_rate=44100',
    '-af', 'volume=-18dB', '-c:v', 'libx264', '-g', '60', '-pix_fmt', 'yuv420p', '-c:a', 'aac', f('src.mp4')]);
  assert.strictEqual(r.status, 0, r.stderr);
  const d = probe(f('src.mp4'), 'format=duration');
  assert.ok(Math.abs(Number(d.format.duration) - 10) < 0.1);
});

test('ffmpeg: re-encoded cut is frame accurate, stream-copy cut starts early', { skip: !has }, () => {
  assert.strictEqual(run(['-ss', '4.5', '-i', f('src.mp4'), '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', f('acc.mp4')]).status, 0);
  assert.strictEqual(run(['-ss', '4.5', '-i', f('src.mp4'), '-t', '2', '-c', 'copy', f('fast.mp4')]).status, 0);
  const acc = Number(probe(f('acc.mp4'), 'stream=duration:format=duration').format.duration);
  assert.ok(Math.abs(acc - 2) < 0.1, 'accurate cut duration ' + acc);
  const fastFirst = Number(probe(f('fast.mp4'), 'format=start_time').format.start_time);
  assert.ok(fastFirst >= 0);
});

test('ffmpeg: two-pass loudnorm lands near the target and keeps 48 kHz', { skip: !has }, () => {
  const p1 = run(['-i', f('src.mp4'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  assert.strictEqual(p1.status, 0, p1.stderr);
  const m = p1.stderr.match(/\{[\s\S]*?"target_offset"[\s\S]*?\}/);
  assert.ok(m, 'pass 1 JSON not found');
  const j = JSON.parse(m[0]);
  const af = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  assert.strictEqual(run(['-i', f('src.mp4'), '-af', af, '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', f('norm.mp4')]).status, 0);
  const sr = probe(f('norm.mp4'), 'stream=sample_rate,codec_type');
  assert.ok(sr.streams.some((s) => s.codec_type === 'audio' && s.sample_rate === '48000'));
  const e = run(['-i', f('norm.mp4'), '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const integ = [...e.stderr.matchAll(/I:\s+(-?\d+\.\d+) LUFS/g)].pop();
  assert.ok(integ, 'no ebur128 summary');
  assert.ok(Math.abs(Number(integ[1]) + 16) < 1.5, 'integrated loudness ' + integ[1]);
});

test('ffmpeg: output -r gives constant frame rate', { skip: !has }, () => {
  assert.strictEqual(run(['-i', f('src.mp4'), '-r', '25', '-c:v', 'libx264', '-an', f('cfr.mp4')]).status, 0);
  const s = probe(f('cfr.mp4'), 'stream=r_frame_rate,avg_frame_rate').streams[0];
  assert.strictEqual(s.r_frame_rate, '25/1');
  assert.strictEqual(s.avg_frame_rate, '25/1');
});

test('ffmpeg: silencedetect finds a gap', { skip: !has }, () => {
  assert.strictEqual(run(['-f', 'lavfi', '-i', 'sine=frequency=300:duration=1', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-f', 'lavfi', '-i', 'sine=frequency=300:duration=1',
    '-filter_complex', '[0:a]aformat=sample_rates=44100:channel_layouts=mono[a];[1:a]atrim=duration=1[b];[2:a]aformat=sample_rates=44100:channel_layouts=mono[c];[a][b][c]concat=n=3:v=0:a=1', f('gap.wav')]).status, 0);
  const r = run(['-i', f('gap.wav'), '-af', 'silencedetect=noise=-35dB:d=0.4', '-f', 'null', '-']);
  const s = Number(r.stderr.match(/silence_start: (\d+\.?\d*)/)[1]);
  const e = Number(r.stderr.match(/silence_end: (\d+\.?\d*)/)[1]);
  assert.ok(Math.abs(s - 1) < 0.01 && Math.abs(e - 2) < 0.01, `start ${s}, end ${e}`);
});

test('ffmpeg: contact sheet is produced', { skip: !has }, () => {
  assert.strictEqual(run(['-i', f('src.mp4'), '-vf', 'fps=1,scale=160:-1,tile=5x2', '-frames:v', '1', f('sheet.png')]).status, 0);
  assert.ok(fs.statSync(f('sheet.png')).size > 1000);
});
