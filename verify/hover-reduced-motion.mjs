/**
 * DOES THE HOVER TEAL ARRIVE UNDER `prefers-reduced-motion`?
 *
 *   node verify/hover-reduced-motion.mjs
 *
 * ⚠ THIS IS THE CASE THE ORIGINAL BUILD FAILED SILENTLY. The hover ease ran in
 * `useFrame`, which only ticks while something invalidates the canvas. The
 * traveller's unconditional rAF loop was doing that by accident — and under
 * reduced motion the traveller PARKS, so the ease lost its frame source and the
 * teal would never have arrived. No error, no warning: just a feature that is
 * missing for the users most likely to need clear affordances.
 *
 * ⚠ IT WOULD ALSO HAVE PASSED EVERY EXISTING HARNESS, because they all run with
 * motion enabled.
 */
import { chromium } from "playwright";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ headless:false, args:["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
// ⚠ THE WHOLE POINT OF THE RUN.
const page = await browser.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:6, reducedMotion:"reduce" });
await page.goto(`${BASE}/start`, { waitUntil:"networkidle" });
const renderer = await page.evaluate(() => {
  const c=document.createElement("canvas");
  const gl=c.getContext("webgl2")||c.getContext("webgl");
  const d=gl&&gl.getExtension("WEBGL_debug_renderer_info");
  return d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):"unknown";
}).catch(()=>"unknown");
console.log("renderer:", renderer);
console.log("prefers-reduced-motion:", await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));
if (/swiftshader|llvmpipe|software/i.test(String(renderer))) { console.error("\n⚠ ABORTING — software rasteriser."); await browser.close(); process.exit(1); }
const begin = page.getByRole("button", { name:/begin/i });
await begin.waitFor({state:"visible",timeout:20000}); await begin.click();
await page.waitForTimeout(4500);
/**
 * ⚠ ANCHORED TO THE HOVER SURFACE, NOT COMPUTED FROM THE CANVAS CENTRE. A first
 * version derived the crop from the largest canvas assuming the row is
 * vertically centred — true with motion, FALSE under reduced motion, where the
 * card canvas sits at y=231 and the "measurement" landed on blank page at
 * 250/250/250. **It reported no teal, which was true of the pixels it sampled
 * and said nothing about the feature.**
 *
 * The surface is the card, by construction — same `boxes` the scene places from.
 */
const clip = await page.evaluate(() => {
  const s = document.querySelector('[data-testid="answer-card-hover-0"]');
  if (!s) return null;
  const r = s.getBoundingClientRect();
  // The label band: the middle third, where the glyphs sit.
  return { x: r.x + 20, y: r.y + r.height * 0.34, width: r.width - 40, height: r.height * 0.32 };
});
if (!clip) { console.error("\n⚠ hover surface not found."); await browser.close(); process.exit(1); }
async function ink(){
  const b64=(await page.screenshot({clip})).toString("base64");
  return page.evaluate(async (s)=>{
    const img=new Image(); img.src="data:image/png;base64,"+s; await img.decode();
    const c=document.createElement("canvas"); c.width=img.width; c.height=img.height;
    const x=c.getContext("2d"); x.drawImage(img,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data;
    let n=0,sr=0,sg=0,sb=0;
    for(let i=0;i<d.length;i+=4){const lum=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];
      if(lum>90){n++;sr+=d[i];sg+=d[i+1];sb+=d[i+2];}}
    return n?{r:sr/n,g:sg/n,b:sb/n}:{r:0,g:0,b:0};
  }, b64);
}
const rest = await ink();
console.log(`\n  resting  r ${rest.r.toFixed(1)}  g ${rest.g.toFixed(1)}  b ${rest.b.toFixed(1)}`);
await page.locator('[data-testid="answer-card-hover-0"]').hover();
await page.waitForTimeout(2000);
const held = await ink();
console.log(`  hovered  r ${held.r.toFixed(1)}  g ${held.g.toFixed(1)}  b ${held.b.toFixed(1)}`);
const dropR = rest.r-held.r, dropG = rest.g-held.g, dropB = rest.b-held.b;
console.log(`\n  channel drop:  red ${dropR.toFixed(1)}   green ${dropG.toFixed(1)}   blue ${dropB.toFixed(1)}`);
console.log(dropR>=8 && dropR>dropG && dropR>dropB
  ? "\n  The teal arrives under reduced motion.\n"
  : "\n  ⚠⚠ NO TEAL UNDER REDUCED MOTION. The ease has no frame source — it needs\n     its own rAF calling invalidate(), not useFrame.\n");
await browser.close();
