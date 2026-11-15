@RTK.md

## Context and models (general rule, all projects)

**Context: 200k.** Work inside a 200k-token window. Don't select the 1M variants (`[1m]`). Keep the window lean: read only the part of a file you need, send long output and briefs through files (not pasted text), and delegate wide reads to a subagent that returns only the conclusion. Around 150k used (75%), write a short checkpoint (done, pending, next step) and compact or continue in a fresh session instead of running to the limit.

**Models: Haiku, Sonnet, Opus. Fable only as a last resort** (Opus came back stuck and the task justifies the cost; say so before using it). This holds for the main session, every subagent `model` parameter, agent frontmatter, `CLAUDE_CODE_SUBAGENT_MODEL` and workflows. Where a skill or reference says otherwise, this file wins.

**Dedicated agent per subject, with model and effort fixed in its file.** Use the agent that fits the task; if none does, create one for that subject in `~/.claude/agents/<name>.md` (`model:` and `effort:` set, least tools, one narrow job). Shipped: `tal-scout` (haiku, low), `tal-builder` (sonnet, medium), `tal-architect` (opus, high), `tal-reviewer` (sonnet, high, read-only diff review), `tal-log-triager` (haiku, low, log triage). The Agent tool has no effort parameter, so effort comes from the file.

**Precedence: what the owner asks in the current session overrides this file and every skill.** The 200k limit is enforced in `~/.claude/settings.json` (`autoCompactWindow` 200000, `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`).

**Analyse the task before choosing the model.** Before the first tool call of any non-trivial task, answer in one line each:

1. **What is the task?** Reading/searching, mechanical edit, normal feature, hard debugging, design/architecture, security, review.
2. **What does a wrong answer cost?** The cost of an error that is hard to find later sets the tier, not the size of the task.
3. **Is the path already known?** A plan that already holds the code to write (transcription plus tests) fits a lighter model than prose with open decisions.
4. **What is the lightest model that passes steps 1–3?** Choose it, and record it as `Model: <name> | why`.

Use the **lightest model that can do the task correctly**, in this order of preference:

| Task | Start with |
|---|---|
| Find a file, read logs, summarise or extract from a document, rename, format, single-file mechanical fix | Haiku (newest first; an older Haiku is enough when the output is simple) |
| Normal feature, tests, refactor, review of a small diff | Sonnet |
| Design, architecture, hard or ambiguous debugging, security review, a mistake that is expensive to find later | Opus |

**Versions count, not only the tier.** Inside a tier, start with the oldest version that is still available and adequate for the task (Sonnet 5 or earlier before Sonnet 5.5; an older Opus before Opus 5.5) and move up only when the task needs it. The newest model is for work an older one fails at, not the default. Confirm which versions are currently available and their prices before relying on this (list prices, input/output per MTok, 2026-11: Opus 5.5 4/20; Sonnet 5.5 2/10; Haiku 5.5 0.10/0.50).

**Escalate on evidence.** If a model comes back stuck, wrong or looping, move to a version or tier above it (an older Sonnet to Sonnet 5.5, Sonnet to Opus) and say what was tried. Never move down because a task looks small once it has already failed. Always set `model` explicitly when dispatching: an omitted `model` inherits the session's, which is often the dearest.
