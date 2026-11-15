---
name: tal-engineering
description: T.A.L. Engineering Standards for C:\dev. Use when planning, reviewing or finishing a feature, deciding what tests to write, handling errors and logs, touching performance, security, compatibility, migrations or documentation, or measuring a product's precision (T.A.R.K.A.S. audio, T.A.P.E.S. image). Defines when a feature counts as done.
---

# T.A.L. Engineering Standards

## The ten areas

| Area | Requirement | Check |
| --- | --- | --- |
| Architecture | Modular, documented, expandable | New module has one purpose and a documented boundary |
| Code | Readable, consistent, reviewed | `code-review` run on the diff |
| Tests | Unit, integration, end to end | Test exists for the behaviour, and failed before the fix |
| Security | Data protection from the architecture | No secret in code; permissions asked at the moment of use |
| Performance | Monitored, measured, optimised | A number before and after; no "feels faster" |
| Compatibility | Real devices and environments | Run on device or emulator; if not, mark pending |
| Interface | Accessibility WCAG AA minimum, consistency, clarity | Contrast, touch target, font scaling, reduced motion |
| Documentation | Complete, useful, current | Changed behaviour means changed docs, same commit |
| Errors | Handling, logs, diagnosis, recovery | Failure is caught, reported in plain words, logged in ENGINEERING layer, recoverable |
| Updates | Compatibility and safe migrations | Old data opens in the new version; migration tested |

## Done means

Tested, predictable, handles the unexpected, communicates failure, harms nothing else. If a step could not be verified, write **pending** and say what is missing.

## Measurable precision

A brand of precision proves what it says. Each product states numeric targets in its specification, measures each version and publishes the result.

| Product | Measure |
| --- | --- |
| T.A.R.K.A.S. | End-to-end latency; audio dropouts per hour; frequency-response deviation |
| T.A.P.E.S. | Shutter lag; dropped frames per minute of recording; colour accuracy |

The numeric targets are **pending**: the identity document does not set them. Ask the owner. Don't invent them. Until they exist, record the measured value and the method, and don't claim a target was met.

## Image, sound and motion (inside products)

- Screenshots are real. Never simulate a feature or data the product lacks.
- Every interface sound has a function: confirm, warn, or mark start and end. Short, discreet, consistent across products. Respect volume and silent mode. Optional opening sound, can be turned off.
- In audio products, interface sounds never mix with the user's signal.
- Animation communicates a state change. 150–300 ms, decelerating, honours reduced motion, opening animations short and skippable.

## Audio real-time rules (T.A.R.K.A.S.)

On the audio thread: no allocation, no locks, no I/O, no logging, no blocking calls. Pre-allocate buffers. Move work to another thread and pass results through a lock-free structure. Measure underruns, and report them in the ENGINEERING layer.

## When you finish

Report what was verified and how, what is pending and why, and any limitation. Don't use "should work".
