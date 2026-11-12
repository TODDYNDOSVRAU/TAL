---
name: tarkas-session-routing
description: "Every T.A.R.K.A.S. request goes to the session of its topic: Player, Biblioteca, Equalizador, Assistente"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4864af05-272a-4e22-9009-b7eb5cbc826c
  modified: 2026-11-11T02:30:56.138Z
---

Any change requested for T.A.R.K.A.S. is done in the session that owns its topic, in any of the sessions:

- **Player** (`tarkas-player`): full player, mini player, open/close, cover carousel, track change, controls.
- **Biblioteca** (`tarkas-biblioteca`): library tab, MediaStore tracks, playlists, sorting, play order.
- **Equalizador** (`tarkas-equalizador`): Áudio tab, EQ console and graph, AutoEq, DSP chain, output routing.
- **Assistente** (`tarkas-assistente`): assistant tab, chat, narration and curiosities.

**Why:** the user wants organisation and efficiency: each topic keeps its own history and context, and sessions that share one checkout do not step on each other's files.

**How to apply:** when a request arrives in a session that does not own the topic, do not do it there. Forward it to the owning session with SendMessage (names above) and tell the user in one line. If it spans two topics, split it by topic. A request that fits no topic (build, release, shared files such as `TarkasViewModel.kt`) stays where it was asked. Sessions: [[tacts-session-routing]] is the same rule for T.A.C.T.S.
