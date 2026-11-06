import {
  Wind,
  Droplets,
  Thermometer,
  Clock,
  Database
} from "lucide-react";
export const WeatherSummary = ({
  weather,
  loading,
  onRefresh
}) => {
  if (loading || !weather) {
    return <div id="weather-summary-skeleton" className="p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-sky-500/20 text-slate-300 animate-pulse flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800" />
        <div className="space-y-1.5 flex-1">
          <div className="w-24 h-4 rounded bg-slate-800" />
          <div className="w-36 h-3 rounded bg-slate-800/60" />
        </div>
      </div>;
  }
  const getHazardBadge = () => {
    if (weather.hazard_type === "cyclone") {
      return { label: "\u{1F300} Cyclone Watch", bg: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
    }
    if (weather.hazard_type === "flood") {
      return { label: "\u{1F30A} Flood Alert", bg: "bg-orange-500/20 text-orange-300 border-orange-500/40" };
    }
    if (weather.hazard_type === "heatwave") {
      return { label: "\u{1F321} Heatwave Risk", bg: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
    }
    if (weather.hazard_type === "heavy_rain") {
      return { label: "\u{1F327} Heavy Rainfall", bg: "bg-sky-500/20 text-sky-300 border-sky-500/40" };
    }
    return { label: "\u2728 Fair Weather", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
  };
  const badge = getHazardBadge();
  return <div
    id="weather-summary-card"
    className="rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-sky-500/25 p-3.5 shadow-2xl transition-all"
  >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              {weather.city}
              {weather.state && <span className="text-xs font-normal text-slate-400">, {weather.state}</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
              {badge.label}
            </span>
            <span className="text-xs text-sky-200/90 font-medium">
              {weather.condition}
            </span>
          </div>
        </div>

        {
    /* Temperature Display */
  }
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tighter flex items-baseline justify-end">
            <span>{weather.temp}</span>
            <span className="text-sky-400 text-lg font-normal">°C</span>
          </div>
          <span className="text-[10px] text-slate-400 block -mt-0.5">
            Feels like {weather.feels_like}°C
          </span>
        </div>
      </div>

      {
    /* Weather Metrics Bar */
  }
      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1.5 rounded-xl border border-slate-800">
          <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <div className="leading-tight">
            <span className="text-[9px] text-slate-400 block">Humidity</span>
            <span className="text-xs font-bold text-slate-200">{weather.humidity}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1.5 rounded-xl border border-slate-800">
          <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <div className="leading-tight">
            <span className="text-[9px] text-slate-400 block">Wind</span>
            <span className="text-xs font-bold text-slate-200">{weather.wind_speed} km/h</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1.5 rounded-xl border border-slate-800">
          <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="leading-tight">
            <span className="text-[9px] text-slate-400 block">Pressure</span>
            <span className="text-xs font-bold text-slate-200">{weather.pressure || 1012} hPa</span>
          </div>
        </div>
      </div>

      {
    /* Caching Status & Source Indicator */
  }
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-sky-400" />
          <span>
            {weather.source === "openweathermap" ? "Live OpenWeatherMap" : "IMD Cache"}
          </span>
          {weather.cached && <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded text-[9px]">
              Cached (1h)
            </span>}
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <Clock className="w-3 h-3" />
          <span>Updated just now</span>
        </span>
      </div>
    </div>;
};
