/**
 * Centralized Alert & Advisory Service (WeatherGPT / Mausam Mitra)
 * Provides unified alert schema, IMD / INCOIS threshold calculations,
 * bilingual formatting (Hindi & English), severity categorization,
 * and marine/agriculture warning synchronization.
 */

export const ALERT_SEVERITY = {
  CRITICAL: "Critical",
  SEVERE: "Severe",
  MODERATE: "Moderate",
  NORMAL: "Normal"
};

export const HAZARD_TYPES = {
  CYCLONE: "cyclone",
  HEAVY_RAIN: "heavy_rain",
  HEATWAVE: "heatwave",
  COLDWAVE: "coldwave",
  THUNDERSTORM: "thunderstorm",
  POOR_AIR_QUALITY: "poor_air_quality",
  HIGH_WAVE: "high_wave",
  FOG: "fog",
  NORMAL: "normal"
};

/**
 * Standardizes any alert into a uniform structure
 */
export function formatCentralizedAlert(rawAlert, language = "en") {
  if (!rawAlert) return null;
  const isHi = language === "hi";

  const severity = rawAlert.severity || ALERT_SEVERITY.MODERATE;
  const hazardType = rawAlert.hazardType || rawAlert.type || HAZARD_TYPES.NORMAL;

  let severityBadgeClass = "bg-amber-100 text-amber-800 border-amber-300";
  let borderAccentClass = "border-l-amber-500";
  let bgClass = "bg-amber-50/70";

  if (severity === ALERT_SEVERITY.CRITICAL || severity === "HIGH" || severity === "RED") {
    severityBadgeClass = "bg-rose-100 text-rose-800 border-rose-300";
    borderAccentClass = "border-l-rose-500";
    bgClass = "bg-rose-50/70";
  } else if (severity === ALERT_SEVERITY.SEVERE) {
    severityBadgeClass = "bg-orange-100 text-orange-800 border-orange-300";
    borderAccentClass = "border-l-orange-500";
    bgClass = "bg-orange-50/70";
  } else if (severity === ALERT_SEVERITY.NORMAL || severity === "GREEN" || severity === "SAFE") {
    severityBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    borderAccentClass = "border-l-emerald-500";
    bgClass = "bg-emerald-50/70";
  }

  const title = isHi && rawAlert.title_hi ? rawAlert.title_hi : rawAlert.title || (isHi ? "मौसम चेतावनी" : "Weather Advisory");
  const description = isHi && rawAlert.description_hi ? rawAlert.description_hi : rawAlert.description || "";
  const safetyAction = isHi && rawAlert.safety_action_hi ? rawAlert.safety_action_hi : rawAlert.safetyAction || rawAlert.action || "";
  const locationName = rawAlert.location || rawAlert.affectedArea || "Region";
  const issuedBy = rawAlert.issuedBy || (isHi ? "भारत सरकार • IMD / INCOIS" : "Govt of India • IMD / INCOIS");

  return {
    id: rawAlert.id || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title,
    description,
    safetyAction,
    severity,
    hazardType,
    location: locationName,
    state: rawAlert.state || "",
    time: rawAlert.time || (isHi ? "तात्कालिक बुलेटिन" : "Active Bulletin"),
    issuedBy,
    severityBadgeClass,
    borderAccentClass,
    bgClass,
    color: rawAlert.color || (severity === "Critical" ? "#ef4444" : severity === "Severe" ? "#f97316" : "#eab308"),
    raw: rawAlert
  };
}

/**
 * Extracts centralized alerts from the global weather object or generates standardized local ones
 */
export function getCentralizedAlerts(weather, location, language = "en") {
  const alerts = [];
  const isHi = language === "hi";

  // 1. Direct server-provided centralized alerts array
  if (weather?.alerts && Array.isArray(weather.alerts) && weather.alerts.length > 0) {
    weather.alerts.forEach((alt) => {
      const formatted = formatCentralizedAlert(alt, language);
      if (formatted) alerts.push(formatted);
    });
    return alerts;
  }

  // 2. Weather hazard evaluation fallback (if server didn't embed alerts array)
  if (weather) {
    const temp = weather.temp ?? 30;
    const rainfall = weather.rainfall_mm ?? 0;
    const windSpeed = weather.wind_speed ?? 15;
    const aqi = weather.aqi ?? 90;
    const condition = (weather.condition || "").toLowerCase();
    const city = location?.city || weather.city || "Your Location";

    // Cyclone / Gale Wind Alert
    if (windSpeed >= 40 || /storm|cyclone|gale|squall/i.test(condition)) {
      alerts.push(
        formatCentralizedAlert(
          {
            id: `alt-storm-${city}`,
            title: isHi ? `तटीय तूफान व तेज हवा चेतावनी (${windSpeed} km/h)` : `Coastal Squall & High Wind Warning (${windSpeed} km/h)`,
            title_hi: `तटीय तूफान व तेज हवा चेतावनी (${windSpeed} km/h)`,
            severity: windSpeed >= 55 ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.SEVERE,
            hazardType: HAZARD_TYPES.CYCLONE,
            location: city,
            description: isHi
              ? `${city} क्षेत्र में ${windSpeed} किमी/घंटे की तीव्र हवाएं और गरज के साथ बौछारें सक्रिय हैं।`
              : `Active squally winds reaching ${windSpeed} km/h with convective storm cells observed over ${city}.`,
            description_hi: `${city} क्षेत्र में ${windSpeed} किमी/घंटे की तीव्र हवाएं और गरज के साथ बौछारें सक्रिय हैं।`,
            safetyAction: isHi
              ? "मछुआरे समुद्र में न जाएं। टीन शेड व कमजोर ढांचों से दूर रहें।"
              : "Fishermen advised not to venture into deep sea. Secure rooftop items.",
            safety_action_hi: "मछुआरे समुद्र में न जाएं। टीन शेड व कमजोर ढांचों से दूर रहें।",
            time: isHi ? "अगले 24 घंटे" : "Next 24 Hours",
            issuedBy: isHi ? "भारत सरकार • IMD / INCOIS" : "Govt of India • IMD / INCOIS"
          },
          language
        )
      );
    }

    // Heavy Rainfall Alert
    if (rainfall >= 15 || /heavy rain|torrential/i.test(condition)) {
      alerts.push(
        formatCentralizedAlert(
          {
            id: `alt-rain-${city}`,
            title: isHi ? `भारी वर्षा व जलभराव चेतावनी (${rainfall} mm)` : `Heavy Precipitation & Waterlogging Warning (${rainfall} mm)`,
            title_hi: `भारी वर्षा व जलभराव चेतावनी (${rainfall} mm)`,
            severity: rainfall >= 40 ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.SEVERE,
            hazardType: HAZARD_TYPES.HEAVY_RAIN,
            location: city,
            description: isHi
              ? `${city} एवं आसपास के क्षेत्रों में भारी वर्षा व निचले इलाकों में जलभराव की आशंका।`
              : `Heavy rainfall observed (${rainfall} mm). Potential waterlogging in low-lying roads and agricultural tracts.`,
            description_hi: `${city} एवं आसपास के क्षेत्रों में भारी वर्षा व निचले इलाकों में जलभराव की आशंका।`,
            safetyAction: isHi
              ? "जलमग्न सड़कों पर वाहन न चलाएं। खेतों से अतिरिक्त पानी निकासी करें।"
              : "Avoid crossing submerged bridges. Clear agricultural drainage canals.",
            safety_action_hi: "जलमग्न सड़कों पर वाहन न चलाएं। खेतों से अतिरिक्त पानी निकासी करें।",
            time: isHi ? "तात्कालिक रडार अलर्ट" : "Live Radar Alert",
            issuedBy: isHi ? "भारत सरकार • मौसम विज्ञान विभाग (IMD)" : "Govt of India • IMD Doppler Radar"
          },
          language
        )
      );
    }

    // Extreme Heatwave Alert
    if (temp >= 40) {
      alerts.push(
        formatCentralizedAlert(
          {
            id: `alt-heat-${city}`,
            title: isHi ? `भीषण लू (हीटवेव) चेतावनी (${temp}°C)` : `Severe Heatwave Advisory (${temp}°C)`,
            title_hi: `भीषण लू (हीटवेव) चेतावनी (${temp}°C)`,
            severity: temp >= 44 ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.SEVERE,
            hazardType: HAZARD_TYPES.HEATWAVE,
            location: city,
            description: isHi
              ? `तापमान ${temp}°C तक पहुंच गया है। तीव्र धूप एवं गर्म पछुआ हवाएं जारी हैं।`
              : `Ambient temperature reached ${temp}°C with high UV index and hot surface winds.`,
            description_hi: `तापमान ${temp}°C तक पहुंच गया है। तीव्र धूप एवं गर्म पछुआ हवाएं जारी हैं।`,
            safetyAction: isHi
              ? "दोपहर 11:30 से 4:30 बजे तक धूप में सीधे निकलने से बचें। ORS/पानी का सेवन करें।"
              : "Limit outdoor exposure between 11:30 AM and 4:30 PM. Maintain adequate hydration.",
            safety_action_hi: "दोपहर 11:30 से 4:30 बजे तक धूप में सीधे निकलने से बचें। ORS/पानी का सेवन करें।",
            time: isHi ? "आज दोपहर" : "Today Peak Hours",
            issuedBy: isHi ? "भारत सरकार • IMD नेशनल वेदर फोरकास्ट" : "Govt of India • IMD Heat Bulletin"
          },
          language
        )
      );
    }

    // Hazardous AQI Alert
    if (aqi >= 200) {
      alerts.push(
        formatCentralizedAlert(
          {
            id: `alt-aqi-${city}`,
            title: isHi ? `खराब वायु गुणवत्ता चेतावनी (AQI ${aqi})` : `Hazardous Air Quality Warning (AQI ${aqi})`,
            title_hi: `खराब वायु गुणवत्ता चेतावनी (AQI ${aqi})`,
            severity: aqi >= 300 ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.SEVERE,
            hazardType: HAZARD_TYPES.POOR_AIR_QUALITY,
            location: city,
            description: isHi
              ? `वायु गुणवत्ता सूचकांक (AQI) ${aqi} पर है। PM2.5 कणों की अधिकता से सांस संबंधी परेशानी हो सकती है।`
              : `Air Quality Index measured at ${aqi}. Elevated PM2.5 particulate concentrations active in the atmosphere.`,
            description_hi: `वायु गुणवत्ता सूचकांक (AQI) ${aqi} पर है। PM2.5 कणों की अधिकता से सांस संबंधी परेशानी हो सकती है।`,
            safetyAction: isHi
              ? "अस्थमा व हृदय रोगी बाहर कठिन व्यायाम से बचें और N95 मास्क का उपयोग करें।"
              : "Vulnerable individuals and elderly should wear N95 masks and restrict outdoor morning runs.",
            safety_action_hi: "अस्थमा व हृदय रोगी बाहर कठिन व्यायाम से बचें और N95 मास्क का उपयोग करें।",
            time: isHi ? "निरंतर सेंसर निगरानी" : "Continuous Sensor Scan",
            issuedBy: isHi ? "केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB)" : "Central Pollution Control Board (CPCB)"
          },
          language
        )
      );
    }
  }

  return alerts;
}

/**
 * Returns unified marine venture assessment for fishing & coastal activities
 */
export function getCentralizedMarineDecision(weather, conditionsData, language = "en") {
  const isHi = language === "hi";

  if (weather?.marine_safety?.status) {
    const ms = weather.marine_safety;
    return {
      status: ms.status, // "red" | "yellow" | "green"
      statusLabel: isHi && ms.statusLabel_hi ? ms.statusLabel_hi : ms.statusLabel || (ms.status === "red" ? (isHi ? "समुद्र में न जाएं (असुरक्षित)" : "Avoid going to sea") : isHi ? "समुद्र में जाने के लिए सुरक्षित" : "Safe to Go"),
      reasoning: isHi && ms.reasoning_hi ? ms.reasoning_hi : ms.reasoning || "",
      waveHeight: ms.waveHeight ?? 1.2,
      wavePeriod: ms.wavePeriod ?? 6,
      swellHeight: ms.swellHeight ?? 0.8,
      windSpeed: ms.windSpeed ?? 18,
      gustSpeed: ms.gustSpeed ?? 24,
      cycloneAlert: ms.cycloneAlert ? {
        title: isHi && ms.cycloneAlert.title_hi ? ms.cycloneAlert.title_hi : ms.cycloneAlert.title,
        severity: ms.cycloneAlert.severity,
        action: isHi && ms.cycloneAlert.action_hi ? ms.cycloneAlert.action_hi : ms.cycloneAlert.action,
        details: ms.cycloneAlert.details
      } : null,
      safeReturnTime: isHi && ms.safeReturnTime_hi ? ms.safeReturnTime_hi : ms.safeReturnTime || (isHi ? "शाम 4 बजे से पूर्व लौटें" : "Return before 4 PM")
    };
  }

  if (conditionsData?.status) {
    return {
      status: conditionsData.status, // "red" | "yellow" | "green"
      statusLabel: conditionsData.statusLabel || (conditionsData.status === "red" ? (isHi ? "समुद्र में न जाएं (असुरक्षित)" : "Avoid going to sea") : isHi ? "समुद्र में जाने के लिए सुरक्षित" : "Safe to Go"),
      reasoning: conditionsData.reasoning || "",
      waveHeight: conditionsData.waveHeight ?? 1.2,
      windSpeed: conditionsData.windSpeed ?? 18,
      cycloneAlert: conditionsData.cycloneAlert || null,
      safeReturnTime: conditionsData.safeReturnTime || (isHi ? "शाम 4 बजे से पूर्व लौटें" : "Return before 4 PM")
    };
  }

  // Derived from weather object
  const windSpeed = weather?.wind_speed ?? 15;
  const rainfall = weather?.rainfall_mm ?? 0;
  const isRough = windSpeed >= 38 || rainfall >= 25;
  const isModerate = windSpeed >= 22 || rainfall >= 10;

  if (isRough) {
    return {
      status: "red",
      statusLabel: isHi ? "समुद्र में न जाएं (असुरक्षित)" : "Avoid going to sea today",
      reasoning: isHi ? `तेज हवा (${windSpeed} km/h) और ऊंची समुद्री लहरों के कारण समुद्र में जाना जोखिम भरा है।` : `High wind gusts (${windSpeed} km/h) and rough swell detected. Dangerous sea state.`,
      waveHeight: 3.5,
      windSpeed,
      cycloneAlert: {
        title: isHi ? "INCOIS / IMD समुद्री चेतावनी" : "INCOIS / IMD Marine Gale Alert",
        severity: "HIGH",
        action: isHi ? "नावें न ले जाएं। तट पर सुरक्षित स्थान पर रहें।" : "Do not venture into open sea. Secure all boats."
      },
      safeReturnTime: isHi ? "तुरंत निकटतम बंदरगाह पर लौटें" : "Return to nearest harbour immediately"
    };
  }

  if (isModerate) {
    return {
      status: "yellow",
      statusLabel: isHi ? "केवल तट के निकट जाएं (दोपहर तक)" : "Safe to go near shore until 4 PM",
      reasoning: isHi ? `मध्यम हवाएं और लहरें। खुले समुद्र में जाने से बचें और शाम से पहले लौटें।` : `Moderate swell and breeze. Stay within territorial waters near shore.`,
      waveHeight: 1.8,
      windSpeed,
      cycloneAlert: {
        title: isHi ? "IMD स्क्वॉल चेतावनी" : "IMD Moderate Squall Watch",
        severity: "MODERATE",
        action: isHi ? "शाम 4 बजे से पहले लौटें।" : "Fish near shore. Return before 4 PM."
      },
      safeReturnTime: isHi ? "शाम 4:00 बजे से पूर्व वापसी" : "Return before 4:00 PM"
    };
  }

  return {
    status: "green",
    statusLabel: isHi ? "समुद्र में जाने के लिए सुरक्षित" : "Safe to Go",
    reasoning: isHi ? `मौसम शांत और अनुकूल है। सामान्य रूप से समुद्री गतिविधियां कर सकते हैं।` : `Conditions are calm and stable. Favorable for fishing operations.`,
    waveHeight: 0.9,
    windSpeed,
    cycloneAlert: null,
    safeReturnTime: isHi ? "सामान्य वापसी समय" : "Safe for normal operating window"
  };
}

/**
 * Returns unified farmer & agromet decision (ICAR / IMD Agromet)
 */
export function getCentralizedFarmerDecision(weather, language = "en") {
  const isHi = language === "hi";

  if (weather?.farmer_advisory?.status) {
    const fa = weather.farmer_advisory;
    return {
      status: fa.status,
      statusLabel: isHi && fa.statusLabel_hi ? fa.statusLabel_hi : fa.statusLabel,
      irrigationDecision: fa.irrigationDecision,
      irrigationText: isHi && fa.irrigationText_hi ? fa.irrigationText_hi : fa.irrigationText,
      sprayingDecision: fa.sprayingDecision,
      sprayingText: isHi && fa.sprayingText_hi ? fa.sprayingText_hi : fa.sprayingText,
      cropAction: isHi && fa.cropAction_hi ? fa.cropAction_hi : fa.cropAction,
      pestFungalRisk: fa.pestFungalRisk || "low",
      frostWarning: !!fa.frostWarning,
      heatStressWarning: !!fa.heatStressWarning
    };
  }

  const temp = weather?.temp ?? 30;
  const rainfall = weather?.rainfall_mm ?? 0;
  const windSpeed = weather?.wind_speed ?? 12;

  if (rainfall >= 10) {
    return {
      status: "red",
      statusLabel: isHi ? "सिंचाई रोकें व जल निकासी करें" : "Alert: Postpone Irrigation",
      irrigationDecision: "postpone",
      irrigationText: isHi ? `${rainfall} मिमी वर्षा दर्ज। अतिरिक्त पानी के निकास का प्रबंध करें।` : `Rainfall of ${rainfall} mm observed. Postpone irrigation.`,
      sprayingDecision: "avoid_rain_heat",
      sprayingText: isHi ? "बारिश में कीटनाशक छिड़काव न करें।" : "Avoid spraying during rainfall.",
      cropAction: isHi ? "खेतों में जल निकासी नाली बनाएं।" : "Open field drainage canals.",
      pestFungalRisk: "high",
      frostWarning: false,
      heatStressWarning: false
    };
  }

  if (windSpeed >= 25) {
    return {
      status: "yellow",
      statusLabel: isHi ? "सावधानी: तेज हवा - स्प्रे न करें" : "Caution: High Winds",
      irrigationDecision: "irrigate_now",
      irrigationText: isHi ? "सिंचाई सामान्य रूप से कर सकते हैं।" : "Proceed with standard irrigation.",
      sprayingDecision: "caution_winds",
      sprayingText: isHi ? `तेज हवा (${windSpeed} km/h) के कारण कीटनाशक छिड़काव टालें।` : `Wind speed ${windSpeed} km/h causes drift. Defer spraying.`,
      cropAction: isHi ? "लंबी फसलों को गिरने से बचाएं।" : "Support tall crops against lodging.",
      pestFungalRisk: "low",
      frostWarning: false,
      heatStressWarning: false
    };
  }

  return {
    status: "green",
    statusLabel: isHi ? "कृषि व स्प्रे के लिए अनुकूल" : "Favorable for Farm Operations",
    irrigationDecision: "irrigate_now",
    irrigationText: isHi ? "मिट्टी में तापमान व नमी अनुकूल है। नियोजित सिंचाई करें।" : "Optimal soil moisture. Proceed with scheduled irrigation.",
    sprayingDecision: "favorable",
    sprayingText: isHi ? "साफ मौसम व शांत हवा। स्प्रे के लिए सर्वोत्तम समय।" : "Clear skies and calm winds. Optimal spray window.",
    cropAction: isHi ? "सामान्य फसल देखरेख व पोषण करें।" : "Standard crop maintenance and nutrition.",
    pestFungalRisk: "low",
    frostWarning: temp <= 5,
    heatStressWarning: temp >= 40
  };
}

/**
 * Returns unified citizen & urban health decision
 */
export function getCentralizedCitizenDecision(weather, language = "en") {
  const isHi = language === "hi";

  if (weather?.citizen_advisory?.status) {
    const ca = weather.citizen_advisory;
    return {
      status: ca.status,
      statusLabel: isHi && ca.statusLabel_hi ? ca.statusLabel_hi : ca.statusLabel,
      outdoorFitness: ca.outdoorFitness,
      outdoorFitnessReason: isHi && ca.outdoorFitnessReason_hi ? ca.outdoorFitnessReason_hi : ca.outdoorFitnessReason,
      commuteComfort: ca.commuteComfort,
      umbrellaNeeded: !!ca.umbrellaNeeded,
      airMaskNeeded: !!ca.airMaskNeeded,
      heatShieldNeeded: !!ca.heatShieldNeeded,
      summary: isHi && ca.summary_hi ? ca.summary_hi : ca.summary
    };
  }

  const temp = weather?.temp ?? 30;
  const rainfall = weather?.rainfall_mm ?? 0;
  const aqi = weather?.aqi ?? 90;

  if (temp >= 40) {
    return {
      status: "danger",
      statusLabel: isHi ? "भीषण लू — धूप से बचें" : "Extreme Heatwave",
      outdoorFitness: "avoid",
      outdoorFitnessReason: isHi ? "तीव्र धूप व लू। दोपहर में बाहर न जाएं।" : "Dangerous heat index. Avoid outdoor cardio.",
      commuteComfort: "caution",
      umbrellaNeeded: false,
      airMaskNeeded: false,
      heatShieldNeeded: true,
      summary: isHi ? `तापमान ${temp}°C है। खूब पानी पिएं।` : `Temperature is ${temp}°C. Stay hydrated.`
    };
  }

  if (aqi >= 200) {
    return {
      status: "caution",
      statusLabel: isHi ? `खराब वायु गुणवत्ता (AQI ${aqi})` : `Unhealthy Air (AQI ${aqi})`,
      outdoorFitness: "caution",
      outdoorFitnessReason: isHi ? "प्रदूषण के कारण इनडोर वर्कआउट करें।" : "Elevated PM2.5. Switch to indoor workout.",
      commuteComfort: "smooth",
      umbrellaNeeded: false,
      airMaskNeeded: true,
      heatShieldNeeded: false,
      summary: isHi ? "बाहर N95 मास्क पहनें।" : "Wear N95 mask outdoors."
    };
  }

  return {
    status: "safe",
    statusLabel: isHi ? "सुरक्षित व सुहावना मौसम" : "Safe & Pleasant Weather",
    outdoorFitness: "favorable",
    outdoorFitnessReason: isHi ? "सुबह की सैर व व्यायाम के लिए अनुकूल।" : "Favorable conditions for morning runs and fitness.",
    commuteComfort: "smooth",
    umbrellaNeeded: rainfall >= 3,
    airMaskNeeded: false,
    heatShieldNeeded: false,
    summary: isHi ? "दैनिक कार्यों के लिए उत्तम मौसम।" : "Pleasant weather across the city."
  };
}

/**
 * Returns unified Nigrani (Disaster Surveillance) status
 */
export function getCentralizedNigraniDecision(weather, language = "en") {
  const isHi = language === "hi";

  if (weather?.nigrani_status?.overallAlertLevel) {
    const ns = weather.nigrani_status;
    return {
      alertLevel: ns.overallAlertLevel,
      alertRank: ns.alertRank,
      hazardType: ns.activeHazardType,
      hazardSummary: ns.hazardSummary,
      ndmaProtocol: isHi && ns.ndmaProtocol_hi ? ns.ndmaProtocol_hi : ns.ndmaProtocol,
      evacuationTrigger: !!ns.evacuationTrigger,
      affectedRadiusSummary: ns.affectedRadiusSummary
    };
  }

  const wind = weather?.wind_speed ?? 12;
  const rain = weather?.rainfall_mm ?? 0;
  const temp = weather?.temp ?? 30;

  if (wind >= 40 || rain >= 35) {
    return {
      alertLevel: "red",
      alertRank: 3,
      hazardType: wind >= 40 ? "cyclone" : "heavy_rain",
      hazardSummary: "Severe storm and flood risk",
      ndmaProtocol: isHi ? "रेड अलर्ट: आपदा प्रबंधन प्रोटोकॉल सक्रिय।" : "Red Alert: Activate emergency disaster response.",
      evacuationTrigger: true,
      affectedRadiusSummary: "Critical sector radius 25 km"
    };
  }

  if (rain >= 15 || temp >= 40 || wind >= 25) {
    return {
      alertLevel: "warning",
      alertRank: 2,
      hazardType: rain >= 15 ? "heavy_rain" : temp >= 40 ? "heatwave" : "cyclone",
      hazardSummary: "Elevated meteorological alert",
      ndmaProtocol: isHi ? "ऑरेंज चेतावनी: स्थानीय प्रशासन अलर्ट।" : "Orange Warning: Notify local emergency authorities.",
      evacuationTrigger: false,
      affectedRadiusSummary: "Active alert radius 12 km"
    };
  }

  return {
    alertLevel: "none",
    alertRank: 0,
    hazardType: "normal",
    hazardSummary: "Normal meteorological state",
    ndmaProtocol: isHi ? "24x7 निरंतर रडार निगरानी सक्रिय।" : "Standard 24x7 automated radar surveillance.",
    evacuationTrigger: false,
    affectedRadiusSummary: "Normal operating zone"
  };
}

/**
 * Returns all mode decisions together for strict cross-mode synchronization
 */
export function getUnifiedCrossModeTruth(weather, location, language = "en") {
  return {
    alerts: getCentralizedAlerts(weather, location, language),
    marine: getCentralizedMarineDecision(weather, null, language),
    farmer: getCentralizedFarmerDecision(weather, language),
    citizen: getCentralizedCitizenDecision(weather, language),
    nigrani: getCentralizedNigraniDecision(weather, language)
  };
}
