import { useState, useEffect } from "react";
import {
  X,
  Map,
  Layers,
  Image as ImageIcon,
  Navigation,
  Building2,
  ExternalLink,
  CheckCircle2,
  Search,
  Sparkles
} from "lucide-react";
import {
  MAPPLS_TILE_CONFIGS,
  searchMapplsPlaces,
  getMapplsStaticMap,
  fetchMapplsNearby,
  fetchMapplsRoute
} from "../lib/mapplsService";

export const MapplsHubModal = ({
  isOpen,
  onClose,
  location,
  weather,
  currentMapStyle,
  onSelectMapStyle,
  onSelectLocation,
  language
}) => {
  const [activeSubTab, setActiveSubTab] = useState("layers");
  const [staticMapUrl, setStaticMapUrl] = useState("");
  const [staticZoom, setStaticZoom] = useState(13);
  const [isLoadingStatic, setIsLoadingStatic] = useState(false);
  const [staticMeta, setStaticMeta] = useState({ provider: "Mappls", isLiveKey: false });
  const [nearbyCategory, setNearbyCategory] = useState("all");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [routeStart, setRouteStart] = useState(location?.city || "Delhi");
  const [routeDest, setRouteDest] = useState("Jaipur");
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [elocQuery, setElocQuery] = useState("");
  const [elocResults, setElocResults] = useState([]);
  const [isSearchingEloc, setIsSearchingEloc] = useState(false);

  const isHi = language === "hi";

  useEffect(() => {
    if (!isOpen) return;
    if (activeSubTab === "static") {
      setIsLoadingStatic(true);
      getMapplsStaticMap(location?.lat || 28.6139, location?.lng || 77.209, staticZoom, 640, 360).then((res) => {
        setStaticMapUrl(res.url);
        setStaticMeta({ provider: res.provider, isLiveKey: res.isLiveKey });
        setIsLoadingStatic(false);
      });
    } else if (activeSubTab === "nearby") {
      setIsLoadingNearby(true);
      fetchMapplsNearby(nearbyCategory, location?.lat || 28.6139, location?.lng || 77.209).then((places) => {
        setNearbyPlaces(places);
        setIsLoadingNearby(false);
      });
    } else if (activeSubTab === "route" && !routeInfo) {
      handleCalculateRoute();
    }
  }, [isOpen, activeSubTab, location?.lat, location?.lng, staticZoom, nearbyCategory]);

  const handleCalculateRoute = () => {
    setIsLoadingRoute(true);
    fetchMapplsRoute(routeStart, routeDest).then((info) => {
      setRouteInfo(info);
      setIsLoadingRoute(false);
    });
  };

  const handleElocSearch = (e) => {
    e.preventDefault();
    if (!elocQuery.trim()) return;
    setIsSearchingEloc(true);
    searchMapplsPlaces(elocQuery, location?.lat || 28.6139, location?.lng || 77.209).then((results) => {
      setElocResults(results);
      setIsSearchingEloc(false);
    });
  };

  if (!isOpen) return null;

  return (
    <div id="mappls-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col text-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-white to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Mappls MapmyIndia
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-[10px] font-bold text-blue-700">
                  Advanced APIs
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isHi ? "भारत का राष्ट्रीय भू-स्थानिक एवं मौसम मानचित्रण" : "National Geospatial & Meteorological Mapping Platform"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Sub Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-100 bg-slate-50/80 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: "layers", label: isHi ? "मानचित्र शैलियां" : "Map Layers", icon: Layers },
            { id: "nearby", label: isHi ? "निकटतम मंडी व स्टेशन" : "Nearby Mandis & AWS", icon: Building2 },
            { id: "route", label: isHi ? "मौसम मार्ग कॉरिडोर" : "Route Hazard Corridor", icon: Navigation },
            { id: "eloc", label: isHi ? "eLoc व पिनकोड खोज" : "eLoc & Village Search", icon: Search }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: MAP LAYERS */}
          {activeSubTab === "layers" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHi ? "Mappls मानचित्र शैलियां चुनें:" : "Select Mappls Map Style:"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi ? "सर्वे ऑफ इंडिया आधारित सटीक भारतीय सीमाओं एवं ग्रामीण नेटवर्क के साथ" : "Official Survey of India aligned cadastral boundaries, highways, and terrain"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.keys(MAPPLS_TILE_CONFIGS).map((styleKey) => {
                  const cfg = MAPPLS_TILE_CONFIGS[styleKey];
                  const isSelected = currentMapStyle === styleKey;
                  return (
                    <button
                      key={styleKey}
                      onClick={() => onSelectMapStyle(styleKey)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{cfg.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500">{cfg.attribution}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Current Base: <strong className="font-bold">{MAPPLS_TILE_CONFIGS[currentMapStyle]?.name}</strong></span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 font-bold">Active</span>
              </div>
            </div>
          )}

          {/* TAB 2: NEARBY MANDIS & WEATHER STATIONS */}
          {activeSubTab === "nearby" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isHi ? "निकटतम कृषि मंडी व मौसम केंद्र" : "Nearby APMC Mandis, AWS & Emergency Shelters"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHi ? `${location?.city || "Current City"} के आसपार Mappls Nearby खोज` : `Mappls Nearby Places API around ${location?.city || "Current Location"}`}
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {[
                    { id: "all", label: isHi ? "सभी" : "All" },
                    { id: "mandi", label: isHi ? "मंडी" : "Mandis" },
                    { id: "weather_station", label: isHi ? "IMD केंद्र" : "AWS" },
                    { id: "kvk", label: isHi ? "KVK" : "KVK" },
                    { id: "shelter", label: isHi ? "राहत शिविर" : "Shelters" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNearbyCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        nearbyCategory === cat.id ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Places List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {isLoadingNearby ? (
                  <div className="py-8 text-center text-xs text-slate-500">Loading nearby places...</div>
                ) : nearbyPlaces.length > 0 ? (
                  nearbyPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-start justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{place.name}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] border border-blue-200">
                            {place.eLoc}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{place.address}</p>
                        {place.weatherRisk && (
                          <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <span>• {place.weatherRisk}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-blue-600 block">{place.distanceKm} km</span>
                        {place.phone && <span className="text-[10px] text-slate-500 font-mono block mt-0.5">📞 {place.phone}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">No nearby places found in this category.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ROUTE HAZARD CORRIDOR */}
          {activeSubTab === "route" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHi ? "राष्ट्रीय राजमार्ग मौसम मार्ग विश्लेषक" : "Highway Weather Hazard Corridor"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi ? "Mappls Driving Route API के साथ लाइव मौसम जोखिम और सलाह" : "Mappls Routing API with active weather risk corridors across Indian highways"}
                </p>
              </div>

              {/* Route Input Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">From:</span>
                  <input
                    type="text"
                    value={routeStart}
                    onChange={(e) => setRouteStart(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 outline-none font-semibold"
                  />
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">To:</span>
                  <input
                    type="text"
                    value={routeDest}
                    onChange={(e) => setRouteDest(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 outline-none font-semibold"
                  />
                </div>
              </div>

              <button
                onClick={handleCalculateRoute}
                disabled={isLoadingRoute}
                className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isLoadingRoute ? "Calculating corridor..." : isHi ? "मौसम मार्ग का विश्लेषण करें" : "Analyze Highway Weather Route"}</span>
              </button>

              {/* Route Corridor Results */}
              {routeInfo && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-blue-950">{routeInfo.summary}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">Total Distance: {routeInfo.distanceKm} km</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-700">{Math.floor(routeInfo.durationMinutes / 60)}h {routeInfo.durationMinutes % 60}m</div>
                      <div className="text-[10px] text-slate-500">Est. Travel Time</div>
                    </div>
                  </div>

                  {/* Hazard Segments along Route */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {isHi ? "मार्ग पर सक्रिय मौसम जोखिम:" : "Active Weather Hazard Segments:"}
                    </span>
                    {routeInfo.hazardSegments.map((seg, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900">KM {seg.startKm} - KM {seg.endKm}: {seg.hazard}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-semibold uppercase">{seg.level}</span>
                        </div>
                        <p className="text-[11px] text-slate-700">{seg.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ELOC & VILLAGE SEARCH */}
          {activeSubTab === "eloc" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHi ? "Mappls eLoc व पिनकोड डिजिटल खोज" : "Mappls eLoc (Digital Address) & PIN Search"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi ? "भारत के किसी भी 6-अकीय eLoc कोड या पिनकोड से स्थान खोजें" : "Search any 6-character eLoc digital address code, village, APMC mandi, or PIN code"}
                </p>
              </div>

              <form onSubmit={handleElocSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={elocQuery}
                    onChange={(e) => setElocQuery(e.target.value)}
                    placeholder="Enter eLoc (e.g. MMI001), PIN (110001), or Village..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingEloc}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  {isSearchingEloc ? "Searching..." : "Search"}
                </button>
              </form>

              {/* Results List */}
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                {elocResults.length > 0 ? (
                  elocResults.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => {
                        onSelectLocation({
                          lat: place.latitude,
                          lng: place.longitude,
                          city: place.placeName,
                          state: place.state,
                          country: "India"
                        });
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{place.placeName}</span>
                          {place.eLoc && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] border border-blue-200">
                              {place.eLoc}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{place.placeAddress}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 shrink-0 ml-2">Select →</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-xs text-slate-500">Try searching for famous eLocs:</p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      {["MMI001 (New Delhi)", "MMI002 (Mumbai)", "AZD110 (Azadpur Mandi)", "IMD001 (Safdarjung AWS)"].map((hint) => (
                        <button
                          key={hint}
                          onClick={() => {
                            setElocQuery(hint.split(" ")[0]);
                            searchMapplsPlaces(hint.split(" ")[0], location?.lat || 28.6139, location?.lng || 77.209).then(setElocResults);
                          }}
                          className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-blue-700 font-mono hover:bg-slate-100 cursor-pointer shadow-2xs"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Powered by MapmyIndia Mappls</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            {isHi ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
