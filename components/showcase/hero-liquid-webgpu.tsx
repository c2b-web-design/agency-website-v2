import * as THREE from "three";
import { MeshStandardNodeMaterial, type Node } from "three/webgpu";
import { abs, Break, normalView, cameraFar, cameraNear, cameraPosition, cameraViewMatrix, clamp, dot, float, Fn, If, length, Loop, materialRoughness, max, min, normalize, positionWorld, select, sqrt, texture, uniform, vec2, vec3, vec4, viewZToPerspectiveDepth } from "three/tsl";

/**
 * ⛔ THE LIQUID, ROUTE B — PROBE 2: THE LOGO IN THE FIELD, ONE BLOB OUT OF IT (10 November 2026; THROWAWAY until the choice).
 * `live-work/structural-note-hero-liquid-9-november.md` v1.5, APPROVED, the live plan's step 2. Replaces probe 1's sphere
 * (its findings kept below: the specular anti-aliasing from the HIT's normal; the edge's coverage to multisampling).
 *
 * ONE FIELD, marched in the LOGO's OWN FRAME (the mesh's local space: x across, y bottom edge → top edge, z back 0 → face):
 * - THE LOGO: the mesh's own cross-section PROFILE (wall, lip, 45° chamfer, round, flat face — `logo-mark-geometry.ts`'s
 *   `makeProfile`, in cm) swept along a baked DISTANCE TEXTURE of the outline (`hero-liquid.tsx` bakes it). The mesh is built
 *   from the same two things (z = profile(d)), so at weight 1 the field's surface IS the mesh's ideal surface; only the
 *   texture's interpolation and the mesh's triangles differ. The 2D profile distance composed with a true 2D distance is
 *   1-Lipschitz: it never overestimates, so sphere tracing is safe.
 * - THE BLOB: a sphere, joined to the logo by a SMOOTH MINIMUM (polynomial, width `blend`): the bulge, the neck, the pinch.
 * - `erode` (cm) shrinks the logo evenly (the drain's first look, part 4).
 * The hit replaces the proxy box's surface: its NORMAL (central differences of the field, tetrahedral, into view space), its
 * DEPTH (`depthNode`), its COVERAGE (alpha to coverage). Lit by `MeshStandardNodeMaterial` with the LOGO's material values,
 * copied by the user. ⚠ A point or spot light would also need the hit's POSITION: not handled; none exists.
 * Unreal: a Ray Marching material with Pixel Depth Offset, the logo as a Distance Field.
 */
export type LiquidFieldUniforms = {
  distance: { value: THREE.Texture };
  gridOrigin: { value: THREE.Vector2 };
  gridSize: { value: THREE.Vector2 };
  /** the profile in cm: lip width, wall height, chamfer end (d1, its z), the round's end and radius, the face, slope */
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
  boxMin: { value: THREE.Vector3 };
  boxMax: { value: THREE.Vector3 };
  localToWorld: { value: THREE.Matrix4 };
  worldToLocal: { value: THREE.Matrix4 };
  blobCentre: { value: THREE.Vector3 };
  blobRadius: { value: number };
  blend: { value: number };
  erode: { value: number };
  /** ⚠ DEV, bits: 2 rays that ran out of steps, green; 4 the local normal as colour; 8 every partly covered MISS shown
   *  magenta and opaque (where the rim's coverage comes from); 16 no specular anti-aliasing; 32 the VIEW normal as emissive
   *  (as `MeshNormalMaterial` draws it; a harness blacks out the lit part) */
  debug: { value: number };
};

/** the march: up to 192 steps, a hit within 0.01 cm (the scene is in cm); the normal's difference step 0.05 cm */
const STEPS = 192;
const HIT_CM = 0.01;
const NORMAL_CM = 0.05;
/** the top and the back run inward far past the widest stroke (half-width ~11.6 cm) */
const INWARD_CM = 60;
type F = Node<"float">;
type V2 = Node<"vec2">;
type V3 = Node<"vec3">;

export function liquidFieldMaterial(): THREE.Material {
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
    boxMin: uniform(new THREE.Vector3()),
    boxMax: uniform(new THREE.Vector3()),
    localToWorld: uniform(new THREE.Matrix4()),
    worldToLocal: uniform(new THREE.Matrix4()),
    blobCentre: uniform(new THREE.Vector3()),
    blobRadius: uniform(-1000),
    blend: uniform(6),
    erode: uniform(0),
    debug: uniform(0),
  };

  // plain helpers (they compose nodes, inlined where called)
  const segDist = (p: V2, a: V2, b: V2) => {
    const pa = p.sub(a);
    const ba = b.sub(a);
    const h = clamp(dot(pa, ba).div(dot(ba, ba)), 0, 1);
    return length(pa.sub(ba.mul(h)));
  };

  /** the signed distance to the profile's region in (u = distance inside the outline, z), cm: negative inside */
  const profileSdf = (u: F, z: F) => {
    const q = vec2(u, z);
    const zc = U.top.sub(U.rho);
    const dWall = segDist(q, vec2(0, 0), vec2(0, U.wallH));
    const dLip = segDist(q, vec2(0, U.wallH), vec2(U.lip, U.wallH));
    const dCh = segDist(q, vec2(U.lip, U.wallH), vec2(U.d1, U.zd1));
    const dTop = segDist(q, vec2(U.arcEnd, U.top), vec2(INWARD_CM, U.top));
    const dBack = segDist(q, vec2(0, 0), vec2(INWARD_CM, 0));
    // the round: its arc runs from straight up (90°) to the chamfer's end (90° + θ) around (arcEnd, top − ρ)
    const r = q.sub(vec2(U.arcEnd, zc));
    const inSector = r.x.lessThanEqual(0).and(r.y.greaterThanEqual(0)).and(r.y.mul(U.sinT).add(r.x.mul(U.cosT)).greaterThanEqual(0));
    const dArc = select(inSector, abs(length(r).sub(U.rho)), float(1e9));
    const dist = min(min(min(dWall, dLip), min(dCh, dArc)), min(dTop, dBack));
    // the profile's height at u (the mesh's `prof.z`)
    const ua = u.sub(U.arcEnd);
    const zu = select(
      u.lessThan(U.lip),
      U.wallH,
      select(u.lessThanEqual(U.d1), U.wallH.add(U.slope.mul(u.sub(U.lip))), select(u.lessThan(U.arcEnd), zc.add(sqrt(max(U.rho.mul(U.rho).sub(ua.mul(ua)), 0))), U.top)),
    );
    const inside = u.greaterThanEqual(0).and(z.greaterThanEqual(0)).and(z.lessThanEqual(zu));
    return select(inside, dist.negate(), dist);
  };

  /** the whole field at a point in the logo's frame (cm) */
  const field = (p: V3) => {
    const uv = p.xy.sub(U.gridOrigin).div(U.gridSize);
    const dTex = distTex.sample(uv).level(float(0)).r;
    // beyond the baked grid: the distance to its edge taken off (a lower bound — safe)
    const half = U.gridSize.mul(0.5);
    const out = length(max(abs(p.xy.sub(U.gridOrigin.add(half))).sub(half), vec2(0, 0)));
    const logo = profileSdf(dTex.sub(out), p.z).add(U.erode);
    const blob = length(p.sub(U.blobCentre)).sub(U.blobRadius);
    const k = U.blend.max(0.01);
    const h = max(k.sub(abs(logo.sub(blob))), 0).div(k);
    return min(logo, blob).sub(h.mul(h).mul(k).mul(0.25));
  };

  // the ray through this pixel (world), and the angle one pixel spans (outside the loop: uniform control flow)
  const dirWorld = normalize(positionWorld.sub(cameraPosition));
  const pixelAngle = dirWorld.dFdx().length().max(dirWorld.dFdy().length());
  // the same ray in the logo's frame (a rigid transform: t is the same in both)
  const ro = U.worldToLocal.mul(vec4(cameraPosition, 1)).xyz;
  const rd = normalize(U.worldToLocal.mul(vec4(dirWorld, 0)).xyz);
  const tEnter = length(positionWorld.sub(cameraPosition));
  // where the ray leaves the proxy box (a slab test), so a miss stops there
  const nz = (c: F) => select(abs(c).lessThan(1e-6), float(1e-6), c);
  const safe = vec3(nz(rd.x), nz(rd.y), nz(rd.z));
  const t1 = U.boxMin.sub(ro).div(safe);
  const t2 = U.boxMax.sub(ro).div(safe);
  const tf = max(t1, t2);
  const tExit = min(min(tf.x, tf.y), tf.z);

  const march = Fn(() => {
    const t = float(tEnter).toVar();
    const hit = float(0).toVar();
    const dMin = float(1e9).toVar();
    const tMin = float(tEnter).toVar();
    Loop(STEPS, () => {
      If(t.greaterThan(tExit), () => {
        Break();
      });
      const d = field(ro.add(rd.mul(t))).toVar();
      If(d.lessThan(dMin), () => {
        dMin.assign(d);
        tMin.assign(t);
      });
      If(d.lessThan(HIT_CM), () => {
        hit.assign(1);
        Break();
      });
      t.addAssign(d.max(HIT_CM * 0.5));
    });
    const tAt = select(hit.greaterThan(0.5), t, tMin);
    // w: +t on a hit; −t at the closest approach on a miss; −(t + 1e6) when the steps RAN OUT inside the box
    const ranOut = hit.lessThan(0.5).and(t.lessThanEqual(tExit));
    return vec4(ro.add(rd.mul(tAt)), select(hit.greaterThan(0.5), tAt, select(ranOut, tAt.add(1e6), tAt).negate()));
  })();
  const pLocal = march.xyz;
  const hit = march.w.greaterThan(0);
  const ranOut = march.w.lessThan(-1e5);
  const tAt = select(ranOut, march.w.negate().sub(1e6), abs(march.w));
  // the field's normal (tetrahedral central differences), in the logo's frame
  const e1 = vec3(1, -1, -1);
  const e2 = vec3(-1, -1, 1);
  const e3 = vec3(-1, 1, -1);
  const e4 = vec3(1, 1, 1);
  const normalAt = (q: V3) =>
    normalize(
      e1
        .mul(field(q.add(e1.mul(NORMAL_CM))))
        .add(e2.mul(field(q.add(e2.mul(NORMAL_CM)))))
        .add(e3.mul(field(q.add(e3.mul(NORMAL_CM)))))
        .add(e4.mul(field(q.add(e4.mul(NORMAL_CM))))),
    );
  const toView = (nL: V3) => normalize(cameraViewMatrix.mul(vec4(U.localToWorld.mul(vec4(nL, 0)).xyz, 0)).xyz);
  const nLocal = normalAt(pLocal);
  const hitNormalView = toView(nLocal);
  const hitWorld = U.localToWorld.mul(vec4(pLocal, 1)).xyz;
  // ⛔ SPECULAR ANTI-ALIASING BY RAY DIFFERENTIALS (10 November 2026, probe 2's first run). Probe 1 took r185's term — the
  // screen-space change of the normal (`getGeometryRoughness`: the max component of max(|dFdx n|, |dFdy n|), view space) —
  // from the HIT's normal by dFdx. On a MESH the four pixels of a derivative quad always share one triangle; on a raymarched
  // surface they can land on DIFFERENT faces across a crease (the logo's wall, lip, chamfer), and the jump read as roughness
  // 1: dark dotted lines along every crease. Here the NEIGHBOUR pixel's ray (this ray plus its screen change) meets the
  // hit's TANGENT PLANE, and the normal there is compared: the change across one pixel on THIS surface, as a triangle's
  // interpolated normal gives the mesh. ⚠ Within a pixel of a crease the neighbour point leaves the face and the SDF's
  // gradient rounds the crease: a little roughness there that the mesh does not have.
  const across = (dd: V3) => {
    const r1 = rd.add(U.worldToLocal.mul(vec4(dd, 0)).xyz);
    const denom = nLocal.dot(r1);
    const sgn = select(denom.lessThan(0), float(-1), float(1));
    const s1 = nLocal.dot(pLocal.sub(ro)).div(sgn.mul(abs(denom).max(1e-4)));
    const n1 = toView(normalAt(ro.add(r1.mul(s1))));
    return abs(n1.sub(hitNormalView));
  };
  const dnv = across(dirWorld.dFdx()).max(across(dirWorld.dFdy()));
  const geometryRoughness = dnv.x.max(dnv.y).max(dnv.z);
  // ⛔ THE EDGE — COVERAGE (probe 1's finding: a mesh edge is multisampled, a discard is not), to multisampling as alpha:
  // - a MISS: 0.5 less the closest approach in pixels (the march returns the CLOSEST point on a miss; the field there);
  // - a HIT: FULL. (Tried first: 0.5 plus how far inside the silhouette, from the grazing angle and the curvature in pixels
  //   — exact for probe 1's sphere, but across the logo's creases it dithered whole faces. Full coverage widens the
  //   silhouette by up to half a pixel inside: probe 1's accepted ring.)
  const footprint = tAt.mul(pixelAngle).max(1e-4);
  const missCov = float(0.5).sub(field(pLocal).max(0).div(footprint)).clamp(0, 0.5);
  const bit = (n: number) => U.debug.div(n).floor().mod(2).greaterThan(0.5);
  const showRanOut = bit(2).and(ranOut);
  const showMiss = bit(8).and(hit.not()).and(missCov.greaterThan(0.001));
  const cov = select(showRanOut.or(showMiss), float(1), select(hit, float(1), missCov));
  m.emissiveNode = select(showRanOut, vec3(0, 4, 0), select(showMiss, vec3(4, 0, 4), select(bit(4), nLocal.mul(0.5).add(0.5).mul(2), select(bit(32), hitNormalView.mul(0.5).add(0.5), vec3(0, 0, 0)))));
  m.maskNode = cov.greaterThan(0.001);
  m.opacityNode = cov;
  m.alphaToCoverage = true;
  m.normalNode = hitNormalView;
  m.roughnessNode = materialRoughness.add(select(bit(16), float(0), geometryRoughness.min(1)));
  m.depthNode = viewZToPerspectiveDepth(cameraViewMatrix.mul(vec4(hitWorld, 1)).z, cameraNear, cameraFar);
  const uniforms = { distance: distTex, ...U } as unknown as LiquidFieldUniforms;
  (m.userData as { liquid?: LiquidFieldUniforms }).liquid = uniforms;
  // ⚠ DEV: the MESH's side of the normal comparison — the same material class, lit part black, its VIEW normal as emissive
  // (debug bit 32 is the field's side), so both pass the same colour path
  (m.userData as { normalViewMaterial?: () => THREE.Material }).normalViewMaterial = () => {
    const n = new MeshStandardNodeMaterial({ color: 0x000000, metalness: 1, roughness: 1, envMapIntensity: 0 });
    n.emissiveNode = normalView.mul(0.5).add(0.5);
    return n as unknown as THREE.Material;
  };
  return m as unknown as THREE.Material;
}
