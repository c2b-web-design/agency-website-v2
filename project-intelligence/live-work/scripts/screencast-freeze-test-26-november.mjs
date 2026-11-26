// IS A FROZEN FADE IN THE SCREENCAST REAL? (26 November 2026). The flowing opening's films showed the HTML headline's fade
// FROZEN for ~6 frames while the scene starts (the main thread busy), then caught up in one. A CSS opacity animation can run
// on the compositor while the main thread is blocked; does Chrome's screencast (the films' camera) see that? A plain page:
// a text's opacity animated 0 → 1 over 2 s, the main thread BLOCKED from 0.5 to 1.5 s; the screencast's frames, stamped, and
// each frame's text brightness. If it climbs through the block, the films' freeze was real; if it holds, it was the camera.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 600, height: 300 } });
await p.setContent(`<html><body style="margin:0;background:#000"><div id=t style="font:bold 120px sans-serif;color:#fff;opacity:0;animation:f 2s linear forwards">FADE</div><style>@keyframes f{to{opacity:1}}</style></body></html>`);
const cdp = await p.context().newCDPSession(p);
const shots = [];
cdp.on("Page.screencastFrame", async (f) => {
  shots.push({ t: f.metadata.timestamp, data: f.data });
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
const t0 = Date.now() / 1000;
await p.evaluate(() => new Promise((r) => setTimeout(() => { const e = performance.now() + 1000; while (performance.now() < e); r(); }, 500)));
await p.waitForTimeout(1200);
await cdp.send("Page.stopScreencast");
for (const s of shots) {
  const v = await p.evaluate(async (d) => { const i = new Image(); i.src = "data:image/png;base64," + d; await i.decode(); const c = new OffscreenCanvas(60, 30); const g = c.getContext("2d"); g.drawImage(i, 0, 0, 60, 30); const px = g.getImageData(0, 0, 60, 30).data; let m = 0; for (let k = 0; k < px.length; k += 4) m = Math.max(m, px[k]); return m; }, s.data);
  console.log(((s.t - t0) * 1000).toFixed(0).padStart(5), "ms  text", v);
}
await b.close();
