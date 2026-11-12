# Architecture: Apple Music clone (Android, working name `replica-music`)

Reads: `replica/recon.md`, `replica/features.csv`. Date: 2026-11-04.
Rebrand: name, logo and palette come from replica-brand and the T.A.L. identity (`C:\dev\CLAUDE.md`). Nothing from the original ships.

## 1. Stack

No backend. Everything runs on the device. The pack's web defaults do not apply, so each layer below is swapped for the Android one.

| layer | choice | why |
| --- | --- | --- |
| language, UI | Kotlin, Jetpack Compose, Material3 | the user already builds T.A.R.K.A.S. this way, same tooling and tests |
| playback | Media3 ExoPlayer inside a `MediaLibraryService` | background play, media notification, Bluetooth and car controls for free |
| audio chain | Media3 `AudioProcessor` for gain and fades | per-sample fades and normalisation, no `setVolume` stepping |
| local library | `MediaStore` scan into Room | MediaStore for discovery, Room for what MediaStore cannot hold (counters, playlists, lyrics) |
| database | Room (SQLite) | one database, migrations in code, testable with Robolectric |
| images | Coil | covers, size rounded to multiples of 50 px so nearby sizes share a cache entry |
| network | OkHttp plus kotlinx.serialization | Audius, Jamendo, LRCLIB over HTTPS |
| settings | DataStore (Preferences) | engine settings and UI settings in two separate stores |
| DI | manual constructor injection | small app, fewer moving parts than Hilt |
| tests | JUnit, Robolectric, Room in-memory, Compose UI tests | same as T.A.R.K.A.S. |
| auth, payments, email, jobs, hosting | none | no accounts, no money, no server. Background work uses WorkManager only for the periodic MediaStore rescan and download queue |

One module `:app` to start. Split into `:core:playback`, `:core:data`, `:core:ui` only when build time or testing asks for it.

## 2. Package layout

```
com.tal.replica
  app/            Application, navigation host, DI wiring
  playback/       PlaybackService, QueueManager, TransitionPlanner, GainProcessor, SleepTimer
  data/library/   MediaStoreScanner, LibraryDao, LibraryRepository
  data/catalog/   AudiusClient, JamendoClient, CatalogRepository (one response type, merge by id)
  data/lyrics/    LrclibClient, LrcParser, LyricsRepository
  data/stats/     PlayEventRecorder (5 s rule)
  data/settings/  EngineSettings, UiSettings
  ui/theme/       tokens from the T.A.L. identity, Motion (springs)
  ui/home/ ui/browse/ ui/library/ ui/search/ ui/detail/ ui/player/ ui/queue/ ui/lyrics/ ui/settings/
```

## 3. Local schema

The SQL is in `replica/schema.sql`. Summary: `artist`, `album`, `track`, `playlist`, `playlist_item`, `queue_item`, `play_event`, `lyric_line`, `download`, `setting_override`. SQLite, so `id integer primary key`, times as epoch milliseconds in UTC, no row level security: the app has one user and the database is private to it. Access rule: only the app process reads the file. No export without an explicit user action.

Constraints that matter:
- `track.source_key` unique per source, so a rescan updates instead of duplicating.
- `playlist_item (playlist_id, position)` unique, reordered inside one transaction.
- `queue_item (position)` unique, with `original_position` kept so turning shuffle off restores the order.
- `play_event` is written only after 5 s of real playback; skips are a separate column.
- Deleting an album deletes its tracks (`cascade`). Deleting a playlist deletes its items. Deleting a track removes it from playlists and the queue; `play_event` rows stay for history.

## 4. Interfaces (no routes)

There is no server API. The boundaries are repository interfaces and three public HTTP APIs used with the user's own keys.

| boundary | what it does | input | output | flow |
| --- | --- | --- | --- | --- |
| `LibraryRepository.songs(sort)` | ids plus section headers for the A-Z strip; track objects built when the row appears | sort order | `Flow<SongList>` | F01 |
| `LibraryRepository.search(q)` | accent- and case-insensitive match on title, then artist | query | ranked list | F02 |
| `CatalogRepository.search(q)` | Audius and Jamendo merged by id | query | results by type | F02 |
| `PlaybackController` | play, pause, seek, next, previous, set queue, move item, remove with undo | commands | `StateFlow<PlayerState>` | F01, F03, F04 |
| `LyricsRepository.get(track)` | local cache, then LRCLIB | track | lines with optional word times | F05 |
| `SettingsRepository` | crossfade mode and seconds, normalisation, cache size | keys | flows | F06 |
| MediaStore | scan audio, observe changes | permission | rows | F01 |
| Audius, Jamendo, LRCLIB | public APIs | HTTP | JSON | F02, F05 |

Background jobs: `RescanWorker` (daily and on MediaStore change), `DownloadWorker` (state machine idle, prepared, downloading, downloaded, paused; removed after 3 failures).

## 5. The parts that bite

- **Gapless and crossfade at once.** Consecutive tracks of one album and disc (number + 1) are always gapless with encoder delay and padding trimmed; everything else may crossfade. Repeat-one and non-music never crossfade. A track qualifies only if it lasts at least twice the fade. T.A.R.K.A.S. already has a working crossfade with a second player and a shared DSP copy, which is the reference for the first version.
- **DSP on both players.** Any equalizer or gain must be in both players' paths or after the mix, otherwise the overlap sounds different.
- **Normalisation.** Read ReplayGain tags; otherwise compute integrated loudness once and cache it. Only attenuate, target -14 LUFS.
- **Lyrics timing.** Word-level LRC is rare. Fall back to line timing, then plain text. Schedule the next tick from the next event, not every frame. Bluetooth output adds 100-300 ms; measure with `AudioTrack.getTimestamp` and offer a manual offset.
- **Mini player to full player.** Every property derives from the drag fraction, so the gesture is interruptible. Ignore small downward moves when an inner list is at its top.
- **Queue.** Shuffle is a permutation starting at the chosen track and keeps the original order; the saved position is dropped after 12 h; a network error never skips, a file error skips (at most 2 retries, 500 ms debounce).
- **Permissions and storage.** `READ_MEDIA_AUDIO` on Android 13+, `READ_EXTERNAL_STORAGE` below. Ask when needed. A denied permission is a screen with one action, not a crash.
- **Performance.** Animated cover background: after 3 consecutive frames over 15 ms, switch to a static fallback. Respect reduced motion and reduced transparency.
- **Search.** Normalise accents and case with `Normalizer`/`Collator`; the spinner appears only after a short delay so quick results do not flash.
- **No server means no AutoMix data.** Manual crossfade first; local silence and fade detection later; beat matching only if measured to help.
- **Licensing.** Open catalogue tracks play only through the services' own streaming URLs and terms; the clone does not cache or redistribute them beyond what those terms allow.

## 6. Build order

Each milestone lists screens, tables and boundaries. A milestone ends only with its tests passing and the result seen on the emulator; otherwise it is marked pending.

**M0. Vertical slice (ugly).** Local songs play.
- Screens: S06, S14, S15 (basic).
- Tables: `artist`, `album`, `track`.
- Boundaries: MediaStore scan, `LibraryRepository.songs`, `PlaybackController` play/pause/next.
- Done when: grant permission, see songs, tap one, hear it with the mini player and notification controls, and the process survives the app being closed. Clicks to play: 3.

**M1. Must-haves.**
- Navigation shell with five tabs and the floating tab bar (S02-S05 stubs where content is licensed).
- Library: S07, S08, S09, S11, S12, S13, A-Z strip, sort, accent-free search (S10 local).
- Playlists: create, edit, reorder, add from context menu (S20).
- Player: sheet driven by drag fraction, cover scale by state, scrubber, shuffle, repeat.
- Queue: S17 with drag, swipe-remove with undo.
- Playback: gapless rule, audio focus, network-vs-file errors.
- Settings S18 basics, reduced motion and transparency.
- Tables: `playlist`, `playlist_item`, `queue_item`.

**M2. Should-haves.**
- Crossfade manual 1-12 s, volume normalisation, sleep timer S19 with a short fade-out, play history and skip counter, synced lyrics S16 with line timing, diagnostics export S22, reversible shuffle.
- Tables: `play_event`, `lyric_line`.

**M3. Could-haves.**
- Open catalogue search and browse (Audius, Jamendo) in S02/S03/S10, downloads S21, stream cache, animated cover background, word-timed lyrics, autoplay refill.
- Tables: `download`.

**M4. Fixes from replica-entrepreneur.** Once it has run.

## 7. Risks

1. Crossfade plus gapless plus shared DSP: easy to break the seam; needs an audio-level test of the output, not only a unit test.
2. Time-synced lyrics from open sources: coverage is partial; the UI must handle missing lyrics as a normal state.
3. Screens marked [P] in the recon map are unconfirmed; building them before checking is the main product risk.
