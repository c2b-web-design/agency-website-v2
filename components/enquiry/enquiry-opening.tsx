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
  // True while the corridor is shifting one depth deeper: the answered question recedes
  // (depth-0 -> depth-1), every older memory deepens by one, the heading recedes, and the
  // next active question is gated out of depth-0 until the morph settles. Drives the heading
  // recede + the receding phrase's card fade-out.
  const [corridorMoving, setCorridorMoving] = useState(false);
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
    // enquiry-button-mask: 7400ms delay + 1900ms duration = interactive at 9300ms
    const t = window.setTimeout(() => setBeginInteractive(true), 9300);
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

  // One generic corridor step for every question. The answered question is pushed to
  // memory (it becomes the newest = depth-1) and every older memory deepens by one — both
  // happen as a single setMemory because depth is derived from position in memory[]. The
  // answered question's phrase persists by key, so it morphs depth-0 -> depth-1 rather than
  // being torn down. The next active question is gated out of depth-0 until the morph settles.
  function handleNextStep() {
    const fromQ = activeQ;
    const answersSnap = Array.from(selected).join(" • ");
    setSelected(new Set());
    setMemory(prev => [...prev, {
      label: `Q${fromQ}`,
      question: QUESTIONS[fromQ].question,
      answers: answersSnap,
    }]);

    if (fromQ === 1) {
      // Last question -> completion. The corridor holds while "Understood." + the form mount.
      if (reducedMotion) {
        setStage("complete");
        return;
      }
      setCorridorMoving(true);
      setTimeout(() => { setStage("complete"); setCorridorMoving(false); }, 900);
      return;
    }

    if (reducedMotion) {
      setActiveQ(fromQ - 1);
      return;
    }

    // Vacate depth-0, recede the heading + deepen the stack, then admit the next question
    // once the ~900ms morph has settled and the active field is clearly empty (~250ms beat).
    setCorridorMoving(true);
    setTimeout(() => {
      setActiveQ(fromQ - 1);
      setCorridorMoving(false);
    }, 1150);
  }

  // The joined answer summary for a question once it has been answered (read from memory[]).
  function answersSummary(qNum: number) {
    const item = memory.find(m => m.label === `Q${qNum}`);
    return item ? item.answers : "";
  }

  // Generic persistent phrase. Same markup at every depth; only the depth class and which
  // supporting content shows differ (cards+Next at depth 0, summary at depth >= 1). Stable
  // key per question number => the node persists as its depth changes => continuity.
  // The receding phrase keeps its cards mounted (fading out) for one beat via showExtras.
  function renderPhrase(qNum: number, depth: number, isActive: boolean) {
    const showExtras = isActive || (corridorMoving && depth === 1);
    return (
      <div
        key={`phrase-${qNum}`}
        className={`enquiry-phrase enquiry-pdepth-${depth}${reducedMotion ? "" : " enquiry-phrase-anim"}`}
      >
        <div className="enquiry-phrase-qrow">
          <span className="enquiry-phrase-cue" aria-hidden="true">Q{qNum}</span>
          <span
            className={`enquiry-phrase-question${reducedMotion || !isActive ? "" : " enquiry-q-text-reveal"}`}
            id={isActive ? "active-q-label" : undefined}
          >
            {QUESTIONS[qNum].question}
          </span>
        </div>

        {depth >= 1 && (
          <div className={`enquiry-phrase-answers${reducedMotion ? "" : " enquiry-phrase-answers-enter"}`}>
            {answersSummary(qNum)}
          </div>
        )}

        {showExtras && (
          <div className={`enquiry-phrase-extras${isActive ? "" : " enquiry-phrase-extras-out"}`}>
            <div
              className={`enquiry-answer-grid${reducedMotion ? "" : " enquiry-cards-reveal"}`}
              role="group"
              aria-labelledby="active-q-label"
            >
              {QUESTIONS[qNum].options.map(option => {
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
    );
  }

  // heading depth = memory.length + 1 (0 = full opening size, no depth class applied).
  // The heading is the deepest corridor layer — always one step below the deepest memory.
  const headingDepth = memory.length > 0 ? memory.length + 1 : 0;
  // The first recede (full opening heading -> d2) uses the ghost crossfade; later steps just
  // deepen via the transition. memory.length === 1 while the first step is in flight.
  const firstRecede = corridorMoving && memory.length === 1;

  // One ordered list of every rendered phrase (answered questions + the active one), built
  // so each question keeps a stable array slot across an answer: an answered question stays
  // at its index as it deepens, and the active question is always appended last. This single
  // array is rendered as ONE expression so React reconciles phrase-${qNum} by key across the
  // active->memory move (no remount => the outgoing phrase morphs depth-0 -> depth-1). The
  // INCOMING active question is withheld while the corridor is moving.
  const phraseList: { qNum: number; depth: number; isActive: boolean }[] = memory.map((item, i) => ({
    qNum: Number(item.label.slice(1)),
    depth: memory.length - i, // newest answered = depth-1
    isActive: false,
  }));
  if (!corridorMoving && stage !== "complete") {
    phraseList.push({ qNum: activeQ, depth: 0, isActive: true });
  }

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
        {firstRecede && (
          <h1
            className="font-semibold tracking-tight text-white text-3xl sm:text-4xl leading-[1.15] enquiry-opening-ghost"
            aria-hidden="true"
          >
            <div>{HEADING_LINE1}</div>
            <div>{HEADING_LINE2}</div>
          </h1>
        )}
        {firstRecede && headingDepth > 0 && (
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
              ? ` enquiry-heading-d${headingDepth}${firstRecede ? " enquiry-heading-hidden" : ""}${corridorMoving && !firstRecede ? " enquiry-heading-deepening" : ""}${stage === "complete" ? " enquiry-heading-complete" : ""}`
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

        {/* Unified phrase corridor — every question lives here as ONE persistent phrase. */}
        {/* The active question is depth-0; each answered question (newest -> oldest) is */}
        {/* depth-1, depth-2, ... The heading is the deepest layer. Because all phrases */}
        {/* share this band and a stable per-question key, a question moving from active to */}
        {/* memory keeps its DOM node and morphs depth-0 -> depth-1 (and older ones deepen) */}
        {/* rather than being torn down and rebuilt. */}
        {stage !== "opening" && (
          <div className={`enquiry-phrase-band${stage === "complete" ? " enquiry-phrase-complete" : ""}`}>
            {/* ONE list, so React matches keys across the active<->memory move: the */}
            {/* outgoing question stays in the same reconciliation slot and morphs its */}
            {/* depth class (0 -> 1) instead of being unmounted and remounted. Only the */}
            {/* INCOMING active question is withheld until the corridor has settled. */}
            {phraseList.map(p => renderPhrase(p.qNum, p.depth, p.isActive))}
          </div>
        )}

        {stage === "complete" && (
          <div className="enquiry-contact-layer">
            <div className="grid grid-cols-2 gap-2 w-full text-left">
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 3600ms both" }}>
                <label htmlFor="cname" className="block text-xs text-neutral-400 mb-1">Name</label>
                <input id="cname" type="text" value={contactName} onChange={e => setContactName(e.target.value)} autoComplete="name" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40" />
              </div>
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 4100ms both" }}>
                <label htmlFor="cbusiness" className="block text-xs text-neutral-400 mb-1">Business name</label>
                <input id="cbusiness" type="text" value={contactBusiness} onChange={e => setContactBusiness(e.target.value)} autoComplete="organization" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40" />
              </div>
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 4600ms both" }}>
                <label htmlFor="cwebsite" className="block text-xs text-neutral-400 mb-1">Website URL</label>
                <input id="cwebsite" type="url" value={contactWebsite} onChange={e => setContactWebsite(e.target.value)} autoComplete="url" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40" />
              </div>
              <div style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 5100ms both" }}>
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
                className="rounded-full px-6 py-2.5 text-sm font-medium text-neutral-900 bg-white cursor-pointer hover:bg-neutral-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
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
                style={reducedMotion ? undefined : { animation: "enquiry-mask-reveal-horizontal 1100ms cubic-bezier(0.37, 0, 0.63, 1) 0ms both, eq-understood-fade-out 1400ms linear 4800ms forwards" }}
              >
                Understood.
              </span>
            </div>
            <p
              className="text-sm text-neutral-400 leading-relaxed"
              style={reducedMotion ? undefined : { animation: "enquiry-mask-reveal-horizontal 3600ms cubic-bezier(0.37, 0, 0.63, 1) 800ms both, eq-understood-fade-out 1400ms linear 4800ms forwards" }}
            >
              We&apos;re on it. Add your details and we&apos;ll turn this into a clearer direction for your site.
            </p>
            <div
              className="mt-5"
              style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 5600ms both" }}
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
        ) : null}
      </div>
    </div>
  );
}
