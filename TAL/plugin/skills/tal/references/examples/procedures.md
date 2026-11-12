# Worked procedures

Each is a short case: situation, steps, the check that can fail, and the report line. Only the ffmpeg cut, frame-rate, loudness and silence steps were run (see `calc.test.js`); the rest are templates to adapt and are not tested.

## 1. Video: 30 s vertical clip from a long landscape recording

Situation: 16:9 source, deliver 9:16, -14 LUFS, captions.

1. Probe: `ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,avg_frame_rate -of json in.mp4`. If `r_frame_rate != avg_frame_rate` it is variable rate: add output `-r 30`.
2. Plan file: `in 00:12:10 out 00:12:40 purpose: hook`, 1080x1920, 30 fps, 48 kHz.
3. Cut and reframe in one encode: `ffmpeg -ss 00:12:10 -i in.mp4 -t 30 -vf "crop=ih*9/16:ih,scale=1080:1920" -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4`. Crop width for a 1080p source is 1080·9/16 = 607.5; ffmpeg accepted the expression and produced a valid 1080x1920 file (run on a 1920x1080 test source). Check the crop position on a frame.
4. Loudness two-pass as in `examples/numbers.md`.
5. Verify: frame at 0 s, mid and last; `ebur128` on the output; caption box inside the top 10% / bottom 20% safe margins.
6. Report: "Rendered out.mp4, 30.0 s, 1080x1920 30 fps. Measured -14.2 LUFS, -1.3 dBTP. Checked frames at 0, 15, 29.9 s. Not checked: playback on device."

## 2. Motion: lower-third title in Remotion

1. Seconds to frames once: enter 0.4 s = 12 frames, hold 2.5 s = 75, exit 0.3 s = 9 at 30 fps. `durationInFrames = 96`.
2. Enter with `spring({frame, fps, config:{damping:20, stiffness:100, mass:1}, durationInFrames:12})`; exit with `interpolate(frame, [87, 96], [1, 0], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})`.
3. No `Math.random`, no CSS transition.
4. Render `--frames=0-95`; expect 96 frames, 3.2 s. Extract frames 0, 12, 48, 87, 95 and look at them.
5. Determinism: render frame 48 twice, compare PNG hashes.

## 3. Agent: log triager, and when not to use one

Use: a 6,000-line build log where you want only the first real error. Create `.claude/agents/log-triager.md` (template in `agents.md`), `model: haiku`, `tools: Read, Grep, Glob`. Test on a real log with a known answer and keep that log as the test case.

Do not use: reading one known file, or three tool calls. Cost reference: multi-agent runs used about 15× chat tokens in Anthropic's measurement (Claude 4 era), so the agent must save more than it costs.

## 4. Reverse: unknown firmware blob

1. `sha256sum fw.bin; ls -l fw.bin`; copy to `work/`, mark read-only. The hash is the sample name.
2. `binwalk fw.bin` (v3 flags: `binwalk --help`). Record each magic and offset.
3. If a magic is found, extract and recurse. If entropy is flat high with no magics: likely encrypted or compressed; stop and ask.
4. Raw NAND check: size is a multiple of (page + spare), e.g. 2048+64 = 2112 bytes. A file size divisible by 2112 but not 2048 suggests OOB is present.
5. Log each step as one finding row: ID, sample hash, command, tool version, output hash, confidence.

## 5. Review: report a bug fix honestly

Before: "Likely wrong if the fix only hides the crash; check: the failing test, and a run with the original input."
After: "Ran `X` before: FAIL `<line>`. After the change: PASS. Wider suite: 212 pass, 0 fail. Not run: device test (pending)."
If a reviewer disagrees without new evidence: re-run the check, keep the answer if it still passes.

## 6. Memory: one correction

User says: "don't mock the database; a mock hid a broken migration last quarter".
1. Search the index first. If a testing memory exists, update it.
2. Else write `feedback` memory: rule, **Why:** mock hid a bad migration, **How to apply:** integration tests hit a real database. Add `updated: 2026-11-08` (absolute date).
3. Index line: `- [No DB mocks](no-db-mocks.md) — integration tests use a real DB`.
4. Run `memory-lint.js`: expect 0 errors.
