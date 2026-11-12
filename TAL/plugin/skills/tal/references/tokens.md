# Token and cost efficiency

Tokens are spent on **input** (everything in context, re-read every turn) and **output** (what you write). Most waste is input that stays in context for no reason.

## Input

| Do | Instead of |
| --- | --- |
| Search first (`grep`, glob), then read the matching range (`offset`/`limit`) | Reading whole files to find one function |
| Read a file once, then work from what you have | Re-reading after your own edit (the tool errors if the edit failed) |
| Run commands with narrow output (`--stat`, `head`, `-q`, a filter) | Dumping full logs, full diffs, directory trees |
| Delegate wide searches to a subagent and keep only its conclusion | Pulling 30 files into the main context |
| Outline a large file, then read the part you need | Loading it whole |
| Send independent tool calls in one message | A round trip per call, each re-reading the context |
| Keep `CLAUDE.md` under about 200 lines (docs guidance; `SKILL.md` under 500) and put detail in on-demand references | A long always-loaded file |
| Keep the cache prefix stable: pick model and effort at the start, append instead of rewriting | Switching model, fast mode or the tool set mid-task, or going idle past the cache TTL (5 min; 1 h on the main conversation of a subscription) |
| Disable plugins and servers you don't use. MCP tool definitions are deferred by default (only names load); skill descriptions are truncated at 1,536 characters | Many always-on skill descriptions |
| Clear or start a new session when the topic changes | One endless session |

Skill and tool **descriptions** are in context every turn. Keep each one to what decides relevance, one or two sentences.

## Shape the project so one change reads one small thing

You cannot "remember" a spot outside the context: whatever you hold is re-sent every turn. What cuts cost is making the part you need small and easy to find, so you never load the rest.

| Do | Why |
| --- | --- |
| One file per topic or screen, including strings (`i18n/dashboard.js`, not one 40 KB file with every language and screen) | A change to one screen reads kilobytes, not the whole catalogue |
| A short **file map** in the project `CLAUDE.md`: one line per area, "verdict: `lib/dashboard.js`; label: `public/js/view-label.js`" | Replaces exploring the tree at the start of each session |
| Facts that are not in the code (decisions, owner answers, what is pending) in `CLAUDE.md` or memory, one line each | A new session starts from them instead of from a long history |
| Find with `grep -n`, then `Read` with `offset` and `limit` around the hit | The cheapest "recall of a specific point" there is |
| One large request per session; start a new one when the topic changes | The context restarts small, and everything above is re-sent per turn |
| Edit instead of rewriting a file; rewrite only when most of it changes | A rewrite is output tokens plus the read before it |
| Verify with the automated test first; take a screenshot only for what tests cannot see | Each image stays in context |

Splitting a file is a refactor: tests that read the old file by name (for example a PT/EN parity test) must change in the same step, and the whole suite must run after it. Whether a split saves cost in a given project is not measured here; measure it with the billed numbers under "Measure it".

## Always-on costs: hooks and descriptions

Some plugins cost tokens or time in every session before you type anything. Audit them: read `hooks/hooks.json` of each enabled plugin and look at the event and the matcher.

| Event / matcher | Cost | Example seen in the plugin cache (2026-11-10) |
| --- | --- | --- |
| SessionStart that injects text | its size, every session | superpowers injects about 3.2 KB |
| Stop or SubagentStop prompt hook, matcher `*` | a model call each time the session stops, which can return `ok:false` | fp-check |
| PreToolUse / PostToolUse on `*` or on Read, Bash, Grep, Glob | latency plus injected context on every tool call | claude-mem (file-context, observation capture) |
| Skill and agent descriptions | in context every turn | every installed skill |

Keep an installed plugin enabled only if its tools are used; disable duplicated ones (`claude plugin disable <name>`; reversible). Measure, don't assume: a hook's real cost is its injected size times turns.

Also avoid skills that say to read every file in full, or that replace your exploration behaviour: they trade a clear scope for tokens. Their savings claims (for example "4-18x") are the vendor's own and are not reproduced here.

## Output

- Lead with the answer or the result. No preamble ("I'll now…"), no recap of what the user said.
- Reference code as `file:line` instead of pasting it back.
- Show diffs or the changed lines, not whole files.
- Tables for comparisons, short sentences otherwise. Cut adjectives.
- Don't repeat an identical analysis or a rejected tool call unless the input changed.
- A truncated preview is incomplete: say so, and fetch the part you need instead of parsing the preview as if it were everything.
- Do not narrate each tool call. One line before a batch is enough.
- Write the report once, at the end, with: result · evidence · pending.

## Compaction and long sessions

- Compact at a boundary (a task finished), not mid-debug.
- Before compacting, write the state that matters into a file or memory: decisions, open questions, next step, commands that worked.
- After compaction, trust the summary plus the files; don't re-derive settled decisions.
- On compaction CLAUDE.md and auto memory are re-injected from disk; recently read files are re-read (large ones as a path only); path-scoped rules and nested CLAUDE.md are summarised away. Compacting an old, cold session is the most expensive case.

## Effort and thinking

Thinking tokens bill as output. On the 5.5 models and Fable 5.1 thinking cannot be turned off: lower `/effort` instead. Output costs 5x input per token on Sonnet 5.5, so verbose answers and long reasoning are the costly part.

## Cache

Cache is an exact prefix match (tools, then system, then messages). Reads cost 0.1x base input (0.05x on Opus 5.5 and Sonnet 5.5, 0.025x on Fable 5.1); writes 1.25x (5 min) or 2x (1 h). Minimum cacheable prompt is 512 tokens on the 5.5 models; below it caching silently does nothing. Editing CLAUDE.md mid-session does not break the cache (it also doesn't apply until `/clear`, `/compact` or restart). Things that rebuild it: model switch, fast mode, tool-set change, compaction, idle past the TTL.

## Choosing the model

Use the cheapest tier that can do the job reliably (`references/agents.md`). Heuristic, not measured: a cheap model on a task it fails can cost more than the right model once. Never compare token counts across models; tokenizers differ.

## Tools

- **RTK** (`rtk`) filters shell output before it reaches the context. Use it for noisy commands.
- **headroom** can compress or outline large content; use it for files you only need part of.
- These help only if they are installed and working; check, don't assume. `rtk gain` shows RTK's own counterfactual estimate, not billed tokens (one run here reported 99.9% saved, implausible as a session saving). The effect of headroom was not measured.

## Measure it

If cost matters, look at it: per-session usage, which turns were largest, which tool results were largest. Optimise the biggest item, not the most visible one. Use billed numbers (`/usage` per-model input, output, cache read/write; API `usage` fields), not a tool's "saved" counter. Compare cache-warm to cache-warm, change one thing at a time, repeat runs (they vary), and pair cost with a verifiable outcome: cutting tokens can cut quality. Report savings as numbers you measured, never as a percentage you remember.

Rules for a cost report from session transcripts (adapted from claude-mem's agent-cost-report, Apache-2.0):
- Count each assistant message once: one request is written to the transcript in several lines, so deduplicate on `(message.id, requestId)`.
- Price 1-hour cache writes separately from 5-minute ones (2x vs 1.25x).
- Label every dollar figure ESTIMATED: it comes from list prices and the transcript, not from the invoice.
- Name the waste: context re-read, wrong model for the task, fan-out that returned little.

## Larger companion skills

- **caveman** (`caveman:caveman`, available here): a speaking-style skill that shortens replies. Its source repository is **not verified**: the plugin directory lists more than one `caveman` plugin from different authors, and the 118,885-star repo JuliusBrussee/caveman reported by a research agent is not confirmed to be the one installed. Its savings claims are unmeasured here. Its style conflicts with the T.A.L. voice, so use it only when the owner asks.
