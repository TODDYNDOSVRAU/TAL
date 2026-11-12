# UI, motion in apps, and design

Apple-style fluid, physical interaction applied inside the T.A.L. identity. Priority on conflict: identity > this file > generic Apple guidance.

The identity covers what things look like. This file covers how they are structured, move, respond and feel. For an existing project, keep its own palette and accent; do not migrate without asking.

## Identity inputs (never override)

- **Base:** Absolute Black `#080808`, Precision White `#F2F2F0`, Technical Gray `#8C8C8C` on dark / `#6B6B6B` on light (AA).
- **Accent per product.** T.A.L. brand accent and T.A.R.K.A.S.: Ice `#7EE3EA` on dark, Deep Teal `#0D6C74` on light. Ice is never placed on light (1.3:1). Signal Lime is retired. The logo never takes an accent colour.
- **Accent budget:** about 5% of any composition. It marks active, ready or attention states only.
- **Typefaces:** Space Grotesk (titles, identity), Inter (interface text), JetBrains Mono (metrics, code). Use the bundled variable files in `app/src/main/res/font/`.
- **Voice and fixed phrases:** `references/voice.md`. No exclamation marks, no hype; errors say what to do.

## Where the sources conflict

| Topic | Source says | T.A.L. identity | Resolution |
| --- | --- | --- | --- |
| Duration | Apple spring response 0.3–0.4 s | Transitions 150–300 ms | UI transitions ≤ 300 ms. Springs use response ≤ 0.3 s. Response 0.4 s only for large repositioning, and say so in the code. Response is the oscillation period, not the settle time: a critically damped spring reaches within 1% at about 1.06 × response (derived, not sourced), so use response ≈ 0.28 for a hard 300 ms. |
| Press feedback | 100–160 ms (taste-skill, ui-ux-pro-max) | 150–300 ms | Press feedback is a response, not a transition: 100–150 ms is allowed. Dialogs and drawers stay ≤ 300 ms (taste-skill says 250–450 ms; not adopted). |
| Typeface | Prefer the system font | Space Grotesk / Inter / JetBrains Mono | Identity wins. Keep the Apple rules for optical sizing, tracking and leading, applied to these fonts. |
| Colour | Generic or a library of palettes | Fixed palette and accent | Identity wins. Materials are tints of Absolute Black or Precision White. |
| Logo | — | Single colour, never accented | Identity wins. No motion effect may recolour the logo. |

## 1. Core rules (condensed from Apple's WWDC principles)

1. **Response on pointer-down.** Show pressed state at once. Audit every debounce and delay. Feedback during a gesture is 1:1, not only at the end.
2. **Direct manipulation.** The element stays under the finger, keeping the grab offset. Track a short position and time history so you know velocity at release.
3. **Interruptibility first.** Any motion can be grabbed and reversed. Start from the current on-screen value, never the target. No input lock-out during transitions. No `tween`-only animation for gesture-driven elements. Never depend on an animation-end event for correctness: rapid changes cancel and replace the previous one and set the final state explicitly.
4. **Springs, not fixed durations.** Default damping ratio 1.0 (no overshoot). Use bounce only when a flick or throw produced the motion: prefer the named constants (`DampingRatioLowBouncy` 0.75, `DampingRatioMediumBouncy` 0.5).
5. **Velocity handoff.** On release, the spring starts at the finger's velocity so there is no seam.
6. **Momentum projection.** Choose the snap target from where the gesture is going: `position + (v/1000)·d/(1−d)`, d ≈ 0.998 (formula from the WWDC18 talk, recalled and not re-checked; tune on device).
7. **Spatial consistency.** Enter and exit along the same path. Anchor popovers and sheets to their trigger. Mirror easing on reversible motion.
8. **Hint the outcome.** Intermediate frames point at the final state.
9. **Rubber-band edges.** Resist progressively past a boundary; don't hard-stop. `resisted = (over · dim · c) / (dim + c · |over|)` with c = 0.55, where `over` is the distance past the bound and `dim` the size of the container (constant from the owner's earlier apple-design skill, not re-checked).
10. **Gesture thresholds.** About 10 dp of hysteresis before committing to a direction. Detect plausible gestures in parallel from the first move and cancel losers once intent is clear; don't rely on recognisers that only report a final state. Tap: highlight on down, commit on up, and let the user cancel by dragging away. Double-tap delays every single tap, so pay that only where double-tap exists.
11. **Frame smoothness.** Animate transform and alpha, and in Compose read animated state in the layout or draw phase (`graphicsLayer {}`, `offset {}`, `drawBehind {}`), not in composition. The per-frame cost of the Haze blur is unmeasured: measure it.
12. **Materials.** Translucent chrome (tab bar, mini player) floats over content. Never stack light translucent surfaces. Tint with the identity base. Animate blur and scale together on enter and exit.
13. **Feedback, three senses.** Causality (the feedback matches the event that caused it), harmony (visual, sound and haptic fire on the same frame), utility (only at meaningful moments). Four kinds: status, completion, warning, error; validate inline, not on submit.
14. **Reduced motion.** Respect three signals: reduced motion (cross-fade, no overshoot), reduced transparency (solid surfaces, no blur), more contrast (defined borders). Keep opacity and colour changes that aid comprehension. Vestibular triggers to avoid regardless: full-screen moving backgrounds, slow looping oscillation near 0.2 Hz, abrupt brightness jumps (ease theme changes), large objects moving at full opacity (make them semi-transparent while they travel).
15. **Typography craft.** Tracking is size-specific: tighten large headings (≈ −0.02 em), keep body near 0. Leading shrinks as size grows. Hierarchy comes from weight + size + leading together. Layout scales with the system font size (sp, not fixed dp for text).
16. **Orientation.** Each screen answers: where am I, where can I go, what is here, how do I leave.

## 2. Android / Compose mapping

| Apple / web | Compose (T.A.R.K.A.S.) |
| --- | --- |
| Pointer Events + capture | `Modifier.pointerInput` with `detectDragGestures`, track `VelocityTracker` |
| Spring (damping 1.0, response 0.3) | `spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = (2π / 0.3)²)` ≈ 439 |
| Spring with bounce (damping 0.8) | `spring(dampingRatio = 0.8f, ...)` only after a flick |
| Velocity handoff | `Animatable.animateTo(target, initialVelocity = releaseVelocity)` |
| `backdrop-filter` material | the existing Haze setup (`hazeEffect`), tinted with `TalInk…` or `TarkasIce` tokens, not custom colours |
| `prefers-reduced-motion` | the existing `rememberReducedMotion()` helper |
| `prefers-reduced-transparency` | the existing reduce-transparency setting |

Stiffness is derived from the response: `stiffness = (2π / response)²` (Compose's spring has unit mass and no `response` parameter; that term is SwiftUI's). Compose constants: stiffness VeryLow 50, Low 200, MediumLow 400 (enter/exit default), Medium 1500 (default); damping NoBouncy 1.0, LowBouncy 0.75, MediumBouncy 0.5, HighBouncy 0.2.

## 3. Checklist before shipping a UI change

- [ ] Pressed state is instant (on down, not on up) and does not shift layout or jitter.
- [ ] Gesture-driven motion is grabbable and reversible mid-flight.
- [ ] No transition exceeds 300 ms, except a documented large repositioning.
- [ ] Bounce appears only after a flick or throw.
- [ ] Colours are identity tokens only, no ad-hoc hex in a screen. Accent is Ice on dark, Deep Teal on light. No lime, no blue on light.
- [ ] Logo is a single colour and is not animated with an accent.
- [ ] Type uses Space Grotesk, Inter or JetBrains Mono, with size-specific tracking.
- [ ] Reduced-motion and reduced-transparency paths exist and were tested.
- [ ] Both themes were tested, not inferred from one. Scrims are measured against the real background.
- [ ] Sticky bars and overlays never cover the focused element.
- [ ] Copy follows the voice rules. Errors say what to do.
- [ ] Every drag (queue reorder, EQ sliders and graph points, seek) has a single-tap or button alternative (WCAG 2.5.7).
- [ ] Targets ≥ 48 dp with 8 dp between; 200% font, landscape and split-screen hide nothing.
- [ ] Every component has its states (default, pressed, focused, disabled, loading, empty, error).
- [ ] Data states are honest: zero prints as 0, a missing value as a dash, an empty section keeps its frame.
- [ ] Jank judged on a **release** build on a mid-range device (Perfetto FrameTimeline or Macrobenchmark); list keys and `contentType` set; Baseline Profile present.
- [ ] Verified on device or emulator. If not, mark as pending.

## 4. Numbers

| Need | Use |
| --- | --- |
| Spring pairs (damping / response) | default 1.0 / ≤ 0.3 · flick 0.8 / ≤ 0.3 · reposition 1.0 / 0.4 · rotation 0.8 / 0.4 · drawer or sheet 0.8 / 0.3 (from the owner's earlier apple-design skill, not re-checked against the talk; 0.4 only for large repositioning) |
| Duration by element | press 100–150 ms · hover 150–200 · menu or popover 150–250 · dialog or drawer ≤ 300 |
| Exit vs enter | exit takes about 60–70% of the enter time |
| Easing | enter and exit: ease-out; between two places: ease-in-out; constant travel: linear. Avoid ease-in on UI (the first frames barely move) |
| Fade | don't leave an element lingering below 0.2 opacity: fade fully or stay visible |

Duration, easing and fade rows: taste-skill and ui-ux-pro-max (MIT), cut to the 300 ms cap.

## 5. Premium interface craft (structure and detail)

**Order: function first, then craft.** Build the screen with real data and every state in the matrix working (tap, empty, error, offline) using plain components. Then add motion, materials and detail, and re-run the state matrix. Motion on a flow that does not work yet is wasted and hides defects.

**Process.** Before building, write a compact token plan from the brief: palette (identity tokens), type roles, layout idea, three principles. After building, critique it: take screenshots, fix the three worst problems, look again, at most three rounds (house rule). Then remove one element that does not serve the brief. Inspect the release build, not only the debug build.

Premium comes from restraint and consistency, not effects.

**Hierarchy.** One primary action per screen. Three levels of emphasis at most: primary, secondary, quiet. Size, weight and contrast carry hierarchy before colour does.

**Space.** Pick a base unit (4 or 8) and use only its multiples. Group by proximity: related items closer than unrelated ones. Generous outer margins, tight inner groups. Align to a grid; optical alignment beats mathematical when they disagree (icons, rounded shapes).

**Type scale.** A small, fixed set of sizes (for example 12, 14, 16, 20, 28, 40; example values, not a standard), each with a role. Numbers in a table or meter use tabular figures and the mono face so digits don't jump.

**Colour.** Neutral surfaces, the accent only where state or attention lives (about 5%). Build elevation with surface tint and a hairline border, not heavy shadow. A colour on a change says good or bad, not up or down.

**Every state exists.** For each component design and build: default, pressed, focused, disabled, loading, empty, error, and success where it applies. A missing state is an unfinished feature.

**Empty, loading, error.**
- Empty: say what belongs here and the one action that fills it.
- Loading: show structure (skeletons) after a visible delay (the ~300 ms threshold is a house rule, not sourced); show real progress when you can measure it.
- Error: what happened, why if known, what to do (`references/voice.md`). Keep the user's input.

**Density and control.** ESSENTIAL layer is calm and obvious; ADVANCED and ENGINEERING appear on request, never in the first view. Don't remove capability to look simple; make it findable. Place a control by frequency × consequence × audience: ESSENTIAL is used in most sessions and reversible; ADVANCED changes the outcome or needs domain knowledge, one tap from its parent; ENGINEERING explains or measures the system, 2 hops or fewer. Two disclosure levels is the practical limit (NN/g). Test: can a first-time user finish the core task without opening it, and can someone who needs it still find it?

**Touch and input.** At least 48 dp with 8 dp between targets (Android docs). Compose enlarges small clickables beyond their bounds, which can overlap neighbours: use `minimumInteractiveComponentSize()`. iOS 44 pt is HIG, quoted second-hand. WCAG 2.5.8 (24 px, AA) is the floor, not the target. Never rely on hover or long-press as the only path, and give every drag a tap alternative (WCAG 2.5.7). Support keyboard and screen reader order.

**Platform.** Edge-to-edge is enforced from targetSdk 35. Custom back callbacks stop the system predictive-back animation. Decide layout by window size.

**Accessibility (WCAG AA minimum).** Text contrast 4.5:1 (3:1 for large text); UI components and state indicators 3:1 (WCAG 1.4.11, verified). Computed for this palette: `#8C8C8C` on `#080808` 5.96; `#6B6B6B` on `#F2F2F0` 4.75; Ice on black 13.41; Deep Teal on `#F2F2F0` 5.49; Ice on `#F2F2F0` 1.33. Focus appearance (2.4.13) is AAA; a visible focus indicator at 3:1 is the AA-level practice. Don't use colour alone to carry meaning. Respect font scaling, reduced motion, reduced transparency, increased contrast. Give every control a label.

**Consistency.** Same thing, same look and behaviour everywhere. Reuse the component; a new pattern needs a reason.

**Performance is design.** Animate transform and opacity; read animated state in layout or draw, not composition. Frame budget: 16.7 ms at 60 Hz, 11.1 ms at 90 Hz, 8.3 ms at 120 Hz; a frame over budget is dropped, not delayed (slow > 16 ms, frozen > 700 ms). Avoid layout in scroll. Measure on a mid-range device, release build, Baseline Profile. Strong skipping is the default from Kotlin 2.0.20, so blanket `@Stable` or immutable collections can cost more than they save: check the Compose compiler reports first.

**Craft test.** Squint: is the hierarchy clear? Switch theme. Slow the animation 5x. Turn on reduced motion. Scale text to 200%. Grab any animation mid-flight and reverse it. Walk every control with TalkBack. View a greyscale screenshot: is meaning carried by colour alone?

**Review script (objective).** Count taps and decisions for the top 3 tasks (none worse than before). Measure contrast for every text/UI pair and every control size. Fill the state matrix with screenshots, in reduced motion, reduced transparency, increased contrast, light and dark. Record p90/p99 frame time for list scroll, player expand and EQ drag on a release build. Inject offline, missing file and full disk: each message must state cause and remedy. For web output, run `scripts/vendor/lint/lint.mjs` (also scans `.kt` and `.xml`).

## Larger companion skills

- **frontend-design** (anthropics/skills, via example-skills, installed, disabled; Apache-2.0): plan, review, build, critique loop. Its list of generic "AI tells" includes *a near-black background with a single bright accent* and *a monospace face for small data labels*. That describes the T.A.L. identity. Its own rule is that the brief's words always win, and here the identity is the brief, so those two traits are decisions, not defaults. Its other tells (cream and terracotta, identical rounded cards, an eyebrow above every heading, "→" on every link) still count.
- **ui-ux-pro-max** (MIT, installed, disabled) and **taste-skill** (MIT, installed, disabled): methods and checklists only. Their palettes, font lists and style libraries never apply. Rejected: taste-skill's mandatory motion layer (fails a page with fewer than eight moving elements) and its 600–1600 ms reveals, because motion here has a purpose and a 300 ms cap; its bans on monospace, hairlines and glass, because the identity uses JetBrains Mono for metrics, hairline borders for elevation and Haze materials.

The identity and the rules in this file win on conflict.
