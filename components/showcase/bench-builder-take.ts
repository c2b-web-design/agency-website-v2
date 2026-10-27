/**
 * ⛔ THE BUILDER's TAKE — the move the Builder has calculated, PUT ON CARL's BENCH by the bench itself (D-104; Carl: *"After
 * your calculations i need you to execute it and put the clip on the bench ... Like building a mesh. i describe, you show me
 * in clay we iterate"*). The Builder edits THIS FILE; the bench places the take on its timeline, and a new `version`
 * REPLACES the old take where it stood (as a mesh updates when its code changes). Carl fetches, pastes and opens nothing.
 *
 * Positions in WORLD CENTIMETRES (1 layout px = 1 cm: x right of the piece's centre, y up — the floor at −429 — z out, the
 * arch's face at 16); `"default"` = the bench's default view (Home). The bench converts through the chain's units.
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
export const BUILDER_TAKE: BuilderTake = {
  version: 4,
  name: "The Vader move, take 4",
  barrel: { from: "default", to: [0, 0, -800], turns: 2, radiusCm: 120, spiralStartZ: 1730, spiralEndZ: 616, rollEase: 0.4, paceCms: 280, rampS: 2, landS: 2.5 },
};
