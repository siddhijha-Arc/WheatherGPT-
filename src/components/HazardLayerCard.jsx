import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Disc,
  Layers,
  X
} from "lucide-react";
import { getTranslation } from "../lib/translations";

export const HazardLayerCard = ({
  activeLayer = "priority",
  onLayerChange,
  onOpenMoreLayers,
  language = "en"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const t = getTranslation(language);

  // Close when clicking outside
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
      label: t.layerPriority || "Priority Alert",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
      colorDot: "bg-rose-500"
    },
    {
      id: "rain",
      label: t.layerRain || "Rainfall (mm)",
      icon: <CloudRain className="w-3.5 h-3.5 text-sky-500 shrink-0" />,
      colorDot: "bg-sky-500"
    },
    {
      id: "rain_prob",
      label: t.layerRainProb || "Rain Probability (%)",
      icon: <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />,
      colorDot: "bg-blue-500"
    },
    {
      id: "wind",
      label: t.layerWind || "Wind Speed",
      icon: <Wind className="w-3.5 h-3.5 text-emerald-500 shrink-0" />,
      colorDot: "bg-emerald-500"
    },
    {
      id: "humidity",
      label: t.layerHumidity || "Humidity",
      icon: <Droplets className="w-3.5 h-3.5 text-purple-500 shrink-0" />,
      colorDot: "bg-purple-500"
    },
    {
      id: "heatwave",
      label: t.layerHeatwave || "Heatwave / Temp",
      icon: <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
      colorDot: "bg-amber-500"
    },
    {
      id: "cyclone",
      label: t.layerCyclone || "Cyclone Vortex",
      icon: <Disc className="w-3.5 h-3.5 text-red-600 shrink-0" />,
      colorDot: "bg-red-600"
    }
  ];

  const currentLayer = layers.find((l) => l.id === activeLayer) || layers[0];

  return (
    <div
      ref={containerRef}
      id="hazard-layer-card-wrapper"
      className="relative pointer-events-auto select-none"
    >
      {/* 1. COMPACT CIRCLE ICON TRIGGER BUTTON (Shrunk to circle icon) */}
      {!isOpen && (
        <button
          id="hazard-layer-circle-toggle-btn"
          onClick={() => setIsOpen(true)}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 backdrop-blur-md shadow-md hover:shadow-lg border border-slate-200/90 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer group"
          title={`${t.hazardLayerTitle || "Hazard Layer"}: ${currentLayer.label}`}
        >
          <div className="group-hover:rotate-12 transition-transform duration-200">
            {currentLayer.icon || <Layers className="w-4 h-4 text-blue-600" />}
          </div>
          {/* Active color pulse dot */}
          <span
            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${currentLayer.colorDot} ring-2 ring-white animate-pulse`}
          />
        </button>
      )}

      {/* 2. COMPACT MINI POPOVER (Covers small length, tight and non-intrusive) */}
      {isOpen && (
        <div
          id="hazard-layer-compact-popover"
          className="w-44 sm:w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/90 p-2 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 pb-1.5 mb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold text-[11px] text-slate-900 tracking-tight">
                {t.hazardLayerTitle || "Hazard Layers"}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-5 h-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Compact Mini List */}
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
                      ? "bg-blue-50 text-blue-700 font-semibold shadow-2xs"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {layer.icon}
                    <span className="truncate">{layer.label}</span>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional More Layers Link if provided */}
          {onOpenMoreLayers && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenMoreLayers();
              }}
              className="w-full mt-1 pt-1.5 border-t border-slate-100 text-center text-[10px] font-semibold text-blue-600 hover:text-blue-700 py-0.5 rounded cursor-pointer transition-colors"
            >
              {t.moreLayers || "More Layers →"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
