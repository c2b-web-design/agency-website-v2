/**
 * CS — which erases the last-word cue cuts short, and by how much. 25 September 2026 (third session).
 * Mirrors `chase`'s arithmetic from its own exported pieces is not possible (timeMap is private), so this reads the
 * schedule back from `chase().at()` at 5 ms: for each line, when its erase starts and ends, and the time it WOULD
 * need at reading pace (its own write time). ⚠ NOT WATCHED: how it feels.
 *   node --no-warnings project-intelligence/live-work/scripts/cs-erase-detail.mjs
 */
import { readFileSync } from "node:fs";
import { setBalanced, chase, eraseLag, sentenceEnds } from "../../../components/about/card-text-timeline.ts";
import { ABOUT_CARD_COPY } from "../../../components/about/about-card-copy.ts";
import { ROOM_CARDS } from "../../../components/about/about-room.ts";
const card = ROOM_CARDS.CS, copy = ABOUT_CARD_COPY.find((c) => c.id === "CS");
const font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const inset = (2 * 0.022 + 0.03) * card.heightMm, faceH = card.heightMm - 2 * inset, blockW = (card.widthMm - 2 * inset) * 0.94;
const em = 68, mm = em / (100000 / 72), S = Math.floor((0.9 * faceH) / (em * 1.35));
const wd = (x) => [...x].reduce((a, ch) => a + (font.glyphs[ch]?.ha ?? 0), 0) * mm, sp = font.glyphs[" "].ha * mm;
const lines = setBalanced(copy.body.split(/\s+/), wd, sp, blockW).lines;
const ease = { sentenceEnds: sentenceEnds(lines), floor: 0.6, words: 1.5 };
const ch = chase(lines.map((l) => l.words.length), { wpm: (12 / 4200) * 60_000, lead: 1, restMs: 0, slots: S, lag: eraseLag(S), eraseAtLastWord: true }, ease);
const ev = lines.map(() => ({}));
for (let t = 0; t <= ch.periodMs; t += 5) for (const x of ch.at(t)) {
  const e = ev[x.line];
  if (x.reveal > 0 && e.ws === undefined) e.ws = t;
  if (x.reveal >= 1 && e.we === undefined) e.we = t;
  if (x.erase > 0 && e.es === undefined) e.es = t;
  e.ee = t;
}
lines.forEach((l, i) => {
  const e = ev[i], write = e.we - e.ws, erase = e.ee - e.es;
  console.log(`  ${i + 1} ${l.words.join(" ").padEnd(50)} write ${(write / 1000).toFixed(2)} s · erase ${(erase / 1000).toFixed(2)} s${erase < write * 0.95 ? `  ⛔ CUT to ${((100 * erase) / write).toFixed(0)}% — ${(write / erase).toFixed(2)}× the pace` : ""}`);
});
