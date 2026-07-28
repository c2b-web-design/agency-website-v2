// Render the contact field across the DISPLAY RANGE this site is actually
// viewed on, and report how the gold reads at each.
//
//   node verify/field-displays.mjs
//
// Carl views this site on a phone, a 27" desktop monitor, and a 65" 4K HDR TV
// (browser on the TV itself, and via a Formuler 4K Android box). A value that
// reads correct on one can read flat or harsh on another, so a single 1440
// capture is not evidence about the others.
//
// WHAT THIS CANNOT ANSWER: HDR. Headless Chromium renders sRGB. Whether the TV
// pushes this gold into high dynamic range depends on the display and the page
// opting in, and no script here reproduces that. The TV needs Carl's eyes.
//
// Device pixel ratio is varied as well as width, because the bevel is only 38
// CSS pixels tall. Its tubular falloff — crown, flanks, shadow side — has to be
// expressed in that space, so DPR is what controls whether the roundness
// survives, not screen size.
//
// Requires the dev server (npm run dev).

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(
  process.cwd(),
  "project-intelligence",
  "live-work",
  "screenshots",
);

// width x height, deviceScaleFactor, and what it stands in for.
const DISPLAYS = [
  { name: "phone", w: 390, h: 844, dpr: 3, note: "modern phone, 3x" },
  { name: "tablet", w: 900, h: 1200, dpr: 2, note: "tablet / small laptop" },
  { name: "desktop-27", w: 2560, h: 1440, dpr: 1, note: "27in 1440p, Carl's PC" },
  { name: "tv-4k", w: 3840, h: 2160, dpr: 1, note: "65in 4K TV browser" },
  { name: "tv-4k-2x", w: 1920, h: 1080, dpr: 2, note: "4K TV reporting 2x DPR" },
];

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();

console.log("\nContact field gold — across display targets\n");
// Luminance sampled from brand-assets/logo/c2b-logo-gold-hero-transparent.png.
console.log("  logo reference: body luminance 125, champagne 195\n");

for (const d of DISPLAYS) {
  const page = await browser.newPage({
    viewport: { width: d.w, height: d.h },
    deviceScaleFactor: d.dpr,
  });

  try {
    await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('.enquiry-begin-hit[tabindex="0"]', { timeout: 20000 });
    await page.click(".enquiry-begin-hit");

    for (let q = 0; q < 5; q += 1) {
      const card = page.locator(".enquiry-card").first();
      await card.waitFor({ state: "visible", timeout: 10000 });
      await card.click();
      await page.waitForTimeout(250);
      const next = page.getByRole("button", { name: /next step|send/i }).first();
      await next.waitFor({ state: "visible", timeout: 10000 });
      await next.click();
      await page.waitForTimeout(q === 4 ? 100 : 1100);
    }

    await page.waitForTimeout(5200); // past the 3600+700ms entrance

    const file = path.join(OUT_DIR, `field-display-${d.name}.png`);
    await page.locator(".enquiry-contact-layer").screenshot({ path: file });

    const { data } = await sharp(file)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const px = [];
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 200) continue;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lum < 40 || r - b < 12) continue;
      px.push({ r, g, b, lum });
    }

    if (!px.length) {
      console.log(`  ${d.name.padEnd(12)} — no lit metal found`);
      await page.close();
      continue;
    }

    px.sort((a, b) => a.lum - b.lum);
    const mid = px.slice(Math.floor(px.length * 0.4), Math.floor(px.length * 0.6));
    const avg = (k) => Math.round(mid.reduce((s, p) => s + p[k], 0) / mid.length);
    const [r, g, b] = [avg("r"), avg("g"), avg("b")];
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    const midLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Tubular falloff: the spread between the darkest and brightest lit pixels.
    // A tube should show a range; a flat band will not.
    const lo = px[Math.floor(px.length * 0.1)].lum;
    const hi = px[Math.floor(px.length * 0.9)].lum;

    console.log(
      `  ${d.name.padEnd(12)} ${String(d.w).padStart(4)}x${String(d.h).padEnd(4)} @${d.dpr}x  ` +
        `${hex}  lum ${midLum.toFixed(0).padStart(3)}  ` +
        `falloff ${(hi - lo).toFixed(0).padStart(3)} (${lo.toFixed(0)}–${hi.toFixed(0)})  ` +
        `${px.length} px`,
    );
  } catch (err) {
    console.log(`  ${d.name.padEnd(12)} — FAILED: ${err.message.split("\n")[0]}`);
  }

  await page.close();
}

console.log(
  "\n  FALLOFF is the tubular read: the luminance spread across the bevel.\n" +
    "  A low spread means the band is rendering flat rather than round.\n" +
    "\n  ⚠ HDR is NOT tested here — headless Chromium is sRGB. The 65in TV\n" +
    "  needs Carl's eyes, not this script.\n",
);

await browser.close();
