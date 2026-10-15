# The hero's film — the numbers for Fusion (15 October 2026, session 3)

**For:** Carl, making the 10 s film in DaVinci Resolve's Fusion. **Decision:** D-098 (`decisions.md`).
**Status:** PRELIMINARY — measured from TODAY's hero layout. Re-measure if the hero text changes.

## What the film must do (Carl)

- It fills the WHOLE HERO; the text sits over it (*"the text will cover the video scene"*). The scene is not decided.
- The logo starts SMALL, travels FORWARD, GROWING; it STOPS just before it bursts forth; the WIPE happens IN THE FILM.
- It ends on the RIGHT, in the hero's empty space. The last frame is HELD — the code logo is laid over it there and the
  film's logo disappears.

## The numbers

| | Value | Why |
|---|---|---|
| **Canvas** | **3840 × 1920 (2:1)**, 30 fps constant, **300 frames** | 3840 is sharp on 4K. 2:1 is the narrowest hero shape in normal use, so a wider window crops the TOP AND BOTTOM — never the right side, where the logo is. |
| **Safe band (wide windows)** | **x 0–3840, y 240–1680** | The widest hero (Carl's composed window, 1397 × 527 = 2.65:1) crops 12.5% top and bottom. |
| **Safe band (narrow windows)** | **x 190–3650** | A rare taller window (≈1.8:1) crops ~5% each side. Keep the logo's WHOLE PATH inside both bands. |
| **The right-side space** | **x 2097–3593**, the full safe height | Today's empty space — the text column's right edge (design x 763) to the content edge (1307) — in film pixels. |
| **The logo's end — centre** | **x 2845, y 960** | The middle of the space, level with the text block's centre. Stays put at every window width: the crop only trims top and bottom. |
| **The logo's end — size** | **≤ ~1050 px wide** (~600 tall for the c2b mark, aspect ≈ 1.75) | ~70% of the space's width. **The exact size is Carl's**; the code logo is built to land on it. |
| **Last frame** | **HELD, the logo still** | The swap happens there. |
| **Delivery** | H.264 MP4, muted, autoplay; a still of the first frame for the cold load | The site's cold-load rule (approval includes the cold load). |

## Measured (Playwright, 15 October 2026)

| | design px (1412 × 608) | Carl's screen (1920 × 952, zoom 1.36) |
|---|---|---|
| hero section | 1397 × 527, top y 81 | 1905 × 842 |
| text column (h1, p, CTA) | x 90.5–762.5 | x 125.6–1039.5 |
| content box | x 90.5–1306.5 | x 125.6–1779.4 |
| **right-side space** | **x 762.5–1306.5 (544 × 527)** | **740 × 717** |

Hero shape by window (page area minus the header): 1412 × 608 → 2.65 · 1920 × 952 → 2.26 · 1440 × ~790 → ~2.0 ·
2560 × ~1300 → ~2.2. ⚠ Phones are the mastering pass's (D-094).

## The mapping (so the numbers can be recomputed)

The film is `object-fit: cover` over the hero. For a hero of aspect A ≥ 2 the film is scaled to the hero's WIDTH; a point
at hero fraction (fx, fy) is at film fraction **(fx, 0.5 + (fy − 0.5) · 2 / A)**. The logo's centre at fy = 0.5 is
therefore at the film's vertical centre at EVERY width. ⛔ At the swap the page MEASURES the film's rendered box and places
the code logo from it — registration measured at runtime, never fixed by hand.

## ⚠ Conditions

- Today's hero text sets the right-side space. **Settle the text column before rendering the final cut.**
- The logo's END POSE and its material at the last frame must match the code logo. ⚠ Easier exactly if the film's last
  logo frame is RENDERED FROM the 3D model (the desk mark's, traced from the gold target) — the master question, Carl's.
