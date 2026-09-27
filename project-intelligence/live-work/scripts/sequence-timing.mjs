/**
 * THE §1 → §2 SEQUENCE, IN NUMBERS — 27 September 2026. Carl: "press Roles. The rim should activate and then the
 * text reveal start. If the text is at average speed a person reads, CB should activate and then text reveal as
 * the last few words in CA are being read."
 * Per card: the ignition's length (to its hold) and the WRITE time of the whole copy at the live pace and
 * sentence easing (the write head only — the erase is not counted). ⚠ The write time needs only the word count
 * and sentence ends, not the line breaks (`timeMap` in `card-text-timeline.ts`; lead is 1).
 *   node --no-warnings project-intelligence/live-work/scripts/sequence-timing.mjs [fewWords=3] [order=CA,CB,CD,CS]
 */
import { register } from "node:module";
register("./ts-resolve-hook.mjs", import.meta.url);
const { ABOUT_CARD_COPY } = await import("../../../components/about/about-card-copy.ts");
const { easeCostMs, sentenceEnds } = await import("../../../components/about/card-text-timeline.ts");
const { NEON_SCHEDULES, NEON_SEQUENCE_MS } = await import("../../../components/about/about-neon.ts");

const few = +(process.argv[2] ?? 3);
const order = (process.argv[3] ?? "CA,CB,CD,CS").split(",");
const WPM = (12 / 4200) * 60_000; // START_PAGE_WPM
const FLOOR = 0.6, EASE_WORDS = 1.5;
const len = (p) => p.segments.reduce((s, x) => s + x.ms, 0);

let t = 0;
console.log(`pace ${WPM.toFixed(1)} wpm, sentence ease ${FLOOR} over ${EASE_WORDS} words; next card's rim strikes as the head reaches the ${few}${few === 1 ? "st" : "rd"}-last word\n`);
console.log("card | words | ignition | write   | rim at   | text at  | written by");
for (const id of order) {
  const copy = ABOUT_CARD_COPY.find((c) => c.id === id);
  const body = copy.body ?? copy.text ?? copy.copy;
  const words = body.split(/\s+/).filter(Boolean);
  const lines = [{ words }];
  const e = { sentenceEnds: sentenceEnds(lines), floor: FLOOR, words: EASE_WORDS };
  const cost = easeCostMs([words.length], WPM, e);
  const writeMs = words.length * (60_000 / WPM) + cost.perPassMs;
  const ign = len(NEON_SCHEDULES[id.toLowerCase()].pattern);
  const rimAt = t;
  const textAt = rimAt + ign;
  const doneAt = textAt + writeMs;
  /* next rim: when the head reaches word (n − few) — approximated at the plain pace for the last few words */
  const nextAt = doneAt - few * (60_000 / WPM) / FLOOR ** 0.5;
  console.log(`${id}   | ${String(words.length).padStart(5)} | ${(ign / 1000).toFixed(2).padStart(6)} s | ${(writeMs / 1000).toFixed(1).padStart(5)} s | ${(rimAt / 1000).toFixed(1).padStart(6)} s | ${(textAt / 1000).toFixed(1).padStart(6)} s | ${(doneAt / 1000).toFixed(1).padStart(6)} s`);
  t = nextAt;
}
console.log(`\n(today's fixed schedule: all four rims holding by ${(NEON_SEQUENCE_MS / 1000).toFixed(2)} s)`);
