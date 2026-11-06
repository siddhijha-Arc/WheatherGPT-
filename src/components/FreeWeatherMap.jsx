import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import { MAJOR_INDIAN_CITIES } from "../data/indiaWeatherData";
import {
  calculateIDW,
  calculateWindVector,
  calculateDetailedProbeData,
  degreesToCardinal,
  getRampForLayer,
  interpolateColor,
  interpolateColorViewportAdaptive,
  getLayerUnit,
  getStationValue
} from "../lib/meteorologicalColorEngine";
import { fetchExactAddress, searchExactLocations } from "../lib/geoAddressService";
import { MAPPLS_TILE_CONFIGS, searchMapplsPlaces } from "../lib/mapplsService";
import { getTranslation } from "../lib/translations";
import { COLOR_SCALES } from "./MeteorologicalColorScaleBar";
import { InteractiveWeatherInspectorCard } from "./InteractiveWeatherInspectorCard";
import {
  CloudRain,
  AlertTriangle,
  Flame,
  Wind,
  Tornado,
  Droplets,
  Activity,
  Crosshair,
  Compass,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  Radio,
  Zap,
  Check,
  X,
  Plus,
  Minus,
  ZoomIn,
  MapPin,
  LocateFixed,
  Minimize2,
  Maximize2,
  Search,
  Loader2
} from "lucide-react";

export const SCAN_LAYERS = [
  {
    id: "priority",
    nameEn: "Hazard Radar",
    nameHi: "अलर्ट रडार",
    unit: "Risk",
    icon: AlertTriangle,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    badge: "LIVE",
    desc: "Multi-hazard IMD threat detector"
  },
  {
    id: "rain_prob",
    nameEn: "Rain Chance",
    nameHi: "वर्षा संभावना",
    unit: "%",
    icon: Droplets,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    badge: "NEW",
    desc: "Predictive Doppler storm likelihood (%)"
  },
  {
    id: "rain",
    nameEn: "Rainfall",
    nameHi: "वर्षा (mm)",
    unit: "mm",
    icon: CloudRain,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-sky-600 bg-sky-50 border-sky-200",
    desc: "Localized precipitation rate (mm)"
  },
  {
    id: "heatwave",
    nameEn: "Heat & Temp",
    nameHi: "तापमान / लू",
    unit: "°C",
    icon: Flame,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    desc: "Surface thermal contours & Loo"
  },
  {
    id: "wind",
    nameEn: "Wind",
    nameHi: "पवन गति",
    unit: "km/h",
    icon: Wind,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    desc: "Animated wind streamlines & isotachs"
  },
  {
    id: "cyclone",
    nameEn: "Cyclone & Pressure",
    nameHi: "चक्रवात / दबाव",
    unit: "hPa",
    icon: Tornado,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    desc: "Barometric isobars & cyclone vortex"
  },
  {
    id: "humidity",
    nameEn: "Humidity",
    nameHi: "आर्द्रता (%)",
    unit: "%",
    icon: Droplets,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    desc: "Atmospheric moisture saturation"
  },
  {
    id: "air_quality",
    nameEn: "Air Quality (AQI)",
    nameHi: "वायु गुणवत्ता",
    unit: "AQI",
    icon: Activity,
    activeBg: "bg-[#1a2b4c] text-white border-[#1a2b4c]",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    desc: "CPCB particulate & pollution scan"
  }
];

export const POPULAR_QUICK_CITIES = [
  { city: "New Delhi", cityHi: "नई दिल्ली", state: "Delhi", lat: 28.6139, lng: 77.2090, pincode: "110001" },
  { city: "Mumbai", cityHi: "मुंबई", state: "Maharashtra", lat: 19.0760, lng: 72.8777, pincode: "400001" },
  { city: "Bengaluru", cityHi: "बेंगलुरु", state: "Karnataka", lat: 12.9716, lng: 77.5946, pincode: "560001" },
  { city: "Patna", cityHi: "पटना", state: "Bihar", lat: 25.5941, lng: 85.1376, pincode: "800001" },
  { city: "Lucknow", cityHi: "लखनऊ", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, pincode: "226001" },
  { city: "Kolkata", cityHi: "कोलकाता", state: "West Bengal", lat: 22.5726, lng: 88.3639, pincode: "700001" },
  { city: "Jaipur", cityHi: "जयपुर", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pincode: "302001" },
  { city: "Pune", cityHi: "पुणे", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pincode: "411001" }
];

export const FreeWeatherMap = ({
  location,
  onLocationChange,
  activeLayer = "priority",
  onLayerChange,
  weather,
  language = "en",
  onHoverProbe,
  tempUnit = "C",
  showStationNumbers = true,
  layerOpacity = 0.82,
  targetZoom,
  mapStyle = "standard",
  onOpenMapplsHub,
  hideTopLayerBar = false,
  showSearchBar = true,
  hideCircularGauge = false,
  onProbeChange
}) => {
  const mapContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const probeMarkerRef = useRef(null);
  const userAccuracyCircleRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const radarAngleRef = useRef(0);
  const windParticlesRef = useRef([]);
  const layerScrollRef = useRef(null);

  const onLocationChangeRef = useRef(onLocationChange);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const [stations, setStations] = useState(MAJOR_INDIAN_CITIES);
  const [mapReady, setMapReady] = useState(false);
  const [probeData, setProbeData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLayerBarMinimized, setIsLayerBarMinimized] = useState(false);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(5.2);
  const [selectedStation, setSelectedStation] = useState(null);
  const [viewportRange, setViewportRange] = useState(null);
  const [isPinpointMode, setIsPinpointMode] = useState(false);
  const [pinpointToast, setPinpointToast] = useState(null);

  // Map Search state
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchSuggestions, setMapSearchSuggestions] = useState([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [showMapSearchDropdown, setShowMapSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowMapSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map Search Real-time suggestions (Multi-Tier: Local Stations + High-Accuracy Geocoding + Mappls)
  useEffect(() => {
    if (!mapSearchQuery.trim()) {
      setMapSearchSuggestions([]);
      setIsSearchingMap(false);
      return;
    }

    const q = mapSearchQuery.trim();
    const qLower = q.toLowerCase();

    // 1. Instant local match from stations / major cities
    const localMatches = stations
      .filter((s) => (s.city && s.city.toLowerCase().includes(qLower)) || (s.state && s.state.toLowerCase().includes(qLower)))
      .slice(0, 6)
      .map((s) => ({
        city: s.city,
        state: s.state,
        lat: s.lat,
        lng: s.lng,
        temp: s.temp,
        condition: s.condition,
        hazard: s.hazard,
        source: "station"
      }));

    setMapSearchSuggestions(localMatches);
    setShowMapSearchDropdown(true);

    // 2. Query High-Accuracy Geocoder (Open-Meteo, PIN codes, Indian towns & villages) + Mappls
    const timer = setTimeout(async () => {
      setIsSearchingMap(true);
      try {
        const center = mapInstanceRef.current ? mapInstanceRef.current.getCenter() : { lat: 22.8, lng: 79.5 };
        const geoPromise = searchExactLocations(q, language);
        const mapplsPromise = searchMapplsPlaces(q, center.lat, center.lng);

        const [geoRes, mapRes] = await Promise.allSettled([geoPromise, mapplsPromise]);

        const combined = [...localMatches];
        const seen = new Set(localMatches.map((m) => `${Number(m.lat).toFixed(2)}_${Number(m.lng).toFixed(2)}`));

        if (geoRes.status === "fulfilled" && Array.isArray(geoRes.value)) {
          geoRes.value.forEach((item) => {
            const key = `${Number(item.lat).toFixed(2)}_${Number(item.lng).toFixed(2)}`;
            if (!seen.has(key)) {
              seen.add(key);
              combined.push({
                city: item.city || item.name,
                state: item.state || item.admin1 || item.district || "India",
                district: item.district,
                pincode: item.pincode,
                formattedAddress: item.formattedAddress,
                lat: item.lat,
                lng: item.lng,
                type: item.type,
                source: "geocoding"
              });
            }
          });
        }

        if (mapRes.status === "fulfilled" && Array.isArray(mapRes.value)) {
          mapRes.value.forEach((p) => {
            const lat = p.latitude || p.lat;
            const lng = p.longitude || p.lng;
            if (lat && lng) {
              const key = `${Number(lat).toFixed(2)}_${Number(lng).toFixed(2)}`;
              if (!seen.has(key)) {
                seen.add(key);
                combined.push({
                  city: p.placeName || p.poi,
                  state: p.placeAddress || "India",
                  lat,
                  lng,
                  eLoc: p.eLoc,
                  source: "mappls"
                });
              }
            }
          });
        }

        setMapSearchSuggestions(combined.slice(0, 10));
      } catch (err) {
        console.warn("Map search suggestion error:", err);
      } finally {
        setIsSearchingMap(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [mapSearchQuery, stations, language]);

  const handleSelectMapSearchResult = (item) => {
    const lat = item.lat ?? item.latitude;
    const lng = item.lng ?? item.longitude;
    const cityName = item.city || item.placeName || item.name;
    const stateName = item.state || item.placeAddress || item.admin1 || "India";
    const districtName = item.district || cityName;
    const pincode = item.pincode || "";
    const formatted = item.formattedAddress || `${cityName}, ${stateName}`;

    setMapSearchQuery("");
    setShowMapSearchDropdown(false);

    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 13, { animate: true, duration: 1.2 });
    }

    if (onLocationChangeRef.current && lat && lng) {
      onLocationChangeRef.current({
        city: cityName,
        locality: districtName,
        district: districtName,
        state: stateName,
        pincode: pincode,
        formattedAddress: formatted,
        lat,
        lng,
        country: "India",
        accuracy: 25,
        source: "map_search"
      });
    }

    // Trigger meteorological probe at this location
    const detailedProbe = calculateDetailedProbeData(lat, lng, stations, activeLayer, tempUnit);
    if (detailedProbe) {
      detailedProbe.cityName = cityName;
      detailedProbe.stateName = stateName;
      detailedProbe.formattedAddress = formatted;
      setProbeData(detailedProbe);
      if (onProbeChange) onProbeChange(detailedProbe);
    }

    setPinpointToast({
      message: language === "hi" ? `📍 मानचित्र स्थान चुना गया: ${cityName}` : `📍 Navigated to: ${cityName}`,
      type: "success"
    });
  };

  const handleDirectSearchSubmit = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsSearchingMap(true);
    try {
      const results = await searchExactLocations(queryText.trim(), language);
      if (results && results.length > 0) {
        handleSelectMapSearchResult(results[0]);
      } else {
        const q = queryText.trim().toLowerCase();
        const match = stations.find((s) => s.city.toLowerCase().includes(q) || s.state.toLowerCase().includes(q));
        if (match) {
          handleSelectMapSearchResult(match);
        } else {
          setPinpointToast({
            message: language === "hi" ? `स्थान "${queryText}" नहीं मिला` : `Location "${queryText}" not found`,
            type: "warning"
          });
        }
      }
    } catch (err) {
      console.warn("Direct map search failed:", err);
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleLocateMeGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy || 30;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 13.5, { animate: true, duration: 1.0 });
          }
          fetchExactAddress(lat, lng, language).then((addr) => {
            const cityName = addr?.city || "My Location";
            const stateName = addr?.state || "";
            if (onLocationChangeRef.current) {
              onLocationChangeRef.current({
                city: cityName,
                locality: addr?.locality || cityName,
                district: addr?.district || cityName,
                state: stateName,
                pincode: addr?.pincode || "",
                formattedAddress: addr?.formattedAddress || `${cityName}, ${stateName}`,
                lat,
                lng,
                accuracy: acc,
                country: "India",
                source: "gps_map"
              });
            }
            const detailedProbe = calculateDetailedProbeData(lat, lng, stations, activeLayer, tempUnit);
            if (detailedProbe) {
              detailedProbe.cityName = cityName;
              detailedProbe.stateName = stateName;
              detailedProbe.formattedAddress = addr?.formattedAddress || `${cityName}, ${stateName}`;
              setProbeData(detailedProbe);
              if (onProbeChange) onProbeChange(detailedProbe);
            }
            setPinpointToast({
              message: language === "hi" ? `📍 स्थान मिला: ${cityName}` : `📍 Located: ${cityName}`,
              type: "success"
            });
          });
        },
        (err) => {
          console.warn("GPS failed", err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const isPinpointModeRef = useRef(false);
  useEffect(() => {
    isPinpointModeRef.current = isPinpointMode;
  }, [isPinpointMode]);

  useEffect(() => {
    if (pinpointToast) {
      const t = setTimeout(() => setPinpointToast(null), 3200);
      return () => clearTimeout(t);
    }
  }, [pinpointToast]);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  // Smooth scroll handler for layer bar
  const scrollLayers = (direction) => {
    if (layerScrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      layerScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Convert vertical mouse wheel to horizontal scroll on layer bar
  const handleLayerWheel = (e) => {
    if (layerScrollRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        layerScrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e) => {
    if (!layerScrollRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - layerScrollRef.current.offsetLeft;
    scrollLeftStartRef.current = layerScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !layerScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - layerScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    layerScrollRef.current.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Auto-scroll active layer pill into view when activeLayer changes
  useEffect(() => {
    if (!layerScrollRef.current) return;
    const activeBtn = layerScrollRef.current.querySelector(`#map-layer-btn-${activeLayer}`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeLayer]);

  // Initialize wind particle streamline pool
  useEffect(() => {
    const particles = [];
    const count = 140;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        age: Math.floor(Math.random() * 60),
        maxAge: 45 + Math.floor(Math.random() * 40),
        speedMult: 0.8 + Math.random() * 0.5
      });
    }
    windParticlesRef.current = particles;
  }, []);

  // Sync real-time weather into station data
  useEffect(() => {
    if (!weather) return;
    const wLat = typeof weather.lat === "number" ? weather.lat : parseFloat(String(weather.lat));
    const wLng = typeof weather.lng === "number" ? weather.lng : parseFloat(String(weather.lng));
    if (isNaN(wLat) || isNaN(wLng) || !isFinite(wLat) || !isFinite(wLng)) return;

    setStations((prev) => {
      const existingIdx = prev.findIndex(
        (s) =>
          (s.city && weather.city && s.city.toLowerCase() === weather.city.toLowerCase()) ||
          (Math.abs(s.lat - wLat) < 0.2 && Math.abs(s.lng - wLng) < 0.2)
      );

      const updatedStation = {
        city: weather.city || "Live Location",
        state: weather.state || "India",
        lat: wLat,
        lng: wLng,
        temp: typeof weather.temp === "number" && !isNaN(weather.temp) ? weather.temp : 32,
        humidity: weather.humidity ?? 62,
        wind: weather.wind_speed ?? 16,
        rain_mm: weather.rainfall_mm ?? 0,
        pressure: weather.pressure ?? 1008,
        aqi: weather.aqi ?? 110,
        hazard: weather.hazard_type || "normal"
      };

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = updatedStation;
        return next;
      } else {
        return [updatedStation, ...prev];
      }
    });
  }, [weather]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const tileConfig = MAPPLS_TILE_CONFIGS[mapStyle] || MAPPLS_TILE_CONFIGS.standard;
    const baseTileLayer = L.tileLayer(tileConfig.url, {
      subdomains: tileConfig.subdomains || "abc",
      maxZoom: 19,
      minZoom: 3,
      attribution: tileConfig.attribution,
      keepBuffer: 12,
      updateWhenIdle: false,
      updateWhenZooming: false,
      noWrap: true
    });

    // Background pre-caching of India tiles for instant smooth rendering across all maps
    if ('caches' in window) {
      caches.open("weathergpt-mappls-cache-v2").then(async (cache) => {
        const sampleTiles = [
          'https://a.tile.openstreetmap.org/5/23/13.png',
          'https://b.tile.openstreetmap.org/5/23/14.png',
          'https://c.tile.openstreetmap.org/5/24/13.png',
          'https://d.tile.openstreetmap.org/5/24/14.png',
          'https://a.tile.openstreetmap.org/6/47/26.png',
          'https://b.tile.openstreetmap.org/6/47/27.png',
          'https://c.tile.openstreetmap.org/6/48/26.png',
          'https://d.tile.openstreetmap.org/6/48/27.png',
          'https://a.tile.openstreetmap.org/7/95/53.png',
          'https://b.tile.openstreetmap.org/7/95/54.png',
          'https://c.tile.openstreetmap.org/7/96/53.png',
          'https://d.tile.openstreetmap.org/7/96/54.png'
        ];
        for (const tileUrl of sampleTiles) {
          try {
            const exists = await cache.match(tileUrl);
            if (!exists) {
              await cache.add(tileUrl).catch(() => {});
            }
          } catch (e) {}
        }
      }).catch(() => {});
    }

    const initLat = location?.lat || 22.8;
    const initLng = location?.lng || 79.5;
    const initZoom = targetZoom || 5.2;

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLng],
      zoom: initZoom,
      maxZoom: 19,
      minZoom: 3,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true
    });

    baseTileLayer.addTo(map);
    baseTileLayerRef.current = baseTileLayer;

    // Add metric scale bar
    L.control
      .scale({
        imperial: false,
        metric: true,
        maxWidth: 90,
        position: "bottomright"
      })
      .addTo(map);

    // Interactive Map Click Probe: Compute comprehensive meteorological data for selected layer without changing user's active location
    map.on("click", async (e) => {
      if (!e || !e.latlng) return;
      const { lat, lng } = e.latlng;
      if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) return;

      const detailedProbe = calculateDetailedProbeData(lat, lng, stations, activeLayer, tempUnit);
      if (detailedProbe) {
        setProbeData(detailedProbe);
        if (onProbeChange) onProbeChange(detailedProbe);
      }

      // Update or create inspected probe marker dot on map
      try {
        if (probeMarkerRef.current) {
          probeMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const probePinIcon = L.divIcon({
            className: "probe-pin-target",
            html: `
              <div class="relative flex items-center justify-center w-7 h-7 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <span class="absolute w-6 h-6 rounded-full bg-cyan-400/40 animate-ping"></span>
                <span class="w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-white shadow-lg"></span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          probeMarkerRef.current = L.marker([lat, lng], {
            icon: probePinIcon,
            zIndexOffset: 2500,
            interactive: false
          }).addTo(map);
        }
      } catch (err) {}

      const exactAddr = await fetchExactAddress(lat, lng, language);
      const resolvedCity = exactAddr?.city || detailedProbe?.cityName || `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
      const fullAddress = exactAddr?.formattedAddress || resolvedCity;

      if (detailedProbe) {
        const enriched = {
          ...detailedProbe,
          cityName: exactAddr?.city || detailedProbe.cityName,
          formattedAddress: fullAddress,
          stateName: exactAddr?.state || detailedProbe.stateName
        };
        setProbeData(enriched);
        if (onProbeChange) onProbeChange(enriched);
      }

      // If Pinpoint Mode is active, immediately set this as the active exact pinpoint location!
      if (isPinpointModeRef.current) {
        const cleanLat = Number(lat.toFixed(6));
        const cleanLng = Number(lng.toFixed(6));
        if (onLocationChangeRef.current) {
          onLocationChangeRef.current({
            lat: cleanLat,
            lng: cleanLng,
            city: resolvedCity,
            state: exactAddr?.state || "India",
            country: "India",
            houseStreet: exactAddr?.houseStreet || "",
            district: exactAddr?.district || "",
            pincode: exactAddr?.pincode || "",
            formattedAddress: fullAddress,
            accuracy: 20,
            isExactGPS: false,
            source: "map_pinpoint_click"
          });
        }
        setPinpointToast({
          message: language === "hi"
            ? `सटीक पिन स्थान सेट: ${resolvedCity}`
            : `Exact Pinpoint Set: ${resolvedCity}`,
          type: "success"
        });
      }
    });

    map.on("zoomend", () => {
      setCurrentZoomLevel(map.getZoom());
    });

    map.whenReady(() => {
      setMapReady(true);
      setCurrentZoomLevel(map.getZoom());
    });

    let resizeObserver = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    setTimeout(() => {
      try {
        map.invalidateSize();
        setMapReady(true);
      } catch (e) {}
    }, 200);

    mapInstanceRef.current = map;

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      try {
        map.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Ensure map correctly invalidates size on mount / visibility changes
  useEffect(() => {
    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(true), 50);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(true), 250);
    const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Update probe data whenever activeLayer or tempUnit changes
  useEffect(() => {
    if (probeData) {
      const updated = calculateDetailedProbeData(probeData.lat, probeData.lng, stations, activeLayer, tempUnit);
      if (updated) setProbeData(updated);
    }
  }, [activeLayer, tempUnit, stations]);

  // 2. Change Tile Layer on mapStyle switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      if (baseTileLayerRef.current) {
        map.removeLayer(baseTileLayerRef.current);
      }
      const tileConfig = MAPPLS_TILE_CONFIGS[mapStyle] || MAPPLS_TILE_CONFIGS.standard;
      const newLayer = L.tileLayer(tileConfig.url, {
        subdomains: tileConfig.subdomains || "abc",
        maxZoom: 19,
        minZoom: 3,
        attribution: tileConfig.attribution
      });
      newLayer.addTo(map);
      newLayer.bringToBack();
      baseTileLayerRef.current = newLayer;
    } catch (err) {
      console.warn("Failed to switch map style:", err);
    }
  }, [mapStyle]);

  // 3. High-Precision Localized Meteorological Color Canvas Engine
  const renderGeoColorCanvas = useCallback(() => {
    const map = mapInstanceRef.current;
    const canvas = canvasRef.current;
    if (!map || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = map.getSize();
    if (!size || size.x <= 0 || size.y <= 0) return;

    if (canvas.width !== size.x || canvas.height !== size.y) {
      canvas.width = size.x;
      canvas.height = size.y;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Strict boundary clipping
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();

    const zoom = map.getZoom();
    const ramp = getRampForLayer(activeLayer);

    // Raster Grid Resolution (crisp performance)
    const stepX = Math.max(6, Math.floor(width / (zoom > 10 ? 55 : 80)));
    const stepY = Math.max(6, Math.floor(height / (zoom > 10 ? 50 : 70)));

    const cols = Math.ceil(width / stepX) + 1;
    const rows = Math.ceil(height / stepY) + 1;
    const rawGridValues = [];
    const allValuesInViewport = [];

    // Zoom-adaptive opacity: at street level (zoom >= 13), keep map crisp and readable
    const zoomOpacityFactor = zoom >= 16 ? 0.35 : zoom >= 13 ? 0.6 : 1.0;

    for (let r = 0; r < rows; r++) {
      rawGridValues[r] = [];
      const py = r * stepY;
      for (let c = 0; c < cols; c++) {
        const px = c * stepX;
        try {
          const latLng = map.containerPointToLatLng([px, py]);
          if (!latLng || isNaN(latLng.lat) || isNaN(latLng.lng)) {
            rawGridValues[r][c] = null;
            continue;
          }

          // India Geographical Bounding Box
          const isSubcontinent =
            latLng.lat >= 5.0 && latLng.lat <= 38.5 && latLng.lng >= 66.0 && latLng.lng <= 98.5;

          if (!isSubcontinent) {
            rawGridValues[r][c] = null;
            continue;
          }

          const probe = calculateIDW(latLng.lat, latLng.lng, stations, activeLayer);
          const val = probe.value;
          rawGridValues[r][c] = val;
          if (val !== undefined && !isNaN(val)) {
            allValuesInViewport.push(val);
          }
        } catch (err) {
          rawGridValues[r][c] = null;
        }
      }
    }

    // Compute 5th and 95th percentile (or min/max) for robust viewport normalization
    let viewportMin = 0;
    let viewportMax = 100;
    if (allValuesInViewport.length > 0) {
      allValuesInViewport.sort((a, b) => a - b);
      const p5Idx = Math.floor(allValuesInViewport.length * 0.05);
      const p95Idx = Math.floor(allValuesInViewport.length * 0.95);
      viewportMin = allValuesInViewport[Math.max(0, p5Idx)];
      viewportMax = allValuesInViewport[Math.min(allValuesInViewport.length - 1, p95Idx)];
      if (viewportMin === viewportMax) {
        viewportMin -= 1;
        viewportMax += 1;
      }
    }
    setViewportRange({ min: viewportMin, max: viewportMax });

    // Assign colors using viewport-adaptive dynamic color grading
    const gridValues = [];
    for (let r = 0; r < rows; r++) {
      gridValues[r] = [];
      for (let c = 0; c < cols; c++) {
        const val = rawGridValues[r]?.[c];
        if (val === null || val === undefined) {
          gridValues[r][c] = { r: 0, g: 0, b: 0, a: 0 };
        } else {
          gridValues[r][c] = interpolateColorViewportAdaptive(ramp, val, viewportMin, viewportMax, true);
        }
      }
    }

    // Bilinear Interpolation Raster Fill
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const gy = y / stepY;
      const r0 = Math.floor(gy);
      const r1 = Math.min(rows - 1, r0 + 1);
      const ty = gy - r0;

      for (let x = 0; x < width; x++) {
        const gx = x / stepX;
        const c0 = Math.floor(gx);
        const c1 = Math.min(cols - 1, c0 + 1);
        const tx = gx - c0;

        const p00 = gridValues[r0]?.[c0];
        const p10 = gridValues[r0]?.[c1];
        const p01 = gridValues[r1]?.[c0];
        const p11 = gridValues[r1]?.[c1];

        if (!p00 || !p10 || !p01 || !p11) continue;

        const rTop = p00.r + tx * (p10.r - p00.r);
        const gTop = p00.g + tx * (p10.g - p00.g);
        const bTop = p00.b + tx * (p10.b - p00.b);
        const aTop = p00.a + tx * (p10.a - p00.a);

        const rBot = p01.r + tx * (p11.r - p01.r);
        const gBot = p01.g + tx * (p11.g - p01.g);
        const bBot = p01.b + tx * (p11.b - p01.b);
        const aBot = p01.a + tx * (p11.a - p01.a);

        const red = rTop + ty * (rBot - rTop);
        const green = gTop + ty * (gBot - gTop);
        const blue = bTop + ty * (bBot - bTop);
        const alpha = (aTop + ty * (aBot - aTop)) * layerOpacity * zoomOpacityFactor;

        const idx = (y * width + x) * 4;
        data[idx] = red;
        data[idx + 1] = green;
        data[idx + 2] = blue;
        data[idx + 3] = Math.round(alpha * 255);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // 4. LAYER-SPECIFIC ADVANCED VISUALIZATIONS

    // A. WIND VELOCITY & GALES: Directional Animated Wind Streamlines & High-Definition Aerodynamic Arrows
    if (activeLayer === "wind" && zoom < 14) {
      ctx.save();
      const particles = windParticlesRef.current;

      // 1. Silky Aerodynamic Streamlines & Glowing Particle Heads
      particles.forEach((p) => {
        try {
          const pLatLng = map.containerPointToLatLng([p.x, p.y]);
          if (!pLatLng) return;

          const windVec = calculateWindVector(pLatLng.lat, pLatLng.lng, stations);
          const speed = windVec.speed;
          const u = windVec.u;
          const v = windVec.v;

          // Step length dynamically scaled with wind velocity
          const step = (speed * 0.14 + 1.4) * p.speedMult;
          const nextX = p.x + u * step;
          const nextY = p.y + v * step;

          // Fade smoothly through life cycle
          const lifeFraction = p.age / p.maxAge;
          const baseAlpha = Math.sin(lifeFraction * Math.PI);
          const alpha = baseAlpha * (speed > 45 ? 0.95 : 0.82);

          // Color palette with vivid luminance
          let coreCol = `rgba(56, 189, 248, ${alpha})`; // Cyan default
          let headGlow = "rgba(56, 189, 248, 0.9)";
          let lineW = 1.4;

          if (speed >= 65) {
            coreCol = `rgba(239, 68, 68, ${alpha})`;
            headGlow = "rgba(239, 68, 68, 1)";
            lineW = 2.4;
          } else if (speed >= 40) {
            coreCol = `rgba(249, 115, 22, ${alpha})`;
            headGlow = "rgba(249, 115, 22, 0.95)";
            lineW = 2.0;
          } else if (speed >= 25) {
            coreCol = `rgba(234, 179, 8, ${alpha})`;
            headGlow = "rgba(234, 179, 8, 0.95)";
            lineW = 1.7;
          } else if (speed >= 12) {
            coreCol = `rgba(16, 185, 129, ${alpha * 0.9})`;
            headGlow = "rgba(16, 185, 129, 0.9)";
            lineW = 1.5;
          }

          // Pass 1: Contrast Shadow Underlay (Ensures 100% visibility over bright/dark tiles)
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nextX, nextY);
          ctx.strokeStyle = `rgba(10, 15, 30, ${alpha * 0.45})`;
          ctx.lineWidth = lineW + 1.6;
          ctx.lineCap = "round";
          ctx.stroke();

          // Pass 2: Luminous Streamline Core
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nextX, nextY);
          ctx.strokeStyle = coreCol;
          ctx.lineWidth = lineW;
          ctx.lineCap = "round";
          ctx.stroke();

          // Pass 3: Leading Glow Droplet
          if (alpha > 0.45) {
            ctx.beginPath();
            ctx.arc(nextX, nextY, lineW * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = headGlow;
            ctx.fill();
          }

          p.x = nextX;
          p.y = nextY;
          p.age += 1;

          // Re-seed particle if expired or beyond viewport
          if (p.age >= p.maxAge || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
            p.maxAge = 42 + Math.floor(Math.random() * 48);
          }
        } catch (e) {}
      });

      // 2. High-Definition Aerodynamic Directional Arrow Grid (Uncluttered & Staggered)
      // Adaptive spacing: zoom-proportional to prevent overcrowding
      const arrowStep = zoom > 8 ? 95 : zoom > 6 ? 115 : 140;
      
      // Cache station screen coordinates to avoid drawing arrows over city pins
      const stationScreenPts = stations.map((st) => {
        try {
          return map.latLngToContainerPoint([st.lat, st.lng]);
        } catch (e) {
          return { x: -999, y: -999 };
        }
      });

      let rowIdx = 0;
      for (let ay = arrowStep * 0.55; ay < height; ay += arrowStep * 0.88) {
        rowIdx++;
        // Stagger alternate rows (Hexagonal / Diamond lattice) for natural fluid distribution
        const xOffset = (rowIdx % 2 === 1) ? (arrowStep * 0.5) : 0;

        for (let ax = arrowStep * 0.4 + xOffset; ax < width; ax += arrowStep) {
          try {
            // Check station proximity: Skip arrow if close to any city marker
            const nearStation = stationScreenPts.some(
              (pt) => Math.hypot(pt.x - ax, pt.y - ay) < 38
            );
            if (nearStation) continue;

            const aLatLng = map.containerPointToLatLng([ax, ay]);
            if (!aLatLng || aLatLng.lat < 5.5 || aLatLng.lat > 37.5 || aLatLng.lng < 67.5 || aLatLng.lng > 98) continue;

            const aVec = calculateWindVector(aLatLng.lat, aLatLng.lng, stations);
            const aRad = ((aVec.deg + 180) * Math.PI) / 180;
            
            // Length & geometry proportioned to velocity
            const arrowLen = Math.min(24, Math.max(15, 12 + aVec.speed * 0.16));
            const headLen = Math.min(10, arrowLen * 0.46);
            const headWidth = Math.min(8.5, arrowLen * 0.38);
            const shaftWidth = aVec.speed >= 50 ? 2.8 : 2.2;
            const tipY = arrowLen * 0.5;
            const baseY = -arrowLen * 0.5;

            // Subtle harmonic flow drift animation along wind vector
            const flowPhase = radarAngleRef.current * 2.8 + (ax * 0.02 + ay * 0.02);
            const driftOffset = Math.sin(flowPhase) * 2.2;

            ctx.save();
            ctx.translate(ax + aVec.u * driftOffset, ay + aVec.v * driftOffset);
            ctx.rotate(aRad);

            // Determine crisp theme colors by wind speed
            let arrowColor = "#38bdf8"; // Light Cyan (< 15 km/h)
            if (aVec.speed >= 65) {
              arrowColor = "#ef4444"; // Storm Gale Red
            } else if (aVec.speed >= 42) {
              arrowColor = "#f97316"; // Strong Gale Orange
            } else if (aVec.speed >= 25) {
              arrowColor = "#eab308"; // Fresh Yellow
            } else if (aVec.speed >= 12) {
              arrowColor = "#10b981"; // Emerald Green
            }

            // PASS 1: Contrast Dark Halo / Drop-Shadow (Ensures maximum contrast on all map styles)
            ctx.beginPath();
            ctx.moveTo(0, baseY - 0.5);
            ctx.lineTo(0, tipY - headLen + 2.5);
            ctx.strokeStyle = "rgba(10, 15, 30, 0.85)";
            ctx.lineWidth = shaftWidth + 2.4;
            ctx.lineCap = "round";
            ctx.stroke();

            // Delta Arrowhead Dark Base
            ctx.beginPath();
            ctx.moveTo(0, tipY + 1.5);
            ctx.lineTo(-headWidth - 1.2, tipY - headLen - 0.5);
            ctx.lineTo(0, tipY - headLen + 2.2); // aerodynamic notched inner chevron
            ctx.lineTo(headWidth + 1.2, tipY - headLen - 0.5);
            ctx.closePath();
            ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
            ctx.fill();

            // PASS 2: Luminous Foreground Shaft
            ctx.beginPath();
            ctx.moveTo(0, baseY);
            ctx.lineTo(0, tipY - headLen + 2);
            ctx.strokeStyle = arrowColor;
            ctx.lineWidth = shaftWidth;
            ctx.lineCap = "round";
            ctx.stroke();

            // PASS 3: Solid Aerodynamic Delta Dart Head
            ctx.beginPath();
            ctx.moveTo(0, tipY);
            ctx.lineTo(-headWidth, tipY - headLen);
            ctx.lineTo(0, tipY - headLen + 2.5);
            ctx.lineTo(headWidth, tipY - headLen);
            ctx.closePath();
            ctx.fillStyle = arrowColor;
            ctx.fill();

            // For Severe Storm / Gale (>45 km/h), render dynamic double chevron barb
            if (aVec.isGaleAlert) {
              ctx.beginPath();
              ctx.moveTo(0, tipY - headLen + 1);
              ctx.lineTo(-headWidth * 0.85, tipY - headLen * 1.55);
              ctx.lineTo(0, tipY - headLen * 1.55 + 2);
              ctx.lineTo(headWidth * 0.85, tipY - headLen * 1.55);
              ctx.closePath();
              ctx.fillStyle = arrowColor;
              ctx.fill();
            }

            // PASS 4: Crisp Center Spine Specular Highlight
            ctx.beginPath();
            ctx.arc(0, tipY - headLen * 0.35, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            ctx.restore();
          } catch (e) {}
        }
      }

      ctx.restore();
    }

    // B. CYCLONE & LOW PRESSURE: Barometric Isobars & Cyclonic Vortex Swirl
    if (activeLayer === "cyclone" && zoom <= 12) {
      ctx.save();
      const cyclonePt = map.latLngToContainerPoint([19.2, 86.8]); // Bay of Bengal depression center

      if (cyclonePt.x > -150 && cyclonePt.x < width + 150 && cyclonePt.y > -150 && cyclonePt.y < height + 150) {
        ctx.save();
        ctx.translate(cyclonePt.x, cyclonePt.y);

        // Rotating Isobar Rings with pressure values
        const rot = -radarAngleRef.current * 0.7;
        ctx.rotate(rot);

        const isobarLevels = [
          { radius: 24, label: "980 hPa (Eye)", col: "rgba(239, 68, 68, 0.95)" },
          { radius: 52, label: "988 hPa", col: "rgba(249, 115, 22, 0.9)" },
          { radius: 88, label: "996 hPa", col: "rgba(234, 179, 8, 0.85)" },
          { radius: 130, label: "1004 hPa", col: "rgba(14, 165, 233, 0.75)" },
          { radius: 175, label: "1012 hPa", col: "rgba(59, 130, 246, 0.65)" }
        ];

        isobarLevels.forEach((iso, idx) => {
          ctx.beginPath();
          ctx.arc(0, 0, iso.radius, 0, Math.PI * 1.85);
          ctx.strokeStyle = iso.col;
          ctx.lineWidth = idx === 0 ? 3.0 : 1.8;
          ctx.setLineDash([8, 6]);
          ctx.stroke();

          // Spiral arms
          ctx.beginPath();
          ctx.arc(0, 0, iso.radius * 0.7, 0, Math.PI * 1.4);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 1.0;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
        });

        // Cyclone Eye center marker
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(185, 28, 28, 0.95)";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Eye label
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.fillText("🌀 Cyclone Eye (982 hPa)", cyclonePt.x + 14, cyclonePt.y - 12);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    // C. RAINFALL & PRIORITY: Live Doppler Radar Sweeps
    if (isScanning && (activeLayer === "rain" || activeLayer === "rain_prob" || activeLayer === "rain_probability" || activeLayer === "priority") && zoom < 13) {
      const centerPt = map.latLngToContainerPoint([22.5, 79.0]);
      const maxRadius = Math.max(width, height) * 0.9;
      const angle = radarAngleRef.current;

      ctx.beginPath();
      ctx.moveTo(centerPt.x, centerPt.y);
      ctx.arc(centerPt.x, centerPt.y, maxRadius, angle - 0.4, angle);
      ctx.closePath();

      const sweepGrad = ctx.createRadialGradient(centerPt.x, centerPt.y, 20, centerPt.x, centerPt.y, maxRadius);
      sweepGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
      sweepGrad.addColorStop(0.6, "rgba(34, 197, 94, 0.18)");
      sweepGrad.addColorStop(1, "rgba(14, 165, 233, 0)");

      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerPt.x, centerPt.y);
      ctx.lineTo(centerPt.x + Math.cos(angle) * maxRadius, centerPt.y + Math.sin(angle) * maxRadius);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // D. KEY STATION METEOROLOGICAL BADGES (LAYER-SPECIFIC DATA)
    if (showStationNumbers && zoom < 14) {
      stations.forEach((st) => {
        const pt = map.latLngToContainerPoint([st.lat, st.lng]);
        if (pt.x < 15 || pt.x > width - 15 || pt.y < 15 || pt.y > height - 15) return;

        let badgeText = "";
        let isHazardHotspot = false;
        let badgeBg = "rgba(15, 23, 42, 0.88)";
        let badgeBorder = "rgba(255, 255, 255, 0.4)";

        if (activeLayer === "wind") {
          const windVec = calculateWindVector(st.lat, st.lng, stations);
          badgeText = `💨 ${windVec.speed} km/h ${windVec.cardinal}`;
          isHazardHotspot = windVec.isGaleAlert;
          if (windVec.speed >= 65) badgeBg = "rgba(147, 51, 234, 0.95)";
          else if (windVec.speed >= 45) badgeBg = "rgba(239, 68, 68, 0.92)";
          else if (windVec.speed >= 28) badgeBg = "rgba(234, 179, 8, 0.92)";
          else badgeBg = "rgba(16, 185, 129, 0.88)";
        } else if (activeLayer === "rain") {
          const r = st.rain_mm || 0;
          if (r === 0 && zoom < 6) return; // Keep dry areas uncluttered on national overview
          badgeText = r > 0 ? `🌧️ ${r} mm` : `0 mm`;
          isHazardHotspot = r >= 35;
          if (r >= 70) badgeBg = "rgba(192, 38, 211, 0.95)";
          else if (r >= 35) badgeBg = "rgba(239, 68, 68, 0.92)";
          else if (r >= 10) badgeBg = "rgba(34, 197, 94, 0.92)";
          else if (r > 0) badgeBg = "rgba(14, 165, 233, 0.88)";
        } else if (activeLayer === "rain_prob" || activeLayer === "rain_probability") {
          const prob = getStationValue(st, "rain_prob");
          if (prob < 15 && zoom < 6) return;
          badgeText = prob >= 70 ? `🌧️ ${prob}%` : prob >= 30 ? `🌦️ ${prob}%` : `☀️ ${prob}%`;
          isHazardHotspot = prob >= 75;
          if (prob >= 90) badgeBg = "rgba(192, 38, 211, 0.95)";
          else if (prob >= 75) badgeBg = "rgba(239, 68, 68, 0.92)";
          else if (prob >= 55) badgeBg = "rgba(234, 179, 8, 0.92)";
          else if (prob >= 35) badgeBg = "rgba(34, 197, 94, 0.92)";
          else badgeBg = "rgba(14, 165, 233, 0.85)";
        } else if (activeLayer === "priority") {
          if (st.hazard === "cyclone") {
            badgeText = "🌀 Cyclone Eye";
            badgeBg = "rgba(185, 28, 28, 0.95)";
            isHazardHotspot = true;
          } else if (st.hazard === "flood") {
            badgeText = `🌊 Flood (${st.rain_mm}mm)`;
            badgeBg = "rgba(220, 38, 38, 0.92)";
            isHazardHotspot = true;
          } else if (st.hazard === "heavy_rain") {
            badgeText = `🌧️ Downpour (${st.rain_mm}mm)`;
            badgeBg = "rgba(234, 88, 12, 0.92)";
            isHazardHotspot = true;
          } else if (st.hazard === "heatwave" || st.temp >= 40) {
            badgeText = `🔥 ${st.temp}°C Loo`;
            badgeBg = "rgba(220, 38, 38, 0.92)";
            isHazardHotspot = true;
          } else {
            if (zoom < 6) return;
            badgeText = `${st.temp}°C Normal`;
            badgeBg = "rgba(34, 197, 94, 0.85)";
          }
        } else if (activeLayer === "heatwave") {
          const tVal = tempUnit === "F" ? Math.round((st.temp * 9) / 5 + 32) : st.temp;
          const tUnit = tempUnit === "F" ? "°F" : "°C";
          badgeText = st.temp >= 40 ? `🔥 ${tVal}${tUnit} Loo` : `${tVal}${tUnit}`;
          if (st.temp >= 42) badgeBg = "rgba(185, 28, 28, 0.95)";
          else if (st.temp >= 38) badgeBg = "rgba(249, 115, 22, 0.92)";
          else if (st.temp <= 16) badgeBg = "rgba(59, 130, 246, 0.92)";
        } else if (activeLayer === "humidity") {
          const hum = st.humidity || 60;
          badgeText = `💧 ${hum}%`;
          if (hum >= 85) badgeBg = "rgba(124, 58, 237, 0.92)";
          else if (hum >= 70) badgeBg = "rgba(37, 99, 235, 0.88)";
          else if (hum <= 25) badgeBg = "rgba(217, 119, 6, 0.88)";
        } else if (activeLayer === "cyclone") {
          const p = st.pressure || 1008;
          badgeText = p <= 990 ? `🌀 ${p} hPa` : `${p} hPa`;
          if (p <= 990) badgeBg = "rgba(127, 29, 29, 0.95)";
          else if (p <= 1000) badgeBg = "rgba(220, 38, 38, 0.9)";
          else badgeBg = "rgba(2, 132, 199, 0.85)";
        } else if (activeLayer === "air_quality") {
          const aqi = st.aqi || 85;
          badgeText = `🌫️ AQI ${aqi}`;
          if (aqi > 250) badgeBg = "rgba(185, 28, 28, 0.95)";
          else if (aqi > 150) badgeBg = "rgba(249, 115, 22, 0.92)";
          else if (aqi > 100) badgeBg = "rgba(234, 179, 8, 0.9)";
          else badgeBg = "rgba(34, 197, 94, 0.88)";
        } else {
          const val = getStationValue(st, activeLayer);
          const unit = getLayerUnit(activeLayer);
          badgeText = `${val}${unit}`;
        }

        ctx.font = "bold 9px system-ui, sans-serif";
        const textWidth = ctx.measureText(badgeText).width;
        const pillW = textWidth + 12;
        const pillH = 16;

        ctx.fillStyle = badgeBg;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;

        // Rounded pill
        const px = pt.x - pillW / 2;
        const py = pt.y - pillH / 2;
        const r = 8;
        ctx.beginPath();
        ctx.moveTo(px + r, py);
        ctx.arcTo(px + pillW, py, px + pillW, py + pillH, r);
        ctx.arcTo(px + pillW, py + pillH, px, py + pillH, r);
        ctx.arcTo(px, py + pillH, px, py, r);
        ctx.arcTo(px, py, px + pillW, py, r);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isHazardHotspot ? "#ffffff" : badgeBorder;
        ctx.lineWidth = isHazardHotspot ? 1.5 : 0.8;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, pt.x, pt.y);

        // City name sub-label
        ctx.font = "600 8.5px system-ui, sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.shadowColor = "rgba(255,255,255,0.95)";
        ctx.shadowBlur = 3;
        ctx.fillText(st.city, pt.x, pt.y + 13);
        ctx.shadowBlur = 0;
      });
    }

    ctx.restore();
  }, [activeLayer, stations, layerOpacity, showStationNumbers, isScanning, tempUnit]);

  // 4. Animation loop for live Doppler radar sweep and wind streamline movement
  useEffect(() => {
    if (!mapReady) return;

    let running = true;
    const animate = () => {
      if (!running) return;
      radarAngleRef.current = (radarAngleRef.current + 0.02) % (Math.PI * 2);
      renderGeoColorCanvas();
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [mapReady, renderGeoColorCanvas]);

  // 5. Leaflet Map Events Binding
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const onMapChange = () => {
      renderGeoColorCanvas();
    };

    map.on("move", onMapChange);
    map.on("zoom", onMapChange);
    map.on("resize", onMapChange);
    map.on("viewreset", onMapChange);

    renderGeoColorCanvas();

    return () => {
      map.off("move", onMapChange);
      map.off("zoom", onMapChange);
      map.off("resize", onMapChange);
      map.off("viewreset", onMapChange);
    };
  }, [mapReady, renderGeoColorCanvas]);

  // 6. User Location Marker Sync & 2.5 km Precision Pointer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const rawLat = location?.lat;
    const rawLng = location?.lng;
    const lat = typeof rawLat === "number" ? rawLat : parseFloat(String(rawLat));
    const lng = typeof rawLng === "number" ? rawLng : parseFloat(String(rawLng));

    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return;

    if (targetZoom && typeof targetZoom === "number" && !isNaN(targetZoom)) {
      try {
        map.flyTo([lat, lng], targetZoom, { animate: true, duration: 1.0 });
      } catch (err) {
        console.warn("Map flyTo error:", err);
      }
    }

    // Professional High-Definition Pinpoint Pointer Icon (Real vector graphics, no emoji)
    const pinHtml = `
      <div class="relative flex items-center justify-center pointer-events-none group">
        <!-- Floating Live Location Name Pill -->
        <div class="absolute -top-11 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div class="px-2.5 py-0.5 rounded-full bg-slate-950/95 text-cyan-300 text-[10px] font-bold border border-cyan-500/50 shadow-xl backdrop-blur-md whitespace-nowrap flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>${location?.city || "Pinpointed Location"}</span>
          </div>
          <div class="w-1.5 h-1.5 bg-slate-950 border-r border-b border-cyan-500/50 rotate-45 -mt-0.5"></div>
        </div>

        <!-- Sonar Radar Waves -->
        <span class="absolute w-12 h-12 rounded-full bg-cyan-500/25 animate-ping"></span>
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/35 animate-pulse"></span>

        <!-- SVG High-Precision Pinpoint Teardrop Needle Pointer -->
        <div class="relative -top-3.5 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 38 15 38C15 38 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="url(#pinGradient)"/>
            <path d="M15 1C7.26801 1 1 7.26801 1 15C1 25.5 15 36.8 15 36.8C15 36.8 29 25.5 29 15C29 7.26801 22.732 1 15 1Z" stroke="#38bdf8" stroke-width="1.5"/>
            <circle cx="15" cy="14" r="5.5" fill="#ffffff"/>
            <circle cx="15" cy="14" r="3" fill="#0284c7"/>
            <defs>
              <linearGradient id="pinGradient" x1="15" y1="0" x2="15" y2="38" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0284c7"/>
                <stop offset="1" stop-color="#1e3a8a"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Ground Contact Target Dot -->
        <div class="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-white shadow-md"></div>
      </div>
    `;

    const userPinIcon = L.divIcon({
      className: "user-live-pin",
      html: pinHtml,
      iconSize: [44, 52],
      iconAnchor: [22, 50]
    });

    try {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
        userMarkerRef.current.setIcon(userPinIcon);
      } else {
        userMarkerRef.current = L.marker([lat, lng], {
          icon: userPinIcon,
          zIndexOffset: 3000,
          draggable: !hideTopLayerBar
        }).addTo(map);

        userMarkerRef.current.on("dragend", async (event) => {
          const marker = event.target;
          const pos = marker.getLatLng();
          const detailed = calculateDetailedProbeData(pos.lat, pos.lng, stations, activeLayer, tempUnit);
          if (detailed) setProbeData(detailed);

          const exactAddr = await fetchExactAddress(pos.lat, pos.lng, language);
          const resolvedCity = exactAddr?.city || detailed?.cityName || `${pos.lat.toFixed(3)}°N, ${pos.lng.toFixed(3)}°E`;
          const fullAddress = exactAddr?.formattedAddress || resolvedCity;

          if (detailed && exactAddr) {
            setProbeData((prev) => (prev ? { ...prev, cityName: exactAddr.city || prev.cityName, formattedAddress: exactAddr.formattedAddress, stateName: exactAddr.state || prev.stateName } : prev));
          }

          if (onLocationChange) {
            onLocationChange({
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6)),
              city: resolvedCity,
              state: exactAddr?.state || "India",
              country: "India",
              houseStreet: exactAddr?.houseStreet || "",
              district: exactAddr?.district || "",
              pincode: exactAddr?.pincode || "",
              formattedAddress: fullAddress,
              accuracy: 15,
              isExactGPS: false,
              source: "marker_drag_pinpoint"
            });
          }
          setPinpointToast({
            message: language === "hi"
              ? `सटीक पिन स्थान अपडेट: ${resolvedCity}`
              : `Pinpoint Updated: ${resolvedCity}`,
            type: "success"
          });
        });
      }

      const accRadius = Math.min(Math.max(location?.accuracy || 35, 15), 180);
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.setLatLng([lat, lng]);
        userAccuracyCircleRef.current.setRadius(accRadius);
      } else {
        userAccuracyCircleRef.current = L.circle([lat, lng], {
          radius: accRadius,
          color: "#0284c7",
          fillColor: "#38bdf8",
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "3, 3"
        }).addTo(map);
      }
    } catch (err) {
      console.warn("Marker positioning failed:", err);
    }
  }, [location?.lat, location?.lng, location?.city, targetZoom, stations, activeLayer, tempUnit, onLocationChange]);

  const handleZoom2_5km = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const lat = location?.lat || 28.6139;
    const lng = location?.lng || 77.209;
    map.flyTo([lat, lng], 14.5, { animate: true, duration: 1.0 });
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const lat = location?.lat || 22.8;
    const lng = location?.lng || 79.5;
    map.flyTo([lat, lng], 5.5, { animate: true, duration: 0.8 });
  };

  const activeScale = COLOR_SCALES[activeLayer] || COLOR_SCALES.priority;

  const currentLayerConfig = useMemo(() => {
    return (
      SCAN_LAYERS.find(
        (l) => l.id === activeLayer || (l.id === "rain_prob" && activeLayer === "rain_probability")
      ) || SCAN_LAYERS[0]
    );
  }, [activeLayer]);

  return (
    <div
      id="free-weather-map-wrapper"
      className="relative w-full h-full overflow-hidden select-none bg-slate-950"
    >
      {/* Pinpoint Mode Floating Helper Banner */}
      {isPinpointMode && (
        <div className="absolute top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-600 via-rose-700 to-red-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 border border-rose-300 text-xs font-bold animate-in fade-in slide-in-from-top-2 pointer-events-auto">
          <span className="material-symbols-outlined text-[18px] animate-bounce">pin_drop</span>
          <span className="truncate max-w-[220px] sm:max-w-md">
            {language === "hi" ? "सटीक पिनपॉइंट मोड: मानचित्र पर कहीं भी टैप करें" : "Pinpoint Mode: Tap anywhere to set exact location"}
          </span>
          <button
            onClick={() => setIsPinpointMode(false)}
            className="ml-1 bg-white/25 hover:bg-white/40 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold cursor-pointer transition-colors shrink-0"
          >
            {language === "hi" ? "समाप्त" : "Done"}
          </button>
        </div>
      )}

      {/* Pinpoint Feedback Toast */}
      {pinpointToast && (
        <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-semibold animate-in fade-in zoom-in-95 pointer-events-auto">
          <span className={`material-symbols-outlined text-[18px] ${pinpointToast.type === "success" ? "text-emerald-400" : "text-cyan-400"}`}>
            {pinpointToast.type === "success" ? "check_circle" : "info"}
          </span>
          <span className="truncate max-w-[260px] sm:max-w-md">{pinpointToast.message}</span>
        </div>
      )}

      {/* 1. Leaflet Base Map Container */}
      <div
        id="leaflet-weather-map-container"
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden cursor-grab active:cursor-grabbing"
      />

      {/* 2. Hardware-Accelerated Meteorological Canvas */}
      <canvas
        id="meteorological-raster-canvas"
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[1] w-full h-full overflow-hidden transition-opacity duration-300"
        style={{ opacity: layerOpacity }}
      />

      {/* Top Floating Control Stack: 1. Location Search Bar, 2. Interactive Layer Pills */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-4 z-40 pointer-events-auto flex flex-col gap-2">
        {/* 1. Dedicated Map Location Search Bar */}
        {showSearchBar && (
          <div ref={searchContainerRef} className="relative w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 border border-slate-200/90 shadow-lg flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400">
              <Search className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                id="map-location-search-input"
                type="text"
                value={mapSearchQuery}
                onChange={(e) => {
                  setMapSearchQuery(e.target.value);
                  setShowMapSearchDropdown(true);
                }}
                onFocus={() => {
                  setShowMapSearchDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (mapSearchSuggestions.length > 0) {
                      handleSelectMapSearchResult(mapSearchSuggestions[0]);
                    } else if (mapSearchQuery.trim()) {
                      handleDirectSearchSubmit(mapSearchQuery.trim());
                    }
                  }
                }}
                placeholder={
                  language === "hi"
                    ? "मानचित्र पर स्थान खोजें (उदा. दिल्ली, पटना, 110001, पुणे)..."
                    : "Search location on map (e.g. Delhi, Patna, 110001, Pune)..."
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none min-w-0"
              />

              {isSearchingMap && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
              )}

              {mapSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMapSearchQuery("");
                    setMapSearchSuggestions([]);
                    setShowMapSearchDropdown(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleLocateMeGPS}
                title={language === "hi" ? "मेरा GPS स्थान खोजें" : "Locate My GPS Position"}
                className="p-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <LocateFixed className="w-4 h-4" />
                <span className="text-[10px] font-bold hidden sm:inline">{language === "hi" ? "GPS" : "GPS"}</span>
              </button>
            </div>

            {/* Floating Dropdown Results & Quick Location Chips */}
            {showMapSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl z-50 divide-y divide-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Popular Quick Suggestions when query is empty */}
                {!mapSearchQuery.trim() && (
                  <div className="px-3 py-2 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === "hi" ? "लोकप्रिय स्थान (त्वरित चयन):" : "Popular Indian Cities:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_QUICK_CITIES.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectMapSearchResult(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span>{language === "hi" ? c.cityHi : c.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autocomplete Results */}
                {mapSearchSuggestions.length > 0 && mapSearchSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMapSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/80 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
                          {item.city || item.placeName}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {[item.district && item.district !== item.city ? item.district : "", item.state || item.placeAddress, item.pincode ? `PIN: ${item.pincode}` : ""].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    </div>
                    {item.temp !== undefined && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                        {item.temp}°{tempUnit} {item.condition ? `• ${item.condition}` : ""}
                      </span>
                    )}
                  </button>
                ))}

                {mapSearchQuery.trim() && mapSearchSuggestions.length === 0 && !isSearchingMap && (
                  <div className="px-4 py-3 text-center text-xs text-slate-500">
                    {language === "hi" ? "कोई स्थान नहीं मिला। कोई अन्य शहर या पिनकोड खोजें।" : "No locations found. Try another city, district or PIN code."}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Top Interactive Layer Pills & Selector Bar */}
        {!hideTopLayerBar && (() => {
          const tMap = getTranslation(language);
          const getLayerTranslatedName = (layerItem) => {
            if (!layerItem) return "";
            if (layerItem.id === "priority") return tMap.layerPriority || layerItem.nameEn;
            if (layerItem.id === "rain") return tMap.layerRain || layerItem.nameEn;
            if (layerItem.id === "rain_prob") return tMap.layerRainProb || layerItem.nameEn;
            if (layerItem.id === "wind") return tMap.layerWind || layerItem.nameEn;
            if (layerItem.id === "humidity") return tMap.layerHumidity || layerItem.nameEn;
            if (layerItem.id === "heatwave") return tMap.layerHeatwave || layerItem.nameEn;
            if (layerItem.id === "cyclone") return tMap.layerCyclone || layerItem.nameEn;
            if (layerItem.id === "air_quality") return tMap.layerAirQuality || layerItem.nameEn;
            if (layerItem.id === "fog") return tMap.layerFog || layerItem.nameEn;
            if (layerItem.id === "temp") return tMap.layerTemp || layerItem.nameEn;
            return language === "hi" ? layerItem.nameHi : layerItem.nameEn;
          };

          return (
            <div className="w-full flex items-center">
              {/* 2. Meteorological Scan Layers Bar */}
          {isLayerBarMinimized ? (
            /* Minimized Compact Layer Capsule */
            <div
              id="map-layer-pills-bar"
              className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200 shadow-md flex items-center gap-1.5 max-w-full relative cursor-pointer hover:bg-white transition-all duration-200 animate-in fade-in zoom-in-95"
              onClick={() => setIsLayerBarMinimized(false)}
            >
              {(() => {
                const activeObj =
                  SCAN_LAYERS.find(
                    (l) =>
                      l.id === activeLayer ||
                      (l.id === "rain_prob" && activeLayer === "rain_probability")
                  ) || SCAN_LAYERS[0];
                const ActiveIcon = activeObj.icon;
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a2b4c] text-white text-xs font-bold shadow-xs">
                    <ActiveIcon className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span className="whitespace-nowrap">
                      {getLayerTranslatedName(activeObj)}
                    </span>
                    {activeObj.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wider bg-cyan-400 text-[#031636]">
                        {activeObj.badge}
                      </span>
                    )}
                  </div>
                );
              })()}

              <button
                id="btn-expand-layer-bar"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLayerBarMinimized(false);
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 text-[#575f6a] hover:text-[#031636] bg-[#f4f5f7] hover:bg-[#e9ecf0] border border-slate-200/80 shrink-0"
                title={language === "hi" ? "लेयर बार विस्तार करें" : "Expand meteorological scan layers"}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] hidden sm:inline font-bold text-slate-700">
                  {tMap.layersLabel || (language === "hi" ? "परतें" : "Layers")}
                </span>
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          ) : (
            /* Full Expanded Layer Selector Bar Along Map */
            <div
              id="map-layer-pills-bar"
              className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200 shadow-md flex items-center gap-1.5 min-w-0 relative animate-in fade-in select-none"
            >
              {/* Scroll Left Button */}
              <button
                id="btn-layer-scroll-left"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollLayers("left");
                }}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 bg-[#f4f5f7] hover:bg-[#e9ecf0] border border-slate-200/80 shrink-0 cursor-pointer transition-all active:scale-95 shadow-2xs"
                title="Scroll layers left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Main Layer Buttons Track (Fully Horizontally scrollable along the map) */}
              <div
                ref={layerScrollRef}
                onWheel={handleLayerWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                tabIndex={0}
                role="region"
                aria-label="Meteorological scan layers"
                className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 px-1 scrollbar-none select-none touch-pan-x min-w-0 flex-1 cursor-grab active:cursor-grabbing"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none"
                }}
              >
                {SCAN_LAYERS.map((layerItem) => {
                  const Icon = layerItem.icon;
                  const isSelected =
                    activeLayer === layerItem.id ||
                    (layerItem.id === "rain_prob" && activeLayer === "rain_probability");
                  return (
                    <button
                      key={layerItem.id}
                      id={`map-layer-btn-${layerItem.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLayerChange) onLayerChange(layerItem.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                        isSelected
                          ? "bg-[#04070d] text-white shadow-xs scale-[1.02]"
                          : "bg-[#f4f5f7] hover:bg-[#e9ecf0] text-[#575f6a] hover:text-[#031636] border border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-cyan-300" : "text-[#575f6a]"}`} />
                      <span>{getLayerTranslatedName(layerItem)}</span>
                      {layerItem.badge && (
                        <span
                          style={layerItem.id === "priority" ? { backgroundColor: "#f31a00", color: "#ffffff" } : {}}
                          className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                            layerItem.id === "priority"
                              ? "bg-[#f31a00] text-white shadow-2xs"
                              : isSelected
                                ? "bg-cyan-400 text-[#031636]"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {layerItem.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scroll Right Button */}
              <button
                id="btn-layer-scroll-right"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollLayers("right");
                }}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 bg-[#f4f5f7] hover:bg-[#e9ecf0] border border-slate-200/80 shrink-0 cursor-pointer transition-all active:scale-95 shadow-2xs"
                title="Scroll layers right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Minimize Layer Bar Option Button */}
              <div className="relative shrink-0 pl-1 border-l border-slate-200">
                <button
                  id="btn-minimize-layer-bar"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLayerBarMinimized(true);
                  }}
                  className="px-2 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center text-[#575f6a] hover:text-[#031636] bg-[#f4f5f7] hover:bg-[#e9ecf0] border border-slate-200/80 shrink-0"
                  title={language === "hi" ? "लेयर बार छोटा करें" : "Minimize layer options"}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          </div>
        );
      })()}
      </div>

      {/* 3. Interactive Detailed Weather Card (Tailored Specifically to Active Layer) */}
      <InteractiveWeatherInspectorCard
        probeData={probeData}
        activeLayer={activeLayer}
        language={language}
        tempUnit={tempUnit}
        onClose={() => {
          setProbeData(null);
          if (probeMarkerRef.current) {
            probeMarkerRef.current.remove();
            probeMarkerRef.current = null;
          }
          if (onProbeChange) onProbeChange(null);
        }}
        onZoomTo={(lat, lng) => {
          mapInstanceRef.current?.flyTo([lat, lng], 14, { animate: true, duration: 1.0 });
        }}
        onChangeLayer={(newLayer) => {
          if (onLayerChange) onLayerChange(newLayer);
        }}
        onSetAsPinPointLocation={async (probe) => {
          if (!probe) return;
          const cleanLat = Number(probe.lat.toFixed(6));
          const cleanLng = Number(probe.lng.toFixed(6));
          const exactAddr = await fetchExactAddress(cleanLat, cleanLng, language);
          const resolvedCity = exactAddr?.city || probe.cityName || `${cleanLat.toFixed(3)}°N, ${cleanLng.toFixed(3)}°E`;
          const fullAddress = exactAddr?.formattedAddress || resolvedCity;

          if (onLocationChangeRef.current) {
            onLocationChangeRef.current({
              lat: cleanLat,
              lng: cleanLng,
              city: resolvedCity,
              state: exactAddr?.state || probe.stateName || "India",
              country: "India",
              houseStreet: exactAddr?.houseStreet || "",
              district: exactAddr?.district || "",
              pincode: exactAddr?.pincode || "",
              formattedAddress: fullAddress,
              accuracy: 20,
              isExactGPS: false,
              source: "inspector_probe_pinpoint"
            });
          }

          mapInstanceRef.current?.flyTo([cleanLat, cleanLng], 14.5, { animate: true, duration: 0.8 });

          setPinpointToast({
            message: language === "hi"
              ? `सटीक पिन स्थान सेट किया गया: ${resolvedCity}`
              : `Exact Pinpoint Set: ${resolvedCity}`,
            type: "success"
          });
        }}
      />

      {/* 4. Map Zoom & 2.5 km Precision Controls (Docked Bottom-Right) */}
      <div className={`absolute ${hideTopLayerBar ? "bottom-2.5 right-2.5" : "bottom-28 sm:bottom-28 right-3"} z-30 flex flex-col gap-1.5 pointer-events-auto`}>
        {/* Pinpoint Mode Toggle Button */}
        <button
          id="btn-toggle-pinpoint-mode"
          onClick={() => {
            const nextState = !isPinpointMode;
            setIsPinpointMode(nextState);
            setPinpointToast({
              message: nextState
                ? (language === "hi" ? "सटीक पिनपॉइंट मोड चालू: मानचित्र पर कहीं भी टैप करें" : "Pinpoint Mode On: Tap anywhere on map to set location")
                : (language === "hi" ? "पिनपॉइंट मोड बंद" : "Pinpoint Mode Off"),
              type: "info"
            });
          }}
          aria-label="Toggle Exact Pinpoint Mode"
          className={`w-9 h-9 rounded-xl border shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
            isPinpointMode
              ? "bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400/50"
              : "bg-white hover:bg-[#f4f5f7] text-rose-600 border-slate-200"
          }`}
          title={language === "hi" ? "सटीक पिन स्थान सेट करें" : "Toggle Exact Pinpoint Mode"}
        >
          <span className="material-symbols-outlined text-[20px] text-inherit">pin_drop</span>
        </button>

        {/* Zoom In Button */}
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          aria-label="Zoom In"
          className="w-9 h-9 rounded-xl bg-white hover:bg-[#f4f5f7] text-[#031636] border border-slate-200 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-md"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 text-slate-700" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          aria-label="Zoom Out"
          className="w-9 h-9 rounded-xl bg-white hover:bg-[#f4f5f7] text-[#031636] border border-slate-200 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-md"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 text-slate-700" />
        </button>

        {/* 2.5 km Sector & Block Zoom Button: Magnifying Logo Icon */}
        <button
          id="btn-zoom-2-5km"
          onClick={handleZoom2_5km}
          aria-label="2.5 km High Precision Sector Zoom"
          className={`w-9 h-9 rounded-xl border shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
            currentZoomLevel >= 13 && currentZoomLevel <= 15
              ? "bg-[#1a2b4c] text-white border-[#1a2b4c] ring-2 ring-blue-400/40"
              : "bg-white hover:bg-[#f4f5f7] text-blue-600 border-slate-200"
          }`}
          title="2.5 km High-Precision Sector Zoom"
        >
          <ZoomIn className={`w-4.5 h-4.5 ${currentZoomLevel >= 13 && currentZoomLevel <= 15 ? "text-cyan-300" : "text-blue-600"}`} />
        </button>

        {/* Recenter / Overview Button */}
        <button
          onClick={handleRecenter}
          aria-label="National Overview"
          className="w-9 h-9 rounded-xl bg-white hover:bg-[#f4f5f7] text-slate-700 hover:text-[#031636] border border-slate-200 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-md"
          title="National Overview Center"
        >
          <Crosshair className="w-4 h-4 text-blue-600" />
        </button>
      </div>
    </div>
  );
};
