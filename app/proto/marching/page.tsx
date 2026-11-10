import MarchingBench from "@/components/showcase/marching-bench";

/**
 * ⛔ THE MARCHING-CUBES BENCH — `/proto/marching` (10 November 2026, session 2; D-101). three's `webgl_marchingcubes`,
 * mirrored exactly, on its own bench: the outside element brought in on its own terms first (Carl: *"Because we have an
 * outside element with its own rules we must adapt to that first."*). Full window, as the example is. The example's own WebGL
 * renderer by default; `?webgpu=1` WebGPU (it hung the GPU on 10 November 2026: on purpose only). An instrument, not a page: ⛔ noindex, never linked.
 */
export const metadata = {
  title: "Marching cubes bench",
  robots: { index: false, follow: false },
};

export default function MarchingBenchPage() {
  return <MarchingBench />;
}
