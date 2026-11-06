import { useState, useRef, useEffect } from "react";
import {
  Layers,
  Sparkles,
  CloudRain,
  Wind,
  Droplets,
  Flame,
  Tornado,
  X
} from "lucide-react";

export const HazardLayerSwitcher = ({
  activeLayer = "priority",
  onLayerChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const layers = [
    {
      id: "priority",
      label: "Priority (Auto)",
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
      colorDot: "bg-amber-400"
    },
    {
      id: "rain",
      label: "Rainfall & Storms",
      icon: <CloudRain className="w-3.5 h-3.5 text-sky-400" />,
      colorDot: "bg-sky-400"
    },
    {
      id: "wind",
      label: "Wind Speed",
      icon: <Wind className="w-3.5 h-3.5 text-emerald-400" />,
      colorDot: "bg-emerald-400"
    },
    {
      id: "humidity",
      label: "Humidity",
      icon: <Droplets className="w-3.5 h-3.5 text-purple-400" />,
      colorDot: "bg-purple-400"
    },
    {
      id: "heatwave",
      label: "Heatwave / Temp",
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
      colorDot: "bg-orange-400"
    },
    {
      id: "cyclone",
      label: "Cyclone Vortex",
      icon: <Tornado className="w-3.5 h-3.5 text-rose-500" />,
      colorDot: "bg-rose-500"
    }
  ];

  const currentActive = layers.find((l) => l.id === activeLayer) || layers[0];

  return (
    <div
      ref={containerRef}
      id="hazard-layer-panel-container"
      className="relative pointer-events-auto select-none"
    >
      {/* Compact Circle Toggle Button */}
      {!isOpen && (
        <button
          id="hazard-layer-toggle-circle-btn"
          onClick={() => setIsOpen(true)}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/95 hover:bg-slate-800 text-sky-400 hover:text-white backdrop-blur-md shadow-lg border border-sky-500/30 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer group"
          title={`Hazard Layer: ${currentActive.label}`}
        >
          <div className="group-hover:rotate-12 transition-transform duration-200">
            {currentActive.icon || <Layers className="w-4 h-4 text-sky-400" />}
          </div>
          <span
            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${currentActive.colorDot} ring-2 ring-slate-900 animate-pulse`}
          />
        </button>
      )}

      {/* Compact Mini Popover */}
      {isOpen && (
        <div className="w-44 sm:w-48 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-sky-500/25 shadow-2xl p-2 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-1 pb-1.5 mb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold text-[11px] text-slate-200">Hazard Layer</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-5 h-5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-0.5">
            {layers.map((layer) => {
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => {
                    onLayerChange(layer.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-xl text-left text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {layer.icon}
                    <span className="truncate">{layer.label}</span>
                  </div>

                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-sky-400 bg-sky-400"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
