import { MapPin, Loader2 } from "lucide-react";
export const MyLocationButton = ({
  onLocate,
  isLocating = false,
  cityName
}) => {
  return <button
    id="my-location-pill-btn"
    onClick={onLocate}
    disabled={isLocating}
    className="bg-white/95 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-md hover:shadow-lg border border-slate-200/80 flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-blue-600 active:scale-95 transition-all cursor-pointer pointer-events-auto"
    title={cityName ? `Current location: ${cityName}` : "Find My Location"}
  >
      {isLocating ? <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-blue-600 fill-blue-600 shrink-0" />}
      <span className="truncate max-w-[120px]">{cityName || "My Location"}</span>
    </button>;
};
