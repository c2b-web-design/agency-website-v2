// THE FLOOR's HEIGHT from the subtext's two y tips (Carl, 11 November 2026: "on the subtext there are 2 letter ys on the
// bottom line that touch the floor"). At HOME, at Carl's window (1909 × 940 screen px → 1401 × 695 layout px), each y's
// descender tip on screen → a ray from the camera → where it crosses the plane z = 0 (the text level with the blobs).
// ⚠ NOT WATCHED: other windows (the tips move with the text's breakpoints); the glyph tip comes from the font's metrics
// (measureText), checked against a crop of the screenshot by eye, not by pixels.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const hb = window.__heroBench;
  const cam = hb.camera;
  const box = document.querySelector("[data-hero-bench]");
  const cr = box.getBoundingClientRect();
  const s = cr.height / box.clientHeight; // on-screen px per layout px (the root zoom)
  const para = [...document.querySelectorAll("p")].find((e) => e.textContent.includes("sore eyes"));
  const nodes = [...para.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
  const last = nodes[nodes.length - 1];
  const text = last.textContent;
  const cs = getComputedStyle(para);
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText("y");
  const tips = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "y") continue;
    const rg = document.createRange();
    rg.setStart(last, i);
    rg.setEnd(last, i + 1);
    const q = rg.getBoundingClientRect();
    // the range's box is the font's content area: its bottom = baseline + font descent
    const tipY = q.bottom - (m.fontBoundingBoxDescent - m.actualBoundingBoxDescent) * s;
    const tipX = (q.left + q.right) / 2;
    const ndc = { x: ((tipX - cr.left) / cr.width) * 2 - 1, y: 1 - ((tipY - cr.top) / cr.height) * 2 };
    const v = cam.position.clone().set(ndc.x, ndc.y, 0.5).unproject(cam);
    const d = v.sub(cam.position).normalize();
    const t = -cam.position.z / d.z;
    const hit = cam.position.clone().addScaledVector(d, t);
    tips.push({ word: text.slice(Math.max(0, i - 3), i + 2), screen: [Math.round(tipX), Math.round(tipY * 10) / 10], ndc, world: hit.toArray().map((n) => Math.round(n * 10) / 10) });
  }
  return { text, layout: [box.clientWidth, box.clientHeight], zoom: s, font: ctx.font, descent: { font: m.fontBoundingBoxDescent, glyph: m.actualBoundingBoxDescent }, camera: cam.position.toArray(), tips };
});
console.log(JSON.stringify(r, null, 1));
const ys = r.tips.map((t) => t.world[1]);
console.log(`floor y at z 0: ${ys.join(", ")}; mean ${(ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(1)}`);
const yMax = Math.max(...r.tips.map((t) => t.screen[1]));
const x0 = Math.min(...r.tips.map((t) => t.screen[0])) - 260;
await p.screenshot({ path: `${OUT}/y-tips-crop.png`, clip: { x: Math.max(0, x0), y: yMax - 40, width: 560, height: 60 } });
await b.close();
