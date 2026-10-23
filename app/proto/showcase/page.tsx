import ShowcaseBench, { type ShowcaseBenchFlags } from "@/components/showcase/showcase-bench";

/**
 * ⛔ THE SHOWCASE BENCH — film 4 (D-088, 22 October 2026, session 2). A two-viewport showcase of modern web development,
 * built OFF the C2B site; its film is `/about` §3's box 4, and it is a CLIENT TEMPLATE (interchangeable parts). Built here
 * in passes, each judged by Carl's eye: the words' MESH in clay (pass 1, this), then material, then light; the themed stock
 * images only once the words are approved. Plan: `live-work/film04-pass1-mesh-plan-22-october.md`.
 *
 * ⛔ NOINDEX, AND IT MUST STAY SO AT LAUNCH. A client may be sent this link (Carl: *"The ability to send to clients would be
 * useful"*). The site-wide blocks (`app/robots.ts`, `app/layout.tsx`'s `robots`) are marked REMOVE BEFORE LAUNCH; this
 * page's own `robots` is the protection that survives them.
 *
 * ⚠ The URL switches are read HERE and passed down, so the first render matches on server and client (as `/proto/corner`):
 *   ?words=  ?size= (px)  ?track= (em)  ?depth= (em)  ?bevel= (em; 0 = none)  ?bevelseg= (1 = chamfer)  ?curve=
 *   ?font= (a fixed list)  ?view=front|oblique  ?mode=clay|flat|mesh|normals|zebra  ?az=  ?el=
 *   THE ARCH (the default; `?layout=line` is take 1, R-088): ?top= ?arch= ?caps=0 (take 2's lowercase)
 *   ?steps=font (take 3's spacing; default equal steps, take 4) ?nudge=P:0.02 (optical nudges, em; empty clears)
 *   ?sweep= (deg, 20–200)
 *   ?archtrack= (em) ?topscale= ?gap= (em)
 *   ⛔ TAKE 7 (23 October 2026) is the default: "company logo", ROUND-HEADED — ?form=round|half ?radius= (em) ?clear= (em).
 *   The half-circle takes need `?form=half&arch=company` added (take 5: `&nudge=P:0.11`; take 4: nothing more).
 *   ?crease= (deg; default 10 — the side walls smoothed, 23 October; `?crease=0` is faceted, as every take before it)
 */
export const metadata = {
  title: "Your words, given form: the showcase bench",
  robots: { index: false, follow: false },
};

export default async function ShowcaseBenchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const num = (k: string) => (one(k) !== undefined && Number.isFinite(Number(one(k))) ? Number(one(k)) : undefined);
  const flags: ShowcaseBenchFlags = {
    words: one("words"),
    size: num("size"),
    track: num("track"),
    depth: num("depth"),
    bevel: num("bevel"),
    bevelseg: num("bevelseg"),
    curve: num("curve"),
    font: one("font"),
    view: one("view"),
    mode: one("mode"),
    az: num("az"),
    el: num("el"),
    layout: one("layout"),
    top: one("top"),
    arch: one("arch"),
    caps: one("caps"),
    steps: one("steps"),
    nudge: one("nudge"),
    sweep: num("sweep"),
    archtrack: num("archtrack"),
    topscale: num("topscale"),
    gap: num("gap"),
    form: one("form"),
    radius: num("radius"),
    clear: num("clear"),
    crease: num("crease"),
  };
  return (
    <div className="min-h-[calc(100*var(--vh))] bg-neutral-950 text-white p-6">
      <h1 className="text-lg font-semibold mb-1">Your words, given form. Pass 1: the shape, in clay</h1>
      <p className="text-sm text-neutral-400 mb-4 max-w-4xl">
        Your company&apos;s name, set by the browser with the font&apos;s own spacing, then built in three dimensions and
        raised into an arch, every letter standing upright. This pass is the shape alone: no colour, no metal, no real
        light. Change the words, the curve or the edge and it rebuilds.
      </p>
      <ShowcaseBench flags={flags} />
    </div>
  );
}
