/**
 * ⛔ THE BUILDER's TAKE — the move the Builder has calculated, PUT ON CARL's BENCH by the bench itself (D-104; Carl: *"After
 * your calculations i need you to execute it and put the clip on the bench ... Like building a mesh. i describe, you show me
 * in clay we iterate"*). The Builder edits THIS FILE; the bench places the take on its timeline, and a new `version`
 * REPLACES the old take where it stood (as a mesh updates when its code changes). Carl fetches, pastes and opens nothing.
 *
 * Positions in WORLD CENTIMETRES (1 layout px = 1 cm: x right of the centre line, y up, z out). ⛔ THE WORKSHOP's WORLD since
 * 9 November 2026 (the workshop note v2.1, step 2): THE FLOOR AT y 0, THE FRONT LINE AT z 0. Was the arch's world (the floor
 * at −429.05, the arch's face at z 16); every number below MOVED by (0, +429.05184025084225, −16), so the take stands where
 * it stood against the floor. `"default"` = the bench's default view (Home). The bench converts through the chain's units.
 */
export type BuilderTake = {
  version: number;
  name: string;
  barrel: {
    from: "default" | [number, number, number];
    to: [number, number, number];
    turns: number;
    radiusCm: number;
    /** where the spiral leaves the line: a world z (cm) on the line (absent: at the start) */
    spiralStartZ?: number;
    /** where the spiral rejoins the line: a world z (cm) on the line */
    spiralEndZ: number;
    /** the rotation's ease at each end of the spiral, a fraction 0 … 0.5 (absent: even) */
    rollEase?: number;
    paceCms: number;
    rampS: number;
    landS: number;
  };
};

/** ⛔ THE VADER MOVE (Carl: *"you are at default position. i need you to fly forward at 2x speed while doing 3 rotations
 *  then fly through the arch. it essentially a corkscrew through the air"*; *"Both, a barrel roll"*).
 *  Take 1: from the default view, 2.8 m/s along the line, 3 laps of a 1.2 m spiral rolling with it from the start, rejoining
 *  the centre line 6 m before the face, through the opening dead centre, landing level 8 m behind — 13.3 s.
 *  ⛔ TAKE 2 (Carl: *"Fly forward first, then the barrel roll"* — his earlier *"cut the first rotation out and just fly
 *  forward first then execute the vader move"*): the first lap's stretch flown STRAIGHT (22.87 → 17.30 m out), then 2 laps
 *  at take 1's rate (one lap per 5.57 m), ending where take 1's did; level at the end (720°). Everything else take 1's. */
/** ⛔ TAKE 3 (Carl: *"when starting and ending the rotation, ease in and out more so its a lot smoother"*): the rotation (the
 *  lap angle and the roll together) eased over the first and last 40% of the spiral — zero turning speed at both ends, the
 *  middle ~1.7× take 2's rate to fit the same 2 laps in the same stretch. Everything else take 2's. */
/** ⛔ TAKE 4 (Carl: *"Its smoother but theres a little jolt at the star and finish of the roll"*): the spiral's radius now
 *  swells as sin⁴ (in `bench-chain.ts`): the camera leaves and rejoins the line with zero sideways speed and acceleration. The numbers are
 *  take 3's. */
/** ⛔ NO TAKE — THE VADER MOVE WITHDRAWN (9 November 2026, session 2). Carl, on the bench after the workshop's step 2: *"on
 *  the bench is the barrel roll. it shouldnt be there. No camera moves have bee done for the hero"*. It was film 4's move,
 *  through the ARCH — an idea's, gone with the arch; the take MECHANISM is the bench's (a tool) and stays. With no take,
 *  the bench withdraws the Builder's clip from the timeline (`syncBuilderTake`). ⛔ STORED OUTSIDE THE BENCH (Carl: *"how to
 *  do that specialist move should be noted but the actual clip can be stored outside the bench"*): its method and take 4 in
 *  both worlds, `project-intelligence/live-work/references/film04/vader-move/`. Take 4 as it stood, in the workshop's world
 *  (moved by (0, +429.05…, −16) the same day): `{ version: 4, name: "The Vader move, take 4", barrel: { from: "default",
 *  to: [0, 429.05184025084225, -816], turns: 2, radiusCm: 120, spiralStartZ: 1714, spiralEndZ: 600, rollEase: 0.4,
 *  paceCms: 280, rampS: 2, landS: 2.5 } }` (in the arch's world: to [0, 0, −800], spiral 1730 → 616). */
export const BUILDER_TAKE: BuilderTake | null = null;
