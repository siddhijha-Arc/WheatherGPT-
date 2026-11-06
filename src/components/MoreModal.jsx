import {
  X,
  Globe,
  Radio,
  PhoneCall,
  Check,
  Sliders,
  Thermometer,
  LogOut,
  User,
  Database,
  MapPin,
  Activity,
  FileText
} from "lucide-react";
import { getTranslation } from "../lib/translations";
import { ALL_INDIC_LANGUAGES } from "../lib/languages";

export const MoreModal = ({
  isOpen,
  onClose,
  persona,
  onPersonaChange,
  onOpenAuthModal,
  user,
  onLogout,
  onOpenFarmerRadio,
  onOpenIrrigationScheduler,
  onOpenMapplsHub,
  language = "en",
  onLanguageChange,
  tempUnit = "C",
  onTempUnitChange,
  showStationNumbers = true,
  onToggleStationNumbers,
  layerOpacity = 0.85,
  onLayerOpacityChange
}) => {
  if (!isOpen) return null;
  const t = getTranslation(language);
  const isHi = language === "hi";

  return (
    <div
      id="more-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="more-modal-dialog"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[88vh] overflow-y-auto text-slate-800 animate-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t.settingsTitle || "More Options & Settings"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Meteorological Map Preferences */}
        <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-blue-600" />
              {t.tempUnitLabel || "Temperature Unit"}
            </span>
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
              <button
                onClick={() => onTempUnitChange && onTempUnitChange("C")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  tempUnit === "C" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => onTempUnitChange && onTempUnitChange("F")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  tempUnit === "F" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {t.radarOpacity || "Radar Layer Opacity"}
              </span>
              <span className="font-bold text-blue-600">{Math.round((layerOpacity || 0.85) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={layerOpacity || 0.85}
              onChange={(e) => onLayerOpacityChange && onLayerOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* 2. Language Selection (All 10 Indic Languages) */}
        <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <Globe className="w-4 h-4 text-emerald-600" />
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t.languageSelect || "Language Selection"}
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_INDIC_LANGUAGES.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="truncate pr-1">
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.nativeName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{lang.name}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Mappls MapmyIndia Suite */}
        {onOpenMapplsHub && (
          <div className="space-y-2 mb-4">
            <button
              onClick={() => {
                onClose();
                onOpenMapplsHub();
              }}
              className="w-full p-3 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 flex items-center justify-between transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  MMI
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>{isHi ? "Mappls मैपमायइंडिया सुइट" : "Mappls MapmyIndia Suite"}</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-200 text-blue-800 text-[9px] font-bold">APIs</span>
                  </div>
                  <div className="text-[10px] text-blue-700">
                    {isHi ? "स्थिर मानचित्र, निकटतम मंडियां, eLoc खोज" : "Static maps, nearby mandis, eLoc search & styles"}
                  </div>
                </div>
              </div>
              <span className="text-xs text-blue-700 font-bold">{isHi ? "खोलें >" : "Open >"}</span>
            </button>
          </div>
        )}

        {/* Prune LLM Gateway Inspector */}
        {onOpenPruneDebug && (
          <div className="space-y-2 mb-4">
            <button
              onClick={() => {
                onClose();
                onOpenPruneDebug();
              }}
              className="w-full p-3 rounded-2xl border border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/60 flex items-center justify-between transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  AI
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span>{isHi ? "प्रून एआई गेटवे इंस्पेक्टर" : "Prune LLM Gateway Inspector"}</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-800 text-[9px] font-bold">API</span>
                  </div>
                  <div className="text-[10px] text-indigo-700">
                    {isHi ? "कॉल, हेडर और कैश स्थिति की जाँच करें" : "Inspect requests, headers & cache hits"}
                  </div>
                </div>
              </div>
              <span className="text-xs text-indigo-700 font-bold">{isHi ? "खोलें >" : "Open >"}</span>
            </button>
          </div>
        )}

        {/* 5. Farmer Radio & Irrigation Scheduler Services */}
        <div className="space-y-2 mb-4">
          {onOpenIrrigationScheduler && (
            <button
              onClick={() => {
                onClose();
                onOpenIrrigationScheduler();
              }}
              className="w-full p-3 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:bg-emerald-100/50 flex items-center justify-between transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {t.irrigationScheduler || (isHi ? "स्मार्ट सिंचाई सलाहकार" : "Smart Irrigation Scheduler")}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {isHi ? "फसल, मिट्टी व मौसम अनुसार पानी समय सारणी" : "Crop, soil & weather water timing calendar"}
                  </div>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-bold">{isHi ? "खोलें >" : "Open >"}</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenFarmerRadio();
            }}
            className="w-full p-3 rounded-2xl border border-slate-200 bg-emerald-50/50 hover:bg-emerald-100/50 flex items-center justify-between transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Radio className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isHi ? "किसान रेडियो प्रसारण" : "Farmer Radio Broadcast"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isHi ? "दैनिक क्षेत्रीय कृषि एवं मौसम बुलेटिन" : "Live regional agricultural bulletins"}
                </div>
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-bold">{isHi ? "सुनें >" : "Play >"}</span>
          </button>
        </div>

        {/* 5.5 Stored User Information & Activity Vault */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-3 mb-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-200/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-950 text-xs">
                  {isHi ? "आपका सहेजा गया डेटा और गतिविधि (User Vault)" : "User Stored Information & Activity Vault"}
                </h4>
                <p className="text-[10px] text-indigo-700">
                  {isHi ? "वेबसाइट पर दर्ज आपका संपूर्ण व्यक्तिगत और सत्र डेटा" : "All personal and session data fed across the website"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const dataExport = {
                  savedLocation: localStorage.getItem("weathergpt_formatted_address") || localStorage.getItem("weathergpt_city") || "Not set",
                  persona: localStorage.getItem("weathergpt_persona") || "farmer",
                  healthProfile: JSON.parse(localStorage.getItem("weathergpt_health_profile") || "null"),
                  recentLocations: JSON.parse(localStorage.getItem("weathergpt_recent_locations") || "[]"),
                  savedLocations: JSON.parse(localStorage.getItem("weathergpt_saved_locations") || "[]"),
                  pincode: localStorage.getItem("weathergpt_pincode") || "",
                };
                const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "WeatherGPT_User_Vault_Data.json";
                a.click();
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>{isHi ? "डेटा डाउनलोड करें" : "Export JSON"}</span>
            </button>
          </div>

          <div className="space-y-2 text-[11px] text-indigo-950">
            {/* Location */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-indigo-100 flex items-start gap-2 shadow-2xs">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold block text-slate-800">{isHi ? "वर्तमान सहेजा गया स्थान:" : "Current Stored Location:"}</span>
                <span className="text-slate-600 truncate block">
                  {localStorage.getItem("weathergpt_formatted_address") || localStorage.getItem("weathergpt_city") || (isHi ? "कोई स्थान नहीं" : "No location configured yet")}
                </span>
                {localStorage.getItem("weathergpt_pincode") && (
                  <span className="text-[10px] text-indigo-600 font-semibold">Pincode: {localStorage.getItem("weathergpt_pincode")}</span>
                )}
              </div>
            </div>

            {/* Persona */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-indigo-100 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold block text-slate-800">{isHi ? "सक्रिय सलाहकार मोड (Persona):" : "Active Advisory Persona:"}</span>
                  <span className="text-slate-600 capitalize font-semibold">{localStorage.getItem("weathergpt_persona") || "Farmer / Kisan"}</span>
                </div>
              </div>
            </div>

            {/* Health Profile Summary */}
            {localStorage.getItem("weathergpt_health_profile") && (
              <div className="p-2.5 rounded-xl bg-white/80 border border-indigo-100 flex items-start gap-2 shadow-2xs">
                <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold block text-slate-800">{isHi ? "स्वास्थ्य और फिजियोलॉजिकल प्रोफ़ाइल:" : "Health & Physiological Profile Stored:"}</span>
                  <span className="text-slate-600 text-[10px] block truncate">
                    {(() => {
                      try {
                        const hp = JSON.parse(localStorage.getItem("weathergpt_health_profile"));
                        return `Age: ${hp.age || "-"}, Conditions: ${hp.conditions ? hp.conditions.join(", ") : "None"}, Activity: ${hp.activityLevel || "-"}`;
                      } catch (e) {
                        return "Configured";
                      }
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* Saved Locations List */}
            {(() => {
              try {
                const recents = JSON.parse(localStorage.getItem("weathergpt_recent_locations") || "[]");
                if (recents.length === 0) return null;
                return (
                  <div className="p-2.5 rounded-xl bg-white/80 border border-indigo-100 shadow-2xs">
                    <span className="font-bold block text-slate-800 mb-1">{isHi ? "हाल के खोजे गए स्थान इतिहास:" : "Recent Locations History:"}</span>
                    <div className="flex flex-wrap gap-1">
                      {recents.slice(0, 4).map((loc, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-semibold text-indigo-900">
                          {loc.city || loc.name || "Location"}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              } catch (e) {
                return null;
              }
            })()}
          </div>
        </div>

        {/* 6. Account & Authentication */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {user?.name || user?.email || (isHi ? "उपयोगकर्ता खाता" : "User Account")}
                </div>
                <div className="text-[10px] text-slate-500">
                  {user?.email || (isHi ? "सक्रिय सत्र" : "Logged in session")}
                </div>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>{isHi ? "लॉग आउट" : "Log Out"}</span>
              </button>
            )}
          </div>
        </div>

        {/* 7. Emergency Helplines */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            <span>{isHi ? "राष्ट्रीय आपातकालीन हेल्पलाइन" : "National Emergency Helplines"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block">{isHi ? "राष्ट्रीय आपातकाल:" : "National Emergency:"}</span>
              <span className="font-bold text-emerald-600 text-sm">112</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block">{isHi ? "किसान कॉल सेंटर:" : "Kisan Call Center:"}</span>
              <span className="font-bold text-blue-600 text-sm">1800-180-1551</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
