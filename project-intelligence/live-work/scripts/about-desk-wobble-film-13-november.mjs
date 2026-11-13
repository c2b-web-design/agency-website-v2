// THE DESK MARK's WOBBLE ON /about, FILMED (13 November 2026; D-101). Carl: "Go look at the /about section on the site. The
// desk logo has a slight wobble there. That should guide you." Scrolls to §2 (the room), records ~16 s of video (the wobble
// starts 5 s after CA's strike, `DESK_MARK_WOBBLE`) for frame extraction. ⚠ NOT WATCHED: Carl's density; the video's frame
// rate is Playwright's (variable), so timing is read from the code, the LOOK from the frames.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: 1909, height: 940 } } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.waitForTimeout(4000);
// §2: the room — scroll one viewport and a half, slowly, so the wipe runs
for (let i = 0; i < Number(process.argv[3] ?? 30); i++) {
  await p.mouse.wheel(0, 50);
  await p.waitForTimeout(40);
}
const t0 = Date.now();
await p.waitForTimeout(16000);
console.log(`scrolled; recorded ${(Date.now() - t0) / 1000} s after the scroll`);
await ctx.close();
await b.close();
