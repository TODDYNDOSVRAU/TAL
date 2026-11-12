# Recon map: Apple Music (Android 7.0)

Scope: the listening UI. Tabs, library, search, album/artist/playlist detail, mini player, Now Playing, queue, time-synced lyrics, audio settings. Local files plus open catalogues (Audius, Jamendo) stand in for the Apple catalogue.
For: the user's own T.A.L. product. Rebranded, own identity, no Apple assets or copy.
Date: 2026-11-04

## Method and limits

Clean-room. Every row says where it came from. Three kinds of evidence:

- **[N]** the user's earlier study of the 7.0 package, `C:\dev\tarkas\docs\research\apple-music-7.0.md` (engine, queue, library, player and lyrics behaviour). Nothing is re-read from the binary for this map.
- **[P]** general public knowledge of the product's navigation. Not re-fetched this session, so treat as medium confidence until checked against the help center.
- **[G]** a guess, listed as such.

No screenshots of the original are stored: none were taken. `screens/` stays empty until the user adds some from their own device.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | earlier study, own notes | C:\dev\tarkas\docs\research\apple-music-7.0.md | engine, queue, library, player, lyrics. Best source here. |
| 2 | help center | https://support.apple.com/apple-music | not fetched this session; needed to confirm screens marked [P] |
| 3 | app store listing | Google Play, package com.apple.android.music | not fetched; screenshots of every tab to be added by the user |
| 4 | the user's own device | n/a | the user can capture the screens in S01-S22 and drop them in `screens/` |
| 5 | LRCLIB public API docs | https://lrclib.net/docs | open lyrics source for the clone |

## Core loop

Open the app, pick something from the library or search, hear it with gapless or crossfaded transitions at a normalised volume, and follow along in the Now Playing view with synced lyrics and an Up Next queue.

## Screens

| ID | screen | how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Onboarding and sign-in | first launch | account and subscription | sign-in, plan picker | skip in clone [P] |
| S02 | Listen Now (home) | tab 1 | recommendations, recently played | large cards, horizontal rows, section headers | empty, loading, filled [P] |
| S03 | Browse | tab 2 | new music, genres, charts | category tiles, card rows | loading, filled [P] |
| S04 | Radio | tab 3 | live and curated stations | station cards | skip in clone (licensed) [P] |
| S05 | Library | tab 4 | entry to the user's collection | category list, recently added grid | empty, filled [P] |
| S06 | Library: Songs | S05 > Songs | all songs, sorted | song row, sort menu, A-Z section index | empty, loading, filled [N: sections come with the list] |
| S07 | Library: Albums | S05 > Albums | album grid | cover tile, title, artist | empty, filled [P] |
| S08 | Library: Artists | S05 > Artists | artist list | round avatar row | empty, filled [P] |
| S09 | Library: Playlists | S05 > Playlists | user playlists | playlist row, create button | empty, filled [P] |
| S10 | Search | tab 5 | find music | search field, suggestions, results by type, library/catalogue toggle | idle, typing, results, no results, offline [P] |
| S11 | Album detail | tap an album | track list and actions | cover, play, shuffle, track rows, disc headers | loading, filled [P] |
| S12 | Artist detail | tap an artist | top songs, albums | header image, play, rows | loading, filled [P] |
| S13 | Playlist detail | tap a playlist | tracks, edit | header, play, shuffle, rows, drag handles | empty, filled, editing [P] |
| S14 | Mini player | bottom of every screen | quick control | cover, title, play/pause, next, progress | hidden, paused, playing [N: sheet with drag fraction] |
| S15 | Now Playing | drag up or tap mini player | main player | cover that scales (paused 0.85, playing 1.0, scrubbing 0.95), scrubber, transport, shuffle, repeat, lyrics and queue buttons, animated background from the cover | paused, playing, scrubbing, buffering, error [N] |
| S16 | Lyrics | button on S15 | follow the lyrics | active line, words timed, instrumental dots, duet alignment | no lyrics, plain, line-synced, word-synced [N] |
| S17 | Queue (Up Next) | button on S15 | see and edit what plays next | rows, drag handle, remove, shuffle, repeat, autoplay | empty, filled, editing [N] |
| S18 | Settings: audio | settings | sound options | crossfade (off, auto, manual 1-12 s), volume normalisation, quality per network, cache size | defaults, changed [N] |
| S19 | Sleep timer | sheet from S15 | stop later | countdown picker, end of track or album | off, running [N] |
| S20 | Context menu | long press on any item | actions | play next, add to queue, add to playlist, go to album or artist, share | per item type [P] |
| S21 | Downloads | library or settings | offline items | state per item (idle, downloading, done, paused), storage | empty, filled, no space [N] |
| S22 | Diagnostics | settings > debug | support | log export, queue dump, engine state | [N] |

## Flows

```
F01 Play a song from the library
    S05 -> S06 -> S14 (playing)
    happy path clicks: 3 (tab, Songs, row). Beat: 2, by putting Songs one tap from the tab.
    edge: empty library, permission denied, file unreadable, track skipped on file error

F02 Search and play
    S10 -> (type) -> result row -> S14
    happy path clicks: 2 plus typing
    edge: accents ("acao" finds "ação"), no results, offline, slow network (spinner only after a delay)

F03 Open and close the player
    S14 -> drag up -> S15 -> drag down -> S14
    happy path: 1 gesture each way, follows the finger
    edge: list at top inside S15 must not close the player on a small downward move [N]

F04 Edit the queue
    S15 -> S17 -> drag a row / swipe to remove -> undo
    edge: shuffle on, then off restores the original order [N]; saved position older than 12 h is dropped [N]

F05 Read lyrics
    S15 -> S16
    edge: no lyrics, plain only, instrumental gap of 7 s or more shows dots [N]

F06 Set crossfade
    S18 -> choose mode and seconds
    edge: same album, next track number: always gapless [N]; repeat one: off [N]

F07 Create a playlist and add songs
    S09 -> create -> S20 on a song -> add to playlist -> S13
    edge: duplicate name, empty playlist

F08 Sleep timer
    S15 -> S19 -> pick
    edge: end of track with repeat on [N]
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Tab bar | 5 tabs, floating over content | selected, pressed | S02-S10 |
| Mini player | with progress line | hidden, paused, playing | all but S15 |
| Cover tile | square, round (artist), 3 sizes | loading, loaded, missing | S02, S05-S13 |
| Song row | with cover, with number, with handle | default, playing, disabled | S06, S11, S13, S17 |
| Section header | text, text with action | default | S02, S03, S06 |
| A-Z index | vertical strip | idle, scrubbing | S06 |
| Search field | idle, active | empty, typing, error | S10 |
| Scrubber | with time labels | idle, dragging, buffering | S15 |
| Transport buttons | play/pause morph, next, previous | pressed, disabled | S14, S15 |
| Bottom sheet | mini to full | collapsed, dragging, expanded | S14-S15 |
| Lyric line | line, word-timed, background voice | past, active, upcoming | S16 |
| Context menu | per item type | open | S20 |
| Toast with undo | | shown, dismissed | S17 |
| Toggle, slider, picker | | default, focus, disabled | S18, S19 |

## Inferred data model

```
Track        id, title, artist_id, album_id, track_no, disc_no, duration_ms, uri,
             encoder_delay, encoder_padding, loudness, eq_preset, start_ms, end_ms
             evidence: S06, S15, notes section 2. confidence: high
Album        id, title, artist_id, year, cover_uri, disc_count
             evidence: S07, S11. confidence: medium
Artist       id, name, image_uri. evidence: S08, S12. confidence: medium
Playlist     id, name, created_at. evidence: S09, S13. confidence: medium
PlaylistItem playlist_id, track_id, position. evidence: S13. confidence: medium
QueueItem    position, track_id, source (library | catalogue | autoplay), original_position
             evidence: S17, notes section 1. confidence: high
PlayEvent    track_id, played_at, played_ms, skipped (counted only after 5 s)
             evidence: notes section 2. confidence: high
LyricLine    track_id, start_ms, end_ms, text, speaker, background, words[]
             evidence: S16, notes section 3. confidence: high
Download     track_id, state (idle | prepared | downloading | downloaded | paused), failures
             evidence: S21, notes section 2. confidence: high
Setting      key, value (crossfade_mode, crossfade_s, normalise, cache_mb, quality_wifi, quality_cell)
             evidence: S18. confidence: high
```

Relationships: Artist 1-n Album, Album 1-n Track, Playlist n-n Track through PlaylistItem, Track 1-n PlayEvent, Track 1-n LyricLine, Track 1-1 Download.

## Feature matrix

See `features.csv`. Must: 16, should: 8, could: 6, skip: 6.

## Out of scope (cannot or should not be cloned)

- The Apple Music catalogue, radio, editorial content and recommendations: licensed, owned by Apple.
- Subscription, account system, FairPlay DRM, Dolby Atmos licensed decoders.
- Lossless catalogue streaming from Apple servers and the server-side AutoMix analysis data.
- Group listening, social features, the network of users.
- Apple's artwork, icons, typefaces, strings and animations as files. The clone redraws and rewrites everything.
- Screens and behaviour marked [P] and not yet confirmed: build them only after a check against the help center or the user's own captures.

## Size

Screens 22 (17 in scope), flows 8, entities 10. Hard parts: gapless plus crossfade with a shared DSP path, synced lyrics with word timing, queue with reversible shuffle, local library scan with A-Z sections and accent-free search. Size: M for the UI plus local playback; XL if the catalogue were included, so it is not.
