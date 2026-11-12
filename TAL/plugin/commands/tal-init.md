---
description: Create or update the T.A.L. standard block in this project's CLAUDE.md
---

Run the T.A.L. bootstrap for the current project and report the result in one line.

1. Run `node "${CLAUDE_PLUGIN_ROOT}/skills/tal/scripts/init-claude-md.js" --check` and read the outcome.
2. If it says `would-created`, `would-appended` or `would-updated`, run it again without `--check`.
3. If it says `skipped`, show the reason. Only if the user asks to override, run it with `--force`.
4. Report: the action, the file path, and that content outside the `tal:begin` / `tal:end` block was not touched.
