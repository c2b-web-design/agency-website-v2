"use client";

import { useEffect, useState } from "react";

const HEADING_LINE1 = "Let's understand what your";
const HEADING_LINE2 = "business needs to become.";
const SUBTEXT = "A few focused questions to help us see the right next step.";

const BUTTON_READY_MS = 11500;

const Q1_QUESTION = "What brought you here today?";
const Q1_OPTIONS = [
  "I need a premium website",
  "My current site feels dated",
  "I want better enquiries",
  "I want to reduce admin",
  "I'm not sure yet",
];

const Q4_QUESTION = "What would you most like your website to improve?";
const Q4_OPTIONS = [
  "How people see the business",
  "The quality of enquiries",
  "Speed of response",
  "Trust before a conversation",
  "Clarity around what we offer",
  "I'm still working that out",
];

// Compact labels used in the Q5 memory summary
const Q5_MEMORY_LABELS: Record<string, string> = {
  "I need a premium website":    "premium website",
  "My current site feels dated": "dated website",
  "I want better enquiries":     "better enquiries",
  "I want to reduce admin":      "less admin",
  "I'm not sure yet":            "still working it out",
};

// Q5 → Q4 overlap: stage switches at this point so Q4 enters while Q5 is mid-fade
const Q5_SETTLE_OVERLAP_MS = 500;

type Stage = "opening" | "question1" | "question2";

export default function EnquiryOpening() {
  const [reducedMotion] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [buttonReady, setButtonReady] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [stage, setStage] = useState<Stage>("opening");
  const [beginLeaving, setBeginLeaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q5Settling, setQ5Settling] = useState(false);
  const [q5Selections, setQ5Selections] = useState<string[]>([]);
  const [q4Selected, setQ4Selected] = useState<string | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const tBtn = setTimeout(() => setButtonReady(true), BUTTON_READY_MS);
    return () => clearTimeout(tBtn);
  }, [reducedMotion]);

  function handleBegin() {
    if (reducedMotion) {
      setStage("question1");
      return;
    }
    setBeginLeaving(true);
    setTimeout(() => setStage("question1"), 500);
  }

  function toggleOption(option: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  }

  function handleQ5Next() {
    setQ5Selections(Array.from(selected));
    if (reducedMotion) {
      setStage("question2");
      return;
    }
    setQ5Settling(true);
    setTimeout(() => setStage("question2"), Q5_SETTLE_OVERLAP_MS);
  }

  function selectQ4Option(option: string) {
    setQ4Selected(prev => (prev === option ? null : option));
  }

  const q5MemorySummary = q5Selections
    .map(s => Q5_MEMORY_LABELS[s] ?? s)
    .join(", ");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-6 py-20"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      <div className={`text-center max-w-xl w-full ${stage === "question1" || stage === "question2" ? "enquiry-content-settling" : "enquiry-content-centered"}`}>

        {/* Opening context — remains visible, dims after Begin */}
        <div className={stage === "question1" || stage === "question2" ? "enquiry-context-dimmed" : ""}>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.15]">
            <div className="enquiry-heading-line1-mask">
              {HEADING_LINE1}
            </div>
            <div className="enquiry-heading-line2-mask">
              {HEADING_LINE2}
            </div>
          </h1>
          <div className="mt-6 enquiry-subtext-mask">
            <p className="text-base text-neutral-400 leading-relaxed">
              {SUBTEXT}
            </p>
          </div>
        </div>

        {/* Begin button — fades out then unmounts when clicked */}
        {stage === "opening" && (
          <div className={`mt-10${!buttonReady ? " pointer-events-none" : ""}`}>
            <div className="enquiry-button-mask">
              <button
                type="button"
                tabIndex={buttonReady ? 0 : -1}
                onClick={handleBegin}
                style={
                  beginLeaving
                    ? { opacity: 0, transition: "opacity 400ms linear", pointerEvents: "none" }
                    : undefined
                }
                className="bg-white text-black text-sm font-semibold px-7 py-3 rounded-full tracking-wide hover:bg-neutral-100 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Begin
              </button>
            </div>
          </div>
        )}

        {/* Stage 2 — Q5 guided question */}
        {stage === "question1" && (
          <div
            className={`mt-8${q5Settling ? " enquiry-q5-settling-wrapper" : ""}`}
            role="group"
            aria-labelledby="q1-label"
          >
            <div className="enquiry-q5-cue mb-5" aria-hidden="true">Q5</div>
            <p
              id="q1-label"
              className="enquiry-q1-question text-lg sm:text-xl font-medium text-white tracking-tight mb-6"
            >
              {Q1_QUESTION}
            </p>
            <div className="flex flex-col gap-3">
              {Q1_OPTIONS.map((option, i) => {
                const isSelected = selected.has(option);
                return (
                  <button
                    key={option}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleOption(option)}
                    style={
                      reducedMotion
                        ? undefined
                        : { animationDelay: `${800 + i * 150}ms` }
                    }
                    className={`enquiry-card enquiry-card-reveal w-full text-left px-5 py-4 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40${isSelected ? " enquiry-card-selected" : ""}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {selected.size > 0 && (
              <div className={`mt-7${!reducedMotion ? " enquiry-nextstep-reveal" : ""}`}>
                <button
                  type="button"
                  onClick={handleQ5Next}
                  className="enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                >
                  Next step
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stage 3 — Q4 (Q5 settled into memory) */}
        {stage === "question2" && (
          <div className="mt-8">
            {/* Q5 memory surface */}
            <div className={`mb-8${reducedMotion ? "" : " enquiry-q5-memory-reveal"}`}>
              <div className="enquiry-q5-memory-cue mb-2" aria-hidden="true">Q5</div>
              <p className="enquiry-q5-memory-text">
                You mentioned: {q5MemorySummary}
              </p>
            </div>

            {/* Q4 active stage */}
            <div role="radiogroup" aria-labelledby="q4-label">
              <div className={`enquiry-q4-cue mb-5${reducedMotion ? "" : ""}`} aria-hidden="true">Q4</div>
              <p
                id="q4-label"
                className="enquiry-q4-question text-lg sm:text-xl font-medium text-white tracking-tight mb-6"
              >
                {Q4_QUESTION}
              </p>
              <div className="flex flex-col gap-3">
                {Q4_OPTIONS.map((option, i) => {
                  const isSelected = q4Selected === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => selectQ4Option(option)}
                      style={
                        reducedMotion
                          ? undefined
                          : { animationDelay: `${800 + i * 150}ms` }
                      }
                      className={`enquiry-card enquiry-card-reveal w-full text-left px-5 py-4 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40${isSelected ? " enquiry-card-selected" : ""}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {q4Selected && (
                <div className={`mt-7${!reducedMotion ? " enquiry-nextstep-reveal" : ""}`}>
                  <button
                    type="button"
                    onClick={() => console.log("Q4 complete", q4Selected)}
                    className="enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                  >
                    Next step
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
