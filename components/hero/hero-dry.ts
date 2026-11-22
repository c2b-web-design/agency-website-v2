import * as THREE from "three";
import { float, max, mx_noise_float, smoothstep, uniform } from "three/tsl";
import type { Node } from "three/webgpu";

/**
 * ⛔ THE LOGO DRIED TO GOLD, PASS BY PASS (22 November 2026, session 3; D-101). Carl: *"Lets do the gold transition. … there
 * should not be straight lines between the blue and gold. It has had cloth over it and that would not produce clean straight
 * lines. Maybe a gradient between blue and gold."* … *"We will assume the cloth reached everywhere. It is by action alone we
 * will infer this."* … on take 1 (the cloth's own contacts): *"The border of blue to gold looks fantastic. Just the sort of
 * look i was after."* … *"The front is already completed at Pass 3. It is not confined to where the letters touch the cloth-
 * no one is measuring, its the effect we are after and the transition is hidden behind the cloth. Pass 1 gold for the top
 * third. 2 where the c meets the 2. 3. where the b meets the 2. 4. whats left."* … *"so it doesnt matter where the logo
 * touches the cloth. the jumps and actions were designed so a particular part has contact."*
 *
 * ⛔ … and then: *"no. when i say it doesnt matter i meant accurately..Pass 1 jumps back. Only the back of the logo will be
 * dried. At this point the face should be still blue. After it jumps forward, the face makes contact, then it is gold."* →
 * the FRONT and the BACK dry apart, each with ITS action: pass 1 the back (jump back), then the front (jump forward);
 * passes 2–4 the front (the swivel / the flip), then the back (the return) — the sides the measured contacts show
 * (D-101: pass 1 the top's back ~98% then front ~100%; pass 2 the C's front then back; 3 the B's; 4 the 2's bottom half).
 *
 * WHAT: AUTHORED, on the logo's own surface (no field, no compute; ⚰️ takes 1 and 2 were a GPU field fed by the cloth's
 * contacts — they ran ahead of the passes). Four REGIONS of the face (local x, y as shares of its box, both faces alike):
 * 1 the TOP THIRD; 2 LEFT of where the c meets the 2; 3 RIGHT of where the b meets the 2; 4 everything (what's left). Each
 * region's edge is SOFT and WANDERS (`regionEdge`, `regionWander` over `wanderCm`): no straight line between regions. Pass
 * k's PROGRESS ON EACH SIDE (0 → 1 over that side's action's flight, set by the scene from the passes' state) fills region k
 * on that side (the walls between blend by their normal) — BLOTCHY, not all at
 * once (`blotch`: a smooth noise decides which parts go first). The dryness is the most-dried region at a point; the colour
 * is take 1's border, kept: `smoothstep(blueBelow, goldAbove, dryness + noise × ragged)` (the noise only in the transition).
 */
export type HeroDrySettings = {
  /** the colour: all blue below, all gold above (dryness) — take 1's border (Carl: "fantastic") */
  blueBelow: number;
  goldAbove: number;
  /** the border's wander (dryness ±, a smooth noise) and its size (cm) */
  ragged: number;
  raggedCm: number;
  /** the regions (shares of the face's box): pass 1 above `topThird` (height); pass 2 left of `cMeets2`; pass 3 right of
   *  `bMeets2` (width); pass 4 everything */
  topThird: number;
  cMeets2: number;
  bMeets2: number;
  /** ⛔ pass 3 also dries the 2's middle ABOVE this (height share; right of `cMeets2`): pass 4 is left only the 2's lower
   *  part, where its flip makes contact (Carl, 22 November 2026, below) */
  pass4Below: number;
  /** the regions' edges: their softness and wander (shares of the face), the wander's size (cm) */
  regionEdge: number;
  regionWander: number;
  wanderCm: number;
  /** how unevenly a region fills (0 = all at once) */
  blotch: number;
};
/** starting values — takes (the border's from take 1). ⚰️ The splits overlapping (pass 2 left of 0.6, pass 3 right of 0.4,
 *  so pass 4 changed nothing) was built and filmed on 22 November 2026 and REVERTED on Carl's word: *"no, its got worse.
 *  revert it."* */
export const HERO_DRY_DEFAULTS: HeroDrySettings = { blueBelow: 0.15, goldAbove: 0.75, ragged: 0.25, raggedCm: 9, topThird: 0.667, cMeets2: 0.42, bMeets2: 0.6, pass4Below: 0.3, regionEdge: 0.05, regionWander: 0.05, wanderCm: 14, blotch: 0.4 };

export type HeroDry = {
  settings: HeroDrySettings;
  /** the face's box (local, cm) */
  setFace(minX: number, minY: number, sizeX: number, sizeY: number): void;
  /** each pass's progress on the FRONT and on the BACK (0 → 1 over that side's action), from the scene each frame */
  setProgress(front: readonly [number, number, number, number], back: readonly [number, number, number, number]): void;
  /** the gold share (0 platinum blue → 1 gold) at a point of the logo (local position and normal: +z = the face) */
  share(position: Node<"vec3">, normal: Node<"vec3">): Node<"float">;
  readonly info: { front: number[]; back: number[] };
};

export function createHeroDry(): HeroDry {
  const settings: HeroDrySettings = { ...HERO_DRY_DEFAULTS };
  const u = {
    minX: uniform(0),
    minY: uniform(0),
    sizeX: uniform(1),
    sizeY: uniform(1),
    front: uniform(new THREE.Vector4(0, 0, 0, 0)),
    back: uniform(new THREE.Vector4(0, 0, 0, 0)),
    blueBelow: uniform(0),
    goldAbove: uniform(1),
    ragged: uniform(0),
    raggedCm: uniform(9),
    topThird: uniform(0.667),
    cMeets2: uniform(0.42),
    bMeets2: uniform(0.6),
    pass4Below: uniform(0.3),
    regionEdge: uniform(0.05),
    regionWander: uniform(0.05),
    wanderCm: uniform(14),
    blotch: uniform(0.4),
  };
  const shown = { front: [0, 0, 0, 0], back: [0, 0, 0, 0] };
  const sync = () => {
    const s = settings;
    u.blueBelow.value = s.blueBelow;
    u.goldAbove.value = Math.max(s.blueBelow + 1e-3, s.goldAbove);
    u.ragged.value = s.ragged;
    u.raggedCm.value = Math.max(0.5, s.raggedCm);
    u.topThird.value = s.topThird;
    u.cMeets2.value = s.cMeets2;
    u.bMeets2.value = s.bMeets2;
    u.pass4Below.value = s.pass4Below;
    u.regionEdge.value = Math.max(1e-3, s.regionEdge);
    u.regionWander.value = s.regionWander;
    u.wanderCm.value = Math.max(0.5, s.wanderCm);
    u.blotch.value = Math.max(0, s.blotch);
  };
  sync();
  return {
    settings,
    setFace(minX, minY, sizeX, sizeY) {
      u.minX.value = minX;
      u.minY.value = minY;
      u.sizeX.value = Math.max(1, sizeX);
      u.sizeY.value = Math.max(1, sizeY);
    },
    setProgress(front, back) {
      shown.front = [...front];
      shown.back = [...back];
      u.front.value.set(front[0], front[1], front[2], front[3]);
      u.back.value.set(back[0], back[1], back[2], back[3]);
      sync();
    },
    share(position, normal) {
      const fx = position.x.sub(u.minX).div(u.sizeX);
      const fy = position.y.sub(u.minY).div(u.sizeY);
      // the regions' edges wander (a smooth noise each, salted apart) and are soft
      const w = (salt: number) => mx_noise_float(position.div(u.wanderCm).add(salt)).mul(u.regionWander);
      const e = u.regionEdge;
      const r1 = smoothstep(u.topThird.sub(e), u.topThird.add(e), fy.add(w(11)));
      const r2 = float(1).sub(smoothstep(u.cMeets2.sub(e), u.cMeets2.add(e), fx.add(w(23))));
      // ⛔ PASS 3 TAKES THE 2's UPPER MIDDLE TOO (Carl, 22 November 2026, at the end of pass 3: *"the blue on the number 2 is
      // too far up. when it does the flip this part doesnt make contact. it doesnt make contact on the way back either. the
      // effect is you can see it disappear even though no contact is made. When going through pass 3 it can go then in the
      // rotations, when its got its back to us or is hidden by the cloth. So at the end of this point, the blue is lower down
      // on the 2 so the last flip will look a bit more accurate."*): right of the c's split AND above `pass4Below` — pass 4
      // keeps only the 2's lower part (⚰️ the splits overlapping, the same day: reverted, *"its got worse"*)
      const upperMiddle = smoothstep(u.cMeets2.sub(e), u.cMeets2.add(e), fx.add(w(41))).mul(smoothstep(u.pass4Below.sub(e), u.pass4Below.add(e), fy.add(w(47))));
      const r3 = max(smoothstep(u.bMeets2.sub(e), u.bMeets2.add(e), fx.add(w(37))), upperMiddle);
      // each region fills BLOTCHY with its pass's progress: a smooth noise (0–1) decides which parts go first; full at 1
      const n = mx_noise_float(position.div(u.wanderCm).add(53)).mul(0.5).add(0.5);
      const fill = (p: Node<"float">) => smoothstep(0, 1, p.mul(float(1).add(u.blotch)).sub(u.blotch.mul(n)));
      const dried = (p: typeof u.front) => max(max(r1.mul(fill(p.x)), r2.mul(fill(p.y))), max(r3.mul(fill(p.z)), fill(p.w)));
      // the FRONT's (the face, +z) or the BACK's by the normal; the walls between blend
      const side = normal.z.mul(0.5).add(0.5).clamp(0, 1);
      const dB = dried(u.back);
      const d = dB.add(dried(u.front).sub(dB).mul(side));
      // take 1's border: the noise only in the transition (exactly blue at 0, exactly gold at 1)
      const inTransition = d.mul(4).clamp(0, 1).mul(float(1).sub(d).mul(4).clamp(0, 1));
      const rag = mx_noise_float(position.div(u.raggedCm)).mul(u.ragged).mul(inTransition);
      return smoothstep(u.blueBelow, u.goldAbove, d.add(rag));
    },
    get info() {
      return { front: [...shown.front], back: [...shown.back] };
    },
  };
}
