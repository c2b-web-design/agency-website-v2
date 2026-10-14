/** §2's RETURN RULES, STEP 2 — VERIFIED (14 October 2026, D-088; structural note
 *  `live-work/structural-note-s2-return-step2-14-october.md`). `/about` at 1412 × 700, headed, GPU (the house args).
 *
 *  Walks:
 *   A. top → scroll to §2: strikes as today (one `neon:ignite`, no button).
 *   B. → §4 (jump): `s2:static` marked off screen → back to §2 (jump): button shown; `elementFromPoint` at its centre IS
 *      the button (the 14 August case, asserted); CA's top rim band darker than the lit frame; nothing animating (two
 *      frames 1 s apart, CA band identical). ⚠ The text's absence is SHOWN in the frame, not counted.
 *   C. a REAL click at the button's centre: a second `neon:ignite` within 300 ms; the button gone on the ignition frame.
 *   D. → §3 for 3.5 s → `s2:fresh`; back to §2 → a third ignition on arrival, no button.
 *   E. → §3 for 2 s → back: no `s2:fresh`, no new ignition (runs on).
 *   F. a SLOW scroll (wheel) §2 → §4 → §2: static, button clickable.
 *   G. a fresh page opened at `#start`: no ignition while there; scroll up → the first ignition on arrival, no button.
 *   Frames to SHOTS for Carl's eye.
 *
 *  ⚠ NOT WATCHED: Carl's Chrome (d3d11 vs this test browser); phones; reduced motion; production; the desk mark's light
 *  in the player is SHOWN (a frame), not measured; the rim's darkness is a luma comparison of CA's top band, not a
 *  per-pixel read of the tube. */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/s2-return-step2-14-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? "✅" : "⛔"} ${msg}`); if (!cond) fails++; };
const page = async (hash = "") => {
  const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
  await p.goto(`http://localhost:3000/about${hash}`, { waitUntil: "load" });
  await p.mouse.move(5, 5);
  return p;
};
const jump = (p, id) => p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "start" }), id);
const marks = (p, name) => p.evaluate((n) => performance.getEntriesByName(n).length, name);
/** ⚠ Since 14 October (Carl's redesign) the click area is CA's FACE (a `clip-path` over the plate), not a box at its
 *  centre — so the hit test is taken at CA's centre (the mean of its approved outline, 0.296 / 0.440 of the plate)
 *  and, to prove the clip, at a point on the wall LEFT of CA (0.12 / 0.44), which must NOT be the button. */
const button = (p) => p.evaluate(() => {
  const el = document.querySelector("[data-s2-restart]");
  if (!el) return null;
  const r = el.getBoundingClientRect(); // the plate's box
  const at = (fx, fy) => [r.left + fx * r.width, r.top + fy * r.height];
  const name = (hit) => hit === el ? "the button" : hit ? `${hit.tagName.toLowerCase()}${hit.id ? "#" + hit.id : ""}.${String(hit.className).slice(0, 40)}` : "nothing";
  const [cx, cy] = at(0.296, 0.44);
  const [ox, oy] = at(0.12, 0.44);
  return { cx, cy, hit: name(document.elementFromPoint(cx, cy)), outside: name(document.elementFromPoint(ox, oy)), text: el.getAttribute("aria-label") };
});
/** The longest gap between animation frames over `ms` — a first-time shader compile shows as one long frame. */
const longestFrame = (p, ms) => p.evaluate((d) => new Promise((res) => {
  let last = performance.now(), worst = 0; const end = last + d;
  const tick = (t) => { worst = Math.max(worst, t - last); last = t; if (t < end) requestAnimationFrame(tick); else res(Math.round(worst)); };
  requestAnimationFrame(tick);
}), ms);
/** CA's top band (the rim) in window px, from the canvas: plate = its top and width; height = width ÷ aspect. */
const caBand = (p) => p.evaluate(() => {
  const cv = document.querySelector("[data-room-stage] canvas");
  const r = cv.getBoundingClientRect();
  const ph = r.width / (2560 / 1435);
  return { x: Math.round(r.left + 0.18 * r.width), y: Math.round(r.top + 0.295 * ph), width: Math.round(0.235 * r.width), height: Math.round(0.035 * ph) };
});
const luma = async (buf) => {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let s = 0; for (let i = 0; i < data.length; i += info.channels) s += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  return s / (data.length / info.channels);
};
const diff = async (a, c) => {
  const A = await sharp(a).raw().toBuffer(), C = await sharp(c).raw().toBuffer();
  let m = 0; for (let i = 0; i < A.length; i++) m = Math.max(m, Math.abs(A[i] - C[i]));
  return m;
};
// ── A–E on one page ──
{
  const p = await page();
  await p.waitForTimeout(3000);
  // A
  await p.mouse.wheel(0, 700);
  await p.waitForTimeout(800);
  await jump(p, "roles");
  await p.waitForTimeout(6000);
  ok((await marks(p, "neon:ignite")) === 1, `A. scroll to §2: ${await marks(p, "neon:ignite")} ignition(s) (expect 1)`);
  ok((await button(p)) === null, "A. no button while playing");
  const band = await caBand(p);
  const litBuf = await p.screenshot({ clip: band });
  const litLuma = await luma(litBuf);
  await p.screenshot({ path: `${OUT}/A_playing.png` });
  // B
  await jump(p, "start");
  await p.waitForTimeout(1000);
  ok((await marks(p, "s2:static")) === 1, `B. §4 reached: s2:static marked ${await marks(p, "s2:static")}×`);
  const frameWatch = longestFrame(p, 1500);
  await jump(p, "roles");
  const worst = await frameWatch;
  ok(worst < 100, `B. back in §2 (the words' first appearance): longest frame ${worst} ms over 1.5 s (a first-time compile would show here)`);
  const btn = await button(p);
  ok(btn !== null, `B. back in §2: the face's click area ${btn ? `present, "${btn.text}"` : "MISSING"}`);
  ok(btn?.hit === "the button", `B. elementFromPoint at CA's centre: ${btn?.hit}`);
  ok(btn !== null && btn.outside !== "the button", `B. elementFromPoint on the wall left of CA: ${btn?.outside} (must not be the button)`);
  const s1 = await p.screenshot({ clip: band });
  await p.waitForTimeout(1000);
  const s2 = await p.screenshot({ clip: band });
  const stLuma = await luma(s1);
  ok(stLuma < litLuma, `B. CA's rim band: static luma ${stLuma.toFixed(1)} vs playing ${litLuma.toFixed(1)}`);
  const d = await diff(s1, s2);
  ok(d <= 2, `B. nothing animating: CA band max channel change over 1 s = ${d}`);
  await p.screenshot({ path: `${OUT}/B_static.png` });
  // the mark in the player while §2 is static — shown, not measured
  await jump(p, "examples");
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/B_mark_in_player_while_static.png` });
  await jump(p, "roles");
  await p.waitForTimeout(1200);
  // C — a real pointer click
  const before = await marks(p, "neon:ignite");
  const b2 = await button(p);
  await p.mouse.click(b2.cx, b2.cy);
  await p.waitForTimeout(300);
  ok((await marks(p, "neon:ignite")) === before + 1, `C. click: ignitions ${before} → ${await marks(p, "neon:ignite")}`);
  ok((await button(p)) === null, "C. click area gone after the ignition");
  // the exchange: the rim flickers on, the words flicker off (CA's ignition and its reverse, ~0.7 → ~2.0 s)
  for (const t of [700, 1000, 1300, 1600, 2100]) {
    await p.waitForTimeout(t - (t === 700 ? 300 : [700, 1000, 1300, 1600, 2100][[700, 1000, 1300, 1600, 2100].indexOf(t) - 1]));
    await p.screenshot({ path: `${OUT}/C_exchange_${t}ms.png`, clip: band.width ? { x: band.x - 20, y: band.y - 20, width: band.width + 40, height: Math.round(band.width * 0.62) } : undefined });
  }
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/C_restart_+3.3s_text.png` });
  // D
  await jump(p, "examples");
  await p.waitForTimeout(3500);
  ok((await marks(p, "s2:fresh")) === 1, `D. §3 linger 3.5 s: s2:fresh marked ${await marks(p, "s2:fresh")}×`);
  const beforeD = await marks(p, "neon:ignite");
  await jump(p, "roles");
  await p.waitForTimeout(500);
  ok((await marks(p, "neon:ignite")) === beforeD + 1, `D. back to §2: ignitions ${beforeD} → ${await marks(p, "neon:ignite")} (struck on arrival)`);
  ok((await button(p)) === null, "D. no button (re-armed, not static)");
  await p.waitForTimeout(3000);
  // E
  const fr = await marks(p, "s2:fresh"), ig = await marks(p, "neon:ignite");
  await jump(p, "examples");
  await p.waitForTimeout(2000);
  await jump(p, "roles");
  await p.waitForTimeout(1500);
  ok((await marks(p, "s2:fresh")) === fr && (await marks(p, "neon:ignite")) === ig, `E. §3 for 2 s: no re-arm, no new ignition (fresh ${fr}→${await marks(p, "s2:fresh")}, ignite ${ig}→${await marks(p, "neon:ignite")})`);
  await p.context().close();
}

// ── F: a slow wheel scroll ──
{
  const p = await page();
  await p.waitForTimeout(3000);
  await jump(p, "roles");
  await p.waitForTimeout(4000);
  for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(40); }
  await p.waitForTimeout(800);
  ok((await marks(p, "s2:static")) === 1, `F. slow scroll to §4: s2:static ${await marks(p, "s2:static")}×`);
  const target = await p.evaluate(() => document.getElementById("roles").getBoundingClientRect().top + scrollY);
  while (await p.evaluate(() => scrollY) > target + 5) { await p.mouse.wheel(0, -120); await p.waitForTimeout(40); }
  await p.waitForTimeout(1200);
  const btn = await button(p);
  ok(btn?.hit === "the button", `F. slow scroll back to §2: button ${btn ? "shown" : "MISSING"}, hit-test ${btn?.hit}`);
  await p.screenshot({ path: `${OUT}/F_static_after_slow_scroll.png` });
  await p.context().close();
}

// ── G: opened at #start ──
{
  const p = await page("#start");
  await p.waitForTimeout(3500);
  ok((await marks(p, "neon:ignite")) === 0, `G. opened at #start: ${await marks(p, "neon:ignite")} ignition(s) while there (expect 0)`);
  for (let i = 0; i < 60 && (await marks(p, "neon:ignite")) === 0; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(60); }
  const where = await p.evaluate(() => {
    const cv = document.querySelector("[data-room-stage] canvas").getBoundingClientRect();
    return `canvas top ${Math.round(cv.top)} px`;
  });
  ok((await marks(p, "neon:ignite")) === 1, `G. scrolling up: first ignition when the wall came into view (${where})`);
  await p.waitForTimeout(600);
  ok((await button(p)) === null, "G. no button on a first visit");
  await p.screenshot({ path: `${OUT}/G_first_strike_from_below.png` });
  await p.context().close();
}

await b.close();
console.log(fails ? `\n⛔ ${fails} check(s) failed` : "\n✅ all checks passed");
console.log(`⚠ NOT WATCHED: Carl's Chrome, phones, reduced motion, production; the mark's light in the player is a frame, not a number.`);
console.log(OUT);
