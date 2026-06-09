"use client";

import { useState, useEffect } from "react";

const HEADING_LINE1 = "Let's understand what your";
const HEADING_LINE2 = "business needs to become.";
const SUBTEXT = "A few focused questions to help us see the right next step.";

const PLACEHOLDER_OPTIONS = ["Answer 1", "Answer 2", "Answer 3", "Answer 4", "Answer 5"];

type MemoryItem = {
  label: string;
  question: string;
  answers: string;
};

export default function EnquiryOpening() {
  const [stage, setStage] = useState<"opening" | "active">("opening");
  const [activeQ, setActiveQ] = useState(5);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [beginInteractive, setBeginInteractive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [q5Transition, setQ5Transition] = useState(false);

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
    // enquiry-button-mask: 9000ms delay + 2500ms duration = interactive at 11500ms
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

  function handleNextStep() {
    if (activeQ === 1) {
      console.log("Q1 next (not yet implemented)", Array.from(selected));
      return;
    }

    if (activeQ === 5 && !reducedMotion) {
      const answersSnap = Array.from(selected).join("   ");
      setSelected(new Set());
      setQ5Transition(true);
      setTimeout(() => {
        setMemory([{ label: "Q5", question: "Placeholder question", answers: answersSnap }]);
      }, 160);
      setTimeout(() => setActiveQ(4), 260);
      setTimeout(() => setQ5Transition(false), 1000);
      return;
    }

    setMemory(prev => [...prev, {
      label: `Q${activeQ}`,
      question: "Placeholder question",
      answers: Array.from(selected).join("   "),
    }]);
    setActiveQ(prev => prev - 1);
    setSelected(new Set());
  }

  // heading depth = memory.length + 1 (0 = full opening size, no depth class applied)
  const headingDepth = memory.length > 0 ? memory.length + 1 : 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      {/* Shared shell — the heading lives here in BOTH states, anchored identically. */}
      {/* Only the content beneath the heading swaps, so the heading never shifts on Begin. */}
      <div className={`${stage === "opening" ? "enquiry-shell-opening" : "enquiry-shell-active"} text-center max-w-xl w-full`}>
        {/* Heading — normal flow at the top of the shell (anchored). In active */}
        {/* states its size changes via depth classes, but it never moves the */}
        {/* absolutely-positioned active slot below it. */}
        {q5Transition && (
          <h1
            className="font-semibold tracking-tight text-white text-3xl sm:text-4xl leading-[1.15] enquiry-opening-ghost"
            aria-hidden="true"
          >
            <div>{HEADING_LINE1}</div>
            <div>{HEADING_LINE2}</div>
          </h1>
        )}
        {q5Transition && headingDepth > 0 && (
          <h1
            className={`font-semibold tracking-tight text-white enquiry-heading-d${headingDepth} enquiry-heading-entering enquiry-corridor-ghost`}
            aria-hidden="true"
          >
            <div>{HEADING_LINE1}</div>
            <div>{HEADING_LINE2}</div>
          </h1>
        )}
        <h1
          className={`font-semibold tracking-tight text-white${
            headingDepth > 0
              ? ` enquiry-heading-d${headingDepth}${q5Transition ? " enquiry-heading-hidden" : ""}`
              : q5Transition
              ? " enquiry-heading-hidden"
              : " text-3xl sm:text-4xl leading-[1.15]"
          }`}
        >
          <div className={stage === "opening" ? "enquiry-heading-line1-mask" : undefined}>
            {HEADING_LINE1}
          </div>
          <div className={stage === "opening" ? "enquiry-heading-line2-mask" : undefined}>
            {HEADING_LINE2}
          </div>
        </h1>

        {/* Memory layer — absolute overlay whose BOTTOM edge sits at the active */}
        {/* slot's top line and grows upward as items are added. Out of normal */}
        {/* flow, so it never moves the active slot and leaves no empty reserved */}
        {/* gap beneath the heading when there is no memory (Q5). */}
        {/* Stack: oldest first (top), newest last (bottom, nearest the active slot). */}
        {/* slot = memory.length - i: newest item (last) gets slot 1, oldest (first) gets slot N */}
        {stage !== "opening" && memory.length > 0 && (
          <div className={`enquiry-memory-layer${q5Transition ? " enquiry-memory-layer-entering" : ""}`}>
            {memory.map((item, i) => {
              const slot = memory.length - i;
              return (
                <div key={item.label} className={`enquiry-mem-item enquiry-slot-${slot}`}>
                  <div className="enquiry-mem-qrow">
                    <span className="enquiry-mem-cue">{item.label}</span>
                    <span className="enquiry-mem-question">{item.question}</span>
                  </div>
                  <div className="enquiry-mem-answers">{item.answers}</div>
                </div>
              );
            })}
          </div>
        )}

        {stage === "opening" ? (
          <>
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
                onClick={() => setStage("active")}
                className="border border-white/20 rounded-full px-6 py-2.5 text-sm font-medium text-white/75 bg-transparent cursor-pointer hover:border-white/40 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                Begin
              </button>
            </div>
          </>
        ) : (
          // Active slot — stable position; Q5 then Q4 content swaps in place here.
          <div className={`enquiry-active-slot${
              q5Transition && activeQ === 5 ? " enquiry-q5-exiting"
              : q5Transition && activeQ === 4 ? " enquiry-active-entering"
              : ""
            }`}>
              <div className="enquiry-q5-heading">
                <span className="enquiry-q5-cue" aria-hidden="true">Q{activeQ}</span>
                <span className="enquiry-q5-question" id="active-q-label">
                  Placeholder question
                </span>
              </div>

              <div className="enquiry-answer-grid" role="group" aria-labelledby="active-q-label">
                {PLACEHOLDER_OPTIONS.map(option => {
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
                  onClick={handleNextStep}
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
