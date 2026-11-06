import React, { useState } from "react";
import { WifiOff, Database, Download, CheckCircle2, RefreshCw, Smartphone } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { usePWAInstall } from "../hooks/usePWAInstall";

export function OfflineIndicator({ weather, language = "hi", onRetry }) {
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isHi = language === "hi" || language === "hindi";

  const cachedAtFormatted = weather?.cached_at
    ? new Date(weather.cached_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <>
      {/* OFFLINE STATUS BANNER */}
      {!isOnline && (
        <div className="bg-amber-500/95 text-slate-950 backdrop-blur-md border-b border-amber-600/40 px-3 py-2 text-xs font-semibold shadow-md flex flex-wrap items-center justify-between gap-2 z-40 relative">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
            <WifiOff className="w-4 h-4 text-slate-900 shrink-0" />
            <span>
              {isHi
                ? "ग्रामीण ऑफ़लाइन मोड (Offline Mode) — कैश्ड मौसम डेटा उपयोग में है"
                : "Rural Offline Mode — Using cached weather data"}
            </span>
            {cachedAtFormatted && (
              <span className="bg-amber-900/15 px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-950 flex items-center gap-1">
                <Database className="w-3 h-3" />
                {isHi ? `सहेजा गया: ${cachedAtFormatted}` : `Cached: ${cachedAtFormatted}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-2.5 py-1 rounded-lg bg-amber-900/20 hover:bg-amber-900/30 text-amber-950 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isHi ? "पुनः प्रयास करें" : "Retry Signal"}</span>
              </button>
            )}

            {isInstallable && (
              <button
                onClick={install}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 hover:bg-slate-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>{isHi ? "ऐप इंस्टॉल करें (Offline App)" : "Install Offline App"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ONLINE PWA INSTALL PROMPT IN FOOTER/NAV BAR IF INSTALLABLE */}
      {isOnline && isInstallable && !isInstalled && (
        <div className="fixed bottom-20 left-4 z-40 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/40 shadow-xl backdrop-blur-md animate-bounce">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">
            {isHi ? "खेती ऐप इंस्टॉल करें (ऑफलाइन काम करेगा)" : "Install Farm App (Works Offline)"}
          </span>
          <button
            onClick={install}
            className="ml-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black cursor-pointer shadow transition-all"
          >
            {isHi ? "इंस्टॉल" : "Install"}
          </button>
        </div>
      )}

      {/* iOS INSTALLATION INSTRUCTION MODAL */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-900 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>{isHi ? "iPhone / iPad पर ऐप इंस्टॉल करें" : "Install on iPhone / iPad"}</span>
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {isHi ? (
                <>
                  1. सफारी (Safari) ब्राउज़र टूलबार में <strong>Share (शेयर)</strong> बटन दबाएं।<br />
                  2. नीचे स्क्रॉल करें और <strong>Add to Home Screen (होम स्क्रीन में जोड़ें)</strong> पर टैप करें।
                </>
              ) : (
                <>
                  1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </>
              )}
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
            >
              {isHi ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
