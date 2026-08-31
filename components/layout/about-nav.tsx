"use client";

import { useState, useRef } from "react";
import { NAV_LINKS } from "@/components/layout/nav-links";

/* ⚠⚠ THE `/about` NAV — `About` IS REPLACED BY `Roles`, WHICH OPENS A DROPDOWN.
   Carl's decision, 31 August 2026: *"Seeing as we are already in the about
   section, having about there seems a bit redundant. What if we replaced about
   with Roles and hovering over it would produce a drop down list of Examples
   and TBD?"*

   ⛔ THE `About` REMOVAL IS THE SAME RULE APPLIED A THIRD TIME: you cannot
   navigate to where you already are. `Home` is filtered from the landing page's
   header for this reason; section 1 is excluded from this list for it too.

   ⚠⚠ THIS IS THE SITE'S FIRST HOVER-REVEALED NAVIGATION, AND IT WAS BUILT OVER A
   STATED OBJECTION. Carl was given the costs — a new interaction mechanism
   (CLAUDE.md §5a), the touch and keyboard paths it obliges, and Rule 8's
   "hover-only appearance is a regression unless explicitly requested" — and
   chose it anyway. ⛔ RULE 8 IS SATISFIED BY THE "EXPLICITLY REQUESTED" CLAUSE,
   NOT BY THE PATTERN BEING SAFE. Recorded so a later reader does not take this
   as the house style.

   ⛔⛔ HOVER IS NOT THE ONLY PATH, AND IT MUST NOT BECOME ONE:
     - POINTER: mouseenter/mouseleave on the wrapper.
     - KEYBOARD: focus/blur on the wrapper, plus Escape to close. The trigger is
       a real <button>, so it is tabbable and announces state via aria-expanded.
     - TOUCH: hover DOES NOT EXIST there. The trigger responds to click, which is
       the only reason this is reachable on a phone at all.
   ⚠ REMOVING ANY OF THESE LEAVES A GROUP OF USERS WITH NO ROUTE TO THE LINKS.

   ⚠ BELOW `md` THIS IS INVISIBLE along with the rest of the nav — the same known
   gap recorded for `/start`. A mobile control belongs to the header design Carl
   has deferred. */

/* ⛔ THE SECTIONS, AND SECTION 1 IS DELIBERATELY ABSENT. Carl: *"We dont need
   section 1 Founder, we are already there."* Arriving at section 1 is what
   loading the page does.

   ⚠ "Roles" IS THE SETTLED NAME for section 2 — Carl, 31 August 2026, closing
   the question left open on 30 August (*"Does it have to be called 'meet the
   team?' No."*). ⛔ "TBD" IS A PLACEHOLDER LABEL FOR AN UNDECIDED SUBJECT, not a
   name. When Carl decides section 4, this label and that section's heading
   change together. */
const SECTION_LINKS = [
  { label: "Examples", href: "#examples" },
  { label: "TBD",      href: "#tbd" },
];

export default function AboutNav() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* ⚠ Whether the panel was open BEFORE the current press began — captured on
     pointerdown, which fires before focus. Without it a click cannot close the
     panel, because focus reopens it first. See the trigger below. */
  const wasOpenOnPress = useRef(false);

  /* ⚠ A SMALL CLOSE DELAY. Without it, any momentary gap between the trigger and
     the panel fires mouseleave and the menu closes under the pointer before it
     arrives. ⛔ 120ms is short enough not to feel sticky, long enough to cross. */
  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <>
      {NAV_LINKS.map(({ label, href }) => {
        /* ⛔ `About` IS REPLACED IN PLACE, NOT REMOVED AND APPENDED. Keeping the
           slot means the other four links do not shift position between routes —
           the same immobility principle the mark and the nav row already follow
           (D-065). */
        if (label === "About") {
          return (
            <div
              key="roles"
              className="relative"
              onMouseEnter={openNow}
              onMouseLeave={closeSoon}
              onFocus={openNow}
              onBlur={(e) => {
                /* ⚠ Close only when focus leaves the WHOLE group, not when it
                   moves between the trigger and the items inside it. */
                if (!e.currentTarget.contains(e.relatedTarget as Node)) closeSoon();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            >
              {/* ⚠⚠ `onClick` TOGGLES OFF THE LIVE STATE, AND THAT IS NOT THE
                  SAME AS `!open`. ⛔ MEASURED DEFECT: clicking the trigger did
                  NOTHING. A click focuses the button first, `onFocus` opens the
                  panel, and a naive `setOpen(v => !v)` then closed it in the same
                  gesture — so the TOUCH PATH, the only route on a phone, was
                  dead while hover and keyboard both worked.

                  ⚠ Reading `open` here is correct because the focus-driven
                  `setOpen(true)` has already flushed by the time the click
                  handler runs; the functional form saw the SAME post-focus value
                  and inverted it right back. ⛔ The fix is to close only when it
                  was ALREADY open before this gesture began. */}
              {/* ⚠⚠ `leading-5 block` MAKES THE BUTTON MATCH THE ANCHORS' BOX.
                  ⛔ MEASURED: `Roles` sat at top 31.428 against every anchor's
                  30.486 — 0.942px LOW. A <button> is an inline-block with its own
                  line-height metrics; the sibling <a>s are `text-sm` with a 20px
                  line box. Forcing the same line-height and display puts the two
                  element types on one baseline.

                  ⚠⚠ AND `w-[38.293px]` HOLDS THE ROW STILL. ⛔ MEASURED: "Roles"
                  is 35.846px wide against "About"'s 38.293px, and because the row
                  is `justify-end`, that 2.447px difference pushed EVERY LINK LEFT
                  OF IT 2.447px to the right — Home, Services and Work all moved,
                  while Contact (right of the trigger) did not. Carl saw it as the
                  words "move slightly right".

                  ⛔ THE WIDTH IS THE MEASURED WIDTH OF THE WORD IT REPLACES, not
                  a round number, and it is why the other links do not move
                  between routes at all. ⚠ IT IS ALSO FRAGILE: it is tied to
                  "About" in THIS font at THIS size. If the nav font changes — the
                  decision Carl is weighing — this value is stale and the row will
                  shift again. THE FIX AT THAT POINT IS TO RE-MEASURE, or to give
                  every nav item a shared fixed width so no item's text can move
                  its neighbours. */}
              <button
                type="button"
                aria-expanded={open}
                aria-haspopup="true"
                onPointerDown={() => { wasOpenOnPress.current = open; }}
                onClick={() => setOpen(!wasOpenOnPress.current)}
                className="block leading-5 w-[38.293px] text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200 cursor-pointer"
              >
                Roles
              </button>

              {/* ⛔⛔ NO GAP BETWEEN THE TRIGGER AND THE PANEL, AND THAT SERVES
                  TWO PURPOSES AT ONCE.

                  ⚠ VISUAL — Carl, 31 August 2026: *"the words examples and TBD
                  should be closer to the word roles. Immediately under, they
                  look disconnected."* Tightened across two passes: the outer gap
                  `pt-2` -> `pt-1` -> none, the inner box `py-3` -> `pt-1.5 pb-2`,
                  `gap-2` -> `gap-1.5`. ⚠ THE INNER PADDING MATTERED AS MUCH AS
                  THE OUTER GAP: the perceived distance is trigger-to-TEXT, not
                  trigger-to-border, so closing the gap alone would still have
                  read as loose.

                  ⚠ MECHANICAL — the panel's box now TOUCHES the trigger, so the
                  pointer never crosses dead space on its way in. ⛔ NEVER USE
                  `mt-*` HERE: a margin puts a real gap outside the element,
                  `mouseleave` fires while crossing it, and the menu closes under
                  the pointer. The 120ms close delay above exists as the backstop
                  for that; this makes it unnecessary rather than relying on it.

                  ⚠⚠ CENTRED ON THE TRIGGER — Carl, 31 August 2026: *"The drop
                  down list should be centered. Below the word roles, its too
                  much to the left."* ⛔ It was `right-0`, which aligns the
                  panel's RIGHT EDGE to the trigger's, hanging the whole box to
                  the left of a short word. `left-1/2` + `-translate-x-1/2`
                  centres it on the trigger's midpoint regardless of how wide the
                  panel's contents are.

                  ⚠ THE ITEMS ARE CENTRED TOO (`items-center`, was `items-end`).
                  Right-aligned items inside a centred box would reintroduce the
                  same visual off-centre the fix exists to remove. */}
              <div className={`absolute left-1/2 -translate-x-1/2 top-full ${open ? "block" : "hidden"}`}>
                <div className="flex flex-col items-center gap-1.5 whitespace-nowrap bg-neutral-950 border border-neutral-800 px-4 pt-1.5 pb-2">
                  {SECTION_LINKS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      onClick={() => setOpen(false)}
                      className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <a
            key={label}
            href={href}
            className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200"
          >
            {label}
          </a>
        );
      })}
    </>
  );
}
