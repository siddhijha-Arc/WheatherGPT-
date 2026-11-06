import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Waves,
  Tornado,
  CloudRain,
  Flame,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  Wind
} from "lucide-react";

export const AlertsView = ({ language = "en", location = null, weather = null }) => {
  const [alerts, setAlerts] = useState(() => (Array.isArray(weather?.alerts) && weather.alerts.length > 0 ? weather.alerts : []));
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("All");
  const isHi = language === "hi";

  const fetchLiveAlerts = async () => {
    setLoading(true);
    try {
      const lat = location?.lat || weather?.lat;
      const lng = location?.lng || weather?.lng;
      const city = location?.city || weather?.city || "";
      const queryParam = lat && lng ? `?lat=${lat}&lng=${lng}&city=${encodeURIComponent(city)}` : "";
      
      const res = await fetch(`/api/alerts/live${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.alerts && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
  }, [location?.city, weather?.city]);

  const filteredAlerts = filterSeverity === "All" ? alerts : alerts.filter((a) => a.severity === filterSeverity);

  return (
    <div id="alerts-page" className="w-full max-w-5xl mx-auto p-3 sm:p-5 space-y-4">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {isHi ? "\u0938\u0915\u094D\u0930\u093F\u092F \u092E\u094C\u0938\u092E \u090F\u0935\u0902 \u0906\u092A\u0926\u093E \u091A\u0947\u0924\u093E\u0935\u0928\u093F\u092F\u093E\u0901" : "Live Weather Hazard Alerts"}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                {alerts.length} {isHi ? "\u0938\u0915\u094D\u0930\u093F\u092F" : "Active"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHi
                ? "\u0909\u092A\u0917\u094D\u0930\u0939 \u090F\u0935\u0902 \u0921\u0949\u092A\u094D\u0932\u0930 \u0930\u0921\u093E\u0930 \u0938\u0947 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0938\u092E\u092F \u092E\u094C\u0938\u092E \u091A\u0947\u0924\u093E\u0935\u0928\u093F\u092F\u093E\u0901"
                : "Real-time meteorological warnings from live satellite and atmospheric radar scans"}
            </p>
          </div>
        </div>

        {/* Severity Filters & Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Critical", "Severe", "Moderate"].map((sev) => {
            const label = isHi ? (sev === "All" ? "\u0938\u092D\u0940" : sev === "Critical" ? "\u0905\u0924\u093F \u0917\u0902\u092D\u0940\u0930" : sev === "Severe" ? "\u0917\u0902\u092D\u0940\u0930" : "\u092E\u0927\u094D\u092F\u092E") : sev;
            return (
              <button
                key={sev}
                id={`filter-alert-${sev}`}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  filterSeverity === sev
                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            onClick={fetchLiveAlerts}
            disabled={loading}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
            title="Refresh live alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && alerts.length === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>{isHi ? "\u0932\u093E\u0907\u0935 \u092E\u094C\u0938\u092E \u091A\u0947\u0924\u093E\u0935\u0928\u093F\u092F\u093E\u0901 \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u0940 \u0939\u0948\u0902..." : "Scanning live meteorological satellite telemetry..."}</span>
        </div>
      )}

      {/* Empty state if all calm */}
      {!loading && filteredAlerts.length === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center font-bold">✓</div>
          <p className="font-bold text-slate-800">
            {isHi ? "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u0915\u094B\u0908 \u0917\u0902\u092D\u0940\u0930 \u092E\u094C\u0938\u092E \u091A\u0947\u0924\u093E\u0935\u0928\u0940 \u0938\u0915\u094D\u0930\u093F\u092F \u0928\u0939\u0940\u0902 \u0939\u0948" : "All regions clear of critical thresholds"}
          </p>
          <p className="text-[11px] text-slate-400">
            {isHi ? "\u092E\u094C\u0938\u092E \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0939\u0948 \u0914\u0930 \u0938\u092D\u0940 \u0938\u0940\u092E\u093E\u090F\u0902 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u094D\u0924\u0930 \u092A\u0930 \u0939\u0948\u0902\u0964" : "Atmospheric pressure and temperatures across monitored corridors are within safe baselines."}
          </p>
        </div>
      )}

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === "Critical";
          const isSevere = alert.severity === "Severe";
          return (
            <div
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className={`rounded-3xl bg-white border p-4 sm:p-5 shadow-md transition-all space-y-3 ${
                isCritical
                  ? "border-rose-300 hover:border-rose-400 ring-1 ring-rose-100"
                  : isSevere
                  ? "border-amber-300 hover:border-amber-400 ring-1 ring-amber-100"
                  : "border-blue-200 hover:border-blue-300"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isCritical
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : isSevere
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    {alert.hazardType === "cyclone" && <Tornado className="w-5 h-5" />}
                    {alert.hazardType === "flood" && <Waves className="w-5 h-5" />}
                    {alert.hazardType === "heatwave" && <Flame className="w-5 h-5" />}
                    {alert.hazardType === "heavy_rain" && <CloudRain className="w-5 h-5" />}
                    {alert.hazardType === "poor_air_quality" && <Wind className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {isHi ? (alert.title_hi || alert.title) : alert.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{alert.location}, {alert.state}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    isCritical
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : isSevere
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHi ? (alert.description_hi || alert.description) : alert.description}
              </p>

              {/* Advisory Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isHi ? "सुरक्षा दिशानिर्देश:" : "Safety Directive:"}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {isHi ? (alert.safety_action_hi || alert.safetyAction) : alert.safetyAction}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{isHi ? "\u0938\u092E\u092F" : "Issued"}: {alert.time}</span>
                </div>
                <span className="font-semibold text-slate-500">{alert.affectedArea}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
