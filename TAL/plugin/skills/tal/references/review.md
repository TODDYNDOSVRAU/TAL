# Review and self-correction

Run this before reporting any task as finished, and again after a failure. It costs a few lines of thought and prevents most rework.

## 1. Pre-mortem (before starting a non-trivial task)

Write down: *"If this turned out wrong, the most likely reasons are…"* (two or three). Design the check for each one into the plan.

## 2. Verify, don't re-read

Re-reading your own work is unreliable without an external signal: research finds that prompted self-correction on reasoning does not reliably help and can make answers worse, while real external feedback (tests, builds, tools) does. Finding the error is the bottleneck; once located, fixing it works. So check with something that can fail.

### The gate (before any "done", "fixed" or "passing")

1. **Identify** the command that would prove the claim.
2. **Run it now**, in full. An earlier run, a partial run, or "it passed before my last edit" is not evidence.
3. **Read all of the output**: the exit code and the number of failures, not the last line.
4. **Compare** the output with the claim, word for word.
5. **Only then** state it, with the command and the result.

Words that mean you have not done the gate: "should", "probably", "seems to", "I believe". Stop and run the check. Run the gate too before a commit, a push, a PR, and before starting the next task.

| Claim | Evidence that counts |
| --- | --- |
| "The bug is fixed" | The test that failed before now passes; the original steps no longer reproduce it |
| "The regression test is real" | Revert the fix, run the test: it must fail; restore the fix, run it: it passes |
| "It builds / runs" | The build or run output, from this session. A linter passing is not a build |
| "It looks right" | A comparison against a spec or expected image, or a human look. A screenshot judged by the same model that made it is weak evidence |
| "It's faster" | Before and after numbers |
| "Nothing else broke" | The whole test suite, or a named list of what was not run |
| "The requirements are met" | A line-by-line list of the requirements, each with its evidence. Passing tests alone do not show this |
| "The file contains X" | The line, read now |
| "The agent finished it" | The real diff (`git diff <BASE>..HEAD`), not the agent's success report |

No evidence available: write **pending** and say what is missing.

## 3. Critique pass (adversarial, on the diff)

These questions are prompts to find a runnable check, not a verdict. An answer that rests on reasoning alone is **unverified**: say so, and find the check. Ask each, answer in one line, fix what fails:

1. Does it solve the request, or a nearby easier problem?
2. What input breaks it? (empty, huge, null, concurrent, offline, wrong type)
3. What did I assume without checking?
4. What did I change that was not asked?
5. What would a hostile reviewer flag first?
6. Is any claim in my report stronger than my evidence?

### Reviewing a diff by risk

Rewritten in our own words from trailofbits' differential-review (CC-BY-SA-4.0); see `NOTICE.md`.

- **Rank changed files by what they can break, not by how many lines changed.** A two-line change to authentication, cryptography, money, permissions or input validation outranks a 500-line change to a screen. Tests and pure UI sit at the bottom.
- **A "refactor" is high risk until you show otherwise**, by showing that behaviour tests cover the code it moved.
- **Count the callers** of every changed function instead of guessing the blast radius: 1 to 5 low, 6 to 20 medium, 21 to 50 high, over 50 critical (the bands are the source's convention, not a measured rule).
- **Ask why removed code existed.** For deleted checks, run `git log -S "<removed text>" --all --oneline` and read the commits. A check removed from a commit that was itself a fix is critical until explained.
- **New code with no test raises the risk one step.**
- **Do not check out another revision on the working tree.** Use `git worktree add <dir> <sha>` (read-only inspection with `git show` and `git diff` is enough most of the time).

### Judging a claimed bug (yours or someone else's)

Models lean toward seeing problems and overrating their severity, so a claimed defect has to survive these steps before it goes in a report:

1. **Restate the claim exactly**: what input, what path, what wrong outcome. Many claims fall apart at this step.
2. **Reachability:** can that input reach that code in the product as shipped? Name the path.
3. **Real impact:** what does the user or attacker gain that they did not already have?
4. **Proof:** a failing test or a command that shows it. No proof, call it a suspicion.
5. **Bounds and environment:** check for protections that already stop it (type limits, validation upstream, platform guarantees) by reading the code again after you reach your conclusion. Do not invent mitigations you have not seen.
6. **Verdict:** confirmed, not reproducible, or false, each with the evidence. After a batch, check whether separate findings combine into a worse one.

### The reviewer's report

- Give each issue a severity (critical: bugs, data loss, security; important: design, missing behaviour, error handling, test gaps; minor: style, polish), a `file:line`, what is wrong, why it matters, and the fix if it is not obvious.
- End with a verdict: **Yes**, **No** or **With fixes**, and one or two lines of reasoning.
- **A spec's silence is not permission.** For behaviour the spec does not cover, judge by what a reasonable user would expect, and grade by the effect on that user.
- **List what you set aside**, one line each with the reason ("declined to judge"), so the author can rule on it. An empty list says you set nothing aside.
- A reviewer reads and reports only: no edits to the tree, no spawning more reviewers.

## 4. When something fails

1. **Read the error whole.** The first line is often a symptom.
2. **Form one hypothesis**, say what observation would disprove it, and test that. Do not change several things at once.
3. **Retry limits (a heuristic, not a measured rule):** two failed attempts on the same hypothesis, stop, go back a level and question the assumption. After three failed fixes in total, even on different hypotheses, stop and question the architecture with the owner before a fourth.
4. **Fix the cause, not the symptom.** A suppressed warning, a widened timeout or a retry is not a fix unless the cause is understood.
5. **Never weaken a test to make it pass, and never edit the checklist or feature list to match the result.** If the test is wrong, say why. Change a feature's status only after verifying it end to end, as a user would; unit tests alone let agents mark features done wrongly.
6. **Reproduce first, then fix.** Quote the command and the red result, then the green one.
7. **Don't cave to pushback.** Assistants drift toward agreeing with the user. If a human or reviewer disagrees, re-check with evidence before changing a correct answer; agree only if the evidence agrees.
8. **High-risk change:** give the diff and the requirements (not your reasoning) to a fresh reviewer. Sensible given judge biases (position, verbosity, self-preference); a measured gain was not found.

## 5. Receiving review feedback

- **Read all items before changing anything.** If any item is unclear, ask about it first, because items are often related and a partial understanding gives a wrong implementation. Example: "I understand 1, 2, 3 and 6. I need to know what you mean by 4 and 5 before I start."
- **Verify the suggestion against the code before applying it.** If it is wrong, say so with the technical reason. If you cannot check it, say: "I can't verify this without X. Should I investigate, ask, or proceed?"
- **A request to "implement it properly"**: search the codebase for real use first. If nothing uses it, propose removing it instead of building it out.
- **Order of work:** blocking issues (breaks, security), then simple fixes, then complex ones; test each fix on its own and check for regressions.
- **Feedback that conflicts with an earlier decision of the owner:** stop and talk to the owner first.
- Answer each item with the fix or a reasoned objection, not with agreement alone.

## 6. Calibrated reporting

- Say what you verified in the words of what you did: "ran `X`, got `Y`".
- Say what you did not verify, and why.
- If you were wrong earlier in the session, say so plainly and correct it. Don't quietly redo it.
- Don't pad with confidence or apology. Facts only.

## 7. Learn from the failure (Evolution)

After a real failure or a user correction, decide if it will recur:

- **Yes, and it is a rule** ("don't do X in this project, because…") → save it as a feedback memory (`references/memory.md`) with the **why** and **how to apply**.
- **Yes, and it is a check** → add it to the project's test suite or checklist.
- **No** → it needs no record.

A rule saved from one correction should state its evidence (what failed, what showed it).

## 8. What self-review cannot do

It cannot detect its own reasoning errors without an outside signal, judge its own output neutrally, prove a test adequate when it wrote both code and test, notice what it never considered, or confirm GUI, audio, timing or device behaviour from source reading. The outside signals that fix this: failing-before/passing-after tests, build/lint/type output, running the app, a diff against a fixed spec, a tool lookup for facts, a human, a reviewer with clean context.

## Sources

The gate, the revert check, the receiving-review rules and the reviewer's report format are adapted in our wording from obra/superpowers (MIT). The risk-ranking and claimed-bug sections are our own wording of ideas from trailofbits' differential-review and fp-check (CC-BY-SA-4.0). I read superpowers' text; I did not re-read the trailofbits files in full for this edit, only the inventory notes, so check those two sections against the source before relying on their wording.
