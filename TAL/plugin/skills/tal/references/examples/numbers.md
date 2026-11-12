# Worked examples with numbers

Every number here comes from `scripts/calc.js` (tested in `calc.test.js`) or from a command that was run. Recompute with `node <skill-dir>/scripts/calc.js <command>` instead of trusting this page. `settle1pctSeconds` is a derived estimate (1.06 × response), not a sourced value.

## Video: loudness (two-pass)

Pass 1 measured `input_i = -20.3`, `input_tp = -4.1`. Target `-14` LUFS, `-1` dBTP.

`node calc.js loudness -20.3 -4.1 -14 -1` gives gain +6.3 dB, peak after gain +2.2 dBTP, `linearOk: false`.

Reading: a plain gain of +6.3 dB would put the peak 3.2 dB over the limit. `loudnorm` will fall back to dynamic mode (so add `-ar 48000`) or you add a limiter. Compare `-16 / -8 -> -14 / -1`: gain +2, peak -6, fits, linear mode works. Always confirm on the output with `ebur128=peak=true`.

Test result (this plugin's `calc.test.js`, ffmpeg 9.0.2): a 10 s tone at about -18 dB, normalised with the two-pass recipe to -16 LUFS, measured within 1.5 LU of target and 48 kHz.

## Video: cut accuracy and frame rate

- `-ss 4.5 -i in -t 2` with re-encode gives a 2.0 s clip (tested, within 0.1 s). With `-c copy` the clip starts at the keyframe before 4.5 s.
- Output `-r 25` on a 30 fps source gave `r_frame_rate = avg_frame_rate = 25/1` (tested).
- `silencedetect=noise=-35dB:d=0.4` on tone, 1 s silence, tone reported `silence_start: 0.999932`, `silence_end: 2.000091`. Real tools report values near, not exactly at, the true boundary, so leave the 80–120 ms handle.

## Motion: frames and springs

- `node calc.js frames 3 30`: 90 frames, 33.33 ms each. `--frames=0-90` is inclusive: 91 frames, 3.033 s.
- Stagger of 3 frames at 30 fps = 100 ms. Scene transition of 15 frames = 0.5 s.
- Remotion default spring: damping 10, stiffness 100, mass 1. Critical damping = 2·√(100·1) = 20, so the default ratio is 10 / 20 = 0.5: it overshoots. To arrive without overshoot set `damping: 20` or `overshootClamping: true`.

## UI: springs in Compose

`node calc.js spring 0.3` gives stiffness 438.65, critical damping 41.89 (unit mass; Compose's `dampingRatio` is already normalised, so use `DampingRatioNoBouncy = 1.0`).

For a hard 300 ms budget: `spring 0.28` gives stiffness 503.55 and a 1% settle estimate of 0.297 s. Response 0.3 settles at about 0.318 s, slightly over.

## UI: contrast on the identity palette

`node calc.js contrast <fg> <bg>`:

| Pair | Ratio | Text AA (4.5) | UI AA (3) |
| --- | --- | --- | --- |
| `#8C8C8C` on `#080808` | 5.96 | yes | yes |
| `#6B6B6B` on `#F2F2F0` | 4.75 | yes | yes |
| `#7EE3EA` (Ice) on `#080808` | 13.41 | yes | yes |
| `#0D6C74` (Deep Teal) on `#F2F2F0` | 5.49 | yes | yes |
| `#7EE3EA` on `#F2F2F0` | 1.33 | **no** | **no** |

The last row is why Ice never goes on light.

## UI: frame budget

`node calc.js budget 120` is 8.33 ms; 90 Hz is 11.11 ms; 60 Hz is 16.67 ms. A frame that takes 9 ms at 120 Hz is dropped as a whole: it displays at the next vsync, so the effective rate halves for that frame.

## Tokens: why the cache matters

`node calc.js cache 100000 40 2 0.05` (100k-token context, 40 turns, Sonnet 5.5 list price US$2/MTok, cache read 0.05×): 4,000,000 tokens re-read, US$ 8.00 without cache, US$ 0.40 with. Figures use list prices at the time of writing and ignore cache-write cost and output. A model switch or an idle gap past the TTL makes the next turn pay the uncached price again.

## Not computed here

Reverse engineering offsets, memory ranking and agent cost have no formula worth a script. They are procedures: see `examples/procedures.md`.
