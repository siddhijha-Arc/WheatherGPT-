import { useState } from "react";
import { Search, User } from "lucide-react";
import { getTranslation } from "../lib/translations";

export const TopSearchBar = ({
  onSearchSubmit,
  onOpenProfile,
  onOpenSearch,
  language
}) => {
  const [searchValue, setSearchValue] = useState("");
  const t = getTranslation(language);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearchSubmit(searchValue.trim());
      setSearchValue("");
    } else {
      onOpenSearch();
    }
  };
  return (
    <div id="top-search-bar-container" className="w-full flex items-center gap-3 px-3 pt-3 pb-1 z-30 pointer-events-auto">
      <button
        id="user-profile-btn"
        onClick={onOpenProfile}
        aria-label="User Profile & Settings"
        className="w-11 h-11 shrink-0 rounded-full bg-white hover:bg-slate-50 text-blue-600 border border-slate-100 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        title="Profile & Cloud Sync"
      >
        <User className="w-5 h-5 text-blue-600" />
      </button>

      <form
        id="weather-search-form"
        onSubmit={handleSubmit}
        className="flex-1 min-w-0"
      >
        <div className="h-12 sm:h-13 w-full bg-white rounded-full shadow-md border border-slate-200 hover:border-slate-300 flex items-center px-4 sm:px-5 gap-3 transition-all">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="weather-search-input"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t.searchPlaceholder || "Ask about weather, alerts, safety..."}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-slate-800 placeholder-slate-400 font-medium truncate"
          />
        </div>
      </form>
    </div>
  );
};
