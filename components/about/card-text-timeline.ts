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

/**
 * ⛔⛔ BALANCED BREAKS — the paragraph's breaks chosen TOGETHER, not line by line. 25 September 2026
 * (second session); Carl: *"The 2 other routes you suggested, try them."* The greedy setter fills each line
 * and leaves the last one's slack to fall where it may, so one short line can take a 7× gap. This chooses
 * every break at once (dynamic programming) to minimise the paragraph's total badness:
 *
 *   - a justified line costs `(gap/space − 1)²` — the stretch, squared, so ONE very wide line costs more
 *     than several slightly wide ones (the book typesetter's principle);
 *   - ⛔ **SENSE** — a line that ENDS on a weak word (an article, a preposition, a conjunction, "is"…) costs
 *     `weakEnd` extra: the reader's eye should not arrive at "the" and have to find its noun on the next
 *     line. (Carl: *"We will see how good we both are at semantics."*)
 *   - the last line is set left and costs nothing — unless it is a single word (a widow): `widow`.
 *
 * `lines` (optional) forces the paragraph into exactly that many lines — so it can be asked to FILL the
 * card's pages. Same output as `setJustified`, so the chase and the drawing take either.
 */
const WEAK_ENDINGS = new Set([
  "a", "an", "the", "of", "to", "in", "on", "at", "by", "for", "with", "from", "into",
  "and", "or", "but", "nor", "is", "are", "was", "be", "as", "that", "who", "which", "it",
]);

export function setBalanced(
  words: string[],
  widthOf: (w: string) => number,
  space: number,
  blockW: number,
  opts: { lines?: number; weakEnd?: number; widow?: number } = {},
): { lines: SetLine[]; widestGap: number; overlong: string[]; cost: number } {
  const n = words.length;
  const widths = words.map(widthOf);
  const weakEnd = opts.weakEnd ?? 1.5;
  const widow = opts.widow ?? 4;
  const overlong = words.filter((_, i) => widths[i] > blockW);
  /** Cost of words [i, j) as one line; Infinity if they do not fit. */
  const lineCost = (i: number, j: number, last: boolean) => {
    let sum = 0;
    for (let k = i; k < j; k++) sum += widths[k];
    const gaps = j - i - 1;
    const natural = sum + gaps * space;
    if (natural > blockW && gaps > 0) return Infinity;
    /* ⛔ A LONE WORD MAY NOT HOLD A JUSTIFIED LINE (unless it is too long to share one). ⚠ The first build
       priced it at 25 and, forced to FILL a page count, the setter padded with "feature" / "who" / "did" /
       "not" on lines of their own — and `widestGap` (which only measures lines WITH gaps) read 1.83×, the
       best figure of the search. **A metric blind to the failure it rewards.** Caught by printing the lines. */
    if (!last && gaps === 0 && widths[i] <= blockW) return Infinity;
    let c = 0;
    if (last) c += j - i === 1 && n > 1 ? widow : 0;
    else c += gaps > 0 ? ((blockW - sum) / gaps / space - 1) ** 2 : 0;
    const end = words[j - 1].toLowerCase().replace(/[^a-z’']/g, "");
    if (!last && WEAK_ENDINGS.has(end) && !/[,.;:!?]$/.test(words[j - 1])) c += weakEnd;
    return c;
  };
  /* best[k][j]: the cheapest setting of words [0, j) in k lines. */
  const maxLines = opts.lines ?? n;
  const best: number[][] = Array.from({ length: maxLines + 1 }, () => new Array(n + 1).fill(Infinity));
  const from: number[][] = Array.from({ length: maxLines + 1 }, () => new Array(n + 1).fill(-1));
  best[0][0] = 0;
  for (let k = 1; k <= maxLines; k++) {
    for (let j = 1; j <= n; j++) {
      for (let i = j - 1; i >= 0; i--) {
        if (best[k - 1][i] === Infinity) continue;
        const c = lineCost(i, j, j === n);
        if (c === Infinity) break; // fewer words fit only by starting later — no earlier i fits either
        const total = best[k - 1][i] + c;
        if (total < best[k][j]) {
          best[k][j] = total;
          from[k][j] = i;
        }
      }
    }
  }
  let K = opts.lines ?? -1;
  if (K < 0) {
    let bestCost = Infinity;
    for (let k = 1; k <= maxLines; k++) if (best[k][n] < bestCost) { bestCost = best[k][n]; K = k; }
  }
  if (K < 1 || best[K][n] === Infinity) {
    /* Cannot be set in that many lines — fall back to greedy, and say so through `cost`. */
    return { ...setJustified(words, widthOf, space, blockW), cost: Infinity };
  }
  const breaks: number[] = [];
  for (let k = K, j = n; k > 0; j = from[k][j], k--) breaks.unshift(from[k][j]);
  const rows = breaks.map((b, i) => Array.from({ length: (breaks[i + 1] ?? n) - b }, (_, t) => b + t));

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
  return { lines, widestGap, overlong, cost: best[K][n] };
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
  /** When line i's erase starts: false = as line i+lag BEGINS writing; true = as the write head
      reaches the LAST WORD of line i+lag. See the note in `chase`. Absent = false. */
  eraseAtLastWord?: boolean;
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
  /** Erases started BEFORE the last-word cue so they finish at the pace (only with `eraseAtLastWord`).
      Published for the same reason as `clipped`. */
  broughtForward: number;
};

/**
 * ⛔⛔ EASING AT THE SENTENCES — Carl, 25 September 2026 (second session): *"Use ease in and out at the start
 * and end of every sentence. Be subtle. We dont want the flow to be interupted too much but i accept the
 * premise that by easing out thats exactly whay we are doing. i will have to judge it by eye and if you give
 * me some figures it would help. This is not an exact science. There is a certain tolerance allowed here."*
 *
 * ⛔ A SPEED PROFILE ALONG THE TEXT, NOT A CURVE PER LINE. The write head runs through the paragraph as one
 * stream, measured in WORDS (`s`, continuous across lines). Its speed is `wpm × g(s)`:
 *   - `g = 1` through a sentence — the start page's pace, untouched;
 *   - near a sentence boundary (the text's start, every `.`/`!`/`?`, the text's end) `g` dips smoothly to
 *     `easeFloor` AT the boundary, over `easeWords` words either side — ease OUT into the full stop, ease IN
 *     to the next sentence. A line break is NOT a boundary: mid-sentence, the wipe flows from line to line.
 * ⚠ **Easing costs time — Carl's premise, accepted.** Every boundary adds `easeWords × (1/g − 1)` averaged
 * over the ramp; `easeCostMs` reports it so the figures reach him with the look.
 * ⚠ The erase head uses the same profile, so it too slows through a full stop.
 *
 * ⚠ SUPERSEDED, SAME SESSION: the start page's `cubic-bezier(0.37, 0, 0.63, 1)` on EVERY LINE (after *"easing
 * should be used"*) — it stopped and started the wipe at every line break, mid-sentence. Carl's rule places
 * the ease where the SENSE pauses, not where the layout wraps.
 */
export type SentenceEase = {
  /** Word counts (cumulative, from the paragraph's start) at which a sentence ENDS. */
  sentenceEnds: number[];
  /** The speed AT a boundary, as a fraction of the pace. 1 = no easing. */
  floor: number;
  /** Words either side of a boundary over which the speed ramps. */
  words: number;
};

/** Sentence ends from the set lines: a word ending `.`, `!` or `?` (a closing quote/bracket allowed). */
export function sentenceEnds(lines: { words: string[] }[]): number[] {
  const ends: number[] = [];
  let n = 0;
  for (const l of lines) {
    for (const w of l.words) {
      n++;
      if (/[.!?]["”’)\]]?$/.test(w)) ends.push(n);
    }
  }
  if (ends[ends.length - 1] !== n) ends.push(n);
  return ends;
}

/**
 * The time map: `T(s)` ms to write up to word position `s`, and its inverse. Integrated numerically on a
 * fine grid (32 steps a word) — exact enough for a wipe, and done once per mount.
 */
function timeMap(totalWords: number, wpm: number, e: SentenceEase | undefined) {
  const msPerWord = 60_000 / wpm;
  const bounds = e ? [0, ...e.sentenceEnds] : [];
  const g = (s: number) => {
    if (!e || e.floor >= 1 || e.words <= 0) return 1;
    let d = Infinity;
    for (const b of bounds) d = Math.min(d, Math.abs(s - b));
    if (d >= e.words) return 1;
    const x = d / e.words;
    const smooth = x * x * (3 - 2 * x); // 0 at the boundary, 1 at the ramp's end, flat at both
    return e.floor + (1 - e.floor) * smooth;
  };
  const STEPS = 32;
  const n = Math.max(1, Math.ceil(totalWords * STEPS));
  const T = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) {
    const s = ((i - 0.5) / n) * totalWords;
    T[i] = T[i - 1] + (totalWords / n) * (msPerWord / g(s));
  }
  const at = (s: number) => {
    const x = Math.max(0, Math.min(n, (s / totalWords) * n));
    const i = Math.floor(x);
    return i >= n ? T[n] : T[i] + (T[i + 1] - T[i]) * (x - i);
  };
  const inv = (t: number) => {
    if (t <= 0) return 0;
    if (t >= T[n]) return totalWords;
    let lo = 0;
    let hi = n;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (T[mid] <= t) lo = mid;
      else hi = mid;
    }
    return ((lo + (t - T[lo]) / (T[lo + 1] - T[lo])) / n) * totalWords;
  };
  return { at, inv, totalMs: T[n], plainMs: totalWords * msPerWord };
}

/** What the sentence easing COSTS, for Carl's figures: ms added per boundary, and per pass. */
export function easeCostMs(wordsPerLine: number[], wpm: number, e: SentenceEase) {
  const total = wordsPerLine.reduce((a, b) => a + b, 0);
  const m = timeMap(total, wpm, e);
  const boundaries = e.sentenceEnds.length + 1; // the text's start, and every end
  return { perPassMs: m.totalMs - m.plainMs, perBoundaryMs: (m.totalMs - m.plainMs) / boundaries, boundaries };
}

export function chase(wordsPerLine: number[], p: ChaseParams, ease?: SentenceEase): Chase {
  const L = wordsPerLine.length;
  const N = p.slots;
  const K = p.lag;
  const total = wordsPerLine.reduce((a, b) => a + b, 0);
  const tm = timeMap(total, p.wpm, ease);
  /** Where line i starts, in words. */
  const c: number[] = [];
  let acc = 0;
  for (let i = 0; i < L; i++) {
    c.push(acc);
    acc += wordsPerLine[i];
  }
  /** The line's own time through the profile (the ease included). */
  const lineMs = (i: number) => tm.at(c[i] + wordsPerLine[i]) - tm.at(c[i]);
  const writeMs = (i: number) => lineMs(i) * (i === 0 ? p.lead : 1);
  /** Progress 0..1 across line i after `u` (0..1) of its time — the profile's shape inside the line. */
  const across = (i: number, u: number) => {
    const t = tm.at(c[i]) + Math.max(0, Math.min(1, u)) * lineMs(i);
    return Math.max(0, Math.min(1, (tm.inv(t) - c[i]) / wordsPerLine[i]));
  };

  /* ⛔ ONE PASS, SCHEDULED ONCE — every pass is identical and they never overlap
     (Carl, 24 September: the copy restarts only when the last word has gone).
     Within a pass: line i writes into slot i mod N; its erase starts when line
     i+K starts writing (or reaches its last word — `eraseCue`, below). After the LAST line is written, nothing new writes: the
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
  /* ⛔ THE ERASE WAITS FOR THE LAST WORD — Carl, 25 September 2026 (third session), on CS: *"Your right
     about the reveal catch up. It can start as the head is approaching the last word of the second line,
     not the beginning of it."* With 3 slots the lag is ONE line, so line i began to go the moment line i+1
     began: CS never showed more than two lines, at 16 s only one. Now (when `eraseAtLastWord`) line i's
     erase starts as the write head reaches the LAST WORD of line i+K — a full line later, less a word.
     ⚠ The slot guard below is unchanged: line i's erase still has until line i+N starts writing, and a cut
     short erase is still counted (`clipped`), never hidden.
     ⛔ MEASURED BEFORE BUILT: on CS the pure last-word cue cut lines 1 and 2 short — erased at 1.29× and
     1.12× the pace (`live-work/scripts/cs-erase-detail.mjs`), because each is longer than the line two below
     it. So where waiting for the last word would cut an erase short, it starts JUST EARLY ENOUGH to finish at
     the pace (never earlier than the old cue) — "approaching" the last word rather than on it. The pace is
     the rule that wins (the start page's, D-094). Counted as `broughtForward`, not hidden. */
  const eraseCue = (j: number) =>
    p.eraseAtLastWord
      ? ws[j] + (tm.at(c[j] + wordsPerLine[j] - 1) - tm.at(c[j])) * (j === 0 ? p.lead : 1)
      : ws[j];
  const es: number[] = [];
  const ed: number[] = [];
  let clipped = 0;
  let broughtForward = 0;
  for (let i = 0; i < L; i++) {
    let start = i + K < L ? eraseCue(i + K) : Math.max(writeEnd, i > 0 ? es[i - 1] + ed[i - 1] : 0);
    if (p.eraseAtLastWord && i + K < L && i + N < L) {
      const latest = Math.max(ws[i + K], ws[i + N] - lineMs(i));
      if (latest < start) {
        start = latest;
        broughtForward++;
      }
    }
    /* The erase lasts the line's own time — unless its slot is needed by
       line i+N first, in which case it is CUT SHORT and counted. */
    let dur = lineMs(i);
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
        reveal: across(i, (local - ws[i]) / writeMs(i)),
        erase: local <= es[i] ? 0 : across(i, (local - es[i]) / ed[i]),
      });
    }
    return out;
  };

  return { at, periodMs, graceMs, clipped, broughtForward };
}
