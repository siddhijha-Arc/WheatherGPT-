import {
  Sparkles,
  Mic,
  MicOff,
  Radio,
  Bell,
  Star,
  Home,
  Map as MapIcon,
  History,
  MoreHorizontal,
  AudioWaveform as WaveformIcon
} from "lucide-react";
import { translations } from "../lib/translations";
export const MergedBottomDock = ({
  currentTab,
  onTabSelect,
  location,
  weather,
  onAskAI,
  onStartVoice,
  isListening,
  onOpenFarmerRadio,
  onOpenAlerts,
  onOpenLocationModal,
  onOpenHistory,
  onOpenSettings,
  onOpenChat,
  alertCount = 3,
  language = "en"
}) => {
  const t = translations[language];
  const suggestedQuestions = [
    {
      icon: "\u{1F327}\uFE0F",
      label: "Will it rain in my area today?",
      query: `Will it rain in ${location.city} today?`
    },
    {
      icon: "\u{1F33E}",
      label: "Best time to irrigate my crops?",
      query: `Based on current weather, what is the best time for crop irrigation in ${location.city}?`
    },
    {
      icon: "\u{1F32A}\uFE0F",
      label: "Any cyclone alerts nearby?",
      query: `Are there any cyclone or storm alerts near ${location.city}?`
    },
    {
      icon: "\u{1F69C}",
      label: "Farming tips for this season",
      query: `What are the key seasonal farming and crop protection tips for ${location.city}?`
    }
  ];
  return <div
    id="unified-bottom-dock"
    className="w-full max-w-lg mx-auto px-3 pb-3 pointer-events-auto transition-all select-none space-y-2.5"
  >
      {
    /* 1. White AI Assistant Prompt Card (Exact Reference Image Layout) */
  }
      <div className="bg-white rounded-3xl shadow-xl p-4.5 sm:p-5 border border-slate-150 text-slate-800 space-y-3">
        {
    /* Header Row */
  }
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              How can I help you today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-snug">
              I can help you with weather updates, alerts, farming advice, and safety tips.
            </p>
          </div>
          <div className="w-9 h-9 shrink-0 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        </div>

        {
    /* "Try asking..." 2x2 Grid */
  }
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-700 block">
            Try asking...
          </span>
          <div className="grid grid-cols-2 gap-2">
            {suggestedQuestions.map((item, idx) => <button
    key={idx}
    onClick={() => onAskAI(item.query)}
    className="bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 text-left transition-all active:scale-98 cursor-pointer shadow-2xs flex items-center gap-2 truncate"
  >
                <span className="shrink-0 text-sm">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>)}
          </div>
        </div>

        {
    /* Voice Bar */
  }
        <div
    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-center justify-between shadow-2xs gap-3 cursor-pointer"
    onClick={onStartVoice}
  >
          {
    /* Left Mic Circle */
  }
          <button
    id="voice-mic-circle-btn"
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onStartVoice();
    }}
    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all shadow-xs border ${isListening ? "bg-rose-500 text-white border-rose-600 animate-pulse" : "bg-white text-slate-700 border-slate-200 hover:text-slate-900 active:scale-95"}`}
  >
            {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          {
    /* Center Text */
  }
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
              {isListening ? "Listening to your voice..." : "Tap to speak (Farmer Mode)"}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Hindi / English / Hinglish supported
            </div>
          </div>

          {
    /* Right Waveform Circle Button */
  }
          <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95">
            <WaveformIcon className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
          </div>
        </div>
      </div>

      {
    /* 2. Four Quick Action Cards in a Row */
  }
      <div className="grid grid-cols-4 gap-2">
        {
    /* Tile 1: Farmer Radio */
  }
        <button
    id="action-farmer-radio"
    onClick={onOpenFarmerRadio}
    className="bg-white hover:bg-slate-50 border border-slate-150 p-2.5 rounded-2xl shadow-sm text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between"
  >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <Radio className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 truncate">Farmer Radio</div>
            <div className="text-[9px] text-slate-400 truncate">Weather updates</div>
          </div>
        </button>

        {
    /* Tile 2: Voice Update */
  }
        <button
    id="action-voice-update"
    onClick={onStartVoice}
    className="bg-white hover:bg-slate-50 border border-slate-150 p-2.5 rounded-2xl shadow-sm text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between"
  >
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
            <Mic className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 truncate">Voice Update</div>
            <div className="text-[9px] text-slate-400 truncate">Your area forecast</div>
          </div>
        </button>

        {
    /* Tile 3: Alerts */
  }
        <button
    id="action-alerts"
    onClick={onOpenAlerts}
    className="relative bg-white hover:bg-slate-50 border border-slate-150 p-2.5 rounded-2xl shadow-sm text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between"
  >
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
            <Bell className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 truncate">Alerts</div>
            <div className="text-[9px] text-slate-400 truncate">Active warnings</div>
          </div>
        </button>

        {
    /* Tile 4: Saved Locations */
  }
        <button
    id="action-saved-locations"
    onClick={onOpenLocationModal}
    className="bg-white hover:bg-slate-50 border border-slate-150 p-2.5 rounded-2xl shadow-sm text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between"
  >
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <Star className="w-4.5 h-4.5 fill-blue-600 text-blue-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 truncate">Saved Locations</div>
            <div className="text-[9px] text-slate-400 truncate">Manage places</div>
          </div>
        </button>
      </div>

      {
    /* 3. Five-Tab Bottom Navigation Bar (Exact Reference Image Styling) */
  }
      <nav
    id="main-merged-navbar"
    aria-label="Main Application Menu"
    className="bg-white rounded-3xl shadow-lg border border-slate-150 py-2 px-3 flex items-center justify-between"
  >
        {
    /* Tab 1: Home */
  }
        <button
    id="tab-nav-home"
    onClick={() => onTabSelect("home")}
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${currentTab === "home" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"}`}
  >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {
    /* Tab 2: Map */
  }
        <button
    id="tab-nav-map"
    onClick={() => onTabSelect("map")}
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${currentTab === "map" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"}`}
  >
          <MapIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Map</span>
        </button>

        {
    /* Tab 3: Alerts */
  }
        <button
    id="tab-nav-alerts"
    onClick={() => {
      onTabSelect("alerts");
      onOpenAlerts();
    }}
    className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${currentTab === "alerts" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"}`}
  >
          <div className="relative">
            <Bell className="w-5 h-5 mb-0.5" />
            {alertCount > 0 && <span className="absolute -top-1 -right-2 px-1.2 py-0.2 bg-rose-500 text-white text-[8px] font-bold rounded-full">
                {alertCount}
              </span>}
          </div>
          <span className="text-[10px]">Alerts</span>
        </button>

        {
    /* Tab 4: History */
  }
        <button
    id="tab-nav-history"
    onClick={() => {
      onTabSelect("history");
      if (onOpenHistory) onOpenHistory();
      else onOpenSettings();
    }}
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${currentTab === "history" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"}`}
  >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">History</span>
        </button>

        {
    /* Tab 5: More */
  }
        <button
    id="tab-nav-more"
    onClick={() => {
      onTabSelect("more");
      onOpenSettings();
    }}
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${currentTab === "more" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"}`}
  >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </div>;
};
