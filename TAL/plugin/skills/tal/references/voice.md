# Voice and naming

Write like a good engineer explaining something to a person they respect: facts, no hurry, no exaggeration. Integrity applies to every word.

| Attribute | In practice |
| --- | --- |
| Precise | Numbers, facts and exact names, not adjectives. "Fast" says nothing; the measured time does. |
| Direct | Short sentences. What happened first, then what to do. |
| Honest | Say what doesn't work, what doesn't exist yet, and why. |
| Calm | No exclamation marks, no emoji in system messages, no promise of "revolution". |

## Avoid / prefer

| Avoid | Prefer |
| --- | --- |
| "Ops! Algo deu errado." | "Não foi possível salvar: o disco está cheio. Libere espaço e tente de novo." |
| "O melhor áudio do mundo!" | "Latência medida e exibida no painel de diagnóstico." |
| "Clique aqui" | "Exportar vídeo" |
| "Novidade incrível chegando em breve!" | "Ainda não disponível nesta versão." |
| "Tem certeza?" | "Excluir 12 gravações? Esta ação não pode ser desfeita." |

### Hype words

A word from this list needs a measurement next to it, or it goes. EN (from taste-skill, MIT): unlock, unleash, supercharge, elevate, empower, streamline, seamless, effortless, robust, cutting-edge, next-generation, world-class, all-in-one, blazing fast. PT (house list, not from a source): revolucionário, incrível, poderoso, mágico, perfeito, sem esforço, de última geração, turbine, libere o poder, o melhor do mundo. Say the specific thing the product does.

### Action names

An action keeps one name through the whole flow: the button "Publicar" produces the message "Publicado", not "Enviado" or "Concluído". A button names what happens ("Salvar alterações"), not "OK" or a generic "Enviar" for a save. Describe things in the user's words, not the system's ("notificações", not "configuração de webhook").

Error template: **what happened** + **why, if known** + **what to do**. Never blame the user. Never show a raw exception as the message; it goes to the ENGINEERING layer.

## Language

- Signature, seal and product names stay in English, never translated.
- Interfaces follow the system language, at least Portuguese and English, saying the same thing with the same numbers.
- Documents use the language of their audience.
- The manifesto is official in English; the Portuguese is a reference translation. Full text: the manifesto page of `C:\dev\TAL\identidade\Identidade_TAL.html`. Quote it from there, never from memory.
- Captions and subtitles are burned in exactly as written. Never rewrite or shorten the user's words to make them fit; if a line is too long, change the layout or ask.

## THINK LIKE T.A.L. in practice

| Behaviour | What to do |
| --- | --- |
| Understand before executing | Find the real problem, requirements and consequences first. |
| Question every choice | Every function, visual element and technical decision has a justification. |
| Don't deliver halfway | Finish, test and document what was promised. |
| Don't hide limitations | Say what works, what doesn't and why. |
| Seek the correct solution | Compare by quality, safety, clarity, maintenance, not the easiest or shortest. |
| Learn from failures | Record, investigate, fix, and stop it from recurring. |

## Writing the name

| Situation | Rule |
| --- | --- |
| In text | With periods: T.A.L., T.A.R.K.A.S., T.A.P.E.S. |
| End of sentence | The acronym's period ends the sentence; don't double it. "feito pela T.A.L." |
| Domains, profiles, files, packages | Lowercase, no periods: `tal`, `tarkas`, `tapes` |
| Pronunciation | As a word: "tal", "tárkas", "têips". Never spelled out |
| Gender (Portuguese) | Feminine for the company ("a T.A.L."), masculine for products ("o T.A.P.E.S.") |

T.A.R.K.A.S. = Totally Accurate Real-Time Kind of Audio System. T.A.P.E.S. = Totally Accurate Picture Engine Studio. A new product's full name starts with "Totally Accurate", the acronym forms a real word tied to its function, and no word is misspelled to fit a letter.

## Signatures

Fixed, never new: `THINK LIKE T.A.L.` (signature) · `MADE BY T.A.L.` (seal) · `EVERYTHING HAS A REASON.` (support line; accompanies the signature, never alone). A new phrase enters only by replacing another, with the reason recorded.

| Place | Text |
| --- | --- |
| Splash screen | `MADE BY T.A.L.` |
| Site / institutional deck | `THINK LIKE T.A.L.` + `EVERYTHING HAS A REASON.` |
| About the app | `Developed by Totally Accurate Labs.` |
| Documentation | `T.A.L. Engineering Standards` |
| Footer | `© 2026 Totally Accurate Labs · MADE BY T.A.L.` |

## Image and sound inside products

- Screenshots are real. Never simulate a feature or data the product lacks.
- Every interface sound has a function: confirm, warn, or mark start and end. Short, discreet, consistent. Respect volume and silent mode. In audio products, interface sounds never mix with the user's signal. An opening sound is optional and can be turned off.

## Checklist

- [ ] No `!`, no emoji, no superlative without a measurement.
- [ ] Every claim is something the product does today; otherwise "ainda não disponível".
- [ ] Buttons name the action, not "OK" or "Clique aqui".
- [ ] Destructive confirmations give the count and whether it can be undone.
- [ ] PT and EN both exist and agree.
