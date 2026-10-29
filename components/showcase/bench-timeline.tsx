"use client";

/**
 * ⛔ THE RECORDER's TIMELINE AND INSPECTOR — under the picture. R1: Carl's *"In DAW terms the chunks would function like
 * clips"*. ⛔ T1a, CAMERA TRACKS (`live-work/plan-camera-tracks-t1a-27-october.md` v2): ONE ROW PER CAMERA TRACK, the TOP
 * track first (Resolve's V2 over V1), each with its ARM button (red when armed: where A records). Clips at their START, as
 * wide as they show, coloured by camera; inside a row a newer take draws OVER an older one. Numbered 1, 2, 3 by start
 * across all tracks (R1's sequential rule; per-track numbers and take lanes are T1b).
 *
 * - Click a clip to SELECT it; shift-click (or ctrl / cmd) for several. ⛔ T1b: drag on the RULER only to SCRUB (Carl: *"It
 *   should just be on the time ruler"*); a bare-row click clears the selection. ⛔ Custom pointer handling, never a native
 *   range ([C3]): `mousedown`'s default is prevented on every control ([B3]), which would break a native range's drag.
 * - ⛔ T1b, TRIM AND MOVE (`live-work/plan-trim-and-move-t1b-29-october.md` v1.4): drag a clip's EDGE to trim (Resolve's
 *   trim cursor; the picture shows the frame at the edge; the PLAYHEAD NEVER MOVES — only the ruler moves it), its BODY to
 *   move it along its track; snapping ON, N toggles it;
 *   Esc cancels. The drag is the PAGE's edit (one owner); this timeline is CONTROLLED and draws `applyEdit(chain, edit)`.
 * - ⛔ EACH JOIN SHOWN AS IT IS (`joinsOf`: wherever what PLAYS changes): a CUT between cameras; else the MISMATCH (how far
 *   the incoming clip starts from where the outgoing one IS) — the Builder compensates it at hand-off. ⛔ GAPS hatched: no
 *   clip plays there, and playback holds the last picture.
 * - ⛔ [E4] EVERY TAKE REACHABLE WITHOUT DELETING: the inspector lists every take under the playhead (`takesAt`), the one that
 *   plays first; click a line to select it (and Play plays it solo).
 * - While recording, the timeline is DISABLED ([A5]); the recording shows as a red block on the armed row.
 * - ⛔ SHAPE CLIPS (the plan `live-work/plan-shape-clips-27-october.md` v2.1, Step 3): a shape clip is a clip like any
 *   other, labelled "corkscrew". Selected, its NUMBERS show in Carl's units (metres, laps, m/s, seconds), each editable
 *   (Enter or leaving the field commits; a refused value is said, not applied), with "Start here" and the clash warning
 *   (Carl: *"In, warning only"*). Shapes are placed through the bench's dev hook. ⛔ The Corkscrew PANEL (Start here / End
 *   here / Place, nothing selected) was built and REMOVED (Carl: *"If there are to be some "signature moves" that panel will
 *   grow very quickly. It a good idea but not needed."*).
 */
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  applyEdit, chainEnd, clipEnd, clipLength, clipPoseAt, EDGE_S, gapsOf, isTrimmed, joinsOf, numberClips, shapeLength, snapSpan, snapTargets, snapTime, sourceLength, takesAt,
  type BarrelShape, type Chain, type Clip, type Edit, type GlideShape, type HelixShape, type Join, type Pose, type Shape, type Units,
} from "./bench-chain";

export const CAM_COLOURS = ["#5b7fa6", "#c08a3e", "#7f9a74", "#9a6fa8", "#a65b5b"];
export const camColour = (cam: number) => CAM_COLOURS[(cam - 1) % CAM_COLOURS.length];

type Metres = { right: number; up: number; out: number };
const noFocus = (e: { preventDefault: () => void }) => e.preventDefault();
const sec = (s: number) => `${s.toFixed(1)} s`;

/** A tick spacing that gives at most a dozen labels across the span */
function tickStep(span: number) {
  for (const s of [0.5, 1, 2, 5, 10, 15, 30, 60, 120]) if (span / s <= 12) return s;
  return 300;
}

/** ⛔ T1b: a pressed clip, from pointerdown to its click — the zone, what was selected AT THE PRESS, the scale frozen there */
type Press = {
  id: string;
  pointerId: number;
  el: HTMLElement;
  zone: "head" | "tail" | "body";
  additive: boolean;
  wasSelected: boolean;
  /** the drag has STARTED: the pointer moved `MOVE_PX` (an edge or the body — Carl, on take 1: a press alone does nothing) */
  started: boolean;
  /** the pointer actually moved — else the release CANCELS (an edge clicked changes nothing; the playhead stays) */
  moved: boolean;
  x0: number;
  rect: { left: number; width: number };
  span: number;
  anchorT: number;
  /** the pointer's time minus the dragged edge (a move: the start) at the press — the edge stays under the hand */
  grab: number;
};
/** the edge zones' width inside a clip; a clip narrower than `EDGE_MIN_PX` shows them only when selected (its body clickable) */
const EDGE_PX = 6;
const EDGE_MIN_PX = 18;
/** a press on the body that moves less than this is a CLICK */
const MOVE_PX = 3;
/** snapping's reach (Carl: "Snap, a few pixels") */
const SNAP_PX = 8;

export function BenchTimeline({
  chain,
  joins,
  gaps,
  T,
  armedCam,
  rec,
  selection,
  disabled,
  toMetres,
  onSelect,
  onSelectOnly,
  onArm,
  onScrub,
  edit,
  snap,
  metresPerD,
  onEditStart,
  onEditMove,
  onEditEnd,
  frame,
  shapeNote,
  onShapeEdit,
  onShapeStart,
}: {
  chain: Chain;
  joins: Join[];
  gaps: [number, number][];
  T: number;
  armedCam: number;
  rec: { at: number; length: number; cam: number } | null;
  selection: string[];
  disabled: boolean;
  toMetres: ((p: Pose) => Metres) | null;
  onSelect: (id: string, additive: boolean) => void;
  /** set the selection outright: a press on an unselected clip, a bare-row click (empty) */
  onSelectOnly: (ids: string[]) => void;
  onArm: (cam: number) => void;
  onScrub: (T: number) => void;
  /** ⛔ T1b: the drag in progress — the PAGE's (one owner); this timeline is CONTROLLED and only reports */
  edit: Edit | null;
  snap: boolean;
  /** the chain's metres per unit, for the joins drawn during a drag */
  metresPerD: number;
  /** false: refused (recording, or a drag already live) */
  onEditStart: (e: Edit) => boolean;
  onEditMove: (e: Edit) => void;
  /** `commit` false: a cancel. The page takes the FIRST ending; later ones do nothing */
  onEditEnd: (commit: boolean) => void;
  /** the chain's units and the arch's floor and face (cm) — for a shape's numbers in metres; null until measured */
  frame: { units: Units; floor: number; z1: number } | null;
  /** the clash warning for a shape clip, in words */
  shapeNote: (c: Clip) => string | null;
  /** an edit: null, or the refusal in words */
  onShapeEdit: (id: string, s: Shape) => string | null;
  onShapeStart: (id: string) => void;
}) {
  // ⛔ T1b: WHILE A DRAG RUNS everything drawn comes from `applyEdit` on the CURRENT chain — a DRAWING input only (the
  // plan's §5a "new channel"); storage and the clash check read the committed chain, in the page
  const shown = edit ? applyEdit(chain, edit) : chain;
  const end = chainEnd(shown);
  // ⛔ the scale FROZEN at the press ([R4]): a lengthening drag would otherwise slide the edge away from the cursor
  const span = edit ? edit.span : Math.max(end, rec ? rec.at + rec.length : 0, 4) * 1.04;
  const pct = (t: number) => `${(t / span) * 100}%`;
  const step = tickStep(span);
  const ticks = Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => i * step);
  const numbers = numberClips(shown);
  const rows = [...shown.tracks].reverse();
  const shownJoins = edit ? joinsOf(shown, metresPerD) : joins;
  const shownGaps = edit ? gapsOf(shown) : gaps;
  const edited = edit ? (shown.clips.find((c) => c.id === edit.id) ?? null) : null;
  // the dragged edge AS CLAMPED (review 2 [5]) — for the readout. ⛔ THE PLAYHEAD STAYS WHERE IT WAS PARKED (Carl, on take 1:
  // *"If i click on the clip it mustnt move the playhead"*); only the ruler moves it
  const edgeT = edited && edit && edit.kind !== "move" ? (edit.kind === "head" ? edited.start : clipEnd(edited)) : null;
  const playT = T;
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const press = useRef<Press | null>(null);
  const [snapAt, setSnapAt] = useState<number | null>(null);
  const [trackW, setTrackW] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTrackW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // ⛔ a drag ENDED ELSEWHERE (Esc, a hidden tab): release the capture — the page already ended it, so the
  // `lostpointercapture` this fires finds nothing live
  useEffect(() => {
    const p = press.current;
    if (edit || !p?.started) return;
    try {
      if (p.el.hasPointerCapture(p.pointerId)) p.el.releasePointerCapture(p.pointerId);
    } catch {
      // the element is gone or never held it: nothing to release
    }
  }, [edit]);

  // ⛔ THE SCRUB — the RULER ONLY (Carl: "It should just be on the time ruler")
  const scrubAt = (e: ReactPointerEvent) => {
    const r = track.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    onScrub(Math.max(0, Math.min(end, ((e.clientX - r.left) / r.width) * span)));
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || edit || !chain.clips.length) return;
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubAt(e);
  };

  // ── ⛔ T1b, TRIM AND MOVE — pointer handling on the clip
  const editFor = (p: Press, x: number): { e: Edit; to: number | null } | null => {
    const c = chain.clips.find((k) => k.id === p.id);
    if (!c) return null;
    const raw = ((x - p.rect.left) / p.rect.width) * p.span - p.grab;
    const tol = snap ? (SNAP_PX / p.rect.width) * p.span : 0;
    const targets = snap ? snapTargets(chain, p.id, p.anchorT) : [];
    const s = p.zone === "body" ? snapSpan(raw, clipLength(c), targets, tol) : snapTime(raw, targets, tol);
    return { e: { id: p.id, kind: p.zone === "body" ? "move" : p.zone, T: s.T, grab: p.grab, anchorT: p.anchorT, span: p.span }, to: s.to };
  };
  const clipDown = (e: ReactPointerEvent<HTMLButtonElement>, c: Clip) => {
    press.current = null;
    if (disabled || edit || e.button !== 0) return;
    const r = track.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    const zone = ((e.target as HTMLElement).closest("[data-edge]")?.getAttribute("data-edge") ?? "body") as Press["zone"];
    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    const wasSelected = selection.includes(c.id);
    if (!additive && !wasSelected) onSelectOnly([c.id]);
    const edge0 = zone === "tail" ? clipEnd(c) : c.start;
    const anchorT = Math.min(T, end);
    const p: Press = {
      id: c.id, pointerId: e.pointerId, el: e.currentTarget, zone, additive, wasSelected, started: false, moved: false, x0: e.clientX,
      rect: { left: r.left, width: r.width }, span, anchorT, grab: ((e.clientX - r.left) / r.width) * span - edge0,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    press.current = p;
  };
  const clipMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p || p.pointerId !== e.pointerId) return;
    if (!p.started) {
      // ⛔ NOTHING until the pointer moves `MOVE_PX` — an edge as the body (Carl, on take 1: a click on a clip changes nothing)
      if (Math.abs(e.clientX - p.x0) < MOVE_PX) return;
      const c = chain.clips.find((k) => k.id === p.id);
      if (!c) return;
      const kind = p.zone === "body" ? "move" : p.zone;
      p.started = onEditStart({ id: p.id, kind, T: p.zone === "tail" ? clipEnd(c) : c.start, grab: p.grab, anchorT: p.anchorT, span: p.span });
      if (!p.started) return;
    }
    const next = editFor(p, e.clientX);
    if (!next) return;
    if (Math.abs(e.clientX - p.x0) >= 1) p.moved = true;
    setSnapAt(next.to);
    onEditMove(next.e); // the page ignores it once the drag has ended (Esc, a hidden tab)
  };
  const clipUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p || p.pointerId !== e.pointerId) return;
    if (p.started) onEditEnd(p.moved);
    setSnapAt(null);
  };
  const clipLost = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (p && p.pointerId === e.pointerId && p.started) onEditEnd(false);
    setSnapAt(null);
  };
  /** ⛔ THE CLICK AFTER A PRESS: it toggles ONLY if the clip was selected AT THE PRESS and nothing dragged. Suppressed after a
   *  drag (a cancelled one too), after a press on an EDGE (a handle, never a toggle) and after a press that selected it
   *  (review 2 [1]). A keyboard click (`detail` 0) is always a click. */
  const clipClick = (e: ReactMouseEvent<HTMLButtonElement>, c: Clip) => {
    const p = press.current;
    press.current = null;
    if (e.detail !== 0 && p && p.id === c.id && (p.started || p.zone !== "body" || (!p.additive && !p.wasSelected))) return;
    onSelect(c.id, e.shiftKey || e.ctrlKey || e.metaKey);
  };

  const selected = shown.clips.filter((c) => selection.includes(c.id));
  const under = shown.clips.length ? takesAt(shown, Math.min(playT, end)) : [];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start" data-timeline>
      <div className={`min-w-0 flex-1 rounded-md border border-white/10 bg-neutral-900/60 ${disabled ? "opacity-70" : ""}`}>
        <div className="flex">
          {/* the track headers, row for row with the timeline: ruler, joins, then one per camera, top first */}
          <div className="w-24 shrink-0 border-r border-white/10 text-xs text-neutral-400">
            {/* ⛔ SNAPPING's state (Carl: "snapping always on and the N to turn it off/on") */}
            <div className="flex h-6 items-center border-b border-white/10 px-2 text-[10px]" data-snap={snap ? "on" : "off"} title="N turns snapping on and off">
              <span className={snap ? "text-amber-300" : "text-neutral-500"}>Snap {snap ? "on" : "off"}</span>
              <span className="ml-1 text-neutral-600">N</span>
            </div>
            <div className="h-4" />
            {rows.map((cam) => {
              const armed = cam === armedCam;
              return (
                <div key={cam} className="flex h-12 items-center gap-2 border-t border-white/5 px-2" data-track-header={cam}>
                  <button
                    type="button"
                    aria-label={`Arm Cam ${cam}`}
                    aria-pressed={armed}
                    title={`Arm Cam ${cam}: A records here (Start / C cycles)`}
                    onMouseDown={noFocus}
                    onClick={() => onArm(cam)}
                    className={`h-4 w-4 shrink-0 rounded-full border focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                      armed ? "border-red-300 bg-red-600" : "border-neutral-500 bg-transparent hover:border-red-400"
                    }`}
                  />
                  <span className={armed ? "font-semibold text-white" : ""}>Cam {cam}</span>
                </div>
              );
            })}
          </div>
          {/* the ruler and the rows share one track, so the playhead runs through all of them */}
          <div ref={track} className="relative min-w-0 flex-1 select-none" data-track-area>
            {/* ⛔ THE RULER — the one scrub surface */}
            <div
              className="relative h-6 border-b border-white/10 text-[10px] text-neutral-500"
              onPointerDown={down}
              onPointerMove={(e) => dragging.current && scrubAt(e)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
              data-scrub-track
            >
              {ticks.map((t) => (
                <span key={t} className="pointer-events-none absolute top-0 h-full border-l border-white/10 pl-1 leading-6 tabular-nums" style={{ left: pct(t) }}>
                  {t}s
                </span>
              ))}
            </div>
            {/* joins: a cut, or the mismatch the Builder will compensate; during a drag, the edge's readout */}
            <div className="relative h-4 text-[10px]" data-joins>
              {shownJoins.map((j) => {
                if (j.kind === "mismatch" && j.metres <= 0.01 && j.degrees <= 0.5) return null;
                return (
                  <span
                    key={j.t}
                    className={`absolute -translate-x-1/2 whitespace-nowrap rounded px-1 leading-4 ${j.kind === "cut" ? "bg-neutral-200 text-neutral-950" : "bg-amber-500/20 text-amber-300"}`}
                    style={{ left: pct(j.t) }}
                    data-join={j.kind}
                  >
                    {/* ⛔ metres unknown ("…") while the chain's units are not yet filled — never guessed from the live d */}
                    {j.kind === "cut" ? "CUT" : `${Number.isFinite(j.metres) ? j.metres.toFixed(2) : "…"} m · ${j.degrees.toFixed(0)}°`}
                  </span>
                );
              })}
              {edit && edited && (
                <span
                  className="absolute z-10 -translate-x-1/2 whitespace-nowrap rounded bg-sky-950 px-1 leading-4 text-sky-200 tabular-nums"
                  style={{ left: pct(edgeT ?? edited.start) }}
                  data-edit-readout
                >
                  {edgeT !== null
                    ? `${edgeT.toFixed(2)} s · ${clipLength(edited).toFixed(1)} of ${sourceLength(edited).toFixed(1)} s`
                    : `starts ${edited.start.toFixed(2)} s`}
                </span>
              )}
            </div>
            <div className="relative">
              {rows.map((cam) => (
                <div
                  key={cam}
                  className="relative h-12 border-t border-white/5"
                  data-track={cam}
                  // ⛔ a BARE-ROW click clears the selection (Carl: "Clear the selection"); it no longer scrubs
                  onClick={(e) => {
                    if (!disabled && !edit && e.target === e.currentTarget) onSelectOnly([]);
                  }}
                >
                  {/* ⛔ DOM ORDER STABLE (chain order, never sorted by take): a re-sort mid-drag would re-insert the dragged
                      button and may drop its pointer capture ([R7]); stacking is `zIndex` */}
                  {shown.clips
                    .filter((c) => c.cam === cam)
                    .map((c) => {
                      const on = selection.includes(c.id);
                      const n = numbers.get(c.id);
                      const moving = edit?.kind === "move" && edit.id === c.id;
                      const edges = on || (clipLength(c) / span) * trackW >= EDGE_MIN_PX;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          data-clip={n}
                          data-clip-id={c.id}
                          disabled={disabled}
                          aria-pressed={on}
                          aria-label={`Clip ${n}, Cam ${c.cam}, ${sec(clipLength(c))}`}
                          title={`Clip ${n} · Cam ${c.cam} · take ${c.order + 1} · ${sec(clipLength(c))} (click to select, shift-click for several; drag to move, drag an edge to trim)`}
                          onMouseDown={noFocus}
                          onPointerDown={(e) => clipDown(e, c)}
                          onPointerMove={clipMove}
                          onPointerUp={clipUp}
                          onPointerCancel={clipLost}
                          onLostPointerCapture={clipLost}
                          onClick={(e) => clipClick(e, c)}
                          className={`absolute inset-y-1 touch-none overflow-hidden rounded-sm border px-1.5 text-left text-[11px] leading-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                            on ? "border-white ring-1 ring-white" : "border-black/40"
                          } ${moving ? "cursor-grabbing" : "cursor-default"}`}
                          style={{ left: pct(c.start), width: `calc(${pct(clipLength(c))} - 2px)`, background: camColour(c.cam), zIndex: 1 + c.order }}
                        >
                          <span className="block truncate font-semibold">
                            {n}
                            {c.shape && <span className="ml-1 font-normal opacity-90">{c.shape.kind === "glide" ? "⤳ glide" : c.shape.kind === "barrel" ? "↻ barrel" : "↻ corkscrew"}</span>}
                          </span>
                          <span className="block truncate opacity-80">{sec(clipLength(c))}</span>
                          {/* ⛔ THE TRIM HANDLES — Resolve's trim cursor at each end */}
                          {edges && (
                            <>
                              <span data-edge="head" className="absolute inset-y-0 left-0 cursor-col-resize hover:bg-white/25" style={{ width: EDGE_PX }} />
                              <span data-edge="tail" className="absolute inset-y-0 right-0 cursor-col-resize hover:bg-white/25" style={{ width: EDGE_PX }} />
                            </>
                          )}
                        </button>
                      );
                    })}
                  {rec && rec.cam === cam && (
                    <div
                      className="absolute inset-y-1 z-[100000] rounded-sm border border-red-400 bg-red-600/40 px-1.5 text-[11px] text-white"
                      style={{ left: pct(rec.at), width: pct(Math.max(rec.length, span * 0.004)) }}
                      data-rec-block
                    >
                      ● Cam {rec.cam}
                    </div>
                  )}
                </div>
              ))}
              {/* the gaps: hatched across every row (no clip plays; playback holds the last picture) */}
              {shownGaps.map(([a, b]) => (
                <div
                  key={a}
                  className="pointer-events-none absolute inset-y-0 z-[100001] border-x border-amber-400/40"
                  style={{
                    left: pct(a),
                    width: pct(b - a),
                    background: "repeating-linear-gradient(135deg, rgba(251,191,36,.18) 0 4px, transparent 4px 9px)",
                  }}
                  data-gap={`${a.toFixed(2)}-${b.toFixed(2)}`}
                  title="Gap: no clip plays here"
                />
              ))}
              {!chain.clips.length && !rec && (
                <p className="pointer-events-none absolute inset-0 flex items-center px-3 text-xs text-neutral-500">
                  No clips yet. A records on the armed camera, from where it is.
                </p>
              )}
            </div>
            {/* ⛔ the SNAP line: where the dragged edge has locked */}
            {edit && snapAt !== null && (
              <div className="pointer-events-none absolute inset-y-0 z-[100003] w-px bg-amber-300" style={{ left: pct(snapAt) }} data-snap-line />
            )}
            {/* the playhead */}
            {chain.clips.length > 0 && (
              <div className="pointer-events-none absolute inset-y-0 z-[100002] w-px bg-sky-300" style={{ left: pct(Math.min(playT, span)) }} data-playhead>
                <span className="absolute -left-1 top-0 h-0 w-0 border-x-4 border-t-[6px] border-x-transparent border-t-sky-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="w-full shrink-0 rounded-md border border-white/10 bg-neutral-900/60 p-3 text-xs text-neutral-300 lg:w-64" data-inspector>
        {selected.length === 1 ? (
          (() => {
            const c = selected[0];
            // ⛔ through `clipPoseAt` at the clip's in and out — whatever its source (samples or a shape), and its trim
            const a = toMetres?.(clipPoseAt(c, c.start));
            const b = toMetres?.(clipPoseAt(c, clipEnd(c)));
            const m = (p?: Metres) => (p ? `${p.right.toFixed(2)}, ${p.up.toFixed(2)}, ${p.out.toFixed(2)}` : "…");
            return (
              <>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="col-span-2 mb-1 text-sm font-semibold text-white">
                  Clip {numbers.get(c.id)} <span className="font-normal text-neutral-400">· Cam {c.cam} · take {c.order + 1}</span>
                </dt>
                <dt className="text-neutral-500">Length</dt>
                <dd className="tabular-nums" data-inspector-length>
                  {isTrimmed(c) ? `${sec(clipLength(c))} of ${sec(sourceLength(c))}` : sec(clipLength(c))}
                </dd>
                {isTrimmed(c) && (
                  <>
                    <dt className="text-neutral-500">Trimmed</dt>
                    <dd className="tabular-nums">
                      in {sec(c.in)}, out {sec(c.out)}
                    </dd>
                  </>
                )}
                <dt className="text-neutral-500">Starts</dt>
                <dd className="tabular-nums">{sec(c.start)}</dd>
                <dt className="text-neutral-500">From</dt>
                <dd className="tabular-nums">{m(a)} m</dd>
                <dt className="text-neutral-500">To</dt>
                <dd className="tabular-nums">{m(b)} m</dd>
                <dd className="col-span-2 pt-1 text-[10px] text-neutral-500">Metres from ground zero: right, up, out from the arch&apos;s face.</dd>
              </dl>
                {c.shape && (
                  <ShapeFields key={c.id} clip={c} shape={c.shape} frame={frame} note={shapeNote(c)} disabled={disabled} onEdit={onShapeEdit} onStart={onShapeStart} />
                )}
                {/* ⛔ "Keep the trim" holds the cut in SECONDS: a pace change moves where along the move it falls */}
                {c.shape && c.out < shapeLength(c.shape) - EDGE_S && (
                  <p className="mt-1 text-neutral-500" data-trim-note>
                    Trimmed at {sec(c.out)}: a pace change keeps the cut at that time, so it falls at a different point along the move.
                  </p>
                )}
              </>
            );
          })()
        ) : selected.length > 1 ? (
          <p>
            <span className="text-sm font-semibold text-white">{selected.length} clips</span>
            <br />
            {sec(selected.reduce((s, c) => s + clipLength(c), 0))} in all. Play plays them solo, in time order; Delete removes them.
          </p>
        ) : (
          <p className="text-neutral-500">Select a clip to see it here. Shift-click for several.</p>
        )}
        {under.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-2" data-takes-under>
            <p className="mb-1 text-neutral-500">Under the playhead ({sec(Math.min(T, end))})</p>
            <ul className="space-y-0.5">
              {under.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onMouseDown={noFocus}
                    onClick={(e) => onSelect(c.id, e.shiftKey || e.ctrlKey || e.metaKey)}
                    disabled={disabled}
                    data-take={c.id}
                    className={`w-full rounded px-1.5 py-0.5 text-left hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                      selection.includes(c.id) ? "bg-white/15 text-white" : ""
                    }`}
                  >
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: camColour(c.cam) }} />
                    Cam {c.cam} · clip {numbers.get(c.id)} · take {c.order + 1}
                    {i === 0 ? <span className="ml-1 text-sky-300">(plays)</span> : <span className="ml-1 text-neutral-500">(covered)</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

const TAU = 2 * Math.PI;
const small =
  "rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] hover:bg-white/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400";

/** One number of a shape, in Carl's units: Enter or leaving the field commits; anything not a number is not applied */
function NumField({ label, unit, value, digits, disabled, onCommit }: { label: string; unit: string; value: number; digits: number; disabled: boolean; onCommit: (v: number) => void }) {
  const shown = value.toFixed(digits);
  const commit = (text: string) => {
    const v = Number(text);
    if (text.trim() !== shown && Number.isFinite(v)) onCommit(v);
  };
  return (
    <>
      <dt className="self-center text-neutral-500">{label}</dt>
      <dd className="flex items-center gap-1">
        <input
          key={shown}
          defaultValue={shown}
          disabled={disabled}
          inputMode="decimal"
          aria-label={unit ? `${label} (${unit})` : label}
          data-shape-field={label}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          onBlur={(e) => commit(e.currentTarget.value)}
          className="w-20 rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-right tabular-nums text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-sky-400"
        />
        <span className="text-neutral-500">{unit}</span>
      </dd>
    </>
  );
}

/**
 * ⛔ A SHAPE CLIP's NUMBERS (the plan v2.1, Step 3) — each converted to Carl's units and back through the CHAIN's units:
 * the axis (m right, m out from the arch's face), the laps and direction (from `theta0` / `theta1`), the radii (m), the
 * heights (m above the floor), the pace (m/s), the start's ease and the aim's settle (s). ⚠ The lens is HELD (the start's)
 * and shown, not edited here (the plan listed it editable; the Builder's narrowing, stated). The clash warning (Carl:
 * *"In, warning only"*) never blocks.
 */
type FieldsProps<S> = {
  clip: Clip;
  shape: S;
  frame: { units: Units; floor: number; z1: number } | null;
  note: string | null;
  disabled: boolean;
  onEdit: (id: string, s: Shape) => string | null;
  onStart: (id: string) => void;
};
/** a shape's numbers, by its kind */
function ShapeFields(props: FieldsProps<Shape>) {
  const { shape } = props;
  if (shape.kind === "barrel") return <BarrelFields {...props} shape={shape} />;
  return shape.kind === "glide" ? <GlideFields {...props} shape={shape} /> : <HelixFields {...props} shape={shape} />;
}

/** ⛔ A BARREL's NUMBERS (the Vader move): laps, the spiral's radius (m), where the spiral ends (% of the line), the pace
 *  along the line (m/s), the start's ease and the landing (s). Its line's ends are shown in From / To above. */
function BarrelFields({ clip, shape: s, frame, note, disabled, onEdit }: FieldsProps<BarrelShape>) {
  const [said, setSaid] = useState<string | null>(null);
  if (!frame) return <p className="mt-2 text-neutral-500">Barrel roll: its numbers show once the bench has measured the arch…</p>;
  const { d } = frame.units;
  const edit = (patch: Partial<BarrelShape>) => setSaid(onEdit(clip.id, { ...s, ...patch }));
  return (
    <div className="col-span-2 mt-2 border-t border-white/10 pt-2" data-shape-fields>
      <div className="mb-1 text-sm font-semibold text-white">Barrel roll</div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <NumField label="Laps" unit="" value={s.turns} digits={2} disabled={disabled} onCommit={(v) => edit({ turns: v })} />
        <NumField label="Radius" unit="m" value={(s.radius * d) / 100} digits={2} disabled={disabled} onCommit={(v) => edit({ radius: (v * 100) / d })} />
        <NumField label="Rotation ease" unit="% each end" value={(s.rollEase ?? 0) * 100} digits={0} disabled={disabled} onCommit={(v) => edit({ rollEase: v / 100 })} />
        <NumField label="Spiral starts" unit="% of the line" value={(s.spiralStart ?? 0) * 100} digits={0} disabled={disabled} onCommit={(v) => edit({ spiralStart: v / 100 })} />
        <NumField label="Spiral ends" unit="% of the line" value={s.spiralEnd * 100} digits={0} disabled={disabled} onCommit={(v) => edit({ spiralEnd: v / 100 })} />
        <NumField label="Pace" unit="m/s" value={(s.pace * d) / 100} digits={2} disabled={disabled} onCommit={(v) => edit({ pace: (v * 100) / d, v0: Math.min(s.v0, (v * 100) / d) })} />
        <NumField label="Start ease" unit="s" value={s.rampS} digits={1} disabled={disabled} onCommit={(v) => edit({ rampS: v })} />
        <NumField label="Landing" unit="s" value={s.landS} digits={1} disabled={disabled} onCommit={(v) => edit({ landS: v })} />
      </dl>
      {note && (
        <p className="mt-1 text-amber-300" data-clash>
          {note}
        </p>
      )}
      {said && <p className="mt-1 text-red-300">{said}</p>}
    </div>
  );
}

function HelixFields({ clip, shape: s, frame, note, disabled, onEdit, onStart }: FieldsProps<HelixShape>) {
  const [said, setSaid] = useState<string | null>(null);
  if (!frame) return <p className="mt-2 text-neutral-500">Corkscrew: its numbers show once the bench has measured the arch…</p>;
  const { d, up, zc } = frame.units;
  const sweep = s.theta1 - s.theta0;
  const dir = sweep > 0 ? 1 : -1;
  const m = (units: number) => (units * d) / 100;
  const u = (metres: number) => (metres * 100) / d;
  const edit = (patch: Partial<HelixShape>) => setSaid(onEdit(clip.id, { ...s, ...patch }));
  const short = shapeLength(s) <= s.rampS + 1e-9;
  return (
    <div className="col-span-2 mt-2 border-t border-white/10 pt-2" data-shape-fields>
      <div className="mb-1 flex items-center justify-between text-sm font-semibold text-white">
        Corkscrew
        <button type="button" className={small} disabled={disabled} onMouseDown={noFocus} onClick={() => onStart(clip.id)} title="Take this clip's start from where the camera is now; the end stays">
          Start here
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="self-center text-neutral-500">Direction</dt>
        <dd className="flex gap-1">
          {([1, -1] as const).map((k) => (
            <button
              key={k}
              type="button"
              disabled={disabled}
              aria-pressed={dir === k}
              onMouseDown={noFocus}
              onClick={() => dir !== k && edit({ theta1: s.theta0 - sweep })}
              className={`${small} ${dir === k ? "bg-neutral-200 text-neutral-950 hover:bg-neutral-200" : ""}`}
            >
              {k === 1 ? "Left first" : "Right first"}
            </button>
          ))}
        </dd>
        <NumField label="Laps" unit="" value={Math.abs(sweep) / TAU} digits={2} disabled={disabled} onCommit={(v) => edit({ theta1: s.theta0 + dir * v * TAU })} />
        <NumField label="Axis right" unit="m" value={m(s.axisX)} digits={2} disabled={disabled} onCommit={(v) => edit({ axisX: u(v) })} />
        <NumField label="Axis out" unit="m" value={(zc + s.axisZ * d - frame.z1) / 100} digits={2} disabled={disabled} onCommit={(v) => edit({ axisZ: (v * 100 + frame.z1 - zc) / d })} />
        <NumField label="Start radius" unit="m" value={m(s.r0)} digits={2} disabled={disabled} onCommit={(v) => edit({ r0: u(v) })} />
        <NumField label="End radius" unit="m" value={m(s.r1)} digits={2} disabled={disabled} onCommit={(v) => edit({ r1: u(v) })} />
        <NumField label="Start height" unit="m" value={(up + s.y0 * d - frame.floor) / 100} digits={2} disabled={disabled} onCommit={(v) => edit({ y0: (v * 100 + frame.floor - up) / d })} />
        <NumField label="End height" unit="m" value={(up + s.y1 * d - frame.floor) / 100} digits={2} disabled={disabled} onCommit={(v) => edit({ y1: (v * 100 + frame.floor - up) / d })} />
        <NumField label="Pace" unit="m/s" value={m(s.pace)} digits={2} disabled={disabled} onCommit={(v) => edit({ pace: u(v), v0: Math.min(s.v0, u(v)) })} />
        <NumField label="Start ease" unit="s" value={s.rampS} digits={1} disabled={disabled} onCommit={(v) => edit({ rampS: v })} />
        <NumField label="Aim settle" unit="s" value={s.aimS} digits={1} disabled={disabled} onCommit={(v) => edit({ aimS: v })} />
        <dt className="text-neutral-500">Start speed</dt>
        <dd className="tabular-nums">{m(s.v0).toFixed(2)} m/s (from the clip before)</dd>
        <dt className="text-neutral-500">Lens</dt>
        <dd className="tabular-nums">{s.fov.toFixed(1)}° (the start&apos;s, held)</dd>
      </dl>
      {short && <p className="mt-1 text-amber-300">Shorter than its ease: it reaches its end before {s.rampS.toFixed(1)} s and holds there.</p>}
      {note && (
        <p className="mt-1 text-amber-300" data-clash>
          {note}
        </p>
      )}
      {said && <p className="mt-1 text-red-300">{said}</p>}
    </div>
  );
}

/** a point in Carl's metres (right, up from the floor, out from the arch's face), three fields; each commits on its own */
function PointRow({ label, v, disabled, onCommit }: { label: string; v: [number, number, number]; disabled: boolean; onCommit: (v: [number, number, number]) => void }) {
  const cell = (i: 0 | 1 | 2, name: string) => {
    const shown = v[i].toFixed(2);
    return (
      <input
        key={`${i}${shown}`}
        defaultValue={shown}
        disabled={disabled}
        inputMode="decimal"
        aria-label={`${label}, ${name} (m)`}
        data-point-field={`${label}:${name}`}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        onBlur={(e) => {
          const n = Number(e.currentTarget.value);
          if (e.currentTarget.value.trim() !== shown && Number.isFinite(n)) onCommit(v.map((x, k) => (k === i ? n : x)) as [number, number, number]);
        }}
        className="w-14 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-right tabular-nums text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-sky-400"
      />
    );
  };
  return (
    <>
      <dt className="self-center text-neutral-500">{label}</dt>
      <dd className="flex gap-1">
        {cell(0, "right")}
        {cell(1, "up")}
        {cell(2, "out")}
      </dd>
    </>
  );
}

/**
 * ⛔ A GLIDE's NUMBERS (`structural-note-glide-and-open-27-october.md`) — its pace (m/s), the start's ease, the landing and
 * the aim's settle (s); every waypoint and look-at point in Carl's metres (right, up from the floor, out from the arch's
 * face), each editable. Waypoint 1 is where the camera was when the move was opened ("Start here" moves it). The lens is
 * held (the start's). The clash warning never blocks.
 */
function GlideFields({ clip, shape: s, frame, note, disabled, onEdit, onStart }: FieldsProps<GlideShape>) {
  const [said, setSaid] = useState<string | null>(null);
  if (!frame) return <p className="mt-2 text-neutral-500">Glide: its numbers show once the bench has measured the arch…</p>;
  const { d, up, zc } = frame.units;
  const m = (units: number) => (units * d) / 100;
  const u = (metres: number) => (metres * 100) / d;
  const toM = (p: [number, number, number]): [number, number, number] => [m(p[0]), (up + p[1] * d - frame.floor) / 100, (zc + p[2] * d - frame.z1) / 100];
  const fromM = (q: [number, number, number]): [number, number, number] => [u(q[0]), (q[1] * 100 + frame.floor - up) / d, (q[2] * 100 + frame.z1 - zc) / d];
  const edit = (patch: Partial<GlideShape>) => setSaid(onEdit(clip.id, { ...s, ...patch }));
  const setAt = (list: [number, number, number][], i: number, q: [number, number, number]) => list.map((p, k) => (k === i ? fromM(q) : p));
  return (
    <div className="col-span-2 mt-2 border-t border-white/10 pt-2" data-shape-fields>
      <div className="mb-1 flex items-center justify-between text-sm font-semibold text-white">
        Glide
        <button type="button" className={small} disabled={disabled} onMouseDown={noFocus} onClick={() => onStart(clip.id)} title="Move the first waypoint to where the camera is now">
          Start here
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <NumField label="Pace" unit="m/s" value={m(s.pace)} digits={2} disabled={disabled} onCommit={(v) => edit({ pace: u(v), v0: Math.min(s.v0, u(v)) })} />
        <NumField label="Start ease" unit="s" value={s.rampS} digits={1} disabled={disabled} onCommit={(v) => edit({ rampS: v })} />
        <NumField label="Landing" unit="s" value={s.landS} digits={1} disabled={disabled} onCommit={(v) => edit({ landS: v })} />
        <NumField label="Aim settle" unit="s" value={s.aimS} digits={1} disabled={disabled} onCommit={(v) => edit({ aimS: v })} />
        <dt className="text-neutral-500">Start speed</dt>
        <dd className="tabular-nums">{m(s.v0).toFixed(2)} m/s</dd>
        <dt className="text-neutral-500">Lens</dt>
        <dd className="tabular-nums">{s.fov.toFixed(1)}° (the start&apos;s, held)</dd>
      </dl>
      <details className="mt-2" open>
        <summary className="cursor-pointer text-neutral-400">Waypoints (m: right, up, out)</summary>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          {s.points.map((p, i) => (
            <PointRow key={i} label={`${i + 1}`} v={toM(p)} disabled={disabled || i === 0} onCommit={(q) => edit({ points: setAt(s.points, i, q) })} />
          ))}
        </dl>
      </details>
      <details className="mt-2">
        <summary className="cursor-pointer text-neutral-400">Looks at, at each waypoint (m)</summary>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          {s.looks.map((p, i) => (
            <PointRow key={i} label={`${i + 1}`} v={toM(p)} disabled={disabled} onCommit={(q) => edit({ looks: setAt(s.looks, i, q) })} />
          ))}
        </dl>
      </details>
      {note && (
        <p className="mt-1 text-amber-300" data-clash>
          {note}
        </p>
      )}
      {said && <p className="mt-1 text-red-300">{said}</p>}
    </div>
  );
}
