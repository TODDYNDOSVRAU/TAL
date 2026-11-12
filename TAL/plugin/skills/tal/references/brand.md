# Brand check

Audit a project against the T.A.L. identity v1.2. Source of truth: `C:\dev\TAL\identidade\Identidade_TAL.html` (v1.2, October 2026; PDF export `Identidade_TAL_v1.2.pdf` beside it). Read it for the manifesto, logo rules and anything this file doesn't cover.

## Identity summary (new work)

- **Palette** below; accent about 5% of a composition, only for active, ready or attention. Signal Lime `#C7FF32` is retired.
- **Type:** Space Grotesk for titles and identity, Inter for interface and body, JetBrains Mono for code and metrics.
- **Logo:** one colour, never the accent; official files only.
- **Motion:** 150–300 ms, decelerating, honours reduced motion.
- **Layers:** every product has ESSENTIAL, ADVANCED and ENGINEERING in one app; no artificially limited lite/pro versions.
- **Fixed phrases, no new ones:** `THINK LIKE T.A.L.` · `MADE BY T.A.L.` · `EVERYTHING HAS A REASON.`
- **Existing projects:** don't migrate colours, fonts or logo without asking; each product keeps its own accent. If a project's file contradicts the identity, follow the project and say so.
- A third-party skill never introduces a colour, font, slogan or logo treatment outside the identity. That includes palettes, font lists and style libraries inside installed design skills.
- ffmpeg graphics (titles, lower thirds, overlays) take their colours and fonts from `scripts/vendor/ffmpeg/brand-tal.json`, not from the tool's defaults.

## Run

```bash
node <skill-dir>/scripts/brand-check.js <folder-or-file>
node <skill-dir>/scripts/brand-check.js <folder> --strict   # warnings fail too
```

`<skill-dir>` is the `tal` skill's folder. Exit code 1 means an error: a retired colour (Signal Lime `#C7FF32`) or, with `--strict`, any colour or font outside the identity.

It reads `.kt .xml .css .html .js .ts .svg .json .md`, skips `build`, `node_modules`, `.git`, and groups warnings by value. An alpha channel counts as opacity of a base colour, which the identity allows (Kotlin and Android `#AARRGGBB` drop the first byte; CSS `#RRGGBBAA` drops the last).

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Absolute Black | `#080808` | Backgrounds; text on light |
| Precision White | `#F2F2F0` | Light surfaces; text on dark |
| Technical Gray | `#6B6B6B` light / `#8C8C8C` dark | Secondary text (AA) |
| Ice | `#7EE3EA` | Accent **on dark only** |
| Deep Teal | `#0D6C74` | Accent **on light** |

Contrast: White on Black 17.9:1 · Ice on Black 13.4:1 · Deep Teal on White 5.5:1 · Gray `#6B6B6B` on White 4.8:1 · Gray `#8C8C8C` on Black 6.0:1 · **Ice on White 1.3:1, forbidden.** Intermediate tones come from opacity of the base colours.

## What a warning means

A warning is a question. A different hex needs a recorded reason or a fix. **Never replace a project's own accent without asking.**

## What the script cannot check (do by hand)

| Rule | How to check |
| --- | --- |
| Ice never on a light surface; Deep Teal there | Look at each use and the surface under it |
| Accent about 5% of a composition, only for active, ready or attention | Look at the screen |
| Logo is one colour, never the accent | Open it in each theme |
| Logo minimum: 48 px high with letters (12 mm printed); below, blocks only down to 16 px | Check the smallest render |
| Logo clear space: one block width on every side | Check spacing |
| Logo don'ts: no distortion, rotation, changed angle, order or height; no fills, uneven strokes, shadow, glow, gradient; not on a photo | Visual review |
| Official logo files only: `AB-topo-negativo.svg` / `AB-topo-positivo.svg` (blocks only: `B-camadas-*.svg`) in `C:\dev\TAL\logo\`. Don't redraw | Compare the file source |
| Text contrast WCAG AA | Measure |
| No hard-coded colour literals in screens; colours come from the theme tokens | Grep for `Color(0x`, `#RRGGBB` and `rgb(` outside the theme files. `scripts/vendor/lint/lint.mjs` does this for web, `.kt` and `.xml` files |

## Exceptions

A flagged value that must stay needs a recorded exception, one per rule, in the project's `CLAUDE.md`: **rule** (for example "colour outside palette"), **where** (file and line, or component), **reason**, **date**, **who approved**. An exception covers that place only; it is not a new rule. An undocumented warning is an open question, not an exception.

## Declared pending (identity document, do not invent)

- The main logo composition (symbol with the stacked name) with its text converted to outlines. Recorded as an open item in the owner's earlier `tal-core` skill; not found in the identity HTML, so confirm with the owner.
- Numeric targets for each product's measurements (T.A.R.K.A.S.: end-to-end latency, dropouts per hour, frequency-response deviation). Ask the owner.

## Report

Files scanned · errors first · warnings with counts · manual items you did and did not verify. Unverified manual items are **pending**.
