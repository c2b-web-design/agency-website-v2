import HeroBench from "@/components/hero/hero-bench";

/**
 * ⛔ THE HERO's BENCH — `/proto/hero` (11 November 2026, session 1; D-101; `live-work/structural-note-hero-bench-11-
 * november.md` v1.3). The marching scene (`/proto/marching`, the untouched reference) given our scale, step by step: Home,
 * the logo at the lean, the text, the cameras. WebGPU. An instrument, not a page: ⛔ noindex, never linked.
 */
export const metadata = {
  title: "Hero bench",
  robots: { index: false, follow: false },
};

export default function HeroBenchPage() {
  return <HeroBench />;
}
