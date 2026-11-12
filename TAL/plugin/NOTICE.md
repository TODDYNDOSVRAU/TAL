# Notices

The T.A.L. plugin bundles third-party files under `skills/tal/scripts/vendor/`. Each folder keeps the licence file of its source. Files were copied from the plugin versions installed on the owner's machine on 2026-11-11. Changes are listed below; anything not listed is unmodified.

| Folder | Source | Licence | Copyright | Changes |
| --- | --- | --- | --- | --- |
| `vendor/ffmpeg/` | kajisho5/ffmpeg-skill 3.2.3, `scripts/` | MIT (`vendor/ffmpeg/LICENSE`) | see that file | Added `brand-tal.json` (T.A.L. identity for `graphics.py --brand`). Scripts unmodified. |
| `vendor/skill-eval/` | anthropics/skills, `skill-creator/scripts/` (`run_eval.py`, `aggregate_benchmark.py`, `quick_validate.py`, `utils.py`) | Apache-2.0 (`vendor/skill-eval/LICENSE.txt`) | Copyright 2026 Anthropic, PBC | `run_eval.py`: import changed from `scripts.utils` to `utils` so it runs from this folder. |
| `vendor/webapp/` | anthropics/skills, `webapp-testing/scripts/with_server.py` | Apache-2.0 (`vendor/webapp/LICENSE.txt`) | Copyright 2026 Anthropic, PBC | None. |
| `vendor/lint/` | Leonxlnx/taste-skill 2.1.5, `scripts/lint.mjs` | MIT (`vendor/lint/LICENSE`) | Copyright (c) 2026 Leonxlnx | Rules changed to the T.A.L. identity; marked "Modified for T.A.L." in the file header. |
| `vendor/debug/` | obra/superpowers 7.0.2, `systematic-debugging/find-polluter.sh` | MIT (`vendor/debug/LICENSE`) | Copyright (c) 2025 Jesse Vincent | None. |

## Ideas adapted into the references

Wording in `skills/tal/references/*.md` was rewritten in the T.A.L. style. Sources used for ideas and numbers:

- **MIT / Apache-2.0, adapted:** obra/superpowers (testing, debugging, verification, subagent practice), anthropics/skills (skill-creator, frontend-design, mcp-builder, webapp-testing), kajisho5/ffmpeg-skill, Leonxlnx/taste-skill, morluto/rea (reverse engineering evidence rules), thedotmack/claude-mem (handoff and layered recall; Apache-2.0), DietrichGebert/ponytail 5.3.3 (MIT, Copyright (c) 2026 DietrichGebert; the option ladder and shortcut-comment rule in `code.md`, "The smallest complete change"; its hooks, task-board ledger, webhook and levels were not adopted).
- **CC-BY-SA-4.0, paraphrased only, no text copied:** trailofbits/skills (differential-review, fp-check, dwarf-expert). Ideas credited to Trail of Bits.
- **No licence found, facts only, no prose copied:** apple-design, mobile-design, native-app-designer, anthropics doc-coauthoring.

Numbers taken from a source are marked "reported by <source>" in the references and are not verified by T.A.L. unless stated.
