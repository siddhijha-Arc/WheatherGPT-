import { Phone, PhoneCall, ShieldAlert, Radio, ExternalLink, X, HeartHandshake, Info } from "lucide-react";
import { getTranslation } from "../lib/translations";

export const HelplineModal = ({ isOpen, onClose, language = "en" }) => {
  if (!isOpen) return null;
  const t = getTranslation(language);

  const helplines = [
    {
      id: "kisan",
      name: t.kisanCallCenter || "Kisan Call Center (KCC)",
      number: "1800-180-1551",
      desc: t.kisanDesc || "Crop advisory, pest control, irrigation & weather guidance (Toll-Free)",
      tag: "24x7 Free",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white"
    },
    {
      id: "imd",
      name: t.imdHelpline || "IMD National Weather Helpline",
      number: "1800-180-1717",
      desc: t.imdDesc || "India Meteorological Dept official severe forecasts & advisories",
      tag: "Official IMD",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    {
      id: "ndma",
      name: t.ndmaHelpline || "National Disaster Helpline (NDMA)",
      number: "1078",
      desc: t.ndmaDesc || "Flood, cyclone, landslide and natural calamity emergency response",
      tag: "Emergency",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      btnColor: "bg-rose-600 hover:bg-rose-700 text-white"
    },
    {
      id: "state_disaster",
      name: t.stateDisaster || "State Disaster Control Room",
      number: "1070",
      desc: t.stateDisasterDesc || "State-level emergency relief and disaster response operations",
      tag: "State Response",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      btnColor: "bg-amber-600 hover:bg-amber-700 text-white"
    },
    {
      id: "coastal",
      name: t.maritimeHelpline || "Maritime Weather & Search Rescue",
      number: "1554",
      desc: t.maritimeDesc || "Maritime coastal distress and rough sea emergency rescue for fishermen",
      tag: "Fisherman Support",
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      btnColor: "bg-cyan-600 hover:bg-cyan-700 text-white"
    },
    {
      id: "national_112",
      name: t.allIndiaEmergency || "All-India Unified Emergency",
      number: "112",
      desc: t.unifiedEmergencyDesc || "Single unified helpline for Police, Ambulance, Fire & Rescue",
      tag: "Unified 112",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      btnColor: "bg-purple-600 hover:bg-purple-700 text-white"
    }
  ];

  return (
    <div
      id="helpline-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="helpline-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{ backgroundColor: "#404046", borderColor: "#00040a" }}
          className="p-4 sm:p-5 border-b flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50"
        >
          <div className="flex items-center gap-3">
            <div
              style={{ borderColor: "#020000", backgroundColor: "#fcfcff" }}
              className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md border"
            >
              <PhoneCall className="w-5 h-5" style={{ color: "#0a0000" }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {t.callCenterTitle || "Weather & Disaster Helplines"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t.callCenterSub || "24x7 Official Govt of India & Agricultural Emergency Contacts"}
              </p>
            </div>
          </div>
          <button
            id="close-helpline-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Helpline List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {language === "hi"
                ? "ये सभी हेल्पलाइन नंबर भारत सरकार द्वारा संचालित निःशुल्क सार्वजनिक सेवाएं हैं। आपातकाल के समय तुरंत कॉल करें।"
                : "All helplines are official toll-free government services active 24x7 across all Indian telecom networks."}
            </span>
          </div>

          <div className="space-y-2.5">
            {helplines.map((item, idx) => (
              <div
                key={item.id}
                className="border border-slate-200/90 rounded-2xl p-3.5 hover:border-slate-300 transition-all bg-white hover:shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 truncate">{item.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                  <div className="font-mono text-sm font-extrabold text-slate-800 flex items-center gap-1.5 pt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.number}</span>
                  </div>
                </div>

                <a
                  href={`tel:${item.number.replace(/-/g, "")}`}
                  style={{ backgroundColor: "#000105" }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer ${item.btnColor}`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "कॉल करें" : "Call"}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Selector Path Hack */}
        <style dangerouslySetInnerHTML={{ __html: `
          div#root div#weathergpt-app-root div#helpline-modal-backdrop div#helpline-modal-card div:nth-of-type(1) div:nth-of-type(1) div:nth-of-type(1) svg path:nth-of-type(3) {
            background-color: #000105 !important;
          }
        `}} />

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>WeatherGPT Citizen Safety Network</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer transition-colors"
          >
            {language === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
