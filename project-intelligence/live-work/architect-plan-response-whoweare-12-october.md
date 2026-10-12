# Architect Plan Response — the `Who we are` button (plan v1, 12 October 2026)

⚠ **Transcribed by the Builder from Carl's paste of the Architect's window, 12 October 2026.** The Builder is an interested party in its own review. **The Architect's window is the authority if the two ever differ.**

## Verdict

**Approved with amendments.** *"The three-pass method is right, and both structural questions are correctly raised as questions instead of being built."*

## Amendments — must fix before approval

1. **The parity script can't reach the code it checks.** `usePillGeometry` (`nextstep-canvas.tsx:150`) is a private hook in a `"use client"` R3F file. → Read the live mesh's buffers out of `/proto/nextstep` in the browser and compare at 116.3×41. Parity is proven at that size only; at ~129 px it rests on identical logic, and the record must say so.
2. **The box rule is incomplete.** `letter-spacing: 0.025em` (`globals.css:993`) was missing; `/proto/nextstep` uses `system-ui` while the site uses Geist. → Wait for `document.fonts.ready` and check the computed font before reading the box.
3. **"Far from ~129" has no number** and 129 is itself an estimate. → Stop only if the height isn't 41.

## Recommended

4. The 4× view shows a ~2.3 px stepped edge (nx 220 at 129 px), inherited from Next step. Note it beforehand; say whether 4× is a camera zoom or a CSS scale.
5. The label colour decides the material: white on #1FB2C4 is ~2.5:1, near-black ~7.7:1. In Pass 2's scope; measure along the whole light path (`ca-text-legibility-walk.mjs`).
6. Reduced motion: a resting position for the light; `useSyncExternalStore` as `nextstep-canvas.tsx` does, not the set-state-in-effect pattern.
7. Q2: lazy loading (`next/dynamic`, `ssr: false`); a fallback before the first frame, with no WebGL and after context loss; reuse `/about`'s visibility gating; measure the mount cost (`?mounttrace=1`).
8. Capture discipline: fixed 1440×900 and DPR; `page.screenshot()`, never `toDataURL` (`nextstep-canvas.tsx:271`); say where `shot-list.md` lives.

## Corrections to the record

- `nextstep-canvas.tsx` is **not protected**; "read only" for it and `logo-bench.tsx` is behavioural. Its header reads *"PROTOTYPE. Nothing here is approved"*; D-030 approves the CSS button. Confirm the mesh's approval before calling it approved work.
- The clay "Next step" on the bench is the **family module at 116.3 px**, not Next step's code.
- The white pill is `px-7 py-3`, not the box rule (~137×44); only the letter-spacing matches (`tracking-wide`).

## Q1

Agrees: a family module; Next step keeps its copy until its redo; parity by browser readback.

## Noted

The Architect did not read `session-handoff.md` (the read was declined).

## Builder's verification and Carl's decision

Every point checked against the code and accepted (D-088, 12 October). Points 5 and 6 scoped against the record: the label colour is Carl's, now ruled (≥ 4.5:1 along the whole path); the light's resting position in Pass 3, the full reduced-motion pass with mastering (D-094). **Carl approved plan v2 and authorised Stage 1, 12 October 2026.**
