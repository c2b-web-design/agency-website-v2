// threejs.org's home page as Carl sees it (18 November 2026): one viewport still, for looking, not measuring.
// Usage: node project-intelligence/live-work/scripts/threejs-home-shot-18-november.mjs <outDir>
import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("https://threejs.org/", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3000);
await p.screenshot({ path: out + "/threejs-home.png" });
await b.close();
