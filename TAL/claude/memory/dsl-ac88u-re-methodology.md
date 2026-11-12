---
name: dsl-ac88u-re-methodology
description: "Standing objective and methodology for the DSL-AC88U kernel/RE project: complete the device tree (LAN+WiFi mandatory), read every file to the end"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 02c97cc9-c036-41d2-ba47-0d910917d594
  modified: 2026-11-07T04:28:31.980Z
---

User's standing objective (2026-11-06/07), overrides the implicit assumption of "good enough for now" on this project: finish the DSL-AC88U device tree for real, meaning working LAN (SF2 switch + runner) and working Wi-Fi (PCIe + BCM4366 + brcmfmac) device-tree nodes and drivers, not just the minimal console+RAM+NAND skeleton. See [[dsl-ac88u-router-findings]] and the plan at `Downloads\DSL-AC88U\PLANO_KERNEL_NOVO.md`. Estimated completeness when this was set: ~15-20% (LAN and Wi-Fi both at 0% — only addresses/IRQs known from RE, no DT nodes or drivers written).

**Methodology instruction (explicit, keep applying):** when reading any file via REA (or any source file relevant to this RE work), read it all the way through and understand it completely — do not skim or jump between files. If something in the file isn't understood, research it (web search, cross-reference other GPL sources, datasheets) before moving on, rather than guessing or leaving it vague. This applies to every file touched while working toward LAN/Wi-Fi completion: the GPL591 rdpa/rdd/runner sources, bcm_ethsw_impl1.c and friends, boardparms.c, the PCIe controller sources (plat-bcm63xx), etc.

**Why:** the user has been burned by half-understood RE (see the Fase B boot bug: a guessed/incomplete header format caused two failed physical flashes). Going file-by-file, completely, is meant to prevent repeating that kind of mistake on the much bigger LAN/Wi-Fi work ahead.

**How to apply:** before marking any RE sub-task (e.g. "understand SF2 init", "understand runner TX path") as done, confirm every function actually called in that path has been read, not just the entry point. Record what was actually verified vs inferred in the report/memory, same as before (OBS/INF/PEND tags).
