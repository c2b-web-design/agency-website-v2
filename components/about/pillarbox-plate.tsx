"use client";

import Image from "next/image";

/**
 * §2's pillarbox band — **CHUNK 1: ONE SAMPLED STRIP, RIGHT SIDE ONLY.**
 *
 * ⚠ **RIGHT BAND ONLY** — Carl, 22 September 2026: *"i said nothing about the
 * left side. just the right, i want to see how it looks."* **The left is
 * untouched, so the two sit side by side as a before/after in one frame.**
 *
 * ⛔ **ONE STRIP, PLACED ONCE, TIGHT AGAINST THE PICTURE'S EDGE** — *"dont put
 * 6 tiles in. Sample the edge and reproduce it once tight next to it."*
 * ⚠⚠ **A SIX-TILE VERSION WAS BUILT AND REJECTED BEFORE IT WAS SEEN.**
 *
 * ⛔⛔ CARL'S METHOD, 22 September 2026, after the Builder built mask, fill, fade
 * and blend in one pass and then could not find which was broken: *"I would do
 * this in stages (chunks)... Just fill them up, lets see what weve got to work
 * with. The problem with doing everything all at once is you have to hunt to
 * find the issue with all of it."*
 *
 * ---
 *
 * ⛔⛔ AND THE BUILDER'S "THE WALL IS ALL BLACK" CLAIM WAS WRONG. Carl: *"Whats
 * there is not black. i can see the difference."* ⚠⚠ **Measured on his crop:
 * `rgb(9,12,15)`.** ⛔ **The real defect was that it was PERFECTLY UNIFORM —
 * luma 12.1 across every column, identical to three significant figures, while
 * the picture side varied 19.4 -> 15.8. The flatness reads as dead, not the
 * darkness**, and a stretched single column can only ever be flat.
 *
 * ⛔⛔ **THE BAND IS BUILT FROM THE PICTURE'S OWN LAST PIXEL COLUMN** — Carl,
 * 22 September 2026: *"Is this possible that the last pixel at the edge of the
 * image can be measured... i would imagine they are all different or within a
 * narrow band. if the new pixel to the right can be lowered proportionately it
 * would solve the blending and shading problem. Then extend outwards."*
 *
 * ⚠⚠ **HE WAS RIGHT ABOUT THE NARROW BAND.** Measured on the plate's final
 * column, 1707 rows: **luma 5.7 at the top, rising smoothly to 19.7 around 30%,
 * falling back to ~9 by 85%.** (One 141.7 spike is a skirting highlight.)
 *
 * ⛔ **SO THE JOIN IS EXACT BY CONSTRUCTION, NOT BY TUNING.** The band's first
 * column IS the picture's last column, at every height. **There is no shade to
 * match, because it is the same shade.**
 *
 * ⚠ THE ASSET IS `public/about-edge-column.png`, **2x1707, 1.0KB** — the mean
 * of the final EIGHT columns, so a single noisy pixel cannot define a whole
 * row. ⛔ **Full plate height**, so it needs no vertical crop and the gradient
 * cannot drift.
 *
 * ⚠⚠ **TWO EARLIER SAMPLING ATTEMPTS ARE SUPERSEDED AND RECORDED SO THEY ARE
 * NOT RETRIED:**
 *
 *     block  x 90-99%, y 20-50%   mean luma 22.9   too light — the lit wall
 *     strip  x 97-100%, y 0-80%   mean luma 14.0   right shade, WRONG GRADIENT
 *
 * ⛔ **The strip version produced Carl's *"ill fitting wig"*: rendered into the
 * band at `100%` it was squeezed 1.25x, so its vertical gradient ran at the
 * wrong rate — diff range 6.67 levels with the sign flipping at 33% height.**
 * ⚠ Correcting it to `80%` halved that to 3.67. **Using the edge column removes
 * the failure mode entirely rather than tuning it.**
 *
 * ⛔⛔ WHAT YOU SEE IN §2 IS WEBGL, NOT THIS IMAGE — five rebuilds found it.
 * `RoomBackplate` in `about-card-canvas.tsx` draws the same photograph as 3D
 * geometry (D-084/D-085). ⚠ **A CSS mask here can never touch it** — proven by
 * compositing over a red backdrop: the room stayed opaque (redGain 0) while the
 * bands went transparent (redGain 129-184). **The bands are still free DOM
 * space because the canvas is confined to its own centred 3:2 box.**
 *
 * ⚠ PROVISIONAL AND UNAPPROVED, 22 September 2026.
 */

export default function PillarboxPlate() {
  /** ⚠ Alignment guides for the skirting seam — `?skguide=1`. Dev only. */
  const skguide =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("skguide") === "1";

  /**
   * ⛔⛔ ONE STRIP, NOT SIX — Carl, 22 September 2026: *"dont put 6 tiles in.
   * Sample the edge and reproduce it once tight next to it."*
   *
   * ⚠ **`no-repeat`.** The strip sits hard against the picture's edge at its
   * natural width and height; whatever the band does not cover stays as it is.
   * **Chunk 1 is one strip and nothing else.**
   */
  const bandStrip = {
    backgroundImage: 'url("/about-edge-column.png")',
    /* ⛔ THE STRIP NOW SPANS THE WHOLE BAND so the ramp has something to act on
       across its full width. ⚠ At 240px against a 77px source that is a ~3.1x
       horizontal stretch — **acceptable only because the strip is plain wall
       with no structure to distort.** Stated rather than hidden. */
    /**
     * ⛔⛔ THE HEIGHT IS **80%**, NOT 100%, AND THAT IS WHAT FITS THE WIG.
     *
     * ⚠⚠ CARL, 22 September 2026, on the first ramped version: *"like an ill
     * fitting wig - you can still see the join."* ⛔ **Measured, and it was not
     * a step at the seam — it was a VERTICAL-GRADIENT MISMATCH:**
     *
     *          picture(1655)  band(1675)   diff
     *    14%       14.67        11.67      -3.00   band too DARK
     *    21%       18.00        14.33      -3.67
     *    40%       16.33        18.33      +2.00   band too LIGHT
     *    65%       10.67        13.67      +3.00
     *
     *    diff range 6.67 levels, SIGN FLIPPING around 33% of height
     *
     * ⛔ **The strip source is 80% of plate height** (cut at the skirting), and
     * rendering it at `100%` of the band squeezed it by **1.25x** — so the
     * wall's own vertical gradient ran at the wrong rate and the two curves
     * crossed at one height and diverged either side. **Right colour, wrong
     * shape. A wig.**
     *
     * ⚠ At `80%` the strip renders at the PLATE'S OWN SCALE, so its gradient
     * and the picture's advance together. ⛔ **It ends above the band's bottom
     * by design** — Carl: *"It doesnt matter that it wont reach the bottom."*
     *
     * ⚠⚠ **THE JOIN CONDITION, IN CARL'S WORDS:** *"to get the blend close the
     * left hand side of the new strips numbers must be closer to the right hand
     * side of the sampled strip numbers."* **At every height, not one.**
     */
    /**
     * ⛔⛔ **100% HEIGHT NOW, NOT 80% — AND THE WIG PROBLEM CANNOT RECUR.**
     * The asset is the plate's FULL height, so rendering it at `100%` puts it
     * at the plate's own scale by construction. ⚠ **The 80% figure belonged to
     * the old cropped strip and would now be wrong.**
     *
     * ⚠ THE WIDTH IS STRETCHED ACROSS THE BAND AND THAT IS THE POINT: a 2px
     * source has no horizontal structure to distort. **Every column of the band
     * is the picture's edge column**, and the ramp below is what makes them
     * differ.
     */
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left top",
  } as const;

  /**
   * ⛔⛔ THE EASE-OUT — AND ITS RATE IS MEASURED FROM THE PHOTOGRAPH, NOT CHOSEN.
   *
   * ⚠⚠ CARL, 22 September 2026: *"The pixel values of the new strip will match
   * exactly where its sampled from and thats both a data problem and a blending
   * problem. We know as the image proceeds further towards the viewport edge it
   * must get darker. Thats a numbers problem."*
   *
   * ⛔ **THE WALL'S OWN FALLOFF, FITTED OVER THE SEVEN CLEAN COLUMNS AT THE
   * RIGHT EDGE (x 93-99%, y 5-75%, objects excluded):**
   *
   *     luma = -0.5146 * x% + 65.23     reaches 0 at x = 126.8% of plate width
   *
   * ⚠ **THE BAND ONLY REACHES 117.4% AT 16:9**, so the natural rate leaves the
   * viewport edge at **luma 4.8, not 0** — most of the way, not all of it:
   *
   *     0% across band   luma 13.8
   *     50%              luma  9.3
   *     100%             luma  4.8   <- still a step to black
   *
   * ⛔⛔ **SO THE PHYSICS DOES 65% OF THE WORK AND AN EASE CLOSES THE REST.**
   * The `cubic-bezier`-shaped alpha ramp below follows the linear rate early —
   * where it is measured — and accelerates late, where it is not. ⚠ **The
   * departure is deliberate and it is at the END, furthest from the picture,
   * where there is nothing left to contradict.**
   *
   * ⚠ AND CARL'S POINT ABOUT THE ELLIPSE MAY FOLLOW FROM THIS: *"It may not
   * have to be a vignette or an ellipse fade."* ⛔ **If the ramp removes the
   * vertical edge, the oval is redundant** — it only ever existed to soften
   * that line. **Judge this before building one.**
   */
  const easeOut =
    "linear-gradient(to right, " +
    "rgba(0,0,0,1) 0%, rgba(0,0,0,0.93) 18%, rgba(0,0,0,0.82) 36%, " +
    "rgba(0,0,0,0.63) 55%, rgba(0,0,0,0.38) 73%, rgba(0,0,0,0.15) 88%, " +
    "rgba(0,0,0,0) 100%)";

  const bandRight = {
    ...bandStrip,
    maskImage: easeOut,
    WebkitMaskImage: easeOut,
  } as const;

  /**
   * ⛔ THE LEFT BAND — its own edge column, and its own ease running the other
   * way. ⚠ `scaleX(-1)` on the gradient is not enough: the IMAGE must also read
   * from the left edge, so it has its own asset.
   *
   * ⛔⛔ **NO SKIRTING IS DRAWN, AND A POLYGON THAT DID WAS BUILT AND REMOVED.**
   * Both of its boundaries were fitted honestly — `TOP y = -2.672x + 0.9036`,
   * `BOTTOM y = -2.390x + 0.9637`, thickness 6.01% at the picture edge — and it
   * exited the frame 51px into a 248px band, exactly as the geometry demands.
   * ⚠⚠ **On screen it read as a horizontal light band, which Carl rejected
   * immediately:** *"the horizontal white skirting should not be there."*
   * ⛔ **A correct fit is not the same as a correct picture.**
   *
   * ⚠ **AND THE COLUMN ITSELF CARRIED TWO CONTAMINANTS**, both repaired by
   * Carl's own method — *"sample the wall pixels horizontally to use the same
   * technique"*:
   *
   *     foliage    the pothos, greenness peaking at y ~ 21%
   *     skirting   luma 58 at y 92-95%
   *
   * ⛔ **125 of 1707 rows are now taken from clean wall FURTHER RIGHT at the
   * same height** — 36 found a clean window, 89 fell back to the nearest clean
   * row above. ⚠ **Max greenness 4.63 -> 2.00, max luma 58.0 -> 22.0.**
   */
  const easeOutLeft = easeOut.replace("to right", "to left");
  const bandLeft = {
    ...bandStrip,
    backgroundImage: 'url("/about-edge-column-left.png")',
    maskImage: easeOutLeft,
    WebkitMaskImage: easeOutLeft,
  } as const;


  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ⛔⛔ EACH BAND IS EXACTLY THE PILLARBOX, NOT HALF THE SECTION.
          `calc((100% - 150vh) / 2)` is the gap beside a 3:2 plate in a
          full-height box — the same geometry `object-contain` resolves to.

          ⚠⚠ AN EARLIER VERSION USED `w-1/2` AND THE TILE WOULD HAVE BEEN SIZED
          TO 953px RATHER THAN ~247px — **a 4x horizontal stretch, with only its
          outer sliver ever visible behind the plate.** ⛔ Sizing the box to the
          real band is what makes `100%` mean the band.

          ⚠ `max(0px, ...)` so a viewport NARROWER than 3:2 (where there is no
          band at all) collapses to zero rather than going negative. */}
      {/* ⛔⛔ THE RIGHT BAND ONLY — Carl, 22 September 2026: *"i said nothing
          about the left side. just the right, i want to see how it looks."*
          ⚠ **The left band is deliberately untouched so the two sit side by side
          as a before/after in one frame.** */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{ ...bandRight, width: "max(0px, calc((100% - 150vh) / 2))" }}
        aria-hidden="true"
      />

      {/* ⛔ THE LEFT BAND — the wall column, then the skirting corner over it. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{ ...bandLeft, width: "max(0px, calc((100% - 150vh) / 2))" }}
        aria-hidden="true"
      />

      {/* ⛔⛔ THE SKIRTING CORNER — A SMALL PIECE THAT ONLY HAS TO READ AS
            SKIRTING. Carl, 22 September 2026: *"its only a small number of
            pixels in a corner... It only has to look like the skirting."*

            ⚠⚠ **THIS REPLACES A GEOMETRICALLY CORRECT POLYGON THAT LOOKED
            WRONG.** Both skirting boundaries were fitted honestly
            (`TOP y = -2.672x + 0.9036`, `BOTTOM y = -2.390x + 0.9637`) and the
            line exits the frame 51px into a 248px band — a 60.6 degree stub in
            the corner. ⛔ **Carl rejected it on sight: *"the horizontal white
            skirting should not be there."*** ⚠ **A correct fit is not the same
            as a correct picture**, and chasing the true trajectory further
            would have meant inventing a shallower angle the photograph
            contradicts.

            ⛔⛔ **IT IS A SAMPLE, NOT A SYNTHESISED GRADIENT — AND A SYNTHESISED
            ONE WAS BUILT AND REJECTED FIRST.** Carl: *"no thats not it. It
            angles to the left and youve blurred it. Sample the last part of
            skirting and stick it on the end."*

            ⚠⚠ **THE FIRST ATTEMPT BUILT THE TONES AS A CSS GRADIENT** from the
            measured lip (`rgb(68,75,81)`) and face (`rgb(53,58,62)`), with a
            2.6deg shear. ⛔ **A gradient has no texture and a shear leans the
            whole block — it read as a blurred wedge, not as skirting.**

            ⛔ **THE ASSET IS `public/about-skirting-left.png`, 40x123** — the
            plate's own first 40px at **y 88.64-95.90%**, which is where the
            skirting sits there (found by thresholding at luma 30). **Real
            pixels: the lit lip, the darker face and the falloff are all in the
            sample because they are in the photograph.**

            ⚠ Carl named that structure before it was measured: *"The skirting
            has a lighter top edge and a darker face."*

            ⛔ **THE FLOOR BELOW IS LEFT ALONE** — *"the floor is darker in front
            of the skirting and need not be touched. It will read as a
            shadow."*

            ⚠ **NO SHEAR AND NO ROTATION.** The piece sits at the height it was
            cut from and carries the band's own ease, so it fades outward with
            the wall. */}
        <div
          className="absolute"
          style={{
            /**
             * ⛔⛔ POSITIONED FROM THE SECTION'S LEFT EDGE, NOT `right: 0`.
             *
             * ⚠⚠ **THE SKIRTING IS NOW A SIBLING OF THE BAND, NOT ITS CHILD** —
             * it had to leave, because **the band's ease-out mask was dimming
             * it**: source peak luma 105 at x=0, measured 57 on screen. ⛔ The
             * ease is keyed to the band's full width while the skirting occupies
             * only its first ~22px, **so it was being faded for a distance it
             * never travels.**
             *
             * ⚠ But a sibling's `right: 0` is the SECTION's right edge, which
             * put it behind the plate and it vanished entirely (measured: band
             * slope 0.00deg, luma 19). **The left band ends where the plate
             * begins, so that offset is what anchors it.**
             */
            /**
             * ⛔⛔ **+1px OF OVERLAP INTO THE PLATE, AND IT CLOSES A HAIRLINE.**
             *
             * ⚠⚠ Carl: *"I can see the join. The black line."* ⛔ **Measured —
             * ONE column, exactly at the plate edge:**
             *
             *     x=239  luma 52     x=240  luma 10     x=241  luma 55
             *
             * ⚠ The band is `(1920 - 1425) / 2 = 247.5px`, so the element's
             * right edge lands on a **HALF PIXEL**. It rounds away and a
             * hairline of page background (`neutral-950`, luma 10) shows
             * through. ⛔ **Nothing was misaligned — the geometry simply has no
             * whole pixel there.**
             *
             * ⚠ Extending 1px INTO the plate is safe: the overlapping column is
             * the skirting's own content at the seam, which is what the plate
             * draws there anyway.
             */
            left: "max(0px, calc((100% - 150vh) / 2 - 150vh * 40 / 2560))",
            /**
             * ⛔⛔ 90.80%, NOT 88.64% — AND THE 2.16% ERROR WAS VISIBLE AT ONCE.
             * Carl: *"the bottom of the new skirting is sitting at the top of
             * the old at the wrong angle."*
             *
             * ⚠⚠ **THE FIRST PLACEMENT AVERAGED 30px OF PLATE**, where the
             * skirting has already climbed. **The seam is at x=0, so only x=0
             * decides the height:**
             *
             *     x  0-4px    top 90.80%   bot 96.31%   <- the seam
             *     x  0-30px   top 88.64%   bot 95.90%   <- what was used
             *     x 32-40px   top 87.11%   bot 92.62%
             *
             * ⛔ **A wider window is a better SAMPLE and a worse ANCHOR.**
             */
            /**
             * ⛔⛔ THE CROP SPANS THE WHOLE DIAGONAL, AND THE ASSET IS FLOPPED.
             *
             * ⚠⚠ **A TIGHT CROP COLLAPSED AT THE SEAM.** Cut at the skirting's
             * extent at x=0 only, the piece was **1.37% thick at the seam
             * against the picture's 5.47%** — because the skirting runs
             * diagonally through the rectangle, so a box sized for one column
             * clips every other. ⛔ **The crop must contain its extent at EVERY
             * column it covers: y 86.53% to 96.60%, from x=40's top to x=0's
             * bottom.**
             *
             * ⛔⛔ **THE SAMPLE IS UNFLOPPED, AND A FLOPPED VERSION WAS BUILT
             * AND REVERTED. THIS IS AN UNSOLVED CONSTRAINT, NOT A SETTING.**
             *
             * ⚠⚠ **IN THE PICTURE THE SKIRTING DESCENDS TOWARD THE SEAM** —
             * plate x=40 at y 86.8%, x=0 at y 91.0%. **Outside the frame it must
             * KEEP descending.** ⛔ **Continuing that needs pixels from x < 0,
             * which do not exist.** Every arrangement of the data available
             * gives one of three wrong answers:
             *
             *     right edge at seam   x=40 lands at the seam   -> 4% STEP
             *     flopped              slope reverses           -> a V
             *     left edge at seam    extends the wrong way    -> off-frame
             *
             * ⚠ **THE FLOPPED VERSION MEASURED PERFECTLY AND LOOKED WRONG:**
             * band 90.84-96.21% against picture 90.74-96.21%, bottoms identical,
             * tops and thickness within 0.10%. ⛔⛔ **Carl saw a V immediately:**
             * *"the skirting is not continuous."*
             *
             * ⚠⚠ **THE MEASUREMENTS WERE CHECKING THE WRONG PROPERTY.** They
             * compared the skirting's top and bottom edges as a BAND, at the
             * join column only — **never the direction either side of it.**
             * Carl's own test is the right instrument: *"The old skirting will
             * have a pixel where it meets the floor. The new will have a pixel
             * at the bottom on its furthest away, right hand side. When these 2
             * pixels are next to each other it will be aligned."*
             *
             * ⛔ **THE FLOOR-CONTACT ANCHOR IS MEASURED AND CORRECT TO 0.008%:**
             * the old skirting meets the floor at plate y **96.426%** at x=0,
             * and this placement puts the asset's contact at **96.434%**.
             * **Vertical is solved; the SLOPE DIRECTION is not.**
             *
             * ⚠ **CURRENT STATE: unflopped — correct slope, ~4% step at the
             * seam.** Carl has been offered three routes (drop the fragment,
             * accept an honest 51px stub, or his own alternative) and has not
             * chosen. **Do not re-try the flop.**
             */
            /**
             * ⛔⛔ **90.54%, SET BY CARL'S CORNER TEST AND THEN MEASURED.**
             *
             * ⚠⚠ **THE BUILDER'S EARLIER "ALIGNED TO 0.008%" CLAIM WAS FALSE.**
             * It compared the asset's floor-contact row against the picture's
             * **in source coordinates**, which ignored that the element is a
             * sibling of the band and resolves `top` against the SECTION. ⛔ The
             * real on-screen gap was **28px**.
             *
             * ⚠ Carl nudged twice by eye (*"lower by 5px"*, then *"another
             * 5px"*) and correctly reported **"its not moved"** — 10px of a 28px
             * error is invisible. **His instrument found it; the Builder's
             * arithmetic had hidden it.**
             *
             * ⛔ **MEASURED ON SCREEN, Carl's own test — the old skirting's
             * floor-contact pixel against the new piece's bottom-right pixel:**
             *
             *     before   band 886px   picture 914px   gap -28px
             *     after    band 914px   picture 914px   gap   0px
             *
             * ⚠⚠ **A PIXEL OFFSET STORED AS A PERCENTAGE IS VIEWPORT-DEPENDENT.**
             * 2.95% is 28px at a 949px-tall section and proportionally different
             * elsewhere. **Verified at 1920x950 only.**
             */
            top: "90.54%",
            /**
             * ⛔⛔ THE WIDTH IS IN PLATE SCALE, NOT A RAW PIXEL COUNT.
             *
             * ⚠⚠ **A FIXED `40px` FLATTENED THE ANGLE.** The plate renders at
             * 0.557x, so its 40 source pixels occupy **22.3px on screen** — but
             * the piece was drawn 40px wide, a **1.8x horizontal stretch** that
             * dropped the slope from -60.9 to -52.3 degrees. ⛔ **Measured: the
             * mismatch got WORSE, 4.87 -> 8.63 degrees, while the vertical
             * alignment was being fixed.**
             *
             * ⚠ `calc(...)` ties it to the plate's own rendered width, so the
             * sample is never rescaled and the angle is whatever the photograph
             * says it is.
             */
            width: "calc(150vh * 40 / 2560 + 1px)",
            height: "10.08%",
            backgroundImage: 'url("/about-skirting-left.png")',
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            /**
             * ⛔⛔ NO EASE ON THE SKIRTING. **It was carrying the wall's ramp and
             * that is what dimmed it.**
             *
             * ⚠⚠ The source peaks at **luma 105 at x=0**, and the band measured
             * **57** — because the ease is keyed to the BAND's full width while
             * the skirting occupies only its first 22px. ⛔ **It was being faded
             * for a distance it never travels.**
             *
             * ⚠ It is small enough, and close enough to the seam, that it needs
             * no falloff of its own.
             */
          }}
        />

        {/* ⛔ ALIGNMENT GUIDES — `?skguide=1`, OFF by default. Carl: *"draw
            guide lines on if you have to first."* ⚠ Cyan marks the skirting's
            TOP at the seam (90.80%), pink its BOTTOM (96.31%). **Both are
            measured at x 0-4px, which is the only column the seam touches.** */}
        {skguide && (
          <>
            <div
              className="absolute left-0 right-0"
              style={{ top: "90.80%", height: "1px", background: "#4fd8ff" }}
            />
            <div
              className="absolute left-0 right-0"
              style={{ top: "96.31%", height: "1px", background: "#ff4fd8" }}
            />
          </>
        )}

      {/* ⚠ THE PLATE, in its own centred 3:2 box so the element ends where the
          picture ends. ⛔ `fill` alone gave it the WHOLE SECTION and its
          transparent letterbox area covered the bands — measured at
          [0, 951, 1905, 949] before the wrapper, [241, 951, 1424, 949] after. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full max-h-full w-auto max-w-full aspect-[3/2]">
          <Image
            src="/about-studio-source.jpg"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
