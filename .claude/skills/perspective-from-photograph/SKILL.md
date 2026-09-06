---
name: perspective-from-photograph
description: Place rectangles, panels or 3D objects onto walls and floors in a photograph in correct perspective. Use when compositing artwork, posters, screens or Three.js objects into a real photo and the placement must be geometrically right rather than eyeballed.
---

# Solving perspective from a photograph

## The rule that makes this work

**Never estimate corner coordinates by eye, and never iterate towards them.** Perspective is a
measurable property of the image. Measure it once, solve for the camera, and every rectangle after
that is arithmetic. Attempts that guess corners and then nudge them never converge, because there is
no visual feedback signal precise enough to correct a projective error.

The whole job is four steps: fit lines to real pixels, derive the vanishing points, solve the camera,
then place objects in real-world units and project them back.

## Step 1 — Fit lines to actual pixels

Work in a canonical space. Downscale the image to 2000px wide and do everything there; scale by
`original_width / 2000` at the end.

Find two lines that are parallel in the real world and lie in the plane you care about. For an
interior wall the reliable pair is the ceiling/wall junction and the skirting board. Furniture edges
parallel to the wall (desk fronts and backs) work too.

Don't trust Hough alone — use it to discover candidates, then refine with a seeded gradient trace:

```python
import cv2, numpy as np
im = cv2.imread(path)
W = 2000; H = int(round(im.shape[0]*W/im.shape[1]))
im = cv2.resize(im, (W,H), interpolation=cv2.INTER_AREA)
g  = cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32), (0,0), 1.6)
dy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=5)   # +ve = brighter below

def trace(xs, sign, seed, band=10):
    """Walk along x, snapping to the strongest gradient near the running estimate.
       sign=-1 for bright-above-dark (ceiling join), +1 for dark-above-bright."""
    pts, prev = [], float(seed)
    for x in xs:
        lo, hi = max(0,int(prev-band)), min(H-1,int(prev+band))
        col = dy[lo:hi, x]*sign
        if len(col) < 5: continue
        k = int(np.argmax(col)); y = lo+k
        pts.append((x,y,float(col[k]))); prev = 0.5*y + 0.5*prev
    return pts

def fitline(pts):
    """Robust fit with iterative outlier rejection. Returns (slope, intercept)."""
    X = np.array([p[0] for p in pts], float); Y = np.array([p[1] for p in pts], float)
    for _ in range(6):
        A = np.polyfit(X,Y,1); r = Y-np.polyval(A,X); s = np.std(r)
        keep = np.abs(r) < max(1.2, 2.0*s)
        if keep.sum() < 6: break
        X, Y = X[keep], Y[keep]
    return np.polyfit(X,Y,1), float(np.std(Y-np.polyval(np.polyfit(X,Y,1),X)))
```

**Judge every fit by its residual.** An rms under ~1px over several hundred pixels of run means you
have found a real straight edge. An rms of 5–20px means the tracer wandered onto something else —
reseed it, don't use it. Also sanity-check the slope's sign: a wall receding to the right has a
ceiling line descending and a skirting line ascending. If both go the same way, one of them is wrong.

Seed traces from the strongest, least occluded end and walk towards the cluttered end.

## Step 2 — Vanishing points and the horizon

A vanishing point is where two real-world-parallel lines intersect in the image:

```python
def intersect(a, b):           # a, b are (slope, intercept)
    x = (b[1]-a[1])/(a[0]-b[0]); return np.array([x, a[0]*x + a[1]])
```

For a two-wall corner scene you get `VP_left` and `VP_right`. **Both must sit on the same horizon**,
because both directions are horizontal in the world. If your two estimates disagree on y, the weaker
fit is wrong — go back and remeasure rather than averaging.

The horizon is almost never at the image centre. A camera looking down puts it above centre.

## Step 3 — Solve the camera

Assume the principal point is at the image centre and there is no roll (verticals stay vertical-ish).
The two wall directions are perpendicular in the world, which gives focal length directly:

```
(vLx - cx)(vRx - cx) + f² = 0
```

So `f = sqrt(-(vLx-cx)*(vRx-cx))`. Convert to a field of view and sanity-check it:
`hFOV = 2*atan(cx/f)`. An interior wide-angle lands around **85–95°**. If you get 50° or 120°, one
vanishing point is wrong.

**Then falsify it.** The camera solution predicts where vertical world lines converge:

```
tan(pitch) = (cy - horizon_y)/f
vertical_VP = (cx, cy + f/tan(pitch))
```

Find a genuinely vertical object well away from the image centre — a monitor bezel, a door frame, a
wall corner seam — measure its lean, and check it points at that predicted vertical VP. If it agrees
within a few percent, the whole solution is confirmed. **This single check is what separates a solved
image from a plausible-looking guess.**

Note that verticals in a tilted-camera photo are not parallel. Assuming they are is a common and
visible error.

## Step 4 — Build the model and place objects

```python
f = ...; cx, cy = W/2, Hgt/2
K  = np.array([[f,0,cx],[0,f,cy],[0,0,1]]); Ki = np.linalg.inv(K)
ray  = lambda p: Ki @ np.array([p[0], p[1], 1.0])
unit = lambda v: v/np.linalg.norm(v)

dL  = unit(ray(VP_left))        # horizontal direction of the left wall
dR  = unit(ray(VP_right))       # horizontal direction of the right wall
dUp = -unit(np.cross(dR, dL))
if dUp[1] > 0: dUp = -dUp       # camera y is down, so world up is negative y

C = ray(corner_top_image) * 1000.0      # origin; the 1000 just fixes an arbitrary scale

def proj(X):
    p = K @ X; return np.array([p[0]/p[2], p[1]/p[2]])

def wallpt(a, b, e1):                   # a = along the wall, b = up, both from C
    return C + a*e1 + b*dUp

def to_wall(p, n, e1):                  # image point -> wall coordinates
    r = ray(p); X = r * ((C @ n)/(r @ n)); d = X - C
    return np.array([d @ e1, d @ dUp])
```

The left wall's plane normal is `dR` and its in-plane horizontal axis is `dL`; swap for the right
wall. `to_wall` converts anything visible in the photo — a monitor edge, a desk end, the extent of a
plant — into wall coordinates, so you can say "align with that" numerically instead of by eye.

A rectangle is then four `wallpt` calls run through `proj`. Because the edges follow the two
orthogonal world directions, the result is a true projected rectangle for free.

Get real-world units by back-projecting a floor point at the wall corner to find the wall height in
model units, then dividing by an assumed ceiling height (2.4 m is a reasonable default for a domestic
room). **State the assumption** — every metre figure rescales linearly if the real height turns out
different, while pixel coordinates are unaffected.

## Step 5 — Verify before delivering

Draw the fitted lines and a wall grid back onto the photograph and look at it. The ceiling junctions,
the corner seam and the skirting must all sit under their drawn lines. This costs one render and
catches every class of error above.

```python
# grid of lines in the wall plane, projected back to the image
for a in range(-800, 0, 90):
    p1, p2 = proj(wallpt(a,0,dL)), proj(wallpt(a,-560,dL))
    cv2.line(img, tuple(p1.astype(int)), tuple(p2.astype(int)), (120,200,120), 1, cv2.LINE_AA)
```

## Handing off to Three.js

Export the camera rather than just the corners, so the 3D scene registers with the photo and objects
can be positioned in metres:

- `vertical_fov_deg = 2*degrees(atan(cy/f))`
- `pitch_down_deg = degrees(atan((cy-horizon_y)/f))`, roll 0
- world→camera rotation matrix with columns `dL`, `dUp`, `dR`
- each rectangle as width/height in metres, distance from the corner, and drop below the ceiling

## Practical notes

- Occlusion is the main obstacle: skirting boards hide behind furniture. Prefer ceiling junctions,
  which are usually clear, and take the second line from furniture edges parallel to the wall.
- Colour segmentation is a quick way to measure an obstacle's true extent — find the greenest pixels
  to get a plant's real outline before deciding a rectangle clears it.
- When several panels must look like a matched set, give them **identical height and identical drop
  below the ceiling in wall units**, and let only the width vary. They will then read as level with
  each other despite projecting to wildly different shapes.
- **Lens distortion.** This assumes the photo has no significant barrel distortion. A raw phone shot
  at wide angle often does, and lines that curve will quietly poison the vanishing points.
  Lens-correct first if the residuals come out stubbornly high.

**State each prediction before measuring it, and treat a fit as a hypothesis until its residual and
an independent check agree.**
