import sys

f = sys.argv[1] + "/components/about/about-card-canvas.tsx"
s = open(f, encoding="utf-8").read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a))
    s = s.replace(a, b)


start = s.index("type MarkPose = { y: number; z: number; theta: number };")
end = s.index("function DeskMark() {")
s = s[:start] + '''/** A pose of the mark: its centre of mass relative to the mark's rest origin (yaw frame — x along the letters / the
 *  back wall, y up, z toward the camera; metres) and its orientation. */
type MarkPose = { x: number; y: number; z: number; q: THREE.Quaternion };
const X_AXIS = new THREE.Vector3(1, 0, 0);
/** The 2D fall's state at `ms` after face down, interpolated from the simulation's rows (an angle about the letters). */
function fallPose(ms: number, originOffMm: number, xc: number): MarkPose {
  const R = DESK_MARK_FALL.rows;
  let i = 0;
  while (i < R.length - 2 && R[i + 1][0] < ms) i++;
  const a = R[i], b = R[i + 1];
  const k = Math.min(1, Math.max(0, (ms - a[0]) / (b[0] - a[0] || 1)));
  const lerp = (j: number) => a[j] + (b[j] - a[j]) * k;
  return {
    x: xc, y: (lerp(2) - DESK_RIGHT_CORNER.topMm) / ROOM_MM_PER_UNIT, z: (lerp(1) - originOffMm) / ROOM_MM_PER_UNIT,
    q: new THREE.Quaternion().setFromAxisAngle(X_AXIS, lerp(3)),
  };
}
/**
 * ⛔ THE SOMERSAULT (Carl, 8 October 2026: *"it needs to be facing us and the right way up… try it and show me"*) — a full
 * 3D rigid-body run from UPRIGHT on the desk (`DESK_MARK_SOMERSAULT`, `about-room.ts`; the script and its search are named
 * there): position and orientation at `ms` after the nudge, interpolated (positions linear, orientation slerp).
 */
function somersaultPose(ms: number, originOffMm: number): MarkPose {
  const R = DESK_MARK_SOMERSAULT.rows;
  let i = 0;
  while (i < R.length - 2 && R[i + 1][0] < ms) i++;
  const a = R[i], b = R[i + 1];
  const k = Math.min(1, Math.max(0, (ms - a[0]) / (b[0] - a[0] || 1)));
  const lerp = (j: number) => a[j] + (b[j] - a[j]) * k;
  const qa = new THREE.Quaternion(a[4], a[5], a[6], a[7]), qb = new THREE.Quaternion(b[4], b[5], b[6], b[7]);
  return {
    x: (lerp(1) - DESK_RIGHT_CORNER.uMm / 2) / ROOM_MM_PER_UNIT,
    y: (lerp(2) - DESK_RIGHT_CORNER.topMm) / ROOM_MM_PER_UNIT,
    z: (lerp(3) - originOffMm) / ROOM_MM_PER_UNIT,
    q: qa.slerp(qb, k),
  };
}
const DESK_MARK_SOMERSAULT_SPEED = 0.5;
const DESK_MARK_SOMERSAULT_END_HOLD_MS = 600;
function MarkMotion({ bodyRef, followRef, contactRef, contactOpacity, tipFixed, fallFixed, tipMs, fallSpeed, play, com, depth, originOffMm }: {
  bodyRef: React.RefObject<THREE.Group | null>; followRef: React.RefObject<THREE.Group | null>;
  contactRef: React.RefObject<THREE.MeshBasicMaterial | null>; contactOpacity: number;
  tipFixed: number | null; fallFixed: number | null; tipMs: number; fallSpeed: number; play: "fall" | "somersault";
  com: [number, number, number]; depth: number; originOffMm: number;
}) {
  const clockRef = useRef(0);
  const start = useMemo(
    () => (play === "somersault" ? somersaultPose(0, originOffMm) : { x: com[0], y: com[1], z: com[2], q: new THREE.Quaternion() }),
    [play, originOffMm, com],
  );
  useFrame((st, dt) => {
    const [xc, yc, zc] = com;
    const tipPose = (p: number): MarkPose => {
      const th = (Math.PI / 2) * p * p;
      // rotation about the front-bottom edge (y 0, z depth): the centre of mass relative to the rest origin
      return { x: xc, y: yc * Math.cos(th) - (zc - depth) * Math.sin(th), z: depth + yc * Math.sin(th) + (zc - depth) * Math.cos(th), q: new THREE.Quaternion().setFromAxisAngle(X_AXIS, th) };
    };
    let pose: MarkPose;
    if (play === "somersault") {
      const total = DESK_MARK_SOMERSAULT.rows[DESK_MARK_SOMERSAULT.rows.length - 1][0];
      if (fallFixed !== null) pose = somersaultPose(fallFixed * total, originOffMm);
      else {
        const cycle = DESK_MARK_TIP_HOLD_MS + total / fallSpeed + DESK_MARK_SOMERSAULT_END_HOLD_MS;
        clockRef.current = (clockRef.current + dt * 1000) % cycle;
        const t = clockRef.current - DESK_MARK_TIP_HOLD_MS;
        pose = somersaultPose(Math.min(total, Math.max(0, t * fallSpeed)), originOffMm);
        st.invalidate();
      }
    } else {
      const fallMs = DESK_MARK_FALL.restMs;
      if (fallFixed !== null) pose = fallPose(fallFixed * fallMs, originOffMm, xc);
      else if (tipFixed !== null) pose = tipPose(tipFixed);
      else {
        const playMs = fallMs / fallSpeed;
        const cycle = DESK_MARK_TIP_HOLD_MS + tipMs + playMs + DESK_MARK_FALL_HOLD_MS;
        clockRef.current = (clockRef.current + dt * 1000) % cycle;
        const t = clockRef.current;
        if (t < DESK_MARK_TIP_HOLD_MS) pose = tipPose(0);
        else if (t < DESK_MARK_TIP_HOLD_MS + tipMs) pose = tipPose((t - DESK_MARK_TIP_HOLD_MS) / tipMs);
        else pose = fallPose(Math.min(fallMs, (t - DESK_MARK_TIP_HOLD_MS - tipMs) * fallSpeed), originOffMm, xc);
        st.invalidate();
      }
    }
    if (bodyRef.current) {
      bodyRef.current.position.set(pose.x, pose.y, pose.z);
      bodyRef.current.quaternion.copy(pose.q);
    }
    if (followRef.current) followRef.current.position.set(pose.x, pose.y, pose.z);
    // the contact shadow belongs to the mark AT REST in its starting pose: gone once it has turned 22.5° from it
    const turned = pose.q.angleTo(start.q);
    if (contactRef.current) contactRef.current.opacity = contactOpacity * Math.max(0, 1 - 4 * Math.min(1, turned / (Math.PI / 2)));
  });
  return null;
}

''' + s[end:]

rep('''  const motion = useMemo(() => {
    const fixed = (key: string) => {''', '''  const motion = useMemo(() => {
    const play: "fall" | "somersault" = neonParam("markplay") === "fall" ? "fall" : "somersault";
    const fixed = (key: string) => {''')
rep('''      fallSpeed: neonNumber("markfallspeed", DESK_MARK_FALL_SPEED, 0.05, 1),
    };''', '''      fallSpeed: neonNumber("markfallspeed", play === "somersault" ? DESK_MARK_SOMERSAULT_SPEED : DESK_MARK_FALL_SPEED, 0.05, 1),
      play,
    };''')
rep('''  const comM = useMemo(() => [DESK_MARK_FALL.comLocal[0] * place.scale, DESK_MARK_FALL.comLocal[1] * place.scale] as [number, number], [place]);''',
    '''  const comM = useMemo(
    () => DESK_MARK_SOMERSAULT.comLocal.map((v) => v * place.scale) as [number, number, number],
    [place],
  );''')
rep('''        tipFixed={motion.tipFixed} fallFixed={motion.fallFixed} tipMs={motion.tipMs} fallSpeed={motion.fallSpeed}''',
    '''        tipFixed={motion.tipFixed} fallFixed={motion.fallFixed} tipMs={motion.tipMs} fallSpeed={motion.fallSpeed} play={motion.play}''')
rep('''          <group ref={body} position={[0, comM[0], comM[1]]}>
            <mesh ref={mesh} geometry={built.geometry} material={built.gold} position={[0, -comM[0], -comM[1]]} castShadow={shadowOn} />
          </group>
          <group ref={follow} position={[0, comM[0], comM[1]]}>''', '''          <group ref={body} position={comM}>
            <mesh ref={mesh} geometry={built.geometry} material={built.gold} position={[-comM[0], -comM[1], -comM[2]]} castShadow={shadowOn} />
          </group>
          <group ref={follow} position={comM}>''')
# the contact shadow sits under the STARTING pose (the somersault's start is angled and moved)
rep('''        {shadowOn && (
          <group rotation={[0, place.rotationY, 0]}>
            <mesh position={[0, 0.0003, built.contact.centreZ]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>''', '''        {shadowOn && (
          <group rotation={[0, place.rotationY, 0]}>
            <group position={startPose ? [startPose.x, startPose.y, startPose.z] : comM} quaternion={startPose?.q}>
            <mesh position={[-comM[0], 0.0003 - comM[1], built.contact.centreZ - comM[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>''')
rep('''              <meshBasicMaterial ref={contactMat} color="#000000" alphaMap={built.contact.texture} transparent opacity={faders.contact} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>''', '''              <meshBasicMaterial ref={contactMat} color="#000000" alphaMap={built.contact.texture} transparent opacity={faders.contact} depthWrite={false} toneMapped={false} />
            </mesh>
            </group>
          </group>''')
rep('''  const depthM = LOGO_MARK_DEFAULTS.depth * place.scale;''', '''  const depthM = LOGO_MARK_DEFAULTS.depth * place.scale;
  const startPose = useMemo(
    () => (motion.play === "somersault" ? somersaultPose(0, DESK_RIGHT_CORNER.offWallMm - DESK_MARK.faceInFromEndMm - LOGO_MARK_DEFAULTS.depth * DESK_MARK.heightMm) : null),
    [motion.play],
  );''')
rep('''  DESK_MARK_FALL,
  DESK_RIGHT_CORNER,''', '''  DESK_MARK_FALL,
  DESK_MARK_SOMERSAULT,
  DESK_RIGHT_CORNER,''')
open(f, "w", encoding="utf-8").write(s)
print("ok")
