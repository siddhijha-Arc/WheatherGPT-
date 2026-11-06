import { useState, useEffect } from "react";
import { X, Search, MapPin, Crosshair, Sparkles, Clock } from "lucide-react";
import { MAJOR_INDIAN_CITIES } from "../data/indiaWeatherData";
import { translations } from "../lib/translations";
import { searchMapplsPlaces } from "../lib/mapplsService";
export const LocationSelectModal = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onLocateGPS,
  isLocating,
  language = "en"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mapplsResults, setMapplsResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const t = translations[language];
  const isHi = language === "hi";

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = JSON.parse(localStorage.getItem("weathergpt_recent_locations") || "[]");
        setRecentLocations(saved);
      } catch (e) {
        setRecentLocations([]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setMapplsResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      searchMapplsPlaces(searchTerm.trim(), currentLocation.lat, currentLocation.lng).then((places) => {
        setMapplsResults(places);
        setIsSearching(false);
      }).catch(() => {
        setIsSearching(false);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, currentLocation.lat, currentLocation.lng]);
  if (!isOpen) return null;
  const filteredCities = MAJOR_INDIAN_CITIES.filter(
    (c) => ((c?.city || "").toLowerCase().includes((searchTerm || "").toLowerCase()) || (c?.state || "").toLowerCase().includes((searchTerm || "").toLowerCase()))
  );
  return <div id="location-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl space-y-4 relative text-slate-100 animate-in fade-in">
        {
    /* Close Button */
  }
        <button
    onClick={onClose}
    id="close-location-modal"
    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
  >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>{isHi ? "स्थान चुनें (Mappls मैप्स)" : "Select Location (Mappls)"}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHi ? "शहर, मंडी, पिनकोड या eLoc कोड खोजें" : "Search Indian city, mandi, PIN code, or 6-digit eLoc"}
          </p>
        </div>

        {
    /* GPS Button */
  }
        <button
    onClick={() => {
      onLocateGPS();
      onClose();
    }}
    disabled={isLocating}
    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 hover:border-blue-400 text-blue-300 font-bold text-xs hover:bg-blue-500/25 transition-all cursor-pointer"
  >
          <Crosshair className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? t.locating : isHi ? "वर्तमान जीपीएस स्थान का उपयोग करें" : "Use My Current GPS Location"}</span>
        </button>

        {
    /* Search Field */
  }
        <div className="relative space-y-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isHi ? "अपना सही गांव, शहर या पिनकोड (उदा. 577000) दर्ज करें..." : "Type exact village, city, or PIN (e.g., 577000)..."}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
            {isSearching && <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
          </div>
          <p className="text-[10px] text-amber-400 font-medium px-0.5">
            {isHi ? "💡 यदि GPS सही स्थान न बताए, तो यहाँ अपना पिनकोड या गांव/शहर लिखकर सेट करें।" : "💡 If GPS is approximate, type your exact PIN code or town/village name above."}
          </p>
        </div>

        {/* Recent Searched Locations (Last 3) */}
        {recentLocations.length > 0 && !searchTerm.trim() && (
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{isHi ? "हाल के खोजे गए स्थान (Last 3):" : "Last 3 Searched Locations:"}</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <MapPin className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="truncate max-w-[140px]">{loc.city}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {
    /* Mappls Live Results OR Standard Popular Cities Grid */
  }
        <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
          {mapplsResults.length > 0 ? <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Mappls Suggested Locations:</span>
              </span>
              {mapplsResults.map((place) => <button
    key={place.id}
    onClick={() => {
      onSelectLocation({
        lat: place.latitude,
        lng: place.longitude,
        city: place.placeName,
        state: place.state || "India",
        country: "India"
      });
      onClose();
    }}
    className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:bg-slate-800/80 text-left transition-all cursor-pointer flex items-center justify-between"
  >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{place.placeName}</span>
                      {place.eLoc && <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[9px]">
                          {place.eLoc}
                        </span>}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{place.placeAddress}</span>
                  </div>
                  <span className="text-xs text-blue-400 font-semibold shrink-0">Select →</span>
                </button>)}
            </div> : <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                {isHi ? "\u092A\u094D\u0930\u092E\u0941\u0916 \u092E\u094C\u0938\u092E \u0915\u0947\u0902\u0926\u094D\u0930:" : "Major Meteorological Stations:"}
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                {filteredCities.map((city) => {
    const isSelected = (city?.city || "").toLowerCase() === (currentLocation?.city || "").toLowerCase();
    return <button
      key={city.city}
      id={`city-select-${city.city}`}
      onClick={() => {
        onSelectLocation({
          lat: city.lat,
          lng: city.lng,
          city: city.city,
          state: city.state,
          country: "India"
        });
        onClose();
      }}
      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${isSelected ? "bg-blue-500/20 border-blue-500 text-blue-300 font-bold" : "bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300"}`}
    >
                      <div className="min-w-0">
                        <span className="text-xs font-semibold block truncate">{city.city}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{city.state}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-400 shrink-0 ml-1.5">
                        {city.temp}°C
                      </span>
                    </button>;
  })}
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
