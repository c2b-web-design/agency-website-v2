/**
 * THE PROOF FILM (D-105): `/start` from a COLD LOAD through Begin to a first answer hovered and chosen, on a production
 * build (`npm run build && npx next start -p 3100`). The hardest case for the capture: WebGL, CSS reveals, a hover and a
 * click. ⚠ C2B-specific code in a tool folder: the workshop reference's Open Question 2 (as `verify/`).
 *
 *   node scripts/client-film/film.mjs scripts/client-film/films/start-opening.film.mjs
 */
const film = {
  url: "http://localhost:3100/start",
  title: "Start a conversation",
  client: "C2B Web Design",
  // ⛔ THE PROOF keeps the cold load (it tests the capture); a client film cuts in at `ready` (Carl: "Cut in when the page
  // is ready")
  coldLoad: true,
  // B3: Begin's hit control drops `aria-disabled` as its reveal STARTS (`enquiry-opening.tsx`, `setBeginActive`), so the
  // settle covers the reveal
  ready: { selector: ".enquiry-begin-hit:not([aria-disabled])", settleMs: 1500 },
  scenes: [
    {
      caption: "Press Begin to start the conversation.",
      run: async (h) => {
        await h.click(".enquiry-begin-hit", { ms: 900 });
        await h.page.locator('[data-testid="answer-card-hover-1"]').waitFor({ state: "visible", timeout: 30_000 });
        // the cards enter in turn; the last has landed by about 3 s (seen on the first proof film: at 1.5 s the bottom row
        // was still arriving)
        await h.wait(3200);
      },
    },
    {
      caption: "Hover an answer: the card lifts and lights.",
      captionPosition: "top",
      run: async (h) => {
        await h.hover('[data-testid="answer-card-hover-1"]', 900);
        await h.wait(2000);
      },
    },
    {
      caption: "Choose it, and Next step appears.",
      captionPosition: "top",
      run: async (h) => {
        await h.click('[data-testid="answer-card-hover-1"]', { ms: 300 });
        await h.wait(2200);
      },
    },
    {
      caption: "Next step takes you to the next question.",
      captionPosition: "top",
      run: async (h) => {
        await h.click(".enquiry-nextstep-btn", { ms: 800 });
        await h.wait(4500);
      },
    },
  ],
};
export default film;
