"use client";

import { createContext, type ComponentType, type ReactNode } from "react";
import type * as THREE from "three";
import { usePrefilteredStudio, whenLinked } from "@/components/home/corner-canvas";

/**
 * ⛔ THE ARCH's MEDIUM — `ArchMediumContext` (5 November 2026; the renderer note v1.6 §3, option (a), APPROVED by Carl:
 * *"Option A is fine, approval given"*; D-101). `LetteringPiece` is ONE component, drawn by film 4's approved page AND by the
 * camera bench; the two things in it that speak a renderer's language — the studio ENVIRONMENT (prefiltered) and the COMPILE
 * WAIT — come from this context.
 * - ⛔ ITS DEFAULT IS THE WebGL PATH: the approved `corner-canvas.tsx` helpers, imported statically as before. Film 4's page
 *   provides nothing and draws exactly as it did (captured before and after, image against image).
 * - ⛔ ONLY the camera bench, in its WebGPU medium, PROVIDES the context — with the twins from `bench-medium-webgpu.tsx`,
 *   which IMPORTS this file, never the other way round: `LetteringPiece`, and film 4's page with it, can never pull in the
 *   WebGPU half.
 * - THE ENVIRONMENT is a component that WRAPS the piece's body (note v1.4): it calls its own hook and renders `children`
 *   with the texture — or NULL until it exists — in the same render. Nothing lifted, no setter in an effect; the body is
 *   ALWAYS rendered, so the grain and the lamps mount at once and only the metal waits (film 4's timing kept).
 * - THE COMPILE WAIT has ONE signature for both media: `(gl, scene, camera, done) => cancel` — the cancel is the caller's
 *   effect cleanup.
 */
export type ArchEnvironmentProps = { gl: unknown; hdri: THREE.DataTexture; children: (env: THREE.Texture | null) => ReactNode };
export type CompileWait = (gl: unknown, scene: THREE.Scene, camera: THREE.Camera, done: () => void) => () => void;
export type ArchMedium = { Environment: ComponentType<ArchEnvironmentProps>; compileWait: CompileWait };

/** the approved WebGL helper, wrapped: its own hook, the body rendered with the texture in the same render */
function WebGLEnvironment({ gl, hdri, children }: ArchEnvironmentProps) {
  const env = usePrefilteredStudio(gl as THREE.WebGLRenderer, hdri);
  return <>{children(env)}</>;
}

/** the approved WebGL wait: `gl.compile` (non-blocking under `KHR_parallel_shader_compile`), polled until linked */
const webglCompileWait: CompileWait = (gl, scene, camera, done) => {
  const r = gl as THREE.WebGLRenderer;
  return whenLinked(r, r.compile(scene, camera), done);
};

export const WEBGL_ARCH_MEDIUM: ArchMedium = { Environment: WebGLEnvironment, compileWait: webglCompileWait };
export const ArchMediumContext = createContext<ArchMedium>(WEBGL_ARCH_MEDIUM);
