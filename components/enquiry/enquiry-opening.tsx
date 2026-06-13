"use client";

import { useState, useEffect } from "react";

const HEADING_LINE1 = "Let's understand what your";
const HEADING_LINE2 = "business needs to become.";
const SUBTEXT = "A few focused questions to help us see the right next step.";

const QUESTIONS: Record<number, { question: string; options: string[] }> = {
  5: {
    question: "What brought you here today?",
    options: ["Premium new website", "Current site feels dated", "Better quality enquiries", "Less manual admin", "Not sure yet"],
  },
  4: {
    question: "What needs to improve most?",
    options: ["Stronger first impression", "Clearer service value", "More trust upfront", "Easier next step", "Better visitor flow"],
  },
  3: {
    question: "What feels unclear right now?",
    options: ["Message feels vague", "Services need clarity", "Brand feels inconsistent", "Offers feel hard to compare", "Next step feels hidden"],
  },
  2: {
    question: "What should your visitors understand?",
    options: ["What you offer", "Who you help", "Why trust you", "What happens next", "Why choose you"],
  },
  1: {
    question: "What would success look like?",
    options: ["More serious enquiries", "Better-fit clients", "Clearer online presence", "More confident brand", "Less friction to contact"],
  },
};

type MemoryItem = {
  label: string;
  question: string;
  answers: string;
};

export default function EnquiryOpening() {
  const [stage, setStage] = useState<"opening" | "active" | "complete">("opening");
  const [activeQ, setActiveQ] = useState(5);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [beginInteractive, setBeginInteractive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [q5Transition, setQ5Transition] = useState(false);
  const [q5MemStarting, setQ5MemStarting] = useState(false);
  const [transitionQ, setTransitionQ] = useState<number | null>(null);
  const [q1Completing, setQ1Completing] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactBusiness, setContactBusiness] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");

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
      const answersSnap = Array.from(selected).join(" • ");
      setSelected(new Set());
      if (reducedMotion) {
        setMemory(prev => [...prev, {
          label: "Q1",
          question: QUESTIONS[1].question,
          answers: answersSnap,
        }]);
        setStage("complete");
        return;
      }
      setQ1Completing(true);
      setTransitionQ(1);
      setTimeout(() => {
        setMemory(prev => [...prev, {
          label: "Q1",
          question: QUESTIONS[1].question,
          answers: answersSnap,
        }]);
      }, 160);
      setTimeout(() => { setStage("complete"); setTransitionQ(null); }, 900);
      return;
    }

    if (activeQ === 5 && !reducedMotion) {
      const answersSnap = Array.from(selected).join(" • ");
      setSelected(new Set());
      setQ5Transition(true);
      setTimeout(() => {
        setMemory([{ label: "Q5", question: QUESTIONS[5].question, answers: answersSnap }]);
        setQ5MemStarting(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setQ5MemStarting(false);
          });
        });
      }, 160);
      setTimeout(() => setActiveQ(4), 260);
      setTimeout(() => setQ5Transition(false), 1000);
      return;
    }

    if (activeQ < 5 && !reducedMotion) {
      const answersSnap = Array.from(selected).join(" • ");
      const fromQ = activeQ;
      setSelected(new Set());
      setTransitionQ(fromQ);
      setTimeout(() => {
        setMemory(prev => [...prev, {
          label: `Q${fromQ}`,
          question: QUESTIONS[fromQ].question,
          answers: answersSnap,
        }]);
      }, 160);
      setTimeout(() => setActiveQ(prev => prev - 1), 260);
      setTimeout(() => setTransitionQ(null), 1000);
      return;
    }

    setMemory(prev => [...prev, {
      label: `Q${activeQ}`,
      question: QUESTIONS[activeQ].question,
      answers: Array.from(selected).join(" • "),
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
              ? ` enquiry-heading-d${headingDepth}${q5Transition ? " enquiry-heading-hidden" : ""}${transitionQ !== null ? " enquiry-heading-deepening" : ""}${stage === "complete" ? " enquiry-heading-complete" : ""}`
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
          <div className={`enquiry-memory-layer${stage === "complete" ? " enquiry-memory-complete" : ""}`}>
            {memory.map((item, i) => {
              const slot = memory.length - i;
              return (
                <div key={item.label} className={`enquiry-mem-item enquiry-slot-${slot}${transitionQ !== null && item.label === `Q${transitionQ}` ? " enquiry-mem-item-entering" : q5MemStarting && item.label === "Q5" ? " enquiry-mem-q5-start" : ""}`}>
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

        {stage === "complete" && (
          <div className="enquiry-contact-layer">
            <div className="grid grid-cols-2 gap-2 w-full text-left">
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 5600ms both" }}>
                <label htmlFor="cname" className="block text-xs text-neutral-400 mb-1">Name</label>
                <input id="cname" type="text" value={contactName} onChange={e => setContactName(e.target.value)} autoComplete="name" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40" />
              </div>
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 6100ms both" }}>
                <label htmlFor="cbusiness" className="block text-xs text-neutral-400 mb-1">Business name</label>
                <input id="cbusiness" type="text" value={contactBusiness} onChange={e => setContactBusiness(e.target.value)} autoComplete="organization" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40" />
              </div>
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 6600ms both" }}>
                <label htmlFor="cwebsite" className="block text-xs text-neutral-400 mb-1">Website URL</label>
                <input id="cwebsite" type="url" value={contactWebsite} onChange={e => setContactWebsite(e.target.value)} autoComplete="url" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40" />
              </div>
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 7100ms both" }}>
                <label htmlFor="cemail" className="block text-xs text-neutral-400 mb-1">Email</label>
                <input id="cemail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40" />
              </div>
            </div>
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
        ) : stage === "complete" ? (
          <div className="enquiry-active-slot" style={{ paddingTop: "3rem" }}>
            <div className="enquiry-q5-heading" style={{ marginBottom: "0.5rem" }}>
              <span
                className="enquiry-q5-question"
                style={reducedMotion ? undefined : { animation: "enquiry-mask-reveal-horizontal 2500ms linear 0ms both" }}
              >
                Understood.
              </span>
            </div>
            <p
              className="text-sm text-neutral-400 leading-relaxed"
              style={reducedMotion ? undefined : { animation: "enquiry-mask-reveal-horizontal 4600ms linear 1800ms both" }}
            >
              We&apos;re on it. Add your details and we&apos;ll turn this into a clearer direction for your site.
            </p>
            <div
              className="mt-5"
              style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 8000ms both" }}
            >
              <button
                type="button"
                disabled={!contactName.trim() || !contactBusiness.trim() || !contactWebsite.trim() || !contactEmail.trim()}
                className="enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          // Active slot — stable position; Q5 then Q4 content swaps in place here.
          <div className={`enquiry-active-slot${
              q5Transition && activeQ === 5 ? " enquiry-q5-exiting"
              : q5Transition && activeQ === 4 ? " enquiry-active-entering"
              : q1Completing ? " enquiry-q1-completing"
              : transitionQ !== null && activeQ === transitionQ ? " enquiry-normal-exiting"
              : transitionQ !== null && transitionQ === activeQ + 1 ? " enquiry-normal-entering"
              : ""
            }`}>
              <div className="enquiry-q5-heading">
                <span className="enquiry-q5-cue" aria-hidden="true">Q{activeQ}</span>
                <span
                  key={activeQ}
                  className={`enquiry-q5-question${reducedMotion ? "" : " enquiry-q-text-reveal"}`}
                  id="active-q-label"
                >
                  {QUESTIONS[activeQ].question}
                </span>
              </div>

              <div
                key={activeQ}
                className={`enquiry-answer-grid${reducedMotion ? "" : " enquiry-cards-reveal"}`}
                role="group"
                aria-labelledby="active-q-label"
              >
                {QUESTIONS[activeQ].options.map(option => {
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
