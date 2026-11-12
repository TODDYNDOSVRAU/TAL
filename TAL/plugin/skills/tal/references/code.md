# Code

## Workflow

1. **Read before writing.** Open the file and its callers. Search for an existing function that already does it. Reuse before adding.
2. **State the contract** in one line: input, output, what happens on failure.
3. **Bug: reproduce first.** Write the failing test, watch it fail for the right reason, then fix. A fix without a test that failed before is a guess. Investigate with the procedure below, not by guessing.
4. **Smallest complete change.** Touch only what the task needs. Don't reformat, rename or "tidy" unrelated code in the same change.
5. **Make it work first, then polish.** Get the behaviour right and verified before renaming, restructuring or tidying what you just wrote. Polish in a separate step, then re-run the same checks: polish must not change behaviour.
6. **Run it.** The whole test suite, the build, and the real behaviour (device, emulator, CLI, browser). Paste the result, not an assumption. A green run of the test you wrote is not a green suite: name every red test.
7. **Review the diff** with `references/review.md` before reporting.

## The smallest complete change

Smallest in new code, never in coverage. First list everything the change must reach: callers, tests, fixtures, config, exports, and what it could break for users (data destroyed or exposed, callers that stop working). That list is the scope; extra features are not. Then take the first option that fully works:

1. **Does it need to exist?** Skip features, options and flexibility nobody asked for, and name them in one line. A vague request gets the smallest version that does the core job.
2. **Already in this codebase?** Use the helper, component or pattern the surrounding code uses.
3. **Standard library or platform feature?** Use it, unless the project has its own; a house component beats a native widget.
4. **Installed dependency?** Use it. A new dependency never pays for a few lines.
5. **One line a reader gets at a glance?** Write it. A one-liner that needs decoding is not short.
6. **Otherwise** the minimum code that works.

- No abstraction, wrapper, conversion, option, config or "for later" code nobody asked for. Deletion beats addition. Keep the layers and conventions that exist.
- Code you move or merge keeps its error handling and validation.
- Bug fix: grep every caller of what you touch, then fix the root cause once, in the shared code.
- Between options of equal size, take the one correct on edge cases.
- New non-trivial logic (a branch, loop, parser, money, security, a new script) ships with one small test or assert. Trivial changes need none.
- A shortcut with a known limit gets one comment: `shortcut: <the limit>, <when to upgrade>`.
- Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, hardware calibration, anything the user asked for.
- End the report with one or two lines: what you skipped or did not check, and any risk the user must know.

## Debugging procedure

Before any fix, gather evidence; a fix proposed from the first plausible theory is a guess.

1. **Read the error whole**, then reproduce it with the shortest steps that always fail.
2. **Check what changed**: recent commits, dependency versions, config, environment. List every difference between a working case and the broken one.
3. **Trace backward.** Find where the bad value came from, then where that came from, until the origin. Fix there, not where it surfaced.
4. **Multi-component systems** (build, then signing; API, then service, then database): at each boundary log what enters, what leaves, and whether config reached it. Run once, read where the data first goes wrong, then investigate only that component.
5. **Log before the dangerous operation**, not after it fails: the arguments, the working directory, the environment and `new Error().stack` (or the language's equivalent). In tests write to stderr, because a logger may be silenced.
6. **One hypothesis at a time**, with the observation that would disprove it (see `references/review.md`, section 4).

Reported by superpowers' debugging skill (not measured by us): this order finds causes faster than trying fixes.

### Flaky or timing-dependent tests

Replace a sleep with a wait on the condition you actually need. A sleep is a guess about speed.

```
waitFor(condition, description, timeoutMs = 5000)
  loop: result = condition()   // read fresh state inside the loop, never cached before it
        if result: return result
        if elapsed > timeoutMs: throw "Timeout waiting for <description> after <timeoutMs>ms"
        pause ~10 ms           // 1 ms wastes CPU
```

Always time out with a message that names what was awaited. A fixed delay is right only when you are testing the timing itself; say why in a comment.

### A test leaves files or state behind

`scripts/vendor/debug/find-polluter.sh <path-that-appears> '<test glob>'` runs the matching test files one at a time with `npm test` and stops at the first one after which the path exists. It is a linear scan in file order, not a bisection (I read the script to confirm), and it is for Node projects only. A path that already exists at the start makes it skip every file.

## Writing good tests

- **Name the break first.** Before the test body, write the production change that should make it fail (wrong constant, wrong branch, missing side effect). If you cannot name one, the test checks nothing; test the observable behaviour instead.
- **Derive expected values without the code under test.** Use literals and hand-checked fixtures. An expectation computed by the code or its helpers passes whatever that code does.
- **Exercise the real thing.** An assertion that a mock exists passes when the mock is there and says nothing about the component. Assert real behaviour, or delete the assertion. When you must mock, mock the complete shape of the real thing, not the fields you happen to read.
- **The red run must fail correctly.** It fails (not errors) because the feature is missing, not because of a typo.
- **One behaviour per test.** If the name needs "and", split it.
- **Mutation check before finishing.** Mentally apply each: wrong constant or argument, wrong branch, missing state change or side effect, empty or default return, missing validation for zero, empty, null, unauthorised, malformed input. At least one test should fail for each realistic mutation; if none does, the behaviour is unprotected or the test is circular.
- **Trivial code earns no test** (plain getters, constants, forwarding) unless it validates, defaults, derives or has a side effect.

## The ten areas (T.A.L. Engineering Standards)

| Area | Requirement | Check |
| --- | --- | --- |
| Architecture | Modular, documented, expandable | One purpose per module; boundary written down |
| Code | Readable, consistent, reviewed | Follows the surrounding style; diff reviewed |
| Tests | Unit, integration, end to end | A test covers the behaviour and failed before the fix |
| Security | Data protection from the architecture | No secret in code; input validated at the boundary; least privilege; permission asked at the moment of use |
| Performance | Monitored, measured, optimised | A number before and after. Never "feels faster" |
| Compatibility | Real devices and environments | Ran on the target; if not, mark **pending** |
| Interface | WCAG AA minimum, consistent, clear | Contrast, touch target, text scaling, reduced motion |
| Documentation | Complete, useful, current | Changed behaviour means changed docs in the same commit |
| Errors | Handled, logged, diagnosable, recoverable | Failure is caught, said in plain words, logged in the ENGINEERING layer |
| Updates | Compatible, safe migrations | Old data opens in the new version; migration tested |

## Done means

Tested, predictable, handles the unexpected, reports its failures, harms nothing else. Working once is not done.

## Rules that prevent the common failures

- **Errors are values the user can act on.** Never swallow an exception. Never show a stack trace as the message.
- **No silent fallbacks.** If the code falls back, it logs why.
- **Validate at boundaries** (user input, files, network, IPC), at the point where the bad value enters. Trust internal code. Superpowers' debugging skill adds a check at every layer a value crosses; we do that only where the value crosses a trust boundary.
- **No new dependency without a reason** and a licence check. Prefer the standard library.
- **No secrets in code, logs or commits.** Config comes from the environment.
- **Ask for a permission when the feature needs it**, not at launch, and say why.
- **Concurrency:** name the thread that owns each piece of state. Cancel work you start.
- **Real-time paths** (audio callback, render loop, frame deadline): no allocation, no locks, no I/O, no logging. Pre-allocate, hand work to another thread through a lock-free queue, and count the misses.
- **Migrations:** write forward and back, test on a copy of real data, never destructive in place.
- **Git:** one logical change per commit, message says why. Don't commit or push unless asked.
- **Bundled scripts are black boxes.** Run `<script> --help` first; read the source only if the help is not enough. This keeps the context small.

## Testing a running web app

For a local web app, start the server and run the checks in one command with `scripts/vendor/webapp/with_server.py`:

```
py scripts/vendor/webapp/with_server.py --server "npm run dev" --port 5173 -- <your command>
```

(`--server` and `--port` repeat for several servers; use `python3` instead of `py` outside Windows.) **Windows caveat, found by running it:** on cleanup the script ends only the process it started. If that is a launcher or shell (`py`, `cmd`, probably an `npm` shim; the `npm` case is not tested), the real server survives and keeps the port. Start the real executable directly (for example the full path to `python.exe`) and check afterwards with `netstat -ano | findstr :<port>`. With the full path, a test server answered 200 and left nothing listening. Playwright is needed for the browser part and is not bundled; check `py -c "import playwright"` first, and mark browser checks **pending** if it is absent. Wait for the page to reach `networkidle` before reading the DOM of a dynamic app, then choose selectors from what was rendered.

## Designing an MCP tool

- The description says exactly what the tool does, no more. It matches the behaviour.
- Annotate it: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`.
- One focused operation per tool.
- A list tool honours a `limit` (20 to 50 is typical), paginates, and returns `has_more`, `next_offset` or `next_cursor`, and `total_count`. Never load everything into memory.
- Evaluate it: `references/authoring.md`, section on MCP evals.

## Measuring performance

Pick the metric that the user feels (latency, frame time, startup, memory, battery), measure it before, change one thing, measure after, keep the numbers. If the change doesn't move the metric, revert it.

## Reporting

State: what changed (files), what was run and its result, what is pending, any limit. If a test was skipped or a device wasn't available, say it.

## Sources

Adapted, in our own wording, from obra/superpowers (MIT): systematic-debugging, test-driven-development, and Anthropic's webapp-testing and mcp-builder skills (Apache-2.0). Attribution is in `NOTICE.md`.
