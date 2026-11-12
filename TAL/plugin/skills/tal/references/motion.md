# Motion graphics in code (video output)

For animation that is **rendered to a video file**. For motion inside an app (springs, gestures), use `references/ui.md`.

## Pick the tool

| Tool | Licence | Use when |
| --- | --- | --- |
| **Remotion** (React → video) | Free for individuals, for-profit organisations of up to 3 people, non-profits and evaluation. From 4 people a paid licence is needed (Creators: per person who writes Remotion code; Automators: per render, for products that call the render APIs; Enterprise). Headcount of clients and contractors on the same project is combined. Prices and terms change (a 5.0 change was announced): **read remotion.dev/docs/license before use in a company** | Data-driven or templated video, captions, many variants, React skills |
| **Motion Canvas** (TypeScript) | MIT (maintenance status not checked) | Explainers and diagrams with a timeline you write as code (`npm init @motion-canvas@latest`, editor on localhost:9000) |
| **ffmpeg + SVG/canvas frames** | Free | One-off overlays, no framework wanted |
| **Manim** (Python) | MIT (Community and 3b1b editions); the 3Blue1Brown character assets are copyrighted, don't use them | Maths and technical diagrams |

If the licence of a tool does not fit the use, choose another. Don't assume.

## Remotion essentials

- Scaffold: `npx create-video@latest`. Preview: `npx remotion studio`. Render: `npx remotion render <CompositionId> out.mp4`.
- A video is a function of the frame: `useCurrentFrame()`, `useVideoConfig()` give `fps`, `width`, `height`, `durationInFrames`. **Everything visible derives from the frame number.**
- Animate with `interpolate(frame, [in0, in1], [out0, out1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })` (default extrapolation is `extend`, so clamp unless you want it) and `spring({ frame, fps, config })`. `easing` takes one function or one per segment.
- Layout with `<AbsoluteFill>`; time with `<Sequence from durationInFrames>`; chain scenes with `<Series>`; overlap scenes with `<TransitionSeries>` (`@remotion/transitions`) or a negative `offset` on `<Series.Sequence>`.
- Media: `<Video>` and `<Audio>` from `@remotion/media` (current docs prefer these for new work); `<OffthreadVideo>` only as a fallback (some of its props are deprecated); `<Img>`. Load assets from `public/` with `staticFile()`.
- Fonts: `@remotion/google-fonts`. Coverage of Space Grotesk, Inter and JetBrains Mono was **not verified**; check, or load the bundled files with `staticFile()`. Wait for fonts and data with `delayRender()`.
- Captions: `@remotion/captions` `Caption` has `startMs` and `endMs`; convert once with `Math.round(ms / 1000 * fps)`. Whisper helper: `@remotion/install-whisper-cpp`.
- Parametrise with `defaultProps` + a schema, so one composition renders many variants (`--props=file.json`).

## Determinism rules

A render must be identical every time.

- No `Math.random()`, `Date.now()` or network calls inside a component. Use `random('seed')` from `remotion` (it throws without a seed) and `delayRender()` for data.
- No CSS animations or transitions, no `setTimeout`: they ignore the frame clock.
- Generative work in p5.js: set the seed first so the same parameters give the same image: `randomSeed(seed); noiseSeed(seed);` (Anthropic's algorithmic-art skill). Record the seed with the output.
- Never animate by mutating state over real time. Don't depend on frame order or on pausing.
- Renders use several browser tabs with no shared state, so time- or random-dependent code diverges. `--concurrency=1` reduces flicker but does not fix a non-deterministic component.

## Motion craft for video

- **Purpose:** every movement shows a state change or directs the eye. No decorative motion.
- **Easing:** objects decelerate into place. Entrances ease-out, repositioning ease-in-out. Linear only for continuous motion (a progress bar, a ticker). Avoid ease-in on entrances and feedback: the first frames barely move and it reads as slow (taste-skill). If an exit uses ease-in, keep it short, before a slow arrival; ease-out for exits is also valid (our earlier "exits ease-in" was judgement, not sourced).
- **Springs** for organic arrival. Remotion's default is **underdamped** (mass 1, damping 10, stiffness 100, so ratio 0.5 and visible overshoot). For a calm arrival use damping 20 (stiffness 100, mass 1) or `overshootClamping: true`; add `durationInFrames` to end on a known frame. A little bounce only for a thrown or playful object.
- **Timing at 30 fps:** small UI element 6–10 frames; text line 10–15; scene transition 12–20 (house starting points, not sourced). Press feedback 100–160 ms (3–5 frames at 30 fps), menus and popovers 150–250 ms (taste-skill; web UI figures, adapt to video). Leaving is quicker than arriving: an exit takes about 60–70% of the entrance (ui-ux-pro-max; taste-skill says about 70%). Stagger siblings by 2–4 frames, not all at once. Hold the key frame long enough to read: about 1 s per 4 words (silent reading is roughly 200–250 wpm; figure unverified, **pending**: check on a phone).
- **Hierarchy:** one hero movement per moment. Everything else is quieter.
- **Not adopted from taste-skill:** its rule that a page must have a motion layer (fewer than eight moving elements fails its lint) and its 600–1,600 ms reveals. T.A.L. motion exists only for a purpose, and UI motion stays within 150–300 ms; those figures come from scroll-driven web pages.
- **Text:** animate by line or word, never by letter for body copy. Keep text in the safe area. Minimum size must read on a phone.
- **Colour and type:** use the identity (`references/brand.md`). Dark background, white text, accent for the one thing that matters, at most ~5%.
- **Sound:** cut on the beat; audio is half the feel. Fade, never click.

## Verify

1. Render a short range first: `--frames=0-90` (inclusive, 91 frames). `--props` takes a JSON file; inline JSON fails in Windows shells.
2. Pull frames at the start, end and mid-transition and look at them (`references/video.md`, Verify).
3. Check the output duration equals the rendered frame count / fps (for a range, not `durationInFrames`).
4. If determinism matters, render frame N in two processes and compare the PNG hashes (or a `--sequence` output). Don't hash the MP4: metadata and threading can change bytes.
5. Check safe areas on a frame, not in the editor.

## Larger companion skills

- **remotion-dev/skills** (6,794 stars, 2026-11-10): the official skill, about 35 rule files (timing, transitions, audio, motion blur, Lottie). Not installed.
- **Vincentwei1021/video-shotcraft** (18,485 stars): 124 shot recipes for promo videos. Not installed.

The licence analysis and the determinism checks in this file apply on top of them.
