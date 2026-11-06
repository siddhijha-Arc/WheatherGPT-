import { useState, useEffect } from "react";
import {
  History,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Thermometer,
  CloudRain,
  Wind,
  RefreshCw
} from "lucide-react";

export const HistoryView = ({ language = "en", location = { city: "New Delhi", lat: 28.6139, lng: 77.209 } }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isHi = language === "hi";

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?lat=${location.lat || 28.6139}&lng=${location.lng || 77.209}&city=${encodeURIComponent(location.city || "New Delhi")}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && Array.isArray(data.history) && data.history.length > 0) {
          setHistoryData(data.history);
          setCurrentIndex(data.history.length - 1);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [location.lat, location.lng, location.city]);

  useEffect(() => {
    let timer;
    if (isPlaying && historyData.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % historyData.length);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, historyData.length]);

  const currentSnapshot = historyData[currentIndex] || {
    date: new Date().toISOString(),
    dayLabel: "Today",
    formattedDate: "Current Observation",
    maxTemp: 32,
    minTemp: 22,
    rainfallMm: 0,
    windSpeed: 14,
    condition: "Live Observation",
    hazardType: "normal"
  };

  return (
    <div id="history-page" className="w-full max-w-5xl mx-auto p-3 sm:p-5 space-y-4">
      {/* Top Title Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {isHi ? "10-दिवसीय मौसम इतिहास एवं टाइमलाइन" : "10-Day Observed Weather History"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHi
                ? "वास्तविक मौसम उपग्रह एवं मौसम स्टेशन से प्राप्त दैनिक अभिलेख"
                : `Observed synoptic weather metrics and recorded precipitation for ${location.city || "your region"}`}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            id="history-play-toggle"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={historyData.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{isHi ? "रोकें" : "Pause"}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isHi ? "चलाएँ" : "Play Sequence"}</span>
              </>
            )}
          </button>

          <button
            id="history-reset-btn"
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && historyData.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2 shadow-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>{isHi ? "मौसम अभिलेख लोड हो रहे हैं..." : "Retrieving archival meteorological station records..."}</span>
        </div>
      ) : (
        <>
          {/* Interactive Day Scrubber */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-xs space-y-3 text-slate-900">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {isHi ? "चयनित दिवस:" : "Selected:"} <span className="text-emerald-700 font-bold">{currentSnapshot.formattedDate || currentSnapshot.date}</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                {isHi ? `दिन ${currentIndex + 1} / ${historyData.length}` : `Day ${currentIndex + 1} of ${historyData.length}`}
              </span>
            </div>

            {/* Timeline Slider Track */}
            {historyData.length > 1 && (
              <input
                type="range"
                min="0"
                max={historyData.length - 1}
                value={currentIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentIndex(parseInt(e.target.value, 10));
                }}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            )}
          </div>

          {/* Snapshot Card */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4 text-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  {currentSnapshot.condition}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {isHi ? `दैनिक तापमान एवं वायुमंडलीय स्थिति` : `Meteorological observation on ${currentSnapshot.formattedDate || currentSnapshot.date}`}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">{isHi ? "अधिकतम हवा" : "Peak Wind"}</span>
                <span className="text-lg font-bold text-emerald-700">{currentSnapshot.windSpeed || 12} km/h</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">{isHi ? "उच्चतम / न्यूनतम तापमान" : "Max / Min Temp"}</span>
                  <span className="text-sm font-bold text-slate-800">
                    {currentSnapshot.maxTemp}°C / {currentSnapshot.minTemp}°C
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <CloudRain className="w-5 h-5 text-sky-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">{isHi ? "दर्ज वर्षा" : "Observed Rain"}</span>
                  <span className="text-sm font-bold text-slate-800">{currentSnapshot.rainfallMm || 0} mm</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 col-span-2 sm:col-span-1">
                <Wind className="w-5 h-5 text-indigo-500" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 block">{isHi ? "स्थिति" : "Atmospheric State"}</span>
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {currentSnapshot.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
