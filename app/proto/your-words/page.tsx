import YourWordsSection from "@/components/showcase/your-words-section";

/**
 * ⛔ "YOUR WORDS, GIVEN FORM" — FILM 4's PAGE (D-088, 23 October 2026, session 2). Two viewports in height (Carl, 22 October:
 * *"lets make it 2 viewports in height. It will act as a showcase for modern web development"*):
 *   1. "Your company" — the LINE, STATIC, lit by a static light;
 *   2. "Your company logo" — the ARCH, a TRAVELLING light, the logo ANIMATED.
 * One material on both (brushed brass, pass 2). ⛔ APPROVED WHOLE (R-094, 26 October 2026): viewport 1 under stage light
 * (R-092); viewport 2 under a MOVING CAMERA — orbit, the tilt under the N, the pull-out — lit by lamps on the orbit's axis
 * (R-093); the travelling light PARKED. ⚠ Was, 23 October: "Pass 3 … is designed HERE, not yet built: until then each piece is
 * lit by the bench's judging studio alone." The scene is drawn by `lettering-piece.tsx` (lifted 26 October, shared with the
 * camera bench `/proto/camera`, proved pixel-identical). Built on the bench `/proto/showcase` (its switches unchanged),
 * from ONE mechanism (`components/showcase/lettering-hooks.tsx`). A canvas per viewport — the structural note
 * `live-work/structural-note-showcase-two-viewports-23-october.md` v2, option A. The name: the Builder's, delegated by Carl
 * (*"Call the page by an appropriate name"*) — film 4's own title; a client reads the link.
 *
 * ⛔ NOINDEX, AND IT MUST STAY SO AT LAUNCH. A client may be sent this link (Carl: *"The ability to send to clients would be
 * useful"*). The site-wide blocks (`app/robots.ts`, `app/layout.tsx`'s `robots`) are marked REMOVE BEFORE LAUNCH; this page's
 * own `robots` is the protection that survives them. ✔ The link is NOT sent (Carl, 26 October 2026: *"We will just use the film
 * in About."*) — `app/robots.ts`'s 28 July position stands; the page is seen through `/about` §3's box 4.
 *
 * ⚠ The ground is the bench's near-black (`#0a0a0a`) — a default, not ruled; the themed stock images come later.
 */
export const metadata = {
  title: "Your words, given form",
  robots: { index: false, follow: false },
};

export default function YourWordsPage() {
  return (
    <main className="min-h-[calc(100*var(--vh))] bg-[#0a0a0a] text-white">
      <h1 className="sr-only">Your words, given form</h1>
      <YourWordsSection piece="line" words="Your company" />
      <YourWordsSection piece="arch" words="Your company logo" />
    </main>
  );
}
