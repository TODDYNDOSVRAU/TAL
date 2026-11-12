# Authoring: skills, plugins, agents, MCP servers, and how to test them

A skill that was never tested against a prompt is a guess. Write it, then measure it.

## Skill anatomy

- **`description` decides whether the skill loads.** It is the only text always in context, so it must say what the skill does and when to use it, in the words a user would type. Skills are consulted mainly for tasks the model cannot easily do alone (reported by Anthropic's skill-creator): a one-step request may not trigger even a perfect description.
- **`SKILL.md` is the core**: the rules that apply to every task. Keep it small (T.A.L.'s is about 3 KB).
- **Detail goes in `references/*.md`**, read only when the task needs it, with a table in the core saying which. T.A.L. budget: at most 16 KB per reference; split before that.
- **Repeated work goes in `scripts/`.** If every test run makes the agent write the same helper, ship it once and say how to call it. Scripts are called as black boxes: document `--help` and the exit codes.
- **Explain the why.** A rule with its reason generalises; a rule in capitals does not. Reported by skill-creator: all-caps ALWAYS/NEVER is a yellow flag, and a rule that fits only your examples is overfitted.
- **Keep it lean.** Read the transcripts of test runs, not just the outputs. Anything that makes the agent waste turns is a candidate to delete.
- **One skill, not many.** Each installed skill adds its description to every session. Several topics belong in one skill with references.
- **Name the pending.** Mark numbers, versions and behaviours you did not verify, as the other references do.

## Validate the files

```
py scripts/vendor/skill-eval/quick_validate.py <skill-folder>
```

(`python3` outside Windows. It needs PyYAML.) It checks the frontmatter and that `SKILL.md` exists. I ran it on `skills/tal` and it printed `Skill is valid!`. Then run `claude plugin validate <plugin-folder>` for the plugin manifest.

## Test that it improves the work (A/B)

1. Write 3 to 5 realistic prompts, each with a checkable expected result (a number, a file, a command that must pass).
2. **For each prompt, launch the with-skill run and the baseline (no skill) run in the same turn**, so both finish together and neither is tuned after seeing the other.
3. Grade each output against the expectations with evidence: quote the line or file that proves it. Grade the outcome, not the filename.
4. **Grade the assertions too.** An assertion any wrong output would also satisfy (a file exists, the word appears) is worse than none, because it gives false confidence. Add the check that was missing. Check the claims the output makes beyond the assertions (counts, "used tool X"), and flag the ones you cannot verify.
5. Repeat each run a few times if the result is close; one run per case proves little (T.A.L.'s own first A/B was n=3, one run each, with a rubric we wrote, so it is weak evidence).
6. Summarise with `scripts/vendor/skill-eval/aggregate_benchmark.py <benchmark_dir>`. It reads `eval-N/with_skill/run-K/grading.json` and `eval-N/without_skill/run-K/grading.json` and prints mean, standard deviation, min, max and the with/without difference.
7. Change one thing, rerun. Stop when a change no longer moves the score.

## Test that it loads at the right time (trigger evals)

- Write about **20 queries**, half that should trigger the skill and half that should not. Realistic: file names, backstory, casual spelling, abbreviations.
- **The negatives that count are near misses**: they share words with the skill but need something else. "Write a fibonacci function" is too easy a negative for a video skill.
- Run: `py scripts/vendor/skill-eval/run_eval.py --eval-set <queries.json> --skill-path <skill-folder> --runs-per-query 3 --verbose`, from a folder inside a project that has `.claude/`. The file format is a JSON list of `{"query": "...", "should_trigger": true}`. It calls the `claude` CLI for each query, so it costs tokens and needs a logged-in CLI; **I ran only `--help`, not a real evaluation**.
- When tuning the description, split the set about **60% train, 40% held out** and choose by the held-out score, so you do not fit the description to the queries you looked at (the method skill-creator describes; its automatic loop `run_loop.py` is not vendored here).
- **T.A.L.'s router has its own corpus test**: `skills/tal/scripts/tal.test.js` holds prompts with the domains that must and must not fire, including near misses and real prompts that once misfired. Add a case for every misfire you see, and check the test can fail: weaken the rule and confirm a test turns red.

## Writing an agent file (`.claude/agents/<name>.md`)

The template and the model choice are in `references/agents.md`. Test an agent like a skill: a real input with a known answer, kept as the regression case.

## Building an MCP server

- Tool design rules (description, annotations, pagination): `references/code.md`, "Designing an MCP tool".
- **Evaluate the server with questions, not with a feeling.** Write **10** questions that need several tool calls each, are read-only and independent, are stable over time, and have **one verifiable answer** (a number, a name, an id). Run an agent against the server and compare. Failures show which tool descriptions are unclear.
- The harness in Anthropic's mcp-builder (`evaluation.py`) needs the `anthropic` and `mcp` Python packages and is **not vendored**: check they are installed before relying on it.

## Plugin checklist

1. `claude plugin validate <folder>` passes (warnings noted).
2. Tests run from a clean checkout with each test file named explicitly (`node --test a.test.js b.test.js`; on Node 24 a folder argument fails).
3. Hooks: say what each one does, and make the common path silent and fast (the router prints nothing when no domain fires). A hook that runs on every stop or every tool call is a permanent cost: see `references/tokens.md`.
4. Licences: every copied file keeps its licence and is listed in `NOTICE.md`. Text under a copyleft licence (CC-BY-SA) is rewritten, not pasted.
5. Bump the version, then `claude plugin update <name>@<marketplace>`. Changes apply after a restart.
6. Say what you did not verify: a fresh session, other platforms, long runs.

## Sources

Method adapted in our wording from Anthropic's skill-creator, mcp-builder and webapp-testing skills (Apache-2.0); the vendored scripts are under `scripts/vendor/` with their licences. See `NOTICE.md`.
