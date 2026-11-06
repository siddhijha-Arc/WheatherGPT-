import { User, Tractor, Anchor, Building2, ShieldAlert, Car, Check, X, Sparkles } from "lucide-react";

export const ModeSwitcherModal = ({
  isOpen,
  onClose,
  persona,
  onPersonaChange,
  language = "en"
}) => {
  if (!isOpen) return null;

  const modes = [
    {
      id: "farmer",
      name: language === "hi" ? "किसान मोड (Farmer Mode)" : "Farmer Mode",
      desc: language === "hi" ? "फसल सुरक्षा, बुवाई, सिंचाई चक्र एवं मंडी मौसम सलाह" : "Crop protection, irrigation timing, sowing advisories & mandi weather",
      icon: <Tractor className="w-5 h-5 text-emerald-600" />,
      color: "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950"
    },
    {
      id: "fisherman",
      name: language === "hi" ? "मछुआरा मोड (Fisherman Mode)" : "Fisherman Mode",
      desc: language === "hi" ? "समुद्री लहर ऊंचाई (Swell), ज्वार-भाटा, हवा की गति एवं तटीय सुरक्षा" : "Wave height, swell period, tidal charts, wind speed & coastal safety",
      icon: <Anchor className="w-5 h-5 text-cyan-600" />,
      color: "border-cyan-200 bg-cyan-50/50 hover:bg-cyan-50 text-cyan-950"
    },
    {
      id: "resident",
      name: language === "hi" ? "शहरी नागरिक मोड (City Resident)" : "City Resident Mode",
      desc: language === "hi" ? "दैनिक वर्षा, वायु गुणवत्ता (AQI), यूवी इंडेक्स एवं गर्मी चेतावनी" : "Daily rainfall, real-time AQI, UV index, heatwave & commute weather",
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      color: "border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-950"
    },
    {
      id: "commuter",
      name: language === "hi" ? "यात्री एवं लॉजिस्टिक्स (Commuter Mode)" : "Commuter & Travel Mode",
      desc: language === "hi" ? "हाईवे कोहरा, जलभराव जोखिम, विजिबिलिटी एवं रोड सेफ्टी" : "Highway fog, waterlogging alerts, visibility index & road hazard routes",
      icon: <Car className="w-5 h-5 text-amber-600" />,
      color: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-950"
    },
    {
      id: "disaster",
      name: language === "hi" ? "आपदा प्रबंधन (Disaster Responder)" : "Disaster Responder Mode",
      desc: language === "hi" ? "चक्रवात ट्रैक, भारी अतिवृष्टि रडार एवं राष्ट्रीय चेतावनी फीड" : "Cyclone vortex tracks, extreme downpour radar & high-priority alert feeds",
      icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
      color: "border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-950"
    }
  ];

  return (
    <div
      id="mode-switcher-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="mode-switcher-card"
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {language === "hi" ? "उपयोगकर्ता मोड चुनें" : "Select User Intelligence Mode"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === "hi" ? "आपकी ज़रूरत के अनुसार मौसम एवं AI अंतर्दृष्टि" : "Personalize weather insights & AI advice for your work"}
              </p>
            </div>
          </div>
          <button
            id="close-mode-switcher-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Options */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {modes.map((item) => {
            const isSelected = persona === item.id;
            return (
              <button
                key={item.id}
                id={`mode-select-${item.id}`}
                onClick={() => {
                  onPersonaChange(item.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 relative ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/30 shadow-xs"
                    : `${item.color} border-slate-200/80`
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                {isSelected && (
                  <div className="absolute right-3.5 top-4 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI automatically tailors recommendations</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer transition-colors"
          >
            {language === "hi" ? "संपन्न" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
};
