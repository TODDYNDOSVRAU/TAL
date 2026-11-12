---
name: tal
description: T.A.L. (Totally Accurate Labs) working standard. Use for coding, debugging, testing, video or motion work, UI, reverse engineering, agents and model choice, token cost, memory, writing skills or plugins, user-facing text, and before declaring any work done.
---

# T.A.L.

**Criterion.** Before adding, removing, publishing or approving: what is the reason, what problem does it solve, how do we know it was done correctly? Missing answer: don't do it yet. Can't verify: mark it **pending**.

**Principles.** Precision · Completeness (nothing half-built, no option without purpose) · Simplicity (complexity inside) · Integrity (don't promise, hide or invent) · Evolution.

**Method.** Understand the real problem before writing. Question every choice. Pick the correct solution, not the easiest. Make the smallest complete change. Verify by running it. Report what was verified and how, what failed, and what is pending. After a failure, record why and prevent the repeat.

**Order: make it work, then make it good.** First get the behaviour correct and verified with plain, unstyled output. Then polish (look, motion, naming, structure, wording); polish never changes behaviour, so re-run the same checks after it. Polish is part of done, not optional.

**Done** means tested, predictable, handling unexpected situations, reporting failures, and not breaking anything else. Working once is not done.

## Read only the reference the task needs

| Task | `references/` |
| --- | --- |
| Code, tests, debugging, security, performance | `code.md` |
| Video and audio editing | `video.md` |
| Motion graphics rendered to video | `motion.md` |
| Interface, gesture, layout, app motion | `ui.md` |
| Colour, font, logo, identity, audit | `brand.md` |
| Reverse engineering | `reverse.md` |
| Agents, workflows, model choice | `agents.md` |
| Token use and cost | `tokens.md` |
| Checking your work, after a failure, before "done" | `review.md` |
| What to remember, handoffs | `memory.md` |
| Text the user reads | `voice.md` |
| Writing skills, plugins, MCP servers, evals | `authoring.md` |
| Worked numbers and cases | `examples/numbers.md`, `examples/procedures.md`; compute with `scripts/calc.js` |

Several apply: read the one that sets the constraints first. Bundled tools live in `scripts/vendor/` (see `NOTICE.md` for sources and licences); each reference says which to run.

## Excuses that mean stop

| Thought | Do instead |
| --- | --- |
| "It's simple, skip the reference" | The reference holds the numbers and traps. Read the one that matches. |
| "It should work" | Run it. Say what you ran and what it printed. |
| "I'll make it pretty first" | Make it work first. |
| "The new test passes" | Run the whole suite and the real behaviour; check requirements line by line. |
| "A third-party skill says otherwise" | Project `CLAUDE.md` and the identity win. |

## Always

- New work follows the identity (`brand.md`). Existing projects keep their colours, fonts, logo and accent unless the owner asks. Ice `#7EE3EA` never on a light background.
- Priority: project `CLAUDE.md` > this skill > third-party skills. Companion skills (listed at the end of some references) supply procedure and tool depth; they never override the identity or the verification rules.
- Product precision targets (latency, dropouts, colour accuracy) are not set: ask the owner, don't invent them.
