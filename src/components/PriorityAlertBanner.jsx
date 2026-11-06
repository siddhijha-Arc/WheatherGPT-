import { useState } from "react";
import { AlertTriangle, ChevronRight, ShieldAlert, X } from "lucide-react";
export const PriorityAlertBanner = ({
  activeLayer,
  onLayerSelect,
  onViewAlerts
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const isPriorityActive = activeLayer === "priority";
  if (collapsed) {
    return <button
      id="priority-mode-pill-toggle"
      onClick={() => setCollapsed(false)}
      className="absolute top-2 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-lg hover:border-amber-400 transition-all cursor-pointer"
    >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Priority Alert Mode</span>
      </button>;
  }
  return <div
    id="priority-alert-banner"
    className="absolute top-2 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-20 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-amber-500/35 p-3 shadow-2xl transition-all"
  >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ⚠️ Priority Alert Mode ON
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                IMD & AI Integrated
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-snug">
              Showing the most urgent hazard in each area.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-mono">
              <span>Priority:</span>
              <span className="text-rose-400 font-semibold">1. Cyclone</span> →{" "}
              <span className="text-orange-400 font-semibold">2. Flood</span> →{" "}
              <span className="text-amber-400 font-semibold">3. Heatwave</span> →{" "}
              <span className="text-sky-400">4. Normal</span>
            </div>
          </div>
        </div>

        <button
    id="close-priority-banner"
    onClick={() => setCollapsed(true)}
    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
    aria-label="Collapse banner"
  >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-400 text-[10px] italic">
          * Demo meteorological hazard overlay
        </span>
        <button
    id="banner-view-all-alerts"
    onClick={onViewAlerts}
    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors"
  >
          <span>View 5 Active Alerts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>;
};
