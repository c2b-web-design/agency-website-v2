"use client";

/**
 * ⛔ THE RECORDER's TRANSPORT — the bar over the picture, bottom left (R1; Carl: *"the major buttons, put them on the grid,
 * say bottom left"*). It holds NO state: it shows what the store reports (`BenchView`) and calls the store's methods.
 *
 * - ⛔ A SIBLING OF THE PICTURE's DRAG SURFACE ([A3]): it sits in the overlay layer, which is `pointer-events: none`; only
 *   the bar takes clicks — so pressing a button can never start a camera drag (the 14 August unclickable-cards case).
 * - ⛔ NO FOCUS ON A MOUSE CLICK ([A4], [B3]): `mousedown`'s default is prevented, so after a click Space still RECORDS and
 *   never presses the clicked button again. Tab still reaches every control; its focus ring shows.
 * - Icons are inline SVG ([A8]); every button names itself and its bindings (`aria-label`, the tooltip).
 * - DISABLED where it cannot act ([A5]): while recording only Record (stop) and Default act.
 */
import type { ReactNode } from "react";

export type Tone = "idle" | "rec" | "warn" | "play";
export type TransportView = {
  mode: "fly" | "rec" | "play";
  T: number;
  duration: number;
  recLength: number;
  armed: { overwrite: boolean; newCam: boolean };
  status: string;
  tone: Tone;
  chainEmpty: boolean;
  hasSelection: boolean;
};
export type TransportActions = {
  record: () => void;
  play: () => void;
  toStart: () => void;
  toEnd: () => void;
  home: () => void;
  newCam: () => void;
  overwrite: () => void;
  remove: () => void;
};

const noFocus = (e: { preventDefault: () => void }) => e.preventDefault();
export const clock = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
};

const I = {
  record: <circle cx="8" cy="8" r="5" fill="currentColor" />,
  play: <path d="M5 3.5v9l7.5-4.5z" fill="currentColor" />,
  stop: <rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" />,
  start: <path d="M4 3.5v9M12.5 3.5v9L6 8z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" strokeLinejoin="round" />,
  end: <path d="M12 3.5v9M3.5 3.5v9L10 8z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" strokeLinejoin="round" />,
  home: <path d="M2.5 8 8 3l5.5 5M4.5 6.5V13h7V6.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />,
  newCam: (
    <g stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round">
      <rect x="1.5" y="5" width="9" height="7" rx="1" />
      <path d="m10.5 7.5 3-1.5v5l-3-1.5" />
      <path d="M6 1.5v3M4.5 3h3" strokeLinecap="round" />
    </g>
  ),
  overwrite: <path d="M3 13h3l7-7-3-3-7 7zM9 4l3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />,
  remove: <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />,
};

function Btn({
  label,
  keys,
  onClick,
  disabled,
  active,
  activeClass = "bg-neutral-200 text-neutral-950",
  children,
}: {
  label: string;
  keys: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  activeClass?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active ?? undefined}
      title={`${label} (${keys})`}
      disabled={disabled}
      onMouseDown={noFocus}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? activeClass : "text-neutral-200 hover:bg-white/10"
      }`}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

const TONE: Record<Tone, string> = { idle: "text-neutral-300", rec: "text-red-400", warn: "text-amber-300", play: "text-sky-300" };

export function BenchTransport({ v, act, saveError }: { v: TransportView; act: TransportActions; saveError: string | null }) {
  const rec = v.mode === "rec";
  return (
    <div className="pointer-events-auto max-w-[min(100%,46rem)] rounded-md border border-white/10 bg-black/70 px-2 py-1.5 shadow-lg backdrop-blur-sm" data-transport>
      <div className="flex flex-wrap items-center gap-1">
        <Btn label={rec ? "Stop recording" : "Record"} keys="A / Space" onClick={act.record} active={rec} activeClass="bg-red-600 text-white">
          {I.record}
        </Btn>
        <Btn label={v.mode === "play" ? "Stop" : "Play"} keys="X / P" onClick={act.play} disabled={rec || v.chainEmpty} active={v.mode === "play"} activeClass="bg-sky-700 text-white">
          {v.mode === "play" ? I.stop : I.play}
        </Btn>
        <Btn label="To the start" keys="Y / Home" onClick={act.toStart} disabled={rec}>
          {I.start}
        </Btn>
        <Btn label="To the end" keys="D-pad right past the last clip / End" onClick={act.toEnd} disabled={rec || v.chainEmpty}>
          {I.end}
        </Btn>
        <Btn label="Default view" keys="View / H" onClick={act.home}>
          {I.home}
        </Btn>
        <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
        <Btn label="New camera for the next clip" keys="on screen" onClick={act.newCam} disabled={rec} active={v.armed.newCam} activeClass="bg-amber-500 text-neutral-950">
          {I.newCam}
        </Btn>
        <Btn label="Overwrite: arm a punch-in" keys="on screen, then A" onClick={act.overwrite} disabled={rec || v.chainEmpty} active={v.armed.overwrite} activeClass="bg-red-600 text-white">
          {I.overwrite}
        </Btn>
        <Btn label="Delete the selected clips" keys="Delete / Backspace" onClick={act.remove} disabled={rec || !v.hasSelection}>
          {I.remove}
        </Btn>
        <span className="ml-2 font-mono text-xs tabular-nums text-neutral-300" data-clock>
          {rec ? `● ${clock(v.recLength)}` : `${clock(v.T)} / ${clock(v.duration)}`}
        </span>
      </div>
      {saveError && (
        <p role="alert" className="px-1 pt-1 text-xs text-red-400" data-save-error>
          {saveError}
        </p>
      )}
      <p className={`px-1 pt-1 text-xs ${TONE[v.tone]}`} data-status aria-live="polite">
        {v.status}
      </p>
    </div>
  );
}
