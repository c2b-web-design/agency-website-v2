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
    body: "The technical foundation of every project. Operating directly inside the development environment, the Architect collaborates on feature design, evaluates system logic, and solves structural problems before a single line of production code is written. High-level ideas are broken down into precise, modular components — a clear blueprint the Builder can execute exactly. And the work is then checked by someone who did not do it.",
    keepLine: "the work is then checked by someone who did not do it",
  },
  {
    id: "CB",
    role: "The Builder",
    position: "wall-right",
    body: "Where the approved plan becomes the site. Stationed in the same environment as the Architect, the Builder drafts the implementation step by step, then passes it back for review and amendment before any production code is written. Each piece of work has a declared scope, and the Builder cannot reach outside it. Code is only good when it stays within the brief. The plan is verified against the work as it goes, so the site that gets built is the site that was approved.",
    /* ⛔ Carl wrote this line himself. */
    keepLine: "Code is only good when it stays within the brief.",
  },
  {
    id: "CD",
    role: "The Designer",
    position: "floor",
    body: "Your brand is the material. Typography, colour, assets and tone are taken from what you already have and treated as the baseline — not a blank page, and not a template. From there the design is elevated into a bespoke prototype that sets the visual direction before any coding begins.",
    keepLine: "not a blank page, and not a template",
  },
  {
    id: "CS",
    role: "The Strategist",
    position: "above",
    body: "Every other seat is pointed at the website. This one is pointed at the business it exists to serve — connected to the things the business actually runs on, and answering from those rather than from general knowledge. It advises only. Nothing it recommends becomes work without a decision, and nothing it touches is the site itself.",
    keepLine: "Nothing it recommends becomes work without a decision",
  },
];

export function aboutCardCopy(id: AboutCardId): AboutCardCopy {
  const card = ABOUT_CARD_COPY.find((c) => c.id === id);
  if (!card) throw new Error(`about-card-copy: no copy for ${id}`);
  return card;
}
