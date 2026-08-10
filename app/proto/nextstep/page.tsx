import NextStepCanvas from "@/components/enquiry/nextstep-canvas";
import { NEXTSTEP_WIDTH_PX, NEXTSTEP_HEIGHT_PX } from "@/components/enquiry/nextstep-geometry";

/**
 * Prototype bench for the Next step button mesh.
 *
 * ⚠ A BENCH, NOT A ROUTE ANYONE SHIPS. It exists so the chrome can be judged at
 * its real size against the corridor's real background, without waiting ~7s
 * through the opening choreography for every look. Delete it when the button is
 * approved and living in the corridor.
 *
 * ⚠ THE BACKGROUND IS `GROUND_COLOR` #101010 ON PURPOSE. Chrome is a mirror and
 * has no colour of its own, so the ground it sits against is part of the
 * material's read. Judging it on white would answer a question nobody asked —
 * and the near-black ground is exactly why obsidian was rejected for this button.
 *
 * The CSS button sits alongside for comparison. It is the GEOMETRY reference and
 * NOT the material reference: Carl, 10 August — *"it was not opal... trying to be
 * frosted glass... only the next step button wont be frosted glass."*
 *
 * Dials: ?chromerough= ?chromeenv= ?amber=
 */
export default function NextStepProtoPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  void searchParams;
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#101010",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ color: "#666", fontSize: 12, letterSpacing: "0.08em" }}>
        MESH — chrome blue metal
      </div>

      <div
        id="mesh-button"
        style={{
          position: "relative",
          width: NEXTSTEP_WIDTH_PX,
          height: NEXTSTEP_HEIGHT_PX,
        }}
      >
        <NextStepCanvas />
        {/* The label sits above the mesh, as it will in the corridor. */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#e8edf5",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.025em",
            pointerEvents: "none",
          }}
        >
          Next step
        </span>
      </div>

      <div style={{ color: "#666", fontSize: 12, letterSpacing: "0.08em" }}>
        CSS — the button being replaced (geometry reference only)
      </div>

      <button className="enquiry-nextstep-btn" id="css-button" type="button">
        Next step
      </button>
    </main>
  );
}
