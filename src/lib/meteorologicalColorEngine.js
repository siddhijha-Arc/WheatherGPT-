// Meteorological Color Engine with Viewport-Adaptive Dynamic Percentile Normalization

export const TEMPERATURE_RAMP = [
  { val: 0, r: 147, g: 51, b: 234, a: 0.75 },   // <10°C Purple
  { val: 12, r: 59, g: 130, b: 246, a: 0.72 },  // 12°C Indigo Blue
  { val: 18, r: 6, g: 182, b: 212, a: 0.68 },   // 18°C Bright Cyan
  { val: 24, r: 16, g: 185, b: 129, a: 0.65 },  // 24°C Mint Green
  { val: 28, r: 132, g: 204, b: 22, a: 0.68 },  // 28°C Lime Green
  { val: 32, r: 234, g: 179, b: 8, a: 0.75 },   // 32°C Amber Gold
  { val: 36, r: 249, g: 115, b: 22, a: 0.82 },  // 36°C Orange Warning
  { val: 40, r: 239, g: 68, b: 68, a: 0.9 },    // 40°C Bright Red Flame
  { val: 44, r: 185, g: 28, b: 28, a: 0.94 },   // 44°C Deep Maroon
  { val: 48, r: 127, g: 29, b: 29, a: 0.96 }    // 48°C Extreme Furnace
];

// True Radar Precipitation Ramp (0 mm is strictly 0.0 transparent so dry areas are 100% clean)
export const RAIN_RAMP = [
  { val: 0, r: 255, g: 255, b: 255, a: 0.0 },   // 0 mm: 100% Crystal Clear (Zero Blue Tint)
  { val: 0.8, r: 255, g: 255, b: 255, a: 0.0 }, // <0.8 mm: Completely Clear
  { val: 2.5, r: 56, g: 189, b: 248, a: 0.45 }, // 2.5 mm: Soft Sky Blue (Light Drizzle)
  { val: 8, r: 34, g: 197, b: 94, a: 0.7 },    // 8 mm: Radar Green (Moderate Showers)
  { val: 18, r: 163, g: 230, b: 53, a: 0.78 }, // 18 mm: Lime Green
  { val: 32, r: 250, g: 204, b: 21, a: 0.85 }, // 32 mm: Yellow Heavy Rain
  { val: 50, r: 249, g: 115, b: 22, a: 0.9 },  // 50 mm: Orange Warning
  { val: 75, r: 239, g: 68, b: 68, a: 0.94 },  // 75 mm: Torrential Red
  { val: 100, r: 192, g: 38, b: 211, a: 0.96 },// 100 mm: Deep Purple Cloudburst
  { val: 130, r: 244, g: 63, b: 94, a: 0.98 }  // 130+ mm: Extreme Magenta
];

// Rain Probability Scan Ramp (% chance) with Stepped NWS Forecast Contours
export const RAIN_PROB_RAMP = [
  { val: 0, r: 255, g: 255, b: 255, a: 0.0 },    // 0-15%: 100% Transparent (Dry/No Blue Tint)
  { val: 15, r: 255, g: 255, b: 255, a: 0.0 },   // 15%: Clear
  { val: 25, r: 56, g: 189, b: 248, a: 0.45 },   // 25%: Soft Sky Blue (Slight Chance)
  { val: 40, r: 34, g: 197, b: 94, a: 0.7 },     // 40%: Radar Green (Possible Showers)
  { val: 55, r: 163, g: 230, b: 53, a: 0.78 },   // 55%: Lime Green (Likely)
  { val: 70, r: 250, g: 204, b: 21, a: 0.85 },   // 70%: Gold Yellow (High Chance)
  { val: 85, r: 249, g: 115, b: 22, a: 0.9 },    // 85%: Vivid Orange (Very Likely)
  { val: 95, r: 239, g: 68, b: 68, a: 0.95 },    // 95%: Red (Definite / Intense)
  { val: 100, r: 192, g: 38, b: 211, a: 0.98 }   // 100%: Purple / Cloudburst Surge
];

export const PRIORITY_HAZARD_RAMP = [
  { val: 0, r: 34, g: 197, b: 94, a: 0.0 },     // 0-20: Safe / Normal (Completely transparent)
  { val: 20, r: 34, g: 197, b: 94, a: 0.0 },    // 20: Safe baseline
  { val: 35, r: 132, g: 204, b: 22, a: 0.4 },   // 35: Mild Watch (Lime)
  { val: 50, r: 234, g: 179, b: 8, a: 0.7 },    // 50: Moderate Alert (Yellow)
  { val: 68, r: 249, g: 115, b: 22, a: 0.85 },  // 68: Severe Hazard (Orange)
  { val: 85, r: 239, g: 68, b: 68, a: 0.92 },   // 85: Red Alert (Cyclone / Flood / Severe Loo)
  { val: 100, r: 127, g: 29, b: 29, a: 0.96 }   // 100: Extreme Disaster Core
];

export const WIND_RAMP = [
  { val: 0, r: 6, g: 182, b: 212, a: 0.15 },    // 0 km/h: Light Cyan Breeze
  { val: 15, r: 16, g: 185, b: 129, a: 0.5 },   // 15 km/h: Teal Breeze
  { val: 28, r: 234, g: 179, b: 8, a: 0.72 },   // 28 km/h: Yellow Moderate
  { val: 45, r: 249, g: 115, b: 22, a: 0.85 },  // 45 km/h: Orange Strong Gale
  { val: 70, r: 239, g: 68, b: 68, a: 0.92 },   // 70 km/h: Red Storm
  { val: 100, r: 147, g: 51, b: 234, a: 0.96 }  // 100+ km/h: Squall Violet
];

export const PRESSURE_RAMP = [
  { val: 980, r: 127, g: 29, b: 29, a: 0.95 },  // 980 hPa Cyclone Eye Core Deep Red
  { val: 990, r: 220, g: 38, b: 38, a: 0.88 },  // 990 hPa Severe Depression
  { val: 998, r: 249, g: 115, b: 22, a: 0.78 }, // 998 hPa Low Pressure Trough
  { val: 1006, r: 234, g: 179, b: 8, a: 0.6 },  // 1006 hPa Moderate
  { val: 1012, r: 2, g: 132, b: 199, a: 0.4 },  // 1012 hPa Ambient Cyan
  { val: 1020, r: 30, g: 58, b: 138, a: 0.45 }  // 1020 hPa High Ridge
];

export const HUMIDITY_RAMP = [
  { val: 15, r: 217, g: 119, b: 6, a: 0.65 },   // 15% Arid Desert
  { val: 35, r: 234, g: 179, b: 8, a: 0.55 },   // 35% Warm Dry
  { val: 60, r: 34, g: 197, b: 94, a: 0.55 },   // 60% Fresh Normal
  { val: 75, r: 6, g: 182, b: 212, a: 0.72 },   // 75% Humid Cyan
  { val: 90, r: 37, g: 99, b: 235, a: 0.86 },   // 90% Deep Monsoon Blue
  { val: 100, r: 124, g: 58, b: 237, a: 0.92 }  // 100% Saturated
];

export const AQI_RAMP = [
  { val: 0, r: 34, g: 197, b: 94, a: 0.55 },    // Good Green
  { val: 50, r: 132, g: 204, b: 22, a: 0.6 },   // Satisfactory Lime
  { val: 100, r: 234, g: 179, b: 8, a: 0.7 },   // Moderate Yellow
  { val: 175, r: 249, g: 115, b: 22, a: 0.82 }, // Poor Orange
  { val: 250, r: 239, g: 68, b: 68, a: 0.9 },   // Very Poor Red
  { val: 350, r: 185, g: 28, b: 28, a: 0.95 }   // Severe Maroon
];

// Hybrid Semantic Category + Local Contrast Color Grading System ("Dynamic contrast, fixed meaning")
export function interpolateColorHybridSemantic(ramp, val, useStepped = false) {
  // 1. Find absolute global semantic category (two adjacent stops in the absolute ramp)
  if (val <= ramp[0].val) {
    const first = ramp[0];
    return { r: first.r, g: first.g, b: first.b, a: first.a ?? 1 };
  }
  if (val >= ramp[ramp.length - 1].val) {
    const last = ramp[ramp.length - 1];
    return { r: last.r, g: last.g, b: last.b, a: last.a ?? 1 };
  }

  let catStart = ramp[0];
  let catEnd = ramp[ramp.length - 1];
  let catIdx = 0;

  for (let i = 0; i < ramp.length - 1; i++) {
    const s1 = ramp[i];
    const s2 = ramp[i + 1];
    if (val >= s1.val && val <= s2.val) {
      catStart = s1;
      catEnd = s2;
      catIdx = i;
      break;
    }
  }

  // Base semantic color from absolute thresholds
  const baseColor = interpolateColor(ramp, val, useStepped);

  // 2. Local contrast enhancement within the semantic category
  // Modulate alpha and brightness slightly based on position between catStart.val and catEnd.val
  const catSpan = catEnd.val - catStart.val;
  if (catSpan <= 0.0001) return baseColor;

  const intraCatT = (val - catStart.val) / catSpan; // 0.0 to 1.0 within category

  // Slight local intensity modulation (±12% alpha variation so nearby values are visually distinct without altering color meaning)
  const alphaMod = 0.88 + intraCatT * 0.24; // ranges from 0.88 to 1.12
  const finalAlpha = Math.min(1.0, Math.max(0.1, (baseColor.a ?? 1) * alphaMod));

  return {
    r: baseColor.r,
    g: baseColor.g,
    b: baseColor.b,
    a: finalAlpha
  };
}

// Viewport-Adaptive Dynamic Color Interpolation with Percentile Normalization
export function interpolateColorViewportAdaptive(ramp, val, minVal, maxVal, useStepped = false) {
  // Use hybrid semantic grading so absolute meteorological meaning is ALWAYS preserved,
  // while local contrast enhancements distinguish nearby values.
  return interpolateColorHybridSemantic(ramp, val, useStepped);
}

// NWS Stepped Contour Palette Interpolator
export function interpolateColor(ramp, val, useStepped = false) {
  if (val <= ramp[0].val) {
    const first = ramp[0];
    return { r: first.r, g: first.g, b: first.b, a: first.a ?? 1 };
  }
  if (val >= ramp[ramp.length - 1].val) {
    const last = ramp[ramp.length - 1];
    return { r: last.r, g: last.g, b: last.b, a: last.a ?? 1 };
  }

  for (let i = 0; i < ramp.length - 1; i++) {
    const s1 = ramp[i];
    const s2 = ramp[i + 1];
    if (val >= s1.val && val <= s2.val) {
      if (useStepped) {
        // Crisp contour step (NWS Graphical Forecast style)
        return { r: s1.r, g: s1.g, b: s1.b, a: s1.a ?? 1 };
      }
      const t = (val - s1.val) / (s2.val - s1.val);
      const r = Math.round(s1.r + t * (s2.r - s1.r));
      const g = Math.round(s1.g + t * (s2.g - s1.g));
      const b = Math.round(s1.b + t * (s2.b - s1.b));
      const a1 = s1.a ?? 1;
      const a2 = s2.a ?? 1;
      const a = a1 + t * (a2 - a1);
      return { r, g, b, a };
    }
  }
  return { r: 128, g: 128, b: 128, a: 0 };
}

// True Localized Meteorological Calculation Engine
export function calculateIDW(lat, lng, stations, layer) {
  if (!stations || stations.length === 0) {
    return { value: 0, unit: getLayerUnit(layer), rainProb: 0, hazardLabel: "Normal" };
  }

  // 1. Specialized Localized Precipitation Engine (Zero-Bleed over Dry Regions)
  if (layer === "rain" || layer === "rain_prob" || layer === "rain_probability") {
    let nearestDist = 999;
    let nearestStation = stations[0];
    let rainSum = 0;
    let weightSum = 0;

    for (const s of stations) {
      const dLat = s.lat - lat;
      const dLng = s.lng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng); // 1 degree ≈ 111 km

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestStation = s;
      }

      const sRain = s.rain_mm ?? (s.hazard === "heavy_rain" ? 65 : s.hazard === "flood" ? 75 : 0);

      if (sRain > 0) {
        // Tight, realistic physical storm cell radius (0.6° - 1.4° max ~60-150 km)
        const cellRadius = sRain >= 70 ? 1.4 : sRain >= 30 ? 1.0 : 0.65;
        if (dist <= cellRadius) {
          const normDist = dist / cellRadius;
          const weight = Math.exp(-4.5 * normDist * normDist);
          rainSum += sRain * weight;
          weightSum += weight;
        }
      }
    }

    // If the closest station is explicitly 0mm and close (< 0.7°), strict zero rain
    const nearestRain = nearestStation.rain_mm ?? 0;
    if (nearestRain === 0 && nearestDist < 0.7) {
      const hum = nearestStation.humidity || 50;
      const rainProb = hum > 78 ? Math.round((hum - 78) * 1.2) : 0;
      if (layer === "rain_prob" || layer === "rain_probability") {
        return {
          value: rainProb,
          unit: "%",
          rainProb,
          hazardLabel: rainProb > 25 ? "Slight Chance (हल्की संभावना)" : "0% Dry / Clear (शुष्क)"
        };
      }
      return {
        value: 0,
        unit: "mm",
        rainProb,
        hazardLabel: "Dry / Clear (शुष्क)"
      };
    }

    let finalRain = 0;
    if (weightSum > 0) {
      finalRain = Number((rainSum / (weightSum + 0.25)).toFixed(1));
    }

    if (finalRain < 0.5) finalRain = 0;

    // Rain Probability (%) Calculation
    let rainProb = 0;
    if (finalRain > 0) {
      rainProb = Math.min(100, Math.round(35 + finalRain * 0.7 + (nearestStation.humidity || 60) * 0.2));
    } else {
      const hum = nearestStation.humidity || 50;
      rainProb = hum > 75 ? Math.round((hum - 75) * 1.4) : Math.max(0, Math.round((hum - 55) * 0.3));
    }

    if (layer === "rain_prob" || layer === "rain_probability") {
      const probLabel =
        rainProb >= 85
          ? "🔴 Imminent / Torrential (प्रबल वर्षा)"
          : rainProb >= 70
          ? "🟠 High Probability (भारी वर्षा संभाव्यता)"
          : rainProb >= 40
          ? "🟡 Moderate Chance (मध्यम वर्षा संभावना)"
          : rainProb >= 20
          ? "🟢 Slight Chance (हल्की बूंदाबांदी संभावना)"
          : "⚪ Dry / Clear (शुष्क)";

      return {
        value: rainProb,
        unit: "%",
        rainProb,
        hazardLabel: probLabel
      };
    }

    return {
      value: finalRain,
      unit: "mm",
      rainProb,
      hazardLabel:
        finalRain >= 70
          ? "Torrential Downpour (अति भारी वर्षा)"
          : finalRain >= 30
          ? "Heavy Rain (भारी वर्षा)"
          : finalRain >= 10
          ? "Moderate Rain (मध्यम वर्षा)"
          : finalRain > 0
          ? "Light Drizzle (बूंदाबांदी)"
          : "Dry / Clear (शुष्क)"
    };
  }

  // 2. Priority Multi-Hazard Vulnerability Score (0 - 100 scale)
  if (layer === "priority") {
    let maxHazardScore = 0;
    let dominantHazard = "Normal (सामान्य)";

    for (const s of stations) {
      const dLat = s.lat - lat;
      const dLng = s.lng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      // Station-specific hazard severity
      let sScore = 10;
      let sLabel = "Normal";

      if (s.hazard === "cyclone" || (s.pressure && s.pressure < 995)) {
        sScore = Math.max(85, 100 - (s.pressure ? (s.pressure - 980) * 1.5 : 0));
        sLabel = "Cyclone Storm Surge (चक्रवात)";
      } else if (s.hazard === "flood" || s.rain_mm >= 75) {
        sScore = Math.min(95, 70 + (s.rain_mm || 75) * 0.3);
        sLabel = "Flood Inundation Alert (बाढ़ चेतावनी)";
      } else if (s.hazard === "heavy_rain" || (s.rain_mm && s.rain_mm >= 35)) {
        sScore = Math.min(85, 50 + (s.rain_mm || 40) * 0.4);
        sLabel = "Heavy Precipitation Alert (भारी वर्षा)";
      } else if (s.hazard === "heatwave" || (s.temp && s.temp >= 40)) {
        sScore = Math.min(95, 60 + ((s.temp || 40) - 38) * 4);
        sLabel = "Severe Heatwave & Loo (भीषण लू)";
      } else if (s.temp && s.temp >= 36) {
        sScore = 35 + (s.temp - 36) * 3;
        sLabel = "Warm & Humid (उमस भरी गर्मी)";
      }

      // Proximity falloff
      const radius = s.hazard === "cyclone" ? 2.5 : 1.8;
      if (dist <= radius) {
        const falloff = Math.max(0, 1 - dist / radius);
        const effectiveScore = sScore * falloff;
        if (effectiveScore > maxHazardScore) {
          maxHazardScore = effectiveScore;
          dominantHazard = sLabel;
        }
      }
    }

    const finalScore = Number(maxHazardScore.toFixed(0));
    return {
      value: finalScore,
      unit: "Risk",
      hazardLabel:
        finalScore > 75
          ? `🔴 ${dominantHazard}`
          : finalScore > 40
          ? `🟠 ${dominantHazard}`
          : `🟢 Safe / Normal (सुरक्षित)`
    };
  }

  // 3. Continuous IDW for Temperature, Wind, Pressure, Humidity, AQI
  let num = 0;
  let den = 0;
  const power = 2.4;

  for (const s of stations) {
    const dLat = s.lat - lat;
    const dLng = s.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < 0.01) {
      const v = getStationValue(s, layer);
      return { value: Number(v.toFixed(1)), unit: getLayerUnit(layer) };
    }

    const weight = 1 / (Math.pow(dist, power) + 0.05);
    const val = getStationValue(s, layer);
    num += weight * val;
    den += weight;
  }

  const result = den > 0 ? num / den : 0;
  return { value: Number(result.toFixed(1)), unit: getLayerUnit(layer) };
}

export function getStationValue(station, layer) {
  switch (layer) {
    case "priority":
      return station.hazard === "cyclone"
        ? 95
        : station.hazard === "flood"
        ? 85
        : station.hazard === "heavy_rain"
        ? 75
        : station.hazard === "heatwave"
        ? 70
        : 15;
    case "heatwave":
      return station.temp ?? 32;
    case "rain":
      return station.rain_mm ?? (station.hazard === "heavy_rain" ? 65 : station.hazard === "flood" ? 75 : 0);
    case "rain_prob":
    case "rain_probability": {
      const r = station.rain_mm ?? 0;
      if (station.hazard === "cyclone" || station.hazard === "flood") return 96;
      if (r >= 70) return 95;
      if (r >= 30) return 85;
      if (r >= 10) return 65;
      if (r > 0) return 48;
      const h = station.humidity ?? 50;
      if (h >= 85) return 40;
      if (h >= 75) return 25;
      return 5;
    }
    case "wind":
      return station.wind ?? 16;
    case "cyclone":
      return station.pressure ?? (station.hazard === "cyclone" ? 988 : 1008);
    case "humidity":
      return station.humidity ?? 65;
    case "air_quality":
      return station.aqi ?? (station.temp > 38 ? 160 : 75);
    default:
      return station.temp ?? 32;
  }
}

export function getLayerUnit(layer) {
  switch (layer) {
    case "priority":
      return "Risk";
    case "heatwave":
      return "°C";
    case "rain":
      return "mm";
    case "rain_prob":
    case "rain_probability":
      return "%";
    case "wind":
      return "km/h";
    case "cyclone":
      return "hPa";
    case "humidity":
      return "%";
    case "air_quality":
      return "AQI";
    default:
      return "°C";
  }
}

export function getRampForLayer(layer) {
  switch (layer) {
    case "priority":
      return PRIORITY_HAZARD_RAMP;
    case "heatwave":
      return TEMPERATURE_RAMP;
    case "rain":
      return RAIN_RAMP;
    case "rain_prob":
    case "rain_probability":
      return RAIN_PROB_RAMP;
    case "wind":
      return WIND_RAMP;
    case "cyclone":
      return PRESSURE_RAMP;
    case "humidity":
      return HUMIDITY_RAMP;
    case "air_quality":
      return AQI_RAMP;
    default:
      return TEMPERATURE_RAMP;
  }
}

// Convert meteorological angle to cardinal text
export function degreesToCardinal(deg) {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return cardinals[index];
}

// Physical Wind Field Simulation for Indian Subcontinent
export function calculateWindVector(lat, lng, stations) {
  // 1. Calculate Base Wind Speed using IDW
  const windProbe = calculateIDW(lat, lng, stations, "wind");
  const speed = windProbe.value || 16;

  // 2. Compute Atmospheric Wind Direction (Degrees from which wind blows)
  // Cyclone Center at Bay of Bengal (approx 19.2°N, 86.8°E) creates strong counter-clockwise vortex inflow
  const cycloneLat = 19.2;
  const cycloneLng = 86.8;
  const dLatC = cycloneLat - lat;
  const dLngC = cycloneLng - lng;
  const distToCyclone = Math.sqrt(dLatC * dLatC + dLngC * dLngC);

  let dirDeg = 240; // Default Southwest Monsoon Flow (SW ~240°)

  if (distToCyclone < 7.0) {
    // Cyclonic Inflow (Tangential + 20° inward spiraling)
    const angleToCenter = Math.atan2(dLatC, dLngC); // radians
    // Counter-clockwise tangent is angleToCenter + PI/2 - 0.35 (inward spiral)
    const windBlowToAngle = angleToCenter + Math.PI / 2 - 0.35;
    // Direction FROM which wind blows = windBlowToAngle + PI
    const windFromAngle = windBlowToAngle + Math.PI;
    let deg = (windFromAngle * 180) / Math.PI;
    dirDeg = ((deg % 360) + 360) % 360;
  } else if (lat > 27.0 && lng < 80.0) {
    // Northern Indo-Gangetic Plains & Desert: Westerly / North-Westerly (WNW ~295°)
    dirDeg = 295 + (lat - 27) * 4 - (lng - 74) * 3;
  } else if (lat > 24.0 && lng >= 88.0) {
    // Northeast (Assam/Meghalaya): Southerly / South-Easterly mountain funnel (SE ~140°)
    dirDeg = 140 + (lat - 24) * 6;
  } else if (lng < 74.0 && lat < 21.0) {
    // Arabian Sea / Konkan Coast: Strong South-Westerly (SW ~230°)
    dirDeg = 230 + (21 - lat) * 2;
  } else {
    // Southern Deccan: WSW (~250°)
    dirDeg = 250 - (lat - 12) * 3;
  }

  dirDeg = Math.round(((dirDeg % 360) + 360) % 360);
  const cardinal = degreesToCardinal(dirDeg);

  // Gust Speed (typically 1.35x to 1.6x base wind speed in convective/monsoon zones)
  const gustFactor = speed > 50 ? 1.45 : speed > 30 ? 1.38 : 1.28;
  const gust = Math.round(speed * gustFactor);

  // Beaufort Scale Rating
  let beaufort = "Moderate Breeze";
  let beaufortForce = 4;
  let isGaleAlert = false;

  if (speed >= 75) {
    beaufort = "Severe Storm / Squall (प्रचंड तूफान)";
    beaufortForce = 9;
    isGaleAlert = true;
  } else if (speed >= 55) {
    beaufort = "High Wind / Gale (तेज आंधी / गेल)";
    beaufortForce = 8;
    isGaleAlert = true;
  } else if (speed >= 40) {
    beaufort = "Strong Breeze / Squall Watch (कड़क हवा)";
    beaufortForce = 6;
    isGaleAlert = true;
  } else if (speed >= 25) {
    beaufort = "Fresh Breeze (ताजी हवा)";
    beaufortForce = 5;
  } else if (speed >= 12) {
    beaufort = "Moderate Breeze (मध्यम हवा)";
    beaufortForce = 4;
  } else {
    beaufort = "Light Air (मंद हवा)";
    beaufortForce = 2;
  }

  // Unit vector for screen animation (blowing direction)
  // Meteorological angle is FROM direction, so blowing direction is dirDeg + 180
  const blowRad = ((dirDeg + 180) * Math.PI) / 180;
  const u = Math.sin(blowRad); // East-West screen vector component
  const v = -Math.cos(blowRad); // North-South screen vector component (inverted Y in canvas)

  return {
    speed: Number(speed.toFixed(1)),
    deg: dirDeg,
    cardinal,
    gust,
    beaufort,
    beaufortForce,
    isGaleAlert,
    u,
    v
  };
}

// Complete Detailed Probe Data Calculation for Interactive Inspector Cards
export function calculateDetailedProbeData(lat, lng, stations, activeLayer, tempUnit = "C") {
  if (!stations || stations.length === 0) return null;

  // Find nearest station
  let nearestDist = 999;
  let nearestStation = stations[0];
  for (const s of stations) {
    const d = Math.hypot(s.lat - lat, s.lng - lng);
    if (d < nearestDist) {
      nearestDist = d;
      nearestStation = s;
    }
  }

  const isMatchedCity = nearestDist < 0.85;
  const cityName = isMatchedCity ? nearestStation.city : `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
  const stateName = isMatchedCity ? nearestStation.state : "India";

  // Calculate layer values
  const windVector = calculateWindVector(lat, lng, stations);
  const rainProbe = calculateIDW(lat, lng, stations, "rain");
  const rainProbProbe = calculateIDW(lat, lng, stations, "rain_prob");
  const tempProbe = calculateIDW(lat, lng, stations, "heatwave");
  const priorityProbe = calculateIDW(lat, lng, stations, "priority");
  const pressureProbe = calculateIDW(lat, lng, stations, "cyclone");
  const humidityProbe = calculateIDW(lat, lng, stations, "humidity");
  const aqiProbe = calculateIDW(lat, lng, stations, "air_quality");

  const tempC = Number(tempProbe.value.toFixed(1));
  const tempF = Number(((tempC * 9) / 5 + 32).toFixed(1));
  const humidity = Math.min(100, Math.max(10, Math.round(humidityProbe.value)));
  const rainMm = Number(rainProbe.value.toFixed(1));
  const rainProb = Math.min(100, Math.max(0, Math.round(rainProbProbe.value)));
  const pressureHpa = Math.round(pressureProbe.value);
  const aqiVal = Math.round(aqiProbe.value);
  const riskVal = Math.round(priorityProbe.value);

  // Dew Point Approximation: Td ≈ T - ((100 - RH) / 5)
  const dewPointC = Number((tempC - (100 - humidity) / 5).toFixed(1));

  // Heat Index (Feels Like) Approximation
  let feelsLikeC = tempC;
  if (tempC >= 27 && humidity >= 40) {
    feelsLikeC = Number(
      (-8.784 +
        1.611 * tempC +
        2.338 * (humidity / 10) -
        0.146 * tempC * (humidity / 10) +
        0.0123 * tempC * tempC +
        0.0164 * Math.pow(humidity / 10, 2)).toFixed(1)
    );
  }
  const feelsLikeF = Number(((feelsLikeC * 9) / 5 + 32).toFixed(1));

  // Heatwave Status
  let heatwaveStatus = "Normal Comfort (सामान्य)";
  if (tempC >= 44) {
    heatwaveStatus = "🔴 Extreme Loo / Severe Heatwave (अत्यधिक भीषण लू)";
  } else if (tempC >= 40) {
    heatwaveStatus = "🟠 Heatwave Warning (लू चेतावनी)";
  } else if (tempC >= 36) {
    heatwaveStatus = "🟡 Hot Afternoon (तेज गर्मी)";
  } else if (tempC <= 16) {
    heatwaveStatus = "🔵 Cool Alpine Air (शीतल मौसम)";
  }

  // Humidity Comfort Index
  let comfortIndex = "Comfortable (अनुकूल)";
  if (humidity >= 88) {
    comfortIndex = "Saturated / Tropical (अति आर्द्र / उमस)";
  } else if (humidity >= 72) {
    comfortIndex = "Muggy & Sticky (चिपचिपी उमस)";
  } else if (humidity <= 25) {
    comfortIndex = "Dry / Arid Desert Air (शुष्क हवा)";
  }

  // Cyclone / Pressure Category
  const distToCycloneCenter = Math.round(Math.hypot(19.2 - lat, 86.8 - lng) * 111);
  let pressureCategory = "Normal Sea Level Pressure (मानक वायुदाब)";
  if (pressureHpa <= 988 || (distToCycloneCenter < 120 && nearestStation.hazard === "cyclone")) {
    pressureCategory = "🌀 Deep Cyclonic Depression Eye (चक्रवात केंद्र)";
  } else if (pressureHpa <= 998) {
    pressureCategory = "⚠️ Tropical Low Pressure Trough (कम दबाव क्षेत्र)";
  } else if (pressureHpa >= 1014) {
    pressureCategory = "🌤️ High Pressure Ridge (उच्च वायुदाब)";
  }

  // AQI Category & Health Precaution
  let aqiCategory = "Good (अच्छा)";
  let aqiColor = "#22c55e";
  let healthAdvisory = "Air quality is satisfactory and poses little or no risk.";
  if (aqiVal > 300) {
    aqiCategory = "Severe / Hazardous (गंभीर)";
    aqiColor = "#7f1d1d";
    healthAdvisory = "Emergency alert: Health warning of emergency conditions. Avoid all outdoor physical activity.";
  } else if (aqiVal > 200) {
    aqiCategory = "Very Poor (बहुत खराब)";
    aqiColor = "#ef4444";
    healthAdvisory = "Health alert: Everyone may experience serious health effects. Wear N95 mask outdoors.";
  } else if (aqiVal > 150) {
    aqiCategory = "Poor (खराब)";
    aqiColor = "#f97316";
    healthAdvisory = "Unhealthy: Sensitive groups may experience health effects. Limit prolonged outdoor exertion.";
  } else if (aqiVal > 100) {
    aqiCategory = "Moderate (मध्यम)";
    aqiColor = "#eab308";
    healthAdvisory = "Acceptable air quality; some pollutants may be a concern for a small number of sensitive individuals.";
  } else if (aqiVal > 50) {
    aqiCategory = "Satisfactory (संतोषजनक)";
    aqiColor = "#84cc16";
    healthAdvisory = "Minor breathing discomfort to sensitive people.";
  }

  const pm25Estimate = Math.round(aqiVal * 0.48);

  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    cityName,
    stateName,
    nearestStation,
    activeLayer,
    wind: windVector,
    rainMm,
    rainProb,
    rainRateLabel: rainProbe.hazardLabel,
    tempC,
    tempF,
    feelsLikeC,
    feelsLikeF,
    heatwaveStatus,
    dewPointC,
    humidity,
    comfortIndex,
    pressureHpa,
    pressureCategory,
    distToCycloneCenter,
    aqiVal,
    aqiCategory,
    aqiColor,
    healthAdvisory,
    pm25Estimate,
    riskVal,
    hazardLabel: priorityProbe.hazardLabel
  };
}
