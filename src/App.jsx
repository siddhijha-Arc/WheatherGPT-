import { useState, useEffect, useRef } from "react";
import i18n from "./i18n";
import { FreeWeatherMap } from "./components/FreeWeatherMap";
import { AppTopHeader } from "./components/AppTopHeader";
import { AppBottomNav } from "./components/AppBottomNav";
import { HomeDashboardView } from "./components/HomeDashboardView";
import { MyLocationButton } from "./components/MyLocationButton";
import { HazardLayerCard } from "./components/HazardLayerCard";
import { ActiveChatModal } from "./components/ActiveChatModal";
import { WeatherGPTChatView } from "./components/WeatherGPTChatView";
import { MoreModal } from "./components/MoreModal";
import { AuthModal } from "./components/AuthModal";
import { LocationSelectModal } from "./components/LocationSelectModal";
import { AlertsView } from "./components/AlertsView";
import { FarmerRadio } from "./components/FarmerRadio";
import { MapplsHubModal } from "./components/MapplsHubModal";
import { FishermanModeView } from "./components/FishermanModeView";
import { NigraniModeView } from "./components/NigraniModeView";
import { HealthWeatherHub } from "./components/HealthWeatherHub";
import { HelplineModal } from "./components/HelplineModal";
import { IrrigationSchedulerModal } from "./components/IrrigationSchedulerModal";
import { ModeSwitcherModal } from "./components/ModeSwitcherModal";
import { PruneDebugModal } from "./components/PruneDebugModal";
import { AddressLocationPage } from "./components/AddressLocationPage";
import { LoginPage } from "./components/LoginPage";
import { FloatingVoiceAssistant } from "./components/FloatingVoiceAssistant";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { saveWeatherToCache, getCachedWeather, getOfflineFallbackWeather } from "./lib/weatherCache";
import { getCurrentUser, isSupabaseConfigured } from "./lib/supabase";
import { MAJOR_INDIAN_CITIES } from "./data/indiaWeatherData";
import { fetchExactAddress, detectNetworkLocation, getPreciseUserLocation, searchExactLocations } from "./lib/geoAddressService";
import { translations, getTranslation, getWelcomeMessageContent } from "./lib/translations";
import { getLanguageConfig } from "./lib/languages";

export default function App() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("weathergpt_lang");
    return saved || "hi";
  });

  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState("home");
  const [location, setLocation] = useState(() => {
    const savedLat = localStorage.getItem("weathergpt_lat");
    const savedLng = localStorage.getItem("weathergpt_lng");
    const savedCity = localStorage.getItem("weathergpt_city");
    const savedState = localStorage.getItem("weathergpt_state");
    const savedStreet = localStorage.getItem("weathergpt_house_street");
    const savedPin = localStorage.getItem("weathergpt_pincode");
    const savedFormatted = localStorage.getItem("weathergpt_formatted_address");
    if (savedLat && savedLng) {
      return {
        lat: parseFloat(savedLat),
        lng: parseFloat(savedLng),
        city: savedCity || "New Delhi",
        state: savedState || "Delhi NCR",
        houseStreet: savedStreet || "",
        pincode: savedPin || "",
        formattedAddress: savedFormatted || (savedStreet ? `${savedStreet}, ${savedCity}, ${savedState}` : savedCity || "New Delhi, Delhi NCR"),
        country: "India"
      };
    }
    return {
      lat: 28.6139,
      lng: 77.209,
      city: "New Delhi",
      state: "Delhi NCR",
      houseStreet: "Central Secretariat, Rajpath Area",
      pincode: "110001",
      formattedAddress: "Central Secretariat, Rajpath Area, New Delhi, Delhi 110001",
      country: "India"
    };
  });
  const [targetZoom, setTargetZoom] = useState(6);
  const [isLocating, setIsLocating] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState("priority");
  const [hoveredProbe, setHoveredProbe] = useState({ value: null, unit: "" });
  const [tempUnit, setTempUnit] = useState("C");
  const [showStationNumbers, setShowStationNumbers] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState(0.85);
  const [mapStyle, setMapStyle] = useState("standard");
  const [mapplsHubOpen, setMapplsHubOpen] = useState(false);
  const [persona, setPersona] = useState(() => {
    return localStorage.getItem("weathergpt_persona") || "farmer";
  });
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome-1",
      role: "assistant",
      content: getWelcomeMessageContent(language),
      timestamp: (new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      persona: "farmer"
    }
  ]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && (prev[0].id === "welcome-1" || prev[0].role === "assistant")) {
        return [{
          ...prev[0],
          content: getWelcomeMessageContent(language)
        }];
      }
      return prev;
    });
  }, [language]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("weathergpt_auth_user") !== null;
  });
  const [showLoginPage, setShowLoginPage] = useState(() => {
    return localStorage.getItem("weathergpt_auth_user") === null;
  });
  const [showAddressPage, setShowAddressPage] = useState(() => {
    const hasAuth = localStorage.getItem("weathergpt_auth_user") !== null;
    const hasLoc = localStorage.getItem("weathergpt_has_location") === "true";
    return hasAuth && !hasLoc;
  });
  const [chatLoading, setChatLoading] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [farmerRadioOpen, setFarmerRadioOpen] = useState(false);
  const [irrigationModalOpen, setIrrigationModalOpen] = useState(false);
  const [helplineModalOpen, setHelplineModalOpen] = useState(false);
  const [modeModalOpen, setModeModalOpen] = useState(false);
  const [pruneDebugOpen, setPruneDebugOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("weathergpt_lang", lang);
    localStorage.setItem("weathergpt_language", lang);
    if (i18n && typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(lang);
    }
  };
  useEffect(() => {
    const init = async () => {
      setSupabaseConnected(isSupabaseConfigured());
      try {
        const storedUser = localStorage.getItem("weathergpt_auth_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn("Auth parse error:", err);
      }
      const u = await getCurrentUser();
      if (u) {
        const loggedUser = {
          email: u.email || "User",
          name: u.user_metadata?.name || u.email?.split("@")[0] || "User"
        };
        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem("weathergpt_auth_user", JSON.stringify(loggedUser));
      }
    };
    init();
  }, [authModalOpen]);
  const handleLogout = async () => {
    localStorage.removeItem("weathergpt_auth_user");
    try {
      await signOutUser();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    setUser(null);
    setIsAuthenticated(false);
    setShowLoginPage(true);
    setShowAddressPage(false);
    setAuthModalOpen(false);
    setMoreModalOpen(false);
  };

  const handlePersonaChange = (p, switchTab = false) => {
    setPersona(p);
    localStorage.setItem("weathergpt_persona", p);
    if (switchTab) {
      if (p === "fisherman") {
        setActiveTab("fisherman");
      } else {
        setActiveTab("home");
      }
    }
  };

  const handleUpdateLocation = (loc) => {
    if (!loc) return;
    const lat = Number(loc.lat);
    const lng = Number(loc.lng);
    const city = loc.city || loc.name || "Location";
    const state = loc.state || "India";
    const houseStreet = loc.houseStreet || loc.street || "";
    const district = loc.district || city;
    const pincode = loc.pincode || "";
    const formattedAddress = loc.formattedAddress || (state ? `${city}, ${state}, India` : `${city}, India`);

    const newLoc = {
      lat: isNaN(lat) ? 28.6139 : Number(lat.toFixed(6)),
      lng: isNaN(lng) ? 77.2090 : Number(lng.toFixed(6)),
      city,
      state,
      houseStreet,
      district,
      pincode,
      formattedAddress,
      country: loc.country || "India",
      accuracy: loc.accuracy || 25,
      isExactGPS: Boolean(loc.isExactGPS),
      source: loc.source || "user_pinpoint"
    };

    setLocation(newLoc);
    localStorage.setItem("weathergpt_lat", newLoc.lat.toString());
    localStorage.setItem("weathergpt_lng", newLoc.lng.toString());
    localStorage.setItem("weathergpt_city", newLoc.city);
    localStorage.setItem("weathergpt_state", newLoc.state);
    localStorage.setItem("weathergpt_house_street", newLoc.houseStreet);
    localStorage.setItem("weathergpt_pincode", newLoc.pincode);
    localStorage.setItem("weathergpt_formatted_address", newLoc.formattedAddress);
    localStorage.setItem("weathergpt_has_location", "true");

    try {
      const existing = JSON.parse(localStorage.getItem("weathergpt_recent_locations") || "[]");
      const filtered = existing.filter(item => (item?.city || "").toLowerCase() !== newLoc.city.toLowerCase());
      const updated = [newLoc, ...filtered].slice(0, 3);
      localStorage.setItem("weathergpt_recent_locations", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Only auto-locate via GPS if user has not explicitly chosen/saved a location before
    const hasSaved = localStorage.getItem("weathergpt_has_location") === "true";
    if (!hasSaved) {
      handleLocateUser(false);
    }
  }, []);

  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const lastScrollPositionsRef = useRef(new WeakMap());
  const touchStartYRef = useRef(0);

  // Automatically reset nav visibility on view/tab switch
  useEffect(() => {
    setIsBottomNavVisible(true);
  }, [activeTab]);

  // Global smart scroll & touch listeners: hide bottom nav when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target === document ? (document.scrollingElement || document.documentElement) : e.target;
      if (!target || typeof target.scrollTop !== "number") return;

      const currentScrollTop = target.scrollTop;
      const prevScrollTop = lastScrollPositionsRef.current.get(target) ?? currentScrollTop;
      const diff = currentScrollTop - prevScrollTop;

      // When near the very top of any scroll container, always keep visible
      if (currentScrollTop < 50) {
        setIsBottomNavVisible(true);
      } else if (Math.abs(diff) > 8) {
        if (diff > 0) {
          // Scrolling down -> hide bottom bar
          setIsBottomNavVisible(false);
        } else if (diff < 0) {
          // Scrolling up -> reveal bottom bar
          setIsBottomNavVisible(true);
        }
      }

      lastScrollPositionsRef.current.set(target, currentScrollTop);
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const currentY = e.touches[0].clientY;
        const diff = touchStartYRef.current - currentY; // diff > 0 => swiping upward (scrolling down page)

        if (diff > 25) {
          setIsBottomNavVisible(false);
        } else if (diff < -25) {
          setIsBottomNavVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Cancel any ongoing speech synthesis immediately whenever leaving the chat view
  useEffect(() => {
    if (activeTab !== "chat" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const query = new URLSearchParams({
          lat: location.lat.toString(),
          lng: location.lng.toString(),
          city: location.city
        });
        const res = await fetch(`/api/weather/current?${query.toString()}`);
        if (!res.ok) throw new Error("Weather fetch error");
        const data = await res.json();
        if (isMounted) {
          setWeather(data);
          saveWeatherToCache(location, data);
        }
      } catch (err) {
        console.warn("Weather fetch offline or failed, attempting cache recovery:", err);
        if (isMounted) {
          const cached = getCachedWeather(location);
          if (cached) {
            setWeather(cached);
          } else {
            setWeather(getOfflineFallbackWeather(location));
          }
        }
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    };
    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lng, location.city]);

  const handleLocateUser = async (showAlert = true) => {
    setIsLocating(true);
    try {
      const preciseLoc = await getPreciseUserLocation(language);
      setIsLocating(false);
      if (preciseLoc && preciseLoc.lat && preciseLoc.lng) {
        setTargetZoom(15);
        handleUpdateLocation(preciseLoc);
      } else if (showAlert) {
        setShowAddressPage(true);
      }
    } catch (err) {
      console.warn("Precise location acquisition error, attempting network IP fallback:", err);
      try {
        const netLoc = await detectNetworkLocation(language);
        setIsLocating(false);
        if (netLoc && netLoc.lat && netLoc.lng) {
          setTargetZoom(13.5);
          handleUpdateLocation(netLoc);
          return;
        }
      } catch (e) {
        console.warn("Network IP detection also failed:", e);
      }
      setIsLocating(false);
      if (showAlert) {
        setShowAddressPage(true);
      }
    }
  };

  const handleSearchLocationOrQuery = async (query) => {
    if (!query) return;
    const clean = query.trim();

    // 1. Check if 6-digit Indian PIN Code
    if (/^\d{6}$/.test(clean)) {
      try {
        const res = await fetch(`/api/pincode/${clean}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const foundDistrict = po.District || po.Block || po.Circle;
            const foundState = po.State || "India";
            const lat = po.Latitude ? parseFloat(po.Latitude) : location.lat;
            const lng = po.Longitude ? parseFloat(po.Longitude) : location.lng;
            handleUpdateLocation({
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
              city: foundDistrict || clean,
              state: foundState,
              pincode: clean,
              formattedAddress: `${po.Name || clean}, ${foundDistrict}, ${foundState} - ${clean}`,
              accuracy: 50,
              isExactGPS: false,
              source: "pincode_pinpoint"
            });
            setTargetZoom(14.5);
            return;
          }
        }
      } catch (e) {
        console.warn("Pincode search error:", e);
      }
    }

    // 2. Check predefined cities match
    const matchedCity = MAJOR_INDIAN_CITIES.find(
      (c) =>
        (c.city || "").toLowerCase() === clean.toLowerCase() ||
        (c.cityHi && c.cityHi.toLowerCase() === clean.toLowerCase())
    );
    if (matchedCity) {
      handleUpdateLocation({
        lat: Number(matchedCity.lat.toFixed(6)),
        lng: Number(matchedCity.lng.toFixed(6)),
        city: matchedCity.city,
        state: matchedCity.state,
        formattedAddress: `${matchedCity.city}, ${matchedCity.state}, India`,
        accuracy: 100,
        isExactGPS: false,
        source: "major_city_match"
      });
      setTargetZoom(14);
      return;
    }

    // 3. Search exact places via geocoding
    try {
      const results = await searchExactLocations(clean, language);
      if (results && results.length > 0) {
        const top = results[0];
        handleUpdateLocation({
          lat: Number(top.lat.toFixed(6)),
          lng: Number(top.lng.toFixed(6)),
          city: top.city || top.name,
          state: top.state || "India",
          pincode: top.pincode || "",
          formattedAddress: top.formattedAddress || top.name,
          accuracy: 50,
          isExactGPS: false,
          source: "search_pinpoint"
        });
        setTargetZoom(14.5);
        return;
      }
    } catch (e) {
      console.warn("Search location geocoding error:", e);
    }

    // 4. Default: Query Mausam Mitra AI Chat
    handleSendMessage(query);
  };
  const speakResponse = (text, targetLang = language) => {
    if (!window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[*#_`~>]/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .trim();
      if (!cleanText) return;

      const langConfig = getLanguageConfig(targetLang);
      const ttsLangCode = langConfig?.ttsLang || "hi-IN";

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = ttsLangCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      if (window.speechSynthesis.getVoices) {
        const voices = window.speechSynthesis.getVoices();
        const codePrefix = targetLang.toLowerCase();
        const targetVoice = voices.find(
          (v) =>
            (v.lang || "").toLowerCase().startsWith(codePrefix) ||
            (v.lang || "").toLowerCase().includes(codePrefix) ||
            (v.name || "").toLowerCase().includes(langConfig.name.toLowerCase())
        ) || voices.find((v) => (v.lang || "").toLowerCase().includes("hi") || (v.lang || "").toLowerCase().includes("en"));
        if (targetVoice) utterance.voice = targetVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS Error:", err);
    }
  };

  const handleSendMessage = async (text) => {
    setActiveTab("chat");
    setChatModalOpen(false);
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const payload = {
        prompt: text,
        message: text,
        persona,
        location,
        weatherContext: weather,
        currentWeather: weather,
        language,
        history: messages.slice(-6).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }))
      };
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("AI Error");
      const data = await res.json();
      const replyContent = data.reply || data.response || (language === "hi" ? "मौसम जानकारी प्राप्त हुई।" : "Weather information updated.");
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackContent = language === "hi" ? `**${location.city} मौसम बुलेटिन:**
• **तापमान**: ${weather?.temp || 34}°C (${weather?.condition || "साफ़"}) | **आर्द्रता**: ${weather?.humidity || 60}%
• **कृषि परामर्श**: फसलों में आवश्यकतानुसार हल्की सिंचाई करें एवं दोपहर के समय पशुओं को छायादार स्थान पर रखें।` : `**${location.city} Weather Report:**
• **Temperature**: ${weather?.temp || 34}°C (${weather?.condition || "Clear"}) | **Humidity**: ${weather?.humidity || 60}%
• **Advisory**: Conduct routine agricultural operations and maintain proper hydration during peak daylight hours.`;
      const fallbackMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fallbackContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakResponse(fallbackContent);
    } finally {
      setChatLoading(false);
    }
  };
  const handleStartVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const fallbackQuery = prompt(t.searchPlaceholder || "Enter your weather question:");
      if (fallbackQuery) handleSendMessage(fallbackQuery);
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      const langConfig = getLanguageConfig(language);
      recognition.lang = langConfig?.ttsLang || "hi-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        setIsListening(true);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSendMessage(transcript);
        }
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };
  // 1. Initial Page: Authentication & Login
  if (showLoginPage && !isAuthenticated) {
    return (
      <LoginPage
        language={language}
        onLanguageChange={handleLanguageChange}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          setIsAuthenticated(true);
          setShowLoginPage(false);
          const hasLocation = localStorage.getItem("weathergpt_has_location") === "true";
          if (!hasLocation) {
            setShowAddressPage(true);
          }
        }}
        onSkip={() => {
          setIsAuthenticated(true);
          setShowLoginPage(false);
          const hasLocation = localStorage.getItem("weathergpt_has_location") === "true";
          if (!hasLocation) {
            setShowAddressPage(true);
          }
        }}
      />
    );
  }

  // 2. Second Page: Address & Location Detection
  const hasSavedLocation = localStorage.getItem("weathergpt_has_location") === "true";
  if (showAddressPage || (isAuthenticated && !hasSavedLocation)) {
    return (
      <AddressLocationPage
        currentLocation={location}
        canGoBack={hasSavedLocation}
        onSaveLocation={(savedLoc) => {
          handleUpdateLocation(savedLoc);
          setShowAddressPage(false);
        }}
        onBack={() => {
          if (hasSavedLocation) {
            setShowAddressPage(false);
          }
        }}
        language={language}
      />
    );
  }

  return (
    <div
      id="weathergpt-app-root"
      className="relative w-full h-screen h-[100dvh] overflow-hidden bg-slate-100 font-sans text-slate-800 flex flex-col"
    >
      {/* Offline Connectivity & Rural Caching Status Bar */}
      <OfflineIndicator
        weather={weather}
        language={language}
        onRetry={() => {
          setWeatherLoading(true);
        }}
      />

      {/* 1. DOCKED TOP HEADER (Hidden in dedicated full-screen chat mode) */}
      {activeTab !== "chat" && (
        <AppTopHeader
          location={location}
          weather={weather}
          onLocateUser={() => handleLocateUser(true)}
          isLocating={isLocating}
          activeLayer={activeLayer}
          onLayerChange={(l) => setActiveLayer(l)}
          onSearchSubmit={handleSearchLocationOrQuery}
          onOpenProfile={() => setAuthModalOpen(true)}
          onOpenLocationModal={() => setShowAddressPage(true)}
          onOpenMoreModal={() => setMoreModalOpen(true)}
          onOpenMapplsHub={() => setMapplsHubOpen(true)}
          language={language}
          onLanguageChange={handleLanguageChange}
          user={user}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenChat={() => setActiveTab("chat")}
        />
      )}

      {
    /* 2. MAIN SCROLLABLE / INTERACTIVE CONTENT AREA */
  }
      <main id="app-main-viewport" className="flex-1 w-full overflow-hidden relative flex flex-col">
        {/* CHAT VIEW: Dedicated Full WeatherGPT Chat Interface */}
        {activeTab === "chat" && (
          <WeatherGPTChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={chatLoading}
            location={location}
            weather={weather}
            persona={persona}
            onPersonaChange={handlePersonaChange}
            language={language}
            onClearChat={() => setMessages([])}
            onOpenProfile={() => setAuthModalOpen(true)}
            onClose={() => {
              if ("speechSynthesis" in window) {
                try {
                  window.speechSynthesis.cancel();
                } catch (e) {
                  // ignore
                }
              }
              setActiveTab("home");
            }}
          />
        )}

        {
    /* HOME VIEW: Smoothly scrollable without accidentally panning the map */
  }
        {activeTab === "home" && <div className="flex-1 w-full overflow-y-auto overscroll-contain">
            <HomeDashboardView
              location={location}
              onLocationChange={handleUpdateLocation}
              weather={weather}
              weatherLoading={weatherLoading}
              activeLayer={activeLayer}
              onLayerChange={(l) => setActiveLayer(l)}
              onAskAI={(q) => handleSendMessage(q)}
              onOpenChat={() => setActiveTab("chat")}
              onStartVoice={handleStartVoice}
              isListening={isListening}
              onOpenFarmerRadio={() => setFarmerRadioOpen(true)}
              onOpenIrrigationScheduler={() => setActiveTab("irrigation")}
              onOpenAlerts={() => setActiveTab("alerts")}
              onOpenHealth={() => setActiveTab("health")}
              onOpenLocationModal={() => setShowAddressPage(true)}
              onOpenFullMap={() => setActiveTab("map")}
              onOpenMapplsHub={() => setMapplsHubOpen(true)}
              mapStyle={mapStyle}
              tempUnit={tempUnit}
              showStationNumbers={showStationNumbers}
              layerOpacity={layerOpacity}
              targetZoom={targetZoom}
              language={language}
              persona={persona}
              onPersonaChange={(p) => handlePersonaChange(p, false)}
              onTabChange={(tab) => setActiveTab(tab)}
            />
          </div>}

        {/* MAP VIEW: Full-height interactive Leaflet meteorological map */}
        {activeTab === "map" && (
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <FreeWeatherMap
              location={location}
              onLocationChange={handleUpdateLocation}
              activeLayer={activeLayer}
              onLayerChange={(l) => setActiveLayer(l)}
              weather={weather}
              language={language}
              onHoverProbe={(val, unit) => setHoveredProbe({ value: val, unit })}
              tempUnit={tempUnit}
              showStationNumbers={showStationNumbers}
              layerOpacity={layerOpacity}
              targetZoom={targetZoom}
              mapStyle={mapStyle}
              onOpenMapplsHub={() => setMapplsHubOpen(true)}
            />
          </div>
        )}

        {/* FISHERMAN MODE VIEW */}
        {activeTab === "fisherman" && (
          <div className="flex-1 w-full overflow-y-auto">
            <FishermanModeView language={language} initialLocation={location} />
          </div>
        )}

        {/* NIGRANI MODE VIEW */}
        {activeTab === "nigrani" && (
          <div className="flex-1 w-full overflow-y-auto">
            <NigraniModeView
              location={location}
              persona={persona}
              language={language}
              weather={weather}
              onTabChange={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

        {/* HEALTH & WELLNESS VIEW */}
        {(activeTab === "health" || activeTab === "mode") && (
          <div className="flex-1 w-full overflow-y-auto">
            <HealthWeatherHub
              location={location}
              weather={weather}
              language={language}
              onTabChange={(tab) => setActiveTab(tab)}
              onAskAI={(q) => handleSendMessage(q)}
            />
          </div>
        )}

        {/* SMART IRRIGATION & CROP ACTION PLANNER - FULL DEDICATED PAGE VIEW */}
        {activeTab === "irrigation" && (
          <div className="flex-1 w-full overflow-y-auto">
            <IrrigationSchedulerModal
              isOpen={true}
              onClose={() => setActiveTab("home")}
              location={location}
              weather={weather}
              language={language}
              onAskAI={handleSendMessage}
              isFullPage={true}
              onToggleFullPage={() => {
                setActiveTab("home");
                setIrrigationModalOpen(true);
              }}
            />
          </div>
        )}

        {/* ALERTS VIEW */}
        {activeTab === "alerts" && (
          <div className="flex-1 w-full overflow-y-auto p-3 sm:p-6 max-w-6xl mx-auto pb-36 sm:pb-36">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  {language === "hi" ? "सक्रिय राष्ट्रीय आपदा एवं मौसम चेतावनियाँ" : "Active Meteorological Hazard Warnings & Alerts"}
                </span>
                <button
                  onClick={() => setActiveTab("home")}
                  className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
                >
                  {t.close}
                </button>
              </div>
              <AlertsView language={language} location={location} weather={weather} />
            </div>
          </div>
        )}

        {/* HISTORY / CHAT VIEW */}
        {activeTab === "history" && (
          <div className="flex-1 w-full overflow-y-auto p-3 sm:p-6 max-w-4xl mx-auto pb-36 sm:pb-36">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-bold text-base sm:text-lg text-slate-900 block">
                    {language === "hi" ? "सलाह एवं चैट इतिहास" : "Weather & Farming Advisory History"}
                  </span>
                  <span className="text-xs text-slate-400">Previous questions & AI agricultural insights</span>
                </div>
                <button
                  onClick={() => setActiveTab("chat")}
                  className="text-xs font-semibold px-3.5 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Open Live Chat
                </button>
              </div>
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl text-xs sm:text-sm ${
                      m.role === "user"
                        ? "bg-blue-600 text-white ml-auto max-w-[85%] sm:max-w-[70%]"
                        : "bg-slate-50 text-slate-800 border border-slate-200 mr-auto max-w-[90%] sm:max-w-[80%]"
                    }`}
                  >
                    <div className="font-semibold text-[10px] opacity-70 mb-1">
                      {m.role === "user" ? "You" : "WeatherGPT Assistant"} • {m.timestamp}
                    </div>
                    <div className="whitespace-pre-line leading-relaxed">{m.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>



      {/* 3. DOCKED BOTTOM NAVIGATION (Hidden in dedicated full-screen chat mode, hides on scroll down, shows on scroll up) */}
      {activeTab !== "chat" && (
        <AppBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenChat={() => setActiveTab("chat")}
          onOpenMode={() => setActiveTab("health")}
          onOpenHelpline={() => setHelplineModalOpen(true)}
          onOpenMore={() => setMoreModalOpen(true)}
          language={language}
          isVisible={isBottomNavVisible}
        />
      )}

      {
    /* --- SECONDARY MODALS & VIEWS --- */
  }

      {
    /* AI Chat Dialog */
  }
      <ActiveChatModal
    isOpen={chatModalOpen}
    onClose={() => setChatModalOpen(false)}
    messages={messages}
    onSendMessage={handleSendMessage}
    isLoading={chatLoading}
    persona={persona}
    location={location}
    weather={weather}
    onClearChat={() => setMessages([])}
    isListening={isListening}
    onStartVoice={handleStartVoice}
    language={language}
  />

      {/* More Options & Settings Modal (Houses shifted clutter-free features) */}
      <MoreModal
        isOpen={moreModalOpen}
        onClose={() => setMoreModalOpen(false)}
        persona={persona}
        onPersonaChange={handlePersonaChange}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenFarmerRadio={() => setFarmerRadioOpen(true)}
        onOpenIrrigationScheduler={() => setActiveTab("irrigation")}
        onOpenMapplsHub={() => setMapplsHubOpen(true)}
        onOpenPruneDebug={() => setPruneDebugOpen(true)}
        language={language}
        onLanguageChange={handleLanguageChange}
        tempUnit={tempUnit}
        onTempUnitChange={(u) => setTempUnit(u)}
        showStationNumbers={showStationNumbers}
        onToggleStationNumbers={() => setShowStationNumbers(!showStationNumbers)}
        layerOpacity={layerOpacity}
        onLayerOpacityChange={(op) => setLayerOpacity(op)}
      />

      <PruneDebugModal
        isOpen={pruneDebugOpen}
        onClose={() => setPruneDebugOpen(false)}
        language={language}
      />

      {
    /* Alerts View Modal */
  }
      {activeTab === "alerts" && <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white text-slate-800 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl h-[85vh] sm:h-[650px] overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                {language === "hi" ? "\u0938\u0915\u094D\u0930\u093F\u092F \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0906\u092A\u0926\u093E \u090F\u0935\u0902 \u092E\u094C\u0938\u092E \u091A\u0947\u0924\u093E\u0935\u0928\u093F\u092F\u093E\u0901" : "Active Meteorological Hazard Warnings"}
              </span>
              <button
    onClick={() => setActiveTab("home")}
    className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl cursor-pointer transition-colors shadow-2xs"
  >
                {t.close}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <AlertsView language={language} />
            </div>
          </div>
        </div>}

      {
    /* Farmer Radio Modal */
  }
      {farmerRadioOpen && <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white text-slate-800 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="font-bold text-base text-slate-900">{t.farmerRadioTitle}</span>
              <button
    onClick={() => setFarmerRadioOpen(false)}
    className="text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer"
  >
                {t.close}
              </button>
            </div>
            <FarmerRadio location={location} weather={weather} language={language} />
          </div>
        </div>}

      {/* Supabase / Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        onLogout={handleLogout}
        onUserUpdate={(u) => {
          setUser(u);
          if (!u) {
            handleLogout();
          }
        }}
      />

      {
    /* City / Location Picker Modal */
  }
      <LocationSelectModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={handleUpdateLocation}
        onLocateGPS={handleLocateUser}
        isLocating={isLocating}
        language={language}
      />

      {/* Mappls MapmyIndia Features & Static Maps Hub Modal */}
      <MapplsHubModal
        isOpen={mapplsHubOpen}
        onClose={() => setMapplsHubOpen(false)}
        location={location}
        weather={weather}
        currentMapStyle={mapStyle}
        onSelectMapStyle={(style) => setMapStyle(style)}
        onSelectLocation={handleUpdateLocation}
        language={language}
      />

      {/* Emergency & Weather Helplines Modal */}
      <HelplineModal
        isOpen={helplineModalOpen}
        onClose={() => setHelplineModalOpen(false)}
        language={language}
      />

      {/* Smart Irrigation Scheduler Modal */}
      <IrrigationSchedulerModal
        isOpen={irrigationModalOpen}
        onClose={() => setIrrigationModalOpen(false)}
        location={location}
        weather={weather}
        language={language}
        onAskAI={handleSendMessage}
        isFullPage={false}
        onToggleFullPage={() => {
          setIrrigationModalOpen(false);
          setActiveTab("irrigation");
        }}
      />

      {/* Mode & Persona Switcher Modal */}
      <ModeSwitcherModal
        isOpen={modeModalOpen}
        onClose={() => setModeModalOpen(false)}
        persona={persona}
        onPersonaChange={handlePersonaChange}
        language={language}
      />
    </div>
  );
}
