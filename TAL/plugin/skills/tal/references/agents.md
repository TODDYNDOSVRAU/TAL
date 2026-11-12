# Agents and workflows

## Do I need an agent at all?

A subagent costs a full context of its own. Use one only if at least one is true:

- The work is **independent and parallel** (several searches, several modules).
- The task reads **a lot you don't need to keep** (a wide search where you want only the conclusion).
- You want a **second opinion not anchored on yours** (review).
- It should run **in the background** while you continue.

Do it yourself when it is a handful of tool calls or you already know the target file. Never delegate a check you can run inline. Never run the same work twice (yours and an agent's).

## Which agent and model

| Task | Agent | Model tier |
| --- | --- | --- |
| Find where something is, wide fan-out | `Explore` | Inherits the main model by default. For a cheap searcher define your own read-only agent with `model: haiku` |
| Mechanical edits across many files, renames, formatting | general-purpose | Cheap |
| Normal feature work, tests, refactors | main session or general-purpose | Mid (sonnet class) |
| Design, architecture, hard debugging, security review, ambiguous requirements | main session or `Plan` | Strongest (opus class) |
| Independent review of a diff | fresh agent given the diff, not your conclusion | Mid or strong |
| Summarise or extract from a big document | general-purpose | Cheap |

Rule: **the cost of a wrong answer sets the tier, not the size of the task.** Cheap models for reading and mechanical work; strong ones where a mistake is expensive to find later.

Model precedence for a subagent (Claude Code docs, recent versions): the `model` parameter of that invocation, then the agent's frontmatter `model`, then `CLAUDE_CODE_SUBAGENT_MODEL`, then the main model. Older versions put the variable first, so check your version. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` forces one model and ignores frontmatter. Accepted values: `sonnet`, `opus`, `haiku`, `fable`, a full model ID, `inherit`. `Explore` and `Plan` start without CLAUDE.md and git status.

**Always set `model` explicitly when dispatching.** An omitted model inherits the session's model, often the strongest and dearest, which silently defeats the table above. Escalation: a task that came back stuck goes to a model at least one tier above the one that got stuck.

Superpowers' observation (its own, not measured here): *turn count beats token price*. Cost and context grow with the number of turns, and the cheapest models reportedly take 2-3x the turns on multi-step prose-described work, so use a mid tier as the floor for reviewers and for implementers working from prose. The cheapest tier fits when the plan already contains the code to write (transcription plus tests) and for single-file mechanical fixes. Size signals: 1-2 files with a full spec means cheap; several files with integration concerns means standard; design judgment or broad codebase understanding means strongest.

Price ratios (list, input/output per MTok): Fable 5.1 10/50; Opus 5.5 4/20; Sonnet 5.5 2/10; Haiku 5.5 0.10/0.50. Opus is 2x Sonnet; Sonnet is 20x Haiku. Prices change; confirm on the pricing page.

Cost of agents: Anthropic's multi-agent research post measured about 4x chat tokens for one agent and about 15x for multi-agent (Claude 4 era, not remeasured on Claude 5). A subagent's first request cannot read the parent's cache, and the post found most coding tasks parallelise poorly. Spend agents where the value justifies it.

## Writing the brief

The brief is all the agent knows. Include:

1. **Goal** and what "done" looks like.
2. **What you already know or ruled out** (so it doesn't redo it).
3. **Where to look** (files, docs), instead of retyping them.
4. **Scope limits** (read-only? which folders? don't commit).
5. **Output shape** (a list of files with line numbers; a verdict plus evidence; under N words).

6. **Context as files, not pasted text.** Anything you paste into a dispatch, and everything an agent prints back, stays in your context and is re-read every later turn. Write the brief, the diff and the report to files and pass the paths. Never let an agent inherit the session context by default.
7. **A base to compare against.** Record `BASE` (`git rev-parse HEAD`) before dispatching and diff against it. Never use `HEAD~1`: it silently drops all but the last commit of a multi-commit change.

Ask for evidence, not a conclusion. Don't hand it your hypothesis and ask it to confirm: it will agree. Check its result before you rely on it: an agent's report is a claim.

## Creating a reusable agent

File `.claude/agents/<name>.md` (project) or `~/.claude/agents/<name>.md` (all projects):

```markdown
---
name: log-triager
description: Reads build or runtime logs and returns the first real error with its cause and the file to open. Use when a log is over 200 lines.
tools: Read, Grep, Glob
model: haiku
---

You triage logs. Return: first real error (quote the line), likely cause, file and line to open. Ignore warnings unless they precede the error. Under 150 words. Say "no error found" if there is none.
```

`tools` may be a comma list or YAML list; omitting it inherits every tool. Other useful fields: `disallowedTools`, `maxTurns`, `effort`, `skills`, `isolation: worktree`, `background`, `memory`. Unknown fields are silently ignored, so a typo gives no error. Agents shipped inside a plugin ignore `hooks`, `mcpServers` and `permissionMode`.

Rules:
- **One narrow job** per agent, described by when to use it (the description is how it gets picked).
- **Least tools.** A read-only agent gets read-only tools.
- **Explicit `model`** matched to the table above.
- **Fixed output format** so the result is cheap to consume.
- Test it on a real case before relying on it, and keep that case.

## Workflow design

1. **Decompose by independence**, not by size. Parts that need each other's results run in sequence; the rest in parallel, in one message.
2. **Put checks at the boundaries.** Each stage verifies its input.
3. **Pipeline, don't barrier.** Start verifying a result as soon as it exists.
4. **One writer per set of files.** Two agents editing the same files will overwrite each other; use separate worktrees if they must overlap.
5. **Bound it.** Set a count and a stopping rule, scaled to complexity: one agent for 3–10 calls, 2–4 for comparisons, 10+ only for broad research (Anthropic's own guidance). Keep fan-outs on the same model, tools and prompt prefix so the cache is shared.
6. **A loop over many items belongs in a script** (dynamic workflow): the script holds the plan and results and Claude's context gets only the final answer. Documented limits: 16 concurrent by default, 1,000 agents per run, a warning above 25 agents.
7. **Review last, and independently.** The reviewing agent gets the code, not your reasoning. Two stages per task: first *did it build what the spec asks* (a spec's silence is not permission to add things), then *is it built well*. A whole-branch review closes the work.
8. **Check the real diff**, not the agent's success report: `git diff BASE..HEAD` and the test output it claims.
9. **Workers and reviewers don't spawn their own agents.** One level of delegation; the coordinator keeps the plan.
10. **Fix loop, bounded.** A fix round is one fix plus one scoped re-review of the fix diff only. At most 5 rounds per task. Rounds 1-3 go back to the same agent with the findings verbatim; rounds 4-5 go to a fresh agent one tier up, told what was tried (it may be unable to see its own problem). Each round needs the covering tests, the command and its output before the re-review. Minor findings are recorded and deferred, not looped on. At the cap, the coordinator rules on each open finding.
11. **Ledger.** Keep a short written ledger (task, status, commit range, rulings). After compaction trust the ledger and `git log` over recollection. A ruling is one line: `Ruling: <what> | why | cost if wrong`. A silent discard of a finding is forbidden.
12. **Stop and ask only for:** an irreversible action, a security-sensitive action, a side effect outside the work area, or a plan so broken that every path forward is a guess. Decide and log everything else.
13. **Waiting.** Work while children run; when idle, wait in bounded stretches of 5-10 minutes with a one-line status between, and list your live children so a stuck one is noticed.
14. **Measure.** If the workflow didn't beat doing it directly (time or quality), simplify it.

## Anti-patterns

Agents for trivial lookups; agents briefed with a conclusion; the strongest model on mechanical work; many agents editing one file; trusting an agent's "done" without checking the diff; pasting history into a brief; `HEAD~1` as a base; a fix loop with no round cap.

**Rejected from superpowers** (they conflict with lean context and with the don't-over-delegate rule above):
- "Invoke a skill if there is even a 1% chance it applies": loads long skills on every prompt. We route on evidence (`hooks/route.js`).
- "Do not pause to check in": the stop list above is the exception that matters.
- "Never fix findings yourself in the coordinator": a one-line fix by the coordinator, then reviewed, costs less than a dispatch. Delegate when the fix is more than a few calls.
- A fresh agent plus reviews for every task: only worth it when the task passes the first test in this file.

## Larger companion skills

- **obra/superpowers** (MIT; 315,747 stars reported by the GitHub API on 2026-11-10): subagent-driven development, parallel dispatch, task review. The fix-loop, ledger, BASE and context-as-files rules above are adapted from it. It delegates more than this file recommends; keep the 'do I need an agent' test.
