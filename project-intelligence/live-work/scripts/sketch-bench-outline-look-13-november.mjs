// THE SKETCH BENCH's YELLOW OUTLINE (13 November 2026; D-101). Carl: "go and look at the sketch bench. tou will see the
// outline of a yellow logo. that is what the blobe must squeeze into." Loads /proto/camera?blank=1&medium=webgl (the hero
// idea in WebGL: no liquid, no WebGPU compile) and screenshots it at its Home after the scene settles; reads the outline
// object's world box. ⚠ NOT WATCHED: the WebGPU medium (the outline is the same object in both).
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/camera?blank=1&medium=webgl", { waitUntil: "load" });
await p.waitForTimeout(12000);
await p.screenshot({ path: `${OUT}/sketch-bench.png` });
console.log(`page errors: ${errors.length}`, errors);
await b.close();
