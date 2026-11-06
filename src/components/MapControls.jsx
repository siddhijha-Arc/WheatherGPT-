import { Compass, Crosshair, Radar } from "lucide-react";
export const MapControls = ({
  onLocateUser,
  onResetView,
  isLocating,
  radarScanning,
  onToggleRadar
}) => {
  return <div id="map-floating-controls" className="flex flex-col gap-2 z-20">
      {
    /* Geolocation Button */
  }
      <button
    id="btn-my-location"
    onClick={onLocateUser}
    disabled={isLocating}
    aria-label="My Current Location"
    className={`flex items-center justify-center w-10 h-10 rounded-full bg-slate-950/90 backdrop-blur-xl border border-sky-500/30 text-sky-300 hover:border-sky-400 hover:text-white shadow-xl transition-all cursor-pointer ${isLocating ? "animate-spin border-sky-400 text-sky-400" : "hover:scale-105"}`}
    title="Find My Location"
  >
        <Crosshair className="w-5 h-5" />
      </button>

      {
    /* Radar Sweep Toggle Button */
  }
      <button
    id="btn-toggle-radar-sweep"
    onClick={onToggleRadar}
    aria-label="Toggle Live Radar Sweep Animation"
    className={`flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-xl border shadow-xl transition-all cursor-pointer ${radarScanning ? "bg-sky-500/20 border-sky-400 text-sky-300" : "bg-slate-950/90 border-slate-700 text-slate-400 hover:text-white"}`}
    title="Toggle Radar Sweep Effect"
  >
        <Radar className={`w-5 h-5 ${radarScanning ? "text-sky-400" : ""}`} />
      </button>

      {
    /* Compass / Reset India Map View Button */
  }
      <button
    id="btn-reset-map-view"
    onClick={onResetView}
    aria-label="Reset Map to All India Center"
    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 text-slate-300 hover:border-sky-400 hover:text-white shadow-xl transition-all hover:scale-105 cursor-pointer"
    title="Reset Map to India View"
  >
        <Compass className="w-5 h-5 text-amber-400" />
      </button>
    </div>;
};
