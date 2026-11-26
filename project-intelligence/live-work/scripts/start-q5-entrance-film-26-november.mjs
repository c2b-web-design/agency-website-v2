// /start's Q5: THE QUESTION's TEXT REVEAL AND THE ANSWER CARDS' OVERLAPPING ENTRANCE, FILMED (26 November 2026; Carl, on the
// hero's opening: "There are 4 actions. They dont have to happen after the previous one has finished. Go look at the answer
// cards in the /start section."). READ-ONLY. Carl's window (1896 x 946), the dev server; load /start, Begin (the walk's
// route, `verify/lib/walk-to-client-info.mjs`), then a real-time video from the click for 9 s. Out (argv[2]): the .webm.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [OUT = "."] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars"] });
const ctx = await b.newContext({ viewport: { width: 1896, height: 946 }, recordVideo: { dir: OUT, size: { width: 1896, height: 946 } } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
const t0 = Date.now();
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
await p.waitForTimeout(9000);
console.log("clicked Begin at video +", (t0 - 0) && "(see the cut below)");
await ctx.close();
await b.close();
