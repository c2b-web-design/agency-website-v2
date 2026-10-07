import LogoBench, { type LogoBenchFlags } from "@/components/about/logo-bench";

/**
 * ⛔ THE MARK BENCH — D-088. PASS 1 (7 October 2026): THE SHAPE ONLY, IN CLAY. Plan:
 * `project-intelligence/live-work/desk-mark-pass1-mesh-plan-7-october.md` (version 2, amended per the Architect,
 * approved by Carl). Chunk 1 (3 October) built mesh, gold and light at once; Carl, 7 October: *"mesh, material and
 * lights"* — each its own pass, each approved by eye before the next. Built as `/proto/card` is: this server page, a
 * `"use client"` bench.
 *
 * ⚠ The URL switches are read HERE, on the server, and passed down — so the bench's first render is the same on the
 * server and the client (a panel sized for `?view=roomsize` must not change size at hydration).
 *   ?view=front|oblique|junction|turntable|side|below|roomsize   ?mode=clay|flat|zebra|normals   ?wire=1
 *   ?shadows=0   ?az=-90..90   ?el=0..85   ?mask=1   ?overlay=0..1
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
  const num = (k: string) => (one(k) !== undefined ? Number(one(k)) : undefined);
  const flags: LogoBenchFlags = {
    view: one("view"),
    mode: one("mode"),
    mask: one("mask") === "1",
    wire: one("wire") === "1",
    shadows: one("shadows") !== "0",
    az: num("az"),
    el: num("el"),
    overlay: num("overlay"),
  };
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-lg font-semibold mb-1">The desk mark, pass 1: the shape in clay</h1>
      <p className="text-sm text-neutral-400 mb-2 max-w-4xl">
        The mark alone, traced from Carl&apos;s gold target (<code>c2b-logo-gold-relit-source-1671.png</code>, via
        its cut-out). Mesh, material and lights are built one pass at a time, each approved by eye before the
        next. This pass is the shape only: plain grey, lit to bring out the geometry. No gold, no room, no motion.
      </p>
      <p className="text-sm text-neutral-500 mb-2 max-w-4xl">
        <strong>flat</strong> lights the triangles as built. <strong>clay</strong>, <strong>zebra</strong> and{" "}
        <strong>normals</strong> shade with computed normals, which can smooth over a crease the triangles really
        have. Judge a crease in flat and continuity in zebra. Shadows are a switch, so you can rule them out as
        the cause of a stripe or a gap.
      </p>
      <p className="text-sm text-amber-300/80 mb-4 max-w-4xl">
        The height in millimetres is a placeholder. The junction view&apos;s camera is fixed, so before and
        after frames share one viewpoint.
      </p>
      <LogoBench flags={flags} />
    </div>
  );
}
