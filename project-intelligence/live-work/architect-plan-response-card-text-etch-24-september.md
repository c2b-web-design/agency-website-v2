# Architect plan response — CA's etched-glass text, 24 September 2026

> ⚠ **TRANSCRIBED BY THE BUILDER**, from the findings Carl pasted into the Builder's session on
> 24 September 2026 (`handoff-protocol.md` §2.5: if the Builder transcribes, the file must say so).
> **The Architect's own window is the authority if this copy and it ever differ.** The Builder is an
> interested party in its own review. The text below is verbatim; only the finding labels
> (S1–S9, N1–N6) are added, so the amended plan can cite them.
>
> Plan reviewed: `live-work/card-text-etch-plan-24-september.md` (the pre-amendment version).

---

Verdict: sound, but amend before approval. The plan's structure is right: CA only, off by default, one material, the existing track and the shared face geometry. There is one design flaw, and it defeats the very thing the etch is for. There are also two build blockers that would fail without any error. Everything else is tightening.

## Must fix before build

**F1. The glow is capped by the unlit opacity, so the two dials are really one.** In a transparent meshStandardMaterial, three.js writes vec4(outgoingLight, opacity × alphaMap) and blends with SRC_ALPHA. The emissive sits inside outgoingLight, so the glow is multiplied by ETCH_OPACITY too:
- At the defaults (opacity 0.35, glow depth 0.05, CA peak 6), the emissive is about 0.3 × linear navy, then × 0.35. It will probably be near-invisible.
- At etchop=0, which is the "revealed by the neon" answer, the text can never glow at all. That breaks the D-094 amendment's claim that unlit visibility is one dial and that "the material serves either answer".
- It also gets the physics wrong. Light escaping through an etch adds to the pixel; frost covers what is behind it. They need separate blend terms.
- Recommendation: a second mesh sharing faceGeometry, the same way the emitter shares rimGeometry:
  - the frost mesh stays as planned, with no emissive;
  - the glow mesh is meshBasicMaterial with AdditiveBlending, the coverage texture as alphaMap, colour = channel colour × peak × level × depth, depthWrite={false} and tone-mapped.
  - The writer sets its colour, the way it already sets the emitter's. Additive blending in encoded space is the approximation neon-bloom.tsx:54-66 already accepts and documents.
  - The single-mesh alternative needs onBeforeCompile with premultiplied alpha, and the injection point matters: tone mapping and colour-space conversion run before premultiplied_alpha_fragment. It works but is easier to get subtly wrong.
  - Either way it is a §5a choice, so put it in the structural table for the Architect.

**F2. The font gate can pass when Geist is not loaded.** document.fonts.check() returns true when no face in the set matches the family, so the check proves nothing. Replace it with:
- const faces = await document.fonts.load("400 100px Geist", body). Pass the body as the second argument so every unicode-range face the copy needs is loaded; the default is a single space. Require faces.length > 0 and every face status === "loaded".
- After setting ctx.font, read it back. Canvas silently ignores an invalid font string.
- A width check: measureText(body) in Geist must differ from the same text in sans-serif. That proves the canvas actually used Geist.
- Take the family name from getComputedStyle on an element that uses --font-geist-sans, not from a literal. The current build emits Geist / Geist Fallback (checked in .next), but next/font controls that name, not us.

**F3. The async texture needs guarding against a blank slab and a stall.** If the mesh mounts before the texture exists, a transparent white material with no alphaMap draws a 35% white panel over CA. Adding the map later also forces a shader recompile.
- Mount the text mesh only once the texture exists.
- Call gl.initTexture(tex) so the upload happens at a moment we choose.
- If fonts arrive late, the first render with the new program can land inside the ignition. That is exactly the Q5 pattern, alongside the open intermittent 1920 frame drops. Record the compile time separately from the upload in the long-task probe.

## Should fix

- **S1.** Memoise etch in the canvas. An inline etch={{ body, settings }} is a new object on every render, so a texture effect keyed on it rebuilds each time. It is the same trap the neonChannels memo note (about-card-canvas.tsx:894) records. Key the effect on primitive values: body, em, weight and the face's mm dimensions. The texture size comes from dims, which the plan doesn't list as a dependency.
- **S2.** Say where the mesh sits. "A child <mesh> … position={[0,0,faceBaseZ]}" doubles the offset if it is nested inside the face mesh. It should be a sibling in the group.
- **S3.** Define ?neon=none&etch=1. With caNeon undefined, the etch should render unlit and skip registration. State that, and include it in the probe.
- **S4.** Choose the colour target before measuring. The text renders in the tone-mapped base pass. The glow colour (#1b4789) is tuned for the bloom, which is never tone-mapped; the tube colour (#1b2f8a) was pre-shifted because ACES pushes navy toward cyan. Physically, the light escaping the etch is the tube's. At low intensity the ACES shift is small, but write down now which hue counts as correct (tube core about 211°, or glow about 215°), so the measurement can't be judged after the fact.
- **S5.** Prove the glow is visible, not just the etch. The red arm (neon=off&etch=1 must differ) proves the unlit etch renders. Add a pixel difference between etch=1&neon=full and etch=1&neon=off inside CA's text block, and require it to be non-zero and above noise. Without it, "the words respond to the track" rests on a screenshot.
- **S6.** Give every fader a range. neonNumber needs a min and max, and etchop must allow 0. The glow range needs headroom well above 0.05 (at least 1) given F1.
- **S7.** The sr-only copy is the one unflagged change, so put it to Carl explicitly.
  - "Plain /about is UNCHANGED" should read "pixel-identical; the accessibility tree gains four roles".
  - It publishes CS's present-tense "connected to the things the business actually runs on", which D-077 flags as ahead of the fact, to the public production alias.
  - Use an h3 and p per role, plus an sr-only section heading, since #roles has none.
  - When sweeping the "NOT YET WRITTEN" comment (page.tsx:792), keep its main point: the section is held empty for layout on purpose.
- **S8.** Set the lint trap aside. Calling setTexture synchronously in the effect body adds a second set-state-in-effect error. Set state only after the await.

## Smaller notes

- **N1.** Strike or defer the falloff (step 5). §14a says prove one light behaviour first. "Default 0, inert" means visually inert only: the patched program still compiles. Under F1's two-mesh route it would live on the glow mesh anyway.
- **N2.** Legibility: at 34 mm, CA's em is about 8–12.6 px at 1440, and at 0.35 opacity. Add 1:1 crops of the far edge and record a contrast reading. Also state why 34 rather than the measured maximum of 37.6.
- **N3.** Match the screenshots to the texture's DPR. The texture is sized for DPR 2, but the probe captures at DPR 1. Add a DPR 2 capture, and ask Carl to run devicePixelRatio in his console; it is still unmeasured.
- **N4.** Caption the last line. It is set left provisionally, which Carl has ruled out as a setting. Say so on the screenshots so it isn't judged as the setting. Log it for the fit chunk, along with the greedy breaks: one can leave an em dash at the start of a line, and CA's body has one.
- **N5.** Mipmap blur: at the receding edge, mips will soften the text. Anisotropy 8 is right; note it as a watch item for CB, whose face recedes more.
- **N6.** Create the scope file: live-work/chunk-scope.json does not exist yet. The plan implies it does; it has to be written before the denial test.

## What's right, and should stay

- The flag gate, which keeps D-093's identity gate valid with no harness edit.
- Sharing faceGeometry, and the orientation analysis: flipY against v = 1 at +y. Checking mirroring by screenshot, not assumption, is correct.
- Painting on opaque black with NoColorSpace, with the reasoning attached.
- The null-guarded registration, following the D-093 lesson.
- The render-order entry in §5b. Transparent objects draw after transmissive ones and stay out of the transmission target, so the claim holds.
- The loud, non-trimming fit check.
- The stop conditions.
