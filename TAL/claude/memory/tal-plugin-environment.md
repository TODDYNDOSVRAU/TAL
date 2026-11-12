---
name: tal-plugin-environment
description: "Machine facts for the T.A.L. plugin (C:\\dev\\TAL\\plugin): Python only via `py`, brand fonts not installed, which third-party plugins stay enabled"
metadata:
  node_type: memory
  type: project
  updated: 2026-11-11
  originSessionId: 4be8fa57-283c-4e9d-a8b5-e4a735881617
  modified: 2026-11-11T01:06:04.527Z
---

The T.A.L. plugin (v2.0.2) bundles third-party tools in `skills/tal/scripts/vendor/` (sources and licences in `NOTICE.md`).

- Python 3.12 exists only through the `py` launcher; `python` and `python3` are Microsoft Store stubs that fail.
- The three brand fonts (variable TTFs, identical in the tacts and tarkas apps) were copied on 2026-11-11 to C:/dev/TAL/fonts/, plus static cuts made with fontTools in a temporary venv (space_grotesk_500/700, inter_500/700, jetbrains_mono_700). brand-tal.json points font_file at space_grotesk_500.ttf. ffmpeg drawtext renders only the default weight of a variable font, hence the static cuts. OFL licence texts were not added.
- Enabled third-party plugins: rea, ffmpeg-skill, dwarf-expert. Disabled on 2026-11-11 because the T.A.L. skill absorbed their useful content: superpowers, fp-check, differential-review, example-skills. ui-ux-pro-max, taste-skill and the claude-mem plugins were already disabled.

**Why:** the owner wants one lean always-on T.A.L. skill; each enabled skill adds permanent description cost, and superpowers and fp-check also add hooks.
**How to apply:** run Python tools with `py`; don't re-enable the disabled plugins without asking; for ffmpeg text use the static cuts, not the variable fonts.
