/* ⛔⛔ THE CARD TEXT'S SETTING AND TIMING — "THE COPY CHASING ITSELF". D-094.
   Pure functions: no three, no React. `card-extrude.tsx` draws what these say.

   Carl, 24 September 2026: *"If we get through say, 75% of the cards visible text,
   the earlier text ( first sentence) could be removed and as the user is coming to
   the last few words on the cards, space will be available at the beginning. Look
   at the text reveal on the start page. Its not a random number. Its at the speed
   that an average person reads at."*

   ⛔ THE MODEL: the paragraph is set ONCE, justified, into lines. The card has N
   line SLOTS. A WRITE head reveals line after line at reading pace, left to right;
   an ERASE head follows K lines behind, wiping left to right at the same pace, so
   the slot is free before the write head wraps back into it.
   ⛔ AMENDED BY CARL, 24 September, on seeing it: *"once it has gone through all of
   the copy its starts again immediately underneath the last sentence. This makes
   it hard to understand the beginning and end of the copy… once it has reached
   the end it should start again from the top left. To make space for it have the
   preceeding text disappear. Only when the last word has disappeared then start
   the cycle again."* So a pass ENDS by erasing everything left, and the next pass
   begins on an EMPTY card, at slot 0. The rest (`restMs`) sits after the clear.
   ⚠ The LEAD (a faster first line) remains as a parameter; its default is OFF
   since the same day — see `card-extrude.tsx`.

   ⚠ EVERY TIMING IS A CANDIDATE, set in `card-extrude.tsx` behind faders. */

// ── The setting — justified lines from the font's own advances ───────────────

export type SetLine = { words: string[]; xs: number[]; width: number; justified: boolean };

/**
 * Greedy breaks, then justify every line but the last by sharing its slack
 * across its gaps. ⛔ NEVER DROPS A WORD — an over-long word gets its own line and
 * is reported. ⚠ PROVISIONAL: greedy breaks and a left-set last line; the chosen
 * breaks and the last-line rule belong to the fit chunk.
 *
 * ⚠ The canvas-measured twin is `layoutJustified` in `card-etch.ts` (the etched
 * take, superseded). This one measures with the EXTRUDED font's own advances, so
 * the words are placed where the geometry actually draws them.
 */
export function setJustified(
  words: string[],
  widthOf: (w: string) => number,
  space: number,
  blockW: number,
): { lines: SetLine[]; widestGap: number; overlong: string[] } {
  const widths = words.map(widthOf);
  const rows: number[][] = [];
  let row: number[] = [];
  let rowW = 0;
  const overlong: string[] = [];
  words.forEach((w, i) => {
    const add = row.length === 0 ? widths[i] : rowW + space + widths[i];
    if (row.length > 0 && add > blockW) {
      rows.push(row);
      row = [i];
      rowW = widths[i];
    } else {
      row.push(i);
      rowW = add;
    }
    if (widths[i] > blockW) overlong.push(w);
  });
  if (row.length) rows.push(row);

  let widestGap = 0;
  const lines = rows.map((r, li) => {
    const last = li === rows.length - 1;
    const sum = r.reduce((s, i) => s + widths[i], 0);
    const gaps = r.length - 1;
    const justified = !last && gaps > 0;
    const gap = justified ? (blockW - sum) / gaps : space;
    if (justified) widestGap = Math.max(widestGap, gap / space);
    const xs: number[] = [];
    let x = 0;
    for (const i of r) {
      xs.push(x);
      x += widths[i] + gap;
    }
    return { words: r.map((i) => words[i]), xs, width: x - gap, justified };
  });
  return { lines, widestGap, overlong };
}

// ── The timing — the chase ──────────────────────────────────────────────────

export type ChaseParams = {
  /** Reading pace. D-094: ~240 recommended, Carl's stopwatch ~200. */
  wpm: number;
  /** The first line of each pass reveals in this fraction of its reading time. */
  lead: number;
  /** The rest after the last line, before the copy begins again. */
  restMs: number;
  /** Line slots on the card. */
  slots: number;
  /** "75% of the card's visible text": the erase trails the write by this many
      lines. Derived by `eraseLag`. */
  lag: number;
};

/**
 * ⛔ THE ERASE LAG — Carl's 75%, held so the wipe ALWAYS frees a slot before the
 * write head needs it: at most `slots − 2`, so a whole line's time separates the
 * erase finishing from the slot being rewritten.
 */
export function eraseLag(slots: number): number {
  return Math.max(1, Math.min(slots - 2, Math.floor(slots * 0.75)));
}

export type LineState = {
  /** The line of the PARAGRAPH (0..L−1) shown. */
  line: number;
  /** The slot (0..N−1) it occupies on the card. */
  slot: number;
  /** 0..1, left to right. */
  reveal: number;
  /** 0..1, left to right. 1 = gone. */
  erase: number;
};

export type Chase = {
  /** Every line visible at `tMs` after the start (none before 0). */
  at: (tMs: number) => LineState[];
  /** One pass, rest included — the loop's period. */
  periodMs: number;
  /** ms from a line's reveal starting to its erase starting — the worst case
      over one pass. The time a slower reader has before the line they are on
      begins to go (D-094's "grace"). */
  graceMs: number;
  /** Lines whose erase had to be CUT SHORT to free the slot in time. Should be
      0; published rather than hidden (the guard-that-hides-its-skips lesson). */
  clipped: number;
};

export function chase(wordsPerLine: number[], p: ChaseParams): Chase {
  const L = wordsPerLine.length;
  const N = p.slots;
  const K = p.lag;
  const readMs = (line: number) => (wordsPerLine[line] / p.wpm) * 60_000;
  const writeMs = (line: number) => readMs(line) * (line === 0 ? p.lead : 1);

  /* ⛔ ONE PASS, SCHEDULED ONCE — every pass is identical and they never overlap
     (Carl, 24 September: the copy restarts only when the last word has gone).
     Within a pass: line i writes into slot i mod N; its erase starts when line
     i+K starts writing. After the LAST line is written, nothing new writes: the
     erase head carries on through the remaining lines at the same pace, line
     after line, until the card is empty. Then the rest, then the next pass from
     slot 0 — the top left. */
  const ws: number[] = [];
  let t = 0;
  for (let i = 0; i < L; i++) {
    ws.push(t);
    t += writeMs(i);
  }
  const writeEnd = t;
  const es: number[] = [];
  const ed: number[] = [];
  let clipped = 0;
  for (let i = 0; i < L; i++) {
    const start = i + K < L ? ws[i + K] : Math.max(writeEnd, i > 0 ? es[i - 1] + ed[i - 1] : 0);
    /* The erase lasts the line's reading time — unless its slot is needed by
       line i+N first, in which case it is CUT SHORT and counted. */
    let dur = readMs(i);
    if (i + N < L && start + dur > ws[i + N]) {
      dur = Math.max(1, ws[i + N] - start);
      clipped++;
    }
    es.push(start);
    ed.push(dur);
  }
  const clearMs = es[L - 1] + ed[L - 1];
  const periodMs = clearMs + p.restMs;

  let graceMs = Infinity;
  for (let i = 0; i < L; i++) graceMs = Math.min(graceMs, es[i] - ws[i]);

  const at = (tMs: number): LineState[] => {
    if (tMs < 0) return [];
    const local = tMs % periodMs;
    const out: LineState[] = [];
    for (let i = 0; i < L; i++) {
      if (ws[i] > local) break;
      const e1 = es[i] + ed[i];
      if (local >= e1) continue;
      out.push({
        line: i,
        slot: i % N,
        reveal: Math.min(1, (local - ws[i]) / writeMs(i)),
        erase: local <= es[i] ? 0 : Math.min(1, (local - es[i]) / ed[i]),
      });
    }
    return out;
  };

  return { at, periodMs, graceMs, clipped };
}
