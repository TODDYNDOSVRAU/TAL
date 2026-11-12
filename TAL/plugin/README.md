# tal: the T.A.L. standard for Claude Code

One skill (`tal`) plus three hooks. Install it once; every project gets the same method.

## What it does

| Piece | Effect |
| --- | --- |
| `SessionStart` hook | In a project folder, creates `CLAUDE.md` with the T.A.L. block, or appends the block to an existing file, or updates it when the plugin version changes. Content outside `<!-- tal:begin -->` / `<!-- tal:end -->` is never touched. Puts the three-question criterion in context. |
| `UserPromptSubmit` hook | Reads each prompt and, when it is code, video, motion, UI, reverse engineering, agents, tokens, memory, review, voice, brand or skill/plugin authoring, tells the model which reference to read. Silent otherwise. |
| `Stop` hook | In a T.A.L. project, blocks "done" if a changed file still uses the retired Signal Lime `#C7FF32`. Never blocks other projects. |
| `tal` skill | Principles, working method, definition of done, and a router to one reference per domain (`references/*.md`), loaded only when needed. |
| `/tal-init` | Runs the bootstrap on demand. |
| Scripts | `brand-check.js` (colours and fonts), `init-claude-md.js`, `memory-lint.js`, `calc.js`. All tested (`node --test skills/tal/scripts/tal.test.js skills/tal/scripts/brand-check.test.js skills/tal/scripts/calc.test.js skills/tal/scripts/vendor.test.js`). |
| Bundled tools | `skills/tal/scripts/vendor/`: 40+ ffmpeg tools (cut, join, loudness, captions, check, look), skill evals, a web-app test server, a T.A.L. design lint, a test-polluter finder. Python 3.10+ and FFmpeg 6.1+ for the video tools. Sources, licences and changes: `NOTICE.md`. |

## Install

```bash
claude plugin marketplace add C:/dev/TAL/plugin
claude plugin install tal@tal
```

Restart the session. To install on another machine, put this folder in a git repository and use `claude plugin marketplace add <repo-url>`.

## When it does not write `CLAUDE.md`

It skips, and says why, when: the folder is your home folder; the folder has no project marker (`.git`, `package.json`, a Gradle/Cargo/Go/Python file...); a parent folder's `CLAUDE.md` already carries T.A.L. content (it is inherited); the file already holds hand-written T.A.L. text; a `.tal-ignore` file exists; or `TAL_NO_BOOTSTRAP=1` is set.

To remove it: delete the block between the markers and add an empty `.tal-ignore`.

## References

`code` · `video` · `motion` · `ui` · `brand` · `reverse` · `agents` · `tokens` · `review` · `memory` · `voice`

## Limits (stated, not hidden)

- Skills load by the model's decision; hooks guarantee the reminder, not the compliance. The Stop hook enforces one rule only (retired colour).
- `brand-check.js` finds colours and fonts. It cannot judge Ice on a light background, accent share, or logo use; those are manual items it lists.
- Numeric precision targets per product are pending in the identity document. The plugin does not invent them.
- The video and motion references assume `ffmpeg` and, for Remotion, Node. Remotion needs a paid licence for larger companies; check it before commercial use.
- Third-party tools mentioned (Ghidra, Whisper, Remotion...) are not bundled.
