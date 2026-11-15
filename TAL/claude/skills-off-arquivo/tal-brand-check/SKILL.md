---
name: tal-brand-check
description: Audit a C:\dev project against the T.A.L. identity v1.2. Use after any change to colour, theme, font, logo, icon or splash, before shipping UI, and when migrating an old project. Runs a script that finds retired Signal Lime, colours outside the palette and fonts outside Space Grotesk, Inter and JetBrains Mono, then lists what still needs a manual look.
---

# T.A.L. brand check

## Run

```bash
node ~/.claude/skills/tal-brand-check/scripts/brand-check.js <folder-or-file>
node ~/.claude/skills/tal-brand-check/scripts/brand-check.js <folder> --strict   # warnings fail too
```

Exit code 1 means an error: a retired colour (Signal Lime `#C7FF32`) or, with `--strict`, any colour or font outside the identity.

The script reads `.kt .xml .css .html .js .ts .svg .json .md`, skips `build`, `node_modules`, `.git`, and groups warnings by value. It treats an alpha channel as opacity of a base colour, which the identity allows. Kotlin `0xAARRGGBB` and Android `#AARRGGBB` drop the first byte; CSS `#RRGGBBAA` drops the last.

## What a warning means

A warning is a question, not a verdict. Colours that come from intermediate tones are fine only if they are the base colours at an opacity. A different hex needs a recorded reason, or a fix. Per the identity, **never replace a project's accent without asking.**

## What the script cannot check (do by hand)

| Rule | How to check |
| --- | --- |
| Ice `#7EE3EA` never on a light background (1.3:1); use Deep Teal `#0D6C74` | Look at every place Ice is used and the surface under it |
| Accent at most ~5% of a composition, only for active, ready or attention | Look at the screen |
| Logo: one colour only, never the accent | Open the logo in each theme |
| Logo minimum: 48 px high with letters, 12 mm printed; below that, blocks only (down to 16 px) | Check the smallest render |
| Logo clear space: one block width on every side | Check spacing |
| Logo don'ts: no distortion, rotation, changed angle, changed order or height, fills, uneven strokes, shadow, glow, gradient, or placement on a photo | Visual review |
| Official logo files only: `AB-topo-negativo.svg`, `AB-topo-positivo.svg` in `C:\dev\TAL\logo\`; below 48 px `B-camadas-*.svg` | Compare file source |
| Text contrast WCAG AA | `design:accessibility-review` |

## Report format

Say how many files were scanned, list errors first, then warnings with counts, then the manual items you did and didn't verify. If the manual items were not checked, write **pending**.
