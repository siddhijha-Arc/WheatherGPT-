import { useState } from "react";
import { Sparkles, Mic, ChevronDown, ChevronUp, AudioLines } from "lucide-react";
export const AssistantCard = ({
  onAskPrompt,
  onStartVoice,
  isListening = false
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const samplePrompts = [
    { text: "Will it rain in my area today?", emoji: "\u{1F327}\uFE0F" },
    { text: "Best time to irrigate my crops?", emoji: "\u{1F33E}" },
    { text: "Any cyclone alerts nearby?", emoji: "\u{1F32A}\uFE0F" },
    { text: "Farming tips for this season", emoji: "\u{1F69C}" }
  ];
  return <div id="assistant-card-wrapper" className="w-full pointer-events-auto transition-all">
      {isMinimized ? <button
    id="assistant-card-minimized-btn"
    onClick={() => setIsMinimized(false)}
    className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 px-4 py-2.5 flex items-center justify-between text-slate-800 hover:text-blue-600 transition-all cursor-pointer active:scale-[0.99]"
  >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold">How can I help you today?</span>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400" />
        </button> : <div
    id="assistant-card"
    className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100/90 p-4 sm:p-5 transition-all"
  >
          {
    /* Header Row */
  }
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  How can I help you today?
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                I can help you with weather updates, alerts, farming advice, and safety tips.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {
    /* Sparkle Icon Container */
  }
              <div className="w-10 h-10 rounded-full bg-indigo-50/90 border border-indigo-100/80 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>

              {
    /* Minimize Collapse Button */
  }
              <button
    id="assistant-card-collapse-btn"
    onClick={() => setIsMinimized(true)}
    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
    title="Minimize Assistant"
  >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {
    /* "Try asking..." Section */
  }
          <div className="mb-3.5">
            <span className="text-xs font-semibold text-slate-700 block mb-2">Try asking...</span>
            <div className="grid grid-cols-2 gap-2">
              {samplePrompts.map((prompt, index) => <button
    key={index}
    id={`try-prompt-btn-${index}`}
    onClick={() => onAskPrompt(prompt.text)}
    className="bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-300/80 text-slate-700 hover:text-blue-700 rounded-xl px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 text-left transition-all active:scale-95 cursor-pointer shadow-2xs"
  >
                  <span className="shrink-0 text-sm">{prompt.emoji}</span>
                  <span className="truncate">{prompt.text}</span>
                </button>)}
            </div>
          </div>

          {
    /* Tap to speak (Farmer Mode) Large Voice Bar */
  }
          <div
    id="tap-to-speak-bar"
    onClick={onStartVoice}
    className={`w-full bg-slate-50/90 hover:bg-slate-100/80 border rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer shadow-2xs active:scale-[0.99] transition-all ${isListening ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400/30" : "border-slate-200/80"}`}
  >
            {
    /* Mic Circle */
  }
            <div className="w-10 h-10 shrink-0 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700">
              <Mic className={`w-5 h-5 ${isListening ? "text-emerald-600 animate-pulse" : "text-slate-700"}`} />
            </div>

            {
    /* Center Text */
  }
            <div className="flex-1 text-center min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                {isListening ? "Listening now... Speak in Hindi or English" : "Tap to speak (Farmer Mode)"}
              </div>
              <div className="text-[11px] text-slate-400 font-normal truncate">
                Hindi / English / Hinglish supported
              </div>
            </div>

            {
    /* Sound Wave Circle */
  }
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-md transition-all ${isListening ? "bg-emerald-500 animate-bounce" : "bg-emerald-600"}`}>
              <AudioLines className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>}
    </div>;
};
