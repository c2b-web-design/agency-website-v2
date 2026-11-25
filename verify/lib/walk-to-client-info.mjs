/**
 * WALK /start TO CLIENT INFO, AS A VISITOR DOES — the shared route for every harness that needs the contact field.
 *
 * ⚰️ REPLACES THE `?skip=1` DEV DOOR (retired 25 November 2026; Carl: *"There are no visible issues so it was just your
 * shortcut to get there. Implement 1."*). The door mounted the completion state from the URL in the browser only, so the
 * server rendered the opening and the browser the contact field: a hydration failure, and the dev overlay's "2 Issues".
 * A harness that still loads `?skip=1` now lands on the OPENING and would measure the wrong screen — use this.
 *
 * The route is the 17 October walk (`live-work/scripts/logo-return-timing-17-october.mjs`), proven again on 25 November
 * (`live-work/scripts/start-walk-to-client-info-25-november.mjs`: reached, no issue badge, no console error): load
 * `/start`, Begin, then Q5 → Q1 each answered with CARD 1 and Next step. It THROWS if a step's target is missing or the
 * Send button never appears — it never returns on a page that is not client info.
 *
 * Returns once the Send button (`.enquiry-send-btn`) is in the page: completion has mounted, and the field's own
 * entrance (`FIELD_ENTRANCE_END_MS`) is starting — so a caller's existing wait for that entrance still applies.
 *
 * ⚠ NOT WATCHED: answers other than card 1; the corridor's own timing (the waits are the walk's proven fixed waits, ~60 s
 * in all, not measured readiness).
 *
 *   import { walkToClientInfo } from "./lib/walk-to-client-info.mjs";
 *   await walkToClientInfo(page, BASE);
 */
export async function walkToClientInfo(page, base = "http://localhost:3000", path = "/start") {
  await page.goto(`${base}${path}`, { waitUntil: "load" });
  await page.waitForTimeout(9000);
  await page.getByRole("button", { name: /begin/i }).click();
  await page.mouse.move(5, 5);
  for (const q of [5, 4, 3, 2, 1]) {
    await page.waitForTimeout(q === 5 ? 7000 : 5000);
    const card = await page.getByTestId("answer-card-hover-0").boundingBox();
    if (!card) throw new Error(`walkToClientInfo: Q${q} — answer card 1 not found; the walk did not reach Q${q}`);
    await page.mouse.click(card.x + card.width / 2, card.y + card.height / 2);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(2500);
    const next = await page.getByRole("button", { name: /next step/i }).first().boundingBox();
    if (!next) throw new Error(`walkToClientInfo: Q${q} — no Next step button after selecting card 1`);
    await page.mouse.click(next.x + next.width / 2, next.y + next.height / 2);
    await page.mouse.move(5, 5);
  }
  await page.locator(".enquiry-send-btn").first().waitFor({ state: "attached", timeout: 15000 }).catch(() => {
    throw new Error("walkToClientInfo: the Send button never appeared — client info was not reached");
  });
}
