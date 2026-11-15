# Websites: taste-skill, transitions.dev, React Bits and the T.A.L. identity

Owner's decision (2026-11-12): for websites, **taste-skill's rules lead and T.A.L. is adapted to them**, not the other way round. This file says where each source applies. It holds no third-party code and no third-party prose; the sources stay where they were installed.

## The four sources

| Source | Owns | Where it lives |
| --- | --- | --- |
| taste-skill 2.5.1 (`design-taste-frontend`, MIT) | Process and structure of a company website: kind of business, page plan, one section per screen, equal edges, real photographs and real icons, copy rules, dealt moments, finish gate | `~/.claude/skills-off/design-taste-frontend/` (installed 2026-11-12; disabled 2026-11-15) |
| transitions.dev (`transitions-dev`, `transitions-polish`) | UI motion snippets (CSS, `t-*` selectors, reduced-motion guard) and the motion-token scale used to tune existing motion | `~/.claude/skills-off/transitions-dev/`, `transitions-polish/` (disabled 2026-11-15) |
| React Bits | Animated React components, copied into a project when needed | Not installed. Taken per project from reactbits.dev |
| T.A.L. identity and principles | Colour, type, logo, accent budget, voice, fixed phrases, accessibility floor, the three interface layers | `C:\dev\CLAUDE.md`, `brand.md`, `voice.md` |

**Disabled by default (owner, 2026-11-15).** The three skills were moved to `~/.claude/skills-off/` so their descriptions don't load in every project and transitions-dev doesn't trigger on Compose work. For website work, move them back to `~/.claude/skills/` for that period, or copy them into the site project's own `.claude/skills/`. Until then, follow the rules in this file without invoking them.

## Who wins on what

| Topic | Winner | Note |
| --- | --- | --- |
| How a page is planned, sectioned, written, checked | taste-skill | Run its steps and its gate; do not skip the gate |
| Copy of a page (headline, buttons, hard fact on screen one) | taste-skill, in the T.A.L. voice | No exclamation marks, no hype, fixed phrases unchanged; both agree on plain copy |
| Palette, accent, fonts, logo | **T.A.L. identity** | A brand is its palette. Do not take a palette or typeface from taste-skill's dealer for a T.A.L. product |
| Accent use | T.A.L. | About 5% of a composition; Ice never on light; the logo takes no accent |
| Accessibility | The stricter of the two | WCAG AA minimum (T.A.L.); taste-skill asks 4.5:1 text and 7:1 on its brand band, and that is stricter, so use it |
| Motion on a page | taste-skill's layer for hero entrance and dealt moments; transitions.dev for component transitions | Motion is the top priority; no reduced-motion rule (removed by the owner, 2026-11-12) |
| Motion durations | taste-skill (owner, 2026-11-12) | Its durations and the transitions.dev tokens apply on websites, not the identity's 150 to 300 ms. App UI (Android) keeps `ui.md` |
| Components | React Bits only when the page needs the effect and the stack is React | Check the licence first |
| An existing project | Its own palette and fonts | Do not migrate without asking (`C:\dev\CLAUDE.md`) |

## T.A.L. as the token layer

taste-skill reads its colour from page tokens (`--bg --surface --ink --muted --accent --card`, per its own CSS). For a T.A.L. product, set those tokens to the identity values from `brand.md` instead of dealing a palette:

- `--bg` Absolute Black `#080808` and `--ink` Precision White `#F2F2F0` on a dark page; the reverse on a light one.
- `--muted` `#8C8C8C` on dark, `#6B6B6B` on light.
- `--accent` Ice `#7EE3EA` on dark, Deep Teal `#0D6C74` on light.
- Fonts: Space Grotesk, Inter, JetBrains Mono.

T.A.L. pages are software or hardware pages, so taste-skill's own rule that dark heroes and shader effects belong to technical subjects allows them. Its rule that a local business gets photographs does not apply to T.A.L. products.

**Pending, not verified:** whether taste-skill's starter and checker accept these tokens without its palette dealer, and whether its gate passes with them. I could not run its scripts (the permission layer blocked executing downloaded code). Before the first T.A.L. site, run the gate on a real page and record the result here.

## Decided: motion durations

The owner ruled on 2026-11-12: on websites the durations are taste-skill's, with transitions.dev's tokens for component transitions. This overrides the identity's 150 to 300 ms for websites only; `ui.md` and `C:\dev\CLAUDE.md` stay unchanged for apps. The reduced-motion rule no longer applies. The transitions.dev snippets still carry their own `prefers-reduced-motion` guard; that is third-party code and is left as published.

## Licences

- taste-skill: MIT. Installed as published; nothing copied into this plugin.
- transitions.dev: free transitions and skills may be used in personal and commercial projects. **Redistributing the library, or a substantial part, as a competing library or motion pack is forbidden.** So the plugin carries no copy. Pro transitions need a paid plan; Business for use on behalf of a company (T.A.L. is one): do not use a Pro transition without it.
- React Bits: MIT with the Commons Clause. Use inside an application or website is allowed; selling it as a product or library is not. Keep the copyright notice. Do not vendor it here.

## Safety of the installed skills

- Install scan reported by the installer: taste-skill Gen "Critical Risk", Socket 0 alerts, Snyk "Med Risk"; transitions-dev and transitions-polish Gen "Safe", Snyk "Low Risk". The Gen rating is unexplained; I found network calls only to Wikimedia Commons, the Overpass map API and jsDelivr (photos, map bake, icons) and local-only Chrome control. That was a pattern search, not an audit.
- taste-skill declares a **Stop hook** that runs its `gate.mjs` (timeout 600 s) while the skill is active. Expect it to run at the end of a turn on a website task.
- Its scripts need Node 22+ and Chrome, Edge or Chromium. They write temporary profiles under `TASTE_SKILL_TMP` or the system temp folder.
- Review skills before use: they run with the agent's permissions.

## Cost

taste-skill's `SKILL.md` is about 31 KB and transitions-dev about 27 KB; both load in full when invoked. Invoke them only on website or motion work, one at a time, and read their references on demand.
