export const HazardLegend = ({ activeLayer }) => {
  const getLegendConfig = () => {
    switch (activeLayer) {
      case "rain":
        return {
          title: "Rainfall Intensity (mm/h)",
          gradient: "linear-gradient(to right, #bae6fd, #38bdf8, #2563eb, #1e3a8a, #0b192c)",
          labels: ["< 5 mm (Light)", "15 mm", "35 mm", "75+ mm (Torrential)"]
        };
      case "wind":
        return {
          title: "Wind Speed & Gusts (km/h)",
          gradient: "linear-gradient(to right, #a7f3d0, #34d399, #0d9488, #115e59, #042f2e)",
          labels: ["< 15 km/h", "35 km/h", "65 km/h", "90+ km/h (Gale)"]
        };
      case "humidity":
        return {
          title: "Relative Humidity (%)",
          gradient: "linear-gradient(to right, #e9d5ff, #c084fc, #9333ea, #6b21a8, #3b0764)",
          labels: ["30% (Dry)", "50%", "75%", "95%+ (Saturated)"]
        };
      case "heatwave":
        return {
          title: "Surface Temperature / Heat Index (\xB0C)",
          gradient: "linear-gradient(to right, #fef08a, #facc15, #fb923c, #ef4444, #991b1b)",
          labels: ["28\xB0C", "36\xB0C", "42\xB0C (Loo)", "47\xB0C+ (Extreme)"]
        };
      case "cyclone":
        return {
          title: "Disaster / Cyclone Risk Index",
          gradient: "linear-gradient(to right, #fdba74, #f97316, #dc2626, #7f1d1d, #000000)",
          labels: ["Watch", "Alert", "Evacuation", "Severe Eye Wall"]
        };
      case "priority":
      default:
        return {
          title: "Priority Hazard Intensity",
          gradient: "linear-gradient(to right, #38bdf8, #facc15, #f97316, #ef4444, #881337)",
          labels: ["Normal", "Heatwave", "Flood Risk", "Cyclone / Severe"]
        };
    }
  };
  const config = getLegendConfig();
  return <div
    id="hazard-map-legend"
    className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 px-3 py-2 text-xs shadow-lg max-w-[280px] sm:max-w-[320px]"
  >
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
        <span>{config.title}</span>
        <span className="text-sky-400 font-mono text-[9px] uppercase tracking-wider">Radar Heatmap</span>
      </div>

      {
    /* Smooth Continuous Color Gradient Bar */
  }
      <div
    className="w-full h-2.5 rounded-full shadow-inner border border-white/10"
    style={{ background: config.gradient }}
  />

      {
    /* Range Scale Labels */
  }
      <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
        {config.labels.map((label, idx) => <span key={idx} className={idx === config.labels.length - 1 ? "font-bold text-rose-300" : ""}>
            {label}
          </span>)}
      </div>
    </div>;
};
