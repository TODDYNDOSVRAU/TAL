---
name: tal-core
description: Base of every T.A.L. (Totally Accurate Labs) project in C:\dev. Use before any decision to add, remove, publish, approve, design, name, write copy for, or architect anything in C:\dev, and before declaring work done. Holds the decision criterion, the five principles, the THINK LIKE T.A.L. behaviours, the definition of done and the router that says which T.A.L. skill handles which task.
---

# T.A.L. core

Source of truth: `C:\dev\TAL\identidade\Identidade_TAL.html` (v1.2, October 2026). `C:\dev\CLAUDE.md` is the always-loaded summary. If a project's own `CLAUDE.md` contradicts it, follow the project and point out the conflict.

## 1. Decision criterion

Before adding, removing, publishing or approving anything, answer:

1. What is the reason?
2. What problem does it solve?
3. How do we know it was done correctly?

If an answer is missing, don't do it yet. If something can't be verified, mark it **pending**. Never call it done.

## 2. Five principles

| Principle | In practice |
| --- | --- |
| Precision | Behaviour is consistent, verifiable, predictable. Measure, don't assume. |
| Completeness | No half-built feature. No option without a purpose. |
| Simplicity | Complexity stays inside; the experience is clear. |
| Integrity | Don't promise what isn't delivered, hide limits or invent capabilities. |
| Evolution | Design for maintenance, compatibility, migration. |

## 3. THINK LIKE T.A.L. behaviours

| Behaviour | What to do |
| --- | --- |
| Understand before executing | Find the real problem, requirements and consequences first. |
| Question every choice | Every function, visual element and technical decision has a justification. |
| Don't deliver halfway | Finish, test and document what was promised. |
| Don't hide limitations | Say what works, what doesn't and why. |
| Seek the correct solution | Compare by quality, safety, clarity, maintenance. Not the easiest or shortest. |
| Learn from failures | Record, investigate, fix, and stop it from recurring. |

## 4. Definition of done

A feature is done only when it is **tested**, behaves **predictably**, **handles unexpected situations**, **reports failures**, and does not break other parts of the product. Working once is not done.

## 5. Interface layers

Every product has three layers in one app: **ESSENTIAL** (main actions, direct flow), **ADVANCED** (detailed settings), **ENGINEERING** (diagnostics, logs, metrics). No artificially limited "lite" or "pro" versions.

## 6. Router

| Task | Use |
| --- | --- |
| UI, motion, gesture, layout | `tal-apple-design` |
| Colour, font, logo, accent audit | `tal-brand-check` (run its script) |
| Any user-facing text, error, name, signature | `tal-voice` |
| Tests, security, performance, logs, metrics, migrations | `tal-engineering` |
| Firmware, binaries, protocols | `rea:reverse-engineer-anything` |
| Large file you only need part of | `headroom:peek` |
| Finding bugs in a diff | `code-review`; reducing excess: `simplify` |
| New or changed skill | `skill-creator` |

Priority when sources conflict: **`C:\dev\CLAUDE.md` > T.A.L. skills > third-party skills > generic guidance.** Never let a third-party skill introduce a colour, font, slogan or logo treatment outside the identity.

## 7. Signatures (fixed, never create new ones)

`THINK LIKE T.A.L.` (signature), `MADE BY T.A.L.` (seal), `EVERYTHING HAS A REASON.` (support line, accompanies the signature, never alone). A new phrase enters only by replacing another, with the reason recorded.

## 8. Manifesto (official, English)

THINK LIKE T.A.L. EVERYTHING HAS A REASON. We don't do things by halves. We do them accurately. Technology should be complete, precise and accessible. Complexity belongs behind the scenes; simplicity belongs in the hands of the user. We don't remove possibilities to make things easier; we make possibilities easier to understand. We don't settle for something that simply works; we pursue something that works correctly. Every detail matters. Every function has a purpose. Every result must be reliable. MADE BY T.A.L.

## 9. Declared pending (do not invent)

The identity document lists two open items: the stacked name converted to outlines, and the numeric targets for each product's measurements. Ask the owner for the numbers. Don't fill them in.
