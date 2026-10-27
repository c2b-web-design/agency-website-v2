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
 */
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { chainEnd, clipLength, numberClips, samplePose, takesAt, type Chain, type Join, type Pose } from "./bench-chain";

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
                    {j.kind === "cut" ? "CUT" : `${j.metres.toFixed(2)} m · ${j.degrees.toFixed(0)}°`}
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
                          <span className="block truncate font-semibold">{n}</span>
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
            const a = toMetres?.(samplePose(c.samples[0]));
            const b = toMetres?.(samplePose(c.samples[c.samples.length - 1]));
            const m = (p?: Metres) => (p ? `${p.right.toFixed(2)}, ${p.up.toFixed(2)}, ${p.out.toFixed(2)}` : "…");
            return (
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
