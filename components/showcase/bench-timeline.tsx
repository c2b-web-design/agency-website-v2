"use client";

/**
 * ⛔ THE RECORDER's TIMELINE AND INSPECTOR — under the picture. R1: Carl's *"In DAW terms the chunks would function like
 * clips"*. ⛔ T1a, CAMERA TRACKS (`live-work/plan-camera-tracks-t1a-27-october.md` v2): ONE ROW PER CAMERA TRACK, the TOP
 * track first (Resolve's V2 over V1), each with its ARM button (red when armed: where A records). Clips at their START, as
 * wide as they show, coloured by camera; inside a row a newer take draws OVER an older one. Numbered 1, 2, 3 by start
 * across all tracks (R1's sequential rule; per-track numbers and take lanes are T1b).
 *
 * - Click a clip to SELECT it; shift-click (or ctrl / cmd) for several. Drag on the ruler or a row's bare background to
 *   SCRUB. ⛔ Custom pointer handling, never a native range ([C3]): `mousedown`'s default is prevented on every control
 *   ([B3]), which would break a native range's drag.
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
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  chainEnd, clipEnd, clipLength, clipPoseAt, numberClips, shapeLength, takesAt, type BarrelShape, type Chain, type Clip, type GlideShape, type HelixShape, type Join, type Pose, type Shape,
  type Units,
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
  onArm,
  onScrub,
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
  onArm: (cam: number) => void;
  onScrub: (T: number) => void;
  /** the chain's units and the arch's floor and face (cm) — for a shape's numbers in metres; null until measured */
  frame: { units: Units; floor: number; z1: number } | null;
  /** the clash warning for a shape clip, in words */
  shapeNote: (c: Clip) => string | null;
  /** an edit: null, or the refusal in words */
  onShapeEdit: (id: string, s: Shape) => string | null;
  onShapeStart: (id: string) => void;
}) {
  const end = chainEnd(chain);
  const span = Math.max(end, rec ? rec.at + rec.length : 0, 4) * 1.04;
  const pct = (t: number) => `${(t / span) * 100}%`;
  const step = tickStep(span);
  const ticks = Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => i * step);
  const numbers = numberClips(chain);
  const rows = [...chain.tracks].reverse();
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const scrubAt = (e: ReactPointerEvent) => {
    const r = track.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    onScrub(Math.max(0, Math.min(end, ((e.clientX - r.left) / r.width) * span)));
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || !chain.clips.length || (e.target as HTMLElement).closest("[data-clip]")) return;
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubAt(e);
  };

  const selected = chain.clips.filter((c) => selection.includes(c.id));
  const under = chain.clips.length ? takesAt(chain, Math.min(T, end)) : [];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start" data-timeline>
      <div className={`min-w-0 flex-1 rounded-md border border-white/10 bg-neutral-900/60 ${disabled ? "opacity-70" : ""}`}>
        <div className="flex">
          {/* the track headers, row for row with the timeline: ruler, joins, then one per camera, top first */}
          <div className="w-24 shrink-0 border-r border-white/10 text-xs text-neutral-400">
            <div className="h-6 border-b border-white/10" />
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
          <div
            ref={track}
            className="relative min-w-0 flex-1 cursor-ew-resize select-none"
            onPointerDown={down}
            onPointerMove={(e) => dragging.current && scrubAt(e)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
            data-scrub-track
          >
            <div className="relative h-6 border-b border-white/10 text-[10px] text-neutral-500">
              {ticks.map((t) => (
                <span key={t} className="absolute top-0 h-full border-l border-white/10 pl-1 leading-6 tabular-nums" style={{ left: pct(t) }}>
                  {t}s
                </span>
              ))}
            </div>
            {/* joins: a cut, or the mismatch the Builder will compensate */}
            <div className="relative h-4 text-[10px]" data-joins>
              {joins.map((j) => {
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
            </div>
            <div className="relative">
              {rows.map((cam) => (
                <div key={cam} className="relative h-12 border-t border-white/5" data-track={cam}>
                  {chain.clips
                    .filter((c) => c.cam === cam)
                    .sort((a, b) => a.order - b.order)
                    .map((c) => {
                      const on = selection.includes(c.id);
                      const n = numbers.get(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          data-clip={n}
                          data-clip-id={c.id}
                          disabled={disabled}
                          aria-pressed={on}
                          aria-label={`Clip ${n}, Cam ${c.cam}, ${sec(clipLength(c))}`}
                          title={`Clip ${n} · Cam ${c.cam} · take ${c.order + 1} · ${sec(clipLength(c))} (click to select, shift-click for several)`}
                          onMouseDown={noFocus}
                          onClick={(e) => onSelect(c.id, e.shiftKey || e.ctrlKey || e.metaKey)}
                          className={`absolute inset-y-1 overflow-hidden rounded-sm border px-1.5 text-left text-[11px] leading-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                            on ? "border-white ring-1 ring-white" : "border-black/40"
                          }`}
                          style={{ left: pct(c.start), width: `calc(${pct(clipLength(c))} - 2px)`, background: camColour(c.cam), zIndex: 1 + c.order }}
                        >
                          <span className="block truncate font-semibold">
                            {n}
                            {c.shape && <span className="ml-1 font-normal opacity-90">{c.shape.kind === "glide" ? "⤳ glide" : "↻ corkscrew"}</span>}
                          </span>
                          <span className="block truncate opacity-80">{sec(clipLength(c))}</span>
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
              {gaps.map(([a, b]) => (
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
            {/* the playhead */}
            {chain.clips.length > 0 && (
              <div className="pointer-events-none absolute inset-y-0 z-[100002] w-px bg-sky-300" style={{ left: pct(Math.min(T, span)) }} data-playhead>
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
                <dd className="tabular-nums">{sec(clipLength(c))}</dd>
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
