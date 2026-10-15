/**
 * ⛔ THE STUDIO — ONE HDRI, ONE LOADER, SHARED BY EVERY OBJECT THAT REFLECTS IT (15 October 2026).
 *
 * Carl: *"If theres a standard for building metal then the logo is it."* The family buttons (`whoweare-button-scene.tsx`)
 * reflect this studio; the answer cards (`answer-card-canvas.tsx`) are moving onto it. ⛔ ONE MODULE, so the two read one
 * file, one fetch and one decode per page, and one darkening rule — not two copies to drift (CLAUDE.md §5a). Moved here
 * VERBATIM from `whoweare-button-scene.tsx` (D-088, 15 October), where it was written for the buttons.
 *
 * ⛔ WHY A PHOTOGRAPHED STUDIO, NOT PANELS ON BLACK: a curved surface mirrors every direction it faces, so a studio of panels
 * on black puts its GAPS on the surface as black — the buttons' bands (R-044, 12 October) and the cards' dark ends (D-051,
 * 15 October: the face's end 21.4 against its middle 56.9). An HDRI is CONTINUOUS — every direction holds something.
 * ⛔ THE STUDIO: Poly Haven "Monochrome Studio 02" (Grzegorz Wronkowski, CC0), 1k equirect `.hdr`, 1.56 MB — two tall strip
 * softboxes either side (the logo studio's two tall softboxes), a neutral grey cyclorama, no warm cast.
 * ⚠ LOADED AS FLOAT (`FloatType`) so the room pass can read it. ⚠ UNASSERTED: a GPU without float-texture LINEAR filtering
 * (`OES_texture_float_linear`) would sample it black — not seen on this machine; not checked on phones.
 */
import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

export const STUDIO_HDRI_SRC = "/env/monochrome_studio_02_1k.hdr";

/**
 * ⛔ THE ROOM DARKENED, THE SOFTBOXES KEPT (`room`, 15 October 2026 — Carl, on the button at strength 0.4: *"it does not
 * improve it. The page text extrusion is clearly visible as it rotates and i like the contrast it has with the dark
 * background. If it can be turned down but have the added reflection detail that would be great."*). Measured
 * (`live-work/scripts/hdr-stats.mjs`): the studio's ROOM — walls, cyclorama, floor — sits at luminance 0.02–0.8; its
 * SOFTBOXES above 2 (3% of the pixels, 58% of the light). The logo's studio is softboxes on NEAR-BLACK; this one's grey room
 * lifted the whole face. So every pixel below luminance 1 is multiplied by `room`, blending back to untouched by 2: the
 * face keeps the lamps' darkness, the softboxes' reflections stay as detail. Still continuous (dark, not black — no gaps).
 */
const ROOM_KNEE = [1, 2] as const;
const hdriBase = new Map<string, Promise<THREE.DataTexture>>();
const hdriCache = new Map<string, Promise<THREE.DataTexture>>();
/** One fetch and decode per URL (and one derived copy per `room`) for the whole page, shared by every canvas (each renderer
 *  still builds its own PMREM). */
export function loadStudioHdri(url: string = STUDIO_HDRI_SRC, room = 1): Promise<THREE.DataTexture> {
  const key = `${url}|${room}`;
  let p = hdriCache.get(key);
  if (p) return p;
  let base = hdriBase.get(url);
  if (!base) {
    const loader = new HDRLoader();
    loader.setDataType(THREE.FloatType);
    base = loader.loadAsync(url);
    hdriBase.set(url, base);
  }
  p = base.then((src) => {
    if (room === 1) {
      src.mapping = THREE.EquirectangularReflectionMapping;
      return src;
    }
    const { width, height } = src.image;
    const from = src.image.data as Float32Array;
    const data = new Float32Array(from.length);
    for (let i = 0; i < from.length; i += 4) {
      const L = 0.2126 * from[i] + 0.7152 * from[i + 1] + 0.0722 * from[i + 2];
      const t = Math.min(1, Math.max(0, (L - ROOM_KNEE[0]) / (ROOM_KNEE[1] - ROOM_KNEE[0])));
      const k = room + (1 - room) * t * t * (3 - 2 * t);
      data[i] = from[i] * k;
      data[i + 1] = from[i + 1] * k;
      data[i + 2] = from[i + 2] * k;
      data[i + 3] = from[i + 3];
    }
    const t = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
    t.colorSpace = src.colorSpace;
    t.minFilter = src.minFilter;
    t.magFilter = src.magFilter;
    t.generateMipmaps = false;
    t.flipY = src.flipY;
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.needsUpdate = true;
    return t;
  });
  hdriCache.set(key, p);
  return p;
}
