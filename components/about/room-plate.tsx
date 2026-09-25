"use client";

import Image from "next/image";
import { ROOM_PLATE_ASPECT, ROOM_PLATE_SRC } from "./about-room";

/**
 * §2's plate in the DOM — the NEW ROOM, 25 September 2026 (D-095). It replaces `PillarboxPlate` on
 * `/about`; that component is left in place, untouched, because every band and skirting piece in it
 * is cut from the OLD photograph's edge pixels (`about-edge-column*.png`, `about-skirting-left.png`) for
 * a 3:2 plate. ⛔ **None of it applies to this room.**
 *
 * ⚠⚠ WHAT YOU SEE IS STILL WEBGL: `RoomBackplate` in `about-card-canvas.tsx` draws this photograph as
 * depth geometry so the glass can refract it. This element is the fallback underneath (before JS, or if
 * WebGL is lost), in the SAME centred box as the canvas — the plate's own aspect, 2560/1435 = 1.784.
 *
 * ⚠ THE SIDE BANDS ARE OPEN. The plate is ~16:9, so a wider window (Carl's is ~2.02:1) shows page
 * background either side — ~82 px a side at 1412 x 700, against ~181 px for the old 3:2 plate.
 * Whether they get bands rebuilt from THIS plate's edges is Carl's call.
 */
export default function RoomPlate() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full max-h-full w-auto max-w-full" style={{ aspectRatio: ROOM_PLATE_ASPECT }}>
        <Image src={ROOM_PLATE_SRC} alt="" aria-hidden="true" fill sizes="100vw" className="object-contain" />
      </div>
    </div>
  );
}
