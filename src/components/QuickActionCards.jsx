import { useState } from "react";
import { Radio, Mic2, Bell, Star, ChevronDown, ChevronUp } from "lucide-react";
export const QuickActionCards = ({
  onOpenFarmerRadio,
  onOpenVoiceUpdate,
  onOpenAlerts,
  onOpenSavedLocations
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const actions = [
    {
      id: "farmer-radio",
      title: "Farmer Radio",
      subtitle: "Weather updates",
      icon: <Radio className="w-5 h-5 text-emerald-600" />,
      bgIcon: "bg-emerald-50 border-emerald-100",
      onClick: onOpenFarmerRadio
    },
    {
      id: "voice-update",
      title: "Voice Update",
      subtitle: "Your area forecast",
      icon: <Mic2 className="w-5 h-5 text-purple-600" />,
      bgIcon: "bg-purple-50 border-purple-100",
      onClick: onOpenVoiceUpdate
    },
    {
      id: "alerts",
      title: "Alerts",
      subtitle: "Active warnings",
      icon: <Bell className="w-5 h-5 text-amber-600" />,
      bgIcon: "bg-amber-50 border-amber-100",
      onClick: onOpenAlerts
    },
    {
      id: "saved-locations",
      title: "Saved Locations",
      subtitle: "Manage places",
      icon: <Star className="w-5 h-5 text-blue-600 fill-blue-600" />,
      bgIcon: "bg-blue-50 border-blue-100",
      onClick: onOpenSavedLocations
    }
  ];
  return <div id="quick-action-cards-container" className="w-full pointer-events-auto transition-all">
      {isMinimized ? <div className="flex justify-center">
          <button
    id="quick-actions-expand-btn"
    onClick={() => setIsMinimized(false)}
    className="bg-white/95 backdrop-blur-md rounded-full px-3 py-1 text-xs text-slate-600 border border-slate-200/80 shadow-sm flex items-center gap-1 hover:text-blue-600 cursor-pointer"
  >
            <span>Quick Actions</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div> : <div className="relative">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {actions.map((act) => <button
    key={act.id}
    id={`quick-action-btn-${act.id}`}
    onClick={act.onClick}
    className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-md hover:shadow-lg border border-slate-100/90 flex flex-col items-center justify-center text-center transition-all active:scale-95 cursor-pointer hover:border-blue-200"
  >
                {
    /* Icon Circle */
  }
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${act.bgIcon} border flex items-center justify-center mb-1.5 shadow-2xs`}>
                  {act.icon}
                </div>
                {
    /* Title */
  }
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight block truncate w-full">
                  {act.title}
                </span>
                {
    /* Subtitle */
  }
                <span className="text-[9px] sm:text-[10px] text-slate-500 leading-tight block truncate w-full">
                  {act.subtitle}
                </span>
              </button>)}
          </div>

          <button
    id="quick-actions-minimize-btn"
    onClick={() => setIsMinimized(true)}
    className="absolute -top-3 right-2 text-slate-400 hover:text-slate-600 bg-white rounded-full p-0.5 shadow-xs border border-slate-100 cursor-pointer"
    title="Minimize Quick Actions"
  >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>}
    </div>;
};
