// THE LEAN's CONTACT AND THE SCALE (11 November 2026; D-101, step 2). At HOME, at Carl's window (1909 × 940 screen px →
// 1401 × 695 layout px):
// - the TEXT PLANE: vertical, through the subtext's two y tips on the floor (FLOOR_Y), as the floor was measured;
// - the CONTACT: the t of "built"'s ink, drawn on a 2D canvas in the heading's own font at 4×, the ink point a plane leaning
//   12.5° toward the text meets first (max dx·cos + dy·sin), its screen point → ray → the text plane;
// - the SCALE: the old bench's text stood at 0.5 cm per screen px (hero-page.tsx, SKETCH_CM_PER_PX, Carl's window); the
//   same proportion here: cm per unit = 0.5 × screen px per unit along the text line at the contact.
// ⚠ NOT WATCHED: other windows; the glyph drawn by canvas, not read from the page's pixels (checked on a crop by eye).
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const LEAN_DEG = 12.5;
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForTimeout(3000);
const r = await p.evaluate(async (LEAN_DEG) => {
  await document.fonts.ready;
  const FLOOR_Y = -272;
  const cam = window.__heroBench.camera;
  const box = document.querySelector("[data-hero-bench]");
  const cr = box.getBoundingClientRect();
  const s = cr.height / box.clientHeight;
  const V = (x, y, z) => cam.position.clone().set(x, y, z);
  const rayAt = (sx, sy) => {
    const v = V(((sx - cr.left) / cr.width) * 2 - 1, 1 - ((sy - cr.top) / cr.height) * 2, 0.5).unproject(cam);
    return v.sub(cam.position).normalize();
  };
  const toScreen = (w) => {
    const q = w.clone().project(cam);
    return [cr.left + ((q.x + 1) / 2) * cr.width, cr.top + ((1 - q.y) / 2) * cr.height];
  };
  const glyph = (el) => {
    const cs = getComputedStyle(el);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    return { ctx, cs, size: parseFloat(cs.fontSize) };
  };
  const charRect = (node, i) => {
    const rg = document.createRange();
    rg.setStart(node, i);
    rg.setEnd(node, i + 1);
    return rg.getBoundingClientRect();
  };
  // the y tips → the floor points (as hero-floor-from-y-tips)
  const para = [...document.querySelectorAll("p")].find((e) => e.textContent.includes("sore eyes"));
  const pn = [...para.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).pop();
  const pg = glyph(para);
  const my = pg.ctx.measureText("y");
  const tips = [];
  for (let i = 0; i < pn.textContent.length; i++) {
    if (pn.textContent[i] !== "y") continue;
    const q = charRect(pn, i);
    const d = rayAt((q.left + q.right) / 2, q.bottom - (my.fontBoundingBoxDescent - my.actualBoundingBoxDescent) * s);
    const t = (FLOOR_Y - cam.position.y) / d.y;
    tips.push(cam.position.clone().addScaledVector(d, t));
  }
  const T1 = tips[0];
  const R = tips[1].clone().sub(T1).normalize(); // along the text line, to the right
  const N = V(-R.z, 0, R.x); // the text plane's normal, toward the camera (R × Y)
  // the t of "built"
  const h1 = document.querySelector("h1");
  const hn = [...h1.childNodes].find((n) => n.nodeType === 3 && n.textContent.includes("built"));
  const ti = hn.textContent.lastIndexOf("t");
  const tq = charRect(hn, ti);
  const hg = glyph(h1);
  const mt = hg.ctx.measureText("t");
  const baseline = tq.bottom - mt.fontBoundingBoxDescent * s; // screen px
  // the glyph at 4×
  const K = 4;
  const c = document.createElement("canvas");
  const pad = 20 * K;
  c.width = Math.ceil(hg.size * K * 1.2) + 2 * pad;
  c.height = Math.ceil(hg.size * K * 1.6) + 2 * pad;
  const g = c.getContext("2d");
  g.font = `${hg.cs.fontWeight} ${hg.size * K}px ${hg.cs.fontFamily}`;
  const base = pad + hg.size * K * 1.2;
  g.fillStyle = "#fff";
  g.fillText("t", pad, base);
  const img = g.getImageData(0, 0, c.width, c.height).data;
  const th = (LEAN_DEG * Math.PI) / 180;
  let best = null;
  let inkTop = Infinity;
  let inkRight = -Infinity;
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) {
      if (img[(y * c.width + x) * 4 + 3] < 128) continue;
      const dx = (x + 0.5 - pad) / K; // layout px right of the glyph's origin
      const dy = (base - (y + 0.5)) / K; // layout px above the baseline
      inkTop = Math.min(inkTop, y);
      inkRight = Math.max(inkRight, dx);
      const score = dx * Math.cos(th) + dy * Math.sin(th);
      if (!best || score > best.score) best = { score, dx, dy };
    }
  const contactScreen = [tq.left + best.dx * s, baseline - best.dy * s];
  const d = rayAt(...contactScreen);
  // the text plane: (P − T1)·N = 0
  const t = T1.clone().sub(cam.position).dot(N) / d.dot(N);
  const Pc = cam.position.clone().addScaledVector(d, t);
  const a = toScreen(Pc);
  const bb = toScreen(Pc.clone().addScaledVector(R, 100));
  const pxPerUnit = Math.hypot(bb[0] - a[0], bb[1] - a[1]) / 100;
  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    zoom: s,
    headingFont: g.font,
    tChar: { left: r2(tq.left), right: r2(tq.right), baseline: r2(baseline) },
    contactGlyph: { dx: r2(best.dx), dy: r2(best.dy), inkRight: r2(inkRight) },
    contactScreen: contactScreen.map(r2),
    textPlane: { T1: T1.toArray().map(r2), R: R.toArray().map((n) => Math.round(n * 1e4) / 1e4), N: N.toArray().map((n) => Math.round(n * 1e4) / 1e4) },
    Pc: Pc.toArray().map(r2),
    reprojected: a.map(r2),
    screenPxPerUnit: Math.round(pxPerUnit * 1e4) / 1e4,
    cmPerUnit: Math.round(0.5 * pxPerUnit * 1e4) / 1e4,
  };
}, LEAN_DEG);
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: `${OUT}/t-contact-crop.png`, clip: { x: r.contactScreen[0] - 60, y: r.contactScreen[1] - 50, width: 120, height: 100 } });
await b.close();
