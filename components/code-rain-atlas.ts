/**
 * ⛔ THE CODE RAIN's CHARACTERS — ONE SOURCE FOR `/about` AND THE HERO (20 November 2026; D-101). Moved VERBATIM from
 * `components/about/player-bench.tsx` (D-088, 22 October 2026: `/about` §3's repair rain, APPROVED R-086/R-087), so the hero's
 * code drops (`components/hero/hero-code-drops.ts`) draw the same glyphs — Carl: *"Look at the logo in the /about section,
 * the logo in the video player. You have everything you need their to build the code drops."* Only `export` was added.
 *
 * The strips: [half-width katakana…, 0–9] MIRRORED (as the film's were), then c, 2, b UNMIRRORED (the last `own`), one strip
 * per colour (white, the head ice `#CFE6FF`, the light blue `#5F88C8`, the platinum `#3F6DB8`); where the device has no
 * Japanese glyphs, numerals and c 2 b alone. ⚠ Measured on `/about` (22 October): building them costs ~100–125 ms (the probe
 * and the strips) — every caller builds them in an IDLE moment, never on the frame that needs them. Browser only (`document`).
 */
export type RainAtlas = { cell: number; n: number; own: number; white: HTMLCanvasElement; head: HTMLCanvasElement; light: HTMLCanvasElement; deep: HTMLCanvasElement };
let rainAtlasCache: RainAtlas | null = null;
/** The characters, drawn once per colour into a strip: [katakana…, 0–9] mirrored, then c 2 b unmirrored (the last `own`). */
export function rainAtlas(): RainAtlas {
  if (rainAtlasCache) return rainAtlasCache;
  const cell = 48;
  const font = `${Math.round(cell * 0.86)}px "MS Gothic", "Yu Gothic", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans Mono CJK JP", monospace`;
  // does the device draw katakana? compare one against an unassigned code point (drawn as nothing, or as a box)
  const probe = (ch: string) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = cell;
    const g = cv.getContext("2d")!;
    g.font = font;
    g.fillText(ch, 4, cell * 0.8);
    return g.getImageData(0, 0, cell, cell).data.join(",");
  };
  const hasKana = probe("ﾊ") !== probe("͸");
  const kana = hasKana ? Array.from({ length: 0xff9d - 0xff66 + 1 }, (_, i) => String.fromCharCode(0xff66 + i)) : [];
  const mirrored = [...kana, ..."0123456789"];
  const own = ["c", "2", "b"];
  const strip = (colour: string) => {
    const cv = document.createElement("canvas");
    cv.width = cell * (mirrored.length + own.length);
    cv.height = cell;
    const g = cv.getContext("2d")!;
    g.font = font;
    g.fillStyle = colour;
    g.textAlign = "center";
    g.textBaseline = "middle";
    mirrored.forEach((ch, i) => {
      g.save();
      g.translate(cell * (i + 0.5), cell / 2);
      g.scale(-1, 1);
      g.fillText(ch, 0, 0);
      g.restore();
    });
    own.forEach((ch, i) => g.fillText(ch, cell * (mirrored.length + i + 0.5), cell / 2));
    return cv;
  };
  rainAtlasCache = { cell, n: mirrored.length, own: own.length, white: strip("#FFFFFF"), head: strip("#CFE6FF"), light: strip("#5F88C8"), deep: strip("#3F6DB8") };
  return rainAtlasCache;
}
