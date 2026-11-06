import { User, Sprout, Anchor, ShieldAlert, Compass } from "lucide-react";

export const PersonaSwitcher = ({
  activePersona,
  onPersonaChange
}) => {
  const personas = [
    {
      id: "farmer",
      label: "Kisan / Farmer",
      tag: "Sowing & Mandi",
      icon: <Sprout className="w-3.5 h-3.5 text-emerald-400" />,
      activeClass: "bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20"
    },
    {
      id: "citizen",
      label: "Citizen",
      tag: "AQI & Health",
      icon: <User className="w-3.5 h-3.5 text-sky-400" />,
      activeClass: "bg-sky-500/25 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20"
    },
    {
      id: "fisherman",
      label: "Fisherman",
      tag: "Waves & PFZ",
      icon: <Anchor className="w-3.5 h-3.5 text-cyan-400" />,
      activeClass: "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20"
    },
    {
      id: "traveller",
      label: "Traveller",
      tag: "Roads & Transit",
      icon: <Compass className="w-3.5 h-3.5 text-amber-400" />,
      activeClass: "bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20"
    },
    {
      id: "disaster",
      label: "Disaster / NDRF",
      tag: "Alerts & SOS",
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      activeClass: "bg-rose-500/25 border-rose-400 text-rose-200 shadow-md shadow-rose-500/20"
    }
  ];

  return (
    <div id="persona-switcher" className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-sky-500/20 shadow-inner">
        {personas.map((p) => {
          const isSelected = activePersona === p.id;
          return (
            <button
              key={p.id}
              id={`persona-btn-${p.id}`}
              onClick={() => onPersonaChange(p.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSelected ? p.activeClass : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <div className="shrink-0">{p.icon}</div>
              <span className="truncate">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
