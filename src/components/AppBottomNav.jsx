import { getTranslation } from "../lib/translations";

export const AppBottomNav = ({
  activeTab,
  onTabChange,
  onOpenChat,
  onOpenMode,
  onOpenHelpline,
  onOpenMore,
  language = "en",
  isVisible = true
}) => {
  const t = getTranslation(language);

  return (
    <nav
      id="app-bottom-navigation-bar"
      aria-label="Main Navigation"
      className={`fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-50 flex justify-center pb-safe transition-all duration-300 ease-in-out transform ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-28 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-[#fbf8fc] neo-raised rounded-[2rem] w-full max-w-md md:max-w-lg px-2 sm:px-3 py-2 sm:py-2.5 flex justify-between items-end relative pointer-events-auto border border-white/60 shadow-xl shadow-slate-900/10 backdrop-blur-md">
        {/* Left Side (3 items: Home, Map, Nigrani) */}
        <div className="flex justify-around w-[42%]">
          <button
            id="nav-tab-home"
            type="button"
            onClick={() => onTabChange("home")}
            className={`flex flex-col items-center justify-center transition-all duration-150 group cursor-pointer ${
              activeTab === "home" ? "text-[#031636]" : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-0.5 transition-all ${
              activeTab === "home" ? "neo-pressed bg-[#fbf8fc] text-[#031636]" : "hover:bg-slate-100/60"
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${activeTab === "home" ? "icon-fill text-[#031636]" : ""}`}>
                home
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] leading-tight ${activeTab === "home" ? "font-bold text-[#031636]" : "font-medium"}`}>
              {t.navHome}
            </span>
          </button>

          <button
            id="nav-tab-map"
            type="button"
            onClick={() => onTabChange("map")}
            className={`flex flex-col items-center justify-center transition-all duration-150 group cursor-pointer ${
              activeTab === "map" ? "text-[#031636]" : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-0.5 transition-all ${
              activeTab === "map" ? "neo-pressed bg-[#fbf8fc] text-[#031636]" : "hover:bg-slate-100/60"
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${activeTab === "map" ? "icon-fill text-[#031636]" : ""}`}>
                map
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] leading-tight ${activeTab === "map" ? "font-bold text-[#031636]" : "font-medium"}`}>
              {t.navMap}
            </span>
          </button>

          <button
            id="nav-tab-nigrani"
            type="button"
            onClick={() => onTabChange("nigrani")}
            className={`flex flex-col items-center justify-center transition-all duration-150 group cursor-pointer ${
              activeTab === "nigrani" ? "text-[#031636]" : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-0.5 transition-all ${
              activeTab === "nigrani" ? "neo-pressed bg-[#fbf8fc] text-[#031636]" : "hover:bg-slate-100/60"
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${activeTab === "nigrani" ? "icon-fill text-[#031636]" : ""}`}>
                visibility
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] leading-tight ${activeTab === "nigrani" ? "font-bold text-[#031636]" : "font-medium"}`}>
              {t.navNigrani}
            </span>
          </button>
        </div>

        {/* Central Chat Button (Floating Neumorphic Disc) */}
        <div className="absolute left-1/2 -top-6 sm:-top-7 -translate-x-1/2 flex flex-col items-center">
          <button
            id="nav-tab-chat-center"
            type="button"
            onClick={onOpenChat}
            className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#fbf8fc] neo-raised hover:scale-105 active:scale-95 transition-transform text-[#031636] cursor-pointer group border border-white/80 ${
              activeTab === "chat" ? "ring-2 ring-[#031636] neo-pressed" : ""
            }`}
            title={language === "hi" ? "वेदर जीपीटी लाइव चैट" : "WeatherGPT Live Chat"}
          >
            <span
              className="material-symbols-outlined text-[28px] sm:text-[30px] group-hover:scale-110 transition-transform icon-fill text-[#031636]"
            >
              chat
            </span>
          </button>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#031636] mt-1 leading-none">
            {t.navChat}
          </span>
        </div>

        {/* Spacer for the floating button */}
        <div className="w-[16%]"></div>

        {/* Right Side (3 items: Mode/Health, Help, More) */}
        <div className="flex justify-around w-[42%]">
          <button
            id="nav-tab-mode"
            type="button"
            onClick={onOpenMode}
            className={`flex flex-col items-center justify-center transition-all duration-150 group cursor-pointer ${
              activeTab === "health" || activeTab === "mode" ? "text-[#031636]" : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-0.5 transition-all ${
              activeTab === "health" || activeTab === "mode" ? "neo-pressed bg-[#fbf8fc] text-[#031636]" : "hover:bg-slate-100/60"
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${activeTab === "health" || activeTab === "mode" ? "icon-fill text-[#031636]" : ""}`}>
                monitor_heart
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] leading-tight ${activeTab === "health" || activeTab === "mode" ? "font-bold text-[#031636]" : "font-medium"}`}>
              {t.navHealth}
            </span>
          </button>

          <button
            id="nav-tab-helpline"
            type="button"
            onClick={onOpenHelpline}
            className={`flex flex-col items-center justify-center transition-all duration-150 group cursor-pointer ${
              activeTab === "helpline" ? "text-[#031636]" : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-0.5 transition-all ${
              activeTab === "helpline" ? "neo-pressed bg-[#fbf8fc] text-[#031636]" : "hover:bg-slate-100/60"
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${activeTab === "helpline" ? "icon-fill text-[#031636]" : ""}`}>
                help
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] leading-tight ${activeTab === "helpline" ? "font-bold text-[#031636]" : "font-medium"}`}>
              {t.navHelp}
            </span>
          </button>

          <button
            id="nav-tab-more"
            type="button"
            onClick={onOpenMore}
            className={`flex flex-col items-center justify-center transition-all duration-150 group cursor-pointer ${
              activeTab === "more" ? "text-[#031636]" : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-0.5 transition-all ${
              activeTab === "more" ? "neo-pressed bg-[#fbf8fc] text-[#031636]" : "hover:bg-slate-100/60"
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${activeTab === "more" ? "icon-fill text-[#031636]" : ""}`}>
                more_horiz
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] leading-tight ${activeTab === "more" ? "font-bold text-[#031636]" : "font-medium"}`}>
              {t.navMore}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
