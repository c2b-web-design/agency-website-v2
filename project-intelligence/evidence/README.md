# Evidence

**Primary artefacts that governance entries cite as their source.** Not history, not
reference reading, not scratch. ⛔ **A file is here because deleting it would leave a
record in `project-intelligence/` with no verifiable footing.**

⚠ **Check what depends on a file before removing it.** Each entry below names the
records that rest on it. If a file's dependants are all gone, it can go; **if any
remain, deleting the file turns their claims into assertions nobody can check.**

---

## `settings-before-gsd-removal-2026-07-27.json` — 2,891 bytes

**What it is:** the user-level Claude Code settings file
(`~/.claude/settings.json`) exactly as it stood on **27 July 2026**, immediately
before the GSD toolkit was removed from the system. It contains the **nine GSD hook
registrations** that were live at that moment, with their event types and matchers.

⛔ **THIS IS THE SOLE SURVIVING COPY.**

⚠ **IT IS NOT RECONSTRUCTIBLE.** Global settings live at `~/.claude/settings.json`,
**outside this repository**, and were never version-controlled. The file is not in this
repo's history and never was — a search of all branches for its contents returns only
the commit that *describes* it. **The machine's live copy was overwritten by the removal
it documents.** If this file is deleted, the nine registrations cannot be recovered from
anywhere.

### ⛔ Two records depend on it

**1. `decisions.md` → D-037 — the nine-registration table.**
D-037 records the GSD removal and states its evidence explicitly: *"counts verified
against the backup, not recalled."* The table naming each event, matcher and script is
transcribed from this file. ⚠ **D-037 exists in the form it does because an earlier
account of those registrations was wrong in two places** — it gave the wrong count and
put two hooks under the wrong event type. This file is what corrected it.

⚠ **D-037 points back.** Its **Backup** line carries a scoped amendment, added
23 August 2026, naming this file by path, size and SHA-256, and recording which of its
counts are still verifiable. **The pointer runs both ways on purpose** — a reader
arriving at D-037 learns this folder exists, and a reader arriving here learns what
would break. ⛔ **A dependency documented in only one direction does not work:** whoever
is deleting a file is looking at the file, not at the entry that needs it.

**2. `ai-system/live-work-protocol.md` §3b — the worked example.**
⛔ **This is the load-bearing one, and it is not a file count.** §3b holds the rule
*"record in the same session that makes the change"* — Carl's instruction, 27 July 2026.
Its evidence is that the GSD removal was deferred to a later session, and the deferral
introduced errors: the handoff recorded *"8 hook registrations"* and placed two hooks
under `PreToolUse` that were actually `PostToolUse`. **Measured against this file: nine
registrations, and the event types as recorded here.**

⚠ **So this file is the evidence for a governance rule about deferral, not merely a
count.** Deleting it removes the proof underneath a rule that is still in force.

### ⛔ What can no longer be checked

**The backup this file came from was deleted on 23 August 2026 on Carl's ruling** — GSD
belonged to V1 of the website and turned out not to be the right way to go, so the
residual toolkit was removed. **266 files (2,720,154 bytes) went; this one was kept.**

⚠ **D-037's other counts were verified against that backup and can no longer be
verified against anything:**

| D-037 claim | Status now |
|---|---|
| **246** files in `get-shit-done/` | ⚠ **assertion** — the files are gone |
| **12** hook scripts (9 `.js`, 3 `.sh`) | ⚠ **assertion** — the files are gone |
| **6** skills | ⚠ **assertion** — the files are gone |
| **267** files total | ⚠ **assertion** — the folder is gone |
| **9** hook registrations | ✅ **CHECKABLE — this file** |

⛔ **They are now assertions, not verifiable claims.** They were verified once, on
27 July 2026, and that verification was repeated on 23 August 2026 before the deletion —
every count matched exactly. **But nobody can repeat it again.** Recorded here so a
future reader does not mistake an unverifiable number for a checked one.

⚠ **The nine-registration table is the one that survives, and that is why this file was
the one kept.**

### Provenance

- **27 July 2026** — captured to `C:\Users\Carl Buckley\gsd-removal-backup-2026-07-27\settings.json.before-gsd-removal` during the GSD removal (D-037).
- **23 August 2026** — the backup's other 266 files deleted on Carl's ruling. This file
  copied into the repository, verified byte-for-byte (`cmp` clean, SHA-256
  `7c3c3413671f0fe07e86a12b4feb979dd1033b7f6b9f686a4c290ec948bffa0e`), confirmed to parse
  and to hold nine registrations, **and only then** was the original deleted and the empty
  folder removed. **The old path no longer exists.**

⚠ **It was moved because its previous home was a folder named `gsd-removal-backup-2026-07-27`
holding one file.** A future cleanup reading that name would take it as residue, and
nothing at that location said otherwise. **In the repository it is on the remote, in the
diff, and beside the entries that cite it.**

---

*Folder created 23 August 2026. ⛔ Files here are cited evidence — check the dependants
named above before removing anything.*
