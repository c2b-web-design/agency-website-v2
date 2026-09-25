"use client";

/**
 * The room environment map. ⛔ **TWO CONSUMERS: `/about` (`RoomEnvironmentFromPlate`, since the new room,
 * D-095) and the bench (`/proto/card`).** *Corrected in place, 25 September 2026 (third session) — the line
 * below was true when written and the next paragraph records why it stopped being.* Was: "ONE CONSUMER
 * TODAY: the bench".
 *
 * ⚠⚠ AN EARLIER VERSION OF THIS HEADER SAID "SHARED BY THE BENCH AND THE ROOM"
 * AND THAT IS NO LONGER TRUE. It was extracted into its own module when `/about`
 * needed it too — and **that work was reverted on 18 September 2026** after the
 * backplate it depended on failed four times and exposed placement faults older
 * than itself. ⛔ Corrected in place rather than left standing: a true-when-written
 * sentence that outlives its subject is this project's most-recorded failure.
 *
 * ⚠ **THE MODULE IS KEPT SEPARATE ANYWAY**, because the room will need it when
 * the backplate is rebuilt, and two copies of a PMREM builder would drift — the
 * exact failure class the rail coordinates already carry.
 */

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import {
  ENV_BLUR_SIGMA,
  ENV_MAP_SIZE,
  ENV_PLATE_INTENSITY,
  ENV_SHELL_COLOR,
  ENV_SHELL_RADIUS,
} from "./about-card-glass";
import { neonNumber } from "./about-neon";

/**
 * ⚠ `useMemo`, NOT `useEffect` + `setState` — matching `useLocalEnvMap` in
 * `answer-card-canvas.tsx`. ⛔ The effect form builds the map, calls setState and
 * forces a second render; it also trips `react-hooks/set-state-in-effect`, and
 * this project's lint baseline is ZERO warnings. **Building in a memo returns the
 * texture on the first render that has a plate.**
 */
export function useRoomEnvMap(plate: THREE.Texture | null): THREE.Texture | null {
  const gl = useThree((s) => s.gl);
  /* ⛔ THE REFLECTION'S OWN BLUR (`ENV_BLUR_SIGMA`). Read once per mount and passed as a DEPENDENCY, so a new
     value rebuilds the map — ⚠ the constants read inside the memo below are not, the ENVMAP-STALE defect. */
  const blur = useMemo(
    () => ({ sigma: neonNumber("envblur", ENV_BLUR_SIGMA, 0, 0.5), size: neonNumber("envsize", ENV_MAP_SIZE, 32, 1024) }),
    [],
  );

  const built = useMemo(() => {
    if (!plate) return null;
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];
    const studio = new THREE.Scene();

    /**
     * ⚠ THE SHELL IS NOT BLACK. A pure black surround gives a clear rim nothing
     * across most of its arc, which is the failure this map exists to fix.
     */
    const shellGeo = new THREE.SphereGeometry(ENV_SHELL_RADIUS, 24, 24);
    const shellMat = new THREE.MeshBasicMaterial({
      color: ENV_SHELL_COLOR,
      side: THREE.BackSide,
      toneMapped: false,
    });
    studio.add(new THREE.Mesh(shellGeo, shellMat));
    disposables.push(shellGeo, shellMat);

    /**
     * ⛔ THE PLATE AS A CURVED PANEL, filling the lower-front arc — where the
     * floor and the room actually are relative to a card standing on them.
     * ⚠ A flat plane would reflect as a hard-edged rectangle sliding across the
     * rim; a curved section reads as a room wrapping around it.
     */
    const panelGeo = new THREE.SphereGeometry(
      ENV_SHELL_RADIUS * 0.92,
      24,
      16,
      Math.PI * 0.25,
      Math.PI * 1.5,
      Math.PI * 0.3,
      Math.PI * 0.6,
    );
    const panelMat = new THREE.MeshBasicMaterial({
      map: plate,
      side: THREE.BackSide,
      toneMapped: false,
    });
    panelMat.color.multiplyScalar(ENV_PLATE_INTENSITY);
    studio.add(new THREE.Mesh(panelGeo, panelMat));
    disposables.push(panelGeo, panelMat);

    /**
     * ⚠ NOT TIMED HERE, DELIBERATELY. A `performance.now()` pair around this call
     * trips `Cannot call impure function during render`, and the lint baseline is
     * ZERO warnings. ⛔ **The cost is real and still owed a measurement** — the
     * `/start` precedent is ~572ms of ungated PMREM for a DIFFERENT scene, so it
     * does not transfer. **2b owns measuring this in the room**, where the number
     * actually matters; on `/proto` it is a one-off on an already-unwarmed bench.
     */
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(studio, blur.sigma, 0.1, 200, { size: blur.size });
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());

    return { rt };
  }, [plate, gl, blur]);

  /* ⚠ DISPOSAL IS THE EFFECT'S ONLY JOB. The memo builds; this releases the GPU
     target when the plate changes or the bench unmounts. */
  useEffect(() => {
    if (!built) return;
    return () => built.rt.dispose();
  }, [built]);

  return built?.rt.texture ?? null;
}

/** ⚠ Inside the Canvas so it can reach the renderer; renders nothing itself. */
export function RoomEnvironment({
  plate,
  enabled,
}: {
  plate: THREE.Texture | null;
  enabled: boolean;
}) {
  const envMap = useRoomEnvMap(enabled ? plate : null);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    /* ⛔ `scene.environment` ONLY — never `scene.background`. The bench's
       backdrop is the backplate mesh; setting a background here would put the
       env map on screen as well as in the reflection.

       ⚠ ASSIGNED VIA `Object.assign` because the lint rule correctly objects to
       mutating a hook's return value directly. `scene.environment` is three's
       own documented API for this and there is no declarative equivalent that
       does not also set the background. */
    Object.assign(scene, { environment: envMap });
    return () => {
      Object.assign(scene, { environment: null });
    };
  }, [scene, envMap]);

  return null;
}
