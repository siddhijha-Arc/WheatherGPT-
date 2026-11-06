export const DEFAULT_LOCATION = {
  city: "New Delhi",
  state: "Delhi NCR",
  lat: 28.6139,
  lng: 77.209,
  country: "India"
};
export const MAJOR_INDIAN_CITIES = [
  // Northern & Himalayan Region (High micro-climatic gradient)
  { city: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973, temp: 18, condition: "Valley Mild / Clouds", humidity: 64, wind: 8, hazard: "normal", rain_mm: 2, pressure: 1016, aqi: 42 },
  { city: "Gulmarg", state: "Jammu & Kashmir", lat: 34.0484, lng: 74.3805, temp: 11, condition: "Chilly Ridge / Alpine Fog", humidity: 82, wind: 14, hazard: "normal", rain_mm: 5, pressure: 1018, aqi: 20 },
  { city: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.857, temp: 31, condition: "Plains Warmth", humidity: 58, wind: 10, hazard: "normal", rain_mm: 0, pressure: 1008, aqi: 85 },
  { city: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, temp: 13, condition: "Clear Mountain Air", humidity: 24, wind: 16, hazard: "normal", rain_mm: 0, pressure: 1020, aqi: 18 },
  { city: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, temp: 17, condition: "Hillside Rain & Fog", humidity: 82, wind: 10, hazard: "normal", rain_mm: 8, pressure: 1014, aqi: 35 },
  { city: "Manali", state: "Himachal Pradesh", lat: 32.2432, lng: 77.1892, temp: 14, condition: "Alpine Showers", humidity: 86, wind: 12, hazard: "normal", rain_mm: 14, pressure: 1016, aqi: 25 },
  { city: "Dharamshala", state: "Himachal Pradesh", lat: 32.219, lng: 76.3234, temp: 21, condition: "Heavy Hillside Rain", humidity: 90, wind: 14, hazard: "heavy_rain", rain_mm: 45, pressure: 1011, aqi: 30 },
  { city: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, temp: 26, condition: "Monsoon Clouds", humidity: 76, wind: 12, hazard: "heavy_rain", rain_mm: 32, pressure: 1008, aqi: 55 },
  { city: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642, temp: 30, condition: "Humid Overcast", humidity: 70, wind: 12, hazard: "normal", rain_mm: 6, pressure: 1007, aqi: 65 },
  { city: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lng: 76.7794, temp: 33, condition: "Warm & Humid", humidity: 62, wind: 12, hazard: "normal", rain_mm: 0, pressure: 1007, aqi: 120 },
  { city: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723, temp: 34, condition: "Clear Plains Skies", humidity: 55, wind: 10, hazard: "normal", rain_mm: 0, pressure: 1006, aqi: 110 },
  { city: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573, temp: 34, condition: "Warm Plains", humidity: 54, wind: 12, hazard: "normal", rain_mm: 0, pressure: 1006, aqi: 135 },
  { city: "New Delhi", state: "Delhi NCR", lat: 28.6139, lng: 77.209, temp: 35, condition: "Haze / Moderate Loo", humidity: 50, wind: 16, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 185 },
  { city: "Rohini Sector 22", state: "Delhi NCR", lat: 28.7205, lng: 77.1065, temp: 34, condition: "Clear / Pleasant Breeze", humidity: 52, wind: 14, hazard: "normal", rain_mm: 0, pressure: 1006, aqi: 165 },
  { city: "Rohini Sector 10", state: "Delhi NCR", lat: 28.7041, lng: 77.1167, temp: 34, condition: "Clear Sky", humidity: 52, wind: 14, hazard: "normal", rain_mm: 0, pressure: 1006, aqi: 170 },
  { city: "Pitampura", state: "Delhi NCR", lat: 28.6973, lng: 77.1384, temp: 34, condition: "Partly Cloudy", humidity: 53, wind: 15, hazard: "normal", rain_mm: 0, pressure: 1006, aqi: 172 },
  { city: "Noida", state: "Uttar Pradesh (NCR)", lat: 28.5355, lng: 77.391, temp: 35, condition: "Warm & Hazy", humidity: 52, wind: 14, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 190 },
  { city: "Gurugram", state: "Haryana (NCR)", lat: 28.4595, lng: 77.0266, temp: 36, condition: "Hot Urban Core", humidity: 48, wind: 16, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 180 },
  // Western & Desert Region (Thermal Peak)
  { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, temp: 39, condition: "Severe Heatwave Alert", humidity: 30, wind: 22, hazard: "heatwave", rain_mm: 0, pressure: 1004, aqi: 140 },
  { city: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, temp: 42, condition: "Intense Loo Thermal Core", humidity: 24, wind: 26, hazard: "heatwave", rain_mm: 0, pressure: 1002, aqi: 115 },
  { city: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119, temp: 43, condition: "Extreme Desert Heat", humidity: 20, wind: 28, hazard: "heatwave", rain_mm: 0, pressure: 1001, aqi: 130 },
  { city: "Jaisalmer", state: "Rajasthan (Thar)", lat: 26.9157, lng: 70.9083, temp: 44, condition: "Desert Furnace Extreme", humidity: 18, wind: 30, hazard: "heatwave", rain_mm: 0, pressure: 1e3, aqi: 145 },
  { city: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, temp: 36, condition: "Warm & Dry", humidity: 38, wind: 16, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 95 },
  { city: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648, temp: 39, condition: "Heatwave", humidity: 32, wind: 20, hazard: "heatwave", rain_mm: 0, pressure: 1004, aqi: 110 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, temp: 37, condition: "High Temperature Advisory", humidity: 46, wind: 18, hazard: "heatwave", rain_mm: 0, pressure: 1006, aqi: 125 },
  { city: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, temp: 32, condition: "Humid Coastal Wind", humidity: 76, wind: 24, hazard: "humidity", rain_mm: 6, pressure: 1008, aqi: 85 },
  { city: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, temp: 36, condition: "Dry & Gusty", humidity: 48, wind: 20, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 90 },
  { city: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, temp: 35, condition: "Warm & Humid", humidity: 55, wind: 16, hazard: "normal", rain_mm: 1, pressure: 1006, aqi: 95 },
  // Central India
  { city: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, temp: 34, condition: "Scattered Cloud Buildup", humidity: 60, wind: 14, hazard: "normal", rain_mm: 4, pressure: 1006, aqi: 95 },
  { city: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, temp: 33, condition: "Partly Overcast", humidity: 64, wind: 16, hazard: "normal", rain_mm: 2, pressure: 1007, aqi: 80 },
  { city: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, temp: 37, condition: "Hot Afternoon", humidity: 44, wind: 16, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 130 },
  { city: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864, temp: 33, condition: "Overcast & Warm", humidity: 68, wind: 14, hazard: "normal", rain_mm: 5, pressure: 1006, aqi: 85 },
  { city: "Nagpur", state: "Maharashtra (Vidarbha)", lat: 21.1458, lng: 79.0882, temp: 38, condition: "Vidarbha Thermal Warning", humidity: 42, wind: 18, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 110 },
  { city: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, temp: 33, condition: "Humid Thunderstorm Watch", humidity: 72, wind: 16, hazard: "normal", rain_mm: 12, pressure: 1006, aqi: 90 },
  // Eastern & Gangetic Plains
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, temp: 35, condition: "High Humid Heat", humidity: 66, wind: 12, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 170 },
  { city: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, temp: 35, condition: "Warm Haze", humidity: 62, wind: 12, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 175 },
  { city: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, temp: 34, condition: "Overcast & Warm", humidity: 70, wind: 14, hazard: "normal", rain_mm: 5, pressure: 1006, aqi: 155 },
  { city: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, temp: 35, condition: "Humid Heat", humidity: 65, wind: 12, hazard: "heatwave", rain_mm: 0, pressure: 1005, aqi: 160 },
  { city: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, temp: 30, condition: "Ganga Flood Basin Watch", humidity: 86, wind: 22, hazard: "flood", rain_mm: 48, pressure: 1004, aqi: 135 },
  { city: "Muzaffarpur", state: "Bihar", lat: 26.1209, lng: 85.3647, temp: 29, condition: "Monsoon Flooding Watch", humidity: 88, wind: 20, hazard: "flood", rain_mm: 52, pressure: 1004, aqi: 120 },
  { city: "Gaya", state: "Bihar", lat: 24.7914, lng: 85.0002, temp: 32, condition: "Heavy Rain Band", humidity: 82, wind: 18, hazard: "flood", rain_mm: 36, pressure: 1005, aqi: 110 },
  { city: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, temp: 28, condition: "Plateau Showers", humidity: 80, wind: 16, hazard: "heavy_rain", rain_mm: 28, pressure: 1007, aqi: 75 },
  { city: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029, temp: 30, condition: "Passing Showers", humidity: 82, wind: 18, hazard: "normal", rain_mm: 16, pressure: 1006, aqi: 88 },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, temp: 30, condition: "Severe Squall & Depression", humidity: 90, wind: 48, hazard: "cyclone", rain_mm: 68, pressure: 998, aqi: 92 },
  { city: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953, temp: 26, condition: "Sub-Himalayan Downpour", humidity: 88, wind: 14, hazard: "heavy_rain", rain_mm: 54, pressure: 1006, aqi: 45 },
  // North-Eastern Region
  { city: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, temp: 25, condition: "Brahmaputra Inundation Alert", humidity: 94, wind: 24, hazard: "flood", rain_mm: 82, pressure: 1003, aqi: 38 },
  { city: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, temp: 19, condition: "Torrential Hills Precipitation", humidity: 96, wind: 18, hazard: "heavy_rain", rain_mm: 110, pressure: 1010, aqi: 22 },
  { city: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868, temp: 27, condition: "Monsoon Depression", humidity: 91, wind: 26, hazard: "heavy_rain", rain_mm: 58, pressure: 1002, aqi: 35 },
  { city: "Imphal", state: "Manipur", lat: 24.817, lng: 93.9368, temp: 23, condition: "Valley Rain", humidity: 89, wind: 12, hazard: "normal", rain_mm: 24, pressure: 1008, aqi: 28 },
  { city: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176, temp: 22, condition: "Hills Mist & Rain", humidity: 92, wind: 14, hazard: "normal", rain_mm: 30, pressure: 1010, aqi: 24 },
  // Eastern Coast & Bay of Bengal Cyclone Zone
  { city: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, temp: 29, condition: "Deep Cyclone Eye Wall Watch", humidity: 92, wind: 64, hazard: "cyclone", rain_mm: 92, pressure: 988, aqi: 60 },
  { city: "Puri", state: "Odisha Coastal", lat: 19.8135, lng: 85.8312, temp: 28, condition: "Severe Coastal Surge & Gale", humidity: 95, wind: 78, hazard: "cyclone", rain_mm: 115, pressure: 982, aqi: 50 },
  { city: "Cuttack", state: "Odisha", lat: 20.4625, lng: 85.8828, temp: 29, condition: "Cyclone Inflow Winds", humidity: 90, wind: 58, hazard: "cyclone", rain_mm: 78, pressure: 990, aqi: 58 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, temp: 31, condition: "Squall Warnings Active", humidity: 88, wind: 46, hazard: "cyclone", rain_mm: 45, pressure: 996, aqi: 75 },
  { city: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.648, temp: 33, condition: "Krishna Delta Humid Surge", humidity: 82, wind: 26, hazard: "humidity", rain_mm: 18, pressure: 1005, aqi: 85 },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, temp: 33, condition: "High Coastal Humidity (88%)", humidity: 88, wind: 28, hazard: "humidity", rain_mm: 14, pressure: 1007, aqi: 95 },
  { city: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, temp: 34, condition: "Hot & Humid Interiors", humidity: 74, wind: 18, hazard: "humidity", rain_mm: 5, pressure: 1008, aqi: 70 },
  { city: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, temp: 28, condition: "Pleasant Western Ghats Air", humidity: 75, wind: 18, hazard: "normal", rain_mm: 12, pressure: 1010, aqi: 50 },
  // Western Coast & Arabian Sea (Monsoon Belt)
  { city: "Mumbai", state: "Maharashtra (Konkan)", lat: 19.076, lng: 72.8777, temp: 28, condition: "Doppler Red Alert: Heavy Downpour", humidity: 94, wind: 36, hazard: "heavy_rain", rain_mm: 88, pressure: 1004, aqi: 65 },
  { city: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781, temp: 28, condition: "Intense Rain Showers", humidity: 93, wind: 32, hazard: "heavy_rain", rain_mm: 80, pressure: 1004, aqi: 68 },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, temp: 26, condition: "Ghats Misty Heavy Rain", humidity: 85, wind: 24, hazard: "heavy_rain", rain_mm: 42, pressure: 1006, aqi: 60 },
  { city: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898, temp: 27, condition: "Cloudy & Light Rain", humidity: 82, wind: 20, hazard: "normal", rain_mm: 15, pressure: 1006, aqi: 58 },
  { city: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, temp: 27, condition: "Monsoon Squall Belt", humidity: 95, wind: 40, hazard: "heavy_rain", rain_mm: 95, pressure: 1005, aqi: 35 },
  { city: "Mangaluru", state: "Karnataka Coast", lat: 12.9141, lng: 74.856, temp: 27, condition: "Heavy Coastal Precipitation", humidity: 93, wind: 34, hazard: "heavy_rain", rain_mm: 78, pressure: 1006, aqi: 40 },
  { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, temp: 27, condition: "Kerala Monsoon Influx", humidity: 96, wind: 32, hazard: "heavy_rain", rain_mm: 84, pressure: 1007, aqi: 32 },
  { city: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, temp: 28, condition: "Coastal Showers & Clouds", humidity: 90, wind: 26, hazard: "heavy_rain", rain_mm: 52, pressure: 1008, aqi: 30 },
  { city: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804, temp: 27, condition: "Monsoon Rain Bands", humidity: 94, wind: 30, hazard: "heavy_rain", rain_mm: 70, pressure: 1007, aqi: 30 },
  // Southern Deccan Plateau
  { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, temp: 23, condition: "Pleasant Showers & Breezes", humidity: 78, wind: 16, hazard: "normal", rain_mm: 12, pressure: 1012, aqi: 45 },
  { city: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394, temp: 24, condition: "Light Rain / Overcast", humidity: 80, wind: 14, hazard: "normal", rain_mm: 10, pressure: 1012, aqi: 40 },
  { city: "Hubballi", state: "Karnataka", lat: 15.3647, lng: 75.124, temp: 28, condition: "Breezy Showers", humidity: 76, wind: 20, hazard: "normal", rain_mm: 8, pressure: 1009, aqi: 50 },
  { city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, temp: 31, condition: "Warm & Gusty Skies", humidity: 64, wind: 20, hazard: "normal", rain_mm: 4, pressure: 1008, aqi: 90 },
  { city: "Warangal", state: "Telangana", lat: 17.9689, lng: 79.5941, temp: 33, condition: "Humid Weather", humidity: 70, wind: 16, hazard: "normal", rain_mm: 8, pressure: 1007, aqi: 85 }
];
export function getFallbackWeatherForCoords(lat, lng, cityName) {
  let closest = MAJOR_INDIAN_CITIES[0];
  let minDistance = 999999;
  for (const c of MAJOR_INDIAN_CITIES) {
    const d = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lng - lng, 2));
    if (d < minDistance) {
      minDistance = d;
      closest = c;
    }
  }
  const name = cityName || closest.city;
  const isCyclone = closest.hazard === "cyclone";
  const isFlood = closest.hazard === "flood";
  const isHeat = closest.hazard === "heatwave";
  const isRain = closest.hazard === "heavy_rain";
  let hazard_type = "normal";
  let hazard_level = "none";
  let hazard_summary = "Normal conditions. No critical warnings active.";
  if (isCyclone) {
    hazard_type = "cyclone";
    hazard_level = "severe";
    hazard_summary = "IMD Alert: Deep atmospheric depression / Cyclone watch active in coastal belt.";
  } else if (isFlood) {
    hazard_type = "flood";
    hazard_level = "high";
    hazard_summary = "Flood risk: River levels approaching high danger mark. Low-lying waterlogging expected.";
  } else if (isHeat) {
    hazard_type = "heatwave";
    hazard_level = "moderate";
    hazard_summary = "Heatwave Advisory: Afternoon temperatures exceed 40\xB0C. Stay hydrated.";
  } else if (isRain) {
    hazard_type = "heavy_rain";
    hazard_level = "moderate";
    hazard_summary = "Heavy Rainfall Alert: Monsoon precipitation active (25-45mm). Reduced visibility.";
  }
  return {
    city: name,
    state: closest.state,
    lat,
    lng,
    temp: closest.temp,
    feels_like: closest.temp + (closest.humidity > 70 ? 3 : -1),
    condition: closest.condition,
    description: `Meteorological observation for ${name}, ${closest.state}.`,
    icon: isRain ? "cloud-rain" : isHeat ? "sun" : isCyclone ? "tornado" : "cloud-sun",
    humidity: closest.humidity,
    wind_speed: closest.wind,
    wind_direction: "SW",
    pressure: 1008,
    visibility: isRain ? 4 : isHeat ? 8 : 10,
    uv_index: isHeat ? 9 : 4,
    rainfall_mm: isRain ? 32 : isFlood ? 48 : 0,
    hazard_type,
    hazard_level,
    hazard_summary,
    fetched_at: (/* @__PURE__ */ new Date()).toISOString(),
    source: "meteorological_cache",
    cached: true
  };
}
export function generateIndiaHazardGrid() {
  const cells = [];
  const hazardCenters = [
    // Cyclone near Odisha / Bay of Bengal coast
    { lat: 19.8, lng: 86.2, type: "cyclone", level: "severe", radius: 4.5, intensity: 0.95, label: "Cyclone Watch (Bay of Bengal)" },
    // Flood in Assam / Brahmaputra
    { lat: 26.3, lng: 92.5, type: "flood", level: "high", radius: 3.5, intensity: 0.88, label: "Brahmaputra Flood Basin" },
    // Heatwave in Western Rajasthan
    { lat: 27.2, lng: 73, type: "heatwave", level: "high", radius: 4, intensity: 0.9, label: "Thar Heatwave Belt" },
    // Heavy rain in Konkan / Mumbai Ghats
    { lat: 18.9, lng: 73.2, type: "heavy_rain", level: "moderate", radius: 2.8, intensity: 0.75, label: "Konkan Monsoon Surge" },
    // Flood in North Bihar
    { lat: 25.8, lng: 86, type: "flood", level: "high", radius: 2.5, intensity: 0.82, label: "Kosi/Ganga Flood Inundation" },
    // Rain in Kerala / Western Ghats
    { lat: 10.2, lng: 76.5, type: "heavy_rain", level: "moderate", radius: 2.5, intensity: 0.7, label: "Western Ghats Downpour" },
    // Heat in Central India / Vidarbha
    { lat: 21.1, lng: 79.1, type: "heatwave", level: "moderate", radius: 3, intensity: 0.72, label: "Vidarbha Heat Zone" }
  ];
  for (let lat = 8.5; lat <= 35; lat += 1.3) {
    for (let lng = 69; lng <= 95; lng += 1.3) {
      let strongestHazard = {
        type: "normal",
        level: "none",
        intensity: 0.1,
        label: "Clear / Normal"
      };
      for (const center of hazardCenters) {
        const dist = Math.sqrt(Math.pow(center.lat - lat, 2) + Math.pow(center.lng - lng, 2));
        if (dist <= center.radius) {
          const factor = 1 - dist / center.radius;
          const currentIntensity = center.intensity * factor;
          if (currentIntensity > strongestHazard.intensity) {
            strongestHazard = {
              type: center.type,
              level: center.level,
              intensity: Math.min(1, Math.max(0.1, currentIntensity)),
              label: center.label
            };
          }
        }
      }
      const temp = strongestHazard.type === "heatwave" ? 38 + Math.round(strongestHazard.intensity * 6) : strongestHazard.type === "heavy_rain" ? 24 - Math.round(strongestHazard.intensity * 3) : Math.round(28 + Math.sin(lat) * 5);
      const rain_mm = strongestHazard.type === "heavy_rain" ? Math.round(strongestHazard.intensity * 75) : strongestHazard.type === "flood" ? Math.round(strongestHazard.intensity * 60) : strongestHazard.type === "cyclone" ? Math.round(strongestHazard.intensity * 90) : 0;
      const wind_speed = strongestHazard.type === "cyclone" ? Math.round(40 + strongestHazard.intensity * 65) : strongestHazard.type === "heavy_rain" ? Math.round(20 + strongestHazard.intensity * 25) : Math.round(10 + Math.random() * 12);
      const humidity = strongestHazard.type === "heavy_rain" || strongestHazard.type === "flood" || strongestHazard.type === "cyclone" ? Math.round(80 + strongestHazard.intensity * 18) : strongestHazard.type === "heatwave" ? Math.round(30 - strongestHazard.intensity * 15) : Math.round(50 + Math.sin(lng) * 20);
      cells.push({
        id: `grid_${lat.toFixed(1)}_${lng.toFixed(1)}`,
        lat: Number(lat.toFixed(2)),
        lng: Number(lng.toFixed(2)),
        hazardType: strongestHazard.type,
        hazardLevel: strongestHazard.level,
        intensity: Number(strongestHazard.intensity.toFixed(2)),
        label: strongestHazard.label,
        temp,
        rain_mm,
        wind_speed,
        humidity
      });
    }
  }
  return cells;
}
