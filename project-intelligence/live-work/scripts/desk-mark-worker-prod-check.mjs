/** Does the desk mark's WORKER load in a PRODUCTION build? (13 October 2026) Production strips the dev-only warnings, so a
 *  failed worker would fall back to the inline build silently. Watches: a worker created by the page (Playwright's
 *  `worker` event) and its script request, and any page error. Usage: node …/desk-mark-worker-prod-check.mjs [base url]
 *  ⚠ NOT WATCHED: whether the geometry is identical in production (proven on the dev server; same function, same input). */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3100";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const seen = [];
p.on("worker", (w) => seen.push("worker started: " + w.url().replace(BASE, "")));
p.on("pageerror", (e) => seen.push("PAGE ERROR: " + e.message));
p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") seen.push(`console ${m.type()}: ${m.text().slice(0, 160)}`); });
await p.goto(BASE + "/about#start", { waitUntil: "load" });
await p.waitForTimeout(6000);
console.log(seen.join("\n") || "(nothing)");
console.log(seen.some((s) => s.startsWith("worker started")) ? "✅ the worker ran" : "⛔ no worker — the inline fallback ran");
await b.close();
