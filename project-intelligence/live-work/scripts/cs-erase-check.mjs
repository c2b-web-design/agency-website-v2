/**
 * CS — the erase cue, start vs last word. 25 September 2026 (third session). Carl: "It can start as the head is
 * approaching the last word of the second line, not the beginning of it." The real chase (`chase`), CS's real
 * copy, card, setter, pace and sentence easing. Reports: lines on the card over time (whole lines, and any part),
 * grace, pass length, cut-short erases. Optional card id (default CS) to compare the others.
 *   node --no-warnings project-intelligence/live-work/scripts/cs-erase-check.mjs [CS|CD|CB|CA]
 * ⚠ NOT WATCHED: how it FEELS (Carl, moving); the renderer (this is the schedule the renderer reads).
 */
import { readFileSync } from "node:fs";
import { setBalanced, chase, eraseLag, sentenceEnds } from "../../../components/about/card-text-timeline.ts";
import { ABOUT_CARD_COPY } from "../../../components/about/about-card-copy.ts";
import { ROOM_CARDS } from "../../../components/about/about-room.ts";

const id = process.argv[2] ?? "CS";
const card = ROOM_CARDS[id], copy = ABOUT_CARD_COPY.find((c) => c.id === id);
const font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const inset = (2 * 0.022 + 0.03) * card.heightMm, faceH = card.heightMm - 2 * inset, blockW = (card.widthMm - 2 * inset) * 0.94;
const em = 68, mm = em / (100000 / 72), S = Math.floor((0.9 * faceH) / (em * 1.35));
const wd = (x) => [...x].reduce((a, ch) => a + (font.glyphs[ch]?.ha ?? 0), 0) * mm, sp = font.glyphs[" "].ha * mm;
const lines = setBalanced(copy.body.split(/\s+/), wd, sp, blockW).lines;
const wpl = lines.map((l) => l.words.length);
const ease = { sentenceEnds: sentenceEnds(lines), floor: 0.6, words: 1.5 };
console.log(`${id}: ${lines.length} lines, ${S} slots, erase ${eraseLag(S)} behind`);
for (const cue of [false, true]) {
  const ch = chase(wpl, { wpm: (12 / 4200) * 60_000, lead: 1, restMs: 0, slots: S, lag: eraseLag(S), eraseAtLastWord: cue }, ease);
  const whole = [], any = [];
  for (let t = 0; t < ch.periodMs; t += 50) {
    const st = ch.at(t);
    whole.push(st.filter((x) => x.reveal >= 1 && x.erase <= 0).length);
    any.push(st.filter((x) => x.reveal > x.erase).length);
  }
  const share = (arr, n) => `${((100 * arr.filter((v) => v >= n).length) / arr.length).toFixed(0)}%`;
  console.log(`\n  cue = ${cue ? "LAST WORD" : "line start"} · pass ${(ch.periodMs / 1000).toFixed(1)} s · grace ${(ch.graceMs / 1000).toFixed(1)} s · cut short ${ch.clipped}`);
  console.log(`    lines with ANY text on the card: max ${Math.max(...any)} · ≥2 for ${share(any, 2)} of the pass · ≥3 for ${share(any, 3)}`);
  console.log(`    WHOLE lines (written, not yet erasing): max ${Math.max(...whole)} · ≥1 for ${share(whole, 1)} · ≥2 for ${share(whole, 2)}`);
}
