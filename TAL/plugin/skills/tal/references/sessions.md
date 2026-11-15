# Several sessions in one checkout

T.A.R.K.A.S. and T.A.C.T.S. split work into topic sessions that edit the same checkout. Each project's own file is the authority; this page only says what they share and where they differ. Read the project's file before the first edit or build, every session.

| Project | Authority | Sessions |
| --- | --- | --- |
| T.A.R.K.A.S. | `C:\dev\tarkas\.claude\sessoes\QUADRO.md` | player, biblioteca, equalizador, assistente, plus geral |
| T.A.C.T.S. | `C:\dev\tacts\CLAUDE.md` (board in `docs/QUADRO.md`) | UI, REC, ENCODE, GERAL |

## Common to both

1. **Ownership by path.** Each session owns a list of files. Never edit another session's file; ask that session instead. A request that belongs to another topic is forwarded to it, not done here.
2. **No history-rewriting git.** Never `checkout`, `restore`, `stash`, `reset` or `clean`, never switch branch, never `git add -A`, `git add .` or `commit -a`. Those commands discard other sessions' work in the same folder.
3. **One Gradle at a time.** Builds share `build/` and the daemon. Never delete `.gradle`, `build` or `.kotlin` to "fix" a build: another session may be compiling.
4. **Edit, not overwrite.** Re-read a shared file from disk right before changing it and use Edit, never Write: the copy in context may be stale.
5. **A build broken by another area** is reported to that area's session; don't fix their file.
6. **"Done" names what ran:** compiled, which tests, installed on the S23, measured on the S23, and what was not verified.

## Where they differ

| Topic | T.A.R.K.A.S. | T.A.C.T.S. |
| --- | --- | --- |
| Commits | No session commits. Only the user commits, when asked | Each session commits only its own paths (`git add <files>`, `git commit <files>`) as soon as a piece compiles and its tests pass. Only GERAL pushes, and only when the user says so |
| Shared files | `CLAIM` line on the board, edit, then `DONE`. A CLAIM older than 30 min with no DONE is stale | Small change in its own commit. Don't build on a promise: wait for the commit |
| Asking another session | `PEDIDO` line on the board plus `SendMessage` to that session | Message the session; the exact form is in `C:\dev\tacts\CLAUDE.md` |
| Board | One line per event: `AAAA-MM-DD HH:MM \| sessão \| CLAIM\|DONE\|PEDIDO\|RESP\|APARELHO \| arquivo ou tema \| nota` | One row per session, updated in the same commit as the work |
| Build | Only `bash .claude/sessoes/gradle.sh <sessao> <tasks>`: it takes `build.lock`, waits up to 10 min (exit 75), and clears a lock older than 20 min | One Gradle at a time, by agreement |
| Device | Announce with an `APARELHO` line before using the S23 | Name it in "done" |

## Before ending a turn

- The board says what this session changed and what is left.
- No CLAIM of this session is left open.
- Nothing outside this session's paths was touched; if something was, say so and why.

## Why rule 2 has no exception

A session that runs `git restore` or `stash` to clean its own diff erases the other sessions' uncommitted work. That is why rule 2 has no exception, even for "only my file". To undo your own change, edit it back.
