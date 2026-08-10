# C2B Logo Assets

Salvaged 24 July 2026 from an external AI image tool's storage before that tool was
removed from the system. These are C2B property.

Verified byte-for-byte identical to the originals at time of copy (`cmp`, 14/14).

⚠ **The source no longer exists** — it was destroyed on 25 July 2026, which is why the
salvage happened. **The copies in this folder are the originals now.** There is nothing
to re-export from and no path to re-check them against; treat this folder as the sole
source of truth for these assets.

**One file here is not from that salvage** — `c2b-flat-white-alpha-cleaned-1x.png`,
added 27 July 2026. Its provenance is recorded with it below.

## Contents

- `c2b-logo-gold-hero.svg` — ⚠⚠ **NOT VECTOR. IT IS A PNG IN AN SVG WRAPPER.**

  **Corrected 11 August 2026.** This line read *"vector master; the most reusable asset here"*,
  and that is false. The file contains **zero `<path>` elements** and one base64-encoded raster.
  Its own `<desc>` says so: *"This SVG embeds a raster PNG to retain the metallic 3D finish."*
  The 1.2 MB filesize is the tell — a real vector of this mark would be a few KB.

  **So it scales exactly as badly as the PNG**, cannot be recoloured with `fill`, and gains
  nothing but the extension. ⚠ **Do not reach for it expecting vector behaviour**, and do not
  treat "we already have an SVG" as meaning the vector question is settled. **It is not.**

  **There is no true vector form of the logo in this repo.** Producing one means redrawing the
  mark as curves — from the flat white silhouette below, which exists for exactly that purpose
  (*"a trace source for vector work"*).
- `c2b-logo-gold-hero-transparent.png` — transparent-background raster.
- `c2b-logo-gold-hero-checker-preview.png` — transparency preview (checkerboard).
- `Logo2.1.png`, `Logo 2.2.png`, `Logo2.3.png` — iteration versions.
- `LogoLOTR.png` — the distressed/antique direction, explicitly REJECTED for the
  brand (see `project-intelligence/decisions.md` on the gold material direction);
  retained for the record only.
- `ig_*.png` (7) — original generation outputs, retained as source material.

## Note

Filenames and dates are preserved as found. Nothing here has been re-encoded,
resized or optimised — these are the originals.

## Flat white mark — added 27 July 2026

- `c2b-flat-white-alpha-cleaned-1x.png` — the mark as a **pure white silhouette on
  transparency**. 1301 × 768, 32-bit ARGB, 11 KB.

  **Different in kind from everything above.** The other assets are gold, teal or chrome
  *renders*; this is the bare form. Useful as a mask, a stencil, a trace source for vector
  work, or the mark on a dark background.

  **"Alpha cleaned" is literal and verified:** 68.4% fully transparent, 31.6% fully opaque,
  and **zero partial-alpha pixels** — no semi-transparent fringe anywhere. Hard edges only.
  That is what makes it usable as a mask; an anti-aliased version would not be.

  Note that it appears **blank in most image viewers**, which composite white onto white.
  It is not empty. View it against a dark background.

  **Provenance:** not from the salvage above. It was found loose in
  `OneDrive/Pictures/Camera Roll/` on 27 July 2026 and copied here — verified byte-identical
  (`md5`) — because it existed in exactly one place and Pictures is being cleared of C2B
  material. Origin and date of creation unknown; file dated 23 June 2026. Filename kept as
  found, since it describes the asset accurately.

## Motion

- `c2b-logo-specular-sweep-4s.mp4` — 4-second clip, ~1.1 MB. A slow, elegant specular
  highlight travelling left→right across the full surface. Generated 24 July 2026
  (Runway Gen-4 Turbo) from the prompt preserved in the original filename.

  **Reference only.** This is a *motion study* for how light should read as it crosses
  the mark — directly relevant to the hero gold ⇄ blue-platinum transition
  (see `transition/`), where the same principle applies: light travels across a fixed
  object rather than the object changing colour. Not a production asset; the hero
  implementation route remains Three.js on the vector master.
