// Diagnostic: does a lit card put light on its NEIGHBOURS, and on its own far end?
//
//   node verify/card-spill.mjs
//
// THE DESIGN INTENT. Carl: the five cards are ONE WORLD, not five widgets.
// "If these cards are selected what would happen to cards 4+5?... i would expect
// the inside of cards 4+5 to receive some light. Not as much as its own filament
// would affect it."
//
// WHAT STEP 1 CHANGED, and why this script exists. `FILAMENT_LIGHT_DISTANCE` was
// 90. Three's `distance` is a Frostbite WINDOW multiplying an already-complete
// inverse-square falloff (`lights_pars_begin.glsl.js:56-70`) — so a receiver at
// or beyond the cutoff gets EXACTLY ZERO, not "a little".
//
// ⚠ CARD_WIDTH_PX IS 186.66, SO A CARD'S HALF-WIDTH IS 93.3 AND THE CUTOFF WAS
// 90. The outer third of every lit card's OWN face received no light from its
// own filament, and a same-row neighbour at ~102px received none at all.
//
// So this measures two different claims, and they fail differently:
//   OWN FAR END  — did the card's own face gain light at its edges?
//   NEIGHBOUR    — did an UNLIT card gain light from a lit one?
//
// ⚠ THE CONTROL IS THE POINT. A backdrop rect far from every card must NOT
// change. If it moves too, the exposure or tone mapping shifted between
// screenshots and every number here is worthless. This project has twice
// retired a hypothesis on a test that could not fail; a differential without a
// control is that same mistake.
//
// ⚠ HEADED, WITH --enable-gpu. Headless Playwright substitutes SwiftShader,
// which renders transmission, PMREM and specular differently — it invalidated a
// whole investigation on 4 August.
//
// Requires the dev server (npm run dev).

import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

// ⚠ RE-READ FROM SOURCE, NOT COPIED. A harness holding its own stale copy of a
// constant is how `q5-stutter.mjs` reported 0/3 CLEAN on a visible defect.
const glassSrc = readFileSync("components/enquiry/answer-card-glass.ts", "utf8");
const cutoff = Number(/FILAMENT_LIGHT_DISTANCE = (\d+)/.exec(glassSrc)?.[1]);
if (!Number.isFinite(cutoff)) {
  console.error("Could not read FILAMENT_LIGHT_DISTANCE from source — has it been renamed?");
  process.exit(1);
}
console.log(`FILAMENT_LIGHT_DISTANCE read from source: ${cutoff}`);
if (cutoff <= 95) {
  console.log("⚠ Cutoff is at or below a card's own half-width (93.3px) — expect own-far-end ZERO.");
}

const profile = mkdtempSync(join(tmpdir(), "card-spill-"));
const context = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

try {
  const page = await context.newPage();
  const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
  if (!res || !res.ok()) {
    console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running?`);
    process.exit(1);
  }

  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  console.log(`Renderer: ${renderer}`);
  if (/swiftshader|llvmpipe|software/i.test(renderer)) {
    console.error("⚠ ABORTING — software rasteriser, not the GPU.");
    process.exit(1);
  }

  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
      return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
    },
    { timeout: 30000 },
  );
  await begin.click();

  // Let the full six-beat entrance finish so every card is drawn and settled.
  await page.waitForSelector('[data-testid="answer-card-proto"]', { timeout: 30000, state: "attached" });
  await page.waitForTimeout(9000);

  const canvas = await page.locator('[data-testid="answer-card-proto"] canvas').first();
  const box = await canvas.boundingBox();
  if (!box) {
    console.error("Could not locate the card canvas.");
    process.exit(1);
  }

  // The canvas maps one world unit to one CSS pixel from its measured size, and
  // CARD_BOXES is in that same space (576x104). Sample rects are expressed as
  // fractions of the canvas so a resize cannot silently move them.
  const W = box.width, H = box.height;
  const pt = (gx, gy) => ({ x: Math.round(box.x + (gx / 576) * W), y: Math.round(box.y + (gy / 104) * H) });

  // Sample points, all in grid space:
  //   card 1 spans x 0-186.66, y 0-48      → own far end is its RIGHT edge
  //   card 4 spans x 97.33-284, y 56-104   → its TOP edge faces card 1/2
  //   card 3 spans x 389.33-576, y 0-48    → same row as card 1, ~102px away
  // ⚠ ONLY CARD 1 IS LIT IN THIS RUN, AND THAT IS THE WHOLE DESIGN OF THE TEST.
  // An earlier version lit cards 1, 2 and 3 — Carl's own example — and then
  // sampled card 3, which is LIT. Its +52.8 warm reading was its own filament,
  // not spill, and it would have been reported as proof of "one world".
  //
  // To measure spill, every sampled neighbour must be UNLIT. Cards 2-5 stay dark.
  const SAMPLES = {
    // ⚠ THE POSITIVE CONTROL, AND IT MUST MOVE. Card 1's own top rim is where
    // its filament sits. If THIS does not brighten, the cards never lit and every
    // other row is measuring two identical screenshots — the exact failure the
    // first version of this script produced and nearly reported as "no spill".
    "POSITIVE card 1 own rim (lit)": pt(93, 6),
    "card 1 own far end (lit)": pt(178, 24),
    // The unlit neighbours, nearest first. Card 4's top-left corner is ~33px
    // from card 1's centre — the closest any two cards come.
    "card 4 top-left (UNLIT, ~33px)": pt(105, 58),
    "card 4 centre (UNLIT)": pt(190, 80),
    "card 2 left edge (UNLIT, ~102px)": pt(200, 24),
    "card 5 centre (UNLIT, far)": pt(385, 80),
    // ⚠ THE NEGATIVE CONTROL, AND IT MUST NOT MOVE. Chosen far from every card
    // AND away from the Next step button, which has its own CSS hover/selected
    // states and would otherwise be read as spill.
    "CONTROL backdrop far corner": pt(568, 100),
  };

  const sample = async () => {
    const shot = await page.screenshot();
    // Decode in the browser — no native image deps.
    const b64 = shot.toString("base64");
    return await page.evaluate(
      async ({ b64, samples }) => {
        const img = new Image();
        await new Promise((r) => { img.onload = r; img.src = "data:image/png;base64," + b64; });
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const out = {};
        for (const [name, p] of Object.entries(samples)) {
          // 9x9 mean — one pixel is noise, especially on a specular surface.
          const d = ctx.getImageData(p.x - 4, p.y - 4, 9, 9).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
          out[name] = { r: r / n, g: g / n, b: b / n };
        }
        return out;
      },
      { b64, samples: SAMPLES },
    );
  };

  const before = await sample();

  // ⚠ LIGHT THE CARDS VIA THEIR HIT TARGETS, NOT BY CLICKING THE CANVAS. The
  // canvas is `pointerEvents: none` by design (hover is detected in the DOM, not
  // by raycasting), so mouse clicks at canvas coordinates land on nothing at
  // all. A first version of this script did exactly that and reported three
  // sample points at EXACTLY 0.0 delta — which is not a physical result but the
  // signature of two identical screenshots.
  //
  // ⚠ AND THE ONE NON-ZERO ROW IT DID PRODUCE WAS THE TRAP: a warm reading on
  // "card 3" that was really the Next step button's own CSS state, the only
  // clickable thing near where the stray clicks landed. A harness that clicks
  // nothing and still prints a warm number is worse than one that errors.
  //
  // The targets are `pointerdown`, not `click` — Carl specified the mouse BUTTON
  // as the trigger, so `click` (which fires on release) is the wrong event here.
  await page.locator('[data-testid="answer-card-hover-0"]').dispatchEvent("pointerdown");
  // Let the heat ramp settle (FILAMENT_HEAT_MS plus headroom).
  await page.waitForTimeout(3500);


  const after = await sample();

  console.log(`\n${"═".repeat(72)}`);
  console.log("SPILL — CARD 1 ONLY lit. Every other card is UNLIT. 9x9 mean RGB.");
  console.log(`${"═".repeat(72)}`);

  let controlMoved = false;
  let positiveMoved = false;
  for (const name of Object.keys(SAMPLES)) {
    const a = before[name], b = after[name];
    const dR = b.r - a.r, dG = b.g - a.g, dB = b.b - a.b;
    const lum = 0.2126 * dR + 0.7152 * dG + 0.0722 * dB;
    const warm = dR - dB;
    const isControl = name.startsWith("CONTROL");
    if (isControl && Math.abs(lum) > 1.5) controlMoved = true;
    if (name.startsWith("POSITIVE") && warm > 3) positiveMoved = true;
    console.log(
      `  ${name.padEnd(34)} ΔR ${dR.toFixed(1).padStart(6)}  ΔG ${dG.toFixed(1).padStart(6)}` +
      `  ΔB ${dB.toFixed(1).padStart(6)}  Δlum ${lum.toFixed(1).padStart(6)}  warm(R-B) ${warm.toFixed(1).padStart(6)}`,
    );
  }

  console.log(`\n${"─".repeat(66)}`);
  if (!positiveMoved) {
    console.log(
      "⚠ THE POSITIVE CONTROL DID NOT MOVE. Card 1's own rim did not warm, so the\n" +
      "  cards never lit and this run measured two identical screenshots. Every\n" +
      "  other row is meaningless — including any that look like a result.\n" +
      "  Check the hit targets (`answer-card-hover-N`) and the pointerdown event\n" +
      "  before reading anything below.",
    );
  } else if (controlMoved) {
    console.log(
      "⚠ THE CONTROL MOVED. The backdrop far from every card changed brightness,\n" +
      "  so exposure or tone mapping shifted between the two screenshots and NONE\n" +
      "  of the numbers above can be attributed to spill. Fix this before reading\n" +
      "  any other row.",
    );
  } else {
    console.log(
      "Control held: the far backdrop did not move, so the deltas above are the\n" +
      "cards' own lighting and not a global exposure shift.",
    );
  }
  console.log(
    "\n  A POSITIVE warm(R-B) on an UNLIT card is the 'one world' claim: it is\n" +
    "  receiving amber from a neighbour. Zero there means the cards are still\n" +
    "  independent widgets.\n" +
    "\n  ⚠ This answers 'does spill exist and how much', NOT 'does it look right'.\n" +
    "    The volume is Carl's judgement. Verification is not approval.\n",
  );
} finally {
  await context.close();
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
