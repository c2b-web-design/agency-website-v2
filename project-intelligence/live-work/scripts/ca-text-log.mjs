import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const logs = [];
p.on("console", (m) => { const t = m.text(); if (/extrude|⛔/.test(t)) logs.push(t); });
await p.goto(`http://localhost:3000/about${process.argv[2] ?? ""}#roles`, { waitUntil: "networkidle" });
await p.waitForTimeout(5000);
console.log(logs.join("\n"));
await b.close();
