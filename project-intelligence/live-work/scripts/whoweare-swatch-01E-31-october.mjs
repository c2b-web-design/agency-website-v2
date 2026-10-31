/** FILM 01 — `01E`, THE BRAND COLOURS IN METAL (31 October 2026). Carl: *"Make a 5s clip showimg brand colours in metal. Like
 *  the who we are button and start a conversation button. They dont have to be pill shaped, a sphere will suffice. But make
 *  sure they are lit."* It replaces the stock swatch sheet (a dreamstime watermark), so CD is not asked (D-107 amended).
 *  THE THREE: Carl, *"Gold. Teal. Platinum Blue"*, the family's paints as shipped (`START_LOOK`, `WHOWEARE_LOOK`, `NEXT_LOOK`).
 *  Names and hex codes under the spheres, in Geist; nothing on them. Animating them was Carl's offer, the phrase is the Builder's.
 *  THE RECIPE: `WHOWEARE_LOOK`, `lib/studio-hdri.ts` and `ClayLight` (whoweare-button-scene.tsx), COPIED as values because a
 *  one-off film clip must not add a route to the site: full metal, roughness 0.4, the studio HDRI at strength 1, its room
 *  darkened to 0.1, turned 150°; Neutral tone mapping; the clay's key and fill from the upper left; one directional lamp on
 *  `softboxAt`'s path. THAT TAKE ON A SPHERE (the site's exact recipe) gave wet-pearl dots and a dark front, so per D-106 this
 *  object takes its own route: the room at 0.6, roughness 0.35, no key or fill, the studio's reflection doing the work. The
 *  buttons' moving lamp stays; its dip is left out, because it exists for the words and there are none here.
 *  Frame-stepped at 3840 × 2160, fitted to 1920 × 1080, so timing owes nothing to the capture's speed.
 *    node …/whoweare-swatch-01E-31-october.mjs            the clip, into `09 Cut - 10 min/`
 *    node …/whoweare-swatch-01E-31-october.mjs test DIR   six frames as PNGs into DIR
 *  Logged: the GPU. NOT WATCHED: whether it is good. */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { homedir, tmpdir } from "node:os";

const REPO = process.cwd();
const FPS = 30;
const SECONDS = 5;
const TEST = process.argv[2] === "test" ? process.argv[3] : null;
const BIN = join(homedir(), "Videos", "C2B Films", "01 Who we are button", "09 Cut - 10 min");
const OUT = join(BIN, "01E.mov");

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:Geist;src:url("/media/caa3a2e1cccd8315-s.p.09~u27dqhyhd6.woff2") format("woff2");font-weight:100 900}html,body{margin:0;background:#0a0a0a;overflow:hidden}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
</head><body><script type="module">
import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

const FRAMES = ${FPS * SECONDS};
const Q = new URLSearchParams(location.search);
const DIAL = { room: +(Q.get("room") ?? 0.6), rough: +(Q.get("rough") ?? 0.35), yaw0: +(Q.get("yaw0") ?? 110), yaw1: +(Q.get("yaw1") ?? 190), lamp: +(Q.get("lamp") ?? 0.6) };
const smooth = (x) => { const k = Math.min(1, Math.max(0, x)); return k * k * k * (k * (6 * k - 15) + 10); };
const COLOURS = [["Gold", "#FFE39E"], ["Teal", "#1FB2C4"], ["Platinum Blue", "#3F6DB8"]];
const R = 180, GAP = 240, ROW_Y = 120; // px; the row and its labels sit above the caption, which Carl placed from y 855 down
const W = 1920, H = 1080;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(2);
renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#0a0a0a");
const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 4000);
camera.position.set(0, 0, 1000);

// lib/studio-hdri.ts: every pixel below luminance 1 × room, blending back to untouched by 2
async function studio(room) {
  const loader = new HDRLoader();
  loader.setDataType(THREE.FloatType);
  const src = await loader.loadAsync("/env/monochrome_studio_02_1k.hdr");
  const { width, height } = src.image;
  const from = src.image.data;
  const data = new Float32Array(from.length);
  for (let i = 0; i < from.length; i += 4) {
    const L = 0.2126 * from[i] + 0.7152 * from[i + 1] + 0.0722 * from[i + 2];
    const t = Math.min(1, Math.max(0, L - 1));
    const k = room + (1 - room) * t * t * (3 - 2 * t);
    data[i] = from[i] * k; data[i + 1] = from[i + 1] * k; data[i + 2] = from[i + 2] * k; data[i + 3] = from[i + 3];
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  tex.colorSpace = src.colorSpace; tex.minFilter = src.minFilter; tex.magFilter = src.magFilter;
  tex.generateMipmaps = false; tex.flipY = src.flipY;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
}
const env = await studio(DIAL.room);

const geo = new THREE.SphereGeometry(R, 192, 128);
const metals = [];
const columnX = (i) => (i - (COLOURS.length - 1) / 2) * (2 * R + GAP);
COLOURS.forEach(([, c], i) => {
  const m = new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: DIAL.rough });
  m.envMap = env;
  m.envMapIntensity = 1;
  metals.push(m);
  const s = new THREE.Mesh(geo, m);
  s.position.set(columnX(i), ROW_Y, 0);
  scene.add(s);
});

// softboxAt, the sphere's box for w and h, lift 120
const lamp = new THREE.DirectionalLight("#ffffff", 0); scene.add(lamp);
const P0 = new THREE.Vector3(-(R + 40), 2 * R * 1.4, 24), P1 = new THREE.Vector3(0, 120, 300), P2 = new THREE.Vector3(R + 40, -2 * R * 1.4, 24);
// THE PHRASE: the light reaches gold, then teal, then blue, each name after its colour; the studio never stops turning;
// once all three are lit the moving lamp crosses, once.
const REACH = (i) => 0.15 + 0.55 * i, RISE = 1.1, LAMP_FROM = 2.0;
const labelAlpha = [0, 0, 0];
function place(n) {
  const t = n / ${FPS};
  const yaw = ((DIAL.yaw0 + (DIAL.yaw1 - DIAL.yaw0) * (n / (FRAMES - 1))) * Math.PI) / 180;
  metals.forEach((m, i) => {
    m.envMapIntensity = smooth((t - REACH(i)) / RISE);
    m.envMapRotation.set(0, yaw, 0);
    labelAlpha[i] = smooth((t - REACH(i) - 0.6) / 0.6);
  });
  const x = Math.max(0, (t - LAMP_FROM) / (${SECONDS} - LAMP_FROM));
  const s = 0.12 + 0.76 * x;
  const u = 1 - s;
  lamp.position.copy(P0).multiplyScalar(u * u).add(P1.clone().multiplyScalar(2 * u * s)).add(P2.clone().multiplyScalar(s * s));
  lamp.intensity = DIAL.lamp * smooth((t - LAMP_FROM) / 0.8);
}
// The labels, drawn over the render at its own 2× (Carl: nothing on the spheres, the name and hex code underneath)
await Promise.all([document.fonts.load("600 68px Geist"), document.fonts.load("400 52px Geist")]);
const out = document.createElement("canvas");
out.width = W * 2; out.height = H * 2;
const c2d = out.getContext("2d");
window.frameAt = (n) => {
  place(n);
  renderer.render(scene, camera);
  c2d.drawImage(renderer.domElement, 0, 0);
  c2d.textAlign = "center";
  c2d.textBaseline = "alphabetic";
  COLOURS.forEach(([name, hex], i) => {
    const x = W + 2 * columnX(i);
    c2d.globalAlpha = labelAlpha[i];
    c2d.fillStyle = "#ffffff"; c2d.font = "600 68px Geist";
    c2d.fillText(name, x, 2 * (H / 2 - ROW_Y + R + 76));
    c2d.fillStyle = "#a8a8a8"; c2d.font = "400 52px Geist";
    c2d.fillText(hex, x, 2 * (H / 2 - ROW_Y + R + 122));
  });
  c2d.globalAlpha = 1;
  return out.toDataURL("image/png");
};
const gl = renderer.getContext();
const x = gl.getExtension("WEBGL_debug_renderer_info");
window.gpu = x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : "unknown";
window.ready = true;
</script></body></html>`;

const ROOTS = { "/three/": join(REPO, "node_modules", "three"), "/env/": join(REPO, "public", "env"), "/media/": join(REPO, ".next", "static", "media") };
const TYPES = { ".js": "text/javascript", ".hdr": "application/octet-stream", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  if (path === "/") { res.writeHead(200, { "content-type": "text/html" }); res.end(PAGE); return; }
  const root = Object.keys(ROOTS).find((r) => path.startsWith(r));
  const file = root && normalize(join(ROOTS[root], path.slice(root.length)));
  if (!file || !file.startsWith(ROOTS[root]) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}/`;

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
p.on("pageerror", (e) => console.log("pageerror:", String(e)));
await p.goto(base + (process.argv[4] ?? ""));
await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
console.log("gpu:", await p.evaluate(() => window.gpu));

const png = async (n, f) => {
  const url = await p.evaluate((n) => window.frameAt(n), n);
  writeFileSync(f, Buffer.from(url.split(",")[1], "base64"));
};
if (TEST) {
  mkdirSync(TEST, { recursive: true });
  for (const n of [0, 30, 60, 90, 120, 149]) await png(n, join(TEST, `swatch-${n}.png`));
} else {
  const dir = join(tmpdir(), "wwa-swatch");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (let n = 0; n < FPS * SECONDS; n++) await png(n, join(dir, `${String(n).padStart(4, "0")}.png`));
  mkdirSync(BIN, { recursive: true });
  // the `still` route of whoweare-cut10-build.mjs: RGB in, BT.709 limited out, DNxHR HQ
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "%04d.png"),
    "-an", "-threads", "1",
    "-vf", "scale=1920:1080:out_color_matrix=bt709:out_range=tv:flags=lanczos,format=yuv422p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv",
    "-r", String(FPS), "-c:v", "dnxhd", "-profile:v", "dnxhr_hq",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", OUT]);
  rmSync(dir, { recursive: true, force: true });
  console.log("wrote", OUT);
}
await b.close();
server.close();
