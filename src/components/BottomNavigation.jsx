import { Home, Map as MapIcon, Bell, History, MoreHorizontal } from "lucide-react";
export const BottomNavigation = ({
  activeTab,
  onTabChange,
  alertCount = 4
}) => {
  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="w-5 h-5" />
    },
    {
      id: "map",
      label: "Map",
      icon: <MapIcon className="w-5 h-5" />
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: <Bell className="w-5 h-5" />,
      badge: alertCount > 0 ? alertCount : void 0
    },
    {
      id: "history",
      label: "History",
      icon: <History className="w-5 h-5" />
    },
    {
      id: "more",
      label: "More",
      icon: <MoreHorizontal className="w-5 h-5" />
    }
  ];
  return <nav
    id="bottom-navigation-bar"
    className="fixed bottom-0 left-0 right-0 z-40 px-2 py-1.5 bg-white/98 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-pb"
  >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
    const isActive = activeTab === tab.id;
    return <button
      key={tab.id}
      id={`nav-tab-${tab.id}`}
      onClick={() => onTabChange(tab.id)}
      aria-label={tab.label}
      className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${isActive ? "text-blue-600 font-bold scale-105" : "text-slate-500 hover:text-slate-800 font-medium"}`}
    >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 && <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                    {tab.badge}
                  </span>}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>;
  })}
      </div>
    </nav>;
};
