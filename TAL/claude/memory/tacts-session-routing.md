---
name: tacts-session-routing
description: T.A.C.T.S. work is split into four Claude sessions (UI, REC, ENCODE, GERAL); every request goes to the session of its topic
metadata:
  type: feedback
---

Standing rule set by the user (2026-11-10) for every T.A.C.T.S. session: each change request is handled and recorded in the session of its topic.

- **UI**: interface, layout, motion, gestures, glass, typography, colour (`ui/`, `MainActivity.kt`)
- **REC**: recording: video capture, RAW video, audio, timecode, clip naming, photo capture flows
- **ENCODE**: codecs, bitrate, 10-bit HDR, LUTs and looks, tonemap curves, JPEG/DNG/EXIF output, the multi-frame engine
- **GERAL**: camera engine lifecycle, settings storage, capabilities, crashes and logs, versioning, README, releases, repository

**Why:** organisation and efficiency; each topic keeps its history and context in one place.

**How to apply:** when a request reaches a session but belongs to another topic, don't do it there: send it to the right session with SendMessage (the request in the user's words plus any context found), tell the user in one line where it went, and link that session. A request that spans topics: each session does its own part. Session ids at creation: UI local_5316bda6-6a92-4613-aae9-0244ca470db9, REC local_84a647ab-17a5-4646-8286-4425cf796860, ENCODE local_7f79d41a-204b-4a33-83a5-f090d026fe01, GERAL local_a3df6493-26c3-43da-887a-721dade7220c (use ListAgents if they change).
