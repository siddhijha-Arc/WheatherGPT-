import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { fetchExactAddress, searchExactLocations, detectNetworkLocation, getPreciseUserLocation } from "../lib/geoAddressService";

const POPULAR_CITIES = [
  { city: "New Delhi", cityHi: "नई दिल्ली", state: "Delhi", pincode: "110001", lat: 28.6139, lng: 77.2090, street: "Connaught Place" },
  { city: "Mumbai", cityHi: "मुंबई", state: "Maharashtra", pincode: "400001", lat: 19.0760, lng: 72.8777, street: "Fort, South Mumbai" },
  { city: "Bengaluru", cityHi: "बेंगलुरु", state: "Karnataka", pincode: "560001", lat: 12.9716, lng: 77.5946, street: "MG Road, Central" },
  { city: "Patna", cityHi: "पटना", state: "Bihar", pincode: "800001", lat: 25.5941, lng: 85.1376, street: "Fraser Road, Dak Bungalow" },
  { city: "Kolkata", cityHi: "कोलकाता", state: "West Bengal", pincode: "700001", lat: 22.5726, lng: 88.3639, street: "BBD Bagh, Central" },
  { city: "Lucknow", cityHi: "लखनऊ", state: "Uttar Pradesh", pincode: "226001", lat: 26.8467, lng: 80.9462, street: "Hazratganj, Central" },
  { city: "Hyderabad", cityHi: "हैदराबाद", state: "Telangana", pincode: "500001", lat: 17.3850, lng: 78.4867, street: "Abids, Central" },
  { city: "Jaipur", cityHi: "जयपुर", state: "Rajasthan", pincode: "302001", lat: 26.9124, lng: 75.7873, street: "MI Road, Pink City" },
  { city: "Pune", cityHi: "पुणे", state: "Maharashtra", pincode: "411001", lat: 18.5204, lng: 73.8567, street: "FC Road, Shivajinagar" },
  { city: "Chennai", cityHi: "चेन्नई", state: "Tamil Nadu", pincode: "600001", lat: 13.0827, lng: 80.2707, street: "George Town, Central" }
];

export const AddressLocationPage = ({
  currentLocation,
  onSaveLocation,
  onBack,
  canGoBack = true,
  language = "en"
}) => {
  const isHi = language === "hi";

  const [houseStreet, setHouseStreet] = useState(() => {
    return localStorage.getItem("weathergpt_house_street") || "";
  });
  const [landmark, setLandmark] = useState(() => {
    return localStorage.getItem("weathergpt_landmark") || "";
  });
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem("weathergpt_pincode") || "";
  });
  const [city, setCity] = useState(currentLocation?.city || "New Delhi");
  const [stateName, setStateName] = useState(currentLocation?.state || "Delhi");
  const [coords, setCoords] = useState({
    lat: currentLocation?.lat || 28.6139,
    lng: currentLocation?.lng || 77.2090
  });

  const [permissionState, setPermissionState] = useState("prompt");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState("");
  const [detectSuccess, setDetectSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showLegalModal, setShowLegalModal] = useState(null);

  // Auto-search dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimerRef = useRef(null);

  // Interactive Mini Pinpoint Map refs
  const miniMapRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const miniMarkerRef = useRef(null);

  useEffect(() => {
    if (!miniMapRef.current) return;

    if (!miniMapInstanceRef.current) {
      const map = L.map(miniMapRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "custom-pinpoint-marker",
        html: `
          <div style="transform: translate(-50%, -100%); cursor: grab; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="background: #e11d48; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; border: 1.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); white-space: nowrap; text-align: center;">
              📍 ${isHi ? "सटीक पिन" : "Exact Pin"}
            </div>
            <div style="width: 28px; height: 36px; margin: 0 auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
              <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="#e11d48" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 36]
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      marker.on("dragend", async (e) => {
        const p = e.target.getLatLng();
        setCoords({ lat: p.lat, lng: p.lng });
        await reverseGeocode(p.lat, p.lng);
      });

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        await reverseGeocode(lat, lng);
      });

      miniMapInstanceRef.current = map;
      miniMarkerRef.current = marker;
    } else {
      miniMapInstanceRef.current.setView([coords.lat, coords.lng], miniMapInstanceRef.current.getZoom() || 15);
      if (miniMarkerRef.current) {
        miniMarkerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }
  }, [coords.lat, coords.lng, isHi]);

  useEffect(() => {
    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((res) => {
        setPermissionState(res.state);
        res.onchange = () => setPermissionState(res.state);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      lookupPincode(pincode);
    } else {
      setPincodeInfo(null);
    }
  }, [pincode]);

  const lookupPincode = async (pin) => {
    setPincodeLoading(true);
    try {
      const res = await fetch(`/api/pincode/${pin}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const foundDistrict = po.District || po.Block || po.Circle;
          const foundState = po.State;
          if (foundDistrict) setCity(foundDistrict);
          if (foundState) setStateName(foundState);
          
          if (po.Latitude && po.Longitude) {
            setCoords({
              lat: parseFloat(po.Latitude),
              lng: parseFloat(po.Longitude)
            });
          }

          setPincodeInfo({
            district: foundDistrict,
            state: foundState,
            area: po.Name
          });
          setFormErrors((prev) => ({ ...prev, pincode: null }));
        }
      }
    } catch (err) {
      console.warn("Pincode lookup error:", err);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleCitySearchInput = (val) => {
    setCity(val);
    setSearchQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowSearchDropdown(true);
      searchTimerRef.current = setTimeout(async () => {
        const res = await searchExactLocations(val, language);
        setSearchResults(res || []);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    setCity(item.city);
    setStateName(item.state || "India");
    if (item.pincode) setPincode(item.pincode);
    if (item.lat && item.lng) {
      setCoords({ lat: item.lat, lng: item.lng });
    }
    setShowSearchDropdown(false);
    setDetectSuccess(true);
    setErrorMessage("");
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const exact = await fetchExactAddress(latitude, longitude, language);
      if (exact) {
        if (exact.street || exact.houseStreet) setHouseStreet(exact.street || exact.houseStreet);
        if (exact.city) setCity(exact.city);
        if (exact.state) setStateName(exact.state);
        if (exact.pincode) setPincode(exact.pincode);
        return exact;
      }
    } catch (e) {
      console.warn("Reverse geocode error:", e);
    }
    return null;
  };

  const finishSuccess = (lat, lng, defaultCity, defaultState) => {
    setIsDetecting(false);
    setDetectSuccess(true);
    setErrorMessage("");
    setDetectStatus("");
    if (defaultCity && !city) setCity(defaultCity);
    if (defaultState && !stateName) setStateName(defaultState);
  };

  const tryNetworkIpLocation = async () => {
    try {
      setDetectStatus(isHi ? "सटीक नेटवर्क आईपी से स्थान खोजा जा रहा है..." : "Resolving network IP location...");
      const ipData = await detectNetworkLocation(language);
      if (ipData && ipData.lat && ipData.lng) {
        setCoords({ lat: ipData.lat, lng: ipData.lng });
        if (ipData.city) setCity(ipData.city);
        if (ipData.state) setStateName(ipData.state);
        if (ipData.pincode) setPincode(ipData.pincode);
        finishSuccess(ipData.lat, ipData.lng, ipData.city || "New Delhi", ipData.state || "Delhi");
        return true;
      }
    } catch (err) {
      console.warn("IP location fallback failed:", err);
    }
    return false;
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setDetectStatus(isHi ? "सटीक पिनपॉइंट जीपीएस स्थान प्राप्त किया जा रहा है..." : "Acquiring exact pinpoint GPS location...");
    setErrorMessage("");
    setDetectSuccess(false);

    try {
      const precise = await getPreciseUserLocation(language);
      if (precise && precise.lat && precise.lng) {
        setCoords({ lat: precise.lat, lng: precise.lng });
        if (precise.houseStreet || precise.street) setHouseStreet(precise.houseStreet || precise.street);
        if (precise.city) setCity(precise.city);
        if (precise.state) setStateName(precise.state);
        if (precise.pincode) setPincode(precise.pincode);
        finishSuccess(precise.lat, precise.lng, precise.city, precise.state);
      } else {
        throw new Error("Precise resolution returned empty");
      }
    } catch (err) {
      console.warn("Exact location resolution failed, trying fallback:", err);
      const netSuccess = await tryNetworkIpLocation();
      if (!netSuccess) {
        setIsDetecting(false);
        setErrorMessage(
          isHi
            ? "स्थान की अनुमति नहीं मिली। कृपया मानचित्र पर पिन खींचें या नीचे दिए गए शहर चुनें।"
            : "Location access unavailable. Please drag the pin on map or select a city below."
        );
      }
    }
  };

  const handleSelectPresetCity = (item) => {
    setCity(isHi && item.cityHi ? item.cityHi : item.city);
    setStateName(item.state);
    setPincode(item.pincode);
    setHouseStreet(item.street);
    setCoords({ lat: item.lat, lng: item.lng });
    setDetectSuccess(true);
    setErrorMessage("");
    setFormErrors({});
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanStreet = houseStreet.trim() || `Central ${city}`;
    const cleanPin = pincode.trim() || "110001";
    const cleanCity = city.trim() || (isHi ? "नई दिल्ली" : "New Delhi");
    const cleanState = stateName.trim() || "Delhi";

    const fullFormatted = [cleanStreet, cleanCity, cleanState, cleanPin ? `PIN: ${cleanPin}` : "", "India"].filter(Boolean).join(", ");

    localStorage.setItem("weathergpt_house_street", cleanStreet);
    localStorage.setItem("weathergpt_landmark", landmark.trim());
    localStorage.setItem("weathergpt_pincode", cleanPin);
    localStorage.setItem("weathergpt_city", cleanCity);
    localStorage.setItem("weathergpt_state", cleanState);
    localStorage.setItem("weathergpt_formatted_address", fullFormatted);
    localStorage.setItem("weathergpt_lat", coords.lat.toString());
    localStorage.setItem("weathergpt_lng", coords.lng.toString());
    localStorage.setItem("weathergpt_has_location", "true");

    onSaveLocation({
      lat: coords.lat,
      lng: coords.lng,
      city: cleanCity,
      state: cleanState,
      country: "India",
      houseStreet: cleanStreet,
      landmark: landmark.trim(),
      pincode: cleanPin,
      formattedAddress: fullFormatted
    });
  };

  return (
    <div className="mesh-bg min-h-screen text-[#191c21] flex justify-center items-start pt-4 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
      <main className="w-full max-w-5xl flex flex-col gap-5 relative z-10 animate-in fade-in duration-300">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canGoBack && onBack && (
              <button
                id="back-to-home-btn"
                type="button"
                onClick={onBack}
                className="p-2 rounded-full hover:bg-white/40 active:scale-95 transition-all text-[#191c21] cursor-pointer"
                title={isHi ? "पीछे जाएं" : "Back"}
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
            )}
            <div>
              <h1 className="text-[22px] sm:text-[26px] font-bold text-[#191c21] tracking-tight">
                {isHi ? "पता एवं स्थान सेटिंग्स" : "Address & Location Settings"}
              </h1>
              <p className="text-xs sm:text-sm text-[#414751]">
                {isHi
                  ? "सटीक स्थानीय मौसम अलर्ट एवं लाइव डॉपलर रडार के लिए स्थान सेट करें"
                  : "Enable pinpoint location for hyper-local weather alerts & live Doppler radar"}
              </p>
            </div>
          </div>
        </header>

        {/* Responsive Desktop 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Address Form */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {detectSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-xs">
                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                <span>
                  {isHi ? "स्थान निर्धारित:" : "Location Detected:"} <strong>{city}, {stateName}</strong> ({pincode || "110001"}).
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-xs">
                <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Address Form */}
            <form onSubmit={handleSave} className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 shadow-[0_4px_24px_rgba(0,93,172,0.08)]">
              <div>
                <h2 className="text-base font-bold text-[#191c21]">
                  {isHi ? "क्षेत्र एवं डाक पता" : "Area & Postal Address"}
                </h2>
                <p className="text-xs text-[#414751]">
                  {isHi
                    ? "स्थानीय वर्षा और कृषि मौसम पूर्वानुमान के लिए अपने क्षेत्र की पुष्टि करें"
                    : "Confirm your local area to customize precipitation and agro-meteorological forecasts"}
                </p>
              </div>

              {/* Field 1: House/Street Number */}
              <div className="relative mt-2">
                <label className="absolute -top-2.5 left-3 bg-white/95 backdrop-blur-sm px-1.5 text-xs font-bold text-[#004583] rounded z-10 shadow-2xs">
                  {isHi ? "मकान / गली / क्षेत्र / मोहल्ला" : "House / Street / Locality"}
                </label>
                <div className="input-glass rounded-xl flex items-center px-3.5 py-3">
                  <span className="material-symbols-outlined text-[#004583]/70 mr-3 text-[20px]">
                    home
                  </span>
                  <input
                    id="input-house-street"
                    type="text"
                    value={houseStreet}
                    onChange={(e) => setHouseStreet(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-[#191c21] placeholder:text-[#414751]/50 focus:ring-0 p-0 text-sm font-medium"
                    placeholder={isHi ? "उदा. फ्लैट 402, ब्लॉक बी, एमजी रोड" : "e.g., Flat 402, Block B, MG Road"}
                  />
                </div>
              </div>

              {/* Field 2: Landmark (Optional) */}
              <div className="relative mt-2">
                <label className="absolute -top-2.5 left-3 bg-white/95 backdrop-blur-sm px-1.5 text-xs font-bold text-[#004583] rounded z-10 shadow-2xs">
                  {isHi ? "प्रसिद्ध स्थान / लैंडमार्क (वैकल्पिक)" : "Landmark (Optional)"}
                </label>
                <div className="input-glass rounded-xl flex items-center px-3.5 py-3">
                  <span className="material-symbols-outlined text-[#004583]/70 mr-3 text-[20px]">
                    map
                  </span>
                  <input
                    id="input-landmark"
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-[#191c21] placeholder:text-[#414751]/50 focus:ring-0 p-0 text-sm font-medium"
                    placeholder={isHi ? "उदा. मेट्रो स्टेशन के पास / एसबीआई बैंक" : "e.g., Near Metro Station / SBI Bank"}
                  />
                </div>
              </div>

              {/* Row: Pincode & City/State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {/* Field 3: Pincode */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white/95 backdrop-blur-sm px-1.5 text-xs font-bold text-[#004583] rounded z-10 shadow-2xs">
                    {isHi ? "6-अंकीय पिनकोड" : "6-Digit Pincode"}
                  </label>
                  <div className="input-glass rounded-xl flex items-center px-3.5 py-3">
                    <span className="material-symbols-outlined text-[#004583]/70 mr-2.5 text-[20px]">
                      mail
                    </span>
                    <input
                      id="input-pincode"
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPincode(val);
                      }}
                      className="bg-transparent border-none outline-none w-full text-[#191c21] placeholder:text-[#414751]/50 focus:ring-0 p-0 text-sm font-bold tracking-wider"
                      placeholder={isHi ? "उदा. 110001" : "e.g., 110001"}
                    />
                    {pincodeLoading && (
                      <span className="material-symbols-outlined text-[18px] text-[#004583] animate-spin">
                        progress_activity
                      </span>
                    )}
                  </div>
                  {pincodeInfo && (
                    <p className="text-emerald-700 text-[11px] font-semibold mt-1 ml-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>{pincodeInfo.district}, {pincodeInfo.state}</span>
                    </p>
                  )}
                </div>

                {/* Field 4: City / District */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white/95 backdrop-blur-sm px-1.5 text-xs font-bold text-[#004583] rounded z-10 shadow-2xs">
                    {isHi ? "शहर / ज़िला (खोजें)" : "City / District (Search)"}
                  </label>
                  <div className="input-glass rounded-xl flex items-center px-3.5 py-3">
                    <span className="material-symbols-outlined text-[#004583]/70 mr-2.5 text-[20px]">
                      location_city
                    </span>
                    <input
                      id="input-city"
                      type="text"
                      value={city}
                      onChange={(e) => handleCitySearchInput(e.target.value)}
                      onFocus={() => {
                        if (searchResults.length > 0) setShowSearchDropdown(true);
                      }}
                      className="bg-transparent border-none outline-none w-full text-[#191c21] placeholder:text-[#414751]/50 focus:ring-0 p-0 text-sm font-semibold"
                      placeholder={isHi ? "उदा. नई दिल्ली / वाराणसी / पटना" : "e.g., New Delhi / Varanasi / Patna"}
                    />
                    {isSearching && (
                      <span className="material-symbols-outlined text-[18px] text-[#004583] animate-spin">
                        progress_activity
                      </span>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl z-50 max-h-52 overflow-y-auto p-1.5 space-y-1 animate-in fade-in">
                      {searchResults.map((item, idx) => (
                        <button
                          key={`${item.city}-${item.lat}-${idx}`}
                          type="button"
                          onClick={() => handleSelectSearchResult(item)}
                          className="w-full text-left p-2 rounded-xl hover:bg-blue-50 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
                        >
                          <span className="material-symbols-outlined text-blue-600 text-base mt-0.5">location_on</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate">
                              {item.city} {item.pincode ? `(${item.pincode})` : ""}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.formattedAddress || `${item.district || item.city}, ${item.state}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* State Field */}
              <div className="relative mt-2">
                <label className="absolute -top-2.5 left-3 bg-white/95 backdrop-blur-sm px-1.5 text-xs font-bold text-[#004583] rounded z-10 shadow-2xs">
                  {isHi ? "राज्य / केंद्र शासित प्रदेश" : "State / UT"}
                </label>
                <div className="input-glass rounded-xl flex items-center px-3.5 py-3">
                  <span className="material-symbols-outlined text-[#004583]/70 mr-3 text-[20px]">
                    public
                  </span>
                  <input
                    id="input-state"
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-[#191c21] placeholder:text-[#414751]/50 focus:ring-0 p-0 text-sm font-semibold"
                    placeholder={isHi ? "उदा. दिल्ली / उत्तर प्रदेश / बिहार / महाराष्ट्र" : "e.g., Delhi NCR / Maharashtra / Uttar Pradesh"}
                  />
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                id="save-address-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-[#004583] to-[#005dac] hover:from-[#00386b] hover:to-[#004b8b] text-white font-bold py-4 px-6 rounded-full mt-4 transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>{isHi ? "पता सहेजें एवं मौसम डैशबोर्ड खोलें" : "Save Address & Open Weather Dashboard"}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>
          </div>

          {/* Right Column: GPS Radar & City Shortcuts */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <section className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_24px_rgba(0,93,172,0.08)]">
              <div className="bg-[#004583]/10 px-4 py-2.5 border-b border-white/40 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#004583] text-center w-full flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">pin_drop</span>
                  <span>{isHi ? "सटीक पिनपॉइंट मानचित्र (Pin Point)" : "Exact Pin Point Map"}</span>
                </h2>
              </div>

              {/* Interactive Mini Pinpoint Map Container */}
              <div className="relative h-56 sm:h-64 w-full bg-slate-950 overflow-hidden">
                <div
                  ref={miniMapRef}
                  className="w-full h-full z-0 cursor-crosshair"
                  id="address-mini-pinpoint-map"
                />

                {/* Floating instruction pill */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 text-white text-[10.5px] font-semibold px-3 py-1 rounded-full border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 pointer-events-none whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>{isHi ? "पिन खींचें या मानचित्र पर टैप करें" : "Drag pin or tap map to pinpoint"}</span>
                </div>

                {/* Floating live coordinate readout */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-slate-900/95 text-white text-[10px] font-mono px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-rose-400 text-[14px]">my_location</span>
                    <span className="font-bold text-cyan-300 truncate">
                      {Number(coords.lat).toFixed(6)}°N, {Number(coords.lng).toFixed(6)}°E
                    </span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-sans font-bold shrink-0 ml-2">
                    {isHi ? "सटीक जीपीएस" : "Pinpoint"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/50 space-y-2">
                <button
                  id="detect-location-btn"
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="w-full bg-[#6cbdfe] hover:bg-[#6cbdfe]/90 active:scale-[0.98] text-[#004b74] font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-75"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isDetecting ? "animate-spin" : ""}`}>
                    {isDetecting ? "progress_activity" : "my_location"}
                  </span>
                  <span>
                    {isDetecting
                      ? (detectStatus || (isHi ? "सटीक स्थान खोजा जा रहा है..." : "Detecting Pinpoint Location..."))
                      : (isHi ? "सटीक डिवाइस जीपीएस का उपयोग करें" : "Use Exact Device Pinpoint GPS")}
                  </span>
                </button>
              </div>
            </section>

            {/* Quick Select Popular Cities */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,93,172,0.08)] space-y-2.5">
              <p className="text-xs font-bold text-[#414751] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">location_city</span>
                {isHi ? "या तुरंत अपना शहर चुनें:" : "Or select your city quickly:"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => handleSelectPresetCity(c)}
                    className={`text-xs py-1.5 px-3 rounded-full font-medium transition-all cursor-pointer ${
                      city === c.city || (isHi && city === c.cityHi)
                        ? "bg-[#004583] text-white shadow-xs font-bold"
                        : "bg-white/80 hover:bg-white text-[#191c21] border border-slate-200"
                    }`}
                  >
                    {isHi && c.cityHi ? c.cityHi : c.city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="flex justify-center items-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => setShowLegalModal("privacy")}
            className="text-xs text-[#004583] hover:underline font-semibold cursor-pointer"
          >
            {isHi ? "गोपनीयता नीति" : "Privacy Policy"}
          </button>
          <span className="text-[#004583]/40">|</span>
          <button
            type="button"
            onClick={() => setShowLegalModal("terms")}
            className="text-xs text-[#004583] hover:underline font-semibold cursor-pointer"
          >
            {isHi ? "उपयोग की शर्तें" : "Terms of Use"}
          </button>
        </footer>
      </main>

      {/* Legal Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {showLegalModal === "privacy"
                  ? (isHi ? "गोपनीयता नीति" : "Privacy Policy")
                  : (isHi ? "उपयोग की शर्तें" : "Terms of Use")}
              </h3>
              <button
                type="button"
                onClick={() => setShowLegalModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto leading-relaxed">
              {showLegalModal === "privacy" ? (
                <>
                  <p>
                    {isHi
                      ? "WeatherGPT पंजीकृत स्थान निर्देशांक का उपयोग केवल स्थानीय मौसम अलर्ट, वर्षा पूर्वानुमान चार्ट और कृषि चेतावनी देने के लिए करता है।"
                      : "WeatherGPT uses registered location coordinates exclusively to provide hyper-local weather alerts, rainfall precipitation charts, and agricultural crop warnings."}
                  </p>
                  <p>
                    {isHi
                      ? "सभी स्थान प्राथमिकताएं आपके उपकरण में सुरक्षित रखी जाती हैं।"
                      : "All location preferences are securely cached locally and never sold to third-party advertisers."}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {isHi
                      ? "WeatherGPT पर पता दर्ज करके आप सहमत होते हैं कि मौसम डेटा आधिकारिक स्रोतों (IMD, Doppler Radars, OpenMeteo) से सलाहकार सहायता के लिए लिया गया है।"
                      : "By registering an address on WeatherGPT, you agree that weather data is gathered from official telemetry sources (IMD, Doppler Radars, OpenMeteo) for advisory assistance."}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowLegalModal(null)}
              className="w-full py-2.5 rounded-full bg-[#004583] text-white font-semibold text-xs cursor-pointer hover:bg-[#004583]/90"
            >
              {isHi ? "समझ गया" : "Understood"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
