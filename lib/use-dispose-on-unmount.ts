"use client";

import { useEffect } from "react";

/**
 * ⛔ DISPOSE ON A REAL UNMOUNT ONLY (found 5 November 2026, the third-person harness in the WebGPU medium: a capture FROZEN on
 * an early frame and *"Buffer used in submit while destroyed"*). React's StrictMode (dev) runs every effect's cleanup once
 * while the object stays MOUNTED, so a `useEffect(() => () => x.dispose())` disposed objects still in the scene. WebGL quietly
 * re-uploads a disposed geometry; `WebGPURenderer` can keep a cached draw holding the destroyed buffer, and then EVERY frame's
 * commands are rejected — the picture stops. Here the disposal waits one task and is CANCELLED if the object mounts again
 * (StrictMode's remount comes at once); a real unmount, or a replaced object, is disposed a task later, already out of the
 * scene.
 * ⛔ A TOOL, NOT AN IDEA's (moved here VERBATIM from the hero's `components/showcase/hero-page.tsx`, 9 November 2026, session
 * 2 — the workshop note v2.3; Carl: *"add the file"*): the camera bench, its WebGPU medium (grid, lines) and any idea brought
 * to it use it, so it must survive the C2B site being taken out of the template. ⚠ Kept OUT of the bench's seam
 * (`bench-medium.ts`), which imports drei.
 */
const pendingDispose = new WeakMap<object, number>();
export function useDisposeOnUnmount(obj: { dispose(): void }) {
  useEffect(() => {
    const id = pendingDispose.get(obj);
    if (id !== undefined) window.clearTimeout(id);
    pendingDispose.delete(obj);
    return () => {
      pendingDispose.set(
        obj,
        window.setTimeout(() => {
          pendingDispose.delete(obj);
          obj.dispose();
        }, 0),
      );
    };
  }, [obj]);
}
