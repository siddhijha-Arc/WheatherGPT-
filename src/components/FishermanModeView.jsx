import { useState, useEffect, useRef, useCallback } from "react";
import { getTranslation } from "../lib/translations";
import { 
  Anchor, 
  Wind, 
  Waves, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  MapPin, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Play,
  Square,
  Navigation,
  Sunrise,
  Sunset,
  RefreshCw,
  Search,
  Globe,
  ShieldAlert,
  Compass,
  LifeBuoy,
  PhoneCall,
  Share2,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  Droplet
} from "lucide-react";
import { ProvenanceBadge } from "./ProvenanceBadge";

export const COASTAL_VOICE_LANGUAGES = [
  {
    id: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    bcp47: "hi-IN",
    listenBtnLabel: "आज की सलाह सुनें",
    getMessage: (port = "Paradip") =>
      `आज ${port} के पास हवा की गति तेज है। दोपहर 2 बजे के बाद गहरे समुद्र में मछली पकड़ने से बचें। सूर्यास्त से पहले वापस लौट आएं।`,
    keyPoints: [
      { label: "तेज हवा की चेतावनी", desc: "हवा की गति अधिक" },
      { label: "दोपहर 2 बजे के बाद रोक", desc: "गहरे समुद्र में न जाएं" },
      { label: "सूर्यास्त पूर्व वापसी", desc: "तट पर सुरक्षित लौटें" }
    ]
  },
  {
    id: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    bcp47: "bn-IN",
    listenBtnLabel: "আজকের পরামর্শ শুনুন",
    getMessage: (port = "Paradip") =>
      `আজ ${port}-এর কাছে বাতাসের গতিবেগ বেশি। দুপুর ২টার পর গভীর সমুদ্রে মাছ ধরতে যাবেন না। সূর্যাস্তের আগে ফিরে আসুন।`,
    keyPoints: [
      { label: "তীব্র বাতাসের সতর্কতা", desc: "বাতাসের গতি বেশি" },
      { label: "দুপুর ২টার পর নিষেধ", desc: "গভীর সমুদ্রে যাবেন না" },
      { label: "সূর্যাস্তের আগে ফিরুন", desc: "নিরাপদে বন্দরে আসুন" }
    ]
  },
  {
    id: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    bcp47: "or-IN",
    listenBtnLabel: "ଆଜିର ପରାମର୍ଶ ଶୁଣନ୍ତୁ",
    getMessage: (port = "Paradip") =>
      `ଆଜି ${port} ନିକଟରେ ପବନର ବେଗ ଅଧିକ ରହିଛି। ଅପରାହ୍ନ ୨ଟା ପରେ ଗଭୀର ସମୁଦ୍ରକୁ ମାଛ ଧରିବାକୁ ଯାଆନ୍ତୁ ନାହିଁ। ସୂର୍ଯ୍ୟାସ୍ତ ପୂର୍ବରୁ ଫେରି ଆସନ୍ତୁ।`,
    keyPoints: [
      { label: "ପବନ ବେଗ ଅଧିକ ସତର୍କତା", desc: "ପବନ ପ୍ରବଳ ରହିବ" },
      { label: "ଅପରାହ୍ନ ୨ଟା ପରେ ବାରଣ", desc: "ଗଭୀର ସମୁଦ୍ର ଯାଆନ୍ତୁ ନାହିଁ" },
      { label: "ସୂର୍ଯ୍ୟାସ୍ତ ପୂର୍ବରୁ ଫେରନ୍ତୁ", desc: "କୁଳକୁ ସୁରକ୍ଷିତ ଆସନ୍ତୁ" }
    ]
  },
  {
    id: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    bcp47: "ta-IN",
    listenBtnLabel: "இன்றைய ஆலோசனையைக் கேளுங்கள்",
    getMessage: (port = "Paradip") =>
      `இன்று ${port} அருகே காற்றின் வேகம் அதிகமாக உள்ளது. மதியம் 2 மணிக்கு மேல் ஆழ்கடல் மீன்பிடிப்பதைத் தவிர்க்கவும். சூரிய அஸ்தமனத்திற்கு முன் திரும்பி வாருங்கள்.`,
    keyPoints: [
      { label: "அதிவேக காற்று எச்சரிக்கை", desc: "கடலில் காற்று அதிகம்" },
      { label: "மதியம் 2 மணிக்கு மேல் வேண்டாம்", desc: "ஆழ்கடல் செல்ல வேண்டாம்" },
      { label: "சூரிய அஸ்தமனத்திற்கு முன்", desc: "கரைக்கு திரும்புக" }
    ]
  },
  {
    id: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    bcp47: "te-IN",
    listenBtnLabel: "ఈనాటి సలహాను వినండి",
    getMessage: (port = "Paradip") =>
      `ఈ రోజు ${port} సమీపంలో గాలి వేగం ఎక్కువగా ఉంది. మధ్యాహ్నం 2 గంటల తర్వాత లోతైన సముద్రంలో వేటకు వెళ్లవద్దు. సూర్యాస్తమయానికి ముందే తిరిగి రండి.`,
    keyPoints: [
      { label: "తీవ్ర గాలి హెచ్చరిక", desc: "గాలి వేగం అధికం" },
      { label: "మధ్యాహ్నం 2 తర్వాత వద్దు", desc: "లోతైన సముద్రంలోకి వెళ్లవద్దు" },
      { label: "సూర్యాస్తమయానికి ముందే", desc: "తీరానికి తిరిగి రండి" }
    ]
  },
  {
    id: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    bcp47: "ml-IN",
    listenBtnLabel: "ഇന്നത്തെ നിർദ്ദേശം കേൾക്കുക",
    getMessage: (port = "Paradip") =>
      `ഇന്ന് ${port}-ന് സമീപം കാറ്റിന്റെ വേഗത കൂടുതലാണ്. ഉച്ചയ്ക്ക് 2 മണിക്ക് ശേഷം ആഴക്കടൽ മത്സ്യബന്ധനം ഒഴിവാക്കുക. സൂര്യാസ്തമയത്തിന് മുൻപ് തിരിച്ചെത്തുക.`,
    keyPoints: [
      { label: "ശക്തമായ കാറ്റ് മുന്നറിയിപ്പ്", desc: "കാറ്റിന്റെ വേഗത കൂടുതൽ" },
      { label: "ഉച്ചയ്ക്ക് 2 മണിക്ക് ശേഷം വിലക്ക്", desc: "ആഴക്കടലിൽ പോകരുത്" },
      { label: "സൂര്യാസ്തമയത്തിന് മുൻപ്", desc: "തീരത്ത് തിരിച്ചെത്തുക" }
    ]
  },
  {
    id: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    bcp47: "kn-IN",
    listenBtnLabel: "ಇಂದಿನ ಸಲಹೆಯನ್ನು ಆಲಿಸಿ",
    getMessage: (port = "Paradip") =>
      `ಇಂದು ${port} ಬಳಿ ಗಾಳಿಯ ವೇಗ ಹೆಚ್ಚಾಗಿದೆ. ಮಧ್ಯಾಹ್ನ 2 ಗಂಟೆಯ ನಂತರ ಆಳ ಸಮುದ್ರದ ಮೀನುಗಾರಿಕೆಯನ್ನು ತಪ್ಪಿಸಿ. ಸೂರ್ಯಾಸ್ತದ ಮೊದಲು ಹಿಂತಿರುಗಿ.`,
    keyPoints: [
      { label: "ತೀವ್ರ ಗಾಳಿ ಎಚ್ಚರಿಕೆ", desc: "ಗಾಳಿಯ ವೇಗ ಅಧಿಕ" },
      { label: "ಮಧ್ಯಾಹ್ನ 2ರ ನಂತರ ಬೇಡ", desc: "ಆಳ ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ" },
      { label: "ಸೂರ್ಯಾಸ್ತದ ಮೊದಲು", desc: "ದಡಕ್ಕೆ ಹಿಂತಿರುಗಿ" }
    ]
  },
  {
    id: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    bcp47: "mr-IN",
    listenBtnLabel: "आजचा सल्ला ऐका",
    getMessage: (port = "Paradip") =>
      `आज ${port}जवळ वाऱ्याचा वेग जास्त आहे. दुपारी २ नंतर खोल समुद्रात मासेमारी करणे टाळा. सूर्यास्तापूर्वी परत या.`,
    keyPoints: [
      { label: "तीव्र वाऱ्याचा इशारा", desc: "वाऱ्याचा वेग जास्त" },
      { label: "दुपारी २ नंतर बंदी", desc: "खोल समुद्रात जाऊ नका" },
      { label: "सूर्यास्तापूर्वी परत या", desc: "किनाऱ्यावर सुरक्षित या" }
    ]
  },
  {
    id: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    bcp47: "gu-IN",
    listenBtnLabel: "આજની સલાહ સાંભળો",
    getMessage: (port = "Paradip") =>
      `આજે ${port} નજીક પવનની ગતિ વધુ છે. બપોરે 2 વાગ્યા પછી ઊંડા દરિયામાં માછીમારી કરવાનું ટાળો. સૂર્યાસ્ત પહેલાં પાછા આવી જાઓ.`,
    keyPoints: [
      { label: "તેજ પવનની ચેતવણી", desc: "પવનની ગતિ વધુ" },
      { label: "બપોરે 2 વાગ્યા પછી રોક", desc: "ઊંડા દરિયામાં ન જવું" },
      { label: "સૂર્યાસ્ત પહેલાં પાછા આવો", desc: "કિનારે સલામત પાછા ફરો" }
    ]
  },
  {
    id: "en",
    name: "English",
    nativeName: "English",
    bcp47: "en-IN",
    listenBtnLabel: "Listen to today’s advisory",
    getMessage: (port = "Paradip") =>
      `Today, wind speed is high near ${port}. Avoid deep-sea fishing after 2 PM. Return before sunset.`,
    keyPoints: [
      { label: "High Wind Alert", desc: "Elevated coastal gusts" },
      { label: "No Deep Sea After 2 PM", desc: "Offshore hazard window" },
      { label: "Return Before Sunset", desc: "Safe harbour arrival" }
    ]
  }
];

export function FishermanModeView({ language = "en", initialLocation }) {
  const isHi = language === "hi";
  
  // State for location with safe name/city fallback - Defaulting to Paradip as requested
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (initialLocation && initialLocation.name && initialLocation.name !== "Location") {
      return {
        name: initialLocation.name || initialLocation.city || "Paradip",
        state: initialLocation.state || "Odisha",
        lat: initialLocation.lat || 20.2644,
        lng: initialLocation.lng || 86.6151
      };
    }
    return {
      name: "Paradip",
      state: "Odisha",
      lat: 20.2644,
      lng: 86.6151
    };
  });

  // UI Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState("dashboard"); // "dashboard", "planner", "pfz", "sos", "regulations", "education"
  
  // Search & conditions
  const [searchQuery, setSearchQuery] = useState("");
  const [recentLocations, setRecentLocations] = useState([]);
  const [conditionsData, setConditionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // Custom language selector for fisherman voice/text assistance
  const [fishermanLang, setFishermanLang] = useState(language || "en");

  useEffect(() => {
    if (language) {
      setFishermanLang(language);
    }
  }, [language]);

  // Language mapping for labels
  const globalT = getTranslation(fishermanLang);
  const i18n = {
    en: {
      dashboard: "Dashboard",
      planner: "Trip Planner",
      pfz: "Fishing Zones",
      sos: "Emergency SOS",
      regulations: "Regulations",
      education: "Risk Education",
      safetystatus: "Safety Status",
      wind: "Wind Info",
      waves: "Waves & Swell",
      tempSst: "SST & Environment",
      disclaimer: "Official IMD, INCOIS, Coast Guard, harbour, and local authority instructions take priority over AI-generated advice."
    },
    hi: {
      dashboard: "मुख्य डैशबोर्ड",
      planner: "यात्रा योजना",
      pfz: "मछली पकड़ने के क्षेत्र",
      sos: "आपातकालीन SOS",
      regulations: "नियम व प्रतिबंध",
      education: "मौसम शिक्षा",
      safetystatus: "सुरक्षा स्थिति",
      wind: "हवा की स्थिति",
      waves: "लहरें व स्वेल",
      tempSst: "तापमान व समुद्री पर्यावरण",
      disclaimer: "आधिकारिक IMD, INCOIS, तटरक्षक बल और स्थानीय बंदरगाह अधिकारियों के निर्देश ही सर्वोपरि हैं।"
    }
  };

  const localT = i18n[fishermanLang === "hi" ? "hi" : "en"] || i18n.en;
  const t = new Proxy(localT, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return globalT[prop];
    }
  });
  const [boatType, setBoatType] = useState("motorized"); // "non-motorized", "motorized", "trawler"
  const [engineHP, setEngineHP] = useState("40");
  const [fuelLiters, setFuelLiters] = useState("50");
  const [crewCount, setCrewCount] = useState("3");
  const [durationHours, setDurationHours] = useState("8");
  const [maxDistance, setMaxDistance] = useState("10");
  const [routePlan, setRoutePlan] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("18:00");
  const [overdueAlert, setOverdueAlert] = useState(false);
  const [checklist, setChecklist] = useState({
    lifejackets: false,
    water: false,
    fuel: false,
    firstaid: false,
    radio: false,
    lights: false
  });

  // Interactive SOS inputs
  const [sosProblem, setSosProblem] = useState("Engine Failure");
  const [boatName, setBoatName] = useState("JAI MATADI-1");
  const [sosCrew, setSosCrew] = useState("3");
  const [sosCopied, setSosCopied] = useState(false);

  // QA Expanded cards
  const [expandedQA, setExpandedQA] = useState({});

  // Audio TTS synthesis ref
  const activeAudioRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const popularCoastalPorts = [
    { name: "Veraval", state: "Gujarat", lat: 20.9153, lng: 70.3629 },
    { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
    { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
    { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
    { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
    { name: "Paradip", state: "Odisha", lat: 20.2644, lng: 86.6151 },
    { name: "Goa", state: "Goa", lat: 15.2993, lng: 74.1240 },
    { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560 },
    { name: "Tuticorin", state: "Tamil Nadu", lat: 8.7642, lng: 78.1348 },
    { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312 }
  ];

  useEffect(() => {
    fetchRecentLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchFishermanConditions(selectedLocation);
    }
    stopSpeaking();
  }, [selectedLocation]);

  const fetchRecentLocations = async () => {
    try {
      const res = await fetch("/api/fisherman/recent-locations");
      if (res.ok) {
        const data = await res.json();
        if (data.locations) {
          setRecentLocations(data.locations);
        }
      }
    } catch (e) {
      console.warn("Failed to load recent locations", e);
    }
  };

  const saveLocationToHistory = async (loc) => {
    try {
      await fetch("/api/fisherman/recent-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loc)
      });
      fetchRecentLocations();
    } catch (e) {
      console.warn("Failed to save location", e);
    }
  };

  const fetchFishermanConditions = async (loc) => {
    setLoading(true);
    setAiSummary("");
    try {
      const locationName = loc?.name || loc?.city || "Veraval";
      const res = await fetch(`/api/fisherman/conditions?lat=${loc.lat}&lng=${loc.lng}&city=${encodeURIComponent(locationName)}`);
      if (!res.ok) throw new Error("Failed to fetch fisherman safety data");
      const data = await res.json();
      setConditionsData(data);
      saveLocationToHistory(loc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAiSummary = async () => {
    if (!conditionsData) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/fisherman/gemini-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionData: conditionsData,
          language: fishermanLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
        speakTextLocal(data.summary);
      }
    } catch (e) {
      console.warn("AI summary error", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert(isHi ? "आपके ब्राउज़र में जीपीएस समर्थित नहीं है।" : "Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gpsLoc = {
          name: isHi ? "मेरा जीपीएस तटीय स्थान" : "My GPS Coastal Point",
          state: isHi ? "वर्तमान स्थान" : "Current Position",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setSelectedLocation(gpsLoc);
      },
      () => {
        alert(isHi ? "स्थान प्राप्त करने में असमर्थ" : "Unable to retrieve your location");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // --- AUDIO SYNTHESIS SYSTEM (3-Tier Speech Synthesis Hierarchy) ---
  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (err) {
        console.warn(err);
      }
      activeAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const fallbackBrowserTTS = useCallback((cleanText, ttsLang, useESpeakBackup = false) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const langConfig = COASTAL_VOICE_LANGUAGES.find(l => l.id === ttsLang);
      const bcpCode = langConfig ? langConfig.bcp47 : "hi-IN";

      if (useESpeakBackup) {
        // eSpeak NG Offline simulation (robotic parameters)
        utterance.rate = 1.35;
        utterance.pitch = 0.5;
        utterance.lang = "en-US";
      } else {
        // Browser standard local synthesis
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.lang = bcpCode;
        if (window.speechSynthesis.getVoices) {
          const voices = window.speechSynthesis.getVoices();
          const target = voices.find(v => 
            (v.lang || "").toLowerCase().startsWith(ttsLang) || 
            (v.lang || "").toLowerCase() === bcpCode.toLowerCase() ||
            (v.name || "").toLowerCase().includes(langConfig ? langConfig.name.toLowerCase() : "hindi")
          );
          if (target) utterance.voice = target;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        if (!useESpeakBackup) {
          fallbackBrowserTTS(cleanText, ttsLang, true);
        } else {
          setIsSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
      setIsSpeaking(false);
    }
  }, []);

  const speakTextLocal = useCallback(async (text) => {
    stopSpeaking();
    const clean = text.replace(/[*_#`[\]()]/g, "").slice(0, 300);
    const ttsLang = fishermanLang;

    try {
      // Tier 1: Parler-TTS Proxy Pipeline
      const response = await fetch(`/api/tts?text=${encodeURIComponent(clean)}&lang=${ttsLang}&engine=parler`);
      if (!response.ok) throw new Error("Parler TTS failed");
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        activeAudioRef.current = null;
      };
      audio.onerror = () => {
        fallbackBrowserTTS(clean, ttsLang, false);
      };
      await audio.play();
    } catch (err) {
      fallbackBrowserTTS(clean, ttsLang, false);
    }
  }, [fishermanLang, stopSpeaking, fallbackBrowserTTS]);

  // Risk planning assessment calculation
  const calculateTripRisk = () => {
    const fuel = parseFloat(fuelLiters) || 0;
    const dur = parseFloat(durationHours) || 0;
    const dist = parseFloat(maxDistance) || 0;
    let warnings = [];
    
    // Average consumption: motorized ~ 8L/hr, trawler ~ 15L/hr, non-motorized ~ 0L/hr
    const hourlyConsumption = boatType === "trawler" ? 14 : boatType === "motorized" ? 8 : 0;
    const expectedFuelNeeded = hourlyConsumption * dur;

    if (boatType !== "non-motorized" && fuel < expectedFuelNeeded) {
      warnings.push(fishermanLang === "hi" 
        ? `ईंधन की कमी: ${dur} घंटे की यात्रा के लिए कम से कम ${expectedFuelNeeded}L ईंधन चाहिए, पर आपके पास केवल ${fuel}L है।`
        : `Fuel Shortage: Estimated consumption is ${expectedFuelNeeded}L for ${dur} hours, but you only have ${fuel}L.`
      );
    }

    if (dist > 15 && boatType === "non-motorized") {
      warnings.push(fishermanLang === "hi"
        ? "सुरक्षा चेतावनी: बिना मोटर की नाव से तट से 15 किमी से अधिक दूर जाना बेहद असुरक्षित है।"
        : "Safety Alert: Going beyond 15 km in a non-motorized traditional craft is highly unsafe."
      );
    }

    if (conditionsData?.status === "red") {
      warnings.push(fishermanLang === "hi"
        ? "खतरनाक मौसम: वर्तमान बंदरगाह चेतावनियों के अनुसार आज समुद्र में जाना पूर्ण रूप से प्रतिबंधित है।"
        : "Severe Weather: Heading to sea is strictly prohibited due to active maritime rough weather warnings."
      );
    }

    return warnings;
  };

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopySosMessage = () => {
    const coordsStr = conditionsData ? `${conditionsData.coordinates.lat.toFixed(4)}, ${conditionsData.coordinates.lng.toFixed(4)}` : "GPS Unknown";
    const msg = `SOS! EMERGENCY. Location: ${coordsStr}. Boat: ${boatName}. Crew: ${sosCrew}. Problem: ${sosProblem}. Need Immediate Assistance. Fallback via local Coast Guard and Port Harbor Control.`;
    navigator.clipboard.writeText(msg);
    setSosCopied(true);
    setTimeout(() => setSosCopied(false), 2000);
  };

  const toggleQA = (key) => {
    setExpandedQA(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderTrafficLight = (status) => {
    switch (status) {
      case "green":
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <span className="mt-2.5 text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full tracking-wide uppercase border border-emerald-200">
              {fishermanLang === "hi" ? "सुरक्षित — गहरे समुद्र में जा सकते हैं" : "Safe to Venture Out"}
            </span>
          </div>
        );
      case "yellow":
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-9 h-9 text-white" />
            </div>
            <span className="mt-2.5 text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full tracking-wide uppercase border border-amber-200">
              {fishermanLang === "hi" ? "तट के पास ही रहें (चेतावनी)" : "Stay Near Shore Only"}
            </span>
          </div>
        );
      case "red":
      default:
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center animate-pulse">
              <XCircle className="w-9 h-9 text-white" />
            </div>
            <span className="mt-2.5 text-xs font-bold px-3 py-1 bg-rose-100 text-rose-800 rounded-full tracking-wide uppercase border border-rose-200">
              {fishermanLang === "hi" ? "असुरक्षित — समुद्र में न जाएं" : "Unsafe — Do Not Venturing Out"}
            </span>
          </div>
        );
    }
  };

  // Customized state directories based on selected harbor location
  const getEmergencyDirectory = () => {
    const locName = (conditionsData?.locationName || selectedLocation?.name || selectedLocation?.city || "Veraval").toLowerCase();
    
    let contacts = {
      state: "Gujarat Coastal Authority",
      coastGuard: "1554 / 02826-241554",
      disasterControl: "079-23251900",
      harbourOffice: "02876-220138 (Veraval Port Officer)",
      police: "1093 / 112 (Coastal Police)",
      hospital: "General Civil Hospital Veraval (02876-221252)"
    };

    if (locName.includes("kochi") || locName.includes("kerala")) {
      contacts = {
        state: "Kerala Coastal Command",
        coastGuard: "1554 / 0484-2218844",
        disasterControl: "1070 / 0471-2331639",
        harbourOffice: "0484-2224155 (Kochi Fisheries Harbor Control)",
        police: "1093 (Coastal Helpline Kerala)",
        hospital: "Ernakulam General Hospital (0484-2361251)"
      };
    } else if (locName.includes("mumbai") || locName.includes("maharashtra")) {
      contacts = {
        state: "Maharashtra Coastal Cell",
        coastGuard: "1554 / 022-24376133",
        disasterControl: "022-22027990",
        harbourOffice: "022-22616231 (Sassoon Dock Controller)",
        police: "1093 / 112",
        hospital: "St. George Coastal Hospital Mumbai (022-22620242)"
      };
    } else if (locName.includes("chennai") || locName.includes("tamil nadu") || locName.includes("tuticorin")) {
      contacts = {
        state: "Tamil Nadu Fisheries & Coastal Security",
        coastGuard: "1554 / 044-23460480",
        disasterControl: "1070 / 044-28593990",
        harbourOffice: "044-25951234 (Royapuram Harbour Office)",
        police: "1093 (Coastal Security Group TN)",
        hospital: "Government General Hospital Chennai (044-25305000)"
      };
    } else if (locName.includes("visakhapatnam") || locName.includes("andhra")) {
      contacts = {
        state: "Andhra Pradesh Maritime Board",
        coastGuard: "1554 / 0891-2561224",
        disasterControl: "0863-2234301",
        harbourOffice: "0891-2562412 (Vizag Port Deputy Conservator)",
        police: "1093",
        hospital: "King George Hospital Vizag (0891-2564891)"
      };
    } else if (locName.includes("paradip") || locName.includes("odisha") || locName.includes("puri")) {
      contacts = {
        state: "Odisha Coastal Disaster Control",
        coastGuard: "1554 / 06722-222384",
        disasterControl: "1070 / 0674-2534177",
        harbourOffice: "06722-222144 (Paradip Port Trust)",
        police: "1093",
        hospital: "Paradip Port Trust Hospital (06722-222031)"
      };
    }

    return contacts;
  };

  const emergencyContacts = getEmergencyDirectory();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 py-4 space-y-4 pb-32 sm:pb-36 text-slate-800">
      
      {/* Top Main Panel - Header & Location Selection */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                {fishermanLang === "hi" ? "मछुआरा समुद्र-सुरक्षा मित्र" : "Mausam Mitra — Fisherman Mode"}
              </h1>
              <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-bold border border-sky-150 uppercase tracking-wider">
                {fishermanLang === "hi" ? "समुद्र सलाह" : "Marine Advisory"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {fishermanLang === "hi" ? "IMD & INCOIS तटीय सुरक्षा और संभावित मत्स्य क्षेत्र पूर्वानुमान" : "Real-time sea roughness, wind limits & landing center advisory"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {/* Custom voice languages */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={fishermanLang}
              onChange={(e) => {
                setFishermanLang(e.target.value);
                stopSpeaking();
              }}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              {COASTAL_VOICE_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleUseGps}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-blue-700 rounded-2xl border border-slate-200 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            title={fishermanLang === "hi" ? "जीपीएस से स्थान खोजें" : "Locate via GPS"}
          >
            <Navigation className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Landing Centre Selector Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          {fishermanLang === "hi" ? "तटीय बंदरगाह / लैन्डिंग सेंटर खोजें" : "Select Landing Centre / Coastal Fishing Zone"}
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={fishermanLang === "hi" ? "बंदरगाह या घाट का नाम खोजें (जैसे Veraval, Kochi, Puri)..." : "Search landing center (e.g., Veraval, Kochi, Puri)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Port Chips horizontally scrollable */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {popularCoastalPorts
            .filter((p) => (p.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()))
            .map((port) => {
              const isSelected = (selectedLocation?.name || selectedLocation?.city || "").toLowerCase() === (port.name || "").toLowerCase();
              return (
                <button
                  key={port.name}
                  onClick={() => setSelectedLocation(port)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{port.name}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "dashboard" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => setActiveSubTab("planner")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "planner" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t.planner}
        </button>
        <button
          onClick={() => setActiveSubTab("pfz")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "pfz" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t.pfz}
        </button>
        <button
          onClick={() => setActiveSubTab("sos")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "sos" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t.sos}
        </button>
        <button
          onClick={() => setActiveSubTab("regulations")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "regulations" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {fishermanLang === "hi" ? "नियम व जोखिम शिक्षा" : "Regulations & Risk Education"}
        </button>
      </div>

      {/* --- RENDER TAB CONTENTS --- */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600">
            {fishermanLang === "hi"
              ? `${selectedLocation?.name || selectedLocation?.city || "Veraval"} के लिए समुद्र सुरक्षा डेटा संकलित हो रहा है...`
              : `Fetching marine forecasts & safety models for ${selectedLocation?.name || selectedLocation?.city || "Veraval"}...`}
          </p>
        </div>
      ) : conditionsData ? (
        <div className="space-y-4">
          
          {/* TAB 1: DAILY DASHBOARD */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-4">
              
              {/* Flashing Cyclone/Severe Warning Banner */}
              {conditionsData.cycloneAlert && (
                <div className={`border rounded-3xl p-4 relative overflow-hidden shadow-sm animate-pulse ${
                  conditionsData.cycloneAlert.severity === "HIGH" 
                    ? "bg-rose-50 border-rose-300 text-rose-900" 
                    : "bg-amber-50 border-amber-300 text-amber-900"
                }`}>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className={`w-5.5 h-5.5 shrink-0 ${
                      conditionsData.cycloneAlert.severity === "HIGH" ? "text-rose-600" : "text-amber-600"
                    }`} />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wide">
                          {conditionsData.cycloneAlert.title}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                          conditionsData.cycloneAlert.severity === "HIGH" ? "bg-rose-200 text-rose-800" : "bg-amber-200 text-amber-800"
                        }`}>
                          {conditionsData.cycloneAlert.severity}
                        </span>
                      </div>
                      <p className="text-xs font-black">{conditionsData.cycloneAlert.action}</p>
                      <p className="text-[11px] opacity-90 mt-1 leading-normal font-medium">{conditionsData.cycloneAlert.details}</p>
                      <div className="text-[10px] opacity-75 font-semibold mt-1">
                        {fishermanLang === "hi" ? "लागू होने का समय: " : "Expected window: "} {conditionsData.cycloneAlert.time}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Graceful Offline / Live Weather Warning Banner */}
              {conditionsData.live_available === false && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 mb-3 flex items-start gap-2.5 text-amber-950 text-xs shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <div className="font-extrabold text-amber-900 flex items-center gap-1.5 flex-wrap">
                      <span>{fishermanLang === "hi" ? "लाइव मौसम डेटा अनुपलब्ध है।" : "Live weather data unavailable."}</span>
                      <ProvenanceBadge type="default" language={fishermanLang} size="xs" />
                    </div>
                    <p className="text-[11px] text-amber-800 leading-normal">
                      {fishermanLang === "hi"
                        ? "लाइव सेंसर अनुपलब्ध होने के कारण सुरक्षा मॉडल और वैज्ञानिक सूत्रों द्वारा अनुमानित डेटा प्रदर्शित किया जा रहा है।"
                        : "Due to temporary live sensor unavailability, values are derived from marine models, formulas, and baseline safety thresholds."}
                    </p>
                  </div>
                </div>
              )}

              {/* Core Safety Status & Audio Briefing Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>{conditionsData.locationName} Harbour & Landing Point</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                    {conditionsData.coordinates.lat.toFixed(4)}°N, {conditionsData.coordinates.lng.toFixed(4)}°E
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center my-4 space-y-2">
                  {renderTrafficLight(conditionsData.status)}
                  <h2 className="text-xl font-black text-slate-900 text-center tracking-tight flex items-center justify-center flex-wrap gap-1.5">
                    <span>{fishermanLang === "hi" ? "सलाह: " : "Advice: "} “{conditionsData.statusLabel}”</span>
                    <ProvenanceBadge
                      type={conditionsData.provenance?.statusLabel?.source_type || (conditionsData.live_available ? "estimated" : "default")}
                      language={fishermanLang}
                      detail={conditionsData.provenance?.statusLabel}
                    />
                  </h2>
                  <p className="text-xs text-slate-600 text-center font-bold max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
                    {conditionsData.reasoning}
                  </p>
                </div>

                {/* --- PROMINENT COASTAL VOICE ADVISORY IN LOCAL LANGUAGES CARD --- */}
                {(() => {
                  const currentLangConfig = COASTAL_VOICE_LANGUAGES.find(l => l.id === fishermanLang) || COASTAL_VOICE_LANGUAGES[0];
                  const portName = selectedLocation?.name || selectedLocation?.city || "Paradip";
                  const advisoryMsg = currentLangConfig.getMessage(portName);

                  return (
                    <div className="bg-gradient-to-br from-blue-900 via-sky-900 to-slate-900 text-white rounded-2xl p-4 md:p-5 mt-4 space-y-4 shadow-md border border-sky-800/50">
                      
                      {/* Header with Title and Language Chips */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                            <Volume2 className="w-4 h-4 text-sky-300 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-200 flex items-center gap-1.5">
                              <span>Coastal Voice Advisory</span>
                              <span className="text-[9px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-400/30">
                                10 Indic Languages
                              </span>
                            </h3>
                            <p className="text-[11px] text-sky-100/80 font-medium">
                              {currentLangConfig.nativeName} ({currentLangConfig.name}) Audio Guidance
                            </p>
                          </div>
                        </div>

                        {/* Quick language selector pills */}
                        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                          {COASTAL_VOICE_LANGUAGES.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => {
                                setFishermanLang(l.id);
                                stopSpeaking();
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                                fishermanLang === l.id
                                  ? "bg-sky-400 text-slate-950 font-black shadow-sm scale-105"
                                  : "bg-white/10 hover:bg-white/20 text-sky-100"
                              }`}
                            >
                              {l.nativeName}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Prominent Audio Action Button */}
                      <div>
                        {isSpeaking ? (
                          <button
                            onClick={stopSpeaking}
                            className="w-full py-3.5 px-5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-98"
                          >
                            <Square className="w-5 h-5 fill-current" />
                            <span>Stop Audio Advisory</span>
                            <span className="flex items-center gap-1 ml-2">
                              <span className="w-1.5 h-3 bg-white/90 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-4 bg-white/90 rounded-full animate-bounce delay-75"></span>
                              <span className="w-1.5 h-2 bg-white/90 rounded-full animate-bounce delay-150"></span>
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => speakTextLocal(advisoryMsg)}
                            className="w-full py-3.5 px-5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-black text-sm sm:text-base rounded-xl transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3 cursor-pointer active:scale-98"
                          >
                            <Play className="w-5 h-5 fill-current" />
                            <span>{currentLangConfig.listenBtnLabel}</span>
                            <Volume2 className="w-5 h-5 opacity-80" />
                          </button>
                        )}
                      </div>

                      {/* Spoken Advisory Text Message Box */}
                      <div className="bg-white/10 border border-white/15 rounded-xl p-3.5 text-xs font-semibold leading-relaxed text-sky-50">
                        <p className="text-[10px] uppercase font-bold text-sky-300 mb-1 tracking-wider">
                          Spoken Text ({currentLangConfig.name}):
                        </p>
                        <p className="text-sm font-extrabold leading-snug text-white">
                          “{advisoryMsg}”
                        </p>
                      </div>

                      {/* Low-Literacy Visual Key Points */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {currentLangConfig.keyPoints.map((kp, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0"></span>
                            <div>
                              <div className="text-xs font-black text-white">{kp.label}</div>
                              <div className="text-[10px] text-sky-200/80 font-medium">{kp.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* AI Gemini Custom Bulletin Option */}
                      <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-sky-200/90 font-medium flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Need detailed AI weather summary?
                        </span>
                        <button
                          onClick={handleFetchAiSummary}
                          disabled={aiLoading}
                          className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                        >
                          {aiLoading ? "Generating..." : "Generate AI Bulletin"}
                        </button>
                      </div>

                      {aiSummary && (
                        <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-xs text-white space-y-2">
                          <p className="font-semibold">{aiSummary}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => speakTextLocal(aiSummary)}
                              className="px-3 py-1 bg-sky-400 text-slate-950 font-bold rounded-lg text-xs"
                            >
                              Play AI Bulletin
                            </button>
                            <button
                              onClick={stopSpeaking}
                              className="px-3 py-1 bg-white/20 text-white font-bold rounded-lg text-xs"
                            >
                              Stop
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })()}

              </div>

              {/* Dynamic Fisherman Dashboard Summary Widget */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-2xs">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  {fishermanLang === "hi" ? "दैनिक मछुआरा मौसम डैशबोर्ड" : "Daily Fisherman Advisory Summary"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="bg-white p-3 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{fishermanLang === "hi" ? "सुरक्षा स्थिति" : "Safety"}</span>
                    <div className="text-xs font-black text-rose-600 mt-1 flex items-center justify-between flex-wrap gap-1">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          conditionsData.status === "red" ? "bg-rose-600 animate-ping" : conditionsData.status === "yellow" ? "bg-amber-500 animate-ping" : "bg-emerald-500"
                        }`}></span>
                        {conditionsData.statusLabel}
                      </span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.statusLabel?.source_type || (conditionsData.live_available ? "estimated" : "default")}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.statusLabel}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{fishermanLang === "hi" ? "पवन सीमा" : "Wind limits"}</span>
                    <div className="text-xs font-black text-slate-900 mt-1 flex items-center justify-between flex-wrap gap-1">
                      <span>{conditionsData.windSpeed} km/h</span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.windSpeed?.source_type || (conditionsData.live_available ? "live" : "default")}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.windSpeed}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{fishermanLang === "hi" ? "तरंग ऊंचाई" : "Wave rough"}</span>
                    <div className="text-xs font-black text-slate-900 mt-1 flex items-center justify-between flex-wrap gap-1">
                      <span>{conditionsData.waveHeight} meters</span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.waveHeight?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.waveHeight}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{fishermanLang === "hi" ? "वापसी सलाह" : "Return plan"}</span>
                    <div className="text-xs font-black text-amber-700 mt-1 flex items-center justify-between flex-wrap gap-1">
                      <span className="truncate max-w-[90px]">{conditionsData.safeReturnTime}</span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.safeReturnTime?.source_type || (conditionsData.live_available ? "estimated" : "default")}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.safeReturnTime}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                
                {/* Wind Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      {t.wind}
                    </span>
                    <Wind className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-slate-900 flex items-center justify-between">
                      <div>
                        {conditionsData.windSpeed} <span className="text-xs font-semibold text-slate-500">km/h</span>
                      </div>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.windSpeed?.source_type || (conditionsData.live_available ? "live" : "default")}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.windSpeed}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                      <span>
                        {fishermanLang === "hi" ? "दिशा" : "Direction"}: <span className="text-slate-800 font-extrabold">{conditionsData.windDirection}</span>
                      </span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.windDirection?.source_type || (conditionsData.live_available ? "live" : "default")}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.windDirection}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                      <span>
                        {fishermanLang === "hi" ? "झोंके तक" : "Max gust"}: <span className="text-amber-600 font-extrabold">{conditionsData.gustSpeed} km/h</span>
                      </span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.gustSpeed?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.gustSpeed}
                      />
                    </div>
                  </div>
                </div>

                {/* Waves & Swell Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      {t.waves}
                    </span>
                    <Waves className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-slate-900 flex items-center justify-between">
                      <div>
                        {conditionsData.waveHeight} <span className="text-xs font-semibold text-slate-500">m</span>
                      </div>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.waveHeight?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.waveHeight}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                      <span>
                        {fishermanLang === "hi" ? "तरंग अवधि" : "Wave period"}: <span className="text-slate-800 font-extrabold">{conditionsData.wavePeriod} sec</span>
                      </span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.wavePeriod?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.wavePeriod}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                      <span>
                        {fishermanLang === "hi" ? "स्वेल ऊंचाई" : "Swell rough"}: <span className="text-cyan-600 font-extrabold">{conditionsData.swellHeight}m ({conditionsData.swellDirection})</span>
                      </span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.swellHeight?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.swellHeight}
                      />
                    </div>
                  </div>
                </div>

                {/* Ocean & Marine Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      {t.tempSst}
                    </span>
                    <Droplet className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-slate-900 flex items-center justify-between">
                      <div>
                        {conditionsData.seaSurfaceTemp} <span className="text-xs font-semibold text-slate-500">°C</span>
                      </div>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.seaSurfaceTemp?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.seaSurfaceTemp}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                      <span>
                        {fishermanLang === "hi" ? "क्लोरोफिल" : "Chlorophyll"}: <span className="text-emerald-700 font-extrabold">{conditionsData.chlorophyll} mg/m³</span>
                      </span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.chlorophyll?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.chlorophyll}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                      <span>
                        {fishermanLang === "hi" ? "विजिबिलिटी" : "Visibility"}: <span className="text-slate-800 font-extrabold">{conditionsData.visibility}</span>
                      </span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.visibility?.source_type || (conditionsData.live_available ? "estimated" : "default")}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.visibility}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Safe Return Window Banner */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-3xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                        {fishermanLang === "hi" ? "वापसी सलाह व समय खिड़की" : "Recommended Return Window Advice"}
                      </h4>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.safeReturnTime?.source_type || (conditionsData.live_available ? "estimated" : "default")}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.safeReturnTime}
                      />
                    </div>
                    <p className="text-xs text-slate-900 font-black mt-1 leading-normal">
                      {conditionsData.safeReturnTime}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      {fishermanLang === "hi" ? "यह सलाह ज्वार-भाटा चक्र एवं वायु वेग में संभावित गिरावट को ध्यान में रखकर तैयार की गई है।" : "Advisory matches the nearest diurnal high-tide & wind safety transition parameters."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tides Panel */}
              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Sunrise className="w-4 h-4 text-blue-600" />
                    {fishermanLang === "hi" ? `ज्वार-भाटा सारणी (${conditionsData.tides.port})` : `Tide Timings & Harbour Ref (${conditionsData.tides.port})`}
                    <ProvenanceBadge
                      type={conditionsData.provenance?.tides?.source_type || "default"}
                      language={fishermanLang}
                      detail={conditionsData.provenance?.tides}
                    />
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg font-bold border border-slate-200 uppercase tracking-wide">
                    {conditionsData.tides.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <div className="text-[11px] font-extrabold text-blue-700 mb-1 flex items-center gap-1.5 uppercase">
                      <Sunrise className="w-4 h-4" /> 
                      {fishermanLang === "hi" ? "उच्च ज्वार (High Tides)" : "High Tides"}
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {conditionsData.tides.high.join(" & ")}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <div className="text-[11px] font-extrabold text-cyan-700 mb-1 flex items-center gap-1.5 uppercase">
                      <Sunset className="w-4 h-4" /> 
                      {fishermanLang === "hi" ? "भाटा (Low Tides)" : "Low Tides"}
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {conditionsData.tides.low.join(" & ")}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TRIP & BOAT PLANNER */}
          {activeSubTab === "planner" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-600" />
                {fishermanLang === "hi" ? "नाव पूर्व-प्रस्थान यात्रा योजनाकार" : "Pre-Departure Boat & Trip Planner"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Boat Type Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    {fishermanLang === "hi" ? "नाव का प्रकार" : "Type of Boat"}
                  </label>
                  <select
                    value={boatType}
                    onChange={(e) => setBoatType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="non-motorized">{fishermanLang === "hi" ? "गैर-मशीनीकृत (कैटामरन)" : "Non-Motorized Traditional Craft"}</option>
                    <option value="motorized">{fishermanLang === "hi" ? "मशीनीकृत / ओबीएम (Motorized OBM)" : "Motorized Outboard Craft"}</option>
                    <option value="trawler">{fishermanLang === "hi" ? "बड़ा ट्रॉलर (Mechanized Trawler)" : "Mechanized Trawler / Large Vessel"}</option>
                  </select>
                </div>

                {/* Engine capacity / HP */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    {fishermanLang === "hi" ? "इंजन क्षमता (HP)" : "Engine Horsepower (HP)"}
                  </label>
                  <input
                    type="number"
                    value={engineHP}
                    disabled={boatType === "non-motorized"}
                    onChange={(e) => setEngineHP(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Fuel Available */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    {fishermanLang === "hi" ? "उपलब्ध ईंधन (लीटर)" : "Fuel Available (Liters)"}
                  </label>
                  <input
                    type="number"
                    value={fuelLiters}
                    disabled={boatType === "non-motorized"}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Crew Count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    {fishermanLang === "hi" ? "नाविकों की कुल संख्या" : "Crew Onboard Count"}
                  </label>
                  <input
                    type="number"
                    value={crewCount}
                    onChange={(e) => setCrewCount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Expected Duration */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    {fishermanLang === "hi" ? "यात्रा की अनुमानित अवधि (घंटे)" : "Planned Duration (Hours)"}
                  </label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Max safe distance */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    {fishermanLang === "hi" ? "तट से अधिकतम दूरी (km)" : "Planned Coast Distance (km)"}
                  </label>
                  <input
                    type="number"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Overdue Return Notification System */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">
                      {fishermanLang === "hi" ? "वापसी समय ट्रैकर एवं ओवरड्यू अलर्ट" : "Expected Return & Overdue Notification"}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {fishermanLang === "hi" ? "इंटरनेट न होने पर तटीय समिति को अलर्ट भेजेगा" : "Sends alerts to cooperatives if boat is overdue"}
                    </p>
                  </div>
                  <input
                    type="time"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overdueAlert}
                    onChange={(e) => setOverdueAlert(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {fishermanLang === "hi" ? "नाविक समिति / परिवार को 'ओवरड्यू' अलर्ट सक्रिय करें" : "Activate SMS fallback overdue alert to Cooperative/Family"}
                  </span>
                </label>

                {overdueAlert && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-2.5 rounded-xl text-[11px] font-semibold leading-normal">
                    {fishermanLang === "hi" 
                      ? `सक्रिय: यदि आप ${expectedReturn} तक वापस नहीं लौटे, तो एसएमएस/वायरलेस आधारित आपातकालीन पिंग सहकारी समिति और तटरक्षक को भेजा जाएगा।`
                      : `Active: Cooperative database will flag alert status if vessel is not returned at landing centre by ${expectedReturn}.`}
                  </div>
                )}
              </div>

              {/* Safe risk evaluation output */}
              {calculateTripRisk().length > 0 && (
                <div className="bg-rose-50 border border-rose-200 text-rose-950 p-3.5 rounded-2xl space-y-1">
                  <div className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5 uppercase">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
                    {fishermanLang === "hi" ? "यात्रा जोखिम आकलन" : "Trip Risk Warnings"}
                  </div>
                  <ul className="list-disc list-inside text-[11px] font-medium space-y-1 mt-1 leading-normal">
                    {calculateTripRisk().map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety Checklist Checklist Box */}
              <div className="space-y-2 pt-2 border-t border-slate-150">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <LifeBuoy className="w-4.5 h-4.5 text-orange-600" />
                  {fishermanLang === "hi" ? "सुरक्षा जीवन-रक्षक किट चेकलिस्ट" : "Required Safety Kit Checklist (Verify before venturing)"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "lifejackets", label: fishermanLang === "hi" ? `लाइफ जैकेट (कम से कम ${crewCount} संख्या)` : `Life jackets (min. ${crewCount} items)` },
                    { key: "water", label: fishermanLang === "hi" ? "पर्याप्त मीठा पानी (कम से कम 3L/व्यक्ति)" : "Drinking water (min. 3L/person)" },
                    { key: "fuel", label: fishermanLang === "hi" ? "अतिरिक्त बैकअप ईंधन/ऑयल" : "Reserve Fuel Container" },
                    { key: "firstaid", label: fishermanLang === "hi" ? "प्राथमिक उपचार (First-aid kit) डिब्बा" : "First-aid medical supplies" },
                    { key: "radio", label: fishermanLang === "hi" ? "VHF रेडियो / मोबाइल (SMS फ़ॉलबैक युक्त)" : "VHF Marine Radio / Mobile Phone" },
                    { key: "lights", label: fishermanLang === "hi" ? "आपातकालीन लाइट व रिफ्लेक्टर" : "Emergency lights and signaling torches" }
                  ].map((chk) => (
                    <button
                      key={chk.key}
                      onClick={() => toggleChecklist(chk.key)}
                      className={`p-2.5 border rounded-2xl text-left text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                        checklist[chk.key] 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs" 
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checklist[chk.key]}
                        readOnly
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded"
                      />
                      <span>{chk.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: POTENTIAL FISHING ZONE (PFZ) */}
          {activeSubTab === "pfz" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
                {fishermanLang === "hi" ? "संभावित मत्स्य क्षेत्र (INCOIS PFZ सलाह)" : "Potential Fishing Zone (INCOIS Sat-Advisory)"}
              </h2>

              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white space-y-3.5 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <Waves className="w-44 h-44 text-white" />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-[10px] bg-emerald-600 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {fishermanLang === "hi" ? "सैटेलाइट अनुकूलित जोन" : "Chlorophyll & SST Radar Match"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono opacity-85">{conditionsData.pfzCoordinates}</span>
                    <ProvenanceBadge
                      type={conditionsData.provenance?.pfzCoordinates?.source_type || "estimated"}
                      language={fishermanLang}
                      detail={conditionsData.provenance?.pfzCoordinates}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">
                    {fishermanLang === "hi" ? "मछली झुंड एकत्रण क्षेत्र संख्या-4" : "Target Aggregation Coordinates Zone-4"}
                  </h3>
                  <div className="text-xs opacity-90 flex items-center justify-between flex-wrap gap-1">
                    <span>
                      {fishermanLang === "hi" 
                        ? `पोर्ट ${conditionsData.locationName} से दूरी: ${conditionsData.pfzDistance} किमी (${conditionsData.pfzTravelTime} यात्रा समय)` 
                        : `Harbour Offset: ${conditionsData.pfzDistance} km (${conditionsData.pfzTravelTime} estimated travel time at 10 knots)`}
                    </span>
                    <ProvenanceBadge
                      type={conditionsData.provenance?.pfzDistance?.source_type || "estimated"}
                      language={fishermanLang}
                      detail={conditionsData.provenance?.pfzDistance}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div className="bg-white/5 p-2 rounded-xl text-center">
                    <div className="text-[9px] opacity-75 font-semibold uppercase">{fishermanLang === "hi" ? "क्लोरोफिल घनत्व" : "Chlorophyll"}</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                      <span>{conditionsData.chlorophyll} mg/m³</span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.chlorophyll?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.chlorophyll}
                      />
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl text-center">
                    <div className="text-[9px] opacity-75 font-semibold uppercase">{fishermanLang === "hi" ? "जल की गहराई" : "Bathymetry Depth"}</div>
                    <div className="text-sm font-black text-sky-300 mt-0.5 flex items-center justify-center gap-1">
                      <span>~{conditionsData.pfzDepth} meters</span>
                      <ProvenanceBadge
                        type={conditionsData.provenance?.pfzDepth?.source_type || "estimated"}
                        language={fishermanLang}
                        detail={conditionsData.provenance?.pfzDepth}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative advice */}
              <div className="bg-sky-50 border border-sky-200 text-sky-950 p-3.5 rounded-2xl text-xs font-medium leading-relaxed">
                <h4 className="font-extrabold text-sky-900 mb-1 flex items-center gap-1">
                  <Info className="w-4 h-4 text-sky-600" />
                  {fishermanLang === "hi" ? "मत्स्य संचयन का आधार" : "Science of Potential Fishing Zones (PFZ)"}
                </h4>
                <p>
                  {fishermanLang === "hi"
                    ? "उपग्रहों द्वारा समुद्र की सतह के तापमान (SST) के अंतर और क्लोरोफिल (फाइटोप्लांकटन की मौजूदगी) का विश्लेषण करके इन क्षेत्रों का पता लगाया जाता है। इन क्षेत्रों में मछलियाँ चारा ढूंढने के लिए भारी झुंड में आती हैं।"
                    : "INCOIS mapping combines Sea Surface Temperature (SST) gradients and ocean color satellites measuring chlorophyll (phytoplankton density) to locate fish-aggregation areas along continental shelf waters."}
                </p>
              </div>

              {/* PFZ Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-2xl text-xs font-semibold leading-relaxed">
                <strong className="text-amber-900">{fishermanLang === "hi" ? "महत्वपूर्ण सुरक्षा निर्देश:" : "Important Catch Guideline:"}</strong>{" "}
                {fishermanLang === "hi"
                  ? "PFZ सलाह केवल मछली संचयन का अनुमानित मार्गदर्शक है, यह मछली पकड़ने की कोई निश्चित गारंटी नहीं है। समुद्र की सुरक्षा स्थिति सर्वोपरि है; मौसम खराब होने पर किसी भी क्षेत्र में न जाएं।"
                  : "PFZ advisories serve as scientific guidance, NOT a guarantee of catch. Local port hazards and active safety storm conditions must always take absolute priority."}
              </div>

            </div>
          )}

          {/* TAB 4: SAFETY & EMERGENCY SOS */}
          {activeSubTab === "sos" && (
            <div className="space-y-4">
              
              {/* Massive Flashing SOS Box */}
              <div className="bg-rose-600 border border-rose-500 rounded-3xl p-5 text-white shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center animate-ping shrink-0">
                    <ShieldAlert className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight">
                      {fishermanLang === "hi" ? "आपातकालीन संकटकालीन SOS संचार" : "Active Emergency SOS Transmitter"}
                    </h2>
                    <p className="text-xs text-rose-100 opacity-90 mt-0.5">
                      {fishermanLang === "hi" ? "इंटरनेट न होने पर ऑटोमेटेड एसएमएस फ़ॉलबैक तैयार है" : "Pre-populated maritime emergency SMS builder"}
                    </p>
                  </div>
                </div>

                {/* Form to configure SOS */}
                <div className="bg-rose-700/60 p-4 rounded-2xl border border-rose-500/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-rose-100">{fishermanLang === "hi" ? "आपातकालीन समस्या" : "Problem Type"}</label>
                    <select
                      value={sosProblem}
                      onChange={(e) => setSosProblem(e.target.value)}
                      className="w-full p-2 bg-rose-900/40 text-white border border-rose-500/50 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option className="text-slate-800" value="Engine Failure">{fishermanLang === "hi" ? "इंजन की विफलता" : "Engine Failure"}</option>
                      <option className="text-slate-800" value="Medical Emergency">{fishermanLang === "hi" ? "चिकित्सीय आपातकाल" : "Medical Emergency"}</option>
                      <option className="text-slate-800" value="Man Overboard">{fishermanLang === "hi" ? "नाविक समुद्र में गिरा" : "Man Overboard"}</option>
                      <option className="text-slate-800" value="Vessel Damage or Leak">{fishermanLang === "hi" ? "नाव टूटना / लीकेज" : "Vessel Damage/Leak"}</option>
                      <option className="text-slate-800" value="Loss of Navigation">{fishermanLang === "hi" ? "दिशा भूलना" : "Loss of Navigation"}</option>
                      <option className="text-slate-800" value="Cyclone & Storm Wave">{fishermanLang === "hi" ? "तूफान और लहरें" : "Cyclone & Storm Wave"}</option>
                      <option className="text-slate-800" value="Fuel Shortage">{fishermanLang === "hi" ? "ईंधन की कमी" : "Fuel Shortage"}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-rose-100">{fishermanLang === "hi" ? "नाव का नाम/रजिस्ट्रेशन" : "Vessel Reg Name"}</label>
                    <input
                      type="text"
                      value={boatName}
                      onChange={(e) => setBoatName(e.target.value)}
                      className="w-full p-2 bg-rose-900/40 text-white border border-rose-500/50 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-rose-100">{fishermanLang === "hi" ? "कुल नाविक सदस्य" : "Crew Count Onboard"}</label>
                    <input
                      type="number"
                      value={sosCrew}
                      onChange={(e) => setSosCrew(e.target.value)}
                      className="w-full p-2 bg-rose-900/40 text-white border border-rose-500/50 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Message Payload */}
                <div className="bg-rose-900/80 p-3.5 rounded-2xl border border-rose-800 text-xs font-mono break-all space-y-1 relative">
                  <div className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">{fishermanLang === "hi" ? "एसएमएस फ़ॉलबैक संदेश विन्यास" : "SMS Payload (Offline SMS Fallback)"}</div>
                  <p className="text-rose-100">
                    SOS! EMERGENCY. Location: {conditionsData.coordinates.lat.toFixed(4)}°N, {conditionsData.coordinates.lng.toFixed(4)}°E. Boat: {boatName}. Crew: {sosCrew}. Problem: {sosProblem}. Need Immediate Assistance.
                  </p>
                  <button
                    onClick={handleCopySosMessage}
                    className="absolute right-2 top-2.5 px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 text-[10px] font-bold rounded-lg border border-rose-300 shadow transition active:scale-95 cursor-pointer"
                  >
                    {sosCopied ? (fishermanLang === "hi" ? "कॉपी हुआ!" : "Copied!") : (fishermanLang === "hi" ? "संदेश कॉपी करें" : "Copy SMS")}
                  </button>
                </div>

                {/* SMS Link fallback */}
                <a
                  href={`sms:1554?body=${encodeURIComponent(`SOS! Location: ${conditionsData.coordinates.lat.toFixed(4)}, ${conditionsData.coordinates.lng.toFixed(4)}. Boat: ${boatName}. Crew: ${sosCrew}. Problem: ${sosProblem}.`)}`}
                  className="w-full py-3 bg-white text-rose-800 hover:bg-rose-50 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
                >
                  <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" />
                  <span>{fishermanLang === "hi" ? "एसएमएस भेजें (तटरक्षक बल 1554)" : "Send SOS via Offline SMS (Coast Guard 1554)"}</span>
                </a>
              </div>

              {/* State customized directory */}
              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  {fishermanLang === "hi" ? `${emergencyContacts.state} आपातकालीन डायरेक्टरी` : `${emergencyContacts.state} Emergency Helpline Directory`}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5">
                    <LifeBuoy className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-slate-800">{fishermanLang === "hi" ? "भारतीय तटरक्षक बल (Coast Guard)" : "Indian Coast Guard SAR"}</div>
                      <a href={`tel:${emergencyContacts.coastGuard.split("/")[0].trim()}`} className="text-blue-700 font-black text-sm mt-0.5 block hover:underline">
                        {emergencyContacts.coastGuard}
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-slate-800">{fishermanLang === "hi" ? "राज्य आपदा प्रबंधन कक्ष" : "State Disaster Control Room"}</div>
                      <a href={`tel:${emergencyContacts.disasterControl.split("/")[0].trim()}`} className="text-blue-700 font-black text-sm mt-0.5 block hover:underline">
                        {emergencyContacts.disasterControl}
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5">
                    <Anchor className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-slate-800">{fishermanLang === "hi" ? "स्थानीय पत्तन/बंदरगाह कार्यालय" : "Local Harbour Control"}</div>
                      <div className="text-slate-800 font-extrabold text-xs mt-0.5">{emergencyContacts.harbourOffice}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5">
                    <PhoneCall className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-slate-800">{fishermanLang === "hi" ? "तटीय पुलिस स्टेशन" : "Coastal Helpline Police"}</div>
                      <a href="tel:1093" className="text-blue-700 font-black text-sm mt-0.5 block hover:underline">{emergencyContacts.police}</a>
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-150 rounded-2xl p-3.5 text-[11px] text-rose-950 font-semibold leading-relaxed">
                  {fishermanLang === "hi" 
                    ? "नोट: Mausam Mitra एप किसी बचाव अभियान का दावा नहीं करता है। आपातकाल में तुरंत आधिकारिक तटरक्षक (1554) या बंदरगाह नियंत्रक से संपर्क करें।"
                    : "Attention: The application is guidance and does not run independent rescue operations. Instantly contact Indian Coast Guard SAR at 1554."}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5 & 6 COMBINED: NAVIGATION, REGULATIONS & RISK EDUCATION */}
          {activeSubTab === "regulations" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  {fishermanLang === "hi" ? "समुद्री नेविगेशन एवं सरकारी कानून विनियम" : "Marine Hazards & Fishing Regulations Registry"}
                </h2>

                {/* State fishing seasonal ban card */}
                <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                        {fishermanLang === "hi" ? "सक्रिय सरकारी मत्स्यन प्रतिबंध (Seasonal Ban)" : "Active Government Conservation Ban Check"}
                      </h3>
                      <p className="text-xs font-black">{conditionsData.fishingBanAlert}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        {fishermanLang === "hi" ? "स्रोत: भारत सरकार पशुपालन और मत्स्य मंत्रालय (Monsoon Ban notifications)" : "Source: Ministry of Fisheries, Animal Husbandry & Dairying notifications."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hazards list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {fishermanLang === "hi" ? "स्थानीय तटीय बाधाएं एवं संरक्षित क्षेत्र" : "Local Sea Hazards & Prohibited Areas"}
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {fishermanLang === "hi" ? "पारिस्थितिक रूप से संवेदनशील क्षेत्र (Restricted zones)" : "Restricted Marine Protected Parks"}
                      </div>
                      <p className="text-slate-600 leading-normal font-semibold">
                        {conditionsData.restrictedAreas} {fishermanLang === "hi" ? "संरक्षित कोरल/कछुओं के क्षेत्रों में जाल फेंकना दण्डनीय अपराध है।" : "Traditional cast net restrictions applicable."}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {fishermanLang === "hi" ? "शिपिंग कॉरिडोर (Merchant Lanes)" : "Merchant Ship Routes & Anchorage"}
                      </div>
                      <p className="text-slate-600 leading-normal font-semibold">
                        {conditionsData.shippingLanes} {fishermanLang === "hi" ? "गहरे समुद्र में व्यापारिक जहाजों की गति तेज़ होती है, अपनी छोटी बोट दूर रखें।" : "Keep active watch on AIS tracking signals near deep shipping corridors."}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {fishermanLang === "hi" ? "तटीय रेतीले क्षेत्र और प्रवाल भित्तियाँ (Reefs & Sandbars)" : "Shallow Sandbars & Coastal Reefs"}
                      </div>
                      <p className="text-slate-600 leading-normal font-semibold">
                        {fishermanLang === "hi" 
                          ? "भाटा (Low tide) के समय बंदरगाह मुहाने पर बालू की दीवार बन सकती है। गहराई मापकर ही प्रवेश करें।" 
                          : "Low tide narrows clearance around harbor river-mouth entry points. Map drafts before crossing."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Explanation & Risk Education Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  {fishermanLang === "hi" ? "समुद्री मौसम विज्ञान और जोखिम शिक्षा" : "Marine Meteorology & Coastal Risk Education"}
                </h2>

                <div className="space-y-2">
                  {[
                    {
                      key: "q1",
                      q: fishermanLang === "hi" ? "लहर (Wave) और स्वेल (Swell) में क्या अंतर है?" : "What is the difference between normal Waves and Swells?",
                      a: fishermanLang === "hi" 
                        ? "सामान्य लहरें स्थानीय हवा की वजह से पैदा होती हैं। जबकि स्वेल (Swell) दूर गहरे समुद्र के तूफानों से उठने वाली बहुत लंबी और भारी लहरें होती हैं। अगर आपके क्षेत्र में स्थानीय हवा शांत है और बारिश भी नहीं हो रही है, तब भी खतरनाक गहरे समुद्र का 'स्वेल' आपकी नाव को पलटने की ताकत रखता है।"
                        : "Waves are created by local winds blowing over the water and are choppy and short. Swells are long-period waves generated by distant ocean storms hundreds of miles away. Swells can remain highly dangerous and capsize boats even when the local weather is clear, windless, and dry."
                    },
                    {
                      key: "q2",
                      q: fishermanLang === "hi" ? "2.5 मीटर ऊंची तरंग का छोटी नाव के लिए क्या मतलब है?" : "What does a 2.5-metre wave height mean for my fishing boat?",
                      a: fishermanLang === "hi"
                        ? "2.5 मीटर (करीब 8 फीट) की लहरें मध्यम से भारी श्रेणी में आती हैं। 25-30 HP से कम ओबीएम वाली मोटर चालित नावों के लिए यह अत्यंत खतरनाक स्थिति है। इसमें पानी सीधे नाव में भर सकता है या इंजन के साइलेंसर में जाकर नाव बंद हो सकती है।"
                        : "A 2.5-meter wave height (approx. 8 feet) represents a moderate-to-rough sea state. For small motorized outboard boats, this height is highly risky as cresting waves can easily swamp the hull, drown out the engine, or capsize the vessel."
                    },
                    {
                      key: "q3",
                      q: fishermanLang === "hi" ? "स्क्वॉल (Squall) क्या होता है और इससे कैसे बचें?" : "What is a squall and what action should I take?",
                      a: fishermanLang === "hi"
                        ? "स्क्वॉल अचानक उठने वाली भीषण हवा का झोंका है, जो भारी गरज-चमक और वर्षा के साथ आता है। इसकी वजह से समुद्री विजिबिलिटी (दृश्यता) घटकर शून्य के पास आ जाती है। यदि स्क्वॉल के लक्षण दिखें, तो तुरंत गति धीमी कर लंगर डालें और नाव की सुरक्षा रस्सी को बांधें।"
                        : "A squall is a sudden, sharp increase in wind speed lasting several minutes, often accompanied by heavy downpours and lightning. It causes immediate near-zero visibility at sea. If a squall hits, reduce speed immediately, secure loose deck gear, drop anchor if in shallow draft, and coordinate via VHF."
                    },
                    {
                      key: "q4",
                      q: fishermanLang === "hi" ? "मौसम विभाग की लाल चेतावनी (Red Alert) क्या है?" : "What does a meteorological Red Alert signify?",
                      a: fishermanLang === "hi"
                        ? "लाल चेतावनी (Red Alert) का सीधा अर्थ है अत्यंत गंभीर खतरा। इस समय समुद्र में चक्रवात या तूफानी हवाएं सक्रिय होती हैं। मछुआरों को समुद्र में जाने की सख्त मनाही होती है और बंदरगाह पर लाल झंडा (सिग्नल संख्या 3 या अधिक) लगाया जाता है।"
                        : "A Red Alert represents extreme, immediate danger of severe cyclones or sea states. Mechanized trawlers and small crafts are strictly barred from entering ocean channels. Port controllers display danger signals (Signal No. 3 or above) at harbor entries."
                    }
                  ].map((qa) => {
                    const isOpen = !!expandedQA[qa.key];
                    return (
                      <div key={qa.key} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all">
                        <button
                          onClick={() => toggleQA(qa.key)}
                          className="w-full p-3.5 text-left text-xs font-black text-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100"
                        >
                          <span>{qa.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3.5 text-xs text-slate-600 leading-relaxed font-semibold border-t border-slate-150 pt-2.5 bg-white">
                            {qa.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : null}

      {/* Persistent Static Disclaimer Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 text-center">
        <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
          <strong className="text-slate-700">{fishermanLang === "hi" ? "अस्वीकरण:" : "Safety Disclaimer:"}</strong>{" "}
          {t.disclaimer}
        </p>
      </div>

    </div>
  );
}
