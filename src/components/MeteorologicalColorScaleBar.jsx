import React from "react";
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Tornado,
  Activity,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from "lucide-react";
import { translations } from "../lib/translations";
export const COLOR_SCALES = {
  priority: {
    title: "Multi-Hazard Alert & Disaster Vulnerability",
    hindiTitle: "समग्र आपदा चेतावनी एवं जोखिम (Disaster Alert)",
    unit: "Risk",
    stops: [
      { val: 0, color: "rgba(34, 197, 94, 0.2)", label: "Safe" },
      { val: 30, color: "#84cc16", label: "Watch" },
      { val: 50, color: "#eab308", label: "Moderate" },
      { val: 70, color: "#f97316", label: "Severe" },
      { val: 85, color: "#ef4444", label: "Red Alert" },
      { val: 100, color: "#7f1d1d", label: "Extreme" }
    ],
    cssGradient: "linear-gradient(to right, #22c55e 0%, #84cc16 25%, #eab308 50%, #f97316 70%, #ef4444 85%, #7f1d1d 100%)",
    min: 0,
    max: 100
  },
  heatwave: {
    title: "Maximum Surface Temperature & Heatwave",
    hindiTitle: "\u0905\u0927\u093F\u0915\u0924\u092E \u0924\u093E\u092A\u092E\u093E\u0928 \u090F\u0935\u0902 \u0932\u0942 (Heatwave)",
    unitC: "\xB0C",
    unitF: "\xB0F",
    stopsC: [
      { val: 10, color: "#a855f7", label: "<10\xB0" },
      { val: 18, color: "#3b82f6", label: "18\xB0" },
      { val: 24, color: "#10b981", label: "24\xB0" },
      { val: 28, color: "#84cc16", label: "28\xB0" },
      { val: 32, color: "#eab308", label: "32\xB0" },
      { val: 36, color: "#f97316", label: "36\xB0" },
      { val: 40, color: "#ef4444", label: "40\xB0" },
      { val: 44, color: "#991b1b", label: "44\xB0+" }
    ],
    stopsF: [
      { val: 50, color: "#a855f7", label: "50\xB0" },
      { val: 64, color: "#3b82f6", label: "64\xB0" },
      { val: 75, color: "#10b981", label: "75\xB0" },
      { val: 82, color: "#84cc16", label: "82\xB0" },
      { val: 90, color: "#eab308", label: "90\xB0" },
      { val: 97, color: "#f97316", label: "97\xB0" },
      { val: 104, color: "#ef4444", label: "104\xB0" },
      { val: 112, color: "#991b1b", label: "112\xB0+" }
    ],
    cssGradient: "linear-gradient(to right, #a855f7 0%, #3b82f6 18%, #10b981 35%, #84cc16 48%, #eab308 62%, #f97316 78%, #ef4444 90%, #7f1d1d 100%)",
    min: 10,
    max: 45
  },
  rain: {
    title: "Doppler Radar Precipitation & Flood Inundation",
    hindiTitle: "डॉप्लर रडार वर्षा एवं बाढ़ (Precipitation & Flood)",
    unit: "mm",
    stops: [
      { val: 0, color: "rgba(255, 255, 255, 0.05)", label: "0 mm (Dry)" },
      { val: 2.5, color: "#38bdf8", label: "2.5" },
      { val: 8, color: "#22c55e", label: "8" },
      { val: 18, color: "#a3e635", label: "18" },
      { val: 32, color: "#facc15", label: "32" },
      { val: 50, color: "#f97316", label: "50" },
      { val: 75, color: "#ef4444", label: "75" },
      { val: 100, color: "#c026d3", label: "100+ mm" }
    ],
    cssGradient: "linear-gradient(to right, rgba(56,189,248,0.3) 0%, #38bdf8 15%, #22c55e 32%, #a3e635 48%, #facc15 62%, #f97316 75%, #ef4444 88%, #c026d3 100%)",
    min: 0,
    max: 100
  },
  rain_prob: {
    title: "Rain Probability Forecast & Storm Scan",
    hindiTitle: "वर्षा संभाव्यता एवं तूफान स्कैन (Rain Probability %)",
    unit: "%",
    stops: [
      { val: 0, color: "rgba(255, 255, 255, 0.05)", label: "<15% Dry" },
      { val: 25, color: "#38bdf8", label: "25%" },
      { val: 40, color: "#22c55e", label: "40%" },
      { val: 55, color: "#a3e635", label: "55%" },
      { val: 70, color: "#facc15", label: "70%" },
      { val: 85, color: "#f97316", label: "85%" },
      { val: 95, color: "#ef4444", label: "95%" },
      { val: 100, color: "#c026d3", label: "100%" }
    ],
    cssGradient: "linear-gradient(to right, rgba(56,189,248,0.3) 0%, #38bdf8 15%, #22c55e 32%, #a3e635 48%, #facc15 62%, #f97316 78%, #ef4444 90%, #c026d3 100%)",
    min: 0,
    max: 100
  },
  rain_probability: {
    title: "Rain Probability Forecast & Storm Scan",
    hindiTitle: "वर्षा संभाव्यता एवं तूफान स्कैन (Rain Probability %)",
    unit: "%",
    stops: [
      { val: 0, color: "rgba(255, 255, 255, 0.05)", label: "<15% Dry" },
      { val: 25, color: "#38bdf8", label: "25%" },
      { val: 40, color: "#22c55e", label: "40%" },
      { val: 55, color: "#a3e635", label: "55%" },
      { val: 70, color: "#facc15", label: "70%" },
      { val: 85, color: "#f97316", label: "85%" },
      { val: 95, color: "#ef4444", label: "95%" },
      { val: 100, color: "#c026d3", label: "100%" }
    ],
    cssGradient: "linear-gradient(to right, rgba(56,189,248,0.3) 0%, #38bdf8 15%, #22c55e 32%, #a3e635 48%, #facc15 62%, #f97316 78%, #ef4444 90%, #c026d3 100%)",
    min: 0,
    max: 100
  },
  wind: {
    title: "Surface Wind Velocity & Squall Isotachs",
    hindiTitle: "\u092A\u0935\u0928 \u0917\u0924\u093F \u090F\u0935\u0902 \u0906\u0902\u0927\u0940 (Wind Speed Isotachs)",
    unit: "km/h",
    stops: [
      { val: 0, color: "#06b6d4", label: "0" },
      { val: 15, color: "#10b981", label: "15" },
      { val: 30, color: "#eab308", label: "30" },
      { val: 50, color: "#f97316", label: "50" },
      { val: 75, color: "#ef4444", label: "75" },
      { val: 100, color: "#9333ea", label: "100+" }
    ],
    cssGradient: "linear-gradient(to right, #06b6d4 0%, #10b981 22%, #eab308 45%, #f97316 68%, #ef4444 85%, #9333ea 100%)",
    min: 0,
    max: 100
  },
  cyclone: {
    title: "Cyclonic Central Pressure & Isobar Depression",
    hindiTitle: "\u091A\u0915\u094D\u0930\u0935\u093E\u0924 \u0935\u093E\u092F\u0941\u0926\u093E\u092C \u090F\u0935\u0902 \u0938\u092E\u0926\u093E\u092C \u0930\u0947\u0916\u093E\u090F\u0902 (Isobars & Pressure)",
    unit: "hPa",
    stops: [
      { val: 980, color: "#7f1d1d", label: "980 Eye" },
      { val: 990, color: "#dc2626", label: "990" },
      { val: 998, color: "#ea580c", label: "998" },
      { val: 1005, color: "#ca8a04", label: "1005" },
      { val: 1012, color: "#0284c7", label: "1012" },
      { val: 1020, color: "#1e3a8a", label: "1020+" }
    ],
    // Low pressure in center is red/crimson, high pressure is blue
    cssGradient: "linear-gradient(to right, #7f1d1d 0%, #dc2626 22%, #ea580c 45%, #ca8a04 65%, #0284c7 85%, #1e3a8a 100%)",
    min: 980,
    max: 1020
  },
  humidity: {
    title: "Atmospheric Relative Humidity & Dew Point",
    hindiTitle: "\u0938\u093E\u092A\u0947\u0915\u094D\u0937\u093F\u0915 \u0906\u0930\u094D\u0926\u094D\u0930\u0924\u093E \u090F\u0935\u0902 \u0913\u0938\u093E\u0902\u0915 (Relative Humidity %)",
    unit: "%",
    stops: [
      { val: 20, color: "#d97706", label: "20% Dry" },
      { val: 40, color: "#eab308", label: "40%" },
      { val: 60, color: "#22c55e", label: "60%" },
      { val: 75, color: "#06b6d4", label: "75%" },
      { val: 90, color: "#2563eb", label: "90%" },
      { val: 100, color: "#7c3aed", label: "100% Sat" }
    ],
    cssGradient: "linear-gradient(to right, #d97706 0%, #eab308 22%, #22c55e 48%, #06b6d4 70%, #2563eb 88%, #7c3aed 100%)",
    min: 20,
    max: 100
  },
  air_quality: {
    title: "National Air Quality Index (AQI)",
    hindiTitle: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0935\u093E\u092F\u0941 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0938\u0942\u091A\u0915\u093E\u0902\u0915 (AQI)",
    unit: "AQI",
    stops: [
      { val: 0, color: "#22c55e", label: "0 Good" },
      { val: 50, color: "#84cc16", label: "50 Sat" },
      { val: 100, color: "#eab308", label: "100 Mod" },
      { val: 200, color: "#f97316", label: "200 Poor" },
      { val: 300, color: "#ef4444", label: "300 V.Poor" },
      { val: 400, color: "#7f1d1d", label: "400+ Severe" }
    ],
    cssGradient: "linear-gradient(to right, #22c55e 0%, #84cc16 18%, #eab308 35%, #f97316 58%, #ef4444 80%, #7f1d1d 100%)",
    min: 0,
    max: 400
  }
};
export const MeteorologicalColorScaleBar = ({
  activeLayer,
  onLayerChange,
  hoveredValue,
  hoveredUnit,
  selectedCityName,
  selectedValue,
  tempUnit,
  onToggleTempUnit,
  showStationNumbers,
  onToggleStationNumbers,
  layerOpacity,
  onOpacityChange,
  language = "en"
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const t = translations[language];
  const scaleKey = activeLayer === "priority" ? "heatwave" : activeLayer === "rain" ? "rain" : activeLayer === "wind" ? "wind" : activeLayer === "humidity" ? "humidity" : activeLayer === "cyclone" ? "cyclone" : activeLayer === "air_quality" ? "air_quality" : "heatwave";
  const currentScale = COLOR_SCALES[scaleKey] || COLOR_SCALES.heatwave;
  const currentTitle = language === "hi" ? currentScale.hindiTitle || currentScale.title : currentScale.title;
  const activeVal = hoveredValue !== null ? hoveredValue : selectedValue !== void 0 ? selectedValue : null;
  let indicatorPercent = null;
  if (activeVal !== null) {
    const min = currentScale.min;
    const max = currentScale.max;
    const clamped = Math.max(min, Math.min(max, activeVal));
    indicatorPercent = (clamped - min) / (max - min) * 100;
  }
  const layerButtons = [
    { id: "heatwave", label: "Temperature", hindiLabel: "\u0924\u093E\u092A\u092E\u093E\u0928 (Heat)", icon: Thermometer },
    { id: "rain", label: "Precipitation", hindiLabel: "\u0935\u0930\u094D\u0937\u093E (Radar)", icon: CloudRain },
    { id: "wind", label: "Wind Velocity", hindiLabel: "\u092A\u0935\u0928 \u0917\u0924\u093F (Wind)", icon: Wind },
    { id: "cyclone", label: "Cyclone & Isobars", hindiLabel: "\u091A\u0915\u094D\u0930\u0935\u093E\u0924 (Cyclone)", icon: Tornado },
    { id: "humidity", label: "Humidity", hindiLabel: "\u0906\u0930\u094D\u0926\u094D\u0930\u0924\u093E (Humidity)", icon: Droplets },
    { id: "air_quality", label: "Air Quality", hindiLabel: "\u0935\u093E\u092F\u0941 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E (AQI)", icon: Activity }
  ];
  return <div
    id="meteorological-graphical-forecast-bar"
    className="w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 text-slate-100 shadow-2xl transition-all select-none z-30"
  >
      {
    /* Top Meta Header: NWS / IMD Digital Forecast Bar Header */
  }
      <div className="px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800/80 gap-2 text-xs">
        {
    /* Title & Brand */
  }
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-600/30 border border-blue-500/40 text-blue-300 font-black tracking-wider uppercase text-[10px]">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping inline-block mr-0.5" />
            <span>GRAPHICAL FORECAST</span>
          </div>
          <span className="font-bold text-slate-200 hidden sm:inline text-xs">
            {language === "hi" ? "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u092E\u094C\u0938\u092E \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u091A\u093F\u0924\u094D\u0930\u093E\u0924\u094D\u092E\u0915 \u092A\u0942\u0930\u094D\u0935\u093E\u0928\u0941\u092E\u093E\u0928" : "National Digital Forecast & Meteorological Gradient"}
          </span>
        </div>

        {
    /* Layer Selector Tabs */
  }
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-full">
          {layerButtons.map((btn) => {
    const Icon = btn.icon;
    const isActive = activeLayer === btn.id || activeLayer === "priority" && btn.id === "heatwave";
    return <button
      key={btn.id}
      id={`forecast-layer-btn-${btn.id}`}
      onClick={() => onLayerChange(btn.id)}
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400" : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"}`}
    >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{language === "hi" ? btn.hindiLabel : btn.label}</span>
              </button>;
  })}
        </div>

        {
    /* Right Tools: Station numbers toggle, unit toggle, opacity */
  }
        <div className="flex items-center gap-2">
          {
    /* Station Numbers toggle */
  }
          <button
    id="toggle-station-numbers-btn"
    onClick={onToggleStationNumbers}
    className={`px-2 py-0.5 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${showStationNumbers ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300" : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"}`}
    title={showStationNumbers ? "Hide station numbers on map" : "Show station numbers on map"}
  >
            {showStationNumbers ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3" />}
            <span className="hidden md:inline">{showStationNumbers ? language === "hi" ? "\u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0902 \u091A\u093E\u0932\u0942" : "Values ON" : language === "hi" ? "\u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0902 \u092C\u0902\u0926" : "Values OFF"}</span>
          </button>

          {
    /* Unit Toggle for Temperature */
  }
          {(activeLayer === "heatwave" || activeLayer === "priority") && <button
    id="toggle-temp-unit-btn"
    onClick={onToggleTempUnit}
    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
  >
              °{tempUnit}
            </button>}

          {
    /* Collapse/Expand */
  }
          <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="p-1 text-slate-400 hover:text-slate-100 rounded cursor-pointer"
    title={isExpanded ? "Collapse color grading scale" : "Expand color grading scale"}
  >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {
    /* Main Continuous Color Grading Spectrum Bar (NWS / IMD Style) */
  }
      {isExpanded && <div className="px-3 sm:px-4 py-2 bg-slate-900/90 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-100 tracking-wide uppercase">
                {currentTitle}
              </span>
              {selectedCityName && <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedCityName}: <strong className="text-amber-300 font-mono">{selectedValue !== void 0 ? `${selectedValue}${scaleKey === "heatwave" ? `\xB0${tempUnit}` : ` ${currentScale.unit || ""}`}` : "--"}</strong>
                </span>}
            </div>

            {
    /* Realtime Live Reading at Cursor */
  }
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">{language === "hi" ? "\u0938\u0915\u094D\u0930\u093F\u092F \u092E\u093E\u0928:" : "Current Probe Reading:"}</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/40">
                {hoveredValue !== null ? `${hoveredValue} ${hoveredUnit}` : selectedValue !== void 0 ? `${selectedValue} ${scaleKey === "heatwave" ? `\xB0${tempUnit}` : currentScale.unit || ""}` : "Hover map for real-time probe"}
              </span>
            </div>
          </div>

          {
    /* Continuous Gradient Bar Container */
  }
          <div className="relative pt-1 pb-1">
            {
    /* The Gradient Track */
  }
            <div
    className="h-5 sm:h-6 w-full rounded-md shadow-inner border border-slate-700/80 relative overflow-hidden"
    style={{ background: currentScale.cssGradient }}
  >
              {
    /* Optional Subtle Grid hatch */
  }
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:10%_100%] pointer-events-none" />
            </div>

            {
    /* Glowing Real-time Slider Indicator on Gradient */
  }
            {indicatorPercent !== null && <div
    className="absolute top-0 bottom-0 pointer-events-none transition-all duration-150 ease-out"
    style={{ left: `${Math.max(1, Math.min(99, indicatorPercent))}%` }}
  >
                <div className="relative -top-1 -ml-2.5 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  <div className="w-1 h-7 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] rounded-full" />
                </div>
              </div>}

            {
    /* Numerical Ticks & Labels underneath */
  }
            <div className="flex justify-between items-center px-1 mt-1 text-[10px] sm:text-[11px] font-mono font-bold text-slate-300">
              {(scaleKey === "heatwave" && tempUnit === "F" ? currentScale.stopsF : currentScale.stops || currentScale.stopsC).map((st, idx) => <div key={idx} className="flex flex-col items-center">
                  <div className="w-0.5 h-1.5 bg-slate-600 mb-0.5" />
                  <span className="drop-shadow-sm text-slate-200">{st.label}</span>
                </div>)}
            </div>
          </div>
        </div>}
    </div>;
};
