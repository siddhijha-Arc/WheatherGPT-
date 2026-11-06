import { getTranslation, translateWeatherCondition } from "../lib/translations";
import { ALL_INDIC_LANGUAGES } from "../lib/languages";

export const AppTopHeader = ({
  location,
  weather,
  onLocateUser,
  isLocating,
  activeLayer,
  onLayerChange,
  onOpenProfile,
  onOpenLocationModal,
  onOpenMoreModal,
  onOpenMapplsHub,
  language,
  onLanguageChange,
  user,
  activeTab,
  onTabChange,
  onOpenChat,
  onOpenMausamMitra
}) => {
  const currentLangObj = ALL_INDIC_LANGUAGES.find((l) => l.id === language) || ALL_INDIC_LANGUAGES[0];

  return (
    <header
      id="fixed-app-top-header"
      className="w-full bg-[#fbf8fc]/95 backdrop-blur-md z-40 shrink-0 px-3 sm:px-6 lg:px-10 pt-3 pb-3 transition-all border-b border-slate-200/50"
    >
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Brand & Location Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => onTabChange?.("home")}
            className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl neo-raised flex items-center justify-center text-[#031636] group-hover:scale-105 transition-transform bg-[#fbf8fc] shrink-0">
              <span className="material-symbols-outlined text-[22px] sm:text-[24px] icon-fill">
                cloudy
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-[#031636] tracking-tight leading-none">
                  WeatherGPT
                </span>
                <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {getTranslation(language).liveImdAi || "Live IMD AI"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#575f6a] font-semibold leading-tight mt-0.5 max-w-[180px] sm:max-w-[280px] truncate">
                {location?.locality || location?.city || (language === "hi" ? "नई दिल्ली" : "New Delhi")} • {weather?.temp != null ? `${weather.temp}°C` : "34°C"} {weather?.condition ? `(${translateWeatherCondition(weather.condition, language)})` : ""}
              </p>
            </div>
          </button>

          {/* Location Selector Chip (Desktop) */}
          <button
            onClick={onOpenLocationModal}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full neo-pressed-sm text-xs font-semibold text-[#031636] hover:text-blue-700 transition-colors max-w-[220px] truncate cursor-pointer bg-[#fbf8fc]"
            title="Change active location"
          >
            <span className="material-symbols-outlined text-[15px] text-blue-600 icon-fill shrink-0">location_on</span>
            <span className="truncate">{location?.locality || location?.city || (getTranslation(language).defaultLocationName || "New Delhi, India")}</span>
            <span className="material-symbols-outlined text-[13px] text-slate-400 shrink-0">expand_more</span>
          </button>
        </div>

        {/* Right Controls: Location Chip (Mobile), 10-Language Selector & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Mobile Location Selector */}
          <button
            onClick={onOpenLocationModal}
            className="flex md:hidden items-center gap-1 h-8.5 px-2.5 rounded-full neo-raised-sm text-[11px] font-bold text-[#031636] bg-[#fbf8fc] border border-slate-200/60 cursor-pointer max-w-[120px]"
            title="Change location"
          >
            <span className="material-symbols-outlined text-[14px] text-blue-600 icon-fill shrink-0">location_on</span>
            <span className="truncate">{location?.locality || location?.city || "Delhi"}</span>
          </button>

          {/* 10-Language Selector Dropdown */}
          <div className="relative flex items-center">
            <div
              id="header-lang-btn"
              className="h-8.5 sm:h-10 px-2.5 sm:px-3.5 rounded-full neo-raised-sm hover:neo-pressed-sm text-[11px] sm:text-xs font-bold text-[#031636] flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-[#fbf8fc] border border-slate-200/60 shadow-xs relative"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-blue-600">translate</span>
              <span className="font-bold truncate max-w-[65px] sm:max-w-[100px]">
                {currentLangObj.nativeName}
              </span>
              <span className="material-symbols-outlined text-[13px] text-slate-400 shrink-0">expand_more</span>
              <select
                id="header-language-select"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                aria-label="Select Regional Language"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none bg-transparent"
              >
                {ALL_INDIC_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} className="text-slate-900 font-medium py-1">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Profile Avatar */}
          <button
            id="header-profile-btn"
            onClick={onOpenProfile}
            aria-label="User Profile & Settings"
            className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full overflow-hidden neo-raised-sm hover:neo-pressed-sm flex items-center justify-center bg-[#d8e0ed] text-[#031636] transition-all cursor-pointer active:scale-95 shrink-0"
            title={user ? user.name || user.email : "Profile & Settings"}
          >
            {user ? (
              <span className="font-bold text-xs sm:text-sm text-[#031636]">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-[#031636]">
                person
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
