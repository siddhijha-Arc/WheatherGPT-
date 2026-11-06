import { useState, useEffect } from "react";
import {
  Calendar,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  Info,
  ChevronRight,
  Sun,
  CloudLightning,
  CloudSun
} from "lucide-react";

export const Past15DaysHistoryCard = ({
  location = { city: "New Delhi", lat: 28.6139, lng: 77.209 },
  language = "en",
  tempUnit = "C",
  isFullView = false,
  onOpenFullView = null
}) => {
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewMetric, setViewMetric] = useState("rain"); // "rain" | "temp" | "list"
  const [isPlaying, setIsPlaying] = useState(false);
  const isHi = language === "hi";

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const lat = location?.lat || 28.6139;
      const lng = location?.lng || 77.209;
      const city = location?.city || "New Delhi";
      const res = await fetch(`/api/history?lat=${lat}&lng=${lng}&city=${encodeURIComponent(city)}&past_days=15`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && Array.isArray(data.history) && data.history.length > 0) {
          setHistoryData(data.history);
          setSummary(data.summary || null);
          setSelectedIndex(data.history.length - 1); // Default to today or most recent
        }
      }
    } catch (err) {
      console.warn("Failed to fetch 15-day history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [location?.lat, location?.lng, location?.city]);

  // Sequential Playback loop
  useEffect(() => {
    let timer;
    if (isPlaying && historyData.length > 0) {
      timer = setInterval(() => {
        setSelectedIndex((prev) => ((prev ?? 0) + 1) % historyData.length);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, historyData.length]);

  const selectedDay = (selectedIndex !== null && historyData[selectedIndex])
    ? historyData[selectedIndex]
    : historyData[historyData.length - 1] || null;

  // Max rainfall value for scaling chart bars
  const maxRainMm = Math.max(...historyData.map((d) => d.rainfallMm || 0), 10);
  const maxRecordedTemp = Math.max(...historyData.map((d) => d.maxTemp || 30), 35);
  const minRecordedTemp = Math.min(...historyData.map((d) => d.minTemp || 20), 18);

  const cityName = location?.city || (isHi ? "आपका क्षेत्र" : "Your Area");

  return (
    <section
      id="home-past-15-days-history-section"
      className="neo-raised rounded-3xl p-4 sm:p-6 bg-[#fbf8fc] flex flex-col gap-4 border border-slate-200/80 shadow-xs"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-[#031636] tracking-tight">
                {isHi ? `15-दिवसीय मौसम इतिहास (${cityName})` : `15-Day Observed Weather History (${cityName})`}
              </h3>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/80 text-blue-800">
                {isHi ? "उपग्रह व रडार रिकॉर्ड" : "IMD & Satellite Record"}
              </span>
            </div>
            <p className="text-xs text-[#575f6a] mt-0.5">
              {isHi
                ? "पिछले 15 दिनों में दर्ज वास्तविक वर्षा, तापमान एवं मौसमी बदलाव"
                : "Recorded daily precipitation, high/low temperature & atmospheric trends"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Play/Pause Sequence */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={historyData.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a2b4c] text-white text-xs font-bold hover:bg-[#253d6b] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title={isPlaying ? "Pause sequence" : "Play day-by-day sequence"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{isHi ? "रोकें" : "Pause"}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isHi ? "चलाएँ" : "Play Timeline"}</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-[#575f6a] hover:text-[#031636] transition-colors cursor-pointer shadow-2xs"
            title={isHi ? "ताज़ा करें" : "Refresh 15-day records"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          {/* Full View Button if callback provided and not already full */}
          {!isFullView && onOpenFullView && (
            <button
              type="button"
              onClick={onOpenFullView}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>{isHi ? "विस्तृत इतिहास" : "Detailed View"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading && historyData.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#575f6a] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="font-semibold">
            {isHi ? "पिछले 15 दिनों का मौसम रिकॉर्ड प्राप्त किया जा रहा है..." : "Fetching 15-day verified archival telemetry..."}
          </span>
        </div>
      ) : historyData.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#575f6a]">
          {isHi ? "इस स्थान के लिए मौसम इतिहास उपलब्ध नहीं है।" : "Weather history data not available for this location."}
        </div>
      ) : (
        <>
          {/* 1. Summary Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Total Rainfall */}
            <div className="neo-pressed-sm rounded-2xl p-3 bg-white flex flex-col justify-between border border-slate-200/60">
              <div className="flex items-center justify-between text-[#575f6a] text-[11px] font-semibold">
                <span>{isHi ? "कुल वर्षा (15 दिन)" : "Total Rainfall (15d)"}</span>
                <CloudRain className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-black text-[#031636]">
                  {summary?.totalRainfallMm ?? 0}
                </span>
                <span className="text-xs font-bold text-[#575f6a] ml-1">mm</span>
              </div>
              <span className="text-[10px] text-blue-600 font-semibold mt-0.5">
                {summary?.rainyDaysCount ?? 0} {isHi ? "दिन वर्षा दर्ज" : "rainy days"}
              </span>
            </div>

            {/* Peak Max Temperature */}
            <div className="neo-pressed-sm rounded-2xl p-3 bg-white flex flex-col justify-between border border-slate-200/60">
              <div className="flex items-center justify-between text-[#575f6a] text-[11px] font-semibold">
                <span>{isHi ? "अधिकतम तापमान" : "Peak Recorded Temp"}</span>
                <Thermometer className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-black text-rose-600">
                  {summary?.maxTempObserved ?? maxRecordedTemp}
                </span>
                <span className="text-xs font-bold text-[#575f6a] ml-0.5">°{tempUnit}</span>
              </div>
              <span className="text-[10px] text-[#575f6a] mt-0.5">
                {isHi ? "औसत उच्च" : "Avg high"}: {summary?.avgMaxTemp ?? 32}°{tempUnit}
              </span>
            </div>

            {/* Lowest Min Temperature */}
            <div className="neo-pressed-sm rounded-2xl p-3 bg-white flex flex-col justify-between border border-slate-200/60">
              <div className="flex items-center justify-between text-[#575f6a] text-[11px] font-semibold">
                <span>{isHi ? "न्यूनतम तापमान" : "Lowest Night Temp"}</span>
                <Thermometer className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-black text-cyan-700">
                  {summary?.minTempObserved ?? minRecordedTemp}
                </span>
                <span className="text-xs font-bold text-[#575f6a] ml-0.5">°{tempUnit}</span>
              </div>
              <span className="text-[10px] text-[#575f6a] mt-0.5">
                {isHi ? "औसत न्यूनतम" : "Avg low"}: {summary?.avgMinTemp ?? 24}°{tempUnit}
              </span>
            </div>

            {/* Rainiest Day */}
            <div className="neo-pressed-sm rounded-2xl p-3 bg-white flex flex-col justify-between border border-slate-200/60">
              <div className="flex items-center justify-between text-[#575f6a] text-[11px] font-semibold">
                <span>{isHi ? "सर्वाधिक वर्षा दिवस" : "Highest Rain Day"}</span>
                <Droplets className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-black text-indigo-700">
                  {summary?.rainiestDay?.rainfallMm ?? 0}
                </span>
                <span className="text-xs font-bold text-[#575f6a] ml-1">mm</span>
              </div>
              <span className="text-[10px] text-[#575f6a] truncate mt-0.5">
                {summary?.rainiestDay?.date
                  ? new Date(summary.rainiestDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : isHi ? "कोई वर्षा नहीं" : "None recorded"}
              </span>
            </div>
          </div>

          {/* 2. Metric Mode Selector Tabs */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center bg-[#efedf0] rounded-xl p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMetric("rain")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMetric === "rain"
                    ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                    : "text-[#575f6a] hover:text-[#031636]"
                }`}
              >
                {isHi ? "🌧️ वर्षा (Rain mm)" : "🌧️ Rainfall (mm)"}
              </button>
              <button
                type="button"
                onClick={() => setViewMetric("temp")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMetric === "temp"
                    ? "bg-white text-amber-700 shadow-2xs font-extrabold"
                    : "text-[#575f6a] hover:text-[#031636]"
                }`}
              >
                {isHi ? "🌡️ तापमान (Temp °C)" : "🌡️ Temperature (°C)"}
              </button>
              <button
                type="button"
                onClick={() => setViewMetric("list")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMetric === "list"
                    ? "bg-white text-indigo-700 shadow-2xs font-extrabold"
                    : "text-[#575f6a] hover:text-[#031636]"
                }`}
              >
                {isHi ? "📋 दैनिक सूची (Day List)" : "📋 Daily List"}
              </button>
            </div>

            <span className="text-[11px] text-[#575f6a] font-medium hidden sm:inline">
              {isHi ? "किसी भी दिन पर टैप करके विवरण देखें" : "Click any day bar to inspect records"}
            </span>
          </div>

          {/* 3. Interactive Visual Charts */}
          {viewMetric === "rain" && (
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#575f6a] pb-1">
                <span className="font-bold text-[#031636]">
                  {isHi ? "दैनिक वर्षा चार्ट (गत 15 दिन + आज)" : "Daily Observed Rainfall Chart (Past 15 Days + Today)"}
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">
                  {isHi ? "अधिकतम:" : "Peak:"} {summary?.rainiestDay?.rainfallMm ?? maxRainMm} mm
                </span>
              </div>

              {/* Rain Bar Chart */}
              <div className="h-44 sm:h-48 w-full flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 overflow-x-auto no-scrollbar">
                {historyData.map((day, idx) => {
                  const isSelected = selectedIndex === idx;
                  const rainMm = day.rainfallMm || 0;
                  const pct = Math.max((rainMm / (maxRainMm || 1)) * 100, rainMm > 0 ? 8 : 3);
                  const isWet = rainMm > 0;
                  const isHeavy = rainMm >= 15;

                  return (
                    <button
                      key={day.date || idx}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setSelectedIndex(idx);
                      }}
                      className={`flex-1 min-w-[28px] sm:min-w-[34px] flex flex-col items-center h-full justify-end group transition-all cursor-pointer relative ${
                        isSelected ? "scale-105" : "hover:scale-102"
                      }`}
                    >
                      {/* Exact mm value label on top */}
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold mb-1 transition-colors ${
                          isSelected
                            ? "text-blue-700 font-black scale-110"
                            : isWet
                            ? "text-blue-600"
                            : "text-slate-300 group-hover:text-slate-500"
                        }`}
                      >
                        {rainMm > 0 ? rainMm : "0"}
                      </span>

                      {/* Bar Pillar */}
                      <div className="w-full bg-[#f1eff4] rounded-t-lg h-32 flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${pct}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isSelected
                              ? "bg-blue-700 ring-2 ring-blue-500"
                              : isHeavy
                              ? "bg-indigo-600"
                              : isWet
                              ? "bg-blue-500"
                              : "bg-slate-300"
                          }`}
                        />
                      </div>

                      {/* Day Label Below */}
                      <span
                        className={`text-[10px] sm:text-[11px] mt-1.5 font-bold transition-colors truncate max-w-full ${
                          isSelected
                            ? "text-blue-700 underline"
                            : day.isToday
                            ? "text-rose-600 font-extrabold"
                            : "text-[#575f6a]"
                        }`}
                      >
                        {day.isToday ? (isHi ? "आज" : "Today") : day.dayLabel.split(",")[0]}
                      </span>
                      <span className="text-[9px] text-[#575f6a]/70 font-medium">
                        {day.date.slice(8, 10)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {viewMetric === "temp" && (
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#575f6a] pb-1">
                <span className="font-bold text-[#031636]">
                  {isHi ? "दैनिक अधिकतम / न्यूनतम तापमान सीमा" : "Daily High / Low Temperature Range"}
                </span>
                <span className="text-[11px] text-amber-600 font-semibold">
                  {summary?.minTempObserved ?? 20}° - {summary?.maxTempObserved ?? 35}°{tempUnit}
                </span>
              </div>

              {/* Temperature Bars */}
              <div className="h-44 sm:h-48 w-full flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 overflow-x-auto no-scrollbar">
                {historyData.map((day, idx) => {
                  const isSelected = selectedIndex === idx;
                  const range = (maxRecordedTemp - minRecordedTemp) || 15;
                  const topOffsetPct = ((maxRecordedTemp - day.maxTemp) / range) * 100;
                  const heightPct = Math.max(((day.maxTemp - day.minTemp) / range) * 100, 16);

                  return (
                    <button
                      key={day.date || idx}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setSelectedIndex(idx);
                      }}
                      className={`flex-1 min-w-[28px] sm:min-w-[34px] flex flex-col items-center h-full justify-end group transition-all cursor-pointer relative ${
                        isSelected ? "scale-105" : "hover:scale-102"
                      }`}
                    >
                      {/* Max temp label */}
                      <span className={`text-[9px] sm:text-[10px] font-bold mb-1 ${isSelected ? "text-rose-600 font-black" : "text-[#031636]"}`}>
                        {day.maxTemp}°
                      </span>

                      {/* Temperature Range Bar Container */}
                      <div className="w-full bg-[#f1eff4] rounded-t-lg h-32 relative overflow-hidden p-0.5 flex flex-col justify-end">
                        <div
                          style={{
                            height: `${heightPct}%`,
                            marginBottom: `${Math.max(0, ((day.minTemp - minRecordedTemp) / range) * 100)}%`
                          }}
                          className={`w-full rounded-md transition-all duration-300 ${
                            isSelected
                              ? "bg-gradient-to-t from-cyan-500 via-amber-500 to-rose-500 ring-2 ring-amber-500"
                              : "bg-gradient-to-t from-cyan-400 to-amber-500"
                          }`}
                        />
                      </div>

                      {/* Min temp label */}
                      <span className="text-[8px] sm:text-[9px] text-cyan-700 font-bold mt-0.5">
                        {day.minTemp}°
                      </span>

                      {/* Day Label Below */}
                      <span
                        className={`text-[10px] sm:text-[11px] mt-0.5 font-bold transition-colors truncate max-w-full ${
                          isSelected
                            ? "text-blue-700 underline"
                            : day.isToday
                            ? "text-rose-600 font-extrabold"
                            : "text-[#575f6a]"
                        }`}
                      >
                        {day.isToday ? (isHi ? "आज" : "Today") : day.dayLabel.split(",")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {viewMetric === "list" && (
            <div className="rounded-2xl bg-white border border-slate-200/70 overflow-hidden shadow-2xs max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
              {historyData.slice().reverse().map((day, rIdx) => {
                const actualIdx = historyData.length - 1 - rIdx;
                const isSelected = selectedIndex === actualIdx;
                return (
                  <div
                    key={day.date || rIdx}
                    onClick={() => {
                      setIsPlaying(false);
                      setSelectedIndex(actualIdx);
                    }}
                    className={`p-3 flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50/80 font-bold text-blue-900" : "text-[#031636]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold text-[11px]">
                        {day.date.slice(8, 10)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold truncate text-[#031636]">
                          {day.formattedDate || day.dayLabel} {day.isToday && <span className="text-rose-600 font-extrabold ml-1">({isHi ? "आज" : "Today"})</span>}
                        </div>
                        <div className="text-[11px] text-[#575f6a] truncate">{day.condition}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <div className="font-bold text-blue-700 flex items-center justify-end gap-1">
                          <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                          <span>{day.rainfallMm} mm</span>
                        </div>
                        <div className="text-[10px] text-[#575f6a]">
                          {day.rainfallMm > 0 ? (isHi ? "वर्षा दर्ज" : "Recorded") : (isHi ? "शुष्क" : "Dry")}
                        </div>
                      </div>

                      <div className="min-w-[65px]">
                        <div className="font-bold text-[#031636]">
                          {day.maxTemp}° / {day.minTemp}°
                        </div>
                        <div className="text-[10px] text-[#575f6a]">
                          {day.windSpeed} km/h
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Selected Day Deep-Dive Inspector Card */}
          {selectedDay && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border border-blue-200/80 shadow-xs space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      {isHi ? "चयनित दिवस विवरण" : "Selected Day Record"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {selectedDay.isToday ? (isHi ? "आज का दिन" : "Today") : selectedDay.relativeLabel}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#031636] mt-0.5">
                    {selectedDay.formattedDate || selectedDay.dayLabel}
                  </h4>
                  <p className="text-xs text-[#575f6a] flex items-center gap-1.5 mt-0.5 font-medium">
                    <span>{selectedDay.condition}</span>
                    <span>•</span>
                    <span>{isHi ? "वायुमंडलीय रडार अवलोकन" : "Atmospheric Radar Observation"}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#575f6a] block">{isHi ? "दर्ज वर्षा" : "Rainfall"}</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-700">
                    {selectedDay.rainfallMm} <span className="text-xs font-normal text-[#575f6a]">mm</span>
                  </span>
                </div>
              </div>

              {/* Day Metric Pills */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#575f6a] block leading-none">{isHi ? "उच्चतम" : "Max Temp"}</span>
                    <span className="text-xs sm:text-sm font-bold text-[#031636]">{selectedDay.maxTemp}°{tempUnit}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-cyan-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#575f6a] block leading-none">{isHi ? "न्यूनतम" : "Min Temp"}</span>
                    <span className="text-xs sm:text-sm font-bold text-[#031636]">{selectedDay.minTemp}°{tempUnit}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#575f6a] block leading-none">{isHi ? "अधिकतम हवा" : "Peak Wind"}</span>
                    <span className="text-xs sm:text-sm font-bold text-[#031636]">{selectedDay.windSpeed} km/h</span>
                  </div>
                </div>
              </div>

              {/* Agricultural & Field Assessment */}
              <div className="p-3 rounded-xl bg-white/90 border border-blue-100 text-xs text-[#575f6a] leading-relaxed">
                <span className="font-bold text-[#031636] block mb-0.5">
                  {isHi ? "🌾 कृषि व क्षेत्रीय विश्लेषण:" : "🌾 Agricultural & Regional Analysis:"}
                </span>
                {selectedDay.rainfallMm > 15 ? (
                  isHi
                    ? `इस दिन ${selectedDay.rainfallMm} मिमी की भारी वर्षा दर्ज हुई थी, जिससे खेतों में पर्याप्त नमी जमा हुई और भूजल स्तर में वृद्धि हुई।`
                    : `Intense precipitation of ${selectedDay.rainfallMm} mm observed on this day. Root-zone moisture was saturated.`
                ) : selectedDay.rainfallMm > 2 ? (
                  isHi
                    ? `इस दिन ${selectedDay.rainfallMm} मिमी की मध्यम वर्षा हुई थी। फसलों एवं सतही नमी के लिए अनुकूल दिन रहा।`
                    : `Moderate rainfall of ${selectedDay.rainfallMm} mm was recorded. Favorable for crop maintenance.`
                ) : (
                  isHi
                    ? `यह दिन मुख्यतः शुष्क रहा (वर्षा: ${selectedDay.rainfallMm} मिमी)। अधिकतम तापमान ${selectedDay.maxTemp}°C तक पहुंचा था।`
                    : `Mainly dry day with recorded rainfall of ${selectedDay.rainfallMm} mm. Peak daytime temperature touched ${selectedDay.maxTemp}°C.`
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
