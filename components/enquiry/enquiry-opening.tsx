"use client";

import { useState, useEffect } from "react";

const HEADING_LINE1 = "Let's understand what your";
const HEADING_LINE2 = "business needs to become.";
const SUBTEXT = "A few focused questions to help us see the right next step.";

const ACTIVE_OPTIONS = [
  "I need a premium website",
  "My current site feels dated",
  "I want better enquiries",
  "I want to reduce admin",
  "I'm not sure yet",
];

// Geometry test: Q5-Q2 completed memory stack (Q1 is the active foreground area)
const GEO_MEMORY = [
  { label: "Q5", question: "Placeholder question text", answers: "Answer 1   Answer 2   Answer 3" },
  { label: "Q4", question: "Placeholder question text", answers: "Answer 1   Answer 2" },
  { label: "Q3", question: "Placeholder question text", answers: "Answer 1   Answer 2   Answer 3" },
  { label: "Q2", question: "Placeholder question text", answers: "Answer 1   Answer 2" },
];

export default function EnquiryOpening() {
  const [stage, setStage] = useState<"opening" | "geometry">("opening");
  const [beginInteractive, setBeginInteractive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (stage !== "opening") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setBeginInteractive(true);
      return;
    }
    // enquiry-button-mask: 9000ms delay + 2500ms duration = fully revealed at 11500ms
    const t = window.setTimeout(() => setBeginInteractive(true), 11500);
    return () => clearTimeout(t);
  }, [stage]);

  function toggleOption(option: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      {stage === "opening" ? (

        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl w-full">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.15]">
            <div className="enquiry-heading-line1-mask">{HEADING_LINE1}</div>
            <div className="enquiry-heading-line2-mask">{HEADING_LINE2}</div>
          </h1>

          <div className="mt-6 enquiry-subtext-mask">
            <p className="text-base text-neutral-400 leading-relaxed">{SUBTEXT}</p>
          </div>

          <div
            className={`mt-10${reducedMotion ? "" : " enquiry-button-mask"}`}
            style={{ pointerEvents: beginInteractive ? undefined : "none" }}
          >
            <button
              type="button"
              tabIndex={beginInteractive ? 0 : -1}
              onClick={() => setStage("geometry")}
              className="border border-white/20 rounded-full px-6 py-2.5 text-sm font-medium text-white/75 bg-transparent cursor-pointer hover:border-white/40 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              Begin
            </button>
          </div>
        </div>

      ) : (

        <div className="text-center max-w-xl w-full py-20">

          {/* Static memory stack: heading + completed question summaries */}
          <div className="geotest-memory-stack">
            <h1 className="geotest-heading text-white">
              <div>{HEADING_LINE1}</div>
              <div>{HEADING_LINE2}</div>
            </h1>

            <div className="geotest-memory-items">
              {GEO_MEMORY.map((item) => (
                <div key={item.label} className={`geotest-memory-item geotest-${item.label.toLowerCase()}`}>
                  <div className="geotest-memory-qrow">
                    <span className="geotest-memory-cue">{item.label}</span>
                    <span className="geotest-memory-question">{item.question}</span>
                  </div>
                  <div className="geotest-memory-answers">{item.answers}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active question area - Q1 foreground (geometry proof) */}
          <div className="geotest-active-area">
            <div className="enquiry-q5-heading">
              <span className="enquiry-q5-cue" aria-hidden="true">Q1</span>
              <span className="enquiry-q5-question" id="geo-active-label">What brought you here today?</span>
            </div>

            <div className="enquiry-answer-grid" role="group" aria-labelledby="geo-active-label">
              {ACTIVE_OPTIONS.map(option => {
                const isSelected = selected.has(option);
                return (
                  <button
                    key={option}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleOption(option)}
                    className={`enquiry-card text-center px-3 rounded-xl font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40${isSelected ? " enquiry-card-selected" : ""}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Space reserved; visible after first selection */}
            <div
              className="mt-5"
              style={{
                opacity: selected.size > 0 ? 1 : 0,
                pointerEvents: selected.size > 0 ? undefined : "none",
                transition: "opacity 600ms linear",
              }}
            >
              <button
                type="button"
                tabIndex={selected.size > 0 ? 0 : -1}
                onClick={() => console.log("next", Array.from(selected))}
                className="enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                Next step
              </button>
            </div>
          </div>

        </div>

      )}
    </div>
  );
}
