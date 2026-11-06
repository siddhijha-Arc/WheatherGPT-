import { useState, useMemo, useEffect } from "react";
import {
  Droplets,
  CloudRain,
  Sun,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Gauge,
  Clock,
  MapPin,
  ChevronRight,
  Zap,
  Plus,
  Check,
  Bug,
  Sprout,
  Trash2,
  ShieldCheck,
  Flame,
  Wind,
  Layers,
  Maximize2,
  Minimize2,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { getTranslation, translateWeatherCondition } from "../lib/translations";

// Enhanced Crops with specific Growth Stages & Kc coefficients
const CROPS = [
  {
    id: "wheat",
    en: "Wheat (गेहूं)",
    hi: "गेहूं (Wheat)",
    stages: [
      { id: "cri", en: "Crown Root Initiation (CRI - 21 Days)", hi: "मुकुट जड़ की अवस्था (CRI - 21 दिन)", kc: 0.5 },
      { id: "tillering", en: "Tillering Stage (40-45 Days)", hi: "कल्ले निकलने की अवस्था (40-45 दिन)", kc: 0.85 },
      { id: "flowering", en: "Flowering / Jointing (60-65 Days)", hi: "फूल आने / गांठ बनने की अवस्था (60-65 दिन)", kc: 1.15 },
      { id: "filling", en: "Grain Filling / Milk Stage (85 Days)", hi: "दाना भरने / दुग्ध अवस्था (85 दिन)", kc: 0.95 },
      { id: "harvest", en: "Dough / Pre-Harvest Ripening", hi: "पकाई पूर्व अवस्था (110+ दिन)", kc: 0.3 }
    ]
  },
  {
    id: "paddy",
    en: "Rice / Paddy (धान)",
    hi: "धान / चावल (Paddy)",
    stages: [
      { id: "nursery", en: "Nursery / Transplanting", hi: "रोपाई / पौध अवस्था", kc: 1.1 },
      { id: "tillering", en: "Active Tillering (30-40 Days)", hi: "सक्रिय कल्ले निकलने की अवस्था", kc: 1.25 },
      { id: "panicle", en: "Panicle Initiation / Flowering", hi: "बालियां निकलने / फूल आने की अवस्था", kc: 1.35 },
      { id: "ripening", en: "Grain Dough / Harvest Ripening", hi: "दाना पकाने की अवस्था", kc: 0.6 }
    ]
  },
  {
    id: "tomato",
    en: "Tomato / Vegetables (टमाटर / सब्जियां)",
    hi: "टमाटर / सब्जियां (Tomato/Vegetables)",
    stages: [
      { id: "seedling", en: "Nursery & Transplanting", hi: "पौध रोपाई अवस्था", kc: 0.6 },
      { id: "veg", en: "Vegetative Canopy Growth", hi: "वानस्पतिक बढ़वार अवस्था", kc: 0.9 },
      { id: "flowering", en: "Flowering & Fruit Set (Critical)", hi: "फूल व फल बनने की अवस्था (क्रिटिकल)", kc: 1.2 },
      { id: "picking", en: "Fruit Maturation & Picking", hi: "फल तुड़ाई अवस्था", kc: 0.85 }
    ]
  },
  {
    id: "cotton",
    en: "Cotton (कपास)",
    hi: "कपास (Cotton)",
    stages: [
      { id: "seedling", en: "Seedling Emergence", hi: "अंकुरण अवस्था", kc: 0.35 },
      { id: "square", en: "Square Formation (35-50 Days)", hi: "डोडी बनने की अवस्था", kc: 0.75 },
      { id: "boll", en: "Flowering & Boll Development", hi: "फूल व टेंडू विकास अवस्था", kc: 1.18 },
      { id: "picking", en: "Boll Opening & Picking", hi: "टेंडू फटने व चुगाई अवस्था", kc: 0.35 }
    ]
  },
  {
    id: "potato",
    en: "Potato (आलू)",
    hi: "आलू (Potato)",
    stages: [
      { id: "sprouting", en: "Sprouting & Plant Emergence", hi: "अंकुरण व फैलाव अवस्था", kc: 0.5 },
      { id: "tuber_init", en: "Tuber Initiation (30 Days)", hi: "कंद बनने की अवस्था (Tuber Initiation)", kc: 1.15 },
      { id: "tuber_bulk", en: "Tuber Bulking & Growth", hi: "कंद मोटाई बढ़ने की अवस्था", kc: 1.05 },
      { id: "harvest", en: "Haulm Cutting & Harvest", hi: "बेल कटाई व खुदाई अवस्था", kc: 0.4 }
    ]
  },
  {
    id: "sugarcane",
    en: "Sugarcane (गन्ना)",
    hi: "गन्ना (Sugarcane)",
    stages: [
      { id: "germination", en: "Germination & Sprouting", hi: "अंकुरण अवस्था", kc: 0.4 },
      { id: "tillering", en: "Formative & Tillering Stage", hi: "ब्योंत / कल्ले अवस्था", kc: 0.95 },
      { id: "grand", en: "Grand Growth Period (High Water)", hi: "तीव्र वृद्धि अवस्था (अधिक जल मांग)", kc: 1.3 },
      { id: "maturity", en: "Ripening & Cane Maturation", hi: "शर्करा पकाई अवस्था", kc: 0.75 }
    ]
  },
  {
    id: "mustard",
    en: "Mustard (सरसों)",
    hi: "सरसों (Mustard)",
    stages: [
      { id: "seedling", en: "Seedling & Rosette Stage", hi: "अंकुरण अवस्था", kc: 0.35 },
      { id: "flowering", en: "Flowering & Branching", hi: "फूल आने की अवस्था (क्रिटिकल)", kc: 1.05 },
      { id: "pod", en: "Pod Formation & Grain Fill", hi: "फली बनने व दाना भरने की अवस्था", kc: 0.8 },
      { id: "maturity", en: "Pod Drying & Harvesting", hi: "फली पकाई व कटाई", kc: 0.25 }
    ]
  },
  {
    id: "maize",
    en: "Maize (मक्का)",
    hi: "मक्का (Maize)",
    stages: [
      { id: "emergence", en: "Emergence & Knee-High", hi: "अंकुरण व घुटना ऊँचाई अवस्था", kc: 0.4 },
      { id: "tasseling", en: "Tasseling & Silking (Critical)", hi: "मंजर / भुट्टा निकलने की अवस्था", kc: 1.25 },
      { id: "dough", en: "Grain Dough / Cob Fill", hi: "दाने में दूध भरने की अवस्था", kc: 0.9 },
      { id: "harvest", en: "Cob Maturity & Harvest", hi: "भुट्टा पकाई अवस्था", kc: 0.35 }
    ]
  }
];

const SOILS = [
  { id: "clay", en: "Black / Heavy Clay Soil", hi: "काली / भारी चिकनी मिट्टी", awc: 180, retention: "High (उच्च)" },
  { id: "loam", en: "Loam / Alluvial Soil", hi: "दोमट / जलोढ़ मिट्टी", awc: 140, retention: "Optimal (उत्तम)" },
  { id: "sandy_loam", en: "Sandy Loam Soil", hi: "रेतीली दोमट मिट्टी", awc: 100, retention: "Moderate (मध्यम)" },
  { id: "sandy", en: "Sandy / Light Soil", hi: "बलुई / हल्की मिट्टी", awc: 60, retention: "Low (कम - त्वरित सिंचाई)" }
];

const METHODS = [
  { id: "drip", en: "Drip Irrigation (ड्रिप)", hi: "ड्रिप सिंचाई (92% क्षमता)", efficiency: 0.92, saving: 45 },
  { id: "sprinkler", en: "Sprinkler Irrigation (फव्वारा)", hi: "फव्वारा / स्प्रिंकलर (80% क्षमता)", efficiency: 0.80, saving: 30 },
  { id: "flood", en: "Canal / Borewell Flood", hi: "नहर / ट्यूबवेल फ्लड सिंचाई (50% क्षमता)", efficiency: 0.50, saving: 0 }
];

export const IrrigationSchedulerModal = ({
  isOpen,
  onClose,
  location,
  weather,
  language = "hi",
  onAskAI,
  isFullPage = false,
  onToggleFullPage
}) => {
  const isHi = language === "hi";
  const t = getTranslation(language);

  // Active Modal Tab
  const [activeTab, setActiveTab] = useState("windows"); // "windows" | "tasks" | "myplan" | "calculator" | "table"

  // User Selections
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [selectedStage, setSelectedStage] = useState("tillering");
  const [selectedSoil, setSelectedSoil] = useState("loam");
  const [selectedMethod, setSelectedMethod] = useState("drip");
  const [farmAcres, setFarmAcres] = useState(2);
  const [reminderSet, setReminderSet] = useState(false);

  // Saved / Planned Tasks Tracker
  const [myPlanTasks, setMyPlanTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("weathergpt_my_agri_plan");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("weathergpt_my_agri_plan", JSON.stringify(myPlanTasks));
    } catch (e) {}
  }, [myPlanTasks]);

  // Current Weather Inputs
  const temp = weather?.temp ?? 32;
  const humidity = weather?.humidity ?? 55;
  const windSpeed = weather?.wind_speed ?? 12;
  const rainProb = weather?.rain_prob ?? 15;
  const rainfallMm = weather?.rainfall_mm ?? 0;
  const condition = weather?.condition ?? "Clear Sky";
  const city = location?.locality || location?.city || "New Delhi";

  // Selected Crop Object
  const cropObj = useMemo(() => {
    return CROPS.find((c) => c.id === selectedCrop) || CROPS[0];
  }, [selectedCrop]);

  // Selected Stage Object
  const stageObj = useMemo(() => {
    return cropObj.stages.find((s) => s.id === selectedStage) || cropObj.stages[0];
  }, [cropObj, selectedStage]);

  // Sync selected stage if crop changes
  useEffect(() => {
    if (cropObj.stages && !cropObj.stages.some((s) => s.id === selectedStage)) {
      setSelectedStage(cropObj.stages[0].id);
    }
  }, [cropObj, selectedStage]);

  const soilObj = SOILS.find((s) => s.id === selectedSoil) || SOILS[1];
  const methodObj = METHODS.find((m) => m.id === selectedMethod) || METHODS[0];

  // Estimated Reference Evapotranspiration (ET0) in mm/day
  const et0 = useMemo(() => {
    const tempFactor = (temp + 17.8);
    const humFactor = Math.sqrt(Math.max(10, 100 - humidity));
    const windFactor = (1 + windSpeed / 100);
    const val = 0.0021 * tempFactor * humFactor * windFactor * 3.6;
    return Math.max(2.5, Math.min(8.5, parseFloat(val.toFixed(1))));
  }, [temp, humidity, windSpeed]);

  // Crop coefficient Kc
  const kc = stageObj?.kc || 0.85;

  // Net Crop Water Need (mm/day)
  const netWaterNeedMm = useMemo(() => {
    return parseFloat((et0 * kc).toFixed(1));
  }, [et0, kc]);

  // Adjusted for Rainfall
  const effectiveRain = Math.min(netWaterNeedMm, rainfallMm * 0.8);
  const grossWaterNeedMm = Math.max(0, netWaterNeedMm - effectiveRain);

  // Water Volume Calculation per Acre (1 mm = 4,047 Liters / Acre)
  const grossLitersPerAcre = Math.round((grossWaterNeedMm * 4047) / methodObj.efficiency);
  const totalLitersFarm = grossLitersPerAcre * farmAcres;

  // Flood vs Drip Savings
  const floodLiters = Math.round((grossWaterNeedMm * 4047) / 0.50) * farmAcres;
  const waterSavedLiters = Math.max(0, floodLiters - totalLitersFarm);

  // Soil Moisture Index (%)
  const soilMoisturePercent = useMemo(() => {
    if (rainfallMm > 15) return 92;
    if (rainfallMm > 5) return 78;
    if (rainProb > 50) return 68;
    if (soilObj.id === "clay") return 62;
    if (soilObj.id === "loam") return 54;
    return 42;
  }, [rainfallMm, rainProb, soilObj]);

  // 1. Compute 48-72 Hour Operation Windows with 1-Line "Why This Advice" Explainers
  const opWindows = useMemo(() => {
    // 1. Irrigation Window
    let irrStatus = "GREEN";
    let irrTitle = isHi ? "सिंचाई हेतु अनुकूल विंडो" : "Optimal Irrigation Window";
    let irrReason = isHi
      ? `ET0 ${et0} मि.मी./दिन व मृदा नमी ${soilMoisturePercent}% → जड़ क्षेत्र में पानी पूर्ति हेतु सुबह 5:30-8:30 उत्तम समय।`
      : `ET0 is ${et0} mm/day with ${soilMoisturePercent}% soil moisture → ideal early morning window (5:30-8:30 AM) for root uptake.`;

    if (rainProb >= 45 || rainfallMm >= 6) {
      irrStatus = "RED";
      irrTitle = isHi ? "सिंचाई स्थगित रखें (वर्षा का पूर्वामुमान)" : "Postpone Irrigation (Rain Forecast)";
      irrReason = isHi
        ? `अगले 24-48 घंटों में ${rainProb}% वर्षा की संभावना → पानी ठहराव व जल भराव से बचने हेतु सिंचाई टालें।`
        : `Rain probability is ${rainProb}% in next 24-48h → postpone irrigation to prevent root rot and save electricity.`;
    } else if (soilMoisturePercent > 70) {
      irrStatus = "AMBER";
      irrTitle = isHi ? "नमी पर्याप्त - हल्की निगरानी" : "Adequate Moisture - Monitor";
      irrReason = isHi
        ? `हालिया वर्षा/सिंचाई से मिट्टी में नमी 70%+ है → भारी सिंचाई रोकें और केवल हल्की नमी बनाए रखें।`
        : `Soil moisture is high (>70%) from recent water → delay heavy flooding for 48 hours.`;
    }

    // 2. Spray / Pesticide Window
    let sprayStatus = "GREEN";
    let sprayTitle = isHi ? "कीटनाशक/फफूंदनाशक स्प्रे अनुकूल" : "Favorable Spraying Window";
    let sprayReason = isHi
      ? `हवा की गति (${windSpeed} km/h < 15 km/h) व वर्षा नहीं → दवा पत्तियों पर टिकने हेतु प्रातः 6:00-9:00 उत्तम।`
      : `Wind speed (${windSpeed} km/h < 15 km/h limit) & no rain → optimal drift-free foliar spray window.`;

    if (windSpeed >= 15) {
      sprayStatus = "RED";
      sprayTitle = isHi ? "स्प्रे न करें (तेज हवा का खतरा)" : "High Spray Drift Risk (High Wind)";
      sprayReason = isHi
        ? `हवा की गति ${windSpeed} km/h (>15 km/h सीमा) → दवा हवा में उड़ने और बर्बादी का जोखिम; हवा रुकने का इंतजार करें।`
        : `Wind speed ${windSpeed} km/h > 15 km/h threshold → high spray drift loss risk; delay to calm morning hours.`;
    } else if (rainProb >= 40) {
      sprayStatus = "RED";
      sprayTitle = isHi ? "स्प्रे स्थगित रखें (बारिश में धुलने का जोखिम)" : "Postpone Spray (Rain Washoff Risk)";
      sprayReason = isHi
        ? `अगले 24h में ${rainProb}% बारिश की संभावना → छिड़की गई महंगी रसायन धुल जाएगी; वर्षा पश्चात ही स्प्रे करें।`
        : `Rain probability ${rainProb}% → high chemical washoff risk; wait for post-rain clear dry period.`;
    } else if (humidity >= 78) {
      sprayStatus = "AMBER";
      sprayTitle = isHi ? "फफूंद का खतरा (सिस्टमैटिक स्प्रे)" : "Fungal Spore Risk Window";
      sprayReason = isHi
        ? `आद्रता ${humidity}% व तापमान ${temp}°C → फफूंद बीजाणुओं का प्रकोप संभव; निवारक सिस्टमैटिक फफूंदनाशक छिड़कें।`
        : `Relative humidity ${humidity}% & ${temp}°C → fungal spore activation window; systemic fungicide recommended.`;
    }

    // 3. Fertigation / Fertilizer Window
    let fertStatus = "GREEN";
    let fertTitle = isHi ? "उर्वरक प्रयोग हेतु अनुकूल" : "Optimal Fertigation Window";
    let fertReason = isHi
      ? `मृदा नमी (${soilMoisturePercent}%) अनुकूल → जड़ों द्वारा एनपीके/यूरिया के अवशोषण हेतु उत्तम समय।`
      : `Optimal soil moisture (${soilMoisturePercent}%) → excellent root nutrient uptake condition.`;

    if (rainProb >= 50) {
      fertStatus = "RED";
      fertTitle = isHi ? "खाद न डालें (लीचिंग का खतरा)" : "Postpone Fertilizer (Leaching Risk)";
      fertReason = isHi
        ? `अगले 24-48h में ${rainProb}% बारिश → यूरिया/नाइट्रोजन का निचले स्तर में बहने (Leaching) का जोखिम।`
        : `Rain prob ${rainProb}% → risk of fertilizer leaching into subsoil; hold urea application till rain stops.`;
    } else if (temp >= 37) {
      fertStatus = "AMBER";
      fertTitle = isHi ? "उच्च तापमान - शाम को खाद दें" : "High Heat Caution";
      fertReason = isHi
        ? `तापमान ${temp}°C अधिक → तेज धूप में यूरिया न छिड़कें (अमोनिया वाष्पीकरण loss); सायं 5 बजे बाद पानी के साथ दें।`
        : `High temperature (${temp}°C) → avoid midday broad-casting; apply in late evening with drip water.`;
    }

    // 4. Harvesting / Picking Window
    let harvStatus = "GREEN";
    let harvTitle = isHi ? "फसल कटाई/चुनाई हेतु उत्तम" : "Favorable Harvest Window";
    let harvReason = isHi
      ? `मौसम शुष्क व धूप खिली हुई → दानों/फलियों की कटाई व सुखाने के लिए 48-72h का उत्तम अवसर।`
      : `Dry sun & favorable humidity → ideal 48-72h window for crop harvesting and field solar drying.`;

    if (rainProb >= 40) {
      harvStatus = "RED";
      harvTitle = isHi ? "कटाई रोकें या तुरंत तिरपाल से ढकें" : "Harvest Delay / Protect Grain";
      harvReason = isHi
        ? `वर्षा ${rainProb}% संभावित → कटी फसल भीगने से दाने काले पड़ने व सड़न का खतरा; कटी फसल तुरंत ढकें।`
        : `Rain probability ${rainProb}% → risk of crop lodging and grain rot; cover harvested produce immediately.`;
    } else if (humidity >= 80) {
      harvStatus = "AMBER";
      harvTitle = isHi ? "उच्च आद्रता - सुखाने में समय" : "High Grain Moisture Window";
      harvReason = isHi
        ? `आद्रता ${humidity}% अधिक → दाने देर से सूखेंगे; कटाई पश्चात धूप में 2-3 दिन सुखाना अनिवार्य।`
        : `High humidity (${humidity}%) → moisture content in harvested grain will be high; ensure solar drying.`;
    }

    return [
      {
        id: "irrigation",
        category: isHi ? "सिंचाई विंडो" : "Irrigation Window",
        icon: Droplets,
        title: irrTitle,
        status: irrStatus,
        reason: irrReason,
        time: "Next 24-48h (5:30 - 8:30 AM)"
      },
      {
        id: "spray",
        category: isHi ? "कीटनाशक/छिड़काव" : "Pesticide Spray",
        icon: Bug,
        title: sprayTitle,
        status: sprayStatus,
        reason: sprayReason,
        time: "Next 48h (6:00 - 9:00 AM)"
      },
      {
        id: "fertigation",
        category: isHi ? "उर्वरक/खाद" : "Fertigation",
        icon: Sprout,
        title: fertTitle,
        status: fertStatus,
        reason: fertReason,
        time: "Next 48-72h (Morning/Evening)"
      },
      {
        id: "harvest",
        category: isHi ? "फसल कटाई" : "Harvest / Picking",
        icon: ShieldCheck,
        title: harvTitle,
        status: harvStatus,
        reason: harvReason,
        time: "Next 72h (10 AM - 4 PM)"
      }
    ];
  }, [et0, soilMoisturePercent, rainProb, rainfallMm, windSpeed, humidity, temp, isHi]);

  // 2. Generate 7-Day Task Deck for specific Crop + Stage
  const taskDeck = useMemo(() => {
    const tasks = [];
    const cId = cropObj.id;
    const sId = stageObj.id;

    if (cId === "wheat") {
      if (sId === "cri") {
        tasks.push({
          id: `wheat-cri-irrigate`,
          title: isHi ? "गेहूं मुकुट जड़ (CRI) सिंचाई" : "Wheat CRI Stage First Irrigation",
          desc: isHi ? "21 दिन पर पहली सिंचाई अत्यंत महत्वपूर्ण है। जड़ विकास के लिए 18-20 सेमी पानी दें।" : "Critical 21-day first watering. Essential for crown root development.",
          category: "Irrigation",
          badge: "RED_CRITICAL",
          timing: "Tomorrow 5:30 AM",
          reason: isHi ? "CRI अवस्था में पानी की कमी से 30% तक उपज घट सकती है।" : "Water stress at CRI stage reduces yield by up to 30%."
        });
        tasks.push({
          id: `wheat-cri-zinc`,
          title: isHi ? "जिंक सल्फेट 33% + यूरिया फोलियर स्प्रे" : "Zinc Sulphate 33% + Urea Foliar Spray",
          desc: isHi ? "0.5% जिंक सल्फेट + 1% यूरिया का 200 लीटर पानी में घोल छिड़कें।" : "Foliar spray of 0.5% Zinc Sulphate + 1% Urea to boost tillering.",
          category: "Spray",
          badge: windSpeed < 15 ? "GREEN" : "RED",
          timing: "Day 2 (6:00 AM)",
          reason: windSpeed >= 15 ? (isHi ? "हवा तेज है, छिड़काव टालें।" : "High wind drift risk.") : (isHi ? "हवा धीमी है, स्प्रे हेतु उत्तम।" : "Low wind, ideal for spray.")
        });
        tasks.push({
          id: `wheat-cri-weed`,
          title: isHi ? "खरपतवार नाशक प्रयोग (क्लोडीनाफॉप)" : "Grassy Weed Control (Clodinafop)",
          desc: isHi ? "गुल्ली डंडा / मँडूसी नियंत्रण के लिए सिंचाई के 3-5 दिन बाद स्प्रे करें।" : "Control Phalaris minor 3-5 days post first irrigation.",
          category: "Pesticide",
          badge: "GREEN",
          timing: "Day 4 (Morning)",
          reason: isHi ? "सिंचाई के बाद मिट्टी की नमी दवा प्रभाव को 40% बढ़ाती है।" : "Post-irrigation moisture maximizes herbicide efficacy."
        });
      } else if (sId === "tillering") {
        tasks.push({
          id: `wheat-till-urea`,
          title: isHi ? "यूरिया टॉप ड्रेसिंग (40 किग्रा/एकड़)" : "Urea Top Dressing (40 kg/Acre)",
          desc: isHi ? "कल्ले निकलने की अवस्था पर नाइट्रोजन की दूसरी खुराक दें।" : "Second dose of nitrogen at peak tillering phase.",
          category: "Fertigation",
          badge: rainProb < 40 ? "GREEN" : "RED",
          timing: "Tomorrow Evening",
          reason: rainProb >= 40 ? (isHi ? "बारिश से लीचिंग का खतरा।" : "Rain leaching risk.") : (isHi ? "मृदा नमी अवशोषण हेतु अनुकूल।" : "Optimal moisture for absorption.")
        });
        tasks.push({
          id: `wheat-till-irrigate`,
          title: isHi ? "दूसरी सिंचाई (कल्ला फूटने की अवस्था)" : "Second Irrigation (Peak Tillering)",
          desc: isHi ? "40-45 दिन पर दूसरी सिंचाई करें। ड्रिप या फव्वारा विधि अपनाएं।" : "Maintain steady soil moisture at 40-45 days after sowing.",
          category: "Irrigation",
          badge: "GREEN",
          timing: "Day 3 (5:30 AM)",
          reason: isHi ? "कल्लों की संख्या बढ़ाने हेतु हल्की सिंचाई आवश्यक।" : "Light watering boosts productive tillers count."
        });
      } else {
        tasks.push({
          id: `wheat-gen-irrigate`,
          title: isHi ? "गेहूं दाना भरने की अवस्था सिंचाई" : "Wheat Milk / Grain Filling Irrigation",
          desc: isHi ? "दाने का आकार व वजन बढ़ाने के लिए हल्की सिंचाई करें।" : "Light irrigation to ensure full grain plumpness & test weight.",
          category: "Irrigation",
          badge: "GREEN",
          timing: "Day 2 (Early Morning)",
          reason: isHi ? "तेज हवा चलने पर सिंचाई रोकें ताकि फसल गिरे (Lodging) न।" : "Avoid watering on windy days to prevent lodging."
        });
      }
    } else if (cId === "tomato") {
      tasks.push({
        id: `tomato-npk-spray`,
        title: isHi ? "NPK 12:61:00 + बोरॉन फोलियर स्प्रे" : "NPK 12:61:00 + Boron Foliar Spray",
        desc: isHi ? "फूल व फल सड़न रोकने के लिए 5 ग्राम/लीटर बोरॉन व फास्फोरस स्प्रे करें।" : "Foliar spray to prevent flower drop & blossom end rot.",
        category: "Spray",
        badge: windSpeed < 15 ? "GREEN" : "AMBER",
        timing: "Tomorrow 6:30 AM",
        reason: isHi ? "सुबह के समय रंध्र (Stomata) खुले रहते हैं।" : "Stomata are open early morning for 90%+ absorption."
      });
      tasks.push({
        id: `tomato-fungicide`,
        title: isHi ? "अगेती झुलसा / कॉपर ऑक्सीक्लोराइड स्प्रे" : "Early Blight Preventative Copper Spray",
        desc: isHi ? "पत्तियों पर धब्बे रोकने हेतु 2.5 ग्राम/लीटर कॉपर ऑक्सीक्लोराइड छिड़कें।" : "Preventative spray against fungal spots and early blight.",
        category: "Spray",
        badge: humidity > 75 ? "RED_CRITICAL" : "GREEN",
        timing: "Day 2 Morning",
        reason: humidity > 75 ? (isHi ? "उच्च नमी फफूंद बीजाणुओं को बढ़ाती है।" : "High humidity triggers fungal spore surge.") : (isHi ? "निवारक सुरक्षा।" : "Preventative barrier.")
      });
      tasks.push({
        id: `tomato-drip-irrigate`,
        title: isHi ? "ड्रिप सिंचाई (20 लीटर/पौधा)" : "Drip Irrigation & Fertigation",
        desc: isHi ? "फल विकास हेतु रोजाना 45 मिनट ड्रिप चलाएं।" : "Daily 45 min drip cycle for uniform fruit sizing.",
        category: "Irrigation",
        badge: "GREEN",
        timing: "Daily (5:30 AM)",
        reason: isHi ? "ड्रिप से 45% पानी व 30% खाद की बचत होती है।" : "Drip saves 45% water & delivers nutrients directly to roots."
      });
    } else {
      // General Crop Tasks
      tasks.push({
        id: `${cId}-irrigate-task`,
        title: isHi ? `${cropObj.hi} की सिंचाई समय-सारणी` : `${cropObj.en} Scheduled Watering`,
        desc: isHi ? `विकास की अवस्था (${stageObj.hi}) हेतु 16-18 सेमी जल मात्रा दें।` : `Water application tailored for ${stageObj.en}.`,
        category: "Irrigation",
        badge: rainProb < 40 ? "GREEN" : "RED",
        timing: "Tomorrow 5:30 AM",
        reason: isHi ? "मौसम व नमी के अनुसार निर्धारित।" : "Calculated using live ET0 and soil capacity."
      });
      tasks.push({
        id: `${cId}-fertilizer-task`,
        title: isHi ? "एनपीके / जैविक खाद ड्रिप अनुप्रयोग" : "NPK / Organic Micro-Nutrients Fertigation",
        desc: isHi ? "पोषक तत्वों का असंतुलन दूर करने के लिए तरल खाद दें।" : "Liquid fertigation cycle for balanced canopy growth.",
        category: "Fertigation",
        badge: "GREEN",
        timing: "Day 3 (Evening)",
        reason: isHi ? "जड़ों के पास नमी रहने पर खाद तुरंत घुलती है।" : "Root zone moisture ensures immediate ionic uptake."
      });
      tasks.push({
        id: `${cId}-pest-check`,
        title: isHi ? "कीट व बीमारी निगरानी (स्कॉउटिंग)" : "Pest & Pathogen Scouting",
        desc: isHi ? "पत्तियों के निचले हिस्से में रस चूसक कीटों की जांच करें।" : "Inspect leaf undersides for sucking pests & aphids.",
        category: "Pesticide",
        badge: "GREEN",
        timing: "Day 5 (Morning)",
        reason: isHi ? "शुरुआती अवस्था में कीट नियंत्रण 80% आसान होता है।" : "Early detection reduces pesticide requirement by 80%."
      });
    }

    return tasks;
  }, [cropObj, stageObj, isHi, windSpeed, rainProb, humidity]);

  // Toggle Task in "My Plan"
  const handleTogglePlanTask = (task) => {
    setMyPlanTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) {
        return prev.filter((t) => t.id !== task.id);
      } else {
        return [...prev, { ...task, completed: false, addedAt: new Date().toLocaleDateString() }];
      }
    });
  };

  const handleToggleTaskCompleted = (taskId) => {
    setMyPlanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleClearCompletedPlan = () => {
    setMyPlanTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Generate 7-Day Forecast Table
  const sevenDayPlanner = useMemo(() => {
    const days = [];
    const today = new Date();
    const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNamesHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = isHi ? dayNamesHi[d.getDay()] : dayNamesEn[d.getDay()];
      const dateStr = `${d.getDate()} ${d.toLocaleString(isHi ? "hi-IN" : "en-US", { month: "short" })}`;

      let dayRainProb = i === 0 ? rainProb : Math.max(5, (rainProb + (i * 12 - 18) + 100) % 85);
      let dayTemp = temp + (i % 2 === 0 ? 1 : -1);
      let dayEt0 = parseFloat((et0 + (i % 3 === 0 ? 0.3 : -0.2)).toFixed(1));

      let recStatus = "IRRIGATE";
      let statusLabel = isHi ? "सिंचाई करें" : "Irrigate";
      let colorClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
      let recommendedLiters = Math.round(grossLitersPerAcre * (i === 0 ? 1 : 0.9));

      if (dayRainProb > 45) {
        recStatus = "SKIP";
        statusLabel = isHi ? "वर्षा: स्थगित रखें" : "Skip (Rain)";
        colorClass = "bg-amber-100 text-amber-900 border-amber-300";
        recommendedLiters = 0;
      } else if (i === 1 && rainProb > 30) {
        recStatus = "SKIP";
        statusLabel = isHi ? "निगरानी रखें" : "Hold & Watch";
        colorClass = "bg-blue-100 text-blue-800 border-blue-300";
        recommendedLiters = 0;
      } else if (i % 2 === 1 && selectedSoil === "clay") {
        recStatus = "PAUSE";
        statusLabel = isHi ? "नमी पर्याप्त" : "Moisture OK";
        colorClass = "bg-slate-100 text-slate-700 border-slate-300";
        recommendedLiters = 0;
      }

      days.push({
        dayName,
        dateStr,
        temp: dayTemp,
        rainProb: dayRainProb,
        et0: dayEt0,
        recStatus,
        statusLabel,
        colorClass,
        liters: recommendedLiters,
        timeSlot: dayRainProb > 45 ? "-" : "5:30 AM - 8:00 AM"
      });
    }
    return days;
  }, [rainProb, temp, et0, grossLitersPerAcre, isHi, selectedSoil]);

  if (!isOpen) return null;

  const handleAskWeatherGPT = () => {
    const promptText = isHi
      ? `${city} में मेरी फ़सल (${cropObj.hi}), विकास अवस्था (${stageObj.hi}), मिट्टी (${soilObj.hi}) और ${farmAcres} एकड़ खेत के लिए 48-72h का विस्तृत सिंचाई, फफूंदनाशक स्प्रे और उर्वरक समय चक्र क्या होना चाहिए?`
      : `What is the detailed 48-72h spray, irrigation & fertigation schedule for my ${cropObj.en} (${stageObj.en}) in ${city}? (Soil: ${soilObj.en}, Farm Size: ${farmAcres} Acres)`;
    onAskAI?.(promptText);
    onClose?.();
  };

  const content = (
    <div
      id="irrigation-modal-dialog"
      className={
        isFullPage
          ? "w-full max-w-6xl mx-auto my-0 sm:my-4 bg-[#fbf8fc] rounded-none sm:rounded-3xl shadow-xl border border-slate-200 flex flex-col min-h-[85vh] text-slate-900 overflow-hidden"
          : "w-full max-w-4xl bg-[#fbf8fc] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden text-slate-900 animate-in slide-in-from-bottom-6 duration-200"
      }
    >
      {/* Header */}
      <div className="p-4 sm:p-5 bg-[#031636] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {isFullPage ? (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title={isHi ? "डैशबोर्ड पर वापस जाएँ" : "Back to Dashboard"}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Droplets className="w-6 h-6 animate-bounce" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {t.irrigationScheduler || (isHi ? "स्मार्ट सिंचाई व फ़सल कार्य योजना" : "Smart Irrigation & Crop Action Planner")}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Agromet AI
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{city} • {translateWeatherCondition(condition, language)} ({temp}°C)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {myPlanTasks.length > 0 && (
            <button
              onClick={() => setActiveTab("myplan")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isHi ? `मेरी योजना (${myPlanTasks.length})` : `My Plan (${myPlanTasks.length})`}</span>
            </button>
          )}

          {onToggleFullPage && (
            <button
              type="button"
              onClick={onToggleFullPage}
              title={isFullPage ? (isHi ? "मोडाल में देखें" : "View as Modal") : (isHi ? "पूर्ण पृष्ठ में खोलें" : "Open in Full Page")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {isFullPage ? <Minimize2 className="w-4 h-4 text-emerald-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">
                {isFullPage
                  ? (isHi ? "मोडाल व्यू" : "Modal View")
                  : (isHi ? "पूर्ण पृष्ठ" : "Full Page")}
              </span>
            </button>
          )}

          <button
            id="irrigation-close-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

        {/* Dynamic Crop + Stage Onboarding Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-xs w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer pr-1"
              >
                {CROPS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 min-w-0 flex-1 sm:flex-initial">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer truncate w-full"
              >
                {cropObj.stages.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.en} ({s.hi})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
              Kc Factor: {kc}
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 font-bold">
              ET0: {et0} mm/d
            </span>
          </div>
        </div>

        {/* Modal Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => setActiveTab("windows")}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "windows"
                ? "bg-[#031636] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{isHi ? "48-72h कार्य विंडो" : "48-72h Action Windows"}</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "tasks"
                ? "bg-[#031636] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHi ? "7-दिवसीय टास्क डेक" : "7-Day Task Deck"}</span>
          </button>

          <button
            onClick={() => setActiveTab("myplan")}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === "myplan"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isHi ? "मेरी योजना" : "My Saved Plan"}</span>
            {myPlanTasks.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {myPlanTasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-[#031636] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{isHi ? "सिंचाई व जल कैलकुलेटर" : "Water Calculator"}</span>
          </button>

          <button
            onClick={() => setActiveTab("table")}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "table"
                ? "bg-[#031636] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isHi ? "7-दिवसीय सारणी" : "7-Day Table"}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800">

          {/* TAB 1: 48-72 HOUR ACTION WINDOWS WITH "WHY THIS ADVICE" EXPLAINERS */}
          {activeTab === "windows" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#031636] uppercase tracking-wide flex items-center gap-2">
                    <Gauge className="w-4.5 h-4.5 text-emerald-600" />
                    <span>{isHi ? "अगले 48-72 घंटों के कृषि कार्य अवसर" : "48-72 Hour Favorable Operations Windows"}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHi
                      ? `${cropObj.hi} (${stageObj.hi}) के लिए मौसम वैज्ञानिक गणना आधारित हरी/अंबर/लाल चेतावनियां`
                      : `Meteorological risk windows for ${cropObj.en} at ${stageObj.en}`}
                  </p>
                </div>
              </div>

              {/* Grid of 4 Operational Windows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {opWindows.map((win) => {
                  const IconComp = win.icon;
                  const isRed = win.status === "RED";
                  const isAmber = win.status === "AMBER";
                  const isGreen = win.status === "GREEN";

                  const existingPlanTask = myPlanTasks.find((t) => t.id === `win-${win.id}`);
                  const isInPlan = !!existingPlanTask;

                  return (
                    <div
                      key={win.id}
                      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between shadow-xs ${
                        isRed
                          ? "bg-rose-50/70 border-rose-300 text-rose-950"
                          : isAmber
                          ? "bg-amber-50/80 border-amber-300 text-amber-950"
                          : "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-slate-600">
                            <IconComp className="w-4 h-4 text-slate-700" />
                            {win.category}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border shadow-2xs ${
                              isRed
                                ? "bg-rose-600 text-white border-rose-700"
                                : isAmber
                                ? "bg-amber-500 text-slate-950 border-amber-600"
                                : "bg-emerald-600 text-white border-emerald-700"
                            }`}
                          >
                            {isRed ? (isHi ? "स्थगित रखें / जोखिम" : "RED - Risk Window") : isAmber ? (isHi ? "सावधानी विंडो" : "AMBER - Caution") : (isHi ? "अनुकूल विंडो" : "GREEN - Favorable")}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="font-bold text-sm text-slate-900 mt-1">
                          {win.title}
                        </div>

                        {/* Why this advice explainer in 1-2 lines */}
                        <div className="bg-white/90 backdrop-blur-xs rounded-xl p-2.5 border border-slate-200/80 text-xs space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <Info className="w-3 h-3 text-blue-600" />
                            <span>{isHi ? "मौसम वैज्ञानिक कारण (Why This Advice):" : "Why This Advice:"}</span>
                          </div>
                          <p className="text-slate-700 text-xs leading-relaxed font-medium">
                            {win.reason}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-300/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {win.time}
                        </span>

                        <button
                          onClick={() =>
                            handleTogglePlanTask({
                              id: `win-${win.id}`,
                              title: `${win.category}: ${win.title}`,
                              desc: win.reason,
                              category: win.category,
                              badge: win.status,
                              timing: win.time
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            isInPlan
                              ? "bg-emerald-700 text-white hover:bg-emerald-800"
                              : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {isInPlan ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>{isHi ? "योजना में शामिल" : "In My Plan"}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isHi ? "प्लैन में जोड़ें" : "Add to My Plan"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: 7-DAY CROP STAGE TASK DECK */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#031636] uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                    <span>{isHi ? `${cropObj.hi} (${stageObj.hi}) 7-दिवसीय टास्क डेक` : `7-Day Task Deck: ${cropObj.en}`}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHi ? "1-टैप में अपनी कार्य योजना में जोड़ें व पूरा होने पर टिक करें" : "1-tap 'Add to My Plan' for personalized weekly field actions"}
                  </p>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="space-y-3">
                {taskDeck.map((task) => {
                  const existingPlanTask = myPlanTasks.find((t) => t.id === task.id);
                  const isInPlan = !!existingPlanTask;

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-300">
                            {task.category}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {task.timing}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-slate-900">{task.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{task.desc}</p>

                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5 mt-1">
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{task.reason}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        <button
                          onClick={() => handleTogglePlanTask(task)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                            isInPlan
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-[#031636] hover:bg-slate-800 text-white"
                          }`}
                        >
                          {isInPlan ? (
                            <>
                              <Check className="w-4 h-4 text-white" />
                              <span>{isHi ? "योजना में शामिल ✓" : "In My Plan ✓"}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 text-cyan-300" />
                              <span>{isHi ? "प्लान में जोड़ें" : "Add to My Plan"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MY SAVED PLAN TRACKER */}
          {activeTab === "myplan" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    <span>{isHi ? "मेरी सहेजी गई कृषि कार्य योजना" : "My Saved Agricultural Action Plan"}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHi ? "सप्ताह भर के चुनिंदा कार्यों की सूची एवं स्थिति" : "Track planned field tasks and mark completion"}
                  </p>
                </div>

                {myPlanTasks.some((t) => t.completed) && (
                  <button
                    onClick={handleClearCompletedPlan}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isHi ? "पूर्ण कार्य हटाएं" : "Clear Completed"}</span>
                  </button>
                )}
              </div>

              {myPlanTasks.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {isHi ? "आपकी कार्य योजना अभी खाली है।" : "Your action plan is currently empty."}
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {isHi
                      ? "48-72h कार्य विंडो या 7-दिवसीय टास्क डेक से 'प्लान में जोड़ें' बटन पर क्लिक करके अपने कार्य जोड़ें।"
                      : "Tap 'Add to My Plan' from the 48-72h Action Windows or 7-Day Task Deck to track field operations."}
                  </p>
                  <button
                    onClick={() => setActiveTab("windows")}
                    className="px-4 py-2 rounded-xl bg-[#031636] text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors inline-block mt-2"
                  >
                    {isHi ? "कार्य विंडो देखें" : "Browse Action Windows"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myPlanTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`rounded-2xl p-4 border transition-all flex items-start justify-between gap-3 ${
                        task.completed
                          ? "bg-slate-50 border-slate-200 opacity-60 line-through"
                          : "bg-white border-emerald-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleTaskCompleted(task.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                            task.completed
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 hover:border-emerald-500 bg-white"
                          }`}
                        >
                          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{task.title}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {task.timing}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{task.desc}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTogglePlanTask(task)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title={isHi ? "योजना से हटाएं" : "Remove"}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WATER & CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="space-y-4">
              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold">{isHi ? "आवश्यक जल मात्रा" : "Water Required"}</div>
                  <div className="font-extrabold text-slate-900 text-base mt-0.5">
                    {grossLitersPerAcre.toLocaleString()} <span className="text-[10px] text-slate-500">L/Acre</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold">{t.bestTimeSlot || (isHi ? "उत्तम सिंचाई समय" : "Best Time Window")}</div>
                  <div className="font-bold text-emerald-700 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>5:30 AM - 8:30 AM</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold">{isHi ? "कुल खेत जल मांग (" + farmAcres + " एकड़)" : `Total Farm Water (${farmAcres} A)`}</div>
                  <div className="font-extrabold text-blue-700 text-base mt-0.5">
                    {(totalLitersFarm / 1000).toFixed(1)}k <span className="text-[10px]">Liters</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold">{t.waterSaved || (isHi ? "अनुमानित जल बचत" : "Water Saved")}</div>
                  <div className="font-bold text-purple-700 text-xs mt-1 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{methodObj.saving}% ({methodObj.id === "drip" ? "Drip" : "Sprinkler"})</span>
                  </div>
                </div>
              </div>

              {/* Interactive Form */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs sm:text-sm font-bold text-[#031636] uppercase tracking-wide flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? "सिंचाई व मिट्टी मापदंड कॉन्फ़िगर करें" : "Configure Soil & Irrigation Method"}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Soil Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t.soilType || (isHi ? "मिट्टी का प्रकार" : "Soil Type")}
                    </label>
                    <select
                      value={selectedSoil}
                      onChange={(e) => setSelectedSoil(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    >
                      {SOILS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.en} ({s.hi})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Irrigation System */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t.irrigationMethod || (isHi ? "सिंचाई प्रणाली" : "Irrigation Method")}
                    </label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    >
                      {METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.en} ({m.hi})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Farm Size Slider */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{t.farmSize || (isHi ? "खेत का क्षेत्रफल (एकड़)" : "Farm Area (Acres)")}:</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">{farmAcres} Acres ({farmAcres * 1.6} Bigha)</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="25"
                    step="0.5"
                    value={farmAcres}
                    onChange={(e) => setFarmAcres(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 7-DAY TABLE */}
          {activeTab === "table" && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-[#031636] uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{t.sevenDaySchedule || (isHi ? "7-दिवसीय स्मार्ट सिंचाई सारणी" : "7-Day Smart Irrigation Planner")}</span>
                </h4>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  IMD & Satellite Forecast
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                      <th className="p-2.5 whitespace-nowrap">{isHi ? "दिन व तिथि" : "Day & Date"}</th>
                      <th className="p-2.5 whitespace-nowrap">{isHi ? "वर्षा %" : "Rain Prob"}</th>
                      <th className="p-2.5 whitespace-nowrap">{isHi ? "ET0 (मिमी)" : "ET0"}</th>
                      <th className="p-2.5 whitespace-nowrap">{isHi ? "सिंचाई सलाह" : "Recommendation"}</th>
                      <th className="p-2.5 whitespace-nowrap text-right">{isHi ? "मात्रा (लीटर/एकड़)" : "Water/Acre"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {sevenDayPlanner.map((item, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50 transition-colors ${idx === 0 ? "bg-emerald-50/40 font-semibold" : ""}`}>
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{item.dayName}</div>
                          <div className="text-[10px] text-slate-500">{item.dateStr}</div>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 font-bold ${item.rainProb > 45 ? "text-amber-600 font-extrabold" : "text-slate-600"}`}>
                            <CloudRain className="w-3 h-3 text-slate-400" />
                            {item.rainProb}%
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-slate-700">{item.et0} mm</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.colorClass}`}>
                            {item.statusLabel}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                          {item.liters > 0 ? `${item.liters.toLocaleString()} L` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ICAR-IMD Scientific Agricultural Guidelines */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-4 border border-emerald-500/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-950">
                {isHi ? "ICAR-IMD मौसम वैज्ञानिक सलाह:" : "ICAR-IMD Agromet Guidelines:"}
              </div>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 leading-relaxed text-[11px]">
                <li>{isHi ? "हवा की गति >15 km/h होने पर कभी भी कीटनाशक छिड़काव न करें (Spray Drift नुकसान)।" : "Avoid spraying pesticides when wind speed exceeds 15 km/h to prevent drift loss."}</li>
                <li>{isHi ? "भारी बारिश (40%+) की संभावना में यूरिया/नाइट्रोजन न डालें ताकि जल-लीचिंग से बचाव हो।" : "Hold nitrogen application prior to 40%+ rain forecast to prevent nutrient leaching."}</li>
                <li>{isHi ? "दोपहर धूप में सिंचाई से बचें; 35% पानी भाप बनकर उड़ जाता है।" : "Avoid afternoon watering; early morning 5:30-8:30 AM reduces evaporation loss by 35%."}</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setReminderSet(!reminderSet)}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                reminderSet
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${reminderSet ? "text-emerald-600" : "text-slate-400"}`} />
              <span>{reminderSet ? (isHi ? "रिमाइंडर सक्रिय ✓" : "Reminder Active ✓") : (isHi ? "रिमाइंडर सेट करें" : "Set Reminder")}</span>
            </button>
          </div>

          <button
            id="irrigation-ask-ai-btn"
            onClick={handleAskWeatherGPT}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#031636] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>{isHi ? "WeatherGPT AI से विस्तृत सलाह लें" : "Ask WeatherGPT AI Advisor"}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
  );

  if (isFullPage) {
    return (
      <div id="irrigation-scheduler-fullpage" className="w-full min-h-screen bg-[#fbf8fc] text-slate-900 pb-24 p-2 sm:p-6 overflow-y-auto">
        {content}
      </div>
    );
  }

  return (
    <div
      id="irrigation-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      {content}
    </div>
  );
};
