# The Architect's re-review of `structural-note-hero-bench-11-november.md` v1.1 (11 November 2026, session 1)

Pasted to the Builder by Carl. Kept as given (the findings table condensed to lines); the note's v1.3 answers it.

---

**Verdict:** v1.1 deals with all five findings from v1.0. The boundary section is now specific enough to build from, and decisions 1–3 are framed correctly: each is Carl's call, with the Builder's proposal labelled as a proposal. I found one wrong citation and three small gaps. None of them blocks sending it to Carl.

**v1.0 findings: all closed.** 1 (logo needed before it arrives): step 2 brings it in; Carl's decision 1 ✔. 2 (count workaround in two files): both named; decision 2 ✔. 3 (Home at one window shape): stated, plus how step 3 fixes it; decision 3 ✔. 4 (boundary): `createHeroScene()` return value, bench ownership and teardown order spelled out ✔. 5 (smaller points): all corrected; checked: new key `c2b-hero-bench-camera-v1` ≠ `CAMERA_KEY` (`c2b-camera-bench-camera-v2`); `hero-idea.tsx:19` correct; the four stale comments correct ✔.

**New findings**

1. Wrong citation: D-094 isn't mastering (decision 3). "Other sizes are mastering's (D-094)". D-094 is The Card Text (decisions.md:5563). Production-then-mastering is D-035 (decisions.md:777).
2. The logo's geometry doesn't come from hero-logo.tsx (step 2). hero-logo.tsx is an R3F component; its hook `useLogoGeometry` (line 75) isn't exported. The geometry is `buildLogoMarkGeometry` from `components/about/logo-mark-geometry` (imported at hero-logo.tsx:6), the module the /about page uses: a coupling. The 2 m width (`LOGO_WIDTH_CM = 200`) and the floor placement from measured bounds also live in hero-logo.tsx; step 2 rebuilds or copies them. Doesn't affect step 1.
3. HOME's orbit target has no home in the boundary. The scene returns camera "with HOME applied", but the target belongs to OrbitControls, the bench's. Fix: HOME exported as data (position, target, fov); the scene applies position and fov, the bench sets `controls.target`. Precedence: on load the remembered camera beats HOME, so after Carl's Home is written into code a reload won't show it; only the Home button will. The check "Home works" should say it's verified through the button.
4. Whose clock is it? `update(delta)` lists "the clock", but taking delta as an argument means the bench owns the Timer. The reference's Timer calls `connect(document)` (marching-bench.tsx:64), adding a document listener, disposed on unmount. Say which side owns it and put its dispose there: probably the bench, the scene keeping only `time += delta × speed × 0.5`.

Minor: the proposed import check should also fail on OrbitControls.

**Ready for Carl** once 1–4 are corrected (wording and boundary fixes, a v1.2). Nothing found changes its structure.

One correction to my own last reply: I offered to make the v1.0 corrections myself. That was outside the Architect's role (report findings, not draft the revision; ai-roles.md). The Builder's v1.1 was the right way to handle it.

---

**Builder's check (11 November 2026):** findings 2–4 and the minor point TRUE (`hero-logo.tsx:6, 33, 75`). Finding 1 HALF TRUE: D-094 is the card text and D-035 is the method, but D-094 also carries Carl's 24 September 2026 ruling deferring mobile to mastering ("ACCESSIBILITY IS DEFERRED TO MASTERING"). v1.3 cites both, each for what it holds.
