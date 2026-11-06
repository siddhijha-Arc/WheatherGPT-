import { User, MapPin, SlidersHorizontal, CloudSun } from "lucide-react";
export const Header = ({
  location,
  onOpenLocationModal,
  onOpenAuthModal,
  user,
  supabaseConnected
}) => {
  return <header id="weathergpt-header" className="sticky top-0 z-30 w-full px-3 sm:px-5 py-2.5 bg-[#070d18]/85 backdrop-blur-xl border-b border-sky-500/15 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {
    /* Left: Account Button + Status */
  }
        <div className="flex items-center gap-2">
          <button
    id="account-btn"
    onClick={onOpenAuthModal}
    aria-label="Account and Settings"
    className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 border border-sky-500/30 text-sky-400 hover:border-sky-400 hover:text-white transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500/50"
  >
            {user ? <span className="font-bold text-xs sm:text-sm text-sky-300">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span> : <User className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />}
            {
    /* Online Status Indicator */
  }
            <span
    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#070d18] ${supabaseConnected ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`}
    title={supabaseConnected ? "Supabase Connected" : "Local Edge Mode Active"}
  />
          </button>

          <div className="hidden lg:flex flex-col text-[11px] leading-tight">
            <span className="text-slate-200 font-medium">{user ? user.name || "User" : "Guest Mode"}</span>
            <span className="text-sky-400/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live Radar Active
            </span>
          </div>
        </div>

        {
    /* Center: WeatherGPT Logo + Beta Label + Subtitle */
  }
        <div className="flex flex-col items-center justify-center text-center select-none">
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 shadow-md shadow-cyan-500/20">
              <CloudSun className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-sky-100 to-cyan-400 bg-clip-text text-transparent">
              WeatherGPT
            </span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 tracking-wider">
              Beta
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
            India's AI Weather Assistant
          </p>
        </div>

        {
    /* Right: Location Selector + Settings Button */
  }
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
    id="location-selector-btn"
    onClick={onOpenLocationModal}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-sky-500/25 hover:border-sky-400/60 text-slate-200 transition-all text-xs font-medium max-w-[140px] sm:max-w-[200px] truncate shadow-sm group"
  >
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate">
              {location.city || "India"}
            </span>
          </button>

          <button
    id="settings-gear-btn"
    onClick={onOpenAuthModal}
    aria-label="Settings and Database Config"
    className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/70 border border-slate-700/60 text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition-all"
  >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>;
};
