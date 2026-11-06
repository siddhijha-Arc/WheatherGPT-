import { useState } from "react";
import { Terminal, Shield, CheckCircle2, AlertCircle, RefreshCw, Cpu, Database } from "lucide-react";

export function PruneDebugModal({ isOpen, onClose, language }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTestPrune = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prune/test");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to connect to Prune gateway");
      }
      setResult(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isHi = language === "hi";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 text-slate-100 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">
                {isHi ? "प्रून (Prune) एआई गेटवे इंस्पेक्टर" : "Prune LLM Gateway Inspector"}
              </h2>
              <p className="text-xs text-slate-400">
                {isHi ? "एआई अनुरोध, हेडर और कैश स्थिति की जाँच करें" : "Verify gateway requests, headers, and cache status"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            {isHi ? "बंद करें" : "Close"}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                {isHi ? "एंडपॉइंट: https://api.withprune.com/v1" : "Base URL: https://api.withprune.com/v1"}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono">
                PRUNE_API_KEY Active
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isHi
                ? "यह परीक्षण सीधे Prune AI गेटवे को एक लाइव अनुरोध भेजकर HTTP 200 स्थिति, X-Prune-Provider, X-Prune-Cache-Hit और prune_metadata की जाँच करता है।"
                : "This sends a live test request through the Prune gateway to verify HTTP status, provider headers, cache hit status, and response metadata."}
            </p>
            <button
              onClick={handleTestPrune}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {isHi ? "अनुरोध भेजा जा रहा है..." : "Sending Request..."}
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  {isHi ? "प्रून परीक्षण अनुरोध भेजें (Send Test Request)" : "Send Prune Test Request"}
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <span className="font-bold block mb-1">Request Error</span>
                {error}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-1">HTTP Status</span>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {result.status} OK
                  </span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-1">Latency</span>
                  <span className="text-sm font-bold text-indigo-300">{result.durationMs} ms</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-1">X-Prune-Provider</span>
                  <span className="text-xs font-mono font-bold text-amber-300 truncate block">
                    {result.headers?.provider || "gemini"}
                  </span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-1">X-Prune-Cache-Hit</span>
                  <span className={`text-xs font-mono font-bold ${result.headers?.cacheHit === "true" ? "text-emerald-400" : "text-slate-300"}`}>
                    {result.headers?.cacheHit || "false"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                  <span>Response JSON & Prune Metadata</span>
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <pre className="text-emerald-300 overflow-x-auto max-h-60 p-2 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700 text-right text-xs text-slate-400">
          ARCode WeatherGPT India • Prune Gateway Integration Active
        </div>
      </div>
    </div>
  );
}
