// THE LOGO's RED, LEANING AGAINST RE-FORMED (13 November 2026, session 2; D-101). Carl: "the end logo should ne ted, with
// no hints of orange. Exactly as it is in leaning state before the blobs took over." Reads frames of the re-forming film
// (argv 2: the frames folder; argv 3..: frame:label pairs) through ffmpeg as raw RGB, masks the LOGO's pixels (red-
// dominant: R > 40 and R > 2 G and R > 2 B; the dark background, grey grid and ice text excluded), and reports per frame
// the pixel count, the mean R, G, B, and G/R and B/R (an orange tint raises G/R). Also the floor band under the disc's
// place (any orange glow left). NOT WATCHED: the logo's pose differs (leaning edge-on vs face-on), so the studio's
// reflection differs in BRIGHTNESS by design; the ratios, not the levels, are the colour check.
import { execFileSync } from "node:child_process";
const [dir, ...pairs] = process.argv.slice(2);
const W = 1920, H = 1080;
for (const pair of pairs) {
  const [n, label] = pair.split(":");
  const buf = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", `${dir}/f${String(n).padStart(5, "0")}.jpg`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: W * H * 4 });
  let c = 0, r = 0, g = 0, b = 0, fr = 0, fg = 0, fb = 0, fc = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = 3 * (W * y + x);
    const R = buf[o], G = buf[o + 1], B = buf[o + 2];
    if (R > 40 && R > 2 * G && R > 2 * B) { c++; r += R; g += G; b += B; }
    // the floor band where the disc lay, from Home (rows 560-640, columns 760-1160), the logo's own pixels excluded
    if (y >= 560 && y < 640 && x >= 760 && x < 1160 && !(R > 40 && R > 2 * G && R > 2 * B)) { fc++; fr += R; fg += G; fb += B; }
  }
  const f = (v) => (v / c).toFixed(1);
  console.log(`${label.padEnd(26)} logo px ${String(c).padStart(6)}  mean R ${f(r)} G ${f(g)} B ${f(b)}  G/R ${(g / r).toFixed(3)}  B/R ${(b / r).toFixed(3)}  | floor band mean ${(fr / fc).toFixed(1)}, ${(fg / fc).toFixed(1)}, ${(fb / fc).toFixed(1)}`);
}
