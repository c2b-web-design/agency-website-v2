// THE FLOWING OPENING's 2D against the HOME PAGE's hero text (26 November 2026): the headline's and subtext's boxes on both
// pages at Carl's window, and each page's root zoom and fonts. READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--enable-unsafe-webgpu", "--hide-scrollbars"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const read = (sel) =>
  p.evaluate((sel) => {
    const [h, s] = sel.map((q) => document.querySelector(q));
    const r = (e) => (e ? Object.fromEntries(Object.entries(e.getBoundingClientRect().toJSON()).map(([k, v]) => [k, Math.round(v * 10) / 10])) : null);
    const cs = (e) => (e ? (({ fontFamily, fontSize, lineHeight, letterSpacing, fontWeight }) => ({ fontFamily: fontFamily.slice(0, 40), fontSize, lineHeight, letterSpacing, fontWeight }))(getComputedStyle(e)) : null);
    return { zoom: getComputedStyle(document.documentElement).zoom, vh: getComputedStyle(document.documentElement).getPropertyValue("--vh"), h1: r(h), h1s: cs(h), p: r(s), ps: cs(s) };
  }, sel);
await p.goto("http://localhost:3000/", { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(3000);
console.log("home ", JSON.stringify(await read(["main h1", "main h1 ~ p"])));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(3000);
console.log("bench", JSON.stringify(await read(["#hero-flow-head", "#hero-flow-2d p"])));
await b.close();
