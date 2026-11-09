"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BenchIdea, IdeaSceneProps } from "./bench-ideas";
import { HERO_CAMERA, HERO_PAGE, HeroPageGuide, HeroSketchLight } from "./hero-page";
import { HeroText, useHeroTextBuild } from "./hero-text";
import { HeroLogo } from "./hero-logo";

/**
 * ⛔ THE HERO, AS AN IDEA BROUGHT TO THE BENCH (9 November 2026, session 2; the workshop note v2.3, STEP 3; D-101). Moved
 * VERBATIM out of `camera-bench.tsx`, where `?blank=1` switched it on in seven places: its scene (the two sketch lights,
 * the 3D text, the 2 m logo LEANING on the t — Carl: *"i need to see it leaning first. It will move from that position"*),
 * its home (the page camera, the arch's 30° at 33 mm, its lens shift, the home page's frame — R-103) and its guide (the
 * home page's amber frame). Its WebGPU part (the acrylic, the glow) is `hero-idea-webgpu.tsx`, loaded only in that medium.
 * ⛔ FURNITURE: it leaves with the C2B site; the bench never imports it (`bench-ideas.ts` lists it, lazily).
 */
function HeroScene({ medium, part, onReady }: IdeaSceneProps) {
  // READY: the text built and the logo with its studio — the bench's "drawn" waits for both ([R10-4])
  const [text, setText] = useState(false);
  const [logo, setLogo] = useState(false);
  const onText = useCallback(() => setText(true), []);
  const onLogo = useCallback(() => setLogo(true), []);
  useEffect(() => {
    if (text && logo) onReady();
  }, [text, logo, onReady]);
  // ⛔ THE TEXT BUILT ONCE, HERE (the reflection note v1.7, ownership): drawn by `HeroText`, and shared with the logo's
  // reflection capture — ONLY when the hero's WebGPU part is loaded (the reflection is WebGPU-only; `part` is null in WebGL)
  const textBuild = useHeroTextBuild(part?.materials?.heroText);
  const reflect = useMemo(() => (part && textBuild ? { geometries: textBuild.geometries, material: textBuild.material } : undefined), [part, textBuild]);
  return (
    // on the grid's crossing — the workshop's origin (the floor y 0, the front line z 0)
    <group>
      <HeroSketchLight />
      {/* the 3D text (5 November 2026, session 2; `hero-text.tsx`) — the WebGPU part's edge-lit acrylic, or CLAY */}
      <HeroText built={textBuild} onReady={onText} />
      {/* the 2 m logo (9 November 2026; `hero-logo.tsx`): the lean APPROVED (R-103), mounted 9 November, session 2 */}
      {/* ⚠ `liquidProbe`: the liquid's route-B probe 1 (the shade null control), WebGPU part only — THROWAWAY */}
      <HeroLogo pose="lean" pmrem={medium.pmrem} onReady={onLogo} reflect={reflect} liquidProbe={part?.materials?.liquidProbe} />
    </group>
  );
}

export const HERO_IDEA: BenchIdea = {
  name: "hero",
  // the page camera (`HERO_CAMERA`: the arch's 30° vertical, 33 mm on the page's frame) — workshop cm
  home: { x: HERO_CAMERA.x, y: HERO_CAMERA.y, z: HERO_CAMERA.z, fov: HERO_CAMERA.vfov, shift: HERO_CAMERA.shift, frameAspect: HERO_PAGE[0] / HERO_PAGE[1] },
  Scene: HeroScene,
  Guide: HeroPageGuide,
  byMedium: { webgpu: () => import("./hero-idea-webgpu").then((m) => m.HERO_WEBGPU) },
};
