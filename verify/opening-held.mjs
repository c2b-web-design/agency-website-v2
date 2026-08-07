/**
 * Is the opening's text HELD (clipped, invisible) before the reveal, or is it
 * briefly showing?
 *
 * ⚠ THIS IS A KNOWN FAILURE MODE OF THIS EXACT GATE, NOT A HYPOTHETICAL. The
 * first version of Step 4 returned `undefined` for the mask class instead of
 * `.enquiry-opening-held`, and because these masks' BASE state is unmasked,
 * fully-visible text — the animation's END state — the opening showed all of its
 * text at once, held it ~2s, then wiped it in from the left.
 *
 * ⚠ AND EVERY TIMING MEASUREMENT WAS CORRECT WHILE THAT WAS HAPPENING. The arm
 * fired on the compile 3/3, card 1 sat at the midpoint, the gate did exactly
 * what it was asked. **A measurement of WHEN something starts says nothing about
 * WHAT IS ON SCREEN before it does.** Only a screenshot found it.
 *
 * So this samples the held window at several widths and reports the text's
 * computed clip and opacity — the two properties that decide whether it is
 * invisible — plus a frame to look at.
 *
 *   node verify/opening-held.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
mkdirSync("verify/out/held", { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });

for (const width of [1440, 1279, 1024]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  // Sample DURING the held window: after paint, before the ready gate arms.
  await page.goto(`${BASE}/start`, { waitUntil: "commit" });
  await page.waitForTimeout(120);

  const r = await page.evaluate(() => {
    // ⚠ ONLY THE MASKED ELEMENTS. The heading's parent <h1> carries no mask of
    // its own — it is a plain container whose CHILDREN are the two masked lines
    // — so including it reported a permanent false "VISIBLE" while the actual
    // reveal was held correctly. A check that always fails teaches you to ignore
    // it, which is worse than not having it.
    const nodes = [...document.querySelectorAll("[class*='enquiry-opening-held'], [class*='mask']")]
      .filter((n) => n.textContent && n.textContent.trim().length > 12)
      .slice(0, 4);
    return nodes.map((n) => {
      const s = getComputedStyle(n);
      return {
        cls: n.className.toString().slice(0, 60),
        clip: s.clipPath,
        opacity: s.opacity,
        text: n.textContent.trim().slice(0, 34),
      };
    });
  });

  console.log(`\n── ${width}px, sampled at ~120ms (inside the held window) ──`);
  if (!r.length) console.log("  no text nodes matched.");
  for (const n of r) {
    // Held correctly = fully clipped OR zero opacity. Visible text here is the
    // regression this script exists to catch.
    const hidden = n.opacity === "0" || /inset\(0(px)? 100%/.test(n.clip);
    console.log(`  ${hidden ? "✅ held" : "⚠ VISIBLE"}  opacity=${n.opacity}  clip=${n.clip.slice(0, 30)}  "${n.text}"`);
  }
  // Best-effort: the page is mid-navigation here by design, and Chrome will
  // occasionally refuse a capture in that window. The computed-style read above
  // is the actual assertion; the frame is a convenience for the eye.
  try {
    await page.screenshot({ path: `verify/out/held/held-${width}.png` });
  } catch {
    console.log("  (screenshot unavailable this run — the style check above stands)");
  }
  await page.close();
}
await browser.close();
console.log("\n  frames: verify/out/held/");
console.log("  ⚠ Verification is not approval.");
