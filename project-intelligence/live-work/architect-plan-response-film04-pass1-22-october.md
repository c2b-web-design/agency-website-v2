# Architect plan responses: Film 4, PASS 1, the lettering's mesh (22 October 2026, session 2)

> ⚠ **TRANSCRIBED BY THE BUILDER** from the text Carl pasted into the Builder's chat, four rounds, verbatim. The Builder
> is an interested party in its own review: **the Architect's window is the authority if the two ever differ**
> (`handoff-protocol.md` §2.5). The plan: `live-work/film04-pass1-mesh-plan-22-october.md` (v4.1, approved by Carl:
> *"Lets proceed wqith implementation"*). v1 as reviewed: `live-work/film04-pass1-mesh-plan-v1-22-october.md`.
> v2 and v3 are not preserved as separate files; their changes are tables A to C in the approved plan.

---

## Response 1, on v1. Verdict: approve with amendments

Verdict: approve with amendments. The plan follows Carl's 22 October rulings closely (D-088, decisions.md:6372–6374): text before images, mesh then material then light, clay first, copy in the client's voice, and only new files. Two findings should be fixed in v2 before anything is built. Most of the rest is wording the plan needs to tighten.

I checked the plan against the code by reading it. I couldn't run anything from this seat, so none of the converter's behaviour on Geist has been tested.

**Must fix before build**

1. §5a is incomplete: the plan leaves out the code that already does this job.
- public/fonts/geist-semibold.typeface.json already exists. It was built on 12 October by live-work/scripts/build-geist-semibold-typeface.mjs from the same geist@1.7.2 file. The new converter would be the third, not the second.
- Extruded text is already kerned on the site. measureLabel (components/home/whoweare-button-scene.tsx:973) measures each glyph's x position from the browser's own layout of a live Geist span, so kerning and letter-spacing come from the browser. It was verified to dx 0.03 px (D-088, decisions.md:6621).
- The "rejected alternatives" list names TextGeometry and layoutCardText but not the one that already kerns.
- Kerning inside the converter is still a sound choice for a template: it needs no webfont, no DOM, and works for any font file. But the plan has to name measureLabel and say why it isn't used.
- The correction paragraph should also mention that SemiBold was checked by hand on 12 October for the label's glyphs only. D-088 records that check as "not yet shown red on a known-bad font", and this plan's red run would close that open item.

2. The bundled kerning reader can return zero without any error, and the stop conditions wouldn't catch it. From three-stdlib/libs/opentype.js:
- Extension lookups aren't read (:11734, "GPOS Lookup 9 not supported"). Fonts with large kerning tables often store their kerning this way, and those pairs come back as 0.
- No fallback to the older kern table. If the font has a GPOS table but no matching lookups, getKerningTables returns []. An empty array still counts as "found" in JavaScript (:11321), so the kern table is never tried. The plan's "both kern and GPOS" is also wrong: it reads one or the other.
- Class-based kerning can stop too early (:7123–7127). It returns the value from the first subtable that covers the left glyph, even if that value is class 0's zero, so pairs in later subtables are lost.

The only kerning stop condition is "cannot be imported". Add two more:
- Stop if the reader returns zero for known pairs (Yo, To, AV, Ty), or zero pairs in total.
- Check against an independent reference: the browser. Lay out "Your company" in a live Geist 600 span, measure it with measureLabel's range method, and compare it with the converter's kerned advances. Use the whoweare tolerance (~0.1 layout px). Comparing kern=0 with kern=1 only shows that the switch moves something, not that the result is right.

I don't know whether Geist actually stores its kerning in Extension lookups. That is unverified, and the browser comparison would settle it.

**Should be in v2**

3. Kerning units don't match. The plan stores kerning "in font units". But the converter scales each glyph's advance (ha) by 1e5/(unitsPerEm·72) and rounds it (TTFLoader.js:37,45). Store kerning in the same scale and with the same rounding, or the pairs will be wrong by a constant factor.

4. The bevel thickens the letters by default. Three draws the side walls at bevelSize + bevelOffset (ExtrudeGeometry.js:458), so with the default offset every letter grows outward. SemiBold gets heavier and kerned pairs like Y/o close up. There is already a fix in the codebase: bevelOffset = −size (whoweare-button-scene.tsx:84,137). Two further points:
- Measure the visible gap between letters as well as the gap between their advance positions.
- Look at the acute inside corner of the Y in normals and zebra modes. Three's bevel can spike at sharp corners.

5. The overlap check needs a clearer spec.
- Run it on the converted, rounded output, flattened at the bench's curveSegments, because that is what three triangulates. Don't check only the source curves.
- Allow a small tolerance for points that coincide or touch.
- Decide what happens with Latin-1 accented letters, where the accent can legitimately touch the base letter. Should that fail the whole font, or drop the glyph and report it? That is Carl's call.
- The red run will name more than 10 glyphs once the subset is all of ASCII plus Latin-1. Its pass condition should be that h n a u r p m H B F are all among the glyphs it names, not exactly 10.

**Minor**

6. Bad URL input on a link clients can be sent. If ?words= contains a character outside the subset, three silently draws "?" and logs an error. Report missing glyphs in stats and on the bench. Limit ?font= to the names in public/fonts/showcase/.
7. "One ExtrudeGeometry" from per-character shapes. Three's Shape has no translate method. Say whether the shapes' points are offset, or each glyph is built separately and merged. This affects the triangle and timing stats, and whether tightly kerned, bevelled letters can intersect.
8. Size versus fit. The spec has sizePx, but the front view fits the words to about 70% of the window, so it's unclear which wins. With depth and bevel in px, a client's size change also changes the edge proportions. For interchangeable parts, consider setting depth and bevel as fractions of the em.
9. The client link.
   - The per-page noindex is correct. It is also the only protection that will survive launch, because robots.ts and the robots setting in layout.tsx are both marked REMOVE BEFORE LAUNCH. Record that /proto must stay disallowed at launch.
   - Sending the link means the first outside eyes on the deployment. That conflicts with Carl's 28 July position (robots.ts:11) that no one sees the site until it is finished. He has since ruled that send-ability is useful, so this is for him to reconcile. It doesn't block pass 1, because nothing gets sent.
10. three-stdlib isn't a direct dependency. It comes in through drei and isn't in package.json. Its package exports allow only ".", so the file-path import works but is fragile. There's precedent for it, so one line in the plan is enough.

**What's right**

- No existing file is modified.
- The structure of the two-viewport canvas is explicitly deferred to its own note.
- The check has to be seen to fail once before it counts.
- Stop conditions are present, and capture starts from the first frame.
- ShapeLight is local to corner-bench.tsx, so "follow" here means a copy. The plan should say so.

These findings are for Carl, who decides.

---

## Response 2, on v2. Verdict: approve once three of the verification checks are corrected

Verdict: approve once three of the verification checks are corrected. v2 takes up all ten findings from v1, and the approach is now right. Laying the words out with the browser and taking only outlines from the existing font file removes the weakest part of v1 entirely. Importing measureLabel instead of copying it is also correct: a copy would be a second way of taking the same measurement, which §5a warns against.

What's left is mostly about whether the checks measure what they claim. As before, I read the code and ran nothing.

**Fix before approval**

1. The font checks wouldn't catch a fallback font.
- document.fonts.check can return true for a font that isn't there. It reports true when nothing matching is waiting to load, including a family name that doesn't exist at all. Use the result of document.fonts.load() instead: it must contain at least one face, with status loaded.
- The family name may not be "Geist". The site loads Geist through next/font/google (app/layout.tsx:2), which typically gives the family a generated name. Take the name from the span's computed style; measureLabel already returns it as font.
- ±0.15 em per pair is too loose to detect anything. At display size that is tens of pixels, larger than any real kerning value. A fallback font with similar widths would pass, which leaves the single right-edge check doing all the work, on one glyph.
- Use a second measurement instead. Lay out the same string in a second hidden span with font-kerning: none. Each gap there must equal the JSON advance to within about 0.1 layout px (the whoweare label reached 0.03). That proves the webfont and the outline file are the same font. The kerning is then the kern-on gap minus the kern-off gap, read directly, with the JSON not involved.

2. How the measuring span is hidden.
- Don't use Tailwind's sr-only. It makes the span's box 1 px wide, so the right-edge check would compare against the wrong edge. Make the span absolutely positioned, shrink-wrapped and opacity: 0.
- opacity: 0 also keeps the words readable by screen readers. The canvas has no text, and D-088 (decisions.md:6621) records that the baked-text accessibility defect (D-051-A11Y) "must not repeat". visibility: hidden would remove the words from screen readers too.
- The baseline mark has to come after the text. measureLabel requires the span's first child to be the text node (whoweare-button-scene.tsx:969). Both existing callers place the mark after the text; the plan only says it sits "inside" the span.

3. The bevel check as worded would fail on a correct build. With bevelOffset = −bevelSize, the side walls sit on the true outline but the front face is set in by bevelSize. A gap measured from "face-edge" x would therefore widen by about 2 × bevelSize, roughly 7 px at display size. The check has to measure the silhouette: each glyph's bounding box over all its vertices, taken before the glyphs are merged.

**Small text changes**

4. Ligatures and alternate glyphs. The browser may replace letter pairs with a ligature, or swap in alternate glyphs, which the per-character extrusion would never draw. Character ranges then collapse onto each other. "Your company" isn't affected, but a template takes any words, so set font-variant-ligatures: none on the measuring spans. I haven't checked whether Geist has alternate glyphs.

5. The cross-check compares two different font files. The browser uses Google's variable Geist; opentype.js would read Vercel's static TTF. A disagreement between them could come from the files, not from opentype.js's gap, so read the results that way.

This is also the template's normal case, not an exception: the webfont and the clean outline file come from different releases. That is why check 1 has to hold. The phrase "the site's own webfont, so the browser's spacing is real" needs this caveat.

6. Import cost. A plain import of measureLabel pulls the whole module behind whoweare-button-scene.tsx into the showcase page, including the button geometry, the logo studio and RectAreaLightUniformsLib. The home button loads it with a dynamic import instead (whoweare-button.tsx:179). Do the same, or accept the cost for a /proto page and say so.

**What holds**

- Per-character TextGeometry placed at the browser's x positions and merged, following the existing label's method.
- Depth and bevel set as fractions of the em, with the camera framing the words instead of rescaling them.
- The overlap check runs on the rounded JSON outlines and must be seen to fail on a known-bad font.
- Stop conditions on zero kerned pairs and on a failed font check.
- The launch note about keeping /proto out of search, and the 28 July question correctly put to Carl.

These findings are for Carl to route. Fixing 1–3 are wording changes to the plan, not a redesign.

---

## Response 3, on v3. Verdict: approve, with one amendment before build

Verdict: approve, with one amendment before build. v3 takes up all six v2 findings correctly. The way it now proves the font, with a kern-off span and kerning read as the difference between the two spans, is sound. I found one new defect, which comes from the hiding method v3 introduced, and a few small precision points. As before, I read the code and ran nothing.

**Fix before build**

1. At display size, the measuring spans will wrap onto two lines.
- An absolutely positioned, shrink-wrapped box only shrinks down to the width available to it. "Your company" at about 180 px is roughly 1,000 px wide, wider than the bench's padded column at many window widths, so the text wraps.
- measureLabel would then return x positions from two lines, with x starting again on the second line, and the baseline would come from the second line only. The geometry and every check would be built on wrong numbers, with no error.
- An opacity: 0 box that is 1,000 px wide still counts for page overflow, so it would also cause horizontal scrolling at narrower widths, including phone width.
- Fix: add white-space: nowrap (or width: max-content) to both spans, and put them in a wrapper with overflow: clip. Clipping doesn't change how the text is laid out, so the Range readings are unaffected, and the kern-on span stays readable by screen readers.

**Small points (can go into v3 as text, or be handled during build)**

2. A loaded face can come from the fallback font.
- The computed family is a list. next/font usually adds a "Fallback" family, declared as an @font-face built from the local Arial with adjusted metrics. Passing the whole list to fonts.load() can return that face as loaded even when Geist has failed.
- Pass only the first family, and check that the returned face's family matches it.
- The kern-off advance check would still catch a fallback, because adjusted Arial won't match Geist glyph by glyph. So this tightens what the assertion claims rather than closing a hole. I haven't checked the generated names under Next 16.

3. The 0.1 px tolerance has no evidence behind it yet.
- The whoweare label's dx 0.03 compared the 3D letters with DOM text placed at the browser's own x positions. That shows the placement is accurate, not that the webfont's advances match the JSON's.
- Treat the first kern-off reading as a calibration: if it fails by small, uniform amounts, report that rather than counting it as a fallback. The stop is already "stop and report", so the cost is only how the result is read.
- For the right edge, use a Range over the whole text rather than measureLabel's w. That w is rounded to 0.1 (whoweare-button-scene.tsx:997), which uses up half the tolerance on its own.

4. Depth compensation. Three adds the bevel's thickness at both the front and the back, so the straight depth has to be shortened by 2 × thicknessEm to keep the total. The existing label does exactly this (whoweare-button-scene.tsx:132–137: depth − bevel, with thickness bevel/2). The plan's "shortened by the bevel's thickness" reads as once. Also keep the precedent's lower limit (Math.max(0.01, …)).

5. Capture folder. "02 Plan and review" should now list v1, response 1, v2, response 2 and v3.

**What holds**

- The font proof: the kern-off span compared against the JSON advances, and kerning read without the JSON.
- fonts.load() used instead of fonts.check().
- Hiding with opacity: 0, which keeps the words readable by screen readers, the baseline mark placed after the text, and the ligature switch-off.
- The bevel gap measured on each glyph's silhouette before the merge. With bevelOffset = −size the side walls sit on the outline, so "unchanged within 0.5 px" is the right expectation.
- The dynamic import, the coupling stated, and the cross-check's caveat about two different files.

Once 1 is in, this is ready for Carl's approval. 2–5 don't need another review round.

---

## Response 4, on v4. Verdict: ready for Carl's approval

Verdict: ready for Carl's approval. v4 takes up all five v3 points correctly: the spans set on one line, the face from the first family only, the right edge from a whole-text Range with the first reading treated as calibration, the depth formula doubled to match the existing label, and the capture folder's list. I found nothing new that needs another review round.

Two small notes for the Builder at build time. Neither changes the plan:

1. The clipping wrapper must be positioned. overflow: clip only clips absolutely positioned children if the wrapper is their containing block. Give the wrapper position: relative. Otherwise the clip does nothing and the page still scrolls sideways at narrow widths.
2. Strip quotes before comparing family names. The computed fontFamily and a FontFace's family can differ only by quotation marks ("__Geist_x" against __Geist_x). Compare them without quotes, or the check stops on a correct font. That would be harmless, since the response is "stop and report", but it would be a false stop.

One wording fix: the status line still says "Both Architect responses". There are now three, as section 4 already lists.

Nothing else is outstanding. This version is for Carl to approve.

---

## Closing note (Carl pasted it with his approval), on v4.1. ⚠ SUMMARISED by the Builder, not verbatim, except the quoted line

Verdict: ready for Carl's approval. No further review round is needed. All three items from the v4 response are in. Two bookkeeping leftovers (the title's version number; table C's "three responses" and no table D) — both applied by the Builder in v4.1. *"I found nothing else in the plan's substance. It is Carl's to approve."*
