/* ⛔⛔ THE /about §2 CARD COPY — ONE SOURCE FOR ALL FOUR CARDS. D-077, D-094.

   ⚠ WHY ONE MODULE: the copy will be read twice — by the rendered text on each card
   face AND by the `sr-only` DOM copy D-086 makes mandatory. Two copies of the words
   is two sources of truth, and an edit would reach one and miss the other.

   ⛔ PROVISIONAL — Carl, 4 September 2026: *"ok, copy is provisionally approved. It has
   to work in finite space, it may need tweaking."* PROVISIONAL → APPROVED is Carl's.

   ⛔⛔ THE BUILDER NEVER TRIMS THIS COPY TO MAKE IT FIT (D-094). When a card does not
   fit, the order is: the SETTING first, then the CARD SIZE (D-077), and only then the
   words — taken to Carl.

   ⚠ THE SOURCES, word for word: CA and CB were moved out of `wall-card-text.tsx`;
   CD and CS existed only in `live-work/about-section-thinking.md` ("FINAL FORM,
   4 September 2026"), which is gitignored. This file is now their only tracked home.

   ⚠ TWO PATTERNS A LATER EDITOR WOULD "FIX" — D-077. Leave them:
   - the wall pair (CA, CB) never says "you"; the floor pair does.
   - the tooling is never named — no product or model names.

   ⚠ ONE CLAIM AHEAD OF THE FACT, FLAGGED AND NOT RESOLVED (D-077): CS's
   "connected to the things the business actually runs on" is PRESENT TENSE. Whether
   the Strategist is wired to a live system is unanswered; if not, Carl's candidate
   fix is "can be connected to". ⛔ Not changed here — the words are Carl's. */

export type AboutCardId = "CA" | "CB" | "CD" | "CS";

export type AboutCardCopy = {
  id: AboutCardId;
  /** The seat's name. ⚠ Whether it is set like the body or as a title that
      "catches the light" is OPEN (D-094). */
  role: string;
  /** Placement is SETTLED (D-077) and reading order is the argument. ⛔ THE NEW ROOM, 25 September 2026
      (D-095): *"CS is above and CD is the floor"* — was CD "floor-left", CS "floor-right". ⚠ A LABEL:
      nothing reads it; the card's place is `ROOM_CARDS` in `about-room.ts`. */
  position: "wall-left" | "wall-right" | "above" | "floor";
  body: string;
  /** ⛔ The line that must survive any trim (D-077). If a card cannot fit while
      keeping it, the CARD SIZE is wrong, not the line. Must appear in `body`
      verbatim. ⚠ Unasserted here — the fit check is where it gets checked. */
  keepLine: string;
};

/* Reading order: CA, CB, CD, CS. ⛔ NO CARD IS A STEP (D-077) — the order is how
   the section is read, not a sequence the work passes through. */
export const ABOUT_CARD_COPY: readonly AboutCardCopy[] = [
  {
    id: "CA",
    role: "The Architect",
    position: "wall-left",
    /* ⛔⛔ EDITED BY CARL'S OPTIONS, 25 September 2026 (second session), to FIT the card: *"We have the option
       of inserting 'is' between project and operating. Lose the full stop. Put it at the end of environment.
       We could lose 'evaluates'. Modular is optional. The hyphen [the em dash] must definately go, if anything
       screams AI its that. can execute can be executes. Exactly can be precisely. And can go. did not for
       didnt… Use one or all. Your discression. Goal is to make it fit in the best possible way."*
       ⚠ CHOSEN BY MEASUREMENT: all 128 combinations set with the real font at 52–74 mm. **This one, at 68 mm,
       sets as two FULL pages of 6 lines, widest justified gap 2.82× a space** (the old copy at 60 mm: 12 lines
       in 7 slots, 7.15×). A dozen combinations tie; of those, "evaluates" is KEPT (dropping it needed words
       added to stay grammatical) and "exactly" is KEPT ("precise components… executes precisely" repeats).
       Used: "is" + the full stop moved, "modular" out, the em dash out, "executes", "And" out, "didn’t".
       ⚠ "’" is the typographic apostrophe — the extruded font is re-subset to include it
       (`scripts/build-geist-typeface.mjs`). ⚠ The KEEP-LINE follows the body (it must appear verbatim).
       Was: "The technical foundation of every project. Operating directly inside the development environment,
       the Architect collaborates on feature design, evaluates system logic, and solves structural problems
       before a single line of production code is written. High-level ideas are broken down into precise,
       modular components — a clear blueprint the Builder can execute exactly. And the work is then checked by
       someone who did not do it." */
    /* ⛔⛔ REVISED THE SAME DAY WITH BALANCED BREAKS (`setBalanced`, now the default) — Carl, on seeing it laid
       out: *"That looks a lot better."* "evaluates" OUT (with the Builder's grammatical repair *"design and
       system logic, and solves"*) and "can execute" KEPT (with "executes", line 10 opens to 4.59×). At 68 mm:
       12 lines in 6 slots, widest gap 2.82×, ONE weak line-ending (was 5), and **page 1 ends on a full
       sentence** — *"…line of production code is written."* — with page 2 opening *"High-level ideas…"*.
       The version above this one read "…design, evaluates system logic, and solves… the Builder executes
       exactly." */
    body: "The technical foundation of every project is operating directly inside the development environment. The Architect collaborates on feature design and system logic, and solves structural problems before a single line of production code is written. High-level ideas are broken down into precise components, a clear blueprint the Builder can execute exactly. The work is then checked by someone who didn’t do it.",
    keepLine: "The work is then checked by someone who didn’t do it",
  },
  {
    id: "CB",
    role: "The Builder",
    position: "wall-right",
    /* ⛔⛔ EDITED BY CARL'S OPTIONS TO FIT, 25 September 2026 (second session) — his choice, "B", of the two best
       fits from all 48 combinations (`live-work/scripts/cb-edits.mjs`): *"'Where the' may not be needed.
       Aproved plans become… 'Production' may not be needed. Code stays within the brief. plans are constantly
       verified. Approved plans build the site."* **At 68 mm (CA's size): 12 lines in 6 slots — two FULL pages
       — widest gap 3.45×, two weak line-endings.** A BOOKEND: the card opens *"Approved plans become the
       site."* and closes *"Approved plans build the site."* ⚠ "In a shared environment" was offered and not
       used (it helped none of the best fits). ⚠ The KEEP-LINE is Carl's own, shortened by Carl.
       Was: "Where the approved plan becomes the site. Stationed in the same environment as the Architect, the
       Builder drafts the implementation step by step, then passes it back for review and amendment before any
       production code is written. Each piece of work has a declared scope, and the Builder cannot reach
       outside it. Code is only good when it stays within the brief. The plan is verified against the work as
       it goes, so the site that gets built is the site that was approved." */
    body: "Approved plans become the site. Stationed in the same environment as the Architect, the Builder drafts the implementation step by step, then passes it back for review and amendment before any code is written. Each piece of work has a declared scope, and the Builder cannot reach outside it. Code stays within the brief. Plans are constantly verified against the work. Approved plans build the site.",
    /* ⛔ Carl wrote this line himself — and shortened it himself (was "Code is only good when it stays within
       the brief."). */
    keepLine: "Code stays within the brief.",
  },
  {
    id: "CD",
    role: "The Designer",
    position: "floor",
    /* ⛔ THE EM DASH OUT — Carl, 25 September 2026: *"Em dashes can go"* (on CA: *"if anything screams AI its
       that"*). A comma, the smallest change; the keep-line is untouched. Was: "…treated as the baseline — not
       a blank page, and not a template."
       ⛔ FITTED BY CARL'S EDITS — 25 September 2026 (third session). As written it set to 9 lines in 4 slots at
       68 mm (three pages, one line on the last) and line 1 opened to 5.52×. Carl: *"Brand is material. taken from
       an existing site. or template. Any is optional"*, then *"now try "Your" brand"*. All three edits on, with
       "Your": **8 lines, two full pages, widest gap 2.15×** (line 1 1.35×). The keep-line is HIS edit, so it
       follows. Was: "Your brand is the material. … taken from what you already have … not a blank page, and not
       a template." Searches: `live-work/scripts/cd-edits.mjs`, `cd-order-probe.mjs`; reasoning: the D-095 tail. */
    body: "Your brand is material. Typography, colour, assets and tone are taken from an existing site and treated as the baseline, not a blank page or template. From there the design is elevated into a bespoke prototype that sets the visual direction before any coding begins.",
    keepLine: "not a blank page or template",
  },
  {
    id: "CS",
    role: "The Strategist",
    position: "above",
    /* ⛔ THE EM DASH OUT — Carl, 25 September 2026: *"Em dashes can go."* A comma. Was: "…the business it exists
       to serve — connected to the things…".
       ⛔ FITTED BY CARL'S EDITS — 25 September 2026 (third session). As written it set to 8 lines in 3 slots at
       68 mm (three pages, two lines on the last). Carl chose two pages and offered five cuts (*"'other' is
       optional. 'exists' is optional… 'actually' is optional. and is too. 'and nothing it touches is the site
       itself.' all that can go"*); the fewest that fit, taken on his *"proceed with your recommendation"*: the
       close cut and "and" out — **6 lines, two full pages, widest gap 1.72×**. The keep-line is untouched and
       now ends the card. Was: "…actually runs on, and answering from those… without a decision, and nothing it
       touches is the site itself." Search: `live-work/scripts/cs-edits.mjs`; reasoning: the D-095 tail. */
    body: "Every other seat is pointed at the website. This one is pointed at the business it exists to serve, connected to the things the business actually runs on, answering from those rather than from general knowledge. It advises only. Nothing it recommends becomes work without a decision.",
    keepLine: "Nothing it recommends becomes work without a decision",
  },
];

export function aboutCardCopy(id: AboutCardId): AboutCardCopy {
  const card = ABOUT_CARD_COPY.find((c) => c.id === id);
  if (!card) throw new Error(`about-card-copy: no copy for ${id}`);
  return card;
}
