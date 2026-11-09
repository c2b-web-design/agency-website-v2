# The Vader move: a barrel roll through a subject (film 4, 27 October 2026)

**Stored outside the bench** on Carl's word (9 November 2026, session 2): *"how to do that specialist move should be noted
but the actual clip can be stored outside the bench."* The camera bench is a workshop tool. This move was film 4's, flown
through the arch. The clip is kept here as data: `take-4.json`.

## What it is

Carl: *"you are at default position. i need you to fly forward at 2x speed while doing 3 rotations then fly through the
arch. it essentially a corkscrew through the air"*; *"Both, a barrel roll"*.

The camera flies a straight line through the subject. Partway along, it leaves the line on a spiral of fixed radius,
rolling about its line of sight as it laps. It rejoins the line before the subject and goes through it dead centre, then
lands level beyond it.

## How it is built: the bench's `barrel` shape (a tool, `components/showcase/bench-chain.ts`)

A shape clip is stored as its NUMBERS, not samples (Carl: *"It always helps if we can adjust the numbers later"*). These are
the barrel's numbers:

| Number | Meaning |
|---|---|
| `from`, `to` | the line's two ends, world cm; `"default"` = the bench's Home |
| `turns` | laps of the spiral |
| `radiusCm` | the spiral's radius |
| `spiralStartZ`, `spiralEndZ` | where the spiral leaves and rejoins the line (world z, cm; the line runs straight in z) |
| `rollEase` | the fraction of the spiral at each end over which the lap angle and the roll ease in and out (0 to 0.5) |
| `paceCms` | the speed along the line, cm/s |
| `rampS`, `landS` | the speed's ramp from rest, and the landing |

**The smoothness, found over four takes**, each from one of Carl's notes:
1. **Take 1:** 3 laps of a 1.2 m spiral rolling from the start, 2.8 m/s, through the opening dead centre, landing 8 m
   behind (13.3 s).
2. **Take 2:** *"Fly forward first, then the barrel roll"*. The first lap's stretch is flown straight, then 2 laps at take
   1's rate.
3. **Take 3:** *"ease in and out more so its a lot smoother"*. The lap angle and the roll are eased over the first and last
   40 % of the spiral: zero turning speed at both ends.
4. **Take 4:** *"a little jolt at the star and finish of the roll"*. The spiral's RADIUS now swells as sin⁴ (in
   `bench-chain.ts`), so the camera leaves and rejoins the line with zero sideways speed and acceleration.

## To fly it again, for another idea

1. Set `from`, `to`, `spiralStartZ` and `spiralEndZ` for the new subject: the line through it, and where the spiral sits.
2. Put the object in `BUILDER_TAKE` (`components/showcase/bench-builder-take.ts`) with a NEW `version`.
3. The bench places it on Carl's timeline by itself. A later version replaces it where it stood.

## The numbers

`take-4.json` holds take 4 twice:
- in the WORKSHOP's world (the floor at y 0; the bench's world since 9 November 2026);
- in the ARCH's world it was flown in (the floor at y −429.05).

The two differ by (0, +429.05184025084225, −16).
