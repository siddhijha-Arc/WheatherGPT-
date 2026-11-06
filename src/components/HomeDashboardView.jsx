import { useState, useRef, useEffect, useMemo } from "react";
import {
  Maximize2,
  Sprout,
  UserCheck,
  Anchor,
  ShieldAlert,
  Compass,
  ChevronDown,
  Check
} from "lucide-react";
import { getTranslation, translateWeatherCondition } from "../lib/translations";
import { FreeWeatherMap, SCAN_LAYERS } from "./FreeWeatherMap";
import { Past15DaysHistoryCard } from "./Past15DaysHistoryCard";
import { getUnifiedCrossModeTruth } from "../lib/alertService";

export const HomeDashboardView = ({
  location,
  weather,
  weatherLoading,
  activeLayer,
  onLayerChange,
  onAskAI,
  onOpenChat,
  onStartVoice,
  isListening,
  onOpenFarmerRadio,
  onOpenAlerts,
  onOpenHealth,
  onOpenLocationModal,
  onOpenFullMap,
  onOpenMapplsHub,
  mapStyle,
  tempUnit,
  showStationNumbers,
  layerOpacity,
  targetZoom,
  language,
  user,
  onOpenProfile,
  onOpenMausamMitra,
  onOpenIrrigationScheduler,
  persona = "farmer",
  onPersonaChange,
  onTabChange,
  onLocationChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState("today"); // "today" | "forecast" | "alerts"
  const [askQuery, setAskQuery] = useState("");
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const personaDropdownRef = useRef(null);
  const isHindi = language === "hi";
  const t = getTranslation(language);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (personaDropdownRef.current && !personaDropdownRef.current.contains(event.target)) {
        setPersonaDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const personas = [
    {
      id: "farmer",
      label: t.personaFarmer || "Farmer / Kisan",
      desc: t.personaFarmerDesc || "Crops & irrigation",
      icon: Sprout,
      color: "text-emerald-600",
      activeBg: "bg-emerald-50 border-emerald-500 text-emerald-900"
    },
    {
      id: "citizen",
      label: t.personaCitizen || "Citizen",
      desc: t.personaCitizenDesc || "Commute & daily rain",
      icon: UserCheck,
      color: "text-blue-600",
      activeBg: "bg-blue-50 border-blue-500 text-blue-900"
    },
    {
      id: "fisherman",
      label: t.personaFisherman || "Fisherman",
      desc: t.personaFishermanDesc || "Coastal & swell",
      icon: Anchor,
      color: "text-cyan-600",
      activeBg: "bg-cyan-50 border-cyan-500 text-cyan-900"
    },
    {
      id: "traveller",
      label: t.personaTraveller || "Traveller",
      desc: t.personaTravellerDesc || "Roads & transit",
      icon: Compass,
      color: "text-amber-600",
      activeBg: "bg-amber-50 border-amber-500 text-amber-900"
    },
    {
      id: "disaster",
      label: t.personaDisaster || "Disaster Guard",
      desc: t.personaDisasterDesc || "Cyclone & emergencies",
      icon: ShieldAlert,
      color: "text-rose-600",
      activeBg: "bg-rose-50 border-rose-500 text-rose-900"
    }
  ];

  const currentPersona = personas.find((p) => p.id === persona) || personas[0];
  const CurrentPersonaIcon = currentPersona.icon;

  const triggerMausamMitra = () => {
    if (onOpenMausamMitra) {
      onOpenMausamMitra();
    } else {
      window.dispatchEvent(new CustomEvent("open-mausam-mitra", { detail: { startMic: true } }));
    }
  };

  const fullDisplayAddress =
    location?.formattedAddress ||
    [
      location?.houseStreet,
      location?.locality !== location?.houseStreet ? location?.locality : "",
      location?.city,
      location?.district !== location?.city ? location?.district : "",
      location?.state,
      location?.pincode ? `PIN: ${location?.pincode}` : "",
      location?.country || (isHindi ? "भारत" : "India")
    ]
      .filter(Boolean)
      .join(", ") ||
    `${location?.city || (isHindi ? "नई दिल्ली" : "New Delhi")}, ${location?.state || (isHindi ? "दिल्ली" : "Delhi NCR")}, ${isHindi ? "भारत" : "India"}`;

  const handleAskSubmit = (e) => {
    e?.preventDefault();
    if (askQuery.trim()) {
      onAskAI(askQuery.trim());
      setAskQuery("");
    }
  };

  const suggestedQuestions = [
    {
      icon: "🌧️",
      label: isHindi ? "क्या आज बारिश होगी?" : "Will it rain today?",
      query: isHindi
        ? `क्या आज ${location?.city || "मेरे क्षेत्र"} में बारिश होगी?`
        : `Will it rain in ${location?.city || "my area"} today?`
    },
    {
      icon: "🌾",
      label: isHindi ? "फसल सिंचाई सलाह" : "Crop irrigation advice",
      query: isHindi
        ? `वर्तमान मौसम के अनुसार फसलों के लिए सिंचाई की क्या सलाह है?`
        : `Based on current weather, what is the best time for crop irrigation in ${location?.city || "my area"}?`
    },
    {
      icon: "⚡",
      label: isHindi ? "आंधी-तूफान की चेतावनी" : "Severe weather alerts?",
      query: isHindi
        ? `क्या अगले 24 घंटों में कोई आंधी या तूफान की चेतावनी है?`
        : `Are there any cyclone or storm alerts near ${location?.city || "my area"}?`
    },
    {
      icon: "💨",
      label: isHindi ? "कीटनाशक छिड़काव समय" : "Pesticide spray timing",
      query: isHindi
        ? `वर्तमान हवा और आर्द्रता के अनुसार क्या आज कीटनाशक का छिड़काव करना सुरक्षित है?`
        : `Is it suitable to spray pesticides today based on wind speed and rainfall probability?`
    }
  ];

  const temp = weather?.temp ?? 31;
  const baseTemp = temp;
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysOfWeekShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysOfWeekHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
  const daysOfWeekShortHi = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];

  const forecastDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    const dayName = idx === 0 ? (isHindi ? "आज" : "Today") : isHindi ? daysOfWeekShortHi[d.getDay()] : daysOfWeekShort[d.getDay()];
    const fullDayName = idx === 0 ? (isHindi ? "आज" : "Today") : isHindi ? daysOfWeekHi[d.getDay()] : daysOfWeek[d.getDay()];
    const maxT = Math.round(baseTemp + (idx % 3 - 1));
    const minT = Math.round(maxT - 8);
    const rainChance = Math.min(95, Math.max(10, Math.round((weather?.rainfall_mm || 4) * 5 + idx * 11)));
    return {
      day: dayName,
      fullDay: fullDayName,
      dateStr: d.toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { month: "short", day: "numeric" }),
      maxTemp: maxT,
      minTemp: minT,
      rainChance,
      humidity: Math.min(90, 40 + idx * 6),
      wind: Math.round(8 + idx * 2.5),
      condition: translateWeatherCondition(
        rainChance > 60
          ? "Heavy Rain"
          : rainChance > 35
          ? "Scattered Showers"
          : rainChance > 20
          ? "Partly Cloudy"
          : "Sunny Clear",
        language
      ),
      icon: rainChance > 60 ? "rainy" : rainChance > 35 ? "grain" : rainChance > 20 ? "partly_cloudy_day" : "wb_sunny",
      agriImpact:
        rainChance > 50
          ? (t.agriImpactDelayRain || (isHindi ? "छिड़काव एवं कटाई स्थगित करें। जल निकासी सुनिश्चित करें।" : "Delay spray & harvest activities. Ensure drainage."))
          : (t.agriImpactFavorable || (isHindi ? "जुताई, बुवाई एवं सिंचाई के लिए अनुकूल मौसम।" : "Favorable conditions for tillage, seeding & irrigation."))
    };
  });

  const humidity = weather?.humidity ?? 45;
  const windSpeed = weather?.wind_speed ?? 12;
  const rainfall = weather?.rainfall_mm ?? 2.4;
  const rainProb = weather?.rain_prob ?? (rainfall > 5 ? 75 : rainfall > 0.5 ? 40 : 15);
  const pressure = weather?.pressure ?? 1012;
  const rawCondition = weather?.condition || "Clear Sky";
  const condition = translateWeatherCondition(rawCondition, language);
  const feelsLike = weather?.feels_like ?? Math.round(baseTemp + 2);
  const aqi = weather?.aqi || 68;

  const crossModeTruth = useMemo(() => {
    return getUnifiedCrossModeTruth(weather, location, language);
  }, [weather, location, language]);

  return (
    <div id="home-dashboard-container" className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-6 flex flex-col gap-5 pb-32 sm:pb-36">
      {/* 1. Neumorphic Pill Sub-Navigation & Advisory Mode Selector & Sector Status Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
        {/* Left: Subtabs */}
        <nav className="flex items-center bg-[#fbf8fc] rounded-full p-1 neo-pressed w-full sm:w-auto max-w-2xl overflow-x-auto no-scrollbar">
          <button
            id="home-subtab-today"
            onClick={() => setActiveSubTab("today")}
            className={`px-3.5 sm:px-5 py-2 text-center rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === "today"
                ? "bg-[#1a2b4c] text-white neo-raised shadow-xs"
                : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            {t.subtabToday || t.today || "Today"}
          </button>
          <button
            id="home-subtab-history15"
            onClick={() => setActiveSubTab("history15")}
            className={`px-3.5 sm:px-5 py-2 text-center rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === "history15"
                ? "bg-[#1a2b4c] text-white neo-raised shadow-xs"
                : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            {t.subtabHistory15 || (isHindi ? "15-दिवसीय इतिहास" : "15-Day History")}
          </button>
          <button
            id="home-subtab-forecast"
            onClick={() => setActiveSubTab("forecast")}
            className={`px-3.5 sm:px-5 py-2 text-center rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === "forecast"
                ? "bg-[#1a2b4c] text-white neo-raised shadow-xs"
                : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            {t.subtabForecast || "7-Day Forecast"}
          </button>
          <button
            id="home-subtab-alerts"
            onClick={() => setActiveSubTab("alerts")}
            className={`px-3.5 sm:px-5 py-2 text-center rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === "alerts"
                ? "bg-[#1a2b4c] text-white neo-raised shadow-xs"
                : "text-[#575f6a] hover:text-[#031636]"
            }`}
          >
            {t.subtabAlerts || t.alertsTitle || "Hazard Alerts"}
          </button>
        </nav>

        {/* Middle: Advisory Mode Selector ('Shots ⌵' style) */}
        <div id="home-advisory-mode-section" className="relative z-30 flex items-center justify-center my-1 md:my-0">
          <div className="relative" ref={personaDropdownRef}>
            <button
              id="home-persona-dropdown-trigger"
              type="button"
              onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full neo-raised-sm hover:neo-pressed-sm bg-[#fbf8fc] text-[#031636] font-bold text-xs sm:text-sm transition-all cursor-pointer group border border-slate-200/70"
              aria-expanded={personaDropdownOpen}
              aria-haspopup="true"
            >
              <CurrentPersonaIcon className={`w-4 h-4 ${currentPersona.color} shrink-0`} />
              <span className="font-extrabold text-[#031636] tracking-tight">{currentPersona.label}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#575f6a] group-hover:text-[#031636] transition-transform duration-200 ${
                  personaDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {personaDropdownOpen && (
              <div
                id="home-persona-dropdown-menu"
                className="absolute left-1/2 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2 top-full mt-2 w-64 sm:w-72 bg-[#fbf8fc] border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 neo-raised animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#575f6a] px-2.5 py-1.5 border-b border-slate-200/60 mb-1 flex items-center justify-between">
                  <span>{t.selectProfile || "Select Advisory Profile"}</span>
                  <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{personas.length} modes</span>
                </div>
                <div className="flex flex-col gap-1">
                  {personas.map((item) => {
                    const Icon = item.icon;
                    const isSelected = persona === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`home-persona-btn-${item.id}`}
                        type="button"
                        onClick={() => {
                          if (onPersonaChange) onPersonaChange(item.id);
                          setPersonaDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${item.activeBg} font-bold ring-1 ring-blue-500/20 shadow-2xs`
                            : "hover:bg-white text-slate-700 hover:text-[#031636]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg ${isSelected ? "bg-white shadow-2xs" : "bg-slate-100"}`}>
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate text-[#031636]">{item.label}</div>
                            <div className="text-[10px] text-[#575f6a] truncate">{item.desc}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 font-bold shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full neo-raised-sm bg-[#fbf8fc] text-[11px] font-bold text-[#031636]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.radarActive || "Doppler Radar Active • 2.5km Grid Sync"}</span>
        </div>
      </div>

      {/* SUB-VIEW 1: TODAY */}
      {activeSubTab === "today" && (
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6 gap-5 animate-in fade-in duration-200">
          {/* LEFT COLUMN: Main Weather, Core Metrics & Live Radar Map */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4">
            {/* Temperature Display */}
            <section
              id="home-temperature-card"
              className="neo-raised rounded-3xl p-5 sm:p-7 flex flex-col items-center justify-center bg-[#fbf8fc] relative overflow-hidden transition-all duration-300 group hover:scale-[1.005]"
            >
              {/* Clickable Location Bar & Pinpoint Chip */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2 max-w-full px-2">
                <button
                  id="home-current-location-pill"
                  onClick={onOpenLocationModal}
                  className="text-[#575f6a] text-xs font-semibold flex items-center gap-1.5 px-3.5 py-1.5 rounded-full neo-pressed-sm hover:text-[#031636] transition-colors max-w-full truncate cursor-pointer bg-[#fbf8fc]"
                  title={fullDisplayAddress}
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600 icon-fill">location_on</span>
                  <span className="truncate max-w-[220px] sm:max-w-md font-bold text-[#031636]">
                    {location?.city ? `${location.city}${location?.state && location.state !== location.city ? `, ${location.state}` : ""}` : (t.selectLocation || "Select Location")}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
                </button>

                {location?.lat && location?.lng && (
                  <button
                    id="home-pinpoint-coords-chip"
                    onClick={onOpenFullMap}
                    className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                    title={isHindi ? "मानचित्र पर सटीक पिनपॉइंट स्थिति देखें" : "View exact pinpoint location on radar map"}
                  >
                    <span className="material-symbols-outlined text-[13px] text-rose-500">pin_drop</span>
                    <span>{Number(location.lat).toFixed(4)}°, {Number(location.lng).toFixed(4)}°</span>
                  </button>
                )}
              </div>

              {/* Giant Temperature Readout */}
              <div className="flex items-start justify-center my-1">
                <span className="text-[72px] sm:text-[88px] leading-none font-black text-[#031636] tracking-tighter">
                  {weather?.temp ?? 31}
                </span>
                <span className="text-2xl sm:text-4xl font-black text-[#031636] mt-2 ml-1">
                  °{tempUnit}
                </span>
              </div>

              {/* Weather Condition */}
              <p className="text-[#575f6a] text-sm sm:text-base font-semibold mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-500">
                  {rainfall > 3 ? "rainy" : baseTemp > 35 ? "wb_sunny" : "wb_sunny"}
                </span>
                <span className="text-[#031636]">{condition}</span>
                <span className="text-[#575f6a]/60">•</span>
                <span className="text-xs sm:text-sm text-[#575f6a]">
                  {t.feelsLike ? `${t.feelsLike}: ${feelsLike}°${tempUnit}` : `Feels like ${feelsLike}°${tempUnit}`}
                </span>
              </p>

              {/* High/Low + Telemetry Strip */}
              <div className="w-full flex items-center justify-around mt-4 pt-3 border-t border-slate-200/70 text-xs text-[#575f6a] font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-rose-500">arrow_upward</span>
                  <span>{t.maxTemp || "Max"} {Math.round(baseTemp + 2)}°{tempUnit}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-500">arrow_downward</span>
                  <span>{t.minTemp || "Min"} {Math.round(baseTemp - 7)}°{tempUnit}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">wb_twilight</span>
                  <span>{t.airQuality || "AQI"}: {aqi}</span>
                </div>
              </div>

              {/* Exact Address Subtext */}
              <div className="w-full text-center mt-2.5 pt-2 border-t border-slate-200/40">
                <p className="text-[11px] text-[#575f6a] truncate max-w-xl mx-auto" title={fullDisplayAddress}>
                  {fullDisplayAddress}
                </p>
              </div>
            </section>

            {/* Interactive Live Radar Map Card */}
            <section id="home-interactive-map-preview" className="neo-raised rounded-3xl p-4 sm:p-5 bg-[#fbf8fc] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <h3 className="text-xs font-bold text-[#031636] uppercase tracking-wider">
                    {t.dopplerRadarStudio || "Live Doppler Radar Studio"}
                  </h3>
                </div>
                <button
                  id="home-open-full-map-btn"
                  onClick={onOpenFullMap}
                  className="px-3 py-1.5 rounded-full neo-pressed-sm text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-1.5 cursor-pointer bg-[#fbf8fc]"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{t.openFullMap || t.openMap || "Full Map Screen"}</span>
                </button>
              </div>

              {/* Map Container */}
              <div className="w-full h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden relative border border-slate-200/80 shadow-inner bg-slate-900">
                <FreeWeatherMap
                  location={location}
                  onLocationChange={onLocationChange}
                  activeLayer={activeLayer}
                  onLayerChange={onLayerChange}
                  weather={weather}
                  language={language}
                  tempUnit={tempUnit}
                  showStationNumbers={showStationNumbers}
                  layerOpacity={layerOpacity}
                  targetZoom={targetZoom}
                  mapStyle={mapStyle}
                  onOpenMapplsHub={onOpenMapplsHub}
                  hideTopLayerBar={true}
                />
              </div>

              {/* Full Meteorological Scan Layer Options in Two Lines (4 items per row) */}
              <div
                id="home-map-layer-options-bar"
                className="w-full grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[#fbf8fc] neo-pressed-sm border border-slate-200/60 select-none"
              >
                {SCAN_LAYERS.map((layerItem) => {
                  const Icon = layerItem.icon;
                  const isSelected =
                    activeLayer === layerItem.id ||
                    (layerItem.id === "rain_prob" && activeLayer === "rain_probability");
                  const layerName = layerItem.id === "priority" ? (t.layerPriority || layerItem.nameEn)
                    : layerItem.id === "rain" ? (t.layerRain || layerItem.nameEn)
                    : layerItem.id === "rain_prob" ? (t.layerRainProb || layerItem.nameEn)
                    : layerItem.id === "wind" ? (t.layerWind || layerItem.nameEn)
                    : layerItem.id === "humidity" ? (t.layerHumidity || layerItem.nameEn)
                    : layerItem.id === "heatwave" ? (t.layerHeatwave || layerItem.nameEn)
                    : layerItem.id === "cyclone" ? (t.layerCyclone || layerItem.nameEn)
                    : layerItem.id === "air_quality" ? (t.layerAirQuality || layerItem.nameEn)
                    : layerItem.id === "fog" ? (t.layerFog || layerItem.nameEn)
                    : layerItem.id === "temp" ? (t.layerTemp || layerItem.nameEn)
                    : (isHindi ? layerItem.nameHi : layerItem.nameEn);
                  return (
                    <button
                      key={layerItem.id}
                      id={`home-layer-btn-${layerItem.id}`}
                      onClick={() => onLayerChange?.(layerItem.id)}
                      className={`w-full py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
                        isSelected
                          ? "bg-[#1a2b4c] text-white neo-raised shadow-xs scale-[1.02]"
                          : "neo-raised-sm bg-[#fbf8fc] hover:neo-pressed-sm text-[#575f6a] hover:text-[#031636] border border-white/60"
                      }`}
                      title={layerName}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-cyan-300" : "text-[#575f6a]"}`} />
                      <span className="truncate">{layerName}</span>
                      {layerItem.badge && (
                        <span
                          style={layerItem.id === "priority" ? { backgroundColor: "#f31a00", color: "#ffffff" } : {}}
                          className={`px-1 py-0.2 rounded text-[7px] font-extrabold uppercase tracking-wider shrink-0 ${
                            layerItem.id === "priority"
                              ? "bg-[#f31a00] text-white"
                              : isSelected
                                ? "bg-cyan-400 text-[#031636]"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {layerItem.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Current Activity - Shown according to active Persona Mode */}
            {persona === "farmer" && (
              <div
                id="widget-activity-focus"
                className="neo-raised rounded-2xl p-5 bg-[#fbf8fc] flex justify-between items-center group cursor-pointer hover:scale-[1.005] transition-all"
                onClick={() => onAskAI(t.agrometAskAI || (isHindi ? "वर्तमान मौसम परिस्थितियों के लिए विस्तृत कृषि सलाह क्या है?" : "What is the detailed agricultural advisory for current weather conditions?"))}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neo-pressed-sm bg-[#fbf8fc] text-[#031636] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border border-emerald-600/30 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t.agrometAdvisoryTag || (isHindi ? "कृषि परामर्श" : "Krishi Advisory")}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#575f6a]">{t.icarAgrometNode || (isHindi ? "ICAR / IMD कृषि केंद्र" : "ICAR / IMD Agromet Node")}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      crossModeTruth.farmer.status === "red"
                        ? "bg-red-100 text-red-800"
                        : crossModeTruth.farmer.status === "yellow"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {crossModeTruth.farmer.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#031636]">
                    {crossModeTruth.farmer.irrigationText}
                  </p>
                  <p className="text-xs text-[#575f6a] leading-relaxed max-w-xl">
                    {crossModeTruth.farmer.sprayingText}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full neo-pressed flex items-center justify-center text-[#031636] shrink-0 ml-4">
                  <span className="material-symbols-outlined text-[26px]">agriculture</span>
                </div>
              </div>
            )}

            {/* Smart Irrigation Scheduler Widget for Farmer Mode */}
            {persona === "farmer" && (
              <div
                id="widget-irrigation-scheduler"
                className="neo-raised rounded-2xl p-5 bg-[#fbf8fc] flex justify-between items-center group cursor-pointer hover:scale-[1.005] transition-all"
                onClick={onOpenIrrigationScheduler}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neo-pressed-sm bg-[#fbf8fc] text-[#031636] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border border-emerald-600/30 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t.irrigationScheduler || (isHindi ? "सिंचाई व फ़सल योजना" : "Smart Irrigation")}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#575f6a]">{t.agrometAiNode || "48-72h Agromet AI"}</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#031636]">
                    {crossModeTruth.farmer.status === "red" || crossModeTruth.farmer.status === "yellow"
                      ? (t.irrigationPostponeAlert || (isHindi ? "48-72h फ़सल चेतावनी: सिंचाई/स्प्रे स्थगित रखें" : "48-72h Crop Alert: Postpone Irrigation & Spray"))
                      : (t.irrigationFavorableAction || (isHindi ? "48-72h फ़सल कार्य: अनुकूल सिंचाई व स्प्रे समय" : "48-72h Crop Action: Favorable Irrigation & Spray Window"))}
                  </p>
                  <p className="text-xs text-[#575f6a] leading-relaxed max-w-xl">
                    {t.irrigationDesc || (isHindi
                      ? `फसल व विकास अवस्था अनुसार 7-दिवसीय टास्क डेक एवं "कारण (Why)" व्याख्या देखें`
                      : `View crop-stage 7-day task deck, 48-72h windows & "Why this advice" explainers`)}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-full neo-pressed flex items-center justify-center text-emerald-600 shrink-0 ml-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">water_drop</span>
                </div>
              </div>
            )}

            {persona === "citizen" && (
              <div
                id="widget-activity-focus-citizen"
                className="neo-raised rounded-2xl p-5 bg-[#fbf8fc] flex justify-between items-center group cursor-pointer hover:scale-[1.005] transition-all"
                onClick={() => onAskAI(t.citizenAskAI || (isHindi ? "नागरिक दैनिक आवागमन और स्वास्थ्य के लिए मौसम परामर्श क्या है?" : "What is the daily commute and health advisory for citizens today?"))}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neo-pressed-sm bg-[#fbf8fc] text-[#031636] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border border-blue-600/30 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>{t.citizenAdvisoryTag || (isHindi ? "नागरिक परामर्श" : "Citizen Advisory")}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#575f6a]">{t.dailyCommuteWellness || (isHindi ? "दैनिक यात्रा व स्वास्थ्य" : "Daily Commute & Wellness")}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      crossModeTruth.citizen.status === "danger"
                        ? "bg-red-100 text-red-800"
                        : crossModeTruth.citizen.status === "caution"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {crossModeTruth.citizen.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#031636]">
                    {crossModeTruth.citizen.outdoorFitnessReason || (t.citizenCommuteTitle || (isHindi ? "आवागमन एवं बाहरी गतिविधियों की स्थिति" : "Commute & Outdoor Air Comfort"))}
                  </p>
                  <p className="text-xs text-[#575f6a] leading-relaxed max-w-xl">
                    {crossModeTruth.citizen.summary || (isHindi ? "नागरिक दैनिक आवागमन व स्वास्थ्य हेतु सामान्य परिस्थितियां।" : "Standard baseline conditions for civic commuting.")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full neo-pressed flex items-center justify-center text-blue-600 shrink-0 ml-4">
                  <span className="material-symbols-outlined text-[26px]">directions_walk</span>
                </div>
              </div>
            )}

            {persona === "fisherman" && (
              <div
                id="widget-activity-focus-fisherman"
                className="neo-raised rounded-2xl p-5 bg-[#fbf8fc] flex justify-between items-center group cursor-pointer hover:scale-[1.005] transition-all"
                onClick={() => {
                  if (onTabChange) onTabChange("fisherman");
                  else if (onPersonaChange) onPersonaChange("fisherman");
                }}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neo-pressed-sm bg-[#fbf8fc] text-[#031636] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border border-cyan-600/30 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                      <span>{t.marineAdvisoryTag || (isHindi ? "समुद्री चेतावनी" : "Marine Swell Advisory")}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#575f6a]">{t.incoisCoastalSafety || (isHindi ? "INCOIS तटीय निगरानी" : "INCOIS Coastal Safety")}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      crossModeTruth.marine.status === "red"
                        ? "bg-red-100 text-red-800"
                        : crossModeTruth.marine.status === "yellow"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {crossModeTruth.marine.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#031636]">
                    {crossModeTruth.marine.statusLabel}: {crossModeTruth.marine.safeReturnTime || (isHindi ? "सुरक्षित नौकायन" : "Safe Operations")}
                  </p>
                  <p className="text-xs text-[#575f6a] leading-relaxed max-w-xl">
                    {crossModeTruth.marine.reasoning || (isHindi ? "लहरों की ऊंचाई सामान्य स्तर पर। तटीय नौकायन सुरक्षित।" : "Wave swells within safe baseline limits.")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full neo-pressed flex items-center justify-center text-cyan-600 shrink-0 ml-4">
                  <span className="material-symbols-outlined text-[26px]">sailing</span>
                </div>
              </div>
            )}

            {persona === "disaster" && (
              <div
                id="widget-activity-focus-disaster"
                className="neo-raised rounded-2xl p-5 bg-[#fbf8fc] flex justify-between items-center group cursor-pointer hover:scale-[1.005] transition-all"
                onClick={() => onAskAI(t.disasterAskAI || (isHindi ? "सक्रिय आपदा जोखिम और मौसम चेतावनियों की स्थिति क्या है?" : "What are the active disaster warnings and meteorological hazards right now?"))}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neo-pressed-sm bg-[#fbf8fc] text-[#031636] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border border-rose-600/30 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{t.disasterWarningTag || (isHindi ? "आपदा निगरानी" : "Disaster Early Warning")}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#575f6a]">{t.ndmaResponseNet || (isHindi ? "NDMA आपातकालीन नेटवर्क" : "NDMA Response Net")}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      crossModeTruth.nigrani.alertLevel === "red"
                        ? "bg-red-100 text-red-800"
                        : crossModeTruth.nigrani.alertLevel === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {crossModeTruth.nigrani.alertLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#031636]">
                    {crossModeTruth.nigrani.hazardTitle || (t.disasterSurveillanceTitle || (isHindi ? "आपदा रक्षक सतत निगरानी सक्रिय" : "Continuous Hazard Surveillance Active"))}
                  </p>
                  <p className="text-xs text-[#575f6a] leading-relaxed max-w-xl">
                    {crossModeTruth.nigrani.ndmaProtocol || (t.disasterSurveillanceDesc || (isHindi
                      ? "चक्रवात, बादल फटने एवं बाढ़ रडार सेंसर सामान्य सीमा के भीतर। अलर्ट आने पर तुरंत ध्वनि सायरन बजेगा।"
                      : "Cyclonic vectors, cloudbursts, and flash flood indicators within monitored range. Rapid alert protocol armed."))}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full neo-pressed flex items-center justify-center text-rose-600 shrink-0 ml-4">
                  <span className="material-symbols-outlined text-[26px]">warning</span>
                </div>
              </div>
            )}

            {persona === "traveller" && (
              <div
                id="widget-activity-focus-traveller"
                className="neo-raised rounded-2xl p-5 bg-[#fbf8fc] flex justify-between items-center group cursor-pointer hover:scale-[1.005] transition-all"
                onClick={() => onAskAI(t.travellerAskAI || (isHindi ? "सड़क की स्थिति, कोहरा और गंतव्य मौसम की जानकारी क्या है?" : "What are the highway conditions, visibility, and destination weather updates?"))}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neo-pressed-sm bg-[#fbf8fc] text-[#031636] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border border-amber-600/30 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>{t.travellerAdvisoryTag || (isHindi ? "यात्री सलाहकार" : "Traveller Route Weather")}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#575f6a]">{t.highwayTransitSafety || (isHindi ? "हाइवे ट्रांजिट सुरक्षा" : "Highway & Destination Weather")}</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#031636]">
                    {weather?.commuter_advisory?.travelAdvice || (t.travellerTitle || (isHindi ? "मार्ग दृश्यता एवं मौसम अनुकूलता" : "Route Visibility & Travel Comfort"))}
                  </p>
                  <p className="text-xs text-[#575f6a] leading-relaxed max-w-xl">
                    {weather?.commuter_advisory?.hazardSummary || (t.travellerDesc || (isHindi
                      ? "सड़क मार्ग पर दृश्यता अच्छी है। लंबी यात्रा या पर्यटन स्थलों के लिए मौसम अनुकूल है।"
                      : "Clear visibility reported along regional transit corridors. Favorable conditions for road travel and tourism."))}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full neo-pressed flex items-center justify-center text-amber-600 shrink-0 ml-4">
                  <span className="material-symbols-outlined text-[26px]">explore</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Utilities, Health Advisory & Hazard Center */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
            {/* Bento Grid Metrics (Positioned just above Voice Assistant option) */}
            <section id="home-telemetry-widgets-grid" className="grid grid-cols-2 gap-3.5">
              {/* Humidity Widget */}
              <div id="widget-humidity" className="neo-raised rounded-2xl p-4 bg-[#fbf8fc] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-xs font-bold text-[#575f6a]">
                    {t.humidity || "Humidity"}
                  </h3>
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">water_drop</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#031636] mb-1">{humidity}%</div>
                <div className="w-full h-2 bg-[#efedf0] rounded-full mt-1.5 neo-pressed overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${humidity}%` }}></div>
                </div>
              </div>

              {/* Wind Widget */}
              <div id="widget-wind" className="neo-raised rounded-2xl p-4 bg-[#fbf8fc] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-xs font-bold text-[#575f6a]">
                    {t.wind || "Wind Speed"}
                  </h3>
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">air</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#031636] mb-1">
                  {windSpeed} <span className="text-xs font-normal text-[#575f6a]">km/h</span>
                </div>
                <p className="text-[10px] text-[#575f6a] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-indigo-600">north_east</span> {t.windDirectionNE || (isHindi ? "उत्तर-पूर्व दिशा" : "NE Vector")}
                </p>
              </div>

              {/* Rainfall Widget */}
              <div id="widget-rainfall" className="neo-raised rounded-2xl p-4 bg-[#fbf8fc] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-xs font-bold text-[#575f6a]">
                    {t.rainfall || "Rainfall"}
                  </h3>
                  <span className="material-symbols-outlined text-cyan-600 text-[18px]">rainy</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#031636] mb-1">
                  {rainfall} <span className="text-xs font-normal text-[#575f6a]">mm</span>
                </div>
                <p className="text-[10px] text-[#575f6a] mt-1">
                  {rainfall > 5
                    ? (t.rainModerate || (isHindi ? "मध्यम वर्षा" : "Moderate rain"))
                    : rainfall > 0.5
                    ? (t.rainScattered || (isHindi ? "हल्की बूंदाबांदी" : "Scattered light"))
                    : (t.drySector || (isHindi ? "शुष्क क्षेत्र" : "Dry sector"))}
                </p>
              </div>

              {/* Pressure Widget */}
              <div id="widget-pressure" className="neo-raised rounded-2xl p-4 bg-[#fbf8fc] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-xs font-bold text-[#575f6a]">
                    {t.pressure || "Pressure"}
                  </h3>
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">speed</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#031636] mb-1">
                  {pressure} <span className="text-xs font-normal text-[#575f6a]">hPa</span>
                </div>
                <p className="text-[10px] text-[#575f6a] mt-1">{t.stableBarometric || (isHindi ? "स्थिर वायुदाब" : "Stable Barometric")}</p>
              </div>
            </section>

            {/* Quick Action Buttons */}
            <div className={`grid ${persona === "farmer" ? "grid-cols-2" : "grid-cols-1"} gap-3.5`}>
              {persona === "farmer" && (
                <button
                  id="home-btn-farmer-radio"
                  onClick={onOpenFarmerRadio}
                  className="neo-raised hover:neo-pressed rounded-2xl p-4 bg-[#fbf8fc] flex items-center gap-3 transition-all cursor-pointer text-left"
                >
                  <div className="w-11 h-11 rounded-full neo-pressed flex items-center justify-center text-emerald-700 shrink-0">
                    <span className="material-symbols-outlined text-[22px]">radio</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#031636]">{t.farmerRadioTitle || t.farmerRadio || "Farmer Radio"}</div>
                    <div className="text-[10px] text-[#575f6a]">{t.liveAudioBulletin || "Live Audio Bulletin"}</div>
                  </div>
                </button>
              )}

              <button
                id="home-btn-voice-assistant"
                onClick={() => {
                  onOpenChat?.();
                  onStartVoice?.();
                }}
                className="neo-raised hover:neo-pressed rounded-2xl p-4 bg-[#fbf8fc] flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-11 h-11 rounded-full neo-pressed flex items-center justify-center text-purple-700 shrink-0">
                  <span className="material-symbols-outlined text-[22px]">mic</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#031636]">{t.voiceAssistant || "Voice Assistant"}</div>
                  <div className="text-[10px] text-[#575f6a]">{isListening ? (t.listening || "Listening...") : (t.tapToInquire || t.tapToSpeak || "Tap to Inquire")}</div>
                </div>
              </button>
            </div>

            {/* Weather & Health Personalized Advisory */}
            <button
              id="home-btn-health-banner"
              onClick={onOpenHealth}
              className="w-full neo-raised hover:neo-pressed rounded-2xl p-4 bg-gradient-to-r from-[#fbf8fc] to-blue-50/50 border border-blue-200/60 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">monitor_heart</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {t.weatherAndHealth || "Weather & Your Health"}
                    </span>
                    <span className="text-[10px] font-extrabold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                      AQI {weather?.aqi || 215} • {t.aqiModerate || "Moderate–Good"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {t.asthmaSmogAdvice || "Asthma & Smog Protection: Avoid heavy outdoor exercise after 5 PM"}
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
            </button>

            {/* Active Hazard Watch Alert Card - Shown only in Farmer Mode */}
            {persona === "farmer" && (
              <section className="neo-raised rounded-2xl p-4 bg-[#fbf8fc] border-l-4 border-amber-500 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                    {t.activeHazardWatch || "Active Hazard Watch"}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    {t.valid24h || "Sector Valid: 24h"}
                  </span>
                </div>
                <p className="text-xs text-[#575f6a] leading-relaxed">
                  {t.hazardWatchDesc || (isHindi
                    ? "क्षेत्रीय कृषि भूभाग में हल्की से मध्यम संवहनी वर्षा एवं 35-45 किमी/घंटा हवाओं का पूर्वानुमान। कटी फसल को सुरक्षित स्थान पर रखें।"
                    : "Scattered convective clouds with moderate gusty winds (35-45 km/h) forecasted for northern agrarian belt. Secure farm produce.")}
                </p>
                <button
                  onClick={onOpenAlerts}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>{t.viewAllAlerts || "View Comprehensive Hazard Center"}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </section>
            )}

            {/* Past 15-Day Observed Weather History & Rain Trend Widget in Home Feed */}
            <div className="w-full">
              <Past15DaysHistoryCard
                location={location}
                language={language}
                tempUnit={tempUnit}
                isFullView={false}
                onOpenFullView={() => setActiveSubTab("history15")}
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 1.5: 15-DAY HISTORY COMPREHENSIVE VIEW */}
      {activeSubTab === "history15" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <Past15DaysHistoryCard
            location={location}
            language={language}
            tempUnit={tempUnit}
            isFullView={true}
          />
        </div>
      )}

      {/* SUB-VIEW 2: FORECAST */}
      {activeSubTab === "forecast" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#031636]">
                {t.comprehensiveForecast7Day || "7-Day Comprehensive Weather & Monsoon Forecast"}
              </h3>
              <p className="text-xs text-[#575f6a]">
                {isHindi
                  ? `ECMWF एवं IMD मॉडल आधारित पूर्वानुमान: ${location.city}, ${location.state}`
                  : `High-resolution ECMWF & IMD Global Forecast System for ${location.city}, ${location.state}`}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full neo-pressed-sm text-[#031636]">
              {location.city}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {forecastDays.map((f, i) => (
              <div
                key={i}
                className="neo-raised rounded-3xl p-5 bg-[#fbf8fc] flex flex-col justify-between gap-4 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div>
                    <span className="text-sm font-bold text-[#031636] block">{f.fullDay}</span>
                    <span className="text-xs text-[#575f6a]">{f.dateStr}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {f.condition}
                  </span>
                </div>

                <div className="flex items-center justify-between my-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-[36px]">{f.icon}</span>
                    <div>
                      <div className="text-2xl font-black text-[#031636]">{f.maxTemp}°{tempUnit}</div>
                      <div className="text-xs text-[#575f6a]">{t.minTemp || "Low"}: {f.minTemp}°{tempUnit}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1 justify-end">
                      <span className="material-symbols-outlined text-[16px]">rainy</span>
                      {f.rainChance}% {isHindi ? "वर्षा" : "rain"}
                    </div>
                    <div className="text-[11px] text-[#575f6a] mt-0.5">{t.wind || "Wind"}: {f.wind} km/h</div>
                  </div>
                </div>

                <div className="neo-pressed-sm rounded-xl p-2.5 text-[11px] text-[#575f6a]">
                  <strong className="text-[#031636] block mb-0.5">{isHindi ? "कृषि प्रभाव:" : "Agri Impact:"}</strong>
                  {f.agriImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ALERTS */}
      {activeSubTab === "alerts" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#031636]">
                {t.activeHazardWarnings || "Active Meteorological Hazard Warnings"}
              </h3>
              <p className="text-xs text-[#575f6a]">
                {isHindi
                  ? "राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) एवं मौसम विभाग (IMD) से सीधा लाइव अलर्ट"
                  : "Direct telemetry feed synchronized with National Disaster Management Authority (NDMA) & IMD"}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              {t.liveEmergencyFeed || "Live Emergency Feed"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="neo-raised rounded-3xl p-5 bg-[#fbf8fc] border-l-4 border-amber-500 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                    {t.thunderstormLightningWatch || "Thunderstorm & Lightning Watch"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{isHindi ? "24 घंटे" : "24h Watch"}</span>
                </div>
                {/* 🏛️ Govt Official Badge */}
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="bg-[#0b2816] text-[#bbf7d0] text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 border border-emerald-600/40">
                    <span>🏛️</span>
                    <span>{isHindi ? "भारत सरकार • IMD आधिकारिक बुलेटिन" : "Govt of India • IMD Official"}</span>
                  </span>
                </div>
                <p className="text-xs text-[#575f6a] leading-relaxed">
                  {isHindi
                    ? "कृषि क्षेत्रों में 35-45 किमी/घंटा की गति से आंधी और बिजली गिरने की संभावना। खुले मैदान और ऊंचे पेड़ों के नीचे जाने से बचें।"
                    : "Scattered convective clouds with moderate gusty winds (35-45 km/h) forecasted for northern agrarian belt. Secure farm produce and avoid sheltering under tall trees."}
                </p>
              </div>
              <div className="text-[11px] font-bold text-amber-900 bg-amber-50 rounded-xl p-2 border border-amber-200">
                {isHindi ? "निर्देश: आंधी-तूफान के समय पक्के मकानों में शरण लें।" : "Action: Stay indoors during lightning surges."}
              </div>
            </div>

            <div className="neo-raised rounded-3xl p-5 bg-[#fbf8fc] border-l-4 border-blue-500 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">thunderstorm</span>
                    {t.monsoonCloudInflux || "Monsoon Cloud Influx"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{isHindi ? "48 घंटे" : "48 Hours"}</span>
                </div>
                {/* 🏛️ Govt Official Badge */}
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="bg-[#0b2816] text-[#bbf7d0] text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 border border-emerald-600/40">
                    <span>🏛️</span>
                    <span>{isHindi ? "भारत सरकार • MoES मौसम विभाग" : "Govt of India • MoES Weather"}</span>
                  </span>
                </div>
                <p className="text-xs text-[#575f6a] leading-relaxed">
                  {isHindi
                    ? "बंगाल की खाड़ी से नमी युक्त हवाएं स्थानीय वर्षा ला सकती हैं। किसान जल निकासी नालियों को साफ़ रखें।"
                    : "Moisture influx from Bay of Bengal likely to bring localized precipitation. Farmers advised to clear drainage channels and secure harvested crops."}
                </p>
              </div>
              <div className="text-[11px] font-bold text-blue-900 bg-blue-50 rounded-xl p-2 border border-blue-200">
                {isHindi ? "निर्देश: खेतों में जल निकासी नालियों की सफाई करें।" : "Action: Clear farm drainage ditches."}
              </div>
            </div>

            <div className="neo-raised rounded-3xl p-5 bg-[#fbf8fc] border-l-4 border-emerald-500 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                    {t.coastalSeaConditionsNormal || "Coastal Sea Conditions Normal"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{isHindi ? "72 घंटे" : "72 Hours"}</span>
                </div>
                {/* 🏛️ Govt Official Badge */}
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="bg-[#0b2816] text-[#bbf7d0] text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 border border-emerald-600/40">
                    <span>🏛️</span>
                    <span>{isHindi ? "भारत सरकार • INCOIS समुद्री बुलेटिन" : "Govt of India • INCOIS Maritime"}</span>
                  </span>
                </div>
                <p className="text-xs text-[#575f6a] leading-relaxed">
                  {isHindi
                    ? "तटीय क्षेत्रों में लहरों की ऊंचाई सामान्य है। मछुआरों एवं नाव संचालन के लिए परिस्थितियां अनुकूल हैं।"
                    : "Wave height normal along western and eastern shorelines. Safe for regular maritime operations and artisanal fishing."}
                </p>
              </div>
              <div className="text-[11px] font-bold text-emerald-900 bg-emerald-50 rounded-xl p-2 border border-emerald-200">
                {isHindi ? "स्थिति: सामान्य समुद्री नौकायन एवं मत्स्य पालन सुरक्षित।" : "Status: Regular maritime activity approved."}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAlerts}
            className="w-full py-3 rounded-2xl neo-raised hover:neo-pressed text-xs font-bold text-[#031636] transition-all cursor-pointer mt-2"
          >
            {t.openCommandCenter || "Open Pan-India Disaster & Hazard Command Center"}
          </button>
        </div>
      )}
    </div>
  );
};
