"use client";

import { useEffect, useState } from "react";

const HEADING_LINE1 = "Let’s understand what your";
const HEADING_LINE2 = "business needs to become.";
const SUBTEXT = "A few focused questions to help us see the right next step.";

const BUTTON_READY_MS = 11500;

export default function EnquiryOpening() {
  const [buttonReady, setButtonReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setButtonReady(true);
      return;
    }
    const tBtn = setTimeout(() => setButtonReady(true), BUTTON_READY_MS);
    return () => clearTimeout(tBtn);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      <div className="text-center max-w-xl w-full">

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

        <div className={`mt-10${!buttonReady ? " pointer-events-none" : ""}`}>
          <div className="enquiry-button-mask">
            <button
              type="button"
              tabIndex={buttonReady ? 0 : -1}
              className="bg-white text-black text-sm font-semibold px-7 py-3 rounded-full tracking-wide hover:bg-neutral-100 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Begin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
