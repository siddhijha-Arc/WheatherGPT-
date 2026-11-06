import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Rotate3d,
  RotateCcw,
  Sparkles,
  Compass,
  X,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  MessageSquare,
  ChevronRight,
  Move,
  Bot,
  HelpCircle,
  Zap,
  CloudRain,
  Sun,
  Wind,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Repeat
} from "lucide-react";
import { getLanguageConfig } from "../lib/languages";
import { getTranslation } from "../lib/translations";

/**
 * FloatingVoiceAssistant
 * 
 * Floating voice assistant anchored by default to the upper-left corner of the viewport.
 * Features:
 *  - 3D rotatable cartoon weather avatar ("Mausam Mitra" Cloud Bot) that user can freely rotate in every direction (X, Y, Z axes).
 *  - Drag-and-rotate with mouse / touch gestures + 360° directional controls and auto-spin mode.
 *  - Draggable across the screen with a "Reset to Upper-Left" action.
 *  - Real-time speech recognition (Web Speech API) + Gemini AI live meteorological reasoning.
 *  - Text-to-Speech (TTS) voice playback with animated speech expressions in Hindi and English.
 *  - Quick question chips and full-chat integration.
 */
export function FloatingVoiceAssistant({
  location,
  weather,
  persona = "farmer",
  language = "en",
  isOpen,
  onToggleOpen,
  onOpenFullChat,
  onOpenAlerts,
  onLocationChange
}) {
  const isHi = language === "hi";

  // --- POSITIONING STATE (Default: Upper Left Corner) ---
  const [position, setPosition] = useState(() => {
    // Upper-left corner default with safe header clearance
    return { x: 20, y: 78 };
  });
  const [isDraggingPos, setIsDraggingPos] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, hasMoved: false });

  // --- AVATAR 3D ROTATION STATE ---
  // rotX: Pitch (up/down), rotY: Yaw (left/right), rotZ: Roll (tilt)
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isRotating3D, setIsRotating3D] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const rotateStartRef = useRef({ clientX: 0, clientY: 0, startX: 0, startY: 0, hasRotated: false });
  const autoSpinAnimRef = useRef(null);

  // --- UI EXPANSION & INTERACTION STATE ---
  const [isExpandedInternal, setIsExpandedInternal] = useState(false);
  const isExpanded = isOpen !== undefined ? isOpen : isExpandedInternal;
  const [isFullScreen, setIsFullScreen] = useState(false);

  const setExpandedState = useCallback(
    (val) => {
      setIsExpandedInternal(val);
      if (onToggleOpen) {
        onToggleOpen(val);
      }
    },
    [onToggleOpen]
  );

  const [showRotationControls, setShowRotationControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  // --- CONFIGURABLE BARGE-IN & ACOUSTIC VAD THRESHOLDS ---
  const [voiceThreshold, setVoiceThreshold] = useState(35); // VAD volume threshold (1-100 scale)
  const [bargeInDuration, setBargeInDuration] = useState(250); // Duration in ms above threshold to trigger barge-in (200-300ms default)
  const [bargeInStatus, setBargeInStatus] = useState(""); // User feedback overlay when barge-in triggers
  const [showSettings, setShowSettings] = useState(false); // Toggle acoustic threshold controls panel

  // --- VOICE & AI STATE ---
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantResponse, setAssistantResponse] = useState(() => {
    return isHi
      ? "नमस्ते! मैं मौसम मित्र हूँ। कोई भी सवाल पूछने के लिए माइक दबाएं।"
      : "Hello! I am Mausam Mitra. Tap the mic to ask any weather question.";
  });

  const recognitionRef = useRef(null);
  const containerRef = useRef(null);
  const vadStreamRef = useRef(null);
  const vadIntervalRef = useRef(null);
  const activeAudioRef = useRef(null);

  // --- VOICE ACTIVITY DETECTION (VAD) INTERRUPT / BARGE-IN EFFECT ---
  useEffect(() => {
    if (isSpeaking && !isMuted) {
      let consecutiveOverCount = 0;
      const checkIntervalMs = 50;
      const requiredConsecutive = Math.ceil(bargeInDuration / checkIntervalMs);

      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }).then((stream) => {
        vadStreamRef.current = stream;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        vadIntervalRef.current = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const averageVolume = sum / bufferLength;

          // Scale average volume to a user-friendly 0-100 range
          const scaledVolume = (averageVolume / 255) * 100;

          if (scaledVolume >= voiceThreshold) {
            consecutiveOverCount++;
            if (consecutiveOverCount >= requiredConsecutive) {
              // Trigger Barge-In / Interruption!
              clearInterval(vadIntervalRef.current);
              if (vadStreamRef.current) {
                vadStreamRef.current.getTracks().forEach(track => track.stop());
              }
              audioContext.close().catch(() => {});

              // Instantly stop the current speaking audio
              if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              setIsSpeaking(false);
              setBargeInStatus(isHi ? "सुना! बोलना बंद किया।" : "Interrupted! Listening...");
              setTimeout(() => setBargeInStatus(""), 2500);

              // Seamlessly transition to listening to process the interruption as a new request
              startListening();
            }
          } else {
            consecutiveOverCount = 0;
          }
        }, checkIntervalMs);
      }).catch((err) => {
        console.warn("VAD getUserMedia initialization failed:", err);
      });
    }

    return () => {
      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
      }
      if (vadStreamRef.current) {
        vadStreamRef.current.getTracks().forEach(track => track.stop());
        vadStreamRef.current = null;
      }
    };
  }, [isSpeaking, isMuted, voiceThreshold, bargeInDuration, isHi]);

  // Synchronize initial response on language change if in initial state
  useEffect(() => {
    if (!isThinking && !isSpeaking) {
      setAssistantResponse(
        isHi
          ? "नमस्ते! मैं आपका 3D मौसम मित्र हूँ। मुझसे कल की बारिश, आज के तापमान या फसल सलाह के बारे में पूछें!"
          : "Hello! I am your 3D Mausam Mitra. Ask me about rain forecasts, temperature, or farming tips!"
      );
    }
  }, [isHi]);

  // Global event listener for 1-click access from anywhere in the app
  useEffect(() => {
    const handleGlobalOpen = (e) => {
      setExpandedState(true);
      if (e?.detail?.startMic) {
        setTimeout(() => {
          startListening();
        }, 150);
      }
    };

    const handleKeyDown = (e) => {
      // If user is not focused on an input or textarea, press 'm' or 'M' to open Mausam Mitra
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setExpandedState(!isExpanded);
      }
    };

    window.addEventListener("open-mausam-mitra", handleGlobalOpen);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-mausam-mitra", handleGlobalOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setExpandedState, isExpanded]);

  // --- AUTO-SPIN ANIMATION LOOP ---
  useEffect(() => {
    if (isAutoSpinning) {
      let lastTime = performance.now();
      const loop = (currentTime) => {
        const delta = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        setRotation((prev) => ({
          x: prev.x,
          y: (prev.y + delta * 45) % 360,
          z: prev.z
        }));
        autoSpinAnimRef.current = requestAnimationFrame(loop);
      };
      autoSpinAnimRef.current = requestAnimationFrame(loop);
    } else if (autoSpinAnimRef.current) {
      cancelAnimationFrame(autoSpinAnimRef.current);
    }
    return () => {
      if (autoSpinAnimRef.current) cancelAnimationFrame(autoSpinAnimRef.current);
    };
  }, [isAutoSpinning]);

  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (err) {
        console.warn("Error pausing active audio ref:", err);
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
      
      if (useESpeakBackup) {
        // --- TERTIARY: eSpeak NG Lightweight Offline Backup Simulation ---
        // Metallic, flat, robotic voice parameters
        utterance.rate = 1.35;
        utterance.pitch = 0.5; // low, robotic monotone pitch
        utterance.lang = "en-US"; // Standard lightweight eSpeak accent fallback
        
        if (window.speechSynthesis.getVoices) {
          const voices = window.speechSynthesis.getVoices();
          // Prefer any robotic, offline, or generic synthesizer voice matching espeak / lightweight profiles
          const eSpeakVoice = voices.find(v => 
            v.name.toLowerCase().includes("espeak") || 
            v.name.toLowerCase().includes("robotic") || 
            v.name.toLowerCase().includes("local")
          );
          if (eSpeakVoice) utterance.voice = eSpeakVoice;
        }
      } else {
        // --- SECONDARY: Browser Web Speech API (Immediate Fallback) ---
        utterance.rate = speechRate;
        utterance.pitch = 1.1;
        const langConfig = getLanguageConfig(language);
        utterance.lang = langConfig?.ttsLang || (ttsLang === "hi" ? "hi-IN" : "en-IN");

        if (window.speechSynthesis.getVoices) {
          const voices = window.speechSynthesis.getVoices();
          const targetPrefix = (language || ttsLang || "hi").toLowerCase();
          const matchedVoice = voices.find(v => 
            (v.lang || "").toLowerCase().startsWith(targetPrefix) || 
            (v.lang || "").toLowerCase().includes(targetPrefix) ||
            (v.name || "").toLowerCase().includes(langConfig?.name?.toLowerCase() || "")
          ) || voices.find(v => (v.lang || "").toLowerCase().includes("hi") || (v.lang || "").toLowerCase().includes("en"));
          if (matchedVoice) utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (err) => {
        console.warn("SpeechSynthesis error:", err);
        // If secondary failed and we aren't already using eSpeak backup, try eSpeak NG backup
        if (!useESpeakBackup) {
          fallbackBrowserTTS(cleanText, ttsLang, true);
        } else {
          setIsSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Browser SpeechSynthesis TTS Error:", e);
      setIsSpeaking(false);
    }
  }, [speechRate]);

  // --- TTS (TEXT TO SPEECH) HELPER WITH 3-TIER HIERARCHY ---
  const speakText = useCallback(
    async (text) => {
      if (isMuted) return;
      stopSpeaking();

      const clean = text.replace(/[*_#`[\]()]/g, "").slice(0, 300);
      const isDevanagari = /[\u0900-\u097F]/.test(clean);
      const ttsLang = (isHi || isDevanagari) ? "hi" : "en";

      try {
        // --- PRIMARY: Indic Parler-TTS Server Proxy ---
        const response = await fetch(`/api/tts?text=${encodeURIComponent(clean)}&lang=${ttsLang}&engine=parler`);
        if (!response.ok) {
          throw new Error("Indic Parler-TTS response failed");
        }
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
          console.warn("Primary Parler-TTS stream failed. Attempting Web Speech API fallback...");
          fallbackBrowserTTS(clean, ttsLang, false);
        };
        await audio.play();
      } catch (err) {
        console.warn("Primary Indic Parler-TTS connection failed, falling back to Web Speech API:", err);
        fallbackBrowserTTS(clean, ttsLang, false);
      }
    },
    [isMuted, isHi, stopSpeaking, fallbackBrowserTTS]
  );

  // --- GEMINI AI QUERY HANDLER ---
  const askGeminiVoiceAssistant = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsThinking(true);
    stopSpeaking();

    try {
      const res = await fetch("/api/voice-assistant/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          previousLocation: location || { city: "New Delhi", state: "Delhi NCR", lat: 28.6139, lng: 77.2090 },
          language: language
        })
      });

      const data = await res.json();
      const reply = data.response || "Weather information updated.";
      setAssistantResponse(reply);

      // If a new location was identified in the query, trigger the global app update
      if (data.location && onLocationChange) {
        if (data.location.city && data.location.city !== location?.city) {
          onLocationChange({
            city: data.location.city,
            state: data.location.state || "India",
            lat: data.location.lat,
            lng: data.location.lng
          });
        }
      }

      speakText(reply);
    } catch (err) {
      console.warn("Voice AI fetch error:", err);
      const fallback = `Currently in ${location?.city || "your area"}, the temperature is ${weather?.temp ?? 32}°C with ${weather?.condition || "fair skies"}.`;
      setAssistantResponse(fallback);
      speakText(fallback);
    } finally {
      setIsThinking(false);
    }
  };

  // --- SPEECH RECOGNITION (STT) ENGINE ---
  const startListening = () => {
    stopSpeaking();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      const langConfig = getLanguageConfig(language);
      recognition.lang = langConfig?.ttsLang || "hi-IN";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event) => {
        console.warn("Speech error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          askGeminiVoiceAssistant(transcript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Start speech failed:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // --- MOUSE & TOUCH 3D ROTATION GESTURES ---
  const handleRotationStart = (e) => {
    e.stopPropagation();
    setIsRotating3D(true);
    setIsAutoSpinning(false);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    rotateStartRef.current = {
      clientX,
      clientY,
      startX: rotation.x,
      startY: rotation.y,
      hasRotated: false
    };
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isRotating3D) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - rotateStartRef.current.clientX;
      const deltaY = clientY - rotateStartRef.current.clientY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        rotateStartRef.current.hasRotated = true;
      }

      // Sensitivity factor for 3D rotation
      const sensitivity = 0.8;
      const newY = (rotateStartRef.current.startY + deltaX * sensitivity) % 360;
      const newX = Math.max(-80, Math.min(80, rotateStartRef.current.startX - deltaY * sensitivity));

      setRotation((prev) => ({
        ...prev,
        x: Math.round(newX),
        y: Math.round(newY)
      }));
    };

    const handleEnd = () => {
      if (isRotating3D) {
        // If user tapped without dragging, expand in 1 click!
        if (!rotateStartRef.current.hasRotated && !isExpanded) {
          setExpandedState(true);
        }
        setIsRotating3D(false);
      }
    };

    if (isRotating3D) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isRotating3D, isExpanded, setExpandedState]);

  // --- POSITION DRAGGING HANDLERS ---
  const handleDragPosStart = (e) => {
    if (e.target.closest("button") || e.target.closest(".interactive-rotation-zone")) return;
    setIsDraggingPos(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: position.x,
      posY: position.y,
      hasMoved: false
    };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDraggingPos) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragStartRef.current.mouseX;
      const dy = clientY - dragStartRef.current.mouseY;

      if (Math.hypot(dx, dy) > 4) {
        dragStartRef.current.hasMoved = true;
      }

      const widgetWidth = isExpanded ? (window.innerWidth < 640 ? 320 : 360) : 100;
      const widgetHeight = isExpanded ? 480 : 55;

      // Ensure widget stays within viewport boundaries
      // Reserve clear area for bottom options bar / navigation band
      const maxX = Math.max(10, window.innerWidth - widgetWidth - 10);
      const maxY = Math.max(65, window.innerHeight - widgetHeight - 115);
      const newX = Math.max(10, Math.min(maxX, dragStartRef.current.posX + dx));
      const newY = Math.max(65, Math.min(maxY, dragStartRef.current.posY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      if (isDraggingPos) {
        // If user simply clicked without dragging, expand in 1 click!
        if (!dragStartRef.current.hasMoved && !isExpanded) {
          setExpandedState(true);
        }
        setIsDraggingPos(false);
      }
    };

    if (isDraggingPos) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDraggingPos, isExpanded, setExpandedState]);

  // Quick Preset 3D Rotations
  const setPresetAngle = (x, y, z = 0) => {
    setIsAutoSpinning(false);
    setRotation({ x, y, z });
  };

  const resetPositionToUpperLeft = () => {
    setPosition({ x: 20, y: 78 });
    setRotation({ x: 0, y: 0, z: 0 });
    setIsAutoSpinning(false);
  };

  // Suggested Voice Prompts
  const quickQuestions = useMemo(() => {
    if (isHi) {
      return [
        { label: "🌧️ आज बारिश होगी?", query: "क्या आज मेरे क्षेत्र में बारिश की संभावना है?" },
        { label: "🌡️ तापमान कितना है?", query: "वर्तमान तापमान और मौसम की स्थिति क्या है?" },
        { label: "🌾 फसल सिंचाई सलाह", query: "क्या आज फसलों में सिंचाई करनी चाहिए?" },
        { label: "⚠️ आपदा व चक्रवात अलर्ट", query: "क्या आज कोई मौसम चेतावनी या आंधी का अलर्ट है?" }
      ];
    }
    return [
      { label: "🌧️ Rain Forecast", query: "Will it rain today in my location?" },
      { label: "🌡️ Current Temp", query: "What is the live temperature and weather condition?" },
      { label: "🌾 Irrigation Advice", query: "Should I irrigate my crops today?" },
      { label: "⚠️ Severe Alerts", query: "Are there any severe weather alerts active right now?" }
    ];
  }, [isHi]);

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col select-none animate-in fade-in duration-300">
        
        {/* Full Screen Header */}
        <header className="px-6 py-4 sm:px-8 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide flex items-center gap-2">
                <span>{isHi ? "मौसम मित्र: फोकस संवाद" : "Mausam Mitra: Focused Dialogue"}</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-[9px] text-indigo-300 font-bold border border-indigo-500/30">
                  Focus Mode
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold">
                {location?.city || "New Delhi"} • {weather?.temp ?? 32}°C {weather?.condition || "Clear"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Mute toggle in Fullscreen */}
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                isMuted
                  ? "bg-slate-800 text-slate-400 border-slate-700"
                  : "bg-indigo-600/20 text-indigo-200 border-indigo-500/30 hover:bg-indigo-600/30"
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="text-[11px] hidden sm:inline">{isMuted ? (isHi ? "मौन" : "Muted") : (isHi ? "वॉयस ऑन" : "Voice On")}</span>
            </button>

            {/* Exit Fullscreen button */}
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                stopListening();
                setIsFullScreen(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{isHi ? "स्मॉल स्क्रीन" : "Exit Fullscreen"}</span>
            </button>
          </div>
        </header>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 overflow-y-auto md:overflow-hidden">
          
          {/* Left Column: Massive 3D Stage & Waveforms */}
          <div className="w-full md:w-[45%] flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800/60 relative shrink-0 md:shrink">
            
            {/* Rotation Controls readouts */}
            <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-bold text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/20">
              <Rotate3d className="w-3.5 h-3.5" />
              <span>{isHi ? "ड्रैग करके 3D घुमाएँ" : "Drag to Rotate 3D Cloud"}</span>
            </div>

            <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800">
              X: {rotation.x}° Y: {rotation.y}°
            </div>

            {/* Massive 3D Stage Zone */}
            <div
              className="relative my-6 interactive-rotation-zone cursor-grab active:cursor-grabbing touch-none select-none"
              onMouseDown={handleRotationStart}
              onTouchStart={handleRotationStart}
            >
              {/* Spinning Orbit Ring Accent */}
              <div className="absolute inset-0 -m-8 rounded-full border border-dashed border-indigo-500/20 animate-[spin_30s_linear_infinite] pointer-events-none" />
              <div className="absolute inset-0 -m-4 rounded-full border border-indigo-400/10 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />

              <div
                style={{
                  perspective: "900px",
                  transformStyle: "preserve-3d"
                }}
                className="w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center"
              >
                <div
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                    transformStyle: "preserve-3d",
                    transition: isRotating3D ? "none" : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
                  }}
                  className="w-40 h-40 sm:w-44 sm:h-44 relative filter drop-shadow-2xl"
                >
                  <CartoonWeatherAvatar
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    isThinking={isThinking}
                    large
                  />
                </div>
              </div>

              {/* Reactive Dynamic Drop Shadow */}
              <div
                style={{
                  transform: `translateX(${rotation.y * 0.15}px) translateY(${rotation.x * 0.15}px) scale(${1.1 - Math.abs(rotation.x) * 0.003})`,
                  opacity: 0.3
                }}
                className="w-28 h-3.5 bg-slate-950 rounded-full blur-[5px] mx-auto mt-2 pointer-events-none transition-transform"
              />
            </div>

            {/* Manual Rotation Action Bar */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center bg-slate-900/40 p-2 rounded-2xl border border-slate-800/60 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, x: Math.min(60, r.x + 15) }))}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, x: Math.max(-60, r.x - 15) }))}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, y: (r.y - 30) % 360 }))}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, y: (r.y + 30) % 360 }))}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-5 w-px bg-slate-800" />

              {/* Auto Spin */}
              <button
                type="button"
                onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isAutoSpinning
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                <Repeat className={`w-3 h-3 ${isAutoSpinning ? "animate-spin" : ""}`} />
                <span>{isHi ? "ऑटो स्पिन" : "Auto Spin"}</span>
              </button>
            </div>

            {/* Audio Waveform Pulsing Feedback */}
            <div className="mt-6 w-full max-w-xs flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                {isListening ? (isHi ? "लाइव वॉयस सिग्नल" : "Live Voice Wave") : ""}
              </span>
              <div className="flex items-center justify-center gap-1.5 h-6">
                {isListening ? (
                  [...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: `${0.6 + Math.random() * 0.8}s`
                      }}
                      className="w-1 bg-gradient-to-t from-indigo-500 via-rose-400 to-rose-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                    />
                  ))
                ) : isSpeaking ? (
                  [...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        animationDelay: `${i * 0.06}s`,
                        animationDuration: `${0.8 + Math.random() * 0.5}s`
                      }}
                      className="w-1 bg-gradient-to-t from-emerald-500 via-blue-400 to-indigo-500 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"
                    />
                  ))
                ) : (
                  <div className="h-0.5 w-32 bg-slate-800 rounded-full" />
                )}
              </div>
            </div>

            {/* Acoustic Config & Barge-In Thresholds */}
            <div className="mt-6 w-full max-w-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-left">
              <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-indigo-400">tune</span>
                <span>{isHi ? "ध्वनि सेटिंग्स (शोर नियंत्रण)" : "Acoustic Settings (Noise Control)"}</span>
              </h4>
              
              {/* Voice Activity Threshold Slider */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-300">{isHi ? "वॉयस थ्रेसहोल्ड (संवेदनशीलता)" : "Voice Sensitivity Threshold"}</span>
                  <span className="text-indigo-400 font-mono">{voiceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={voiceThreshold}
                  onChange={(e) => setVoiceThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[9px] text-slate-500 leading-tight">
                  {isHi ? "शोर वाले माहौल के लिए इसे बढ़ाएं (उदा. 45%+)" : "Increase in noisy environments to avoid early trigger."}
                </p>
              </div>

              {/* Barge-in Duration Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-300">{isHi ? "रुकावट अवधि" : "Barge-in Speaking Duration"}</span>
                  <span className="text-indigo-400 font-mono">{bargeInDuration}ms</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="600"
                  step="50"
                  value={bargeInDuration}
                  onChange={(e) => setBargeInDuration(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[9px] text-slate-500 leading-tight">
                  {isHi ? "बाधा डालने के लिए लगातार बोलने का समय" : "Duration of continuous speech before assistant halts."}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Dialogue, Transcript and Focused controls */}
          <div className="flex-1 flex flex-col p-6 sm:p-8 min-h-0 justify-between gap-5 overflow-y-auto md:overflow-visible">
            
            {/* Conversation Log & Transcript Pane */}
            <div className="space-y-4 pr-1">
              
              {/* Dialogue Balloon card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                  {isHi ? "मौसम मित्र संवाद" : "Mausam Mitra Response"}
                </span>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-sm sm:text-base text-slate-100 font-medium leading-relaxed shadow-lg relative">
                  <p className="whitespace-pre-line leading-relaxed">{assistantResponse}</p>
                  
                  {bargeInStatus && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold animate-pulse border border-rose-500/30">
                      {bargeInStatus}
                    </div>
                  )}
                </div>

                {/* manual interrupt / stop speaking button fallback */}
                {isSpeaking && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <VolumeX className="w-4 h-4 text-rose-400" />
                      <span>{isHi ? "बोलना बंद करें (Stop speaking)" : "Stop speaking"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Transcript card when speaking/listening */}
              {(isListening || transcript) && (
                <div className="space-y-1.5 animate-in slide-in-from-bottom-2 duration-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                    {isHi ? "आपका वॉयस इनपुट" : "Your Voice Input"}
                  </span>
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex items-start gap-3 text-xs sm:text-sm font-medium text-indigo-200">
                    <Mic className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                    <p className="italic">
                      {transcript || (isHi ? "सुन रहा हूँ... बोलना शुरू करें..." : "Listening... Start speaking...")}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Quick Prompts Segment */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                {isHi ? "सुझाए गए विषय" : "Suggested Focus Prompts"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isHi
                  ? [
                      { label: "🫁 प्रदूषण और फेफड़े", query: "वायु गुणवत्ता (AQI) मेरे फेफड़ों को कैसे प्रभावित कर रही है?" },
                      { label: "🌾 सिंचाई और गर्म हवाएं", query: "क्या मुझे वर्तमान गर्म हवाओं के दौरान आज फसलों को पानी देना चाहिए?" },
                      { label: "🤕 उमस और सिरदर्द", query: "क्या वर्तमान उमस के स्तर से माइग्रेन या सिरदर्द हो सकता है?" },
                      { label: "🤰 गर्मी में सुरक्षा उपाय", query: "गर्भावस्था के दौरान अत्यधिक तापमान से बचने के क्या उपाय हैं?" }
                    ]
                  : [
                      { label: "🫁 Pollutants & Lung Health", query: "How is the air quality (AQI) affecting my lungs today?" },
                      { label: "🌾 Irrigation & Heatwaves", query: "Should I irrigate my crops given current ambient heat stresses?" },
                      { label: "🤕 Humidity & Headache Triggers", query: "Can the current humidity levels trigger migraines or severe headaches?" },
                      { label: "🤰 Safe Practices in Heatwaves", query: "What are safe guidelines for pregnancy during high heat index alerts?" }
                    ]
                ).map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(q.query);
                      askGeminiVoiceAssistant(q.query);
                    }}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-800 text-slate-200 hover:text-white text-left text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Massive Mic Button Area */}
            <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4 shrink-0 justify-between">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-slate-200">
                  {isListening 
                    ? (isHi ? "सुन रहा हूँ... पूरा होने पर रोके" : "I'm listening... Tap button when finished.") 
                    : (isHi ? "संवाद शुरू करने के लिए माइक दबाएं" : "Tap the Mic below to speak directly.")}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isHi 
                    ? "यह आपके चुने हुए स्वास्थ्य मापदंडों को ध्यान में रखकर जवाब देगा।" 
                    : "Responses dynamically factor in your profile and local meteorological metrics."}
                </p>
              </div>

              <div className="flex justify-center sm:justify-end gap-3 w-full sm:w-auto shrink-0">
                {/* Large Responsive Fullscreen Mic Option */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                    isListening
                      ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30 scale-105"
                      : isThinking
                      ? "bg-amber-500 text-white cursor-wait animate-bounce"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 ring-4 ring-indigo-500/10"
                  }`}
                  title={isListening ? (isHi ? "सुनना बंद करें" : "Stop Mic") : (isHi ? "माइक चालू करें" : "Start Mic")}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : isThinking ? (
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      ref={containerRef}
      id="floating-voice-assistant-root"
      aria-label="3D Voice Assistant"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: isDraggingPos ? "none" : "auto"
      }}
      className={`fixed z-40 select-none transition-shadow ${
        isDraggingPos ? "cursor-grabbing opacity-95" : ""
      }`}
    >
      {/* --- MINIMIZED 3D AVATAR ICON ONLY --- */}
      {!isExpanded ? (
        <div
          onMouseDown={(e) => {
            handleDragPosStart(e);
            handleRotationStart(e);
          }}
          onTouchStart={(e) => {
            handleDragPosStart(e);
            handleRotationStart(e);
          }}
          className="relative interactive-rotation-zone cursor-grab active:cursor-grabbing w-14 h-14 rounded-full bg-white/95 backdrop-blur-md border border-blue-200/85 shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center group"
          title={isHi ? "3D अवतार घुमाने के लिए खींचें या खोलने के लिए टैप करें" : "Drag to rotate in 3D or tap to open"}
        >
          {/* 3D Avatar Container */}
          <div
            style={{
              perspective: "600px",
              transformStyle: "preserve-3d"
            }}
            className="w-12 h-12 flex items-center justify-center"
          >
            <div
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                transformStyle: "preserve-3d",
                transition: isRotating3D ? "none" : "transform 0.2s ease-out"
              }}
              className="w-11 h-11 relative"
            >
              {/* SVG Cartoon Weather Avatar */}
              <CartoonWeatherAvatar
                isSpeaking={isSpeaking}
                isListening={isListening}
                isThinking={isThinking}
              />
            </div>
          </div>

          {/* State Badges / Activity Pulse */}
          {isListening && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white animate-ping" />
          )}
          {isSpeaking && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-bounce" />
          )}
        </div>
      ) : (
        /* --- EXPANDED 3D VOICE ASSISTANT CONSOLE --- */
        <div className="w-[320px] sm:w-[360px] bg-white text-slate-800 rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          {/* Header & Drag Bar */}
          <div
            onMouseDown={handleDragPosStart}
            onTouchStart={handleDragPosStart}
            className="px-4 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5">
                  <span>{isHi ? "मौसम मित्र वॉयस असिस्टेंट" : "Mausam Mitra Voice Assistant"}</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-[9px] font-mono border border-blue-400/30">
                    3D Orbit
                  </span>
                </h3>
                <p className="text-[10px] text-blue-200 font-medium">
                  {location?.city || "New Delhi"} • {weather?.temp ?? 32}°C {weather?.condition || ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Full Screen Focus button */}
              <button
                type="button"
                onClick={() => setIsFullScreen(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer animate-pulse"
                title={isHi ? "फुल स्क्रीन फोकस मोड" : "Open Full Screen Focus Mode"}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Reset to Upper Left Corner button */}
              <button
                type="button"
                onClick={resetPositionToUpperLeft}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isHi ? "ऊपरी-बाएँ कोने में रीसेट करें" : "Reset position & rotation to top-left"}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize button */}
              <button
                type="button"
                onClick={() => setExpandedState(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isHi ? "छोटा करें" : "Minimize"}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Cartoon Avatar Stage with Free Multi-Directional Rotation */}
          <div className="p-4 bg-gradient-to-b from-blue-50/70 via-slate-50/50 to-white flex flex-col items-center justify-center relative border-b border-slate-100">
            {/* Free Rotation Prompt Hint */}
            <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
              <Rotate3d className="w-3 h-3 text-blue-600" />
              <span>{isHi ? "3D में हर दिशा में घुमाएँ" : "Free 3D 360° Rotate"}</span>
            </div>

            {/* Current Rotation Angle readout */}
            <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
              X:{rotation.x}° Y:{rotation.y}°
            </div>

            {/* 3D AVATAR INTERACTIVE TOUCH/DRAG BOX */}
            <div
              className="relative my-2 interactive-rotation-zone cursor-grab active:cursor-grabbing touch-none select-none"
              onMouseDown={handleRotationStart}
              onTouchStart={handleRotationStart}
              title={isHi ? "माउस या उंगली से किसी भी दिशा में घुमाएँ" : "Drag with mouse or finger to spin & tilt in any direction"}
            >
              {/* Outer Orbit Guide Ring */}
              <div className="absolute inset-0 -m-3 rounded-full border border-dashed border-blue-300/60 animate-[spin_20s_linear_infinite] pointer-events-none" />

              {/* 3D Perspective Stage */}
              <div
                style={{
                  perspective: "700px",
                  transformStyle: "preserve-3d"
                }}
                className="w-28 h-28 flex items-center justify-center"
              >
                <div
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                    transformStyle: "preserve-3d",
                    transition: isRotating3D ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)"
                  }}
                  className="w-24 h-24 relative filter drop-shadow-md"
                >
                  <CartoonWeatherAvatar
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    isThinking={isThinking}
                    large
                  />
                </div>
              </div>

              {/* 3D Realistic Reactive Drop Shadow */}
              <div
                style={{
                  transform: `translateX(${rotation.y * 0.1}px) translateY(${rotation.x * 0.1}px) scale(${1 - Math.abs(rotation.x) * 0.003})`,
                  opacity: 0.25
                }}
                className="w-16 h-3 bg-slate-800 rounded-full blur-[3px] mx-auto -mt-1 pointer-events-none transition-transform"
              />
            </div>

            {/* Rotation Controls Bar (Directional Arrows, Spin Toggle & Presets) */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, x: Math.min(60, r.x + 15) }))}
                className="p-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-xs shadow-2xs cursor-pointer"
                title={isHi ? "ऊपर झुकाएँ" : "Tilt Up"}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, x: Math.max(-60, r.x - 15) }))}
                className="p-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-xs shadow-2xs cursor-pointer"
                title={isHi ? "नीचे झुकाएँ" : "Tilt Down"}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, y: (r.y - 30) % 360 }))}
                className="p-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-xs shadow-2xs cursor-pointer"
                title={isHi ? "बाएँ घुमाएँ" : "Spin Left"}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => ({ ...r, y: (r.y + 30) % 360 }))}
                className="p-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-xs shadow-2xs cursor-pointer"
                title={isHi ? "दाएँ घुमाएँ" : "Spin Right"}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Continuous Auto-Spin 360° button */}
              <button
                type="button"
                onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                  isAutoSpinning
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                }`}
                title={isHi ? "360° निरंतर घूर्णन चालू/बंद" : "Auto 360° continuous orbit"}
              >
                <Repeat className={`w-3 h-3 ${isAutoSpinning ? "animate-spin" : ""}`} />
                <span className="text-[10px]">{isHi ? "360° ऑटो स्पिन" : "Auto Spin"}</span>
              </button>

              {/* Reset Front Face */}
              <button
                type="button"
                onClick={() => setPresetAngle(0, 0, 0)}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                title={isHi ? "सामने का दृश्य" : "Reset to front"}
              >
                {isHi ? "सीधा करें" : "Reset Face"}
              </button>
            </div>
          </div>

          {/* Assistant Dialogue Balloon */}
          <div className="p-3.5 space-y-2 max-h-[160px] overflow-y-auto bg-slate-50/70 border-b border-slate-100">
            {isListening && (
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-medium text-rose-800 animate-pulse">
                <Mic className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">
                  {transcript || (isHi ? "सुन रहा हूँ... बोलिए..." : "Listening... Speak now...")}
                </span>
              </div>
            )}

            {!isListening && (
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs text-slate-800 font-medium leading-relaxed relative">
                <p className="whitespace-pre-line">{assistantResponse}</p>
                {bargeInStatus && (
                  <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-rose-500/10 text-rose-600 text-[8px] font-bold border border-rose-500/20 animate-pulse">
                    {bargeInStatus}
                  </span>
                )}
              </div>
            )}

            {/* manual interrupt / stop speaking button fallback */}
            {isSpeaking && (
              <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <VolumeX className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{isHi ? "बोलना बंद करें (Stop)" : "Stop speaking"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Question Chips */}
          <div className="p-3 bg-white space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              {isHi ? "त्वरित वॉयस प्रश्न" : "Quick Spoken Prompts"}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscript(q.query);
                    askGeminiVoiceAssistant(q.query);
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-900 border border-slate-200/70 text-slate-700 text-left text-[11px] font-bold transition-all cursor-pointer shadow-2xs line-clamp-1"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slidable Acoustic threshold settings drawer inside small console */}
          {showSettings && (
            <div className="p-3 bg-indigo-50/50 border-t border-b border-indigo-100 animate-in slide-in-from-bottom duration-200 text-left space-y-3">
              <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-indigo-600 font-bold">tune</span>
                <span>{isHi ? "ध्वनि संवेदनशीलता सेटिंग्स" : "Sensitivity & Noise Thresholds"}</span>
              </h4>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-600">{isHi ? "वॉयस थ्रेसहोल्ड" : "Voice Threshold"}</span>
                  <span className="text-indigo-700 font-mono">{voiceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  value={voiceThreshold}
                  onChange={(e) => setVoiceThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-600">{isHi ? "रुकावट अवधि" : "Barge-in Duration"}</span>
                  <span className="text-indigo-700 font-mono">{bargeInDuration}ms</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="500"
                  step="50"
                  value={bargeInDuration}
                  onChange={(e) => setBargeInDuration(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* Voice Action & Controls Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
            {/* Audio Mute / Unmute */}
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMuted
                  ? "bg-slate-200 text-slate-600 border-slate-300"
                  : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
              }`}
              title={isMuted ? (isHi ? "आवाज़ चालू करें" : "Unmute") : (isHi ? "आवाज़ बंद करें" : "Mute")}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
              <span className="text-[10px] hidden sm:inline">{isMuted ? "Muted" : "Voice On"}</span>
            </button>

            {/* Configurable Threshold Settings trigger */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                showSettings
                  ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                  : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
              }`}
              title={isHi ? "ध्वनि संवेदनशीलता सेटिंग्स" : "Acoustic VAD Settings"}
            >
              <span className="material-symbols-outlined text-[18px] text-slate-700">tune</span>
            </button>

            {/* Primary Big Mic Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                isListening
                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                  : isThinking
                  ? "bg-amber-500 text-white cursor-wait"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-spin" />
                  <span>{isHi ? "सुनना रोकें" : "Stop Listening"}</span>
                </>
              ) : isThinking ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{isHi ? "सोच रहा है..." : "Processing..."}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>{isHi ? "माइक दबाकर बोलें" : "Tap & Speak to AI"}</span>
                </>
              )}
            </button>

            {/* Launch Full WeatherGPT Chat */}
            {onOpenFullChat && (
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenFullChat();
                }}
                className="p-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title={isHi ? "पूर्ण चैट खोलें" : "Open Full WeatherGPT Chat"}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

/**
 * CartoonWeatherAvatar
 * 
 * Expressive, high-craft SVG cartoon weather bot ("Mausam Mitra").
 * Reacts dynamically to speaking, listening, and thinking states.
 */
function CartoonWeatherAvatar({ isSpeaking = false, isListening = false, isThinking = false, large = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full select-none pointer-events-none drop-shadow-md"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft Blue Cloud Gradient */}
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>

        {/* Golden Sun Accent */}
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Cheeks Blush */}
        <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
        </radialGradient>

        {/* 3D Sphere Highlight */}
        <radialGradient id="highlightGrad" cx="35%" cy="30%" r="45%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Weather Halo / Sun Rays */}
      <g className={isThinking ? "animate-spin origin-center" : ""}>
        <circle cx="50" cy="50" r="46" fill="url(#sunGrad)" opacity="0.18" />
        <circle cx="50" cy="50" r="44" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      </g>

      {/* Top 3D Antenna with Glowing Beacon */}
      <g>
        {/* Antenna stalk */}
        <path d="M 50 26 L 50 12" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
        {/* Antenna Orb */}
        <circle
          cx="50"
          cy="11"
          r={isListening ? 6 : isSpeaking ? 5.5 : 4.5}
          fill={isListening ? "#EF4444" : isSpeaking ? "#10B981" : "#0EA5E9"}
          className="transition-all"
        />
        {/* Antenna Sparkle Rings */}
        {(isListening || isSpeaking) && (
          <circle
            cx="50"
            cy="11"
            r="8"
            stroke={isListening ? "#EF4444" : "#10B981"}
            strokeWidth="1.5"
            opacity="0.6"
            className="animate-ping origin-center"
          />
        )}
      </g>

      {/* Main Cartoon Cloud-Bot Body */}
      <g>
        {/* Shadow under body */}
        <path
          d="M 24 64 C 18 64 14 58 14 50 C 14 42 20 36 28 36 C 30 28 38 22 48 22 C 60 22 70 30 72 40 C 80 40 86 46 86 54 C 86 62 80 66 74 66 Z"
          fill="#0369A1"
          opacity="0.2"
        />

        {/* Cloud Head Geometry */}
        <path
          d="M 24 62 C 16 62 12 56 12 48 C 12 40 18 34 26 34 C 28 25 38 18 50 18 C 62 18 72 26 74 36 C 82 36 88 42 88 50 C 88 58 82 62 76 62 Z"
          fill="url(#cloudGrad)"
          stroke="#0284C7"
          strokeWidth="2.5"
        />

        {/* 3D Gloss / Specular Highlight Layer */}
        <path
          d="M 28 34 C 34 22 46 22 56 22 C 66 22 72 28 72 34 C 64 30 52 30 40 32 C 34 32 30 33 28 34 Z"
          fill="url(#highlightGrad)"
        />
      </g>

      {/* Cute Weather Earmuffs / Headset */}
      <g>
        {/* Headband */}
        <path d="M 20 44 C 20 28 80 28 80 44" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        {/* Left Earpad */}
        <rect x="10" y="42" width="7" height="14" rx="3.5" fill="#4F46E5" stroke="#312E81" strokeWidth="1" />
        {/* Right Earpad */}
        <rect x="83" y="42" width="7" height="14" rx="3.5" fill="#4F46E5" stroke="#312E81" strokeWidth="1" />
      </g>

      {/* Rosy Glowing Cheeks */}
      <circle cx="28" cy="49" r="5" fill="url(#blushGrad)" />
      <circle cx="72" cy="49" r="5" fill="url(#blushGrad)" />

      {/* Expressive Anime Eyes */}
      {isListening ? (
        // Wide alert listening eyes
        <g>
          <ellipse cx="36" cy="42" rx="4.5" ry="6" fill="#0F172A" />
          <circle cx="37.5" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="34.5" cy="44" r="1" fill="#FFFFFF" />

          <ellipse cx="64" cy="42" rx="4.5" ry="6" fill="#0F172A" />
          <circle cx="65.5" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="62.5" cy="44" r="1" fill="#FFFFFF" />
        </g>
      ) : isSpeaking ? (
        // Happy squint eyes (^ ^) when talking
        <g>
          <path d="M 32 44 Q 36 38 40 44" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 60 44 Q 64 38 68 44" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        // Standard Friendly Blinking Eyes
        <g>
          <ellipse cx="36" cy="43" rx="4" ry="5" fill="#0F172A" />
          <circle cx="37.5" cy="41" r="1.8" fill="#FFFFFF" />
          <circle cx="35" cy="45" r="0.8" fill="#FFFFFF" />

          <ellipse cx="64" cy="43" rx="4" ry="5" fill="#0F172A" />
          <circle cx="65.5" cy="41" r="1.8" fill="#FFFFFF" />
          <circle cx="63" cy="45" r="0.8" fill="#FFFFFF" />
        </g>
      )}

      {/* Animated Expressive Mouth */}
      {isSpeaking ? (
        // Talking Animated Open Smile Mouth with Tongue
        <g>
          <path d="M 43 51 Q 50 60 57 51 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M 47 55 Q 50 53 53 55 Q 50 58 47 55 Z" fill="#FDA4AF" />
        </g>
      ) : isListening ? (
        // Small "O" listening mouth
        <ellipse cx="50" cy="52" rx="3" ry="4" fill="#0F172A" />
      ) : (
        // Cute Resting Smile
        <path d="M 44 51 Q 50 56 56 51" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Floating Weather Sparks / Mini Raindrop & Sun Badge */}
      <g>
        <circle cx="76" cy="22" r="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
        <path d="M 22 66 L 20 71" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M 28 67 L 26 72" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </g>
    </svg>
  );
}
