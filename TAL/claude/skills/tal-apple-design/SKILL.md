---
name: tal-apple-design
description: Apple-style fluid, physical interface design (springs, momentum, interruptible gestures, materials, reduced motion, typography craft) applied inside the T.A.L. identity (palette, typefaces, accent, logo, voice) for T.A.R.K.A.S. and other T.A.L. products. Use for any UI, motion, gesture, feedback or layout work in C:\dev, Android/Compose first.
---

# T.A.L. × Apple design

Use with `C:\dev\CLAUDE.md`, which holds the identity rules. This skill covers how things move, respond and feel. The identity covers what they look like.

**Priority when they conflict:** identity (`C:\dev\CLAUDE.md`) > this skill > generic Apple guidance.

## 1. Identity inputs (never override)

- **Base:** Absolute Black `#080808`, Precision White `#F2F2F0`, Technical Gray `#8C8C8C` on dark / `#6B6B6B` on light (AA).
- **Accent per product.** T.A.L. brand accent and T.A.R.K.A.S.: Ice `#7EE3EA` on dark, Deep Teal `#0D6C74` on light. Ice is never placed on light (1.3:1). Signal Lime is retired. The logo never takes an accent colour.
- **Accent budget:** about 5% of any composition. It marks active, ready or attention states only.
- **Typefaces:** Space Grotesk (titles, identity), Inter (interface text), JetBrains Mono (metrics, code). Use the bundled variable files in `app/src/main/res/font/`.
- **Voice:** precise, direct, honest, calm. No exclamation marks, no hype, no emoji in system messages. Errors say what happened and what to do.
- **Fixed phrases:** `THINK LIKE T.A.L.`, `MADE BY T.A.L.`, `EVERYTHING HAS A REASON.`. Don't add slogans.

## 2. Where the two sources conflict

| Topic | Apple skill | T.A.L. identity | Resolution |
| --- | --- | --- | --- |
| Duration | Spring response 0.3–0.4 s | Transitions 150–300 ms | UI transitions ≤ 300 ms. Springs use response ≤ 0.3 s. Response 0.4 s only for large repositioning, and say so in the code. |
| Typeface | Prefer the system font | Space Grotesk / Inter / JetBrains Mono | Identity wins. Keep the Apple rules for optical sizing, tracking and leading, applied to these fonts. |
| Colour | Generic | Fixed palette and accent | Identity wins. Materials are tints of Absolute Black or Precision White. |
| Logo | — | Single colour, never accented | Identity wins. No motion effect may recolour the logo. |

## 3. Core rules (condensed from Apple's WWDC principles)

1. **Response on pointer-down.** Show pressed state at once. Audit every debounce and delay. Feedback during a gesture is 1:1, not only at the end.
2. **Direct manipulation.** The element stays under the finger, keeping the grab offset. Track a short position and time history so you know velocity at release.
3. **Interruptibility first.** Any motion can be grabbed and reversed. Start from the current on-screen value, never the target. No input lock-out during transitions. No `tween`-only animation for gesture-driven elements.
4. **Springs, not fixed durations.** Default damping ratio 1.0 (no overshoot). Use bounce (damping ≈ 0.75–0.8) only when a flick or throw produced the motion.
5. **Velocity handoff.** On release, the spring starts at the finger's velocity so there is no seam.
6. **Momentum projection.** Choose the snap target from where the gesture is going: `position + (v/1000)·d/(1−d)`, d ≈ 0.998.
7. **Spatial consistency.** Enter and exit along the same path. Anchor popovers and sheets to their trigger. Mirror easing on reversible motion.
8. **Hint the outcome.** Intermediate frames should point at the final state.
9. **Rubber-band edges.** Resist progressively past a boundary; don't hard-stop.
10. **Gesture thresholds.** About 10 dp of hysteresis before committing to a direction. Detect plausible gestures in parallel and cancel losers once intent is clear.
11. **Frame smoothness.** Animate only transform and alpha. Keep positional change per frame below perceptible strobing.
12. **Materials.** Translucent chrome (tab bar, mini player) floats over content. Heavier material for structure, lighter for interactive controls. Never stack light translucent surfaces. Tint with the identity base. Animate blur and scale together on enter and exit.
13. **Feedback, three senses.** Causality (the feedback matches the event that caused it), harmony (visual, sound and haptic fire on the same frame), utility (only at meaningful moments).
14. **Reduced motion.** Respect three signals: reduced motion (cross-fade, no overshoot), reduced transparency (solid surfaces, no blur), more contrast (defined borders). Keep opacity and colour changes that aid comprehension.
15. **Typography craft.** Tracking is size-specific: tighten large headings (≈ −0.02 em), keep body near 0. Leading shrinks as size grows. Hierarchy comes from weight + size + leading together. Layout scales with the system font size (sp, not fixed dp for text).
16. **Eight principles.** Purpose, agency, responsibility, familiarity, flexibility, simplicity (not minimalism), craft, delight. Each screen answers: where am I, where can I go, what is here, how do I leave.

## 4. Android / Compose mapping

The app is Android, so the web examples in Apple's guide translate like this:

| Apple / web | Compose (T.A.R.K.A.S.) |
| --- | --- |
| Pointer Events + capture | `Modifier.pointerInput` with `detectDragGestures`, track `VelocityTracker` |
| Spring (damping 1.0, response 0.3) | `spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = (2π / 0.3)²)` ≈ 439 |
| Spring with bounce (damping 0.8) | `spring(dampingRatio = 0.8f, ...)` only after a flick |
| Velocity handoff | `Animatable.animateTo(target, initialVelocity = releaseVelocity)` |
| `backdrop-filter` material | the existing Haze setup (`hazeEffect`), tinted with `TalInk…` or `TarkasIce` tokens, not custom colours |
| `prefers-reduced-motion` | the existing `rememberReducedMotion()` helper |
| `prefers-reduced-transparency` | the existing reduce-transparency setting |

Stiffness is derived from the response: `stiffness = (2π / response)²`.

## 5. Checklist before shipping a UI change

- [ ] Pressed state is instant (on down, not on up).
- [ ] Gesture-driven motion is grabbable and reversible mid-flight.
- [ ] No transition exceeds 300 ms, except a documented large repositioning.
- [ ] Bounce appears only after a flick or throw.
- [ ] Colours are identity tokens only. Accent is Ice on dark, Deep Teal on light. No lime, no blue on light.
- [ ] Logo is a single colour and is not animated with an accent.
- [ ] Type uses Space Grotesk, Inter or JetBrains Mono, with size-specific tracking.
- [ ] Reduced-motion and reduced-transparency paths exist and were tested.
- [ ] Copy follows the voice rules. Errors say what to do.
- [ ] Verified on device or emulator. If not, mark as pending.

## 6. Quick reference

| Need | Use |
| --- | --- |
| Default spring | damping 1.0, response ≤ 0.3 s |
| Flick spring | damping 0.8, response ≤ 0.3 s |
| Landing point | project momentum, snap to nearest target |
| Interrupt | start from the live value, carry velocity |
| Boundary | rubber-band |
| Accent on dark / light | Ice `#7EE3EA` / Deep Teal `#0D6C74` |
| Logo | single colour, no accent |
