import LogoBench, { type LogoBenchFlags } from "@/components/about/logo-bench";

/**
 * ⛔ THE MARK BENCH — D-088 chunk 1, 3 October 2026. The C2B mark as a three.js object, ALONE: no room, no scroll,
 * no fall. Plan: `project-intelligence/live-work/desk-mark-chunk1-plan-3-october.md` (version 2, amended by the
 * Architect's review, approved by Carl). Built as `/proto/card` is: this server page, a `"use client"` bench.
 *
 * ⚠ The URL switches are read HERE, on the server, and passed down — so the bench's first render is the same on the
 * server and the client (a panel sized for `?view=roomsize` must not change size at hydration).
 *   ?view=front|oblique|turntable|side|below|roomsize   ?mask=1   ?light=studio|room   ?overlay=0..1
 */
export const metadata = {
  title: "Mark bench — the desk mark (D-088)",
};

export default async function LogoBenchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const flags: LogoBenchFlags = {
    view: one("view"),
    mask: one("mask") === "1",
    light: one("light"),
    overlay: one("overlay") !== undefined ? Number(one("overlay")) : undefined,
  };
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-lg font-semibold mb-1">The desk mark — geometry and gold bench</h1>
      <p className="text-sm text-neutral-400 mb-2 max-w-4xl">
        Chunk 1: the mark alone. Curved front on a flat back, traced from Carl&apos;s gold target
        (<code>c2b-logo-gold-relit-source-1671.png</code>, via its cut-out). Gold starts from physical
        gold&apos;s reflectance; the target judges it. No room, no motion.
      </p>
      <p className="text-sm text-neutral-500 mb-2 max-w-4xl">
        The renderer matches <code>/about</code>&apos;s: ACES tone mapping and sRGB output (R3F&apos;s
        defaults), antialias on, alpha on, DPR 1–2, soft shadows. ⚠ <code>card-bench.tsx</code>&apos;s
        note that an <code>&lt;Environment&gt;</code> was ruled out concerns the GLASS. Metal has no diffuse
        and renders black without one, so this bench always gives it one: Lightformers only, no
        downloaded HDR preset.
      </p>
      <p className="text-sm text-amber-300/80 mb-4 max-w-4xl">
        The height in millimetres is a placeholder. Chunk 2 sets it in room millimetres from the
        approved size on the plate (144 plate px tall). &ldquo;Room reflection&rdquo; is the room&apos;s
        reflection only, not its light: the take light lives in <code>about-card-canvas.tsx</code> and is
        not copied here.
      </p>
      <LogoBench flags={flags} />
    </div>
  );
}
