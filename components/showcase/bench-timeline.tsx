"use client";

/**
 * ⛔ THE RECORDER's TIMELINE AND INSPECTOR — under the picture (R1). Carl: *"In DAW terms the chunks would function like
 * clips"*: blocks on a lane, as wide as they are long, coloured by camera, numbered 1, 2, 3 in playback order (renumbered
 * after a delete or a punch-in — *"the numbering system should be sequential"*). R2's Refined lane is a SECOND `Lane`.
 *
 * - Click a clip to SELECT it; shift-click (or ctrl / cmd) for several. Drag on the ruler or a lane's bare background to
 *   SCRUB. ⛔ Custom pointer handling, never a native range ([C3]): `mousedown`'s default is prevented on every control
 *   ([B3]), which would break a native range's drag.
 * - ⛔ EACH JOIN SHOWN AS IT IS: a CUT where the camera changes; otherwise the MISMATCH (how far the next clip starts from
 *   where the last stopped, and how far it turns) — the Builder compensates it at hand-off. Nothing is smoothed here.
 * - While recording, the timeline is DISABLED ([A5]); the recording shows as a red block where it will land.
 */
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { clipLength, clipStarts, joinKind, samplePose, type Chain, type Pose } from "./bench-chain";

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
  T,
  rec,
  selection,
  disabled,
  metresPerD,
  toMetres,
  onSelect,
  onScrub,
}: {
  chain: Chain;
  T: number;
  rec: { at: number; length: number; cam: number } | null;
  selection: string[];
  disabled: boolean;
  metresPerD: number;
  toMetres: ((p: Pose) => Metres) | null;
  onSelect: (id: string, additive: boolean) => void;
  onScrub: (T: number) => void;
}) {
  const starts = clipStarts(chain);
  const duration = chain.clips.reduce((s, c) => s + clipLength(c), 0);
  const span = Math.max(duration, rec ? rec.at + rec.length : 0, 4) * 1.04;
  const pct = (t: number) => `${(t / span) * 100}%`;
  const step = tickStep(span);
  const ticks = Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => i * step);
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const scrubAt = (e: ReactPointerEvent) => {
    const r = track.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    onScrub(Math.max(0, Math.min(duration, ((e.clientX - r.left) / r.width) * span)));
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || !chain.clips.length || (e.target as HTMLElement).closest("[data-clip]")) return;
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubAt(e);
  };

  const selected = chain.clips.map((c, i) => ({ c, i })).filter(({ c }) => selection.includes(c.id));

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start" data-timeline>
      <div className={`min-w-0 flex-1 rounded-md border border-white/10 bg-neutral-900/60 ${disabled ? "opacity-70" : ""}`}>
        <div className="flex">
          {/* the lane names, row for row with the track: ruler, joins, the lane */}
          <div className="w-24 shrink-0 border-r border-white/10 text-xs text-neutral-400" aria-hidden="true">
            <div className="h-6 border-b border-white/10" />
            <div className="h-4" />
            <div className="flex h-14 items-center px-3">Recorded</div>
          </div>
          {/* the ruler and the lanes share one track, so the playhead runs through both */}
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
              {chain.clips.slice(1).map((c, i) => {
                const j = joinKind(chain.clips[i], c, metresPerD);
                const seam = j.kind === "mismatch" && (j.metres > 0.01 || j.degrees > 0.5);
                if (j.kind === "mismatch" && !seam) return null;
                return (
                  <span
                    key={c.id}
                    className={`absolute -translate-x-1/2 whitespace-nowrap rounded px-1 leading-4 ${j.kind === "cut" ? "bg-neutral-200 text-neutral-950" : "bg-amber-500/20 text-amber-300"}`}
                    style={{ left: pct(starts[i + 1]) }}
                    data-join={j.kind}
                  >
                    {j.kind === "cut" ? "CUT" : `${j.metres.toFixed(2)} m · ${j.degrees.toFixed(0)}°`}
                  </span>
                );
              })}
            </div>
            <div className="relative h-14" data-lane="recorded">
              {chain.clips.map((c, i) => {
                const on = selection.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    data-clip={i + 1}
                    disabled={disabled}
                    aria-pressed={on}
                    aria-label={`Clip ${i + 1}, Cam ${c.cam}, ${sec(clipLength(c))}`}
                    title={`Clip ${i + 1} · Cam ${c.cam} · ${sec(clipLength(c))} (click to select, shift-click for several)`}
                    onMouseDown={noFocus}
                    onClick={(e) => onSelect(c.id, e.shiftKey || e.ctrlKey || e.metaKey)}
                    className={`absolute inset-y-1 overflow-hidden rounded-sm border px-1.5 text-left text-[11px] leading-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                      on ? "border-white ring-1 ring-white" : "border-black/40"
                    }`}
                    style={{ left: pct(starts[i]), width: `calc(${pct(clipLength(c))} - 2px)`, background: camColour(c.cam) }}
                  >
                    <span className="block truncate font-semibold">{i + 1}</span>
                    <span className="block truncate opacity-80">
                      Cam {c.cam} · {sec(clipLength(c))}
                    </span>
                  </button>
                );
              })}
              {rec && (
                <div
                  className="absolute inset-y-1 rounded-sm border border-red-400 bg-red-600/40 px-1.5 text-[11px] text-white"
                  style={{ left: pct(rec.at), width: pct(Math.max(rec.length, span * 0.004)) }}
                  data-rec-block
                >
                  ● Cam {rec.cam}
                </div>
              )}
              {!chain.clips.length && !rec && (
                <p className="absolute inset-0 flex items-center px-3 text-xs text-neutral-500">No clips yet. A records from where the camera is.</p>
              )}
            </div>
            {/* the playhead */}
            {chain.clips.length > 0 && (
              <div className="pointer-events-none absolute inset-y-0 w-px bg-sky-300" style={{ left: pct(Math.min(T, span)) }} data-playhead>
                <span className="absolute -left-1 top-0 h-0 w-0 border-x-4 border-t-[6px] border-x-transparent border-t-sky-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="w-full shrink-0 rounded-md border border-white/10 bg-neutral-900/60 p-3 text-xs text-neutral-300 lg:w-64" data-inspector>
        {selected.length === 1 ? (
          (() => {
            const { c, i } = selected[0];
            const a = toMetres?.(samplePose(c.samples[0]));
            const b = toMetres?.(samplePose(c.samples[c.samples.length - 1]));
            const m = (p?: Metres) => (p ? `${p.right.toFixed(2)}, ${p.up.toFixed(2)}, ${p.out.toFixed(2)}` : "…");
            return (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="col-span-2 mb-1 text-sm font-semibold text-white">
                  Clip {i + 1} <span className="font-normal text-neutral-400">· Cam {c.cam}</span>
                </dt>
                <dt className="text-neutral-500">Length</dt>
                <dd className="tabular-nums">{sec(clipLength(c))}</dd>
                <dt className="text-neutral-500">Starts</dt>
                <dd className="tabular-nums">{sec(starts[i])} on the chain</dd>
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
            {sec(selected.reduce((s, { c }) => s + clipLength(c), 0))} in all. Play plays them in order; Delete removes them.
          </p>
        ) : (
          <p className="text-neutral-500">Select a clip to see it here. Shift-click for several.</p>
        )}
      </aside>
    </div>
  );
}
