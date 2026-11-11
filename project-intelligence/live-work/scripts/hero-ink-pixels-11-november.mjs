// THE INK, FROM THE PAGE's OWN PIXELS (11 November 2026; D-101 step 2). Canvas-drawn glyphs landed ~2 screen px off the
// page's (Chrome rounds font metrics at the page's sizes: the h1's descent 18 vs 17.69), so the touch points are read from a
// screenshot of the page at HOME, at Carl's window (1909 × 940): the t of "built"'s contact for a plane leaning 12.5° toward
// the text (max x·cos − y·sin over its ink, white > 200), and the two y tips (the lowest ink row under each y, > 120).
// Each screen point → ray → (the y tips) the floor's height at z 0 and their mean; (the t) the text plane through the tips
// on that floor. The scale: 0.5 cm per screen px at the contact along the text line (the old bench's, hero-page.tsx).
// ⚠ NOT WATCHED: other windows; antialiasing (a pixel's centre taken); the grid's lines are dimmer than both thresholds.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const OUT = process.argv[2] ?? ".";
// a FIXED floor (scene units): the text plane is then where the y tips meet THAT floor (re-tracked Home, square on)
const FIXED_FLOOR = process.argv[3] !== undefined ? Number(process.argv[3]) : null;
const LEAN_DEG = 12.5;
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForTimeout(3000);
// hide the canvas: only the text's ink on the page's background
await p.evaluate(() => document.querySelector("[data-hero-bench] canvas").style.visibility = "hidden");
await p.waitForTimeout(200);
const png = `${OUT}/ink-page.png`;
await p.screenshot({ path: png });
const raw = `${OUT}/ink-page.gray`;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", png, "-f", "rawvideo", "-pix_fmt", "gray", raw]);
const W = 1909; // the screenshot's width (its height, 940, is the viewport's)
const px = readFileSync(raw);
const at = (x, y) => px[y * W + x];
await p.evaluate(() => document.querySelector("[data-hero-bench] canvas").style.visibility = "");

const boxes = await p.evaluate(() => {
  const charRect = (node, i) => {
    const rg = document.createRange();
    rg.setStart(node, i);
    rg.setEnd(node, i + 1);
    const q = rg.getBoundingClientRect();
    return { l: q.left, r: q.right, t: q.top, b: q.bottom };
  };
  const para = [...document.querySelectorAll("p")].find((e) => e.textContent.includes("sore eyes"));
  const pn = [...para.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).pop();
  const ys = [];
  for (let i = 0; i < pn.textContent.length; i++) if (pn.textContent[i] === "y") ys.push(charRect(pn, i));
  const h1 = document.querySelector("h1");
  const hn = [...h1.childNodes].find((n) => n.nodeType === 3 && n.textContent.includes("built"));
  return { ys, t: charRect(hn, hn.textContent.lastIndexOf("t")) };
});

// the y tips: the lowest ink row in each y's box
const tips = boxes.ys.map((q) => {
  let best = null;
  for (let y = Math.floor(q.t); y <= Math.ceil(q.b) + 2; y++)
    for (let x = Math.floor(q.l); x <= Math.ceil(q.r); x++) if (at(x, y) > 120 && (!best || y > best.y || (y === best.y && x < best.x))) best = { x, y };
  // the tip's row: centre x of the ink on that row
  const row = [];
  for (let x = Math.floor(q.l); x <= Math.ceil(q.r); x++) if (at(x, best.y) > 120) row.push(x);
  return [(row[0] + row[row.length - 1]) / 2 + 0.5, best.y + 1]; // the ink's bottom edge
});
// the t: max x·cos − y·sin over its ink
const th = (LEAN_DEG * Math.PI) / 180;
let tBest = null;
const tq = boxes.t;
for (let y = Math.floor(tq.t); y <= Math.ceil(tq.b); y++)
  for (let x = Math.floor(tq.l); x <= Math.ceil(tq.r) + 3; x++) {
    if (at(x, y) <= 200) continue;
    const s = (x + 1) * Math.cos(th) - y * Math.sin(th); // the pixel's right edge, top edge
    if (!tBest || s > tBest.s) tBest = { s, x: x + 1, y };
  }
const contact = [tBest.x, tBest.y];

const r = await p.evaluate(({ tips, contact, FIXED_FLOOR }) => {
  const cam = window.__heroBench.camera;
  const box = document.querySelector("[data-hero-bench]");
  const cr = box.getBoundingClientRect();
  const V = (x, y, z) => cam.position.clone().set(x, y, z);
  const rayAt = ([sx, sy]) => V(((sx - cr.left) / cr.width) * 2 - 1, 1 - ((sy - cr.top) / cr.height) * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  const toScreen = (w) => {
    const q = w.clone().project(cam);
    return [cr.left + ((q.x + 1) / 2) * cr.width, cr.top + ((1 - q.y) / 2) * cr.height];
  };
  const atZ0 = tips.map((t) => {
    const d = rayAt(t);
    return cam.position.clone().addScaledVector(d, -cam.position.z / d.z);
  });
  const floorY = FIXED_FLOOR ?? (atZ0[0].y + atZ0[1].y) / 2;
  const onFloor = tips.map((t) => {
    const d = rayAt(t);
    return cam.position.clone().addScaledVector(d, (floorY - cam.position.y) / d.y);
  });
  const T1 = onFloor[0];
  const R = onFloor[1].clone().sub(T1).normalize();
  const N = V(-R.z, 0, R.x);
  const d = rayAt(contact);
  const Pc = cam.position.clone().addScaledVector(d, T1.clone().sub(cam.position).dot(N) / d.dot(N));
  const a = toScreen(Pc);
  const bb = toScreen(Pc.clone().addScaledVector(R, 100));
  const pxPerUnit = Math.hypot(bb[0] - a[0], bb[1] - a[1]) / 100;
  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    tipsScreen: tips,
    tipsAtZ0Y: atZ0.map((v) => r2(v.y)),
    floorY: r2(floorY),
    onFloor: onFloor.map((v) => v.toArray().map(r2)),
    R: R.toArray().map((n) => Math.round(n * 1e4) / 1e4),
    N: N.toArray().map((n) => Math.round(n * 1e4) / 1e4),
    contactScreen: contact,
    Pc: Pc.toArray().map(r2),
    camera: cam.position.toArray().map(r2),
    screenPxPerUnit: Math.round(pxPerUnit * 1e4) / 1e4,
    cmPerUnit: Math.round(0.5 * pxPerUnit * 1e4) / 1e4,
  };
}, { tips, contact, FIXED_FLOOR });
console.log(JSON.stringify(r, null, 1));
await b.close();
