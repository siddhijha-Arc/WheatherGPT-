import { useEffect, useRef } from "react";
import L from "leaflet";
import { MAJOR_INDIAN_CITIES, generateIndiaHazardGrid } from "../data/indiaWeatherData";
export const WeatherMap = ({
  location,
  onLocationChange,
  activeLayer,
  weather,
  radarScanning
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const canvasLayerRef = useRef(null);
  const cityMarkersLayerRef = useRef(null);
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;
    const darkTileLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: "abcd",
        maxZoom: 18,
        minZoom: 4,
        className: "map-tiles-filter",
        keepBuffer: 12,
        updateWhenIdle: false,
        updateWhenZooming: false,
        noWrap: true
      }
    );

    if ('caches' in window) {
      caches.open("weathergpt-mappls-cache-v2").then(async (cache) => {
        const sampleTiles = [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/5/23/13.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager_labels_under/5/23/14.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager_labels_under/5/24/13.png',
          'https://d.basemaps.cartocdn.com/rastertiles/voyager_labels_under/5/24/14.png'
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
    const map = L.map(mapContainerRef.current, {
      center: [location.lat || 28.6139, location.lng || 77.209],
      zoom: 5.5,
      zoomControl: false,
      attributionControl: false
    });
    darkTileLayer.addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      let foundCity = "Custom Spot";
      let minD = 999;
      for (const city of MAJOR_INDIAN_CITIES) {
        const d = Math.hypot(city.lat - lat, city.lng - lng);
        if (d < minD && d < 1.5) {
          minD = d;
          foundCity = city.city;
        }
      }
      onLocationChange({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        city: foundCity === "Custom Spot" ? `${lat.toFixed(2)}\xB0N, ${lng.toFixed(2)}\xB0E` : foundCity,
        country: "India"
      });
    });
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const lat = typeof location?.lat === "number" ? location.lat : parseFloat(String(location?.lat));
    const lng = typeof location?.lng === "number" ? location.lng : parseFloat(String(location?.lng));
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return;
    try {
      map.flyTo([lat, lng], map.getZoom() < 6 ? 6.5 : map.getZoom(), {
        duration: 1.2
      });
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const customPinIcon = L.divIcon({
          className: "custom-user-pin",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></div>
              <div class="relative w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        userMarkerRef.current = L.marker([lat, lng], {
          icon: customPinIcon,
          zIndexOffset: 1e3
        }).addTo(map);
      }
    } catch (err) {
      console.warn("WeatherMap location sync error:", err);
    }
  }, [location?.lat, location?.lng]);
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (canvasLayerRef.current) {
      map.removeLayer(canvasLayerRef.current);
      canvasLayerRef.current = null;
    }
    const gridData = generateIndiaHazardGrid();
    const CanvasOverlay = L.Layer.extend({
      onAdd: function(targetMap) {
        this._map = targetMap;
        const canvas = L.DomUtil.create("canvas", "leaflet-weather-radar-canvas");
        this._canvas = canvas;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "200";
        canvas.style.opacity = "0.78";
        canvas.style.mixBlendMode = "screen";
        const size = targetMap.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        const animated = targetMap.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, "leaflet-zoom-" + (animated ? "animated" : "hide"));
        targetMap.getPanes().overlayPane.appendChild(canvas);
        targetMap.on("moveend", this._reset, this);
        targetMap.on("zoomend", this._reset, this);
        targetMap.on("resize", this._resize, this);
        this._reset();
      },
      onRemove: function(targetMap) {
        targetMap.getPanes().overlayPane.removeChild(this._canvas);
        targetMap.off("moveend", this._reset, this);
        targetMap.off("zoomend", this._reset, this);
        targetMap.off("resize", this._resize, this);
      },
      _resize: function() {
        const size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;
        this._reset();
      },
      _reset: function() {
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._draw();
      },
      _draw: function() {
        const ctx = this._canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.globalCompositeOperation = "source-over";
        const zoom = this._map.getZoom();
        const baseRadius = Math.max(35, 18 * Math.pow(1.35, zoom - 4));
        gridData.forEach((cell) => {
          const latLng = L.latLng(cell.lat, cell.lng);
          const point = this._map.latLngToContainerPoint(latLng);
          if (point.x < -100 || point.y < -100 || point.x > this._canvas.width + 100 || point.y > this._canvas.height + 100) {
            return;
          }
          let colorInner = "rgba(56, 189, 248, 0.4)";
          let colorMid = "rgba(14, 165, 233, 0.2)";
          let colorOuter = "rgba(2, 132, 199, 0)";
          if (activeLayer === "rain") {
            if (cell.rain_mm > 40) {
              colorInner = "rgba(2, 132, 199, 0.75)";
              colorMid = "rgba(56, 189, 248, 0.45)";
              colorOuter = "rgba(14, 165, 233, 0)";
            } else if (cell.rain_mm > 15) {
              colorInner = "rgba(56, 189, 248, 0.55)";
              colorMid = "rgba(125, 211, 252, 0.3)";
              colorOuter = "rgba(186, 230, 253, 0)";
            } else {
              colorInner = "rgba(186, 230, 253, 0.35)";
              colorMid = "rgba(224, 242, 254, 0.15)";
              colorOuter = "rgba(240, 249, 255, 0)";
            }
          } else if (activeLayer === "heatwave") {
            if (cell.temp >= 42) {
              colorInner = "rgba(220, 38, 38, 0.8)";
              colorMid = "rgba(249, 115, 22, 0.5)";
              colorOuter = "rgba(251, 146, 60, 0)";
            } else if (cell.temp >= 36) {
              colorInner = "rgba(245, 158, 11, 0.65)";
              colorMid = "rgba(252, 211, 77, 0.35)";
              colorOuter = "rgba(254, 240, 138, 0)";
            } else {
              colorInner = "rgba(254, 240, 138, 0.4)";
              colorMid = "rgba(254, 249, 195, 0.2)";
              colorOuter = "rgba(255, 255, 255, 0)";
            }
          } else if (activeLayer === "cyclone") {
            if (cell.hazardType === "cyclone") {
              colorInner = "rgba(225, 29, 72, 0.85)";
              colorMid = "rgba(244, 63, 94, 0.55)";
              colorOuter = "rgba(251, 113, 133, 0)";
            } else if (cell.wind_speed > 35) {
              colorInner = "rgba(249, 115, 22, 0.65)";
              colorMid = "rgba(251, 146, 60, 0.35)";
              colorOuter = "rgba(253, 186, 116, 0)";
            } else {
              colorInner = "rgba(148, 163, 184, 0.15)";
              colorMid = "rgba(148, 163, 184, 0.05)";
              colorOuter = "rgba(0, 0, 0, 0)";
            }
          } else if (activeLayer === "wind") {
            if (cell.wind_speed > 45) {
              colorInner = "rgba(13, 148, 136, 0.8)";
              colorMid = "rgba(20, 184, 166, 0.45)";
              colorOuter = "rgba(94, 234, 212, 0)";
            } else if (cell.wind_speed > 25) {
              colorInner = "rgba(45, 212, 191, 0.55)";
              colorMid = "rgba(153, 246, 228, 0.3)";
              colorOuter = "rgba(204, 251, 241, 0)";
            } else {
              colorInner = "rgba(167, 243, 208, 0.35)";
              colorMid = "rgba(209, 250, 229, 0.15)";
              colorOuter = "rgba(236, 253, 245, 0)";
            }
          } else if (activeLayer === "humidity") {
            if (cell.humidity > 85) {
              colorInner = "rgba(126, 34, 206, 0.75)";
              colorMid = "rgba(168, 85, 247, 0.45)";
              colorOuter = "rgba(216, 180, 254, 0)";
            } else if (cell.humidity > 65) {
              colorInner = "rgba(168, 85, 247, 0.55)";
              colorMid = "rgba(216, 180, 254, 0.3)";
              colorOuter = "rgba(243, 232, 255, 0)";
            } else {
              colorInner = "rgba(233, 213, 255, 0.35)";
              colorMid = "rgba(243, 232, 255, 0.15)";
              colorOuter = "rgba(250, 245, 255, 0)";
            }
          } else {
            if (cell.hazardType === "cyclone") {
              colorInner = "rgba(225, 29, 72, 0.85)";
              colorMid = "rgba(244, 63, 94, 0.5)";
              colorOuter = "rgba(251, 113, 133, 0)";
            } else if (cell.hazardType === "flood") {
              colorInner = "rgba(249, 115, 22, 0.8)";
              colorMid = "rgba(251, 146, 60, 0.45)";
              colorOuter = "rgba(253, 186, 116, 0)";
            } else if (cell.hazardType === "heatwave") {
              colorInner = "rgba(234, 179, 8, 0.75)";
              colorMid = "rgba(250, 204, 21, 0.4)";
              colorOuter = "rgba(254, 240, 138, 0)";
            } else if (cell.hazardType === "heavy_rain") {
              colorInner = "rgba(14, 165, 233, 0.7)";
              colorMid = "rgba(56, 189, 248, 0.4)";
              colorOuter = "rgba(186, 230, 253, 0)";
            } else {
              colorInner = "rgba(56, 189, 248, 0.25)";
              colorMid = "rgba(125, 211, 252, 0.1)";
              colorOuter = "rgba(224, 242, 254, 0)";
            }
          }
          const rad = baseRadius * (0.8 + cell.intensity * 0.6);
          const gradient = ctx.createRadialGradient(
            point.x,
            point.y,
            2,
            point.x,
            point.y,
            rad
          );
          gradient.addColorStop(0, colorInner);
          gradient.addColorStop(0.5, colorMid);
          gradient.addColorStop(1, colorOuter);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, rad, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
    const overlay = new CanvasOverlay();
    overlay.addTo(map);
    canvasLayerRef.current = overlay;
    if (cityMarkersLayerRef.current) {
      map.removeLayer(cityMarkersLayerRef.current);
    }
    const cityGroup = L.layerGroup();
    MAJOR_INDIAN_CITIES.forEach((city) => {
      const isSelected = (city?.city || "").toLowerCase() === (location?.city || "").toLowerCase();
      const cityIcon = L.divIcon({
        className: "custom-city-marker",
        html: `
          <div class="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
            <div class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border ${isSelected ? "bg-cyan-500 text-slate-950 border-white" : "bg-slate-900/90 text-slate-200 border-sky-500/30"} whitespace-nowrap backdrop-blur-md flex items-center gap-1">
              <span>${city.city}</span>
              <span class="${isSelected ? "text-slate-950 font-extrabold" : "text-sky-300"}">${city.temp}\xB0</span>
            </div>
            <div class="w-1.5 h-1.5 rounded-full ${isSelected ? "bg-cyan-400" : "bg-sky-400/80"} shadow-sm mt-0.5"></div>
          </div>
        `,
        iconSize: [70, 30],
        iconAnchor: [35, 15]
      });
      const marker = L.marker([city.lat, city.lng], { icon: cityIcon });
      marker.on("click", () => {
        onLocationChange({
          lat: city.lat,
          lng: city.lng,
          city: city.city,
          state: city.state,
          country: "India"
        });
      });
      cityGroup.addLayer(marker);
    });
    cityGroup.addTo(map);
    cityMarkersLayerRef.current = cityGroup;
  }, [activeLayer, location.city]);
  return <div id="weather-map-container" className="relative w-full h-full min-h-[380px] bg-[#060b14] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {
    /* Radar Scanning Sweep Overlay Animation */
  }
      {radarScanning && <div
    id="radar-sweep-overlay"
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden opacity-40"
  >
          <div className="w-[800px] h-[800px] rounded-full border border-sky-500/20 radar-sweep-effect flex items-center justify-center">
            <div className="w-full h-1/2 bg-gradient-to-t from-sky-400/25 via-cyan-500/10 to-transparent origin-bottom rounded-t-full" />
          </div>
        </div>}
    </div>;
};
