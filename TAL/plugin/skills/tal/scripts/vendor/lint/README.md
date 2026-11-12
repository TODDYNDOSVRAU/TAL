# vendor/lint

`lint.mjs` is a static scan for identity breaks and generated-page tells. Run `node lint.mjs --help`.

- **Source:** taste-skill 2.1.5, `skills/taste-skill/scripts/lint.mjs`, by Leonxlnx. MIT, copyright 2026 (see `LICENSE`).
- **Modified for T.A.L.** The header of `lint.mjs` lists every change. In short:
  - removed the bans on monospace, hairline rules, outlined boxes and backdrop blur, because the identity uses JetBrains Mono for metrics, hairline borders for elevation and glass materials;
  - removed the "default font" rule, the em-dash count and the taste-skill workflow handling;
  - added: Signal Lime `#C7FF32` (FAIL), colours outside the palette (WARN), fonts outside Space Grotesk / Inter / JetBrains Mono (WARN), exclamation marks in interface text (WARN), Portuguese stock phrases;
  - scans `.kt`, `.kts` and `.xml`; `--strict`, `--allow` and `--help` are new.
- **Dependencies:** Node 18 or newer, no packages. Tested on Node 24.
- **Tested:** a clean fixture (palette colours with opacity variants in CSS and Kotlin, JetBrains Mono, hairline border, backdrop blur) exits 0; a fixture with `#C7FF32`, a foreign font and an off-palette colour exits 1; warnings alone exit 0, or 1 with `--strict`.
- **Not covered:** `rgb()` / `hsl()` and named colours, font names inside Kotlin string literals, and whether Ice is placed on a light surface (check by hand, `references/brand.md`). For colour and font audits of a whole project `scripts/brand-check.js` remains the main tool; this one adds the tells and the web and Android patterns.
