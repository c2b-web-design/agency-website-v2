// FILM 3, THE TEXT's DISSOLVE (25 November 2026, session 2; Carl: "take a shot of the hero on the site as it is now. then the
// bench opening. ... do a dissolve between the two and watch the boring 2d white text transform into lit 3d ice blue text").
// READ-ONLY. Two captures at Carl's window (1896 x 946, DPR 1, as the hero films): (1) the HOME PAGE as it is now (`/`), a still;
// (2) the hero bench's OPENING (`/proto/hero`) from the dark, frame-stepped at 1/30 s, from HOME, the panel hidden, to argv[3] s.
// Output in argv[2]: home.png, bench/0000.png ..., and overlay.png (the two at 50%, to check the text registers).
// ⚠ Frame-stepped: true timing, not live playback's frame rate.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
const [OUT, LEN = "10"] = process.argv.slice(2);
const FR = `${OUT}/bench`;
rmSync(FR, { recursive: true, force: true });
mkdirSync(FR, { recursive: true });
const VIEW = { width: 1896, height: 946 };
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"] });
const errors = [];

// (1) THE HOME PAGE, as it is now
{
  const p = await b.newPage({ viewport: VIEW, deviceScaleFactor: 1 });
  p.on("pageerror", (e) => errors.push("home: " + String(e).slice(0, 200)));
  await p.goto("http://localhost:3000/", { waitUntil: "load" });
  await p.addStyleTag({ content: "html{scrollbar-gutter:auto!important} nextjs-portal{display:none!important}" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(4000); // the page's own entrance settled
  await p.screenshot({ path: `${OUT}/home.png` });
  await p.close();
}

// (2) THE BENCH's OPENING, from the dark, at HOME
{
  const p = await b.newPage({ viewport: VIEW, deviceScaleFactor: 1 });
  p.on("pageerror", (e) => errors.push("bench: " + String(e).slice(0, 200)));
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
  // the scrollbar gutter off here too (globals.css `scrollbar-gutter: stable` painted a white 15 px strip on take 1, and laid
  // the bench out 15 px narrower than the home page), then a resize so the canvas takes the full width
  await p.addStyleTag({ content: "html{scrollbar-gutter:auto!important} .lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
  await p.evaluate(() => window.dispatchEvent(new Event("resize")));
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    const { hero, renderer, camera, controls } = window.__heroBench;
    renderer.setAnimationLoop(null);
    // HOME (hero-scene.ts `HOME`), whatever this profile remembered
    camera.position.set(0, -49.2, 2566.2); camera.fov = 45; camera.updateProjectionMatrix();
    if (controls) { controls.target.set(0, 0, 0); controls.update(); } else camera.lookAt(0, 0, 0);
    hero.openingAgain();
  });
  const total = Math.round(Number(LEN) * 30);
  for (let f = 0; f < total; f++) {
    await p.evaluate(async () => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      hero.update(1 / 30);
      hero.compute(renderer);
      renderer.render(scene, camera);
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    });
    await p.screenshot({ path: `${FR}/${String(f).padStart(4, "0")}.png` });
  }
  const info = await p.evaluate(() => window.__heroBench.hero.openingInfo);
  console.log("opening at the end:", JSON.stringify(info));
  await p.close();
}
await b.close();
// the overlay: home at 50% over the bench at 7.5 s (both subtext lines in)
const at = String(Math.min(Math.round(7.5 * 30), Math.round(Number(LEN) * 30) - 1)).padStart(4, "0");
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${OUT}/home.png`, "-i", `${FR}/${at}.png`, "-filter_complex", "[0][1]blend=all_mode=average", `${OUT}/overlay.png`]);
console.log("page errors:", errors.length, errors);
