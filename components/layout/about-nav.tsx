/* ⚠⚠ THE `/about` NAV — FOUR PLAIN LINKS, NO DROPDOWN. Carl, 1 September 2026.

   ⛔⛔ THIS ROUTE NO LONGER RENDERS `NAV_LINKS`. It carries its own list, and that
   is the whole point: the shared list is built for the landing page's sections,
   and `/about` needs its own.

   Carl's instruction, verbatim: *"In the about header we have home. That is
   needed. But i dont think its neccersary to have Work and Services there. They
   are already on the home page with navigation. Change Services to Roles with
   navigation. Change Work to Examples with navigation. Change roles to contact
   with navigation and delete the dropdown list. Delete the contact that is the
   5th item. That will be a lot cleaner and solve the mobile problem."*

   ⛔ SECTION 1 IS DELIBERATELY ABSENT — arriving there is what loading the page
   does. Carl, 31 August: *"We dont need section 1 Founder, we are already
   there."* ⚠ Same rule as `Home` on the landing page and `Contact` on `/start`:
   you cannot navigate to where you already are.

   ⛔⛔ WHAT THIS REPLACED, AND WHY IT MATTERS THAT IT IS GONE. From 31 August to
   1 September this file held the site's ONLY hover-revealed navigation: `About`
   was swapped for a `Roles` trigger that opened a panel of `Examples` and `TBD`.
   It was built over a stated objection — a new interaction mechanism
   (CLAUDE.md §5a), the touch and keyboard paths it obliged, and Rule 8's
   *"hover-only appearance is a regression unless explicitly requested"*.

   ⚠⚠ THE MOBILE COST WAS REAL AND CARL REMOVED THE CAUSE RATHER THAN DEFERRING
   IT. Hover does not exist on touch, so the panel opened only via focus, and
   `Examples` and `Start` were effectively unreachable on a phone. ⛔ FOUR PLAIN
   LINKS HAVE NO REVEAL STEP AT ALL — there is nothing left to fail.

   ⚠ ALSO GONE WITH IT: the 120ms close delay, the `wasOpenOnPress` pointerdown
   capture (which existed because focus fired before click and cancelled the
   toggle), `aria-expanded`/`aria-haspopup`, the Escape handler, and
   `w-[38.293px]`. ⛔ THAT WIDTH WAS THE MEASURED WIDTH OF THE WORD "About" and
   existed ONLY to stop the row shifting when `Roles` occupied `About`'s slot in
   the SHARED list. There is no shared slot now, so the constraint is gone —
   do not reintroduce it.

   ⛔⛔ ALL FOUR ITEMS ADDRESS THIS PAGE. Carl corrected item 4 on the same day —
   *"My mistake, Contact should say 'start' and lead to Sec 4"* — so it is `Start`
   -> `#start`, NOT `Contact` -> `/start`. ⚠ THE HEADER TAKES THE READER TO THE
   INVITATION RATHER THAN SKIPPING PAST IT: section 4 is the conclusion, and the
   `Start a conversation` button inside it is what leaves for `/start`.

   ⚠ THIS MAKES `id="start"` IN `app/about/page.tsx` LOAD-BEARING. It was renamed
   from `tbd` earlier the same day and briefly had no consumer. ⛔ The pair must
   move together or this link goes nowhere silently.

   ⚠ KNOWN AND ACCEPTED: `/about` no longer links to `#services` or `#work`.
   Carl's call — they are reachable from the landing page, which `Home` routes to.

   ⚠ BELOW `md` this nav is invisible along with the rest of the row — the same
   known gap recorded for `/start`. A mobile control belongs to the header design
   Carl has deferred (D-035's mastering pass). */
const ABOUT_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Roles",    href: "#roles" },
  { label: "Examples", href: "#examples" },
  { label: "Start",    href: "#start" },
];

export default function AboutNav() {
  return (
    <>
      {ABOUT_LINKS.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200"
        >
          {label}
        </a>
      ))}
    </>
  );
}
