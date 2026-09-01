/* ⚠⚠ THE SITE'S NAV LINKS — ONE LIST, SHARED BY EVERY ROUTE THAT SHOWS A NAV.
   Extracted from `site-header.tsx` on 31 August 2026, on Carl's instruction.

   ⛔⛔ WHY THIS FILE EXISTS, AND IT IS NOT TIDINESS. `site-header.tsx` carries
   `"use client"`. A SERVER component importing a value from a client module does
   NOT get the value — it gets a client reference proxy, and the array's methods
   are missing. The build failed with exactly that:

       TypeError: g.NAV_LINKS.map is not a function
       Error occurred prerendering page "/about"

   ⚠ `/start` NEVER HIT THIS because it is itself a client component
   (`"use client"`), so the import resolved normally. `/about` is a SERVER
   component and broke immediately. ⛔ A plain `.ts` module with no directive is
   importable from both, which is what this is.

   ⚠ THE ALTERNATIVE WAS WORSE: a second hardcoded array on `/about`. That drifts
   the moment a link changes — and the links changed TWICE on the day this was
   written (`Home` added, then the three anchors route-qualified).

   ⛔ ROUTE-QUALIFIED, NOT BARE ANCHORS. `#services` resolves against the CURRENT
   page, so on `/start` it became `/start#services` — no target, does nothing.
   `/#services` navigates home AND scrolls, from anywhere. ⚠ That matters because
   this list is read from three routes, only ONE of which has those sections.

   ⚠ `Home` IS IN THIS LIST AND IS FILTERED OUT BY THE LANDING PAGE'S HEADER —
   see `HEADER_LINKS` in `site-header.tsx`. Carl, 31 August 2026: *"We are already
   there, you cant navigate to where you already are."* `/start` and `/about`
   render the full list. */
/* ⛔⛔ `Contact` ROUTES TO `/start`, NOT `/#contact`. Carl, 1 September 2026.

   ⚠⚠ THE FAULT IT FIXES, and it was created the same day: the landing page's
   `#contact` CTA was repointed from `/start` to `/about` and relabelled
   `Who we are`, so `/start` HAD NO INBOUND ROUTE FROM THE LANDING PAGE AT ALL.
   `Contact` still pointed at `/#contact` — a section that no longer invites the
   reader to start anything.

   ⛔ THE JOURNEY THIS COMPLETES:
       Home   = who we are and what we do   →  `Who we are`  →  /about
       About  = HOW                          →  `Start a conversation` → /start
       /start = the conversation, ending at the send button
   ⚠ `Contact` is the SHORTCUT for a reader who does not want the full walk.

   ⚠⚠ KNOWN AND ACCEPTED: this list is read by THREE routes, and on `/start`
   `Contact` now points at the page the reader is already on — the same
   redundancy `Home` has there. ⛔ It is NOT filtered, because filtering is a
   behaviour change Carl has not asked for. Flagged, not fixed. If it is ever
   filtered, do it the way `HEADER_LINKS` does in `site-header.tsx` — per route,
   not by deleting the entry, because the other routes need it.               */
export const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Work",     href: "/#work" },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/start" },
];
