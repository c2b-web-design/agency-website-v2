import Link from "next/link";
import PlayerBench, { type PlayerTake } from "@/components/about/player-bench";

/**
 * ⛔ THE VIEWER BENCH — `/about` §3's video viewer, three takes for Carl to choose from (21 October 2026; D-088). The
 * Builder's design (Carl: *"its not my design- its yours"*), built here before any of it reaches `app/about/page.tsx`.
 * §3's row at true size: the four boxes (hover to preview, click to play) and the viewer. Built as the other benches are:
 * this server page reads the switch, a `"use client"` bench draws.
 *   ?take=1   the test card, a transport rail below the screen
 *   ?take=2   the mark is the timeline
 *   ?take=3   the ident (the 3D platinum blue mark)
 *   ?take=4   the mark becomes the player — 2 and 3 combined (Carl: *"combine some elements to make it one great idea"*)
 */
export const metadata = {
  title: "Viewer bench: /about §3 (D-088)",
};

const TAKES: { n: PlayerTake; name: string }[] = [
  { n: 1, name: "The test card" },
  { n: 2, name: "The mark is the timeline" },
  { n: 3, name: "The ident" },
  { n: 4, name: "The mark becomes the player (2 + 3)" },
];

export default async function PlayerBenchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const n = Number(typeof sp.take === "string" ? sp.take : 1);
  const take: PlayerTake = n === 2 || n === 3 || n === 4 ? n : 1;
  return (
    <div className="relative bg-neutral-950 text-white">
      <nav aria-label="Takes" className="absolute left-6 top-4 z-10 flex items-center gap-4 text-xs text-neutral-500">
        <span>The viewer, take:</span>
        {TAKES.map((t) => (
          <Link key={t.n} href={`/proto/player?take=${t.n}`} className={t.n === take ? "text-[#CFE6FF]" : "hover:text-neutral-300"}>
            {t.n}. {t.name}
          </Link>
        ))}
      </nav>
      <PlayerBench take={take} />
    </div>
  );
}
