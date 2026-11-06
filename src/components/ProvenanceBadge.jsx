import React, { useState } from "react";
import { getProvenanceExplanation, PROVENANCE_TYPES } from "../lib/provenance";

/**
 * ProvenanceBadge Component
 *
 * Renders a compact, accessible provenance tag for a weather value:
 * - LIVE: Direct API observation during the current request
 * - ESTIMATED: Derived via scientific formula, model, or calculation
 * - DEFAULT: Fixed placeholder when live data is unavailable
 *
 * Fully localized with English and Hindi explanations.
 */
export function ProvenanceBadge({
  type = PROVENANCE_TYPES.DEFAULT,
  language = "en",
  detail = null,
  size = "xs",
  className = ""
}) {
  const [showPopup, setShowPopup] = useState(false);
  const normType = (type || PROVENANCE_TYPES.DEFAULT).toLowerCase();
  const isHi = language === "hi";
  const info = getProvenanceExplanation(normType, isHi ? "hi" : "en");

  // Visual styling mapped to provenance category
  let badgeClasses = "bg-slate-100 text-slate-700 border-slate-300";
  let dotColor = "bg-slate-400";

  if (normType === PROVENANCE_TYPES.LIVE) {
    badgeClasses = "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs";
    dotColor = "bg-emerald-500 animate-pulse";
  } else if (normType === PROVENANCE_TYPES.ESTIMATED) {
    badgeClasses = "bg-amber-50 text-amber-800 border-amber-300 shadow-2xs";
    dotColor = "bg-amber-500";
  }

  const tooltipTitle = `${info.label} (${isHi ? "स्रोत प्रकार" : "Source"}: ${normType.toUpperCase()}): ${info.description}${
    detail?.method ? ` • ${isHi ? "पद्धति" : "Method"}: ${detail.method}` : ""
  }${detail?.source ? ` • [${detail.source}]` : ""}`;

  return (
    <span className="relative inline-flex items-center align-middle ml-1.5 select-none">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowPopup((v) => !v);
        }}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
        onFocus={() => setShowPopup(true)}
        onBlur={() => setShowPopup(false)}
        className={`inline-flex items-center gap-1 font-black rounded-md border tracking-wider transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 ${
          size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[9px]"
        } ${badgeClasses} ${className}`}
        title={tooltipTitle}
        aria-label={tooltipTitle}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
        <span>{info.badge}</span>
      </button>

      {/* Floating Accessible Tooltip on hover / tap */}
      {showPopup && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 sm:w-64 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-[11px] leading-snug font-normal shadow-xl border border-slate-700 z-50 pointer-events-none animate-in fade-in duration-150"
        >
          <span className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-slate-700/80 font-bold">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span className="text-white">{info.label}</span>
            </span>
            <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
              {normType}
            </span>
          </span>
          <span className="block text-slate-200">{info.description}</span>
          {detail?.method && (
            <span className="block text-slate-400 text-[10px] mt-1 pt-1 border-t border-slate-800">
              <strong className="text-slate-300">{isHi ? "गणना / विधि" : "Method"}:</strong> {detail.method}
            </span>
          )}
          {detail?.source && (
            <span className="block text-slate-400 text-[10px] mt-0.5">
              <strong className="text-slate-300">{isHi ? "मूल स्रोत" : "Origin"}:</strong> {detail.source}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

export default ProvenanceBadge;
