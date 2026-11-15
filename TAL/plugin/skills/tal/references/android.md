# Android: build, device, database, audio

For T.A.R.K.A.S. and T.A.C.T.S. (Kotlin, Compose, Gradle, Samsung S23). General code rules stay in `code.md`; UI in `ui.md`; several sessions in one checkout in `sessions.md`. Versions below were read from `C:\dev\tarkas\gradle\libs.versions.toml` on 2026-11-15; re-read it before relying on them.

| Piece | T.A.R.K.A.S. |
| --- | --- |
| Kotlin, Compose | Kotlin 2.2.10, Compose plugin |
| Player | Media3 1.4.1 (`exoplayer`, `session`) |
| Database | Room 2.8.4, KSP, `exportSchema = true`, schemas in `app/schemas` (`room.schemaLocation`) |
| Tests | JVM `test/` (with `room-testing`), instrumented `androidTest/` (AndroidJUnitRunner, Compose UI test, Espresso) |
| Build types | `debug`, `release`, `perf` (profileable from the shell, `perf-rules.pro`) |
| Gradle | 9.3.1, from the wrapper dists |

## Building

- In T.A.R.K.A.S. build only through the lock: `bash .claude/sessoes/gradle.sh <sessao> -q :app:installDebug :app:testDebugUnitTest`. Exit 75 means the lock wait ran out; another session is building. Wait and retry, don't remove the lock by hand unless it is older than 20 min.
- Read a failure from the first `e:` or `FAILURE:` line, not the last. Kotlin errors give `file:///path:line:col`; open that line. "What went wrong" names the task; the cause is usually above it.
- KSP or Room errors (`[ksp]`, "Cannot find getter", "There is a problem with the query") point to an entity or DAO, not to the file Gradle names.
- A failure in a file this session doesn't own is another session's: report it (`sessions.md`), don't edit it.
- Never delete `.gradle`, `build` or `.kotlin`, never `--stop` the daemon while another session may be building.

## Device (S23)

- `adb` is **not on PATH** on the owner's machine (checked 2026-11-15). Find it under the Android SDK `platform-tools` or ask the owner for the path; don't assume it.
- In T.A.R.K.A.S. write an `APARELHO` line on the board before installing or measuring.
- Logs: `adb logcat -v time --pid=$(adb shell pidof -s <package>)` keeps one process. Clear first with `adb logcat -c` so old lines don't mislead. Crashes: search `FATAL EXCEPTION` and `AndroidRuntime`; ANRs: `ANR in`; native crashes: `DEBUG` and `backtrace`.
- Hand long logs to the `tal-log-triager` agent; keep only its answer in context.

## Room migrations

- Every schema version change needs a `Migration` (or an `AutoMigration` with a spec) and the new exported JSON in `app/schemas`. Commit the JSON with the change; without it a migration test can't run.
- Test with `MigrationTestHelper` from `room-testing`: create the old version, run the migration, validate against the new schema, then read the data back and check values, not only that it opened.
- `fallbackToDestructiveMigration` deletes the user's library. Not allowed without the owner's decision.

## Audio path

T.A.R.K.A.S. runs its own processor chain inside Media3 (`data/audio/dsp/OwnAudioProcessorChain.kt`, `ParametricEqAudioProcessor`, `FloatPcmAudioProcessor`, loudness, spatial) plus `SessionEqualizer` for system audio.

- A DSP change is tested on the JVM with known input: a sine at a set frequency and level through the processor, then the output level and frequency response compared with the expected values within a stated tolerance. "Sounds right" is not a test.
- Check for clipping (samples beyond ±1.0 in float), NaN and denormals after each stage, and that the processor is bypass-exact when disabled (output equals input).
- `AudioProcessor` runs on the playback thread: no allocation, no locks, no logging per buffer.
- Latency and dropouts are measured on the S23, not on the emulator, with the `perf` build. Say how it was measured (tool, duration, count) next to the number.

## Pending (declared by the identity, not invented here)

Numeric targets for end-to-end latency, dropouts per hour and frequency-response deviation. Ask the owner; until then report the measured value without a pass/fail.
