/** DOES §2 STRIKE UNSEEN? (14 October 2026, before step 2 of the return rules.) `roomWipeClearsCA` derives the wipe from
 *  where `#roles` sits; with `#roles` above the window the wipe reads fully opaque, so the trigger reads TRUE anywhere
 *  below §2's top. Opens `/about` at `#examples` and at `#start` (1412 × 700), waits 4 s, and reports whether
 *  `neon:ignite` fired and whether the room's canvas was in the window at that time. Control: `/about` at the top (it
 *  must NOT have fired). ⚠ NOT WATCHED: a scroll down from §1 (the approved path); Carl's Chrome; production. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const hash of ["", "#examples", "#start"]) {
  const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
  await p.goto(`http://localhost:3000/about${hash}`, { waitUntil: "load" });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const ign = performance.getEntriesByName("neon:ignite")[0]?.startTime ?? null;
    const strikes = performance.getEntriesByType("mark").filter((m) => m.name.startsWith("neon:strike")).map((m) => m.name);
    const cv = document.querySelector("[data-room-stage] canvas");
    const rc = cv?.getBoundingClientRect();
    const onScreen = rc ? rc.bottom > 0 && rc.top < innerHeight : null;
    return { ign, strikes, onScreen, scrollY: Math.round(scrollY) };
  });
  console.log(`/about${hash || " (top)"}: neon:ignite ${r.ign === null ? "NOT fired" : `FIRED at ${(r.ign / 1000).toFixed(2)} s`}; strikes [${r.strikes.join(", ")}]; room canvas in window now: ${r.onScreen}; scrollY ${r.scrollY}`);
  await p.context().close();
}
await b.close();
