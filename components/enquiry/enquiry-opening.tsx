"use client";

import { useEffect, useRef, useState } from "react";

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
  "Trust before a conversation",
  "Clarity around what we offer",
  "I'm still working that out",
];

// Q5 → Q4: stage switches after settling is fully complete
const Q5_SETTLE_OVERLAP_MS = 1200;

type Stage = "opening" | "question1" | "question2";
type Q5Phase = "active" | "settling" | "memory";

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
  const [q5Phase, setQ5Phase] = useState<Q5Phase>("active");
  const [q5Selections, setQ5Selections] = useState<string[]>([]);
  const [q4Selected, setQ4Selected] = useState<string | null>(null);

  const q4SectionRef = useRef<HTMLDivElement>(null);

  // Q4 section: gentle fallback scroll when Q4 mounts — no-ops if already visible
  useEffect(() => {
    if (stage !== "question2") return;
    q4SectionRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [stage, reducedMotion]);

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
    const selections = Array.from(selected);
    setQ5Selections(selections);
    if (reducedMotion) {
      setQ5Phase("memory");
      setStage("question2");
      return;
    }
    setQ5Phase("settling");
    setTimeout(() => {
      setQ5Phase("memory");
      requestAnimationFrame(() => setStage("question2"));
    }, Q5_SETTLE_OVERLAP_MS);
  }

  function selectQ4Option(option: string) {
    setQ4Selected(prev => (prev === option ? null : option));
  }

  // Q5 block class driven by phase
  const q5BlockClass =
    q5Phase === "memory"
      ? reducedMotion ? "" : "enquiry-q5-memory-block-settled"
      : q5Phase === "settling"
      ? "enquiry-q5-settling-block"
      : "";

  // Q5 ARIA props driven by phase
  const q5AriaProps =
    q5Phase === "memory"
      ? { role: "note" as const, "aria-label": `Q5 — ${Q1_QUESTION}: ${q5Selections.join(", ")}` }
      : { role: "group" as const, "aria-labelledby": "q1-label" };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-6 py-20"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      <div className={`text-center max-w-xl w-full ${stage === "question1" || stage === "question2" ? "enquiry-content-settling" : "enquiry-content-centered"}`}>

        {/* Opening context — dims in Stage 2, recedes further (chain reaction) when Q5 becomes memory */}
        <div className={
          (q5Phase === "settling" || q5Phase === "memory") ? "enquiry-context-faintest" :
          stage === "question1" ? "enquiry-context-dimmed" :
          ""
        }>
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

        {/* Q5 block — persistent from question1 through question2; visual state driven by q5Phase */}
        {stage !== "opening" && (
          <div
            className={`mt-6 ${q5BlockClass}`}
            {...q5AriaProps}
          >
            {/* Q5 cue */}
            <div
              className={`mb-3 ${
                q5Phase === "memory"
                  ? "enquiry-memory-cue"
                  : q5Phase === "settling"
                  ? "enquiry-q5-cue enquiry-q5-settling-cue"
                  : "enquiry-q5-cue"
              }`}
              aria-hidden="true"
            >Q5</div>

            {/* Q5 question */}
            {q5Phase === "memory" ? (
              <p
                className="enquiry-memory-question mb-5"
                aria-hidden="true"
              >{Q1_QUESTION}</p>
            ) : (
              <p
                id="q1-label"
                className={`enquiry-q1-question text-lg sm:text-xl font-medium text-white tracking-tight mb-5${q5Phase === "settling" ? " enquiry-q5-settling-question" : ""}`}
              >{Q1_QUESTION}</p>
            )}

            {/* Q5 cards / memory chips */}
            {q5Phase === "memory" ? (
              <div className="enquiry-memory-chips" aria-hidden="true">
                {q5Selections.map(option => (
                  <div key={option} className="enquiry-memory-chip">{option}</div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Q1_OPTIONS.map((option, i) => {
                  const isSelected = selected.has(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={q5Phase === "settling" ? undefined : () => toggleOption(option)}
                      tabIndex={q5Phase === "settling" ? -1 : 0}
                      style={
                        reducedMotion
                          ? undefined
                          : { animationDelay: `${800 + i * 150}ms` }
                      }
                      className={`enquiry-card enquiry-card-reveal w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40${
                        q5Phase === "settling"
                          ? isSelected
                            ? " enquiry-q5-settling-card-selected"
                            : " enquiry-q5-settling-card-unselected"
                          : isSelected
                            ? " enquiry-card-selected"
                            : ""
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Q5 Next step — space always reserved; fades in after first selection */}
            {q5Phase === "active" && (
              <div
                className="mt-5"
                style={{
                  opacity: selected.size > 0 ? 1 : 0,
                  pointerEvents: selected.size > 0 ? undefined : "none",
                  ...(reducedMotion ? {} : { transition: "opacity 600ms linear" }),
                }}
              >
                <button
                  type="button"
                  tabIndex={selected.size > 0 ? 0 : -1}
                  onClick={handleQ5Next}
                  className="enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                >
                  Next step
                </button>
              </div>
            )}
          </div>
        )}

        {/* Q4 — mounts at question2; Q5 memory rail remains above */}
        {stage === "question2" && (
          <div ref={q4SectionRef} className="mt-8">
            <div role="radiogroup" aria-labelledby="q4-label">
              <div className={`enquiry-q4-cue mb-5`} aria-hidden="true">Q4</div>
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
            </div>
            <div
              className="mt-7"
              style={{
                opacity: q4Selected ? 1 : 0,
                pointerEvents: q4Selected ? undefined : "none",
                ...(reducedMotion ? {} : { transition: "opacity 600ms linear" }),
              }}
            >
              <button
                type="button"
                tabIndex={q4Selected ? 0 : -1}
                onClick={() => console.log("Q4 complete", q4Selected)}
                className="enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                Next step
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
