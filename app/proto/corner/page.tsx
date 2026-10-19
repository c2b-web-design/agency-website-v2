import CornerBench, { type CornerBenchFlags } from "@/components/home/corner-bench";

/**
 * ⛔ THE CORNER BENCH — D-100 (19 October 2026). The ornate corners for the home page's §2 and §3 boxes, designed here
 * before any of it reaches `app/page.tsx`. PASS 1: THE SHAPE ONLY, IN CLAY — mesh, then material, then light, each
 * judged by Carl's eye before the next (the desk mark's process, D-088). Built as `/proto/logo` is: this server page,
 * a `"use client"` bench.
 *
 * ⚠ The URL switches are read HERE and passed down, so the first render matches on server and client.
 *   ?view=box|close|oblique   ?mode=clay|mesh|zebra|normals   ?border=1 (the box's old border, for reference)
 *   ?orient=along|down (the long arm along the top, or down the side as photographed)
 *   ?guides=0 (hide the limit lines in the close view)   ?az=-90..90   ?el=0..85
 */
export const metadata = {
  title: "Corner bench — the ornate corners (D-100)",
};

export default async function CornerBenchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const num = (k: string) => (one(k) !== undefined ? Number(one(k)) : undefined);
  const flags: CornerBenchFlags = {
    view: one("view"),
    mode: one("mode"),
    border: one("border") === "1",
    guides: one("guides") !== "0",
    az: num("az"),
    el: num("el"),
    orient: one("orient"),
  };
  return (
    <div className="min-h-[calc(100*var(--vh))] bg-neutral-950 text-white p-6">
      <h1 className="text-lg font-semibold mb-1">The ornate corner, pass 1: the shape in clay (take 3, Carl&apos;s bracket)</h1>
      <p className="text-sm text-neutral-400 mb-2 max-w-4xl">
        One design for all 28 corners of the home page&apos;s boxes. Its back is the box&apos;s own corner, a clean
        90°; everything ornate grows inward. This pass is the shape only: plain grey, lit to bring out the relief. No
        gold, no platinum blue, no motion.
      </p>
      <p className="text-sm text-neutral-500 mb-4 max-w-4xl">
        <strong>box</strong> is true size: §3&apos;s tightest box with its own text, as on the page.{" "}
        <strong>close</strong> is one corner enlarged, with the limit the text sets (red) and the text&apos;s nearest
        edge (amber). <strong>oblique</strong> turns it to show the relief.
      </p>
      <CornerBench flags={flags} />
    </div>
  );
}
