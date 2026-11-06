import React from "react";
import {
  Wind,
  CloudRain,
  Droplets,
  Flame,
  Tornado,
  Activity,
  AlertTriangle,
  Compass,
  Gauge,
  Thermometer,
  ShieldAlert,
  Navigation,
  ExternalLink,
  X,
  Maximize2
} from "lucide-react";

export const InteractiveWeatherInspectorCard = ({
  probeData,
  activeLayer,
  language = "en",
  tempUnit = "C",
  onClose,
  onZoomTo,
  onChangeLayer,
  onSetAsPinPointLocation
}) => {
  if (!probeData) return null;

  const isHindi = language === "hi";

  // Layer-specific styling & configuration
  const renderLayerSpecificContent = () => {
    switch (activeLayer) {
      case "wind": {
        const wind = probeData.wind || {};
        return (
          <div className="space-y-2.5">
            {/* Primary Wind Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Wind className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "पवन गति" : "Surface Wind Velocity"}
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-300">
                    {wind.speed} <span className="text-xs font-semibold text-emerald-400">km/h</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  wind.isGaleAlert ? "bg-rose-500/30 text-rose-200 border border-rose-400/40" : "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                }`}>
                  <Compass
                    className="w-3.5 h-3.5 text-emerald-300 transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${wind.deg}deg)` }}
                  />
                  {wind.cardinal} ({wind.deg}°)
                </span>
                <div className="text-[9px] text-slate-300 mt-0.5 font-medium">
                  {wind.beaufort}
                </div>
              </div>
            </div>

            {/* Wind Secondary Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "झोंका गति" : "Gust Speed"}</span>
                <span className="text-xs font-mono font-black text-[#031636]">{wind.gust} km/h</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "ब्यूफोर्ट बल" : "Beaufort Force"}</span>
                <span className="text-xs font-mono font-black text-blue-700">Force {wind.beaufortForce}</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "गेल स्थिति" : "Gale Risk"}</span>
                <span className={`text-[11px] font-bold flex items-center justify-center gap-1 ${wind.isGaleAlert ? "text-rose-600" : "text-emerald-700"}`}>
                  {wind.isGaleAlert ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : null}
                  {wind.isGaleAlert ? "High Gale" : "Normal"}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "rain": {
        return (
          <div className="space-y-2.5">
            {/* Primary Rainfall Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <CloudRain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "वर्षा मात्रा" : "Accumulated Rainfall"}
                  </div>
                  <div className="text-xl font-black font-mono text-cyan-300">
                    {probeData.rainMm} <span className="text-xs font-semibold text-cyan-400">mm</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/30 text-cyan-200 border border-blue-400/40 text-[10px] font-bold">
                  <Droplets className="w-3 h-3 text-cyan-300" />
                  {probeData.rainProb}% {isHindi ? "संभावना" : "Probability"}
                </span>
                <div className="text-[9px] text-cyan-200 mt-0.5 font-medium">
                  {probeData.rainRateLabel}
                </div>
              </div>
            </div>

            {/* Rainfall Secondary Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "संभाव्यता" : "Rain Prob"}</span>
                <span className="text-xs font-mono font-black text-blue-700">{probeData.rainProb}%</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "बाढ़ जोखिम" : "Flood Risk"}</span>
                <span className={`text-[11px] font-bold flex items-center justify-center gap-1 ${probeData.rainMm >= 50 ? "text-rose-600" : probeData.rainMm >= 25 ? "text-amber-600" : "text-emerald-700"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${probeData.rainMm >= 50 ? "bg-rose-500" : probeData.rainMm >= 25 ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {probeData.rainMm >= 50 ? "Critical" : probeData.rainMm >= 25 ? "Moderate" : "Low"}
                </span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "तापमान" : "Surface Temp"}</span>
                <span className="text-xs font-mono font-black text-[#031636]">
                  {tempUnit === "F" ? `${probeData.tempF}°F` : `${probeData.tempC}°C`}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "rain_prob":
      case "rain_probability": {
        return (
          <div className="space-y-2.5">
            {/* Primary Rain Prob Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  <Droplets className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "वर्षा संभाव्यता" : "Rain Probability Scan"}
                  </div>
                  <div className="text-xl font-black font-mono text-cyan-300">
                    {probeData.rainProb} <span className="text-xs font-semibold text-cyan-400">%</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  probeData.rainProb >= 70 ? "bg-rose-500/30 text-rose-200 border border-rose-400/40" : "bg-blue-500/30 text-cyan-200 border border-blue-400/40"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${probeData.rainProb >= 70 ? "bg-rose-400 animate-ping" : probeData.rainProb >= 40 ? "bg-amber-400" : "bg-cyan-400"}`} />
                  {probeData.rainProb >= 70 ? "Imminent" : probeData.rainProb >= 40 ? "Likely" : "Dry"}
                </span>
                <div className="text-[9px] text-slate-300 mt-0.5">
                  Est. Rain: {probeData.rainMm} mm
                </div>
              </div>
            </div>

            {/* Rain Probability Meter Bar */}
            <div className="bg-[#fbf8fc] neo-pressed-sm p-2.5 rounded-xl border border-slate-200/60">
              <div className="flex justify-between text-[9px] text-[#575f6a] font-bold mb-1.5">
                <span>0% Clear</span>
                <span className="text-blue-700 font-bold">{probeData.rainProb}% Forecast</span>
                <span>100% Storm</span>
              </div>
              <div className="w-full bg-[#efedf0] rounded-full h-2 overflow-hidden neo-pressed">
                <div
                  className={`h-full transition-all duration-500 ${
                    probeData.rainProb >= 75
                      ? "bg-gradient-to-r from-amber-500 to-rose-500"
                      : probeData.rainProb >= 40
                      ? "bg-gradient-to-r from-sky-400 to-blue-600"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${probeData.rainProb}%` }}
                />
              </div>
            </div>
          </div>
        );
      }

      case "priority": {
        return (
          <div className="space-y-2.5">
            {/* Primary Hazard Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "समग्र आपदा जोखिम" : "Priority Hazard Score"}
                  </div>
                  <div className="text-xl font-black font-mono text-amber-300">
                    {probeData.riskVal} <span className="text-xs font-semibold text-amber-400">/100</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  probeData.riskVal >= 75 ? "bg-rose-500/30 text-rose-200 border border-rose-400/40" : probeData.riskVal >= 40 ? "bg-amber-500/30 text-amber-200 border border-amber-400/40" : "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${probeData.riskVal >= 75 ? "bg-rose-400 animate-ping" : probeData.riskVal >= 40 ? "bg-amber-400" : "bg-emerald-400"}`} />
                  {probeData.riskVal >= 75 ? "Red Alert" : probeData.riskVal >= 40 ? "Moderate" : "Safe"}
                </span>
                <div className="text-[9px] text-amber-200 mt-0.5 font-medium truncate max-w-[130px]">
                  {probeData.hazardLabel}
                </div>
              </div>
            </div>

            {/* Multi-hazard Breakdown */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "वर्षा" : "Rainfall"}</span>
                <span className="text-xs font-mono font-black text-cyan-700">{probeData.rainMm} mm</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "पवन" : "Wind"}</span>
                <span className="text-xs font-mono font-black text-emerald-700">{probeData.wind?.speed} km/h</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "तापमान" : "Temp"}</span>
                <span className="text-xs font-mono font-black text-[#031636]">{probeData.tempC}°C</span>
              </div>
            </div>
          </div>
        );
      }

      case "heatwave": {
        const displayTemp = tempUnit === "F" ? `${probeData.tempF}°F` : `${probeData.tempC}°C`;
        const displayFeels = tempUnit === "F" ? `${probeData.feelsLikeF}°F` : `${probeData.feelsLikeC}°C`;
        return (
          <div className="space-y-2.5">
            {/* Primary Heatwave Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "सतही तापमान" : "Surface Temperature"}
                  </div>
                  <div className="text-xl font-black font-mono text-rose-300">
                    {displayTemp}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  probeData.tempC >= 40 ? "bg-rose-500/30 text-rose-200 border border-rose-400/40" : "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${probeData.tempC >= 44 ? "bg-rose-500 animate-ping" : probeData.tempC >= 40 ? "bg-amber-500" : "bg-emerald-400"}`} />
                  {probeData.tempC >= 44 ? "Extreme Loo" : probeData.tempC >= 40 ? "Heatwave" : "Normal"}
                </span>
                <div className="text-[9px] text-slate-300 mt-0.5">
                  Feels like: <strong className="text-amber-300">{displayFeels}</strong>
                </div>
              </div>
            </div>

            {/* Heatwave Secondary Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "आर्द्रता" : "Humidity"}</span>
                <span className="text-xs font-mono font-black text-blue-700">{probeData.humidity}%</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "ओसांक" : "Dew Point"}</span>
                <span className="text-xs font-mono font-black text-cyan-700">{probeData.dewPointC}°C</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "लू जोखिम" : "Heat Risk"}</span>
                <span className={`text-[11px] font-bold flex items-center justify-center gap-1 ${probeData.tempC >= 40 ? "text-rose-600" : "text-emerald-700"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${probeData.tempC >= 40 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                  {probeData.tempC >= 40 ? "Severe Loo" : "Safe"}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "humidity": {
        return (
          <div className="space-y-2.5">
            {/* Primary Humidity Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Droplets className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "सापेक्षिक आर्द्रता" : "Relative Humidity"}
                  </div>
                  <div className="text-xl font-black font-mono text-cyan-300">
                    {probeData.humidity} <span className="text-xs font-semibold text-cyan-400">%</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[10px] font-bold">
                  <Droplets className="w-3 h-3 text-cyan-300" />
                  {probeData.comfortIndex}
                </span>
                <div className="text-[9px] text-slate-300 mt-0.5">
                  Dew Point: <strong className="text-cyan-200">{probeData.dewPointC}°C</strong>
                </div>
              </div>
            </div>

            {/* Humidity Secondary Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "ओसांक बिंदु" : "Dew Point"}</span>
                <span className="text-xs font-mono font-black text-cyan-700">{probeData.dewPointC}°C</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "तापमान" : "Temp"}</span>
                <span className="text-xs font-mono font-black text-[#031636]">{probeData.tempC}°C</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "उमस स्तर" : "Comfort"}</span>
                <span className={`text-[11px] font-bold ${probeData.humidity >= 80 ? "text-blue-700" : "text-emerald-700"}`}>
                  {probeData.humidity >= 80 ? "Saturated" : "Comfortable"}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "cyclone": {
        return (
          <div className="space-y-2.5">
            {/* Primary Cyclone Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Tornado className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "वायुमंडलीय दबाव" : "Barometric Pressure"}
                  </div>
                  <div className="text-xl font-black font-mono text-rose-300">
                    {probeData.pressureHpa} <span className="text-xs font-semibold text-rose-400">hPa</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  probeData.pressureHpa <= 990 ? "bg-rose-500/30 text-rose-200 border border-rose-400/40" : "bg-blue-500/30 text-cyan-200 border border-blue-400/40"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${probeData.pressureHpa <= 990 ? "bg-rose-400 animate-ping" : "bg-cyan-400"}`} />
                  {probeData.pressureHpa <= 990 ? "Cyclone Eye" : probeData.pressureHpa <= 1000 ? "Low Pressure" : "Normal"}
                </span>
                <div className="text-[9px] text-slate-300 mt-0.5">
                  Eye Dist: <strong className="text-rose-300">{probeData.distToCycloneCenter} km</strong>
                </div>
              </div>
            </div>

            {/* Cyclone Secondary Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "तूफान दूरी" : "Eye Distance"}</span>
                <span className="text-xs font-mono font-black text-rose-700">{probeData.distToCycloneCenter} km</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "पवन गति" : "Inflow Wind"}</span>
                <span className="text-xs font-mono font-black text-emerald-700">{probeData.wind?.speed} km/h</span>
              </div>
              <div className="bg-[#fbf8fc] neo-pressed-sm p-2 rounded-xl border border-slate-200/50">
                <span className="text-[9px] text-[#575f6a] font-bold block">{isHindi ? "स्थिति" : "Depression"}</span>
                <span className={`text-[11px] font-bold ${probeData.pressureHpa <= 995 ? "text-rose-600" : "text-emerald-700"}`}>
                  {probeData.pressureHpa <= 995 ? "Deep Low" : "Standard"}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "air_quality": {
        return (
          <div className="space-y-2.5">
            {/* Primary AQI Hero */}
            <div className="flex items-center justify-between bg-[#1a2b4c] text-white p-3 rounded-2xl shadow-xs border border-[#1a2b4c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    {isHindi ? "राष्ट्रीय वायु गुणवत्ता" : "Air Quality Index (AQI)"}
                  </div>
                  <div className="text-xl font-black font-mono" style={{ color: probeData.aqiColor }}>
                    {probeData.aqiVal} <span className="text-xs font-semibold text-slate-300">AQI</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${probeData.aqiColor}35`,
                    borderColor: `${probeData.aqiColor}70`,
                    color: probeData.aqiColor
                  }}
                >
                  {probeData.aqiCategory}
                </span>
                <div className="text-[9px] text-slate-300 mt-0.5">
                  PM2.5 Est: <strong className="text-purple-300">{probeData.pm25Estimate} µg/m³</strong>
                </div>
              </div>
            </div>

            {/* Health Advisory Text */}
            <div className="bg-[#fbf8fc] neo-pressed-sm p-2.5 rounded-xl border border-slate-200/60 text-[10px] text-[#575f6a] leading-relaxed">
              <span className="font-bold text-purple-800 block mb-0.5">
                {isHindi ? "स्वास्थ्य परामर्श (Health Advisory):" : "Health Advisory:"}
              </span>
              {probeData.healthAdvisory}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      id="weather-inspector-card"
      className="absolute top-14 sm:top-14 left-3 right-3 sm:left-auto sm:right-3 sm:w-84 max-h-[calc(100vh-190px)] overflow-y-auto z-40 pointer-events-auto bg-[#fbf8fc] neo-raised p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xl text-[#031636] animate-in fade-in zoom-in-95 duration-200 scrollbar-none"
    >
      {/* Card Header: Location Name & Lat/Lng */}
      <div className="flex items-start justify-between gap-2 pb-2 mb-2.5 border-b border-slate-200/60">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
            <h4 className="font-bold text-xs text-[#031636] truncate">
              {probeData.cityName}
            </h4>
            {probeData.stateName && probeData.stateName !== "India" && (
              <span className="text-[10px] text-[#575f6a] truncate">
                • {probeData.stateName}
              </span>
            )}
          </div>
          {probeData.formattedAddress && (
            <p className="text-[9.5px] text-[#575f6a] truncate max-w-[220px] sm:max-w-[260px] mt-0.5 font-medium" title={probeData.formattedAddress}>
              {probeData.formattedAddress}
            </p>
          )}
          <p className="text-[9px] font-mono text-blue-700 mt-0.5 font-semibold">
            {probeData.lat}°N, {probeData.lng}°E • {isHindi ? "सटीक मौसम स्कैन" : "Exact Meteorological Probe"}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onZoomTo && (
            <button
              onClick={() => onZoomTo(probeData.lat, probeData.lng)}
              className="p-1.5 rounded-xl neo-raised-sm bg-[#fbf8fc] hover:neo-pressed-sm text-blue-700 border border-white/60 text-xs transition-all cursor-pointer"
              title="Zoom to location"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl neo-raised-sm bg-[#fbf8fc] hover:neo-pressed-sm text-[#575f6a] hover:text-[#031636] border border-white/60 text-xs transition-all cursor-pointer"
            title="Close Inspector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer-Specific Body */}
      {renderLayerSpecificContent()}

      {/* Set as Exact Pin Point Location Action */}
      {onSetAsPinPointLocation && (
        <button
          id="set-exact-pinpoint-action-btn"
          type="button"
          onClick={() => onSetAsPinPointLocation(probeData)}
          className="w-full mt-3 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
            pin_drop
          </span>
          <span>
            {isHindi ? "सटीक पिन स्थान के रूप में सेट करें" : "Set as Exact Pin Point Location"}
          </span>
        </button>
      )}

      {/* Footer Info & Quick Switch Hint */}
      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9.5px] text-[#575f6a]">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {isHindi ? "सक्रिय स्कैन: " : "Active Scan: "}
          <strong className="text-[#031636] capitalize font-bold">{activeLayer.replace("_", " ")}</strong>
        </span>
        <span className="text-[#575f6a] font-medium">
          {isHindi ? "मानचित्र पर कहीं भी टैप करें" : "Tap map to probe"}
        </span>
      </div>
    </div>
  );
};
