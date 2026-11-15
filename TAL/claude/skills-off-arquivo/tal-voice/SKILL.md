---
name: tal-voice
description: T.A.L. voice for any user-facing text in C:\dev, in Portuguese and English. Use when writing or reviewing UI copy, error and empty-state messages, confirmations, release notes, documentation headers, store text, product names, signatures or the seal. Precise, direct, honest, calm. No hype.
---

# T.A.L. voice

Write like a good engineer explaining something to a person they respect: facts, no hurry, no exaggeration. Integrity applies to every word.

## Attributes

| Attribute | In practice |
| --- | --- |
| Precise | Numbers, facts and exact names instead of adjectives. "Fast" says nothing; the measured time does. |
| Direct | Short sentences. What happened first, then what to do. |
| Honest | Say what doesn't work, what doesn't exist yet, and why. |
| Calm | No exclamation marks, no emoji in system messages, no promises of "revolution". |

## Avoid / prefer

| Avoid | Prefer |
| --- | --- |
| "Ops! Algo deu errado." | "Não foi possível salvar: o disco está cheio. Libere espaço e tente de novo." |
| "O melhor áudio do mundo!" | "Latência medida e exibida no painel de diagnóstico." |
| "Clique aqui" | "Exportar vídeo" |
| "Novidade incrível chegando em breve!" | "Ainda não disponível nesta versão." |
| "Tem certeza?" | "Excluir 12 gravações? Esta ação não pode ser desfeita." |

Error template: **what happened** + **why, if known** + **what to do**. Never blame the user. Never show a raw exception as the message; put it in the ENGINEERING layer.

## Language

- Signature, seal and product names stay in English and are never translated.
- Interfaces follow the system language, at least Portuguese and English. Both versions say the same thing, with the same numbers.
- Documents use the language of their audience.
- The manifesto is official in English; the Portuguese is a reference translation.

## Writing the name

| Situation | Rule |
| --- | --- |
| In text | Always with periods: T.A.L., T.A.R.K.A.S., T.A.P.E.S. |
| End of sentence | The acronym's period ends the sentence. Don't double it. "feito pela T.A.L." |
| Domains, profiles, files, packages | Lowercase, no periods: `tal`, `tarkas`, `tapes` |
| Pronunciation | As a word: "tal", "tárkas", "têips". Never spelled out. |
| Gender (Portuguese) | Feminine for the company ("a T.A.L."); masculine for products ("o T.A.P.E.S.") |

Full names: T.A.R.K.A.S. = Totally Accurate Real-Time Kind of Audio System. T.A.P.E.S. = Totally Accurate Picture Engine Studio. A new product's full name starts with "Totally Accurate", the acronym forms a real word tied to its function, and no word is misspelled to fit a letter.

## Where each phrase goes

| Place | Text |
| --- | --- |
| Splash screen | `MADE BY T.A.L.` |
| Site / institutional deck | `THINK LIKE T.A.L.` + `EVERYTHING HAS A REASON.` |
| About the app | `Developed by Totally Accurate Labs.` |
| Documentation | `T.A.L. Engineering Standards` |
| Footer | `© 2026 Totally Accurate Labs · MADE BY T.A.L.` |

## Checklist

- [ ] No `!`, no emoji, no superlatives without a measurement.
- [ ] Every claim is something the product does today. Otherwise "ainda não disponível".
- [ ] Buttons name the action ("Exportar vídeo"), not "OK" or "Clique aqui".
- [ ] Destructive confirmations state the count and whether it can be undone.
- [ ] PT and EN both exist and agree.
