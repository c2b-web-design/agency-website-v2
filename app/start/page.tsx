import Container from "@/components/layout/container";
import EnquiryOpening from "@/components/enquiry/enquiry-opening";

export default function StartPage() {
  return (
    <>
      {/* ⚠⚠ THE LOGO ONLY — NO HEADER, NO NAV LINKS, NO "Web Design" TEXT.
          Carl's instruction, 27 August 2026, given three times and narrowed
          each time. ⛔ DO NOT REINTRODUCE `SiteHeader` ON THIS PAGE.

          THE HISTORY, because each wrong answer looked reasonable:
          1. `SiteHeader` reused for guaranteed-identical geometry -> it brought
             the nav links and the "Web Design" span with it. Carl: "the text on
             the right side of the header shouldn't be there. i only wanted the
             logo inserted."
          2. It also brought an 81px nav band, which ⛔ PUSHED THE QUESTIONS AND
             ANSWERS DOWN and made the document 981px tall. Carl: "That
             effectively pushed the questions down."

          ⚠ SO THE MARK IS POSITIONED ABSOLUTELY AND IS OUT OF FLOW. It occupies
          NO vertical space, and `EnquiryOpening` sits exactly where it did
          before any of this work — the corridor is not displaced by a single
          pixel. That is the whole point of this arrangement, not an
          implementation detail.

          ⚠ `Container` IS REUSED RATHER THAN HARDCODING x=112. The landing
          page's mark sits at x=112 because Container is `max-w-7xl` (1280px)
          centred in a 1440px viewport (80px) plus `lg:px-8` (32px). Using the
          same component means the two pages agree by construction and stay
          agreeing when Container changes. ⛔ DO NOT REPLACE THIS WITH A LITERAL
          left-[112px] — it would be correct at one viewport width and wrong at
          every other.

          ⚠ `top-5` MATCHES THE LANDING PAGE'S y=20, which comes from the nav's
          `py-5`. Measured on the landing page at 1440x900: the mark renders at
          x=112, y=20, 69.92 x 40px.

          ⛔ 40px IS THE HEIGHT (`h-10`) AND THE WIDTH FOLLOWS (`w-auto`) —
          D-060, Carl's ruling of 25 August 2026. SET THE HEIGHT AND LET THE
          WIDTH FALL OUT, never the reverse. Full reasoning, including why
          cap-height matching is the wrong target for this mark, is in D-060 and
          in the comment in `components/layout/site-header.tsx`.

          ⚠⚠ `absolute` NEEDS A POSITIONED ANCESTOR AND DELIBERATELY DOES NOT
          HAVE ONE HERE. It resolves against the initial containing block, which
          is what puts it at the top-left of the page. ⛔ DO NOT WRAP THIS AND
          `EnquiryOpening` IN A `relative` DIV to "fix" that — the enquiry
          carries a shared card host resolving `position: fixed` against the
          VIEWPORT, and `verify/` asserts `offsetParent === null` on it.
          `position: relative` on an ancestor would not break `fixed`, but
          `transform`, `filter`, `perspective`, `contain` or `will-change` would,
          silently and from a distance — the failure that sank 12 August 2026.
          See D-048 and the comment at the top of `enquiry-opening.tsx`.

          ⚠ z-10 keeps the mark above the enquiry's background. It is not above
          the card host, which is `fixed` and paints in its own layer. */}
      <div className="absolute top-5 left-0 right-0 z-10">
        <Container>
          <img
            src="/c2b-logo-mark.png"
            alt="C2B"
            width={951}
            height={544}
            className="h-10 w-auto"
          />
        </Container>
      </div>

      <EnquiryOpening />
    </>
  );
}
