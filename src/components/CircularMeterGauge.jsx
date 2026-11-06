import React, { useMemo, useState } from "react";
import {
  Zap,
  Gauge,
  Minimize2,
  Maximize2
} from "lucide-react";
import { getTranslation } from "../lib/translations";

export const CircularMeterGauge = ({
  activeLayer = "priority",
  activeScale = {},
  currentLayerConfig = {},
  probeData = null,
  weather = null,
  language = "en",
  tempUnit = "C",
  viewportRange = null,
  isScanning = true,
  onToggleScan = () => {},
  isFloating = true,
  className = ""
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Compute the current active numeric value and unit
  const layerData = useMemo(() => {
    let val = 0;
    let unit = currentLayerConfig?.unit || "";

    if (probeData?.metrics) {
      if (activeLayer === "heatwave" && probeData.metrics.temp != null) {
        val = probeData.metrics.temp;
        unit = `°${tempUnit}`;
      } else if (activeLayer === "rain_prob" && probeData.metrics.rainProbability != null) {
        val = probeData.metrics.rainProbability;
        unit = "%";
      } else if (activeLayer === "rainfall" && probeData.metrics.precipitationRate != null) {
        val = probeData.metrics.precipitationRate;
        unit = "mm/h";
      } else if (activeLayer === "wind" && probeData.metrics.windSpeed != null) {
        val = probeData.metrics.windSpeed;
        unit = "km/h";
      } else if (activeLayer === "air_quality" && probeData.metrics.aqi != null) {
        val = probeData.metrics.aqi;
        unit = "AQI";
      } else if (activeLayer === "humidity" && probeData.metrics.humidity != null) {
        val = probeData.metrics.humidity;
        unit = "%";
      } else if (activeLayer === "cloud" && probeData.metrics.cloudCover != null) {
        val = probeData.metrics.cloudCover;
        unit = "%";
      } else if (activeLayer === "uv" && probeData.metrics.uvIndex != null) {
        val = probeData.metrics.uvIndex;
        unit = "UV";
      } else if (activeLayer === "cyclone" && probeData.metrics.pressure != null) {
        val = probeData.metrics.pressure;
        unit = "hPa";
      }
      return { val: Math.round(val * 10) / 10, unit, isProbing: true };
    }

    if (weather) {
      if (activeLayer === "heatwave") {
        val = weather.temp ?? 29;
        unit = `°${tempUnit}`;
      } else if (activeLayer === "rain_prob") {
        val = weather.precipitation_prob ?? 38;
        unit = "%";
      } else if (activeLayer === "rainfall") {
        val = weather.rain_rate ?? 5.2;
        unit = "mm/h";
      } else if (activeLayer === "wind") {
        val = weather.wind_speed ?? 18;
        unit = "km/h";
      } else if (activeLayer === "air_quality") {
        val = weather.aqi ?? 78;
        unit = "AQI";
      } else if (activeLayer === "humidity") {
        val = weather.humidity ?? 64;
        unit = "%";
      } else if (activeLayer === "cloud") {
        val = weather.cloud_cover ?? 42;
        unit = "%";
      } else if (activeLayer === "uv") {
        val = weather.uv_index ?? 6.8;
        unit = "UV";
      } else if (activeLayer === "cyclone") {
        val = weather.pressure ?? 1008;
        unit = "hPa";
      } else if (activeLayer === "priority") {
        val = 35;
        unit = "Risk";
      }
      return { val: Math.round(val * 10) / 10, unit, isProbing: false };
    }

    if (viewportRange) {
      const avg = (viewportRange.min + viewportRange.max) / 2;
      return { val: Math.round(avg * 10) / 10, unit, isProbing: false };
    }

    const defaultVals = {
      priority: { val: 32, unit: "Risk" },
      heatwave: { val: 28.5, unit: `°${tempUnit}` },
      rain_prob: { val: 40, unit: "%" },
      rainfall: { val: 4.8, unit: "mm/h" },
      wind: { val: 18, unit: "km/h" },
      air_quality: { val: 82, unit: "AQI" },
      humidity: { val: 65, unit: "%" },
      cyclone: { val: 1006, unit: "hPa" },
      cloud: { val: 45, unit: "%" },
      uv: { val: 6.5, unit: "UV" },
      marine: { val: 26, unit: "°C" }
    };

    return defaultVals[activeLayer] || { val: 50, unit: currentLayerConfig?.unit || "", isProbing: false };
  }, [probeData, activeLayer, weather, tempUnit, viewportRange, currentLayerConfig]);

  // Determine min and max domain for gauge
  const { minVal, maxVal } = useMemo(() => {
    if (viewportRange) {
      return { minVal: viewportRange.min, maxVal: viewportRange.max };
    }
    if (activeScale.stopsC && tempUnit === "C") {
      return { minVal: activeScale.stopsC[0].val, maxVal: activeScale.stopsC[activeScale.stopsC.length - 1].val };
    }
    if (activeScale.stops) {
      return { minVal: activeScale.stops[0].val, maxVal: activeScale.stops[activeScale.stops.length - 1].val };
    }
    return { minVal: activeScale.min ?? 0, maxVal: activeScale.max ?? 100 };
  }, [viewportRange, activeScale, tempUnit]);

  // Normalized gauge percentage [0, 1]
  const pct = useMemo(() => {
    const span = maxVal - minVal;
    if (span <= 0) return 0.5;
    return Math.max(0, Math.min(1, (layerData.val - minVal) / span));
  }, [layerData.val, minVal, maxVal]);

  const t = getTranslation(language);

  // Qualitative status descriptor
  const statusDescriptor = useMemo(() => {
    if (activeLayer === "priority") {
      if (pct < 0.3) return { text: t.statusSafeOptimal || "Safe / Optimal", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      if (pct < 0.6) return { text: t.statusModerateWatch || "Moderate Watch", color: "text-amber-600 bg-amber-50 border-amber-200" };
      if (pct < 0.8) return { text: t.statusSevereAlert || "Severe Alert", color: "text-orange-600 bg-orange-50 border-orange-200" };
      return { text: t.statusExtremeDanger || "Extreme Danger", color: "text-rose-600 bg-rose-50 border-rose-200" };
    }
    if (activeLayer === "air_quality") {
      if (layerData.val <= 50) return { text: t.statusGoodAQI || "Good Quality", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      if (layerData.val <= 100) return { text: t.statusModerateAQI || "Moderate", color: "text-lime-600 bg-lime-50 border-lime-200" };
      if (layerData.val <= 200) return { text: t.statusUnhealthyAQI || "Unhealthy", color: "text-amber-600 bg-amber-50 border-amber-200" };
      if (layerData.val <= 300) return { text: t.statusPoorAQI || "Very Poor", color: "text-orange-600 bg-orange-50 border-orange-200" };
      return { text: t.statusSevereHazardAQI || "Severe Hazard", color: "text-rose-600 bg-rose-50 border-rose-200" };
    }
    if (pct < 0.35) return { text: t.statusLowCalm || "Low / Calm", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (pct < 0.7) return { text: t.statusModerate || "Moderate", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { text: t.statusElevatedHigh || "Elevated / High", color: "text-rose-600 bg-rose-50 border-rose-200" };
  }, [activeLayer, pct, layerData.val, t]);

  // SVG Geometry Calculation (Compact & Sharp)
  const radius = 30;
  const strokeWidth = 5;
  const arcSweepDegrees = 220;
  const startAngleDegrees = 160;
  const totalCircumference = 2 * Math.PI * radius;
  const arcLength = totalCircumference * (arcSweepDegrees / 360);
  const filledArcLength = arcLength * pct;
  const strokeOffset = arcLength - filledArcLength;
  const needleAngle = -110 + pct * arcSweepDegrees;

  // Build gradient stop list
  const stops = useMemo(() => {
    const list = activeScale.stopsC || activeScale.stops || [
      { val: 0, color: "#22c55e" },
      { val: 50, color: "#eab308" },
      { val: 100, color: "#ef4444" }
    ];
    const totalSpan = maxVal - minVal || 1;
    return list.map((st, idx) => {
      const stopVal = st.val ?? (idx / (list.length - 1)) * 100;
      const stopOffset = Math.max(0, Math.min(100, Math.round(((stopVal - minVal) / totalSpan) * 100)));
      return {
        offset: `${stopOffset}%`,
        color: st.color
      };
    });
  }, [activeScale, minVal, maxVal]);

  const Icon = currentLayerConfig?.icon || Gauge;
  const layerKeyMap = {
    priority: t.layerPriority,
    rainfall: t.layerRain,
    rain_prob: t.layerRainProb,
    wind: t.layerWind,
    humidity: t.layerHumidity,
    heatwave: t.layerHeatwave,
    cyclone: t.layerCyclone,
  };
  const titleText = layerKeyMap[activeLayer] || (language === "hi"
    ? currentLayerConfig?.nameHi || activeScale.hindiTitle || activeScale.title
    : currentLayerConfig?.nameEn || activeScale.title);

  if (isMinimized && isFloating) {
    return (
      <div
        id="map-circular-meter-widget"
        className={`absolute z-30 pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md text-[#031636] flex items-center gap-1.5 cursor-pointer hover:bg-white transition-all select-none animate-in fade-in ${className || "bottom-28 sm:bottom-28 left-3"}`}
        onClick={() => setIsMinimized(false)}
        title="Expand Circular Meteorological Meter"
      >
        <div className="w-6 h-6 rounded-lg bg-[#1a2b4c] text-cyan-300 flex items-center justify-center font-bold text-xs shadow-xs">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col pr-1">
          <span className="text-[9px] text-slate-500 font-semibold leading-tight truncate max-w-[80px]">
            {titleText}
          </span>
          <span className="text-[11px] font-black text-slate-900 leading-tight">
            {layerData.val} <span className="text-[9px] text-blue-600">{layerData.unit}</span>
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Expand Meter"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      id={isFloating ? "map-circular-meter-widget" : "home-circular-meter-widget"}
      className={
        isFloating
          ? `absolute z-30 pointer-events-auto w-36 sm:w-40 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-lg text-[#031636] flex flex-col items-center select-none transition-all animate-in fade-in zoom-in-95 ${className || "bottom-28 sm:bottom-28 left-3"}`
          : `w-full neo-raised rounded-3xl p-3.5 sm:p-4 bg-[#fbf8fc] border border-white/70 shadow-xs text-[#031636] flex flex-col items-center select-none transition-all ${className}`
      }
    >
      {/* Header Bar: Pulse Indicator, Title & Action Controls */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-1 border-b border-slate-200/60 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`${isFloating ? "w-5 h-5 rounded-md text-[10px]" : "w-6 h-6 sm:w-7 sm:h-7 rounded-xl text-xs"} bg-[#1a2b4c] text-cyan-300 flex items-center justify-center font-bold shadow-xs shrink-0`}>
            <Icon className={isFloating ? "w-3 h-3" : "w-3.5 h-3.5 sm:w-4 sm:h-4"} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isScanning ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span className={`${isFloating ? "text-[10px]" : "text-xs sm:text-sm"} font-bold text-slate-900 truncate`}>
                {titleText}
              </span>
            </div>
            {!isFloating && (
              <span className="text-[10px] text-[#575f6a] font-medium truncate">
                {probeData?.cityName
                  ? `${language === "hi" ? "स्कैन बिंदु: " : "Probed Point: "}${probeData.cityName}`
                  : (language === "hi" ? "लाइव मौसम डॉपलर मीटर" : "Live Meteorological Doppler")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleScan}
            className={`${isFloating ? "text-[7px] px-1 py-0.5 rounded" : "text-[9px] px-2 py-1 rounded-lg"} font-mono font-bold transition-colors cursor-pointer border ${
              isScanning ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
            title="Toggle Live Doppler Sweep"
          >
            {isScanning ? (
              <span className="flex items-center gap-0.5"><Zap className={`${isFloating ? "w-2 h-2" : "w-2.5 h-2.5"} text-blue-600`} /> LIVE</span>
            ) : (
              "PAUSE"
            )}
          </button>
          {isFloating && (
            <button
              onClick={() => setIsMinimized(true)}
              className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Minimize Meter"
            >
              <Minimize2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Value & Unit Display Just Above the Round Meter */}
      <div className="w-full flex items-baseline justify-center gap-1.5 pt-1 pb-0.5">
        <span className={`${isFloating ? "text-[19px]" : "text-2xl sm:text-3xl"} font-black text-slate-900 tracking-tight leading-none`}>
          {layerData.val}
        </span>
        <span className={`${isFloating ? "text-xs" : "text-sm sm:text-base"} font-extrabold text-blue-600 font-mono leading-none`}>
          {layerData.unit}
        </span>
      </div>

      {/* Circular Meter Gauge SVG Visual (Clean needle area without text collision) */}
      <div className="relative w-full flex justify-center py-0.5">
        <svg
          viewBox="0 0 100 78"
          className={isFloating ? "w-28 h-22 overflow-visible" : "w-36 h-26 sm:w-44 sm:h-30 overflow-visible"}
        >
          <defs>
            <linearGradient id="circularMeterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              {stops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Background Arc Track */}
          <circle
            cx="50"
            cy="44"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${totalCircumference}`}
            strokeLinecap="round"
            transform={`rotate(${startAngleDegrees} 50 44)`}
          />

          {/* Active Filled Colored Arc */}
          <circle
            cx="50"
            cy="44"
            r={radius}
            fill="none"
            stroke="url(#circularMeterGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${totalCircumference}`}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
            transform={`rotate(${startAngleDegrees} 50 44)`}
            className="transition-all duration-500 ease-out"
          />

          {/* Gauge Needle Pointer */}
          <g
            transform={`rotate(${needleAngle} 50 44)`}
            className="transition-transform duration-500 ease-out"
          >
            <line
              x1="50"
              y1="44"
              x2="50"
              y2="16"
              stroke="#031636"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="50"
              y1="16"
              x2="50"
              y2="19"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Center Hub */}
          <circle cx="50" cy="44" r="4" fill="#031636" />
          <circle cx="50" cy="44" r="1.5" fill="#ffffff" />

          {/* Min Stop Endpoint on Left Bottom */}
          <text
            x="18"
            y="72"
            textAnchor="middle"
            fontSize="7"
            fontWeight="bold"
            fontFamily="monospace"
            fill="#64748b"
          >
            {Math.round(minVal)}
          </text>

          {/* Max Stop Endpoint on Right Bottom */}
          <text
            x="82"
            y="72"
            textAnchor="middle"
            fontSize="7"
            fontWeight="bold"
            fontFamily="monospace"
            fill="#64748b"
          >
            {Math.round(maxVal)}
          </text>
        </svg>
      </div>

      {/* Bottom Status Chip */}
      <div className={`w-full ${isFloating ? "py-1 px-2 text-[11px]" : "py-2 px-3 text-xs sm:text-sm"} rounded-xl border font-bold text-center truncate shadow-2xs ${statusDescriptor.color}`}>
        {statusDescriptor.text}
      </div>
    </div>
  );
};

export default CircularMeterGauge;
