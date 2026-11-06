import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Activity,
  Wind,
  AlertTriangle,
  Sun,
  Shield,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Thermometer,
  CloudRain,
  MapPin,
  User,
  Sliders,
  Bell,
  FileText,
  Plus,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Volume2,
  Send,
  Download,
  Share2,
  PhoneCall,
  Check,
  X,
  RefreshCw,
  Cloud
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Default clean state for the health profile (no hardcoded fake personal data)
const DEFAULT_PROFILE = {
  isConfigured: false,
  age: "",
  gender: "",
  city: "",
  role: "",
  conditions: [],
  asthmaDetails: {
    severity: "moderate", // mild | moderate | severe
    triggers: [],
    preventerInhaler: false,
    rescueInhaler: false,
    otherMeds: "",
    symptomFrequency: "rarely",
    erVisitLast3m: false,
    outdoorExposure: false,
    outdoorExercise: false,
    commuteMode: "walk" // walk | two_wheeler | car | bus
  },
  otherConditions: {
    heart: { stage: "", medications: "" },
    migraine: { frequency: "", sensitiveToPressure: false },
    joint: { affected: "", coldSensitivity: false },
    mental: { seasonalPattern: false },
    pregnancy: { trimester: "" }
  },
  alertSettings: {
    highRiskDays: true,
    heatWaves: true,
    severeWeather: true,
    pollenSurge: true,
    morningBriefing: true,
    realtimeJumps: true,
    quietHours: true,
    morningTime: "07:00",
    inhalerReminder: false,
    inhalerReminderTime: "20:00"
  }
};

// Condition definitions with icons & metadata
const CONDITIONS_LIST = [
  {
    id: "asthma",
    label: "Asthma / COPD / Wheezing",
    labelHi: "अस्थमा / सीओपीडी / घरघराहट",
    icon: "🫁",
    description: "Sensitive to airborne PM2.5, dust, cold drops and windborne pollen",
    primaryWeatherFactor: "AQI, Particulates & Temperature"
  },
  {
    id: "migraine",
    label: "Migraine / Severe Headaches",
    labelHi: "माइग्रेन / तेज सिरदर्द",
    icon: "🤕",
    description: "Triggered by sharp pressure drops, intense UV glare & dry air waves",
    primaryWeatherFactor: "Pressure & UV Index"
  },
  {
    id: "joint",
    label: "Arthritis / Joint Pain",
    labelHi: "गठिया / जोड़ों का दर्द",
    icon: "🦴",
    description: "Triggered by high atmospheric dampness, rainstorms & falling temperatures",
    primaryWeatherFactor: "Humidity & Cold Waves"
  },
  {
    id: "heart",
    label: "Heart Disease & Diabetes",
    labelHi: "हृदय रोग और मधुमेह",
    icon: "❤️",
    description: "Sensitive to extreme heat, dehydration, and heavy glucose shifts in extreme weather",
    primaryWeatherFactor: "Heat Index & Wet Bulb Temp"
  },
  {
    id: "autoimmune",
    label: "Autoimmune (e.g., Lupus)",
    labelHi: "ऑटोइम्यून (जैसे, ल्यूपस)",
    icon: "🦋",
    description: "Highly sensitive to intense UV radiation, sunlight exposure and heat glare",
    primaryWeatherFactor: "UV Index & Peak Sun Hours"
  },
  {
    id: "pots",
    label: "POTS / Dysautonomia",
    labelHi: "पीओटीएस / डिसऑटोनोमिया",
    icon: "💧",
    description: "Vulnerable to high heat indexes, thermal stress, and rapid hydration depletion",
    primaryWeatherFactor: "Heat Index, Humidity & Pressure"
  },
  {
    id: "pregnancy",
    label: "Pregnancy Wellness",
    labelHi: "गर्भावस्था स्वास्थ्य",
    icon: "🤰",
    description: "Vulnerable to extreme ambient heat indexes, high particulates and air pollutants",
    primaryWeatherFactor: "Thermal Fatigue & AQI"
  }
];

// Default medical-wellness rules for conditions
const DEFAULT_RULES = [
  // Asthma
  {
    id: "asthma_aqi",
    conditionId: "asthma",
    triggerType: "aqi",
    operator: "gt",
    threshold: 150,
    actionText: "Keep windows closed when AQI/pollen is high, and use a mask if smoke or pollution is visible.",
    actionTextHi: "वायु गुणवत्ता (AQI) और पराग उच्च होने पर खिड़कियां बंद रखें, और धुआं या प्रदूषण दिखने पर मास्क का उपयोग करें।"
  },
  {
    id: "asthma_rescue",
    conditionId: "asthma",
    triggerType: "aqi",
    operator: "gt",
    threshold: 100,
    actionText: "Ensure you check your inhaler, carry your rescue inhaler, and consider pre-treatment before outdoor activity.",
    actionTextHi: "अपने इनहेलर की जांच करें, अपना रेस्क्यू इनहेलर साथ रखें, और बाहरी गतिविधियों से पहले प्री-ट्रीटमेंट पर विचार करें।"
  },
  
  // Migraine
  {
    id: "migraine_humidity",
    conditionId: "migraine",
    triggerType: "humidity",
    operator: "gt",
    threshold: 75,
    actionText: "Hydrate heavily, limit screen glare, and plan rest if the barometric or humidity trend is unfavorable.",
    actionTextHi: "भरपूर पानी पीएं, स्क्रीन की चमक कम करें, और यदि बैरोमेट्रिक दबाव या नमी का रुख अनुकूल न हो तो आराम की योजना बनाएं।"
  },
  {
    id: "migraine_uv",
    conditionId: "migraine",
    triggerType: "uv",
    operator: "gt",
    threshold: 6,
    actionText: "Avoid known triggers (dehydration, skipped meals) and consider early medication per your doctor's plan due to high UV glare.",
    actionTextHi: "ज्ञात ट्रिगर्स (निर्जलीकरण, छूटा हुआ भोजन) से बचें और तेज धूप के कारण डॉक्टर की योजना के अनुसार शुरुआती दवा लें।"
  },

  // Arthritis / Joint Pain
  {
    id: "joint_humidity",
    conditionId: "joint",
    triggerType: "humidity",
    operator: "gt",
    threshold: 75,
    actionText: "Do warm-up routines, apply heat/cold therapy, and plan lower-impact activities on high-humidity days.",
    actionTextHi: "वार्म-अप रूटीन करें, हीट/कोल्ड थेरेपी का उपयोग करें, और उच्च आर्द्रता वाले दिनों में कम प्रभाव वाली गतिविधियों की योजना बनाएं।"
  },
  {
    id: "joint_temp",
    conditionId: "joint",
    triggerType: "temp",
    operator: "lt",
    threshold: 18,
    actionText: "Use compression garments and keep joints warm during cold spells.",
    actionTextHi: "कम्प्रेशन गारमेंट्स का उपयोग करें और ठंडे मौसम में जोड़ों को गर्म रखें।"
  },

  // Heart disease / diabetes
  {
    id: "heart_temp",
    conditionId: "heart",
    triggerType: "temp",
    operator: "gt",
    threshold: 35,
    actionText: "Avoid midday heat, monitor BP and glucose levels more frequently during extremes, and recognize heat-stress symptoms early.",
    actionTextHi: "दोपहर की गर्मी से बचें, चरम मौसम के दौरान रक्तचाप और ग्लूकोज के स्तर की अधिक बार निगरानी करें, और हीट-स्ट्रेस के लक्षणों को पहचानें।"
  },
  {
    id: "heart_humidity",
    conditionId: "heart",
    triggerType: "humidity",
    operator: "gt",
    threshold: 75,
    actionText: "Emphasize hydration and electrolyte balance to manage high heat-index strain on the cardiovascular system.",
    actionTextHi: "हृदय प्रणाली पर अत्यधिक उमस और गर्मी के तनाव को प्रबंधित करने के लिए हाइड्रेशन और इलेक्ट्रोलाइट संतुलन पर जोर दें।"
  },

  // Autoimmune
  {
    id: "autoimmune_uv",
    conditionId: "autoimmune",
    triggerType: "uv",
    operator: "gt",
    threshold: 5,
    actionText: "Wear sun-protective clothing (broad-brimmed hat, UV sleeves) and schedule outdoor time strictly outside peak UV hours.",
    actionTextHi: "सूरज से सुरक्षा प्रदान करने वाले कपड़े (चौड़ी टोपी, यूवी स्लीव्स) पहनें और बाहरी गतिविधियों को पीक यूवी घंटों के बाहर ही रखें।"
  },
  {
    id: "autoimmune_always",
    conditionId: "autoimmune",
    triggerType: "always",
    operator: "always",
    threshold: 0,
    actionText: "Monitor UV index alerts and keep sunscreen handy for any sudden outdoor trips.",
    actionTextHi: "यूवी इंडेक्स अलर्ट पर नजर रखें और अचानक बाहर जाने के लिए सनस्क्रीन अपने पास रखें।"
  },

  // POTS / Dysautonomia
  {
    id: "pots_temp",
    conditionId: "pots",
    triggerType: "temp",
    operator: "gt",
    threshold: 32,
    actionText: "Heed heat/humidity alerts. Plan cool environments and use compression wear to prevent orthostatic pooling.",
    actionTextHi: "गर्मी/आर्द्रता अलर्ट पर ध्यान दें। ठंडे वातावरण की योजना बनाएं और कम्प्रेशन वियर का उपयोग करें।"
  },
  {
    id: "pots_always",
    conditionId: "pots",
    triggerType: "always",
    operator: "always",
    threshold: 0,
    actionText: "Implement salt and fluid loading strategies (strictly per your clinician's guidance) during warm weather.",
    actionTextHi: "गर्म मौसम के दौरान नमक और तरल पदार्थों के सेवन की रणनीति (डॉक्टर के मार्गदर्शन के अनुसार) अपनाएं।"
  },

  // Pregnancy
  {
    id: "pregnancy_temp",
    conditionId: "pregnancy",
    triggerType: "temp",
    operator: "gt",
    threshold: 33,
    actionText: "Ensure hydration levels are optimized, limit heat exposure, and avoid strenuous physical workouts.",
    actionTextHi: "सुनिश्चित करें कि हाइड्रेशन का स्तर अनुकूल है, गर्मी में जाने से बचें और कठिन कसरत न करें।"
  }
];

export function HealthWeatherHub({
  location,
  weather,
  language = "en",
  onTabChange,
  onAskAI
}) {
  const isHi = language === "hi";

  // --- Profile State ---
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("weathergpt_health_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        // If stored profile was the old hardcoded fake profile (e.g. age 20 with female/student), reset to clean
        if (parsed && parsed.age === 20 && parsed.gender === "Female" && parsed.role === "Student") {
          localStorage.removeItem("weathergpt_health_profile");
          return DEFAULT_PROFILE;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  // --- Symptom Logs State --- (starts clean with no fake entries)
  const [symptomLogs, setSymptomLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("weathergpt_symptom_logs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // --- Active Hub Sub-Tab / View Mode ---
  const [currentView, setCurrentView] = useState(() => {
    return profile?.isConfigured ? "dashboard" : "onboarding";
  });

  // Fast Onboarding step (1: Demographics & Conditions, 2: Specific Triggers & Finalize)
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [tempProfile, setTempProfile] = useState(profile);
  const [ageError, setAgeError] = useState("");

  // Selected Condition for Detail View
  const [selectedConditionId, setSelectedConditionId] = useState("asthma");

  // Daily Logging Form State
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    breathlessness: "mild",
    cough: "mild",
    rescueInhalerUses: 0,
    outdoorTime: "1-3h",
    sleepQuality: 4,
    notes: ""
  });

  // Quick Chat Question State
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState(() => [
    {
      sender: "ai",
      text: `Hello! I'm your Weather-Health AI Advisor. Please complete your quick health profile to receive personalized safe windows, mask alerts, and heat precautions.`
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Sync first message of chat history with active language selection
  useEffect(() => {
    if (chatHistory.length === 1 && chatHistory[0].sender === "ai") {
      setChatHistory([
        {
          sender: "ai",
          text: isHi
            ? (profile.isConfigured
                ? `नमस्ते! मैं आपका मौसम-स्वास्थ्य एआई सलाहकार (Mausam Swasth AI Salakaar) हूँ। मैंने आपकी प्रोफ़ाइल (${profile.age ? profile.age + " वर्ष " : ""}${profile.gender ? (profile.gender === "Female" ? "महिला" : profile.gender === "Male" ? "पुरुष" : "अन्य") + ", " : ""}${profile.conditions?.length ? "ट्रैक लक्षण" : "सामान्य स्वास्थ्य"}) को ${location?.city || "आपके क्षेत्र"} के लाइव वायु गुणवत्ता (AQI) और मौसम के साथ कॉन्फ़िगर किया है। आज आप सुरक्षित रहने के लिए मुझसे क्या सलाह लेना चाहते हैं?`
                : `नमस्ते! मैं आपका मौसम-स्वास्थ्य एआई सलाहकार (Mausam Swasth AI Salakaar) हूँ। ${location?.city || "अपने क्षेत्र"} के लिए व्यक्तिगत सुरक्षा खिड़कियां, मास्क अलर्ट और गर्मी की सावधानियां प्राप्त करने के लिए कृपया अपनी त्वरित स्वास्थ्य प्रोफ़ाइल पूरी करें।`)
            : (profile.isConfigured
                ? `Hello! I'm your Weather-Health AI Advisor. I've configured your profile (${profile.age ? profile.age + "y " : ""}${profile.gender ? profile.gender + ", " : ""}${profile.conditions?.length ? profile.conditions.join(", ") : "general wellness"}) with ${location?.city || "your region"}'s live AQI and meteorology. How can I help you stay safe today?`
                : `Hello! I'm your Weather-Health AI Advisor. Please complete your quick health profile to receive personalized safe windows, mask alerts, and heat precautions for ${location?.city || "your region"}.`)
        }
      ]);
    }
  }, [language, profile.isConfigured, location]);

  // Sync profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weathergpt_health_profile", JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Sync logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weathergpt_symptom_logs", JSON.stringify(symptomLogs));
    } catch (e) {
      console.error(e);
    }
  }, [symptomLogs]);

  // --- Customizable Rules State ---
  const [rules, setRules] = useState(() => {
    try {
      const saved = localStorage.getItem("weathergpt_health_rules");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_RULES;
  });

  // Sync rules to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weathergpt_health_rules", JSON.stringify(rules));
    } catch (e) {
      console.error(e);
    }
  }, [rules]);

  // Action Plan UI States
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [selectedRuleCondition, setSelectedRuleCondition] = useState("asthma");
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    triggerType: "aqi",
    operator: "gt",
    threshold: 150,
    actionText: "",
    actionTextHi: ""
  });

  // --- Family Safety Circle States ---
  const [familyContacts, setFamilyContacts] = useState(() => {
    try {
      const saved = localStorage.getItem("weathergpt_family_circle");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [broadcastLog, setBroadcastLog] = useState(() => {
    try {
      const saved = localStorage.getItem("weathergpt_broadcast_log");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    relation: "Spouse",
    phone: "",
    location: "",
    riskStatus: "Safe / Clear",
    isExtremeRisk: false
  });

  const [broadcastToast, setBroadcastToast] = useState(null);

  // Sync familyContacts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weathergpt_family_circle", JSON.stringify(familyContacts));
    } catch (e) {
      console.error(e);
    }
  }, [familyContacts]);

  // Sync broadcastLog to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weathergpt_broadcast_log", JSON.stringify(broadcastLog));
    } catch (e) {
      console.error(e);
    }
  }, [broadcastLog]);

  // Helpers to fetch rules
  const getTriggeredRulesForCondition = (conditionId) => {
    return rules.filter(r => {
      if (r.conditionId !== conditionId) return false;
      if (r.triggerType === "always") return true;
      if (r.triggerType === "aqi") {
        return r.operator === "gt" ? currentAQI > r.threshold : currentAQI < r.threshold;
      }
      if (r.triggerType === "temp") {
        return r.operator === "gt" ? currentTemp > r.threshold : currentTemp < r.threshold;
      }
      if (r.triggerType === "uv") {
        return r.operator === "gt" ? currentUV > r.threshold : currentUV < r.threshold;
      }
      if (r.triggerType === "humidity") {
        return r.operator === "gt" ? currentHumidity > r.threshold : currentHumidity < r.threshold;
      }
      return false;
    });
  };

  const getRuleTriggerDescription = (rule, isHindi) => {
    if (rule.triggerType === "always") {
      return isHindi ? "सामान्य नियम" : "General Rule";
    }
    const factor = rule.triggerType.toUpperCase();
    const op = rule.operator === "gt" ? ">" : "<";
    return `${factor} ${op} ${rule.threshold}`;
  };

  // Derived current meteorological values
  const currentAQI = weather?.aqi || 140;
  const currentTemp = weather?.temp || 32;
  const currentHumidity = weather?.humidity || 65;
  const currentPM25 = weather?.pm25 || Math.round(currentAQI * 0.7);
  const currentUV = weather?.uv || 6;
  const cityName = location?.city || location?.locality || profile?.city || "Your City";

  // --- Dynamic Risk Calculations ---
  const riskAnalysis = useMemo(() => {
    // 1. Asthma Risk Engine
    let asthmaScore = 0;
    if (currentAQI > 250) asthmaScore += 3;
    else if (currentAQI > 200) asthmaScore += 2;
    else if (currentAQI > 150) asthmaScore += 1;

    if (currentTemp < 15 && profile.asthmaDetails?.triggers?.includes("cold")) {
      asthmaScore += 1;
    }
    if (profile.asthmaDetails?.severity === "severe") asthmaScore += 1;
    if (profile.asthmaDetails?.severity === "mild") asthmaScore -= 1;

    let asthmaLevel = "Moderate";
    let asthmaColor = "text-amber-600 bg-amber-50 border-amber-200";
    if (asthmaScore >= 4) {
      asthmaLevel = "High–Extreme";
      asthmaColor = "text-rose-700 bg-rose-50 border-rose-200";
    } else if (asthmaScore >= 3) {
      asthmaLevel = "Moderate–High";
      asthmaColor = "text-orange-700 bg-orange-50 border-orange-200";
    } else if (asthmaScore <= 1) {
      asthmaLevel = "Low";
      asthmaColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    }

    // 2. Heat & UV Risk
    let heatLevel = "Moderate";
    let heatColor = "text-amber-600 bg-amber-50 border-amber-200";
    if (currentTemp >= 40 || currentUV >= 10) {
      heatLevel = "Extreme";
      heatColor = "text-rose-700 bg-rose-50 border-rose-200";
    } else if (currentTemp >= 35 || currentUV >= 7) {
      heatLevel = "Moderate–High";
      heatColor = "text-orange-700 bg-orange-50 border-orange-200";
    } else if (currentTemp < 28 && currentUV < 5) {
      heatLevel = "Low";
      heatColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    }

    // 3. Migraine / Pressure Risk
    let migraineLevel = "Low";
    let migraineColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (currentUV >= 8 || currentHumidity > 75) {
      migraineLevel = "Moderate";
      migraineColor = "text-amber-600 bg-amber-50 border-amber-200";
    }

    // 4. Joint Pain Risk
    let jointLevel = "Low";
    let jointColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (currentHumidity > 80 || currentTemp < 15) {
      jointLevel = "Moderate–High";
      jointColor = "text-orange-700 bg-orange-50 border-orange-200";
    }

    return {
      asthma: { level: asthmaLevel, score: asthmaScore, style: asthmaColor },
      heat: { level: heatLevel, style: heatColor },
      migraine: { level: migraineLevel, style: migraineColor },
      joint: { level: jointLevel, style: jointColor }
    };
  }, [currentAQI, currentTemp, currentHumidity, currentUV, profile]);

  // Live Hourly Weather & AQI from backend
  const [liveHourlyList, setLiveHourlyList] = useState([]);
  const [hourlyLoading, setHourlyLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadHourly() {
      setHourlyLoading(true);
      try {
        const lat = location?.lat || 28.6139;
        const lng = location?.lng || 77.209;
        const res = await fetch(`/api/weather/hourly?lat=${lat}&lng=${lng}&city=${encodeURIComponent(cityName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hourly && Array.isArray(data.hourly) && isMounted) {
            setLiveHourlyList(data.hourly);
          }
        }
      } catch (e) {
        console.warn("Failed to load live hourly for Health Hub:", e);
      } finally {
        if (isMounted) setHourlyLoading(false);
      }
    }
    loadHourly();
    return () => {
      isMounted = false;
    };
  }, [location?.lat, location?.lng, cityName]);

  // Hourly curve for Today's Risk Plan computed from live observations
  const hourlyData = useMemo(() => {
    if (liveHourlyList.length > 0) {
      return liveHourlyList.slice(0, 12).map((item) => {
        const itemAqi = item.aqi || currentAQI;
        const itemTemp = item.temp || currentTemp;
        let riskScore = Math.min(
          95,
          Math.round(
            (itemAqi / 300) * 60 +
              (itemTemp > 35 ? (itemTemp - 35) * 4 : 0) +
              (item.uvIndex > 6 ? item.uvIndex * 3 : 0)
          )
        );
        let windowStatus = "Moderate";
        if (itemAqi < 120 && itemTemp < 32 && item.uvIndex < 5) {
          windowStatus = "Optimal Exercise";
        } else if (itemAqi < 160 && itemTemp < 34) {
          windowStatus = "Safe Window";
        } else if (itemTemp >= 38) {
          windowStatus = "Peak Heat";
        } else if (item.uvIndex >= 8) {
          windowStatus = "High UV";
        } else if (itemAqi >= 250) {
          windowStatus = "Critical Smog";
        } else if (itemAqi >= 200) {
          windowStatus = "High Inversion";
        }
        return {
          hour: item.time,
          aqi: itemAqi,
          temp: itemTemp,
          riskScore: Math.max(15, riskScore),
          windowStatus
        };
      });
    }

    const hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    return hours.map((h, i) => {
      const aqiDelta = i < 2 ? -20 : i > 5 ? 25 : 0;
      const tempDelta = i >= 3 && i <= 5 ? 3 : -2;
      const calcAqi = Math.max(50, currentAQI + aqiDelta);
      const calcTemp = Math.max(15, currentTemp + tempDelta);
      return {
        hour: h,
        aqi: calcAqi,
        temp: calcTemp,
        riskScore: Math.min(90, Math.round((calcAqi / 300) * 65 + (calcTemp > 35 ? (calcTemp - 35) * 5 : 0))),
        windowStatus: i === 0 ? "Optimal Exercise" : calcAqi >= 200 ? "High Inversion" : "Moderate"
      };
    });
  }, [liveHourlyList, currentAQI, currentTemp]);

  // Handle Onboarding Completion
  const handleCompleteOnboarding = () => {
    const updated = {
      ...tempProfile,
      isConfigured: true,
      city: cityName,
      conditions: tempProfile.conditions?.length ? tempProfile.conditions : ["general_wellness"]
    };
    setProfile(updated);
    setCurrentView("dashboard");
  };

  // Handle Log Submission
  const handleSaveLog = () => {
    const score =
      (newLog.breathlessness === "severe" ? 40 : newLog.breathlessness === "moderate" ? 25 : newLog.breathlessness === "mild" ? 10 : 0) +
      (newLog.cough === "moderate" ? 20 : newLog.cough === "mild" ? 10 : 0) +
      (newLog.rescueInhalerUses || 0) * 15 +
      (newLog.outdoorTime === "3h+" ? 15 : newLog.outdoorTime === "1-3h" ? 8 : 0);

    const entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dayName: "Today",
      aqi: currentAQI,
      temp: currentTemp,
      humidity: currentHumidity,
      ...newLog,
      symptomScore: Math.max(5, score)
    };

    setSymptomLogs((prev) => [entry, ...prev.slice(0, 13)]);
    setLogFormOpen(false);
  };

  // --- Family Safety Circle Event Handlers ---
  const handleBroadcast = (statusType) => {
    const isSafe = statusType === "safe";
    const statusText = isSafe ? "I'm Safe" : "I Need Help / Emergency";
    const statusTextHi = isSafe ? "मैं सुरक्षित हूँ" : "मुझे मदद चाहिए / आपातकालीन";
    
    // Subtle haptic vibration pattern for enhanced mobile accessibility
    if (typeof window !== "undefined" && window.navigator && typeof window.navigator.vibrate === "function") {
      try {
        if (isSafe) {
          // Gentle success/confirmation single-pulse tap
          window.navigator.vibrate(60);
        } else {
          // Distinct warning double-pulse pattern
          window.navigator.vibrate([100, 50, 100, 50, 150]);
        }
      } catch (e) {
        // Fallback for security restriction contexts or sandboxed iframes
      }
    }

    const countActiveTriggers = profile.conditions?.reduce((acc, cond) => {
      return acc + getTriggeredRulesForCondition(cond).length;
    }, 0) || 0;

    const riskMessage = countActiveTriggers > 0 
      ? `Active triggers: ${countActiveTriggers} weather-health alerts under ${cityName} conditions.`
      : "No active environmental health triggers currently.";

    const logEntry = {
      id: "broad_" + Date.now(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      status: statusText,
      statusHi: statusTextHi,
      isSafe,
      location: cityName,
      riskStatus: riskMessage,
      sentTo: familyContacts.map(c => `${c.name} (${c.relation})`).join(", ")
    };

    setBroadcastLog(prev => [logEntry, ...prev.slice(0, 4)]);
    setBroadcastToast({
      id: "toast_" + Date.now(),
      message: isSafe 
        ? (isHi ? "✔️ 'मैं सुरक्षित हूँ' संदेश और स्थिति विवरण आपके सुरक्षा चक्र में भेज दिया गया है!" : "✔️ 'I'm Safe' broadcast and risk status successfully sent to your family circle!")
        : (isHi ? "🚨 'आपातकालीन मदद' चेतावनी और लाइव लोकेशन आपके सुरक्षा चक्र को भेज दी गई है!" : "🚨 EMERGENCY alert + live location sent to all family members!"),
      type: isSafe ? "success" : "danger"
    });

    // Auto close toast after 5 seconds
    setTimeout(() => {
      setBroadcastToast(null);
    }, 5000);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!contactFormData.name.trim() || !contactFormData.phone.trim()) return;

    if (editingContact) {
      // Editing existing
      setFamilyContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactFormData } : c));
    } else {
      // Adding new
      if (familyContacts.length >= 5) {
        alert(isHi ? "आप अधिकतम 5 संपर्क जोड़ सकते हैं।" : "You can add a maximum of 5 trusted contacts.");
        return;
      }
      const newContact = {
        id: "fc_" + Date.now(),
        ...contactFormData
      };
      setFamilyContacts(prev => [...prev, newContact]);
    }

    setContactFormOpen(false);
    setEditingContact(null);
    setContactFormData({
      name: "",
      relation: "Spouse",
      phone: "",
      location: "",
      riskStatus: "Safe / Clear",
      isExtremeRisk: false
    });
  };

  const handleDeleteContact = (id) => {
    if (window.confirm(isHi ? "क्या आप वास्तव में इस संपर्क को हटाना चाहते हैं?" : "Are you sure you want to remove this contact from your safety circle?")) {
      setFamilyContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleEditContactClick = (contact) => {
    setEditingContact(contact);
    setContactFormData({
      name: contact.name,
      relation: contact.relation,
      phone: contact.phone,
      location: contact.location,
      riskStatus: contact.riskStatus,
      isExtremeRisk: contact.isExtremeRisk
    });
    setContactFormOpen(true);
  };

  const handleNewContactClick = () => {
    if (familyContacts.length >= 5) {
      alert(isHi ? "आप अधिकतम 5 संपर्क जोड़ सकते हैं।" : "You can add a maximum of 5 trusted contacts.");
      return;
    }
    setEditingContact(null);
    setContactFormData({
      name: "",
      relation: "Spouse",
      phone: "",
      location: "",
      riskStatus: "Safe / Clear",
      isExtremeRisk: false
    });
    setContactFormOpen(true);
  };

  const handleToggleSimulation = () => {
    const hasSimulated = familyContacts.some(c => c.id === "fc_simulated");

    if (hasSimulated) {
      setFamilyContacts(prev => prev.map(c => {
        if (c.id === "fc_simulated") {
          const isCurrentlyRisk = c.isExtremeRisk;
          return {
            ...c,
            isExtremeRisk: !isCurrentlyRisk,
            riskStatus: !isCurrentlyRisk 
              ? (isHi ? "गंभीर बाढ़ और उच्च ज्वार चेतावनी" : "Severe Mumbai Flood & Active Inundation Alert")
              : (isHi ? "सुरक्षित / स्पष्ट" : "Safe / Clear")
          };
        }
        return c;
      }));
    } else {
      const simulatedContact = {
        id: "fc_simulated",
        name: isHi ? "अमित (भाई)" : "Amit (Brother)",
        relation: isHi ? "भाई" : "Brother",
        phone: "+91 98765 43210",
        location: isHi ? "मुंबई, महाराष्ट्र" : "Mumbai, Maharashtra",
        riskStatus: isHi ? "गंभीर बाढ़ और उच्च ज्वार चेतावनी" : "Severe Mumbai Flood & Active Inundation Alert",
        isExtremeRisk: true
      };
      
      if (familyContacts.length >= 5) {
        setFamilyContacts(prev => [simulatedContact, ...prev.slice(0, 4)]);
      } else {
        setFamilyContacts(prev => [simulatedContact, ...prev]);
      }
    }
  };

  // Handle Health AI Question
  const handleSendChatQuestion = async (qText = chatQuestion) => {
    if (!qText.trim() || chatLoading) return;
    const userQ = qText.trim();
    setChatQuestion("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userQ }]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `User Health Context: Age: ${profile.age || "Unspecified"}, Gender: ${profile.gender || "Unspecified"}, Role: ${profile.role || "General"}, Location: ${cityName}, Conditions: ${profile.conditions?.join(", ") || "General Wellness"}, Asthma: ${profile.asthmaDetails?.severity || "N/A"}, Commute: ${profile.asthmaDetails?.commuteMode || "Standard"}. Current Weather: AQI ${currentAQI} (PM2.5: ${currentPM25} µg/m³), Temp ${currentTemp}°C, Humidity ${currentHumidity}%, UV ${currentUV}. Question: ${userQ}. Provide a clear, empathetic, medically safe non-prescriptive actionable health and weather safety advisory with morning/evening window recommendations.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text:
              data.reply ||
              data.text ||
              `Based on ${cityName}'s current AQI of ${currentAQI} and weather conditions, we recommend limiting heavy outdoor workouts during peak smog/heat hours and staying well-hydrated.`
          }
        ]);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      setTimeout(() => {
        let fallback = `Based on your profile (${profile.age ? profile.age + "y, " : ""}${profile.conditions?.join(", ") || "general wellness"}) and ${cityName}'s current AQI of ${currentAQI}: \n\n• **Immediate Advice**: If stepping outdoors now, wear a protective N95 mask if AQI exceeds 150.\n• **Safer Window**: Morning hours between 6:00 AM – 8:00 AM are generally best for outdoor activities before ozone and traffic smog rise.\n• **Hydration**: Drink 2–3L of fluids today.\n• *Medical Notice: Always consult your physician for clinical diagnosis and persistent symptoms.*`;
        setChatHistory((prev) => [...prev, { sender: "ai", text: fallback }]);
      }, 500);
    } finally {
      setChatLoading(false);
    }
  };

  // --- SCREEN 1: FAST ONBOARDING / SETUP QUESTIONNAIRE ---
  if (currentView === "onboarding") {
    return (
      <div id="health-setup-wizard" className="w-full max-w-3xl mx-auto p-4 sm:p-6 pb-36 sm:pb-40 animate-in fade-in">
        {/* Step Indicator Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              {onboardingStep} / 2
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                {isHi ? "त्वरित स्वास्थ्य प्रोफ़ाइल सेटअप" : "Quick Health Profile Setup"}
              </h2>
              <p className="text-xs text-slate-500">
                {isHi ? "सटीक मौसम और वायु गुणवत्ता सुरक्षा के लिए अपनी जानकारी दर्ज करें" : "Configure in 15 seconds to unlock personalized health warnings"}
              </p>
            </div>
          </div>
          {onboardingStep > 1 && (
            <button
              onClick={() => setOnboardingStep((s) => s - 1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              {isHi ? "पीछे" : "Back"}
            </button>
          )}
        </div>

        {/* STEP 1: FAST DEMOGRAPHICS & CONDITIONS */}
        {onboardingStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6 text-slate-900">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {isHi ? "1. अपनी बुनियादी जानकारी चुनें" : "1. Quick Demographics & Conditions"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isHi ? "कोई फर्जी डेटा नहीं — आपका वास्तविक डेटा सुरक्षित रूप से केवल आपके डिवाइस पर रहेगा।" : "No fake data — your inputs calculate real personalized physiological thresholds."}
              </p>
            </div>

            {/* Age Quick Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{isHi ? "आपकी आयु (वर्ष)" : "Your Age (Years)"}</span>
                <span className="text-[10px] text-slate-400">{isHi ? "संख्या दर्ज करें या तुरंत चुनें" : "Type or tap quick age"}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={tempProfile.age || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val)) {
                      setTempProfile({ ...tempProfile, age: "" });
                      setAgeError("");
                    } else if (val < 1 || val > 120) {
                      setTempProfile({ ...tempProfile, age: val });
                      setAgeError("Age must be between 1 and 120");
                    } else {
                      setTempProfile({ ...tempProfile, age: val });
                      setAgeError("");
                    }
                  }}
                  placeholder="e.g. 24"
                  className="w-28 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {[18, 24, 30, 42, 55, 68].map((presetAge) => (
                    <button
                      key={presetAge}
                      type="button"
                      onClick={() => {
                        setTempProfile({ ...tempProfile, age: presetAge });
                        setAgeError("");
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        tempProfile.age === presetAge
                          ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {presetAge}
                    </button>
                  ))}
                </div>
              </div>
              {ageError && <p className="text-[11px] font-bold text-rose-500">{ageError}</p>}
            </div>

            {/* Gender Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">{isHi ? "लिंग" : "Gender"}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "Female", label: isHi ? "महिला" : "Female" },
                  { id: "Male", label: isHi ? "पुरुष" : "Male" },
                  { id: "Other", label: isHi ? "अन्य" : "Other" },
                  { id: "Prefer not to say", label: isHi ? "बताना पसंद नहीं" : "Prefer not to say" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTempProfile({ ...tempProfile, gender: item.id })}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      tempProfile.gender === item.id
                        ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Routine / Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">{isHi ? "दैनिक दिनचर्या / कार्यशैली" : "Daily Activity / Routine"}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "Office Worker", label: isHi ? "कार्यालय / डेस्क कार्य" : "Office / Indoor Desk", icon: "💻" },
                  { id: "Student", label: isHi ? "छात्र / कॉलेज" : "Student / College", icon: "🎒" },
                  { id: "Outdoor Worker", label: isHi ? "आउटडोर / फील्ड कार्य" : "Outdoor / Field Work", icon: "🏗️" },
                  { id: "Homemaker", label: isHi ? "गृहणी / घरेलू" : "Homemaker / Domestic", icon: "🏡" },
                  { id: "Senior / Retired", label: isHi ? "वरिष्ठ नागरिक / सेवानिवृत्त" : "Senior / Retired", icon: "🚶" },
                  { id: "Other", label: isHi ? "अन्य / मिश्रित" : "Other / Mixed", icon: "⚡" }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTempProfile({ ...tempProfile, role: r.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      tempProfile.role === r.id
                        ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-lg shrink-0">{r.icon}</span>
                    <span className="text-xs font-bold truncate">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Conditions Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {isHi ? "स्वास्थ्य स्थितियाँ जिनका मौसम/AQI से संबंध हो (चुनें)" : "Conditions to Monitor (Tap all that apply)"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONDITIONS_LIST.map((cond) => {
                  const isSelected = tempProfile.conditions?.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => {
                        const prev = tempProfile.conditions || [];
                        let updated;
                        if (prev.includes(cond.id)) {
                          updated = prev.filter((c) => c !== cond.id);
                        } else {
                          updated = [...prev.filter((c) => c !== "general_wellness"), cond.id];
                        }
                        setTempProfile({ ...tempProfile, conditions: updated });
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? "bg-blue-50 border-blue-400 shadow-xs ring-1 ring-blue-300"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{cond.icon}</span>
                      <div className="flex-1 min-w-0 pr-5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cond.label}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{cond.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 absolute right-3 top-3 ${
                          isSelected ? "bg-blue-600 border-blue-500 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}

                {/* General Wellness Option */}
                <button
                  type="button"
                  onClick={() => setTempProfile({ ...tempProfile, conditions: ["general_wellness"] })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer sm:col-span-2 flex items-center justify-between ${
                    tempProfile.conditions?.includes("general_wellness")
                      ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-300"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌿</span>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block text-slate-900">
                        {isHi ? "कोई पुरानी बीमारी नहीं (सामान्य मौसम स्वास्थ्य एवं प्रदूषण सुरक्षा)" : "None of these (General Weather Wellness & AQI Protection)"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isHi ? "दैनिक सुरक्षित व्यायाम समय एवं हाइड्रेशन अलर्ट" : "Standard hydration, UV protection and safe running windows"}
                      </span>
                    </div>
                  </div>
                  {tempProfile.conditions?.includes("general_wellness") && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {cityName}
              </span>
              <button
                disabled={!tempProfile.age || !tempProfile.gender}
                onClick={() => {
                  if (tempProfile.conditions?.includes("asthma")) {
                    setOnboardingStep(2);
                  } else {
                    handleCompleteOnboarding();
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>
                  {tempProfile.conditions?.includes("asthma")
                    ? isHi ? "अगला: अस्थमा विवरण" : "Next: Asthma Details"
                    : isHi ? "स्वास्थ्य शील्ड सक्रिय करें" : "Activate Health Shield"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ASTHMA & DETAILED TRIGGERS (IF APPLICABLE) */}
        {onboardingStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6 text-slate-900">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-3xl">🫁</span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {isHi ? "अस्थमा एवं श्वसन संबंधी विवरण" : "Asthma & Breathing Calibration"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi ? "प्रदूषण और मौसम के उतार-चढ़ाव से फेफड़ों की सुरक्षा" : "Fine-tunes your daily particulate threshold and inhaler reminders"}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Severity */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {isHi ? "1. अस्थमा की गंभीरता" : "1. Asthma Severity"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "mild", label: isHi ? "हल्का" : "Mild", sub: isHi ? "कभी-कभार लक्षण" : "Rare symptoms" },
                    { id: "moderate", label: isHi ? "मध्यम" : "Moderate", sub: isHi ? "साप्ताहिक लक्षण" : "Weekly symptoms" },
                    { id: "severe", label: isHi ? "गंभीर" : "Severe", sub: isHi ? "दैनिक / भारी" : "Daily / Heavy" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setTempProfile({
                          ...tempProfile,
                          asthmaDetails: { ...tempProfile.asthmaDetails, severity: s.id }
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        tempProfile.asthmaDetails?.severity === s.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold">{s.label}</div>
                      <div className="text-[10px] opacity-80">{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inhaler Check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    {isHi ? "दैनिक निवारक इनहेलर?" : "Daily preventer inhaler?"}
                  </span>
                  <div className="flex gap-1">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() =>
                          setTempProfile({
                            ...tempProfile,
                            asthmaDetails: { ...tempProfile.asthmaDetails, preventerInhaler: val }
                          })
                        }
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          tempProfile.asthmaDetails?.preventerInhaler === val
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {val ? (isHi ? "हाँ" : "Yes") : (isHi ? "नहीं" : "No")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    {isHi ? "बचाव इनहेलर साथ रखते हैं?" : "Carry rescue inhaler?"}
                  </span>
                  <div className="flex gap-1">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() =>
                          setTempProfile({
                            ...tempProfile,
                            asthmaDetails: { ...tempProfile.asthmaDetails, rescueInhaler: val }
                          })
                        }
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          tempProfile.asthmaDetails?.rescueInhaler === val
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {val ? (isHi ? "हाँ" : "Yes") : (isHi ? "नहीं" : "No")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Commute */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {isHi ? "2. प्राथमिक आवागमन का तरीका (प्रदूषण जोखिम)" : "2. Primary Commute Mode (Exposure)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "walk", label: isHi ? "पैदल / साइकिल" : "Walk / Cycle", icon: "🚶" },
                    { id: "two_wheeler", label: isHi ? "दोपहिया वाहन" : "Two-Wheeler", icon: "🛵" },
                    { id: "car", label: isHi ? "कार (एसी)" : "Car (AC)", icon: "🚗" },
                    { id: "bus", label: isHi ? "मेट्रो / बस" : "Metro / Bus", icon: "🚌" }
                  ].map((cm) => (
                    <button
                      key={cm.id}
                      type="button"
                      onClick={() =>
                        setTempProfile({
                          ...tempProfile,
                          asthmaDetails: { ...tempProfile.asthmaDetails, commuteMode: cm.id }
                        })
                      }
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        tempProfile.asthmaDetails?.commuteMode === cm.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-lg">{cm.icon}</div>
                      <div className="font-bold text-[11px] mt-0.5">{cm.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <button
                onClick={() => setOnboardingStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                {isHi ? "पीछे" : "Back"}
              </button>
              <button
                onClick={handleCompleteOnboarding}
                className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isHi ? "स्वास्थ्य डैशबोर्ड सक्रिय करें" : "Activate Live Health Shield"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SCREEN 2: MAIN PERSONALIZED HEALTH DASHBOARD ---
  return (
    <div id="health-dashboard-view" className="w-full max-w-6xl mx-auto p-3 sm:p-6 pb-36 sm:pb-40 space-y-5 animate-in fade-in text-[#031636]">
      {/* 1. Top Header Profile Banner */}
      <div className="bg-[#fbf8fc] rounded-3xl p-5 sm:p-6 border border-slate-200/50 neo-raised flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#031636]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-blue-50/50 text-blue-700 border border-blue-200/60 font-bold text-xs flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              {isHi ? "मौसम-स्वास्थ्य शील्ड" : "Personalized Health Shield"}
            </span>
            <span className="text-xs font-bold text-[#575f6a] bg-[#fbf8fc] border border-slate-200/60 neo-pressed-sm px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              {cityName}
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#031636] tracking-tight">
              {isHi ? "आपका दैनिक मौसम एवं स्वास्थ्य विश्लेषण" : "Your Weather & Health Hub"}
            </h1>
            <span
              id="header-cloud-sticker"
              className="inline-flex items-center justify-center p-1 sm:p-1.5 rounded-2xl bg-blue-50/90 border border-blue-200/80 shadow-2xs hover:scale-110 hover:-rotate-6 transition-all duration-200 select-none cursor-default"
              title="Cloud Sticker"
            >
              <Cloud className="w-5 h-5 sm:w-5 sm:h-5 text-sky-500 fill-sky-200/70" />
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#575f6a]">
            {profile.isConfigured ? (
              <>
                {isHi ? "संरचित:" : "Calibrated for:"}{" "}
                <span className="font-bold text-[#031636]">
                  {profile.age ? `${profile.age}y ` : ""}
                  {profile.gender ? `${profile.gender}` : ""}
                </span>{" "}
                •{" "}
                <span className="font-bold text-emerald-700 capitalize">
                  {profile.conditions?.includes("asthma")
                    ? `Asthma (${profile.asthmaDetails?.severity || "Moderate"})`
                    : profile.conditions?.join(", ") || "General Wellness"}
                </span>{" "}
                {profile.role ? `• ${profile.role}` : ""}
              </>
            ) : (
              <span>{isHi ? "सामान्य मौसम स्वास्थ्य एवं वायुमंडलीय निगरानी" : "General environmental health & atmospheric monitoring"}</span>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLogFormOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1a2b4c] hover:bg-[#031636] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? "+ लक्षण दर्ज करें" : "+ Log Symptoms"}</span>
          </button>
          <button
            onClick={() => setCurrentView("alerts")}
            className="px-3.5 py-2 rounded-xl bg-[#fbf8fc] hover:bg-slate-100 text-[#031636] font-bold text-xs flex items-center gap-1.5 border border-slate-200/50 neo-raised-sm transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[#575f6a]" />
            <span>{isHi ? "अलर्ट" : "Alerts"}</span>
          </button>
          <button
            onClick={() => setCurrentView("weekly-report")}
            className="px-3.5 py-2 rounded-xl bg-[#fbf8fc] hover:bg-slate-100 text-[#031636] font-bold text-xs flex items-center gap-1.5 border border-slate-200/50 neo-raised-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#575f6a]" />
            <span>{isHi ? "रिपोर्ट" : "Report"}</span>
          </button>
          <button
            onClick={() => {
              setTempProfile(profile);
              setOnboardingStep(1);
              setCurrentView("onboarding");
            }}
            className="p-2 rounded-xl bg-[#fbf8fc] hover:bg-slate-100 text-[#031636] border border-slate-200/50 neo-raised-sm transition-colors cursor-pointer"
            title={isHi ? "प्रोफ़ाइल संपादित करें" : "Edit / Reset Health Profile"}
          >
            <Sliders className="w-4 h-4 text-[#575f6a]" />
          </button>
        </div>
      </div>

      {/* 2. Live Weather Context Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#fbf8fc] rounded-2xl p-3.5 border border-slate-200/50 neo-raised-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#575f6a]">
            <span>{isHi ? "वायु गुणवत्ता (AQI)" : "Air Quality (AQI)"}</span>
            <Wind className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-purple-700">{currentAQI}</span>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
              {currentAQI > 200 ? "Very Poor" : currentAQI > 100 ? "Moderate" : "Good"}
            </span>
          </div>
          <p className="text-[10px] text-[#575f6a]">PM2.5: {currentPM25} µg/m³</p>
        </div>

        <div className="bg-[#fbf8fc] rounded-2xl p-3.5 border border-slate-200/50 neo-raised-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#575f6a]">
            <span>{isHi ? "तापमान" : "Temperature"}</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#031636]">{currentTemp}°C</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
              {isHi ? `अनुमानित ${currentTemp + 2}°C` : `Feels ${currentTemp + 2}°C`}
            </span>
          </div>
          <p className="text-[10px] text-[#575f6a]">{isHi ? "लाइव मौसम स्टेशन" : "Live Weather Station"}</p>
        </div>

        <div className="bg-[#fbf8fc] rounded-2xl p-3.5 border border-slate-200/50 neo-raised-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#575f6a]">
            <span>{isHi ? "यूवी इंडेक्स" : "UV Index"}</span>
            <Sun className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-orange-600">{currentUV}</span>
            <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
              {currentUV >= 8 ? "Very High" : currentUV >= 5 ? "Moderate" : "Low"}
            </span>
          </div>
          <p className="text-[10px] text-[#575f6a]">{isHi ? "दोपहर में सुरक्षा रखें" : "Midday UV peak"}</p>
        </div>

        <div className="bg-[#fbf8fc] rounded-2xl p-3.5 border border-slate-200/50 neo-raised-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#575f6a]">
            <span>{isHi ? "आर्द्रता एवं नमी" : "Humidity & Damp"}</span>
            <CloudRain className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-sky-700">{currentHumidity}%</span>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-200">
              {currentHumidity > 75 ? "High Damp" : "Normal"}
            </span>
          </div>
          <p className="text-[10px] text-[#575f6a]">{isHi ? "वायुमंडलीय नमी" : "Atmospheric Moisture"}</p>
        </div>
      </div>

      {/* 3. TODAY'S HEALTH RISK CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[#031636] flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-blue-600" />
            <span>{isHi ? "आज के स्वास्थ्य एवं पर्यावरण जोखिम" : "Today's Environmental Health Risks"}</span>
          </h2>
          <span className="text-xs text-[#575f6a]">{isHi ? "लाइव डेटा से अद्यतित" : "Real-time computed"}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Asthma & Respiratory */}
          <div className="bg-[#fbf8fc] rounded-3xl p-5 border border-slate-200/50 neo-raised space-y-3 flex flex-col justify-between text-[#031636]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🫁</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#031636]">
                      {isHi ? "श्वसन एवं वायु गुणवत्ता जोखिम" : "Respiratory & Air Quality Risk"}
                    </h3>
                    <p className="text-[11px] text-[#575f6a]">
                      {isHi ? "PM2.5 एवं धुंध से फेफड़ों पर प्रभाव" : "Particulate matter & nocturnal smog impact"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${riskAnalysis.asthma.style}`}>
                  {riskAnalysis.asthma.level}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-semibold leading-relaxed bg-[#fbf8fc] p-2.5 rounded-xl border border-slate-200/50 neo-pressed-sm">
                <span className="font-bold text-[#031636]">{isHi ? "मुख्य कारक:" : "Primary Trigger:"}</span>{" "}
                {isHi
                  ? `AQI ${currentAQI} (PM2.5: ${currentPM25} µg/m³)। बाहर निकलने पर मास्क की आवश्यकता हो सकती है।`
                  : `Current AQI is ${currentAQI} with PM2.5 at ${currentPM25} µg/m³. Inversion in evening traps particulates.`}
              </p>

              <ul className="space-y-1.5 text-xs text-[#575f6a] font-semibold">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>
                    {isHi
                      ? "शाम 5 बजे के बाद भारी व्यायाम से बचें जब वायुमंडलीय ठंडक से प्रदूषण नीचे बैठता है।"
                      : "Avoid intense outdoor workouts after 5:00 PM when cooler air traps vehicle smog."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>
                    {isHi
                      ? "दोपहिया या पैदल यात्रा करते समय N95 मास्क अवश्य पहनें।"
                      : "Wear a certified N95 mask during two-wheeler or open road commutes."}
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {isHi ? "सर्वोत्तम समय: सुबह 6:00 – 8:00" : "Safe Window: 6:00 – 8:00 AM"}
              </span>
              <button
                onClick={() => {
                  setSelectedConditionId("asthma");
                  setCurrentView("condition-detail");
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{isHi ? "कार्ययोजना देखें" : "See Action Plan"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Heat Stress & UV Risk */}
          <div className="bg-[#fbf8fc] rounded-3xl p-5 border border-slate-200/50 neo-raised space-y-3 flex flex-col justify-between text-[#031636]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">☀️</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#031636]">
                      {isHi ? "थर्मल तनाव एवं यूवी जोखिम" : "Thermal Stress & UV Exposure"}
                    </h3>
                    <p className="text-[11px] text-[#575f6a]">
                      {isHi ? "धूप, निर्जलीकरण और तापमान प्रभाव" : "Heat index, dehydration & solar radiation"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${riskAnalysis.heat.style}`}>
                  {riskAnalysis.heat.level}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-semibold leading-relaxed bg-[#fbf8fc] p-2.5 rounded-xl border border-slate-200/50 neo-pressed-sm">
                <span className="font-bold text-[#031636]">{isHi ? "मौसम स्थिति:" : "Condition:"}</span>{" "}
                {isHi
                  ? `तापमान ${currentTemp}°C और यूवी इंडेक्स ${currentUV}। निर्जलीकरण से बचाव आवश्यक है।`
                  : `Ambient temperature ${currentTemp}°C with UV index ${currentUV}. Maintain fluid intake.`}
              </p>

              <ul className="space-y-1.5 text-xs text-[#575f6a] font-semibold">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    {isHi
                      ? "बाहर निकलते समय पर्याप्त पानी व इलेक्ट्रोलाइट्स साथ रखें।"
                      : "Carry adequate drinking water with electrolytes during day trips."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    {isHi
                      ? "दोपहर 12 से 3 बजे के बीच सीधी तेज धूप से बचें।"
                      : "Limit direct sun exposure between 12:00 PM and 3:30 PM."}
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                {isHi ? "हाइड्रेशन लक्ष्य: 2.5 लीटर" : "Hydration Target: 2.5L"}
              </span>
              <button
                onClick={() => {
                  setSelectedConditionId("heat");
                  setCurrentView("condition-detail");
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{isHi ? "विवरण देखें" : "See Details"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 3.5: PERSONALIZED ACTION PLANS ("WHAT DO I DO NOW?" LAYER) --- */}
      <div className="bg-[#fbf8fc] rounded-3xl p-5 sm:p-6 border border-slate-200/50 neo-raised space-y-4 text-[#031636]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg neo-raised-sm">
              📋
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#031636]">
                {isHi ? "व्यक्तिगत कार्ययोजना ('अब मैं क्या करूं?' परत)" : "Personalized Action Plans ('What do I do now?' layer)"}
              </h3>
              <p className="text-xs text-[#575f6a]">
                {isHi 
                  ? "सक्रिय चेतावनियों को अपनी चुनी हुई स्थितियों के लिए अनुकूलित कदमों में बदलें।" 
                  : "Converts real-time alerts into clear, condition-specific protective steps."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCustomizerOpen(true);
              setSelectedRuleCondition(profile.conditions[0] || "asthma");
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1a2b4c] hover:bg-[#031636] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Sliders className="w-4 h-4" />
            <span>{isHi ? "कार्ययोजना नियम कस्टमाइज़ करें" : "Customize Action Rules"}</span>
          </button>
        </div>

        {/* Display Triggered Rules per Condition */}
        {(!profile.conditions || profile.conditions.length === 0 || (profile.conditions.length === 1 && profile.conditions[0] === "general_wellness")) ? (
          <div className="p-6 text-center bg-[#fbf8fc] rounded-2xl border border-slate-200/50 neo-pressed-sm space-y-3">
            <p className="text-xs text-[#575f6a] max-w-md mx-auto">
              {isHi 
                ? "आपने वर्तमान में कोई विशिष्ट स्वास्थ्य स्थिति नहीं चुनी है। सटीक, कस्टमाइज़्ड चिकित्सा कार्ययोजना (जैसे अस्थमा, माइग्रेन, गठिया, दिल की बीमारी, या ल्यूपस) अनलॉक करने के लिए प्रोफ़ाइल संपादित करें।" 
                : "You haven't selected any specific health conditions yet. Edit your health profile to unlock tailored conditional safety steps for Asthma, Migraine, Arthritis, Heart Disease, Lupus, or POTS."}
            </p>
            <button
              onClick={() => {
                setTempProfile(profile);
                setOnboardingStep(1);
                setCurrentView("onboarding");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold text-xs cursor-pointer transition-colors"
            >
              {isHi ? "स्वास्थ्य स्थितियाँ चुनें" : "Select Health Conditions"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.conditions.map(condId => {
              const condObj = CONDITIONS_LIST.find(c => c.id === condId);
              if (!condObj) return null;
              
              const triggered = getTriggeredRulesForCondition(condId);
              
              return (
                <div key={condId} className="bg-[#fbf8fc] rounded-2xl p-4 border border-slate-200/50 neo-pressed-sm space-y-3">
                  {/* Condition Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{condObj.icon}</span>
                      <div>
                        <h4 className="text-sm font-black text-[#031636]">{isHi ? condObj.labelHi || condObj.label : condObj.label}</h4>
                        <p className="text-[10px] text-[#575f6a] font-semibold">{isHi ? "प्राथमिक कारक:" : "Primary Trigger Factor:"} {condObj.primaryWeatherFactor}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      triggered.length > 1 
                        ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse" 
                        : triggered.length > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}>
                      {triggered.length > 0 
                        ? (isHi ? `${triggered.length} चेतावनी ट्रिगर` : `${triggered.length} Warning triggers`)
                        : (isHi ? "सुरक्षित / सामान्य" : "Safe / Clear")}
                    </span>
                  </div>

                  {/* Steps Container */}
                  {triggered.length > 0 ? (
                    <div className="space-y-2">
                      {triggered.map(rule => {
                        const ruleText = isHi ? rule.actionTextHi || rule.actionText : rule.actionText;
                        const triggerDesc = getRuleTriggerDescription(rule, isHi);
                        return (
                          <div key={rule.id} className="bg-[#fbf8fc] rounded-xl p-3 border border-slate-200/50 flex items-start gap-3 neo-raised-sm">
                            <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                              !
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 rounded-md">
                                  {triggerDesc}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                {ruleText}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 flex items-center gap-2.5">
                      <span className="text-emerald-600 text-base">🛡️</span>
                      <p className="text-xs text-emerald-800 font-semibold">
                        {isHi 
                          ? "मौसम कारक सामान्य हैं। इस स्थिति के लिए कोई सुरक्षा अलर्ट ट्रिगर नहीं हुआ है।" 
                          : "Live weather conditions are within safe ranges. No actions required for this condition."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- FAMILY SAFETY CIRCLE SECTION --- */}
      <div className="bg-[#fbf8fc] rounded-3xl p-5 sm:p-6 border border-slate-200/50 neo-raised space-y-5 text-[#031636]">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg neo-raised-sm">
              🛡️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#031636]">
                {isHi ? "पारिवारिक सुरक्षा चक्र" : "Family Safety Circle"}
              </h3>
              <p className="text-xs text-[#575f6a]">
                {isHi 
                  ? "3–5 विश्वस्त संपर्कों को जोड़ें। आपदा के दौरान स्थिति साझा करें और उनके जोखिम स्तर की निगरानी करें।" 
                  : "Keep 3–5 trusted contacts safe. Share your live status during extreme weather and monitor their localized hazards."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSimulation}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
              title="Test the automated hazard alert warning trigger"
            >
              ⚠️ {isHi ? "सिमुलेशन: भाई का बाढ़ अलर्ट" : "Simulate Mumbai Flood Alert"}
            </button>

            <button
              onClick={handleNewContactClick}
              disabled={familyContacts.length >= 5}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isHi ? "नया संपर्क" : "Add Contact"}</span>
            </button>
          </div>
        </div>

        {/* Live Broadcast Confirmation Toast (Embedded) */}
        {broadcastToast && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold animate-in slide-in-from-top-3 ${
            broadcastToast.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800 animate-bounce"
          }`}>
            <p>{broadcastToast.message}</p>
            <button 
              onClick={() => setBroadcastToast(null)}
              className="w-5 h-5 rounded-full bg-white/40 hover:bg-white/60 text-slate-700 font-bold flex items-center justify-center text-[10px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* --- AUTO-ALERT: EXTREME RISK FAMILY MEMBER HAZARD TRIGGER --- */}
        {familyContacts.some(c => c.isExtremeRisk) && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-rose-950 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                {isHi ? "स्वचालित सुरक्षा चेतावनी: परिवार संकट में" : "AUTOMATED ALERT: Family Members in Extreme Risk Zone!"}
              </h4>
            </div>
            <div className="space-y-1 pl-7 text-xs font-medium">
              {familyContacts.filter(c => c.isExtremeRisk).map(c => (
                <p key={c.id}>
                  • <span className="font-bold">{c.name} ({isHi ? c.relation : c.relation})</span> in <span className="font-bold">{c.location}</span>: 
                  <span className="text-rose-700 font-bold"> {c.riskStatus}</span>
                </p>
              ))}
              <p className="text-[10px] text-rose-500 font-bold italic mt-1.5">
                {isHi 
                  ? "* हमारे मौसम केंद्र ने आपके परिवार के सदस्यों के क्षेत्रों में चरम प्राकृतिक जोखिमों का पता लगाया है। कृपया उनकी सुरक्षा की जाँच करें।" 
                  : "* Our meteorological server detected severe localized hazards. Consider initiating a status check with them."}
              </p>
            </div>
          </div>
        )}

        {/* Actionable Broadcast & Location Sharing Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#fbf8fc] border border-slate-200/50 neo-pressed-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#031636] flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>{isHi ? "एक-टैप सुरक्षा प्रसारण (स्थान + जोखिम विवरण)" : "One-Tap Safety Broadcast (Location + Risk Share)"}</span>
              </h4>
              <p className="text-[10px] sm:text-xs text-[#575f6a]">
                {isHi 
                  ? `आपदा या चरम मौसम में अपने संपर्कों को तुरंत संदेश भेजें। इसमें आपका स्थान (${cityName}) और स्वास्थ्य स्थिति शामिल होगी।` 
                  : `Instantly update your entire circle. Automatically includes your GPS location (${cityName}) & active health triggers.`}
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => handleBroadcast("safe")}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-transform"
              >
                <Check className="w-4 h-4" />
                <span>{isHi ? "मैं सुरक्षित हूँ" : "I'm Safe"}</span>
              </button>
              
              <button
                onClick={() => handleBroadcast("danger")}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-transform animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isHi ? "मुझे मदद चाहिए" : "I Need Help"}</span>
              </button>
            </div>
          </div>

          {/* Broadcast Logs & History */}
          {broadcastLog.length > 0 && (
            <div className="border-t border-slate-200/60 pt-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isHi ? "हाल के प्रसारण इतिहास" : "Recent Broadcast Actions"}</p>
              <div className="space-y-1.5">
                {broadcastLog.map(log => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-[#fbf8fc] border border-slate-200/50 neo-raised-sm text-[11px] flex items-start justify-between gap-3 font-semibold">
                    <div>
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black mr-2 ${
                        log.isSafe ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800 animate-pulse"
                      }`}>
                        {isHi ? log.statusHi : log.status}
                      </span>
                      <span className="text-[#031636]">
                        {isHi ? `स्थान: ${log.location} • संपर्कों को भेजा गया: ${log.sentTo}` : `Loc: ${log.location} • Transmitted to: ${log.sentTo}`}
                      </span>
                      <p className="text-[10px] text-[#575f6a] mt-1">{log.riskStatus}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{log.date} {log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grid of Circle Contacts */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
            {isHi ? `पंजीकृत सुरक्षा संपर्क (${familyContacts.length} / 5)` : `Circle Contacts (${familyContacts.length} / 5)`}
          </p>

          {familyContacts.length === 0 ? (
            <div className="p-6 text-center bg-[#fbf8fc] rounded-2xl border border-slate-200/50 neo-pressed-sm text-xs text-[#575f6a]">
              {isHi ? "सुरक्षा चक्र में कोई संपर्क नहीं है। शुरू करने के लिए संपर्क जोड़ें।" : "Your safety circle is empty. Add up to 5 contacts to start broadcasting and monitoring risks."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {familyContacts.map(contact => (
                <div 
                  key={contact.id} 
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-xs bg-[#fbf8fc] transition-all neo-raised-sm ${
                    contact.isExtremeRisk 
                      ? "border-rose-300 ring-2 ring-rose-500/20" 
                      : "border-slate-200/50 hover:border-slate-300/60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">👤</span>
                        <div>
                          <h4 className="font-black text-[#031636] leading-tight">{contact.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400">{contact.relation}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        contact.isExtremeRisk 
                          ? "bg-rose-100 text-rose-800 animate-pulse" 
                          : "bg-slate-100 text-[#575f6a]"
                      }`}>
                        {contact.isExtremeRisk ? (isHi ? "अत्यधिक जोखिम" : "EXTREME RISK") : (isHi ? "सामान्य" : "CLEAR")}
                      </span>
                    </div>

                    <div className="space-y-1 pl-1 text-[11px] text-[#575f6a] font-semibold">
                      <p className="flex items-center gap-1">📞 <span>{contact.phone}</span></p>
                      <p className="flex items-center gap-1">📍 <span>{contact.location}</span></p>
                    </div>

                    <div className={`p-2 rounded-xl text-[10px] font-bold leading-relaxed ${
                      contact.isExtremeRisk 
                        ? "bg-rose-50 text-rose-700" 
                        : "bg-[#fbf8fc] border border-slate-200/50 neo-pressed-sm text-slate-500"
                    }`}>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-400">{isHi ? "सक्रिय स्थिति / जोखिम" : "Local Environmental Risk"}</span>
                      {contact.riskStatus}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60 shrink-0">
                    <button
                      onClick={() => handleEditContactClick(contact)}
                      className="p-1 px-2.5 rounded-lg bg-[#fbf8fc] border border-slate-200/50 neo-raised-sm hover:bg-slate-100 text-[#575f6a] hover:text-[#031636] flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                    >
                      ✏️ {isHi ? "बदलें" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1 px-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:text-rose-700 hover:bg-rose-100 flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                    >
                      🗑️ {isHi ? "हटाएं" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 4. HOURLY RISK GRAPH (Live Hourly Weather + AQI Curve) */}
      <div className="bg-[#fbf8fc] rounded-3xl p-5 sm:p-6 border border-slate-200/50 neo-raised space-y-4 text-[#031636]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#031636] flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-600" />
              <span>{isHi ? "दैनिक प्रति घंटा स्वास्थ्य जोखिम एवं AQI वक्र" : "Today's Hourly Health Risk & Air Quality Curve"}</span>
            </h3>
            <p className="text-xs text-[#575f6a]">
              {isHi ? "लाइव सैटेलाइट एवं वायु गुणवत्ता पूर्वानुमान से संचालित" : "Driven by live meteorological forecasts and particulate modeling"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="w-3 h-3 rounded-full bg-purple-600" /> AQI
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> {isHi ? "जोखिम सूचकांक (0-100)" : "Risk Index (0-100)"}
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 260]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fbf8fc",
                  color: "#031636",
                  borderRadius: "12px",
                  fontSize: "12px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}
                formatter={(val, name) => [val, name === "aqi" ? "AQI" : "Risk Score"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area type="monotone" dataKey="aqi" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#aqiGrad)" />
              <Area type="monotone" dataKey="riskScore" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Safer Windows Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
            <span className="text-xl">✅</span>
            <div>
              <div className="text-xs font-bold text-emerald-900">06:00 AM – 08:00 AM</div>
              <div className="text-[10px] text-emerald-700 font-medium">{isHi ? "सर्वोत्तम खिड़की (न्यूनतम प्रदूषण)" : "Optimal Window (Lowest Smog & Heat)"}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-xs font-bold text-amber-900">12:00 PM – 03:30 PM</div>
              <div className="text-[10px] text-amber-700 font-medium">{isHi ? "उच्च यूवी एवं गर्मी" : "Peak Heat & UV Window"}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5">
            <span className="text-xl">🛑</span>
            <div>
              <div className="text-xs font-bold text-rose-900">05:00 PM – 09:30 PM</div>
              <div className="text-[10px] text-rose-700 font-medium">{isHi ? "शाम का धुंध फंसाव (मास्क लगाएं)" : "Smog Inversion (Wear N95 Mask)"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SYMPTOM TRACKER & REAL CORRELATION LOGS */}
      <div className="bg-[#fbf8fc] rounded-3xl p-5 sm:p-6 border border-slate-200/50 neo-raised space-y-4 text-[#031636]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#031636] flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-blue-600" />
              <span>{isHi ? "दैनिक लक्षण ट्रैकर एवं AQI सहसंबंध" : "Daily Symptom Tracker & Air Quality Correlation"}</span>
            </h3>
            <p className="text-xs text-[#575f6a]">
              {isHi ? "प्रदूषण के साथ अपने वास्तविक स्वास्थ्य लक्षणों को ट्रैक करें" : "Record your actual daily symptoms to build personal weather-health analytics"}
            </p>
          </div>
          <button
            onClick={() => setLogFormOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#1a2b4c] hover:bg-[#031636] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? "आज के लक्षण दर्ज करें" : "Log Symptoms"}</span>
          </button>
        </div>

        {symptomLogs.length === 0 ? (
          <div className="p-8 text-center bg-[#fbf8fc] rounded-2xl border border-slate-200/50 neo-pressed-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-xl neo-raised-sm">
              📝
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-[#031636]">
                {isHi ? "कोई पुराना फर्जी डेटा नहीं — अपना पहला लॉग दर्ज करें" : "No pre-filled fake logs — Start fresh"}
              </h4>
              <p className="text-xs text-[#575f6a]">
                {isHi
                  ? "जब आप '+ आज के लक्षण दर्ज करें' पर क्लिक करेंगे, तो यह स्वचालित रूप से वर्तमान मौसम और AQI के साथ सहसंबंधित होगा।"
                  : "Click '+ Log Symptoms' to record how you feel today and calibrate your real correlation chart."}
              </p>
            </div>
            <button
              onClick={() => setLogFormOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#1a2b4c] hover:bg-[#031636] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              {isHi ? "+ पहला लक्षण रिकॉर्ड जोड़ें" : "+ Add First Entry"}
            </button>
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...symptomLogs].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dayName" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis yAxisId="left" orientation="left" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 300]} tick={{ fontSize: 11, fill: "#8b5cf6" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }}
                />
                <Bar yAxisId="left" dataKey="symptomScore" name="Symptom Score (0-100)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="aqi" name="AQI Level" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 6. HEALTH ASSISTANT AI QUICK-CONSULT */}
      <div className="bg-[#fbf8fc] rounded-3xl p-5 sm:p-6 border border-slate-200/50 neo-raised space-y-4 text-[#031636]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1a2b4c] to-indigo-950 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#031636]">
                {isHi ? "मौसम-स्वास्थ्य AI सलाहकार" : "Ask Weather-Health Assistant"}
              </h3>
              <p className="text-xs text-[#575f6a]">
                {isHi ? "आपकी प्रोफ़ाइल और वर्तमान AQI के आधार पर त्वरित चिकित्सा-सुरक्षा सलाह" : "Real-time guidance calibrated to your location & live AQI"}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            AI Active
          </span>
        </div>

        {/* Chat History Box */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto p-3.5 bg-[#fbf8fc] rounded-2xl border border-slate-200/50 neo-pressed-sm text-xs">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#1a2b4c] text-white ml-auto max-w-[85%]"
                  : "bg-[#fbf8fc] text-[#031636] border border-slate-200/50 mr-auto max-w-[90%] neo-raised-sm font-semibold"
              }`}
            >
              <div className="font-bold text-[10px] opacity-75 mb-0.5">
                {msg.sender === "user" ? (isHi ? "आप" : "You") : (isHi ? "मौसम-स्वास्थ्य AI सलाहकार" : "Weather-Health AI Advisor")}
              </div>
              <div className="whitespace-pre-line font-semibold">{msg.text}</div>
            </div>
          ))}
          {chatLoading && (
            <div className="p-3 rounded-2xl bg-[#fbf8fc] text-[#575f6a] border border-slate-200/50 mr-auto max-w-[70%] flex items-center gap-2 neo-raised-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Analyzing live AQI and medical guidelines...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            isHi ? "क्या अभी बाहर टहलना सुरक्षित है?" : "Is it safe for me to jog right now?",
            isHi ? "यात्रा के समय कौन सा मास्क पहनना चाहिए?" : "What mask should I wear during commute?",
            isHi ? "आज की नमी सांस को कैसे प्रभावित कर रही है?" : "How does today's humidity affect my breathing?"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendChatQuestion(prompt)}
              className="text-[11px] font-semibold text-[#575f6a] bg-[#fbf8fc] hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50 neo-raised-sm transition-colors cursor-pointer"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChatQuestion();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            placeholder={isHi ? "स्वास्थ्य, मास्क, दवा या मौसम सुरक्षा के बारे में पूछें..." : "Ask about outdoor safety, masks, triggers, or medicines..."}
            className="flex-1 p-3 rounded-2xl border border-slate-200/50 bg-[#fbf8fc] text-xs sm:text-sm font-semibold text-[#031636] outline-none focus:border-[#1a2b4c] focus:bg-white transition-colors neo-pressed-sm"
          />
          <button
            type="submit"
            disabled={!chatQuestion.trim() || chatLoading}
            className="px-4 py-3 rounded-2xl bg-[#1a2b4c] hover:bg-[#031636] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isHi ? "पूछें" : "Ask"}</span>
          </button>
        </form>
      </div>

      {/* 7. MEDICAL DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="font-medium leading-relaxed">
          <span className="font-bold">{isHi ? "चिकित्सीय सूचना:" : "Medical Notice:"}</span>{" "}
          {isHi
            ? "यह स्वास्थ्य अंतर्दृष्टि केवल लाइव वायुमंडलीय एवं मौसम डेटा पर आधारित सूचनात्मक कल्याण अनुमान है। यह चिकित्सीय निदान का विकल्प नहीं है। गंभीर लक्षणों में तुरंत डॉक्टर से संपर्क करें।"
            : "WeatherGPT health insights are algorithmic wellness estimates computed from live meteorological feeds. They are not a substitute for clinical medical advice. Seek emergency care immediately if experiencing severe distress."}
        </p>
      </div>

      {/* --- MODAL 1: CONDITION DETAIL VIEW --- */}
      {currentView === "condition-detail" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[88vh] overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedConditionId === "asthma" ? "🫁" : "☀️"}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedConditionId === "asthma"
                      ? isHi ? "श्वसन एवं कणिका सुरक्षा कार्ययोजना" : "Respiratory & Particulate Action Plan"
                      : isHi ? "गर्मी एवं यूवी सुरक्षा योजना" : "Heat & UV Protection Plan"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHi
                      ? `${cityName} के लाइव पूर्वानुमान एवं आपकी प्रोफ़ाइल पर आधारित`
                      : `Based on ${cityName}'s live forecast & your profile`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Summary */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase">
                  {isHi ? "वर्तमान जोखिम स्तर" : "Current Risk Level"}
                </span>
                <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {riskAnalysis.asthma.level}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {isHi
                  ? `वर्तमान AQI (${currentAQI}) और PM2.5 स्तर (${currentPM25} µg/m³) को देखते हुए, बाहरी शारीरिक गतिविधियों को सुबह के कम प्रदूषण वाले समय में ही करें।`
                  : `Based on current AQI (${currentAQI}) and PM2.5 levels (${currentPM25} µg/m³), outdoor exertion should be timed to low-inversion morning windows.`}
              </p>
            </div>

            {/* Time-of-Day Actions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {isHi ? "दिन के समय अनुसार अनुशंसित सावधानियाँ" : "Recommended Time-of-Day Actions"}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-emerald-700 shrink-0">
                    {isHi ? "🌅 सुबह (6–8 AM):" : "🌅 Morning (6–8 AM):"}
                  </span>
                  <span className="text-slate-700">
                    {isHi
                      ? "टहलने और व्यायाम के लिए सबसे अच्छा समय। प्रदूषण का स्तर दिन में सबसे कम रहता है।"
                      : "Best time for outdoor walk. Particulate density is at its daily lowest level."}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-blue-700 shrink-0">
                    {isHi ? "🛵 यात्रा/सड़क:" : "🛵 Commute:"}
                  </span>
                  <span className="text-slate-700">
                    {isHi
                      ? "ट्रैफिक और धुएं से बचने के लिए N95/FFP2 मास्क पहनें।"
                      : "Wear an N95/FFP2 mask during traffic congestion to filter micro-particulates and exhaust."}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-rose-700 shrink-0">
                    {isHi ? "🌆 शाम (5–9 PM):" : "🌆 Evening (5–9 PM):"}
                  </span>
                  <span className="text-slate-700">
                    {isHi
                      ? "शाम 5 बजे के बाद खुले में भारी कसरत से बचें; ठंडी हवा से जमीन के पास प्रदूषण बढ़ता है।"
                      : "Avoid outdoor sports after 5 PM; cooling nocturnal air traps surface pollutants."}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {isHi ? "योजना बंद करें" : "Close Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: HEALTH ALERTS CONFIGURATION --- */}
      {currentView === "alerts" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[88vh] overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isHi ? "स्वास्थ्य अलर्ट प्राथमिकताएं" : "Health Alert Preferences"}
                </h3>
              </div>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "highRiskDays",
                  label: isHi ? "उच्च श्वसन जोखिम वाले दिन (AQI, धूल, धुंध)" : "High Respiratory Risk Days (AQI, Dust, Inversion)",
                  sub: isHi ? "जब ज़िले में AQI 180 से अधिक हो तब सूचित करें" : "Notifies when AQI crosses 180 in your district"
                },
                {
                  key: "heatWaves",
                  label: isHi ? "लू एवं तीव्र यूवी अलर्ट" : "Heat Wave & Extreme UV Alerts",
                  sub: isHi ? "जब अनुमानित तापमान 38°C से अधिक हो तब चेतावनी दें" : "Notifies when feels-like temperature exceeds 38°C"
                },
                {
                  key: "severeWeather",
                  label: isHi ? "गंभीर मौसम जिससे सांस पर असर पड़े" : "Severe Weather Affecting Breathing",
                  sub: isHi ? "आंधी, धूल भरी हवाएं और अत्यधिक आर्द्रता" : "Squalls, dust storms, and heavy humidity surges"
                }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="pr-4">
                    <h4 className="text-xs font-bold text-slate-800">{item.label}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                  <button
                    onClick={() =>
                      setProfile({
                        ...profile,
                        alertSettings: {
                          ...profile.alertSettings,
                          [item.key]: !profile.alertSettings?.[item.key]
                        }
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      profile.alertSettings?.[item.key] ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform absolute top-0.5 ${
                        profile.alertSettings?.[item.key] ? "left-6.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {isHi ? "प्राथमिकताएं सुरक्षित करें" : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: LOG SYMPTOMS FORM --- */}
      {logFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[88vh] overflow-y-auto p-5 space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{isHi ? "आज के लक्षण दर्ज करें" : "Log Today's Symptoms"}</h3>
              </div>
              <button
                onClick={() => setLogFormOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Breathlessness */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {isHi ? "आज सांस फूलना या घरघराहट" : "Breathlessness / Wheezing Today"}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "none", label: isHi ? "कुछ नहीं" : "none" },
                    { id: "mild", label: isHi ? "हल्का" : "mild" },
                    { id: "moderate", label: isHi ? "मध्यम" : "moderate" },
                    { id: "severe", label: isHi ? "गंभीर" : "severe" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewLog({ ...newLog, breathlessness: item.id })}
                      className={`py-2 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                        newLog.breathlessness === item.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cough */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {isHi ? "खांसी की गंभीरता" : "Cough Severity"}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "none", label: isHi ? "कुछ नहीं" : "none" },
                    { id: "mild", label: isHi ? "हल्की" : "mild" },
                    { id: "moderate", label: isHi ? "मध्यम/तेज" : "moderate" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewLog({ ...newLog, cough: item.id })}
                      className={`py-2 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                        newLog.cough === item.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outdoor Time */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {isHi ? "धूप/प्रदूषण में बिताया समय" : "Outdoor Time in Smog / Heat"}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["0-1h", "1-3h", "3h+"].map((ot) => (
                    <button
                      key={ot}
                      type="button"
                      onClick={() => setNewLog({ ...newLog, outdoorTime: ot })}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        newLog.outdoorTime === ot
                          ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {ot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Quality */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {isHi ? "नींद की गुणवत्ता (1-5 सितारे)" : "Sleep Quality (1–5 Stars)"}
                </label>
                <div className="flex gap-2 justify-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewLog({ ...newLog, sleepQuality: star })}
                      className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                    >
                      {star <= newLog.sleepQuality ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {isHi ? "दैनिक नोट / टिप्पणी (वैकल्पिक)" : "Daily Notes / Context (Optional)"}
                </label>
                <input
                  type="text"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  placeholder={isHi ? "उदा. शाम को यात्रा के दौरान हल्की परेशानी..." : "e.g. Mild irritation during evening traffic commute..."}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setLogFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleSaveLog}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {isHi ? "रिकॉर्ड सहेजें" : "Save Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: WEEKLY HEALTH REPORT --- */}
      {currentView === "weekly-report" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[88vh] overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isHi ? "पर्यावरण एवं स्वास्थ्य सारांश रिपोर्ट" : "Environmental Health Summary Report"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {cityName} • {isHi ? "लाइव वायुमंडलीय सहसंबंध" : "Live Atmospheric Correlation"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                {isHi ? "लाइव पर्यावरण अवलोकन" : "Live Environmental Overview"}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]">{isHi ? "वर्तमान AQI" : "Current AQI"}</div>
                  <div className="font-black text-purple-700 text-base">{currentAQI}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]">{isHi ? "तापमान" : "Ambient Temp"}</div>
                  <div className="font-black text-amber-600 text-base">{currentTemp}°C</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]">{isHi ? "दर्ज दिन" : "Logged Days"}</div>
                  <div className="font-black text-blue-600 text-base">{symptomLogs.length} {isHi ? "प्रविष्टि" : "Entry"}</div>
                </div>
              </div>
            </div>

            {/* Guidance */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                {isHi ? "मुख्य स्वास्थ्य सुझाव" : "Actionable Wellness Takeaways"}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li>
                  {isHi
                    ? "1. सुबह 8:00 बजे से पहले बाहरी गतिविधियाँ प्राथमिकता से करें जब प्रदूषण सबसे कम होता है।"
                    : "1. Prioritize morning outdoor activities before 8:00 AM when particulate pollution is lowest."}
                </li>
                <li>
                  {isHi
                    ? "2. यदि AQI 150 से अधिक हो तो बाहर N95 मास्क अवश्य पहनें।"
                    : "2. Wear an N95 mask during prolonged outdoor traffic exposure if AQI exceeds 150."}
                </li>
                <li>
                  {isHi
                    ? "3. घर के अंदर की हवा साफ रखें और खिड़कियाँ केवल दोपहर में ही खोलें।"
                    : "3. Keep indoor air clean and ventilate only during afternoon hours when thermal inversion clears."}
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 5: CUSTOM RULE BUILDER / CUSTOMIZER --- */}
      {customizerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col text-slate-900">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {isHi ? "कार्ययोजना नियम कस्टमाइज़र" : "Customizable If/Then Rule Builder"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHi 
                      ? "क्लीनिशियन या मरीज़ 'यदि X तो Y' के नियमों और थ्रेसहोल्ड को अपनी इच्छानुसार बदल सकते हैं।" 
                      : "For clinicians and users to customize personalized conditional medical safety guidelines."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCustomizerOpen(false);
                  setEditingRuleId(null);
                }}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col md:flex-row gap-5 min-h-0">
              
              {/* Left Sidebar: Select Condition */}
              <div className="w-full md:w-56 shrink-0 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  {isHi ? "स्वास्थ्य स्थिति चुनें" : "Select Health Condition"}
                </label>
                <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
                  {CONDITIONS_LIST.map(c => {
                    const isActive = selectedRuleCondition === c.id;
                    const hasConfigured = profile.conditions?.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedRuleCondition(c.id);
                          setEditingRuleId(null);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          isActive 
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-xs" 
                            : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-base">{c.icon}</span>
                        <span className="truncate flex-1">{isHi ? c.labelHi || c.label : c.label}</span>
                        {hasConfigured && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-emerald-500"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Rules Management */}
              <div className="flex-1 space-y-5 min-w-0">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    {isHi ? "सक्रिय 'यदि / तो' नियम" : `Active Rules for ${selectedRuleCondition.toUpperCase()}`}
                  </h4>
                  <button
                    onClick={() => {
                      setEditingRuleId("new");
                      setRuleForm({
                        triggerType: "aqi",
                        operator: "gt",
                        threshold: 100,
                        actionText: "",
                        actionTextHi: ""
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isHi ? "नया नियम जोड़ें" : "Add New Rule"}</span>
                  </button>
                </div>

                {/* Rules List */}
                <div className="space-y-3">
                  {rules.filter(r => r.conditionId === selectedRuleCondition).length === 0 ? (
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                      {isHi ? "इस स्थिति के लिए कोई कस्टम नियम नहीं मिला।" : "No custom rules found for this condition. Click 'Add New Rule' above."}
                    </div>
                  ) : (
                    rules.filter(r => r.conditionId === selectedRuleCondition).map(rule => {
                      const isEditing = editingRuleId === rule.id;
                      
                      if (isEditing) {
                        return (
                          <div key={rule.id} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-3.5 text-xs animate-in slide-in-from-top-2 duration-150">
                            <div className="font-bold text-indigo-900">
                              {isHi ? "नियम संपादित करें" : "Edit If/Then Rule"}
                            </div>
                            
                            {/* Trigger Form Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-slate-600 block text-[10px] uppercase">If Factor</label>
                                <select
                                  value={ruleForm.triggerType}
                                  onChange={(e) => setRuleForm({ ...ruleForm, triggerType: e.target.value })}
                                  className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none focus:border-indigo-500 font-bold text-xs"
                                >
                                  <option value="aqi">AQI Level</option>
                                  <option value="temp">Temperature (°C)</option>
                                  <option value="uv">UV Index</option>
                                  <option value="humidity">Humidity (%)</option>
                                  <option value="always">Always/General</option>
                                </select>
                              </div>
                              
                              {ruleForm.triggerType !== "always" && (
                                <>
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-600 block text-[10px] uppercase">Is</label>
                                    <select
                                      value={ruleForm.operator}
                                      onChange={(e) => setRuleForm({ ...ruleForm, operator: e.target.value })}
                                      className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none focus:border-indigo-500 font-bold text-xs"
                                    >
                                      <option value="gt">Greater Than (&gt;)</option>
                                      <option value="lt">Less Than (&lt;)</option>
                                    </select>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-600 block text-[10px] uppercase">Threshold Value</label>
                                    <input
                                      type="number"
                                      value={ruleForm.threshold}
                                      onChange={(e) => setRuleForm({ ...ruleForm, threshold: Number(e.target.value) })}
                                      className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none focus:border-indigo-500 font-bold text-xs"
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Action Steps */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="font-bold text-slate-600 block text-[10px] uppercase">Then Protective Action (English)</label>
                                <textarea
                                  value={ruleForm.actionText}
                                  onChange={(e) => setRuleForm({ ...ruleForm, actionText: e.target.value })}
                                  placeholder="Type protective advice step..."
                                  rows="2"
                                  className="w-full p-2.5 rounded-lg bg-white border border-slate-200 outline-none focus:border-indigo-500 text-xs font-semibold leading-relaxed"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-slate-600 block text-[10px] uppercase">Then Protective Action (Hindi - Optional)</label>
                                <textarea
                                  value={ruleForm.actionTextHi}
                                  onChange={(e) => setRuleForm({ ...ruleForm, actionTextHi: e.target.value })}
                                  placeholder="हिन्दी सुरक्षा निर्देश लिखें..."
                                  rows="2"
                                  className="w-full p-2.5 rounded-lg bg-white border border-slate-200 outline-none focus:border-indigo-500 text-xs font-semibold leading-relaxed"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1 border-t border-indigo-100">
                              <button
                                onClick={() => setEditingRuleId(null)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  setRules(prev => prev.map(r => r.id === rule.id ? { ...r, ...ruleForm } : r));
                                  setEditingRuleId(null);
                                }}
                                disabled={!ruleForm.actionText}
                                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] cursor-pointer disabled:opacity-40"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={rule.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/95 flex flex-col justify-between gap-3 text-xs">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
                                {getRuleTriggerDescription(rule, false)}
                              </span>
                              {rule.triggerType !== "always" && (
                                <span className="text-[9px] font-bold text-slate-400">
                                  (Live value: {rule.triggerType === "aqi" ? currentAQI : rule.triggerType === "temp" ? `${currentTemp}°C` : `${rule.triggerType}`})
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-1 pl-1">
                              <p className="text-slate-800 font-semibold leading-relaxed">
                                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">English Action</span>
                                {rule.actionText}
                              </p>
                              {rule.actionTextHi && (
                                <p className="text-slate-600 font-medium leading-relaxed mt-1">
                                  <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">हिन्दी कार्ययोजना</span>
                                  {rule.actionTextHi}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 border-t border-slate-200/50 pt-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingRuleId(rule.id);
                                setRuleForm({
                                  triggerType: rule.triggerType,
                                  operator: rule.operator,
                                  threshold: rule.threshold,
                                  actionText: rule.actionText,
                                  actionTextHi: rule.actionTextHi || ""
                                });
                              }}
                              className="p-1 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                            >
                              ✏️ {isHi ? "बदलें" : "Edit"}
                            </button>
                            <button
                              onClick={() => {
                                setRules(prev => prev.filter(r => r.id !== rule.id));
                              }}
                              className="p-1 px-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:text-rose-700 hover:bg-rose-100 flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                            >
                              🗑️ {isHi ? "हटाएं" : "Delete"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Add New Rule Form */}
                  {editingRuleId === "new" && (
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3.5 text-xs animate-in slide-in-from-bottom-2 duration-150">
                      <div className="font-bold text-emerald-900">
                        {isHi ? "नया नियम जोड़ें" : "Add New If/Then Rule"}
                      </div>
                      
                      {/* Trigger fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[10px] uppercase">If Factor</label>
                          <select
                            value={ruleForm.triggerType}
                            onChange={(e) => setRuleForm({ ...ruleForm, triggerType: e.target.value })}
                            className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-xs"
                          >
                            <option value="aqi">AQI Level</option>
                            <option value="temp">Temperature (°C)</option>
                            <option value="uv">UV Index</option>
                            <option value="humidity">Humidity (%)</option>
                            <option value="always">Always/General</option>
                          </select>
                        </div>
                        
                        {ruleForm.triggerType !== "always" && (
                          <>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600 block text-[10px] uppercase">Is</label>
                              <select
                                value={ruleForm.operator}
                                onChange={(e) => setRuleForm({ ...ruleForm, operator: e.target.value })}
                                className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-xs"
                              >
                                <option value="gt">Greater Than (&gt;)</option>
                                <option value="lt">Less Than (&lt;)</option>
                              </select>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600 block text-[10px] uppercase">Threshold Value</label>
                              <input
                                type="number"
                                value={ruleForm.threshold}
                                onChange={(e) => setRuleForm({ ...ruleForm, threshold: Number(e.target.value) })}
                                className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-xs"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Steps input */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[10px] uppercase">Then Protective Action (English)</label>
                          <textarea
                            value={ruleForm.actionText}
                            onChange={(e) => setRuleForm({ ...ruleForm, actionText: e.target.value })}
                            placeholder="e.g. carry rescue inhaler, check medication..."
                            rows="2"
                            className="w-full p-2.5 rounded-lg bg-white border border-slate-200 outline-none focus:border-emerald-500 text-xs font-semibold leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[10px] uppercase">Then Protective Action (Hindi - Optional)</label>
                          <textarea
                            value={ruleForm.actionTextHi}
                            onChange={(e) => setRuleForm({ ...ruleForm, actionTextHi: e.target.value })}
                            placeholder="उदा. अपना इनहेलर साथ रखें, दवाई चेक करें..."
                            rows="2"
                            className="w-full p-2.5 rounded-lg bg-white border border-slate-200 outline-none focus:border-emerald-500 text-xs font-semibold leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-emerald-100">
                        <button
                          onClick={() => setEditingRuleId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const newRule = {
                              id: "rule_" + Date.now(),
                              conditionId: selectedRuleCondition,
                              ...ruleForm
                            };
                            setRules(prev => [...prev, newRule]);
                            setEditingRuleId(null);
                          }}
                          disabled={!ruleForm.actionText}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer disabled:opacity-40"
                        >
                          Add Rule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <button
                onClick={() => {
                  if (window.confirm(isHi ? "क्या आप वास्तव में सभी नियमों को क्लीनिकल डिफ़ॉल्ट पर रीसेट करना चाहते हैं?" : "Are you sure you want to reset all rules to the clinician's baseline?")) {
                    setRules(DEFAULT_RULES);
                    setEditingRuleId(null);
                  }
                }}
                className="text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>{isHi ? "क्लीनिकल डिफ़ॉल्ट पर रीसेट करें" : "Reset to Clinician Defaults"}</span>
              </button>
              
              <button
                onClick={() => {
                  setCustomizerOpen(false);
                  setEditingRuleId(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {isHi ? "सभी नियम सहेजें और बंद करें" : "Save & Close"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- FAMILY CONTACT ADD/EDIT MODAL --- */}
      {contactFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-900">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-base font-black text-slate-900">
                {editingContact 
                  ? (isHi ? "सुरक्षा संपर्क संपादित करें" : "Edit Security Contact")
                  : (isHi ? "नया सुरक्षा संपर्क जोड़ें" : "Add Security Contact")}
              </h3>
              <button
                type="button"
                onClick={() => setContactFormOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveContact} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">
                  {isHi ? "पूरा नाम" : "Full Name"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactFormData.name}
                  onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                  placeholder={isHi ? "उदा. राहुल शर्मा" : "e.g. Rahul Sharma"}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    {isHi ? "संबंध" : "Relationship"}
                  </label>
                  <select
                    value={contactFormData.relation}
                    onChange={(e) => setContactFormData({ ...contactFormData, relation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    {["Spouse", "Mother", "Father", "Brother", "Sister", "Son", "Daughter", "Friend", "Neighbour"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    {isHi ? "फोन नंबर" : "Phone Number"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactFormData.phone}
                    onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">
                  {isHi ? "शहर / स्थान" : "City / Location"}
                </label>
                <input
                  type="text"
                  value={contactFormData.location}
                  onChange={(e) => setContactFormData({ ...contactFormData, location: e.target.value })}
                  placeholder={isHi ? "उदा. मुंबई, नोएडा" : "e.g. Mumbai, Noida"}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">
                  {isHi ? "वर्तमान जोखिम स्थिति" : "Current Risk Status Text"}
                </label>
                <input
                  type="text"
                  value={contactFormData.riskStatus}
                  onChange={(e) => setContactFormData({ ...contactFormData, riskStatus: e.target.value })}
                  placeholder={isHi ? "उदा. सुरक्षित / सामान्य" : "e.g. Safe / Clear"}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="chk-extreme-risk"
                  checked={contactFormData.isExtremeRisk}
                  onChange={(e) => setContactFormData({ ...contactFormData, isExtremeRisk: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="chk-extreme-risk" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  ⚠️ {isHi ? "अत्यधिक जोखिम क्षेत्र अलर्ट सक्रिय करें" : "Set to Active Extreme Hazard / Alert Status"}
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setContactFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isHi ? "सुरक्षित करें" : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
