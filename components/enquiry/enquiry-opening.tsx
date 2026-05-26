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

type Stage = "opening" | "question1";

export default function EnquiryOpening() {
  const [buttonReady, setButtonReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stage, setStage] = useState<Stage>("opening");
  const [beginLeaving, setBeginLeaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReducedMotion(true);
      setButtonReady(true);
      return;
    }
    const tBtn = setTimeout(() => setButtonReady(true), BUTTON_READY_MS);
    return () => clearTimeout(tBtn);
  }, []);

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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-6 py-20"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      <div className={`text-center max-w-xl w-full ${stage === "question1" ? "enquiry-content-settling" : "enquiry-content-centered"}`}>

        {/* Opening context — remains visible, dims after Begin */}
        <div className={stage === "question1" ? "enquiry-context-dimmed" : ""}>
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

        {/* Stage 2 — Question 1 */}
        {stage === "question1" && (
          <div className="mt-8" role="group" aria-labelledby="q1-label">
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
                  onClick={() => console.log("Q5 complete", Array.from(selected))}
                  className="enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                >
                  Next step
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
