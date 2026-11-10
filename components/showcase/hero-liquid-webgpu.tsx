import * as THREE from "three";
import { MeshStandardNodeMaterial, type Node } from "three/webgpu";
import { abs, Break, exp, cameraFar, uniformArray, cameraNear, cameraPosition, cameraViewMatrix, clamp, dot, float, Fn, If, length, Loop, materialRoughness, max, min, normalize, positionWorld, select, sqrt, texture, uniform, vec2, vec3, vec4, viewZToPerspectiveDepth } from "three/tsl";

/**
 * ⛔ THE LIQUID — ONE FIELD: THE LOGO, THE BLOBS, THE WALL (10 November 2026; route B, the note v1.5; D-101). Replaces
 * probe 2's logo field (a smooth minimum of SDFs) and the stand-alone mimicked blobs: Carl approved the mimic's look and
 * set the choreography (expelled out of the logo in ~500 ms, nothing left; to the right wall; the middle; the mould).
 *
 * THE FIELD is three.js's `webgl_marchingcubes` field (`MarchingCubes.addBall` / `addPlaneX`), in BOX UNITS of `scale` cm:
 * - each BALL adds `s·w / r² − subtract` where positive (w its strength, 0–1, so a ball can be born and can die);
 * - the WALL adds `2 / x² − 12` where positive (x from its plane, box units; mirrored to our right);
 * - ⛔ THE LOGO adds the SAME law as the wall, `2 / x² − 12`, with x = the logo's signed distance (box units) PLUS the
 *   wall's own iso offset √(2 / (iso + 12)) — so at weight 1 its surface lies EXACTLY on the logo's distance zero (the
 *   mesh's surface: the profile swept along the outline's distance, probe 2's construction), and its field falls off like
 *   the wall's, so the blobs SWELL OUT OF IT as the example's do out of its wall. Times `logoWeight` (1, or 0 once gone)
 *   and, during the emergence, the MASK (`maskAt`, 10 November 2026, session 2): each blob's REGION of the logo goes with
 *   it — a mask below ~0.58 leaves no surface (the plate's half-thickness).
 * The surface is where the SUM reaches `isolation` (80). Not an SDF: the march steps by (iso − F) / G, halved and clamped,
 * where G bounds |∇F| (the sum of each term's gradient magnitude), with a skip to the nearest INFLUENCE region when outside
 * all of them; then it BISECTS the crossing. Normals: central differences of F. In WORLD space; the logo's distance is read
 * in its own frame (`worldToLocal`).
 * Findings kept from probes 1 and 2: specular anti-aliasing by RAY DIFFERENTIALS (a derivative quad can straddle faces);
 * coverage to multisampling from the closest approach (hits full). Unreal: a Ray Marching material, Pixel Depth Offset.
 */
export const LIQUID_BALLS = 10;
export type LiquidUniforms = {
  distance: { value: THREE.Texture };
  gridOrigin: { value: THREE.Vector2 };
  gridSize: { value: THREE.Vector2 };
  /** the logo's profile in cm (`logoProfileCm`): lip width, wall height, chamfer end (d1, its z), the round's end and
   *  radius, the face, the slope, the slope's angle */
  lip: { value: number };
  wallH: { value: number };
  d1: { value: number };
  zd1: { value: number };
  arcEnd: { value: number };
  rho: { value: number };
  top: { value: number };
  slope: { value: number };
  sinT: { value: number };
  cosT: { value: number };
  worldToLocal: { value: THREE.Matrix4 };
  logoWeight: { value: number };
  /** ⛔ THE REGIONS (each blob's own mass, `logoRegions`): local cm, xy the region's centre (the partition), zw its ANCHOR
   *  (where its blob leaves); `fronts` the radius about the anchor inside which the region is still solid */
  regions: { array: THREE.Vector4[] };
  fronts: { array: number[] };
  /** the front's soft edge and the regions' soft border (cm); `masking` 1 only while the fronts move (the emergence) */
  band: { value: number };
  tau: { value: number };
  masking: { value: number };
  /** xyz world cm, w strength 0–1 — ONE uniform array, looped over IN the shader (one copy of the ball code per call) */
  balls: { array: THREE.Vector4[] };
  boxMin: { value: THREE.Vector3 };
  boxMax: { value: THREE.Vector3 };
  /** cm per box unit */
  scale: { value: number };
  strength: { value: number };
  subtract: { value: number };
  isolation: { value: number };
  wallX: { value: number };
  wallOn: { value: number };
  /** ⚠ DEV, bits: 2 rays that ran out of steps, green; 16 no specular anti-aliasing */
  debug: { value: number };
};

const STEPS = 256;
/** ⚠ DIAGNOSIS (10 November 2026): the anti-aliasing by ray differentials costs 8 field calls — the compile time is measured with and without */
const SPEC_AA_RAYDIFF = true;
const NORMAL_CM = 0.05;
/** the profile's top and back run inward far past the widest stroke (half-width ~11.6 cm) */
const INWARD_CM = 60;
type F = Node<"float">;
type V2 = Node<"vec2">;
type V3 = Node<"vec3">;

export function liquidMaterial(): THREE.Material {
  const m = new MeshStandardNodeMaterial();
  const placeholder = new THREE.DataTexture(new Uint16Array([0]), 1, 1, THREE.RedFormat, THREE.HalfFloatType);
  placeholder.needsUpdate = true;
  const distTex = texture(placeholder);
  const U = {
    gridOrigin: uniform(new THREE.Vector2()),
    gridSize: uniform(new THREE.Vector2(1, 1)),
    lip: uniform(0),
    wallH: uniform(0),
    d1: uniform(0),
    zd1: uniform(0),
    arcEnd: uniform(0),
    rho: uniform(0),
    top: uniform(0),
    slope: uniform(1),
    sinT: uniform(0),
    cosT: uniform(1),
    worldToLocal: uniform(new THREE.Matrix4()),
    logoWeight: uniform(1),
    regions: uniformArray(Array.from({ length: LIQUID_BALLS }, () => new THREE.Vector4(0, 0, 0, 0)), "vec4"),
    fronts: uniformArray(Array.from({ length: LIQUID_BALLS }, () => 1e4), "float"),
    band: uniform(3),
    tau: uniform(3),
    masking: uniform(0),
    balls: uniformArray(Array.from({ length: LIQUID_BALLS }, () => new THREE.Vector4(0, 0, 0, 0)), "vec4"),
    boxMin: uniform(new THREE.Vector3()),
    boxMax: uniform(new THREE.Vector3()),
    scale: uniform(119.5),
    strength: uniform(0.778),
    subtract: uniform(12),
    isolation: uniform(80),
    wallX: uniform(0),
    wallOn: uniform(1),
    debug: uniform(0),
  };

  const segDist = (p: V2, a: V2, b: V2) => {
    const pa = p.sub(a);
    const ba = b.sub(a);
    const h = clamp(dot(pa, ba).div(dot(ba, ba)), 0, 1);
    return length(pa.sub(ba.mul(h)));
  };
  /** the signed distance to the profile's region in (u = distance inside the outline, z), cm: negative inside (probe 2) */
  const profileSdf = (u: F, z: F) => {
    const q = vec2(u, z);
    const zc = U.top.sub(U.rho);
    const dWall = segDist(q, vec2(0, 0), vec2(0, U.wallH));
    const dLip = segDist(q, vec2(0, U.wallH), vec2(U.lip, U.wallH));
    const dCh = segDist(q, vec2(U.lip, U.wallH), vec2(U.d1, U.zd1));
    const dTop = segDist(q, vec2(U.arcEnd, U.top), vec2(INWARD_CM, U.top));
    const dBack = segDist(q, vec2(0, 0), vec2(INWARD_CM, 0));
    const r = q.sub(vec2(U.arcEnd, zc));
    const inSector = r.x.lessThanEqual(0).and(r.y.greaterThanEqual(0)).and(r.y.mul(U.sinT).add(r.x.mul(U.cosT)).greaterThanEqual(0));
    const dArc = select(inSector, abs(length(r).sub(U.rho)), float(1e9));
    const dist = min(min(min(dWall, dLip), min(dCh, dArc)), min(dTop, dBack));
    const ua = u.sub(U.arcEnd);
    const zu = select(
      u.lessThan(U.lip),
      U.wallH,
      select(u.lessThanEqual(U.d1), U.wallH.add(U.slope.mul(u.sub(U.lip))), select(u.lessThan(U.arcEnd), zc.add(sqrt(max(U.rho.mul(U.rho).sub(ua.mul(ua)), 0))), U.top)),
    );
    const inside = u.greaterThanEqual(0).and(z.greaterThanEqual(0)).and(z.lessThanEqual(zu));
    return select(inside, dist.negate(), dist);
  };
  /** the logo's signed distance (cm) at a point in its OWN frame */
  const logoSdfLocal = (p: V3) => {
    const uv = p.xy.sub(U.gridOrigin).div(U.gridSize);
    const dTex = distTex.sample(uv).level(float(0)).r;
    const half = U.gridSize.mul(0.5);
    const out = length(max(abs(p.xy.sub(U.gridOrigin.add(half))).sub(half), vec2(0, 0)));
    return profileSdf(dTex.sub(out), p.z);
  };
  const toLocal = (pw: V3) => U.worldToLocal.mul(vec4(pw, 1)).xyz;
  /** the logo's signed distance (cm) at a WORLD point */
  const logoSdf = (pw: V3) => logoSdfLocal(toLocal(pw));
  /**
   * ⛔ THE MASK — what is still SOLID of the logo at a local point, 0–1 (10 November 2026, session 2; Carl: *"each blob
   * that emerges will have its own mass. The equivalent mass must disappear from the logo, maybe through masking it a
   * bit"*). The point's region is its nearest centre, SOFTENED over `tau` (a weighted mean, `exp(−(d − dmin) / tau)`), so
   * a gone region meets a full one in a slope, not a cut face; within its region the solid is what lies inside the
   * region's FRONT (`fronts[i]` about its anchor), falling to 0 over `band` — the front closes in on the anchor as the
   * blob grows, the mass drawn into it. Only while `masking`: otherwise 1, the loops skipped.
   * Returns vec2(mask, a bound on its slope per cm): the slope counted ONLY where the mask varies — a front's edge in a
   * region that matters here (1.5 / band), and a border between regions that differ (their spread × 2 / tau). Charged
   * everywhere, it forced 0.1 cm steps around the whole logo and the rays ran out (the green outline, 10 November 2026).
   * ⚠ Regions weighing under 1 % here are left out of the slope — approximate, not a strict bound.
   */
  const maskAt = (p: V3, need: Node<"bool">) => {
    const m = float(1).toVar();
    const slope = float(0).toVar();
    // only where the logo's term reaches (`need`): elsewhere the mask multiplies nothing — the loops halved the frame rate
    // when run at every step (33 ms frames against 16.7, 10 November 2026)
    If(U.masking.greaterThan(0.5).and(need), () => {
      const dmin = float(1e9).toVar();
      Loop(LIQUID_BALLS, ({ i }: { i: Node<"int"> }) => {
        const r = U.regions.element(i) as unknown as Node<"vec4">;
        dmin.assign(min(dmin, length(p.xy.sub(r.xy))));
      });
      const sw = float(0).toVar();
      const sm = float(0).toVar();
      const hi = float(0).toVar();
      const lo = float(1).toVar();
      const edge = float(0).toVar();
      Loop(LIQUID_BALLS, ({ i }: { i: Node<"int"> }) => {
        const r = U.regions.element(i) as unknown as Node<"vec4">;
        const a = exp(dmin.sub(length(p.xy.sub(r.xy))).div(U.tau));
        const front = U.fronts.element(i) as unknown as F;
        const k = clamp(front.sub(length(p.xy.sub(r.zw))).div(U.band).add(1), 0, 1);
        const sk = k.mul(k).mul(k.mul(-2).add(3));
        sw.addAssign(a);
        sm.addAssign(a.mul(sk));
        const matters = a.greaterThan(0.01);
        hi.assign(select(matters, max(hi, sk), hi));
        lo.assign(select(matters, min(lo, sk), lo));
        edge.assign(select(matters.and(k.greaterThan(0)).and(k.lessThan(1)), float(1), edge));
      });
      m.assign(sm.div(sw.max(1e-6)));
      slope.assign(edge.mul(float(1.5).div(U.band)).add(hi.sub(lo).max(0).mul(float(2).div(U.tau))));
    });
    return vec2(m, slope);
  };
  const B2 = U.scale.mul(U.scale);
  const x0 = sqrt(float(2).div(U.isolation.add(12)));
  /** the field F and a bound G on |∇F| (per cm) at a world point: vec2(F, G). ⛔ A SHADER FUNCTION (`setLayout`), not
   *  inlined: it is called ~16 times (the march, the bisection, the normal's 4 taps, the anti-aliasing's 8) and each call
   *  holds ten balls and the logo's distance — inlined, the shader stalled the page on its first compile */
  const fieldFn = Fn(([p]: [V3]) => {
    const Fb = float(0).toVar();
    const Gb = float(0).toVar();
    Loop(LIQUID_BALLS, ({ i }: { i: Node<"int"> }) => {
      const b = U.balls.element(i) as unknown as Node<"vec4">;
      const dv = p.sub(b.xyz);
      const r2 = dot(dv, dv);
      const den = r2.add(B2.mul(1e-6));
      const s = U.strength.mul(b.w).mul(B2);
      const val = s.div(den).sub(U.subtract);
      const on = val.greaterThan(0);
      Fb.addAssign(select(on, val, float(0)));
      Gb.addAssign(select(on, s.mul(2).mul(sqrt(r2)).div(den.mul(den)), float(0)));
    });
    let F: F = Fb;
    let G: F = Gb;
    const xw = U.wallX.sub(p.x).div(U.scale);
    const wden = xw.mul(xw).add(1e-4);
    const wval = float(2).div(wden).sub(12);
    const won = wval.greaterThan(0).and(xw.greaterThanEqual(0)).and(U.wallOn.greaterThan(0.5));
    F = F.add(select(won, wval, float(0)));
    G = G.add(select(won, xw.mul(4).div(U.scale.mul(wden.mul(wden))), float(0)));
    const pl = toLocal(p);
    const xl = logoSdfLocal(pl).div(U.scale).add(x0).max(1e-3);
    const lraw = float(2).div(xl.mul(xl)).sub(12).mul(U.logoWeight).toVar();
    const ms = maskAt(pl, lraw.greaterThan(0)).toVar();
    const mask = ms.x;
    const lval = lraw.mul(mask);
    const lon = lval.greaterThan(0);
    F = F.add(select(lon, lval, float(0)));
    // the bound: the term's own slope, plus the mask's where it varies (`maskAt`)
    const maskSlope = ms.y;
    G = G.add(select(lraw.greaterThan(0), float(4).mul(U.logoWeight).mul(mask).div(U.scale.mul(xl.mul(xl).mul(xl))).add(lraw.mul(maskSlope)), float(0)));
    return vec2(F, G);
  }).setLayout({ name: "liquidField", type: "vec2", inputs: [{ name: "p", type: "vec3" }] });
  const field = (p: V3) => fieldFn(p);
  /** how far a point is from every term's INFLUENCE region (cm; ≤ 0 inside one) — the march's skip */
  const outsideFn = Fn(([p]: [V3]) => {
    const db = float(1e6).toVar();
    Loop(LIQUID_BALLS, ({ i }: { i: Node<"int"> }) => {
      const b = U.balls.element(i) as unknown as Node<"vec4">;
      const rInf = sqrt(U.strength.mul(b.w).div(U.subtract)).mul(U.scale);
      db.assign(select(b.w.greaterThan(0.001), min(db, length(p.sub(b.xyz)).sub(rInf)), db));
    });
    let d: F = db;
    const wInf = sqrt(float(2).div(12)).mul(U.scale);
    d = select(U.wallOn.greaterThan(0.5), min(d, U.wallX.sub(wInf).sub(p.x)), d);
    // the logo's term vanishes where 2/x² = 12: x = √(1/6) box units, less its iso offset
    const lInf = sqrt(float(1).div(6)).sub(x0).mul(U.scale);
    d = select(U.logoWeight.greaterThan(0.001), min(d, logoSdf(p).sub(lInf)), d);
    return d;
  }).setLayout({ name: "liquidOutside", type: "float", inputs: [{ name: "p", type: "vec3" }] });
  const outside = (p: V3) => outsideFn(p);
  const dirWorld = normalize(positionWorld.sub(cameraPosition));
  const pixelAngle = dirWorld.dFdx().length().max(dirWorld.dFdy().length());
  const ro = cameraPosition;
  const rd = dirWorld;
  const tEnter = length(positionWorld.sub(cameraPosition));
  const nz = (c: F) => select(abs(c).lessThan(1e-6), float(1e-6), c);
  const safe = vec3(nz(rd.x), nz(rd.y), nz(rd.z));
  const tf = max(U.boxMin.sub(ro).div(safe), U.boxMax.sub(ro).div(safe));
  const tExit = min(min(tf.x, tf.y), tf.z);
  const march = Fn(() => {
    const t = float(tEnter).toVar();
    const tPrev = float(tEnter).toVar();
    const hit = float(0).toVar();
    const best = float(1e9).toVar();
    const tBest = float(tEnter).toVar();
    Loop(STEPS, () => {
      If(t.greaterThan(tExit), () => {
        Break();
      });
      const p = ro.add(rd.mul(t)).toVar();
      const fg = field(p).toVar();
      If(fg.x.greaterThanEqual(U.isolation), () => {
        hit.assign(1);
        Break();
      });
      // the distance estimate here: the closest approach is kept for the miss's coverage
      const est = U.isolation.sub(fg.x).div(fg.y.max(1e-6)).toVar();
      If(est.lessThan(best), () => {
        best.assign(est);
        tBest.assign(t);
      });
      tPrev.assign(t);
      t.addAssign(max(est.mul(0.5).clamp(0.1, 5), outside(p)));
    });
    const lo = float(tPrev).toVar();
    const hi = float(t).toVar();
    If(hit.greaterThan(0.5), () => {
      Loop(6, () => {
        const mid = lo.add(hi).mul(0.5);
        If(field(ro.add(rd.mul(mid))).x.greaterThanEqual(U.isolation), () => {
          hi.assign(mid);
        }).Else(() => {
          lo.assign(mid);
        });
      });
    });
    // ran out: no hit and still inside the box
    const ranOut = hit.lessThan(0.5).and(t.lessThanEqual(tExit));
    return vec4(hi, tBest, hit, select(ranOut, best.negate().sub(1), best));
  })();
  const hit = march.z.greaterThan(0.5);
  const ranOut = march.w.lessThan(-0.5);
  const tAt = select(hit, march.x, march.y);
  const p = ro.add(rd.mul(tAt));
  const e1 = vec3(1, -1, -1);
  const e2 = vec3(-1, -1, 1);
  const e3 = vec3(-1, 1, -1);
  const e4 = vec3(1, 1, 1);
  // the outward normal: −∇F (F rises inward), tetrahedral differences
  const normalAt = (q: V3) =>
    normalize(
      e1
        .mul(field(q.add(e1.mul(NORMAL_CM))).x)
        .add(e2.mul(field(q.add(e2.mul(NORMAL_CM))).x))
        .add(e3.mul(field(q.add(e3.mul(NORMAL_CM))).x))
        .add(e4.mul(field(q.add(e4.mul(NORMAL_CM))).x))
        .negate(),
    );
  const toView = (n: V3) => normalize(cameraViewMatrix.mul(vec4(n, 0)).xyz);
  const nWorld = normalAt(p);
  const nView = toView(nWorld);
  const across = (dd: V3) => {
    const r1 = rd.add(dd);
    const denom = nWorld.dot(r1);
    const sgn = select(denom.lessThan(0), float(-1), float(1));
    const s1 = nWorld.dot(p.sub(ro)).div(sgn.mul(abs(denom).max(1e-4)));
    return abs(toView(normalAt(ro.add(r1.mul(s1)))).sub(nView));
  };
  const dnv = SPEC_AA_RAYDIFF ? across(dirWorld.dFdx()).max(across(dirWorld.dFdy())) : nView.dFdx().abs().max(nView.dFdy().abs());
  const bit = (n: number) => U.debug.div(n).floor().mod(2).greaterThan(0.5);
  const footprint = tAt.mul(pixelAngle).max(1e-4);
  const missCov = float(0.5).sub(abs(march.w).max(0).div(footprint)).clamp(0, 0.5);
  const showRanOut = bit(2).and(ranOut);
  const cov = select(showRanOut, float(1), select(hit, float(1), select(ranOut, float(0), missCov)));
  m.emissiveNode = select(showRanOut, vec3(0, 4, 0), vec3(0, 0, 0));
  m.maskNode = cov.greaterThan(0.001);
  m.opacityNode = cov;
  m.alphaToCoverage = true;
  m.normalNode = nView;
  m.roughnessNode = materialRoughness.add(select(bit(16), float(0), dnv.x.max(dnv.y).max(dnv.z).min(1)));
  m.depthNode = viewZToPerspectiveDepth(cameraViewMatrix.mul(vec4(p, 1)).z, cameraNear, cameraFar);
  (m.userData as { liquid?: LiquidUniforms }).liquid = { distance: distTex, ...U } as unknown as LiquidUniforms;
  return m as unknown as THREE.Material;
}
