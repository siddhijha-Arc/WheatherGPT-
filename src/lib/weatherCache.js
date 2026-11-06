/**
 * WeatherGPT Rural & Agricultural Offline Weather Caching Engine
 * Manages localStorage persistence and offline fallback models for areas with intermittent connectivity.
 */

const LOCAL_STORAGE_RECENT_KEY = "weathergpt_latest_weather_data";
const LOCAL_STORAGE_CITY_MAP_KEY = "weathergpt_location_weather_cache";

/**
 * Normalizes location into a cache key string
 */
export function getLocationCacheKey(loc) {
  if (!loc) return "default";
  if (loc.city && typeof loc.city === "string" && loc.city.trim().length > 0) {
    return loc.city.toLowerCase().trim();
  }
  if (loc.lat && loc.lng) {
    return `${Number(loc.lat).toFixed(2)}_${Number(loc.lng).toFixed(2)}`;
  }
  return "default";
}

/**
 * Saves successfully fetched live weather data to localStorage for rural offline use
 */
export function saveWeatherToCache(location, weatherData) {
  if (!weatherData) return;
  try {
    const key = getLocationCacheKey(location);
    const timeNow = new Date().toISOString();

    const cacheEntry = {
      ...weatherData,
      cached_at: timeNow,
      is_offline_cached: true,
      cache_key: key
    };

    // Save as most recent global weather
    localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(cacheEntry));

    // Save into location dictionary map (holds up to 15 recent locations/fields)
    let cityMap = {};
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_CITY_MAP_KEY);
    if (existingRaw) {
      try {
        cityMap = JSON.parse(existingRaw);
      } catch (e) {
        cityMap = {};
      }
    }

    cityMap[key] = cacheEntry;

    // Prune map if more than 15 entries
    const keys = Object.keys(cityMap);
    if (keys.length > 15) {
      delete cityMap[keys[0]];
    }

    localStorage.setItem(LOCAL_STORAGE_CITY_MAP_KEY, JSON.stringify(cityMap));
  } catch (err) {
    console.warn("Unable to save weather to localStorage:", err);
  }
}

/**
 * Retrieves cached weather for a specific location or the most recent weather saved
 */
export function getCachedWeather(location) {
  try {
    const key = getLocationCacheKey(location);

    // 1. Try exact location match from city map
    const mapRaw = localStorage.getItem(LOCAL_STORAGE_CITY_MAP_KEY);
    if (mapRaw) {
      const cityMap = JSON.parse(mapRaw);
      if (cityMap[key]) {
        return cityMap[key];
      }
    }

    // 2. Fallback to the last available cached weather
    const recentRaw = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
    if (recentRaw) {
      const recentData = JSON.parse(recentRaw);
      return {
        ...recentData,
        city: location?.city || recentData.city || "Cached Location",
        state: location?.state || recentData.state || "India",
        lat: location?.lat || recentData.lat,
        lng: location?.lng || recentData.lng,
        is_offline_cached: true,
        is_approximate_location_cache: recentData.city?.toLowerCase() !== location?.city?.toLowerCase()
      };
    }
  } catch (err) {
    console.warn("Error reading weather from localStorage cache:", err);
  }

  return null;
}

/**
 * Generates an offline agricultural fallback forecast if no local cache exists at all
 */
export function getOfflineFallbackWeather(location) {
  const city = location?.city || "Agricultural Zone";
  const state = location?.state || "India";
  const timeNow = new Date().toISOString();

  return {
    city,
    state,
    lat: location?.lat || 28.6139,
    lng: location?.lng || 77.209,
    temp: 32,
    feels_like: 35,
    condition: "Partly Cloudy (Offline Mode)",
    description: "Offline Agricultural Mode: Displaying safe regional seasonal baseline forecast.",
    icon: "cloud-sun",
    humidity: 65,
    wind_speed: 14,
    wind_direction: "SW",
    pressure: 1008,
    visibility: 10,
    uv_index: 6,
    rainfall_mm: 0,
    aqi: 95,
    pm2_5: 35,
    pm10: 70,
    no2: 18,
    so2: 6,
    ozone: 28,
    dust: 12,
    hazard_type: "normal",
    hazard_level: "none",
    hazard_summary: "Rural Offline Connectivity Active: Restoring live satellite feed once signal returns.",
    hourly: Array.from({ length: 24 }).map((_, i) => {
      const h = (new Date().getHours() + i) % 24;
      const isDay = h >= 6 && h < 19;
      return {
        time: `${h.toString().padStart(2, "0")}:00`,
        temp: isDay ? 30 + (i % 5) : 24 - (i % 3),
        feelsLike: isDay ? 33 + (i % 5) : 25,
        humidity: isDay ? 55 : 80,
        rainProbability: 20,
        precipitation: 0,
        uvIndex: isDay ? 6 : 0,
        windSpeed: 12,
        condition: isDay ? "Partly Cloudy" : "Clear Night",
        icon: isDay ? "cloud-sun" : "moon",
        aqi: 95
      };
    }),
    daily: [
      { date: "Today", dayName: "Today", maxTemp: 34, minTemp: 24, uvIndexMax: 7, precipitationSum: 0, windSpeedMax: 16, condition: "Partly Cloudy", icon: "cloud-sun" },
      { date: "Tomorrow", dayName: "Tomorrow", maxTemp: 33, minTemp: 23, uvIndexMax: 6, precipitationSum: 2, windSpeedMax: 14, condition: "Light Showers", icon: "cloud-drizzle" },
      { date: "Day 3", dayName: "Day 3", maxTemp: 35, minTemp: 25, uvIndexMax: 8, precipitationSum: 0, windSpeedMax: 18, condition: "Sunny & Dry", icon: "sun" },
      { date: "Day 4", dayName: "Day 4", maxTemp: 32, minTemp: 22, uvIndexMax: 6, precipitationSum: 5, windSpeedMax: 15, condition: "Scattered Rain", icon: "cloud-rain" },
      { date: "Day 5", dayName: "Day 5", maxTemp: 31, minTemp: 21, uvIndexMax: 5, precipitationSum: 0, windSpeedMax: 12, condition: "Fair", icon: "cloud-sun" }
    ],
    fetched_at: timeNow,
    cached_at: timeNow,
    source: "offline_agricultural_baseline",
    is_offline_cached: true,
    is_offline_fallback: true
  };
}
