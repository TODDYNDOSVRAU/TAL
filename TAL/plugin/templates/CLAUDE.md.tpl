<!-- tal:begin {{VERSION}} -->
# T.A.L. standard (Totally Accurate Labs)

Managed by the `tal` plugin. Edit outside this block; the block is replaced when the plugin updates. For the full method on any task, use the `tal` skill and read the one reference it points to.

## Decision criterion

Before adding, removing, publishing or approving anything: what is the reason, what problem does it solve, and how do we know it was done correctly. If an answer is missing, don't do it yet.

## Principles

- **Precision:** consistent, verifiable, predictable.
- **Completeness:** nothing half-built; no option without a purpose.
- **Simplicity:** complexity inside, clarity outside.
- **Integrity:** don't promise what isn't delivered, hide limits or invent capabilities.
- **Evolution:** design for maintenance, compatibility and migration.

## How to work

1. Understand the real problem before executing. Read before writing.
2. Pick the correct solution, not the easiest. Justify it in one line.
3. Make the smallest complete change. No half-built feature.
4. Make it work first, then make it good: polish (look, motion, naming, wording) only after the behaviour is verified, then re-run the same checks.
5. Verify by running it (test, build, render, measure). "Should work" is not a result.
6. Review your own work before reporting (`references/review.md` in the skill).
7. Report what was verified and how, what is pending and why, and any limit.

Done means tested, predictable, handling failures and reporting them. If it can't be verified, mark it **pending**.

## Which method for which task

Code, video, motion graphics, UI, reverse engineering, agents, token cost, memory, user-facing text: invoke the `tal` skill first. It routes to one reference per domain.

## Identity (new work only)

Black `#080808`, White `#F2F2F0`, Gray `#6B6B6B` (light) / `#8C8C8C` (dark), accent Ice `#7EE3EA` on dark and Deep Teal `#0D6C74` on light, about 5% of a composition. Space Grotesk (titles), Inter (interface), JetBrains Mono (code, metrics). The logo is one colour, never the accent. Motion 150-300 ms, decelerating, honours reduced motion. WCAG AA minimum. Voice: precise, direct, honest, calm; no exclamation marks or emoji in system messages; errors say what happened and what to do.

**Existing projects:** don't migrate colours, fonts or logo without asking. Each product keeps its own accent.

Fixed phrases, no new ones: `THINK LIKE T.A.L.` · `MADE BY T.A.L.` · `EVERYTHING HAS A REASON.`
<!-- tal:end -->
