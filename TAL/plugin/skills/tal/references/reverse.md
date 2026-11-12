# Reverse engineering

## Scope first

Work only on what you are allowed to analyse: your own devices and firmware, software you have the right to inspect, interoperability work, security research with permission, CTFs. If authorisation is unclear, ask before starting. Don't help defeat protections to pirate, to attack third parties' systems, or to hide malware.

Legal note (not advice): interoperability exceptions are narrow. In the EU (Directive 2009/24/EC, Art. 6) they require a lawful user, information not readily available, only the parts needed, and not a substantially similar program. Rules differ by country and contract; owning a device does not by itself waive licence terms or anti-circumvention rules (unverified). If unsure, ask a lawyer.

Principles: evidence before story (only offsets, bytes and reproduced behaviour are facts); preserve the original (hash, read-only, work on copies); change one variable at a time against a known-good baseline; prefer cheap observation (UART log, strings, static) to invasive action (flash write, patch); validate a model with a test that could fail; record negatives and tool versions, because flags change between versions.

## Method

Evidence first, hypothesis second. Every claim traces to a fact you can point at.

0. **Write the questions first.** A short list of what you need to learn about the sample. At the end mark each one *answered*, *partially answered* or *unresolved*, with the evidence. Keep a negative search bounded: say which sources and patterns you searched, then stop.

1. **Triage (static, no execution).** Identify what it is.
   - `file`, hashes (`sha256sum`), size, timestamps. Record the hash: it names the sample.
   - Strings: `strings -a -n 6`, and wide strings. Look for versions, paths, URLs, error messages, format markers.
   - Entropy and structure: `binwalk` (v3 is a Rust rewrite; check `binwalk --help` for the entropy and extract options of your version). High, flat entropy with no magics suggests compression or encryption.
   - Headers: ELF/PE/Mach-O (`readelf`, `objdump`, `rabin2`, `pefile`), Android (`apktool`, `aapt`), firmware images (partition tables, magic numbers).
   - Android: follow OWASP MASTG and cite the MASTG-TEST id for each finding.
2. **Unpack / extract** before analysing. Keep originals read-only; work on copies.
3. **Lift** the code to something readable.
   - Native: Ghidra (free), rizin/radare2, objdump. Ghidra headless: `analyzeHeadless <project_location> <project_name> -import <file> [-processor <languageID> -cspec <id>] [-noanalysis] [-readOnly] [-postScript <Script> args] [-deleteProject]`. `-readOnly` discards changes; `-deleteProject` only for projects created in that run.
   - Raw binary with no load address: recover it from pointer/string agreement (binbloom, rbasefind; Ghidra loader option `-loader-baseAddr`) and validate with sane cross-references. Endianness is guessed by binbloom; architecture and word size stay manual.
   - Android/Java: `jadx`, `apktool`. .NET: `ilspy`/`dnspy`. Python/JS: decompile or beautify.
   - Name things as you learn them and keep a rename log.
4. **Hypothesis log.** One line each: *claim · evidence (address, offset, string, call graph) · confidence · how to confirm*.
5. **Confirm dynamically** when safe: emulator (user-mode `qemu` runs one binary with syscall translation, not hardware: `-L` sysroot, `QEMU_STRACE`, `-g` gdb port; full-system tools such as Firmadyne/FirmAE emulate only part of the images, so a failed emulation proves nothing), debugger (`gdb`, `x64dbg`, `lldb`), instrumentation (Frida), traffic (Wireshark, mitmproxy), hardware (UART, logic analyser, SWD/JTAG). Run unknown code only in an isolated VM or emulator with no network unless you chose to allow it.
6. **Document** so someone else can repeat it.

## Formats and protocols

- Find the header, the length fields and the checksum first. Vary one byte at a time against a known-good capture.
- Express the format as a small parser or a Kaitai/struct definition and test it on every sample you have. Kaitai parses (its `valid:` key makes the parser reject wrong assumptions); write your own serialiser to test round-trip. A parser that only reads is a guess; one whose output rebuilds the original byte-identical is evidence.
- For protocols: capture real sessions, separate framing from payload, then identify state transitions.

## Firmware and embedded

- Dump flash if you can; compare two firmware versions to locate what changed (`bindiff`, Ghidra diff, plain `cmp`).
- Look for the bootloader, the partition table, the root file system (`squashfs`, `jffs2`, `cramfs`), and device-tree blobs.
- **Raw NAND** is layered: MTD, then UBI, then UBIFS. UBI helps only after you hand it a clean image. The spare (OOB) area holds ECC and bad-block markers, so note whether the dump contains OOB and never strip or write without knowing the layout. Linux software Hamming ECC is 3 bytes per 256-byte sector (an erased page gives `FF FF FF`); BCH and hardware controllers use other layouts, so identify per SoC. Secondary write-ups give the order: ECC-correct, strip OOB, then ubi_reader/binwalk (not checked against a primary source). Dump twice (main only, main+spare) and compare to infer the layout.
- Serial console (UART) logs often give boot flow and crash reasons. Measure the pad voltage before connecting. Capture from power-on with timestamps and note the last message before silence or reboot. Treat a crash cause as a hypothesis until it is reproduced.
- Check for CRCs and signatures before patching; a patched image that fails a check can brick the device. **Verify the backup of the original image (read twice, compare hashes) before writing anything.**
- Redundancy is evidence: A/B banks, two firmware versions or two dumps expose layout and bit errors.

## Debug information (DWARF)

If a binary carries debug info, it gives names, types and line numbers for free; use it before guessing (paraphrased from the dwarf-expert plugin; no text copied).

- Check which tool you really have: on some systems a bare `dwarfdump` is a different program from LLVM's. Run its version flag first.
- On macOS the debug data lives in the `.dSYM` bundle, not in the executable; point the tool at the bundle.
- A quick name lookup is fast but not exhaustive; if it finds nothing, repeat with the slower name search before saying the symbol is absent.
- `llvm-dwarfdump --verify` checks that the info is well formed; `--statistics` gives coverage numbers you can compare against a baseline build.
- Before concluding a function or member is missing, follow the attributes that point to its abstract or specification entry: inlined and out-of-line code often keeps its name there.
- An old DWARF version usually means the build asked for it explicitly with a `-gdwarf-N` flag; note it as a build fact.

## Comparing and tool-driven analysis

- A missing match inside partial evidence does not prove absence. Say whether the source was complete before claiming something is not there.
- A static difference between two versions is a **candidate** for the cause of a behaviour change, not the cause. Confirm by running both.
- Matching static and runtime patterns are hypotheses until a mapping you chose in advance ties them together.
- A reconstruction passes only for the claims you listed and compared; it does not show the whole program is equivalent.
- When a tool call fails, retry once, and only if the call is safe to repeat or you know it never started. Change the input before retrying again.
- Track each unresolved question with its supporting and contradicting evidence (see `memory.md`), and name what is still needed to settle it.

## Findings format

| Field | Content |
| --- | --- |
| ID | stable identifier |
| Sample | name, size, sha256 |
| Question | what you were trying to learn |
| Finding | one sentence; observed and inferred kept apart |
| Evidence | offsets, addresses, strings, exact command, tool and version, input hash, output hash |
| Confidence | confirmed (a second person reproduced it from the record) · probable (consistent evidence, not reproduced) · hypothesis |
| Next | what would raise confidence |

## Integrity rules

- Say **confirmed**, **probable** or **hypothesis**. Never state a hypothesis as fact.
- A decompiler's output is an interpretation. Cross-check important logic against the disassembly.
- If you could not run it, say so. Don't describe runtime behaviour you only inferred.
- Never invent a symbol name as if it were original; mark names you assigned.

## Tools worth having (all free)

Ghidra · rizin/radare2 · jadx · apktool · binwalk · Frida · Wireshark · mitmproxy · QEMU · Kaitai Struct · a UART adapter and logic analyser for hardware.

## Larger companion skills

Use these for tool depth; this file keeps the scope, evidence and findings rules.

- **rea:reverse-engineer-anything** (installed, enabled; MIT) is the main companion for tool work: native, managed, Electron, firmware and browser targets; decompiling, version comparison, reconstruction. Invoke it for the tool work, then record findings in the table above. It bundles its own tools under their own licences.
- **LaurieWired/GhidraMCP** (11,883 stars, 2026-11-10): an MCP server that lets the model drive Ghidra. Not installed.
- **mitsuhiko/agent-stuff** ghidra skill (3,212 stars): headless export of decompiled C, function JSON, strings and symbols. Not installed.
- **dwarf-expert** (trailofbits/skills, licence CC-BY-SA-4.0, so its text is paraphrased here, not copied; 8,113 stars reported by the GitHub API on 2026-11-10): installed through the `dwarf-expert` plugin. Use it for DWARF questions.

Order of precedence: scope and legality here, then the companion for procedure. A companion never lowers the confidence rules.
