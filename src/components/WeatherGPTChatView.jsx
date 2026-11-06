import { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  X,
  Mic,
  ArrowUp,
  LayoutGrid,
  Lightbulb,
  FileText,
  ArrowLeft
} from "lucide-react";
import { translations, getTranslation } from "../lib/translations";
import { MarkdownMessage } from "./MarkdownMessage";

export const WeatherGPTChatView = ({
  messages = [],
  onSendMessage,
  isLoading = false,
  location,
  weather,
  persona = "farmer",
  onPersonaChange,
  language = "en",
  onClearChat,
  onOpenProfile,
  onClose
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showLightbulbMenu, setShowLightbulbMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const t = getTranslation(language);
  const isHindi = language === "hi";

  // Mute and stop all voice playback immediately when closing or unmounting chat
  const handleClose = () => {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
    }
    setIsSpeaking(false);
    setIsListening(false);
    if (onClose) {
      onClose();
    }
  };

  // Ensure speech synthesis and recognition stop immediately when unmounting or switching tabs
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          // ignore
        }
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD5sTNZyukwi7kZhP6EuO85L6gHdie1bvcXqbadWMmRIvOm1VWj8spnK4EnnKgA39jYiNGWLVeQHcmFnZWAOWKYYjtlbVqq8pq3yf9RwutewgQqfkiVX_mpA_iqxZDMYkdkP0vU4VOcQHK8WGKkHlEdZNkufBf3rIXfGOW41Lb8X90gCo7TNwZSyntB8za_MsHB0dno5lGSlhs_ADzmdBy1QFrIsDFEazWyc4zcJ3Cc90LT57T4krhxMg";

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
        inline: "nearest"
      });
    }
  };

  // Auto scroll to bottom on new messages or while loading/replying
  useEffect(() => {
    scrollToBottom(false);
    const timer1 = setTimeout(() => scrollToBottom(true), 50);
    const timer2 = setTimeout(() => scrollToBottom(true), 150);
    const timer3 = setTimeout(() => scrollToBottom(true), 300);
    
    // If loading/replying, keep scrolling periodically
    let interval = null;
    if (isLoading) {
      interval = setInterval(() => {
        scrollToBottom(true);
      }, 200);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (interval) clearInterval(interval);
    };
  }, [messages, isLoading]);

  // Auto-speak new assistant responses aloud
  const lastSpokenIdRef = useRef(null);
  useEffect(() => {
    if (!isMuted && messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant" && lastMsg.id !== lastSpokenIdRef.current) {
        lastSpokenIdRef.current = lastMsg.id;
        handleSpeak(lastMsg.content);
      }
    }
  }, [messages, isMuted]);

  // Voice recognition init
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isHindi ? "hi-IN" : "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");
        setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isHindi]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert(isHindi ? "आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।" : "Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleSendMessageLocal = (prompt) => {
    onSendMessage(prompt);
    scrollToBottom();
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if ((inputText.trim() || attachedFile) && !isLoading) {
      let promptToSend = inputText.trim();
      if (attachedFile) {
        promptToSend = `[Attached File: ${attachedFile.name}] ${promptToSend || "Please analyze this file and provide meteorological & agro recommendations."}`;
      }
      handleSendMessageLocal(promptToSend);
      setInputText("");
      setAttachedFile(null);
      setShowGridMenu(false);
      setShowLightbulbMenu(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    if (language === "hi" || /[\u0900-\u097F]/.test(text)) {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type
      });
    }
  };

  const presetTopics = [
    { title: isHindi ? "मानसून एवं वर्षा ट्रैकर" : "Monsoon & Rain Forecast", query: isHindi ? "क्या अगले 48 घंटों में भारी बारिश की संभावना है?" : "Will it rain in my region over the next 48 hours?" },
    { title: isHindi ? "फसल सुरक्षा एवं छिड़काव" : "Crop Spray & Field Advisory", query: isHindi ? "आज कीटनाशक या खाद का छिड़काव करना सुरक्षित है क्या?" : "Is it safe to spray pesticides or fertilizers today given the humidity and wind?" },
    { title: isHindi ? "चक्रवात व आंधी चेतावनी" : "Cyclone & High Wind Alert", query: isHindi ? "क्या तटीय या मैदानी इलाकों में कोई आंधी या चक्रवात का अलर्ट है?" : "Are there any active cyclone or squall alerts for coastal and inland areas?" },
    { title: isHindi ? "मंडी एवं कटाई योजना" : "Harvest & Mandi Storage", query: isHindi ? "फसल कटाई और अनाज को मंडी ले जाने के लिए मौसम अनुकूल है क्या?" : "Is the weather suitable for harvesting and grain transport to APMC mandi?" }
  ];

  const smartSuggestions = [
    isHindi ? "आज का विस्तृत मौसम और लू (Heatwave) का स्तर क्या है?" : "What is the detailed temperature and heat index today?",
    isHindi ? "कल कितनी बारिश हुई थी और आज कितनी संभावना है?" : "How much rain was recorded yesterday and what is today's forecast?",
    isHindi ? "गेहूं, धान और सब्जियों के लिए आज की मुख्य सलाह क्या है?" : "What is the best irrigation schedule for wheat, paddy, and vegetables today?",
    isHindi ? "आकाशीय बिजली (Lightning) और गरज-चमक से बचने के उपाय" : "What safety precautions are advised for lightning and thunderstorms?"
  ];

  const cityName = location?.city || location?.locality || "Your City";

  return (
    <div className="flex-1 w-full bg-white text-[#1b1b1e] h-full min-h-screen flex flex-col antialiased relative overflow-hidden font-sans">
      {/* Top Header with Back Button */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title={isHindi ? "पीछे जाएं एवं आवाज बंद करें" : "Go Back & Mute"}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#031636] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#031636] leading-tight flex items-center gap-1.5">
                <span>WeatherGPT</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {cityName} • {isHindi ? "मौसम सहायक" : "Meteorological AI"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute Audio Toggle */}
          <button
            onClick={() => {
              if (isSpeaking || !isMuted) {
                if ("speechSynthesis" in window) {
                  try {
                    window.speechSynthesis.cancel();
                  } catch (e) {}
                }
                setIsSpeaking(false);
              }
              setIsMuted(!isMuted);
            }}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
              isSpeaking
                ? "bg-blue-100 text-blue-700 animate-pulse border border-blue-300"
                : isMuted
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
            title={isMuted ? (isHindi ? "आवाज चालू करें" : "Unmute voice") : (isHindi ? "म्यूट करें (आवाज बंद)" : "Mute voice")}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">{isHindi ? "म्यूट" : "Muted"}</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                <span className="hidden sm:inline">{isHindi ? "म्यूट करें" : "Mute"}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">{isHindi ? "आवाज" : "Voice"}</span>
              </>
            )}
          </button>

          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
              title={t.clearConversationText || (isHindi ? "चैट साफ़ करें" : "Clear conversation")}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.clearConversationText || (isHindi ? "रीसेट" : "Clear")}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area - Chat Thread */}
      <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 gap-4 overflow-y-auto pb-48 sm:pb-52 max-w-5xl mx-auto w-full">
        {messages.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.mausamAssistantActive || (isHindi ? "मौसम सहायक (WeatherGPT Active)" : "WeatherGPT AI Assistant Active")}</span>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow py-8 sm:py-14 text-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#031636] text-white flex items-center justify-center shadow-lg mb-6">
              <span className="material-symbols-outlined text-[32px] icon-fill">
                forum
              </span>
            </div>

            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#031636] tracking-tight mb-8">
              {t.welcomeTitle || (isHindi ? "आज मौसम कैसा है?" : "How's the weather today?")}
            </h2>

            <p className="text-sm text-slate-500 max-w-md mb-8">
              {t.welcomeSubtitle || (isHindi
                ? "मौसम, बारिश, फसल सलाह या आपदा चेतावनी से जुड़ा कोई भी प्रश्न पूछें।"
                : "Ask anything about local rain forecasts, soil moisture, crop advisory, or severe weather alerts.")}
            </p>

            {/* Prompt Suggestion Cards (Exact HTML design tokens) */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 px-2 w-full max-w-md">
              <button
                type="button"
                onClick={() => handleSendMessageLocal(isHindi ? `${cityName} में आज बारिश होगी क्या?` : `Will it rain in ${cityName} today?`)}
                className="bg-[#1a2b4c] text-[#d8e2ff] p-4 rounded-[24px] text-sm text-left hover:scale-[1.02] active:scale-[0.98] transition-transform flex-1 shadow-sm cursor-pointer border border-white/10"
              >
                <div className="font-semibold text-white mb-0.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">rainy</span>
                  {isHindi ? "बारिश का पूर्वानुमान" : `Rain in ${cityName}?`}
                </div>
                <div className="text-xs text-slate-300">
                  {isHindi ? "अगले 24 घंटों में वर्षा की संभावना" : "Check 24-hour precipitation probability"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessageLocal(isHindi ? `वर्तमान मौसम के अनुसार फसलों के लिए क्या सलाह है?` : `What crop protection & irrigation advice do you have for today?`)}
                className="bg-[#1a2b4c] text-[#d8e2ff] p-4 rounded-[24px] text-sm text-left hover:scale-[1.02] active:scale-[0.98] transition-transform flex-1 shadow-sm cursor-pointer border border-white/10"
              >
                <div className="font-semibold text-white mb-0.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">agriculture</span>
                  {isHindi ? "कृषि एवं फसल सलाह" : "Agro Advisory"}
                </div>
                <div className="text-xs text-slate-300">
                  {isHindi ? "सिंचाई व कीटनाशक छिड़काव गाइड" : "Soil moisture, wind & spray guidelines"}
                </div>
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg">
              {smartSuggestions.slice(0, 3).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessageLocal(s)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer text-left truncate max-w-[280px]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#1a2b4c] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">cloudy</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-[24px] p-4 text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-[#031636] text-white rounded-br-xs font-normal"
                        : "bg-[#f5f6f9] text-[#1b1b1e] rounded-bl-xs border border-slate-200/80"
                    }`}
                  >
                    <MarkdownMessage content={msg.content} isUser={isUser} />

                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-slate-300/40 flex items-center justify-between text-[11px] text-[#575f6a]">
                        <span>{msg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeak(msg.content)}
                            className="p-1 hover:text-[#031636] hover:bg-white/60 rounded-md transition-colors cursor-pointer"
                            title={isHindi ? "बोलकर सुनें" : "Read aloud"}
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="p-1 hover:text-[#031636] hover:bg-white/60 rounded-md transition-colors cursor-pointer"
                            title={isHindi ? "कॉपी करें" : "Copy text"}
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-slate-600 text-xs py-2">
                <div className="w-8 h-8 rounded-full bg-[#1a2b4c] text-white flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-[#efedf0] text-slate-700 px-4 py-3 rounded-[20px] rounded-bl-xs border border-slate-200/60 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>{t.weatherGptAnalyzing || (isHindi ? "मौसम डेटा का विश्लेषण हो रहा है..." : "Analyzing live meteorological data & satellite models...")}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-36 sm:h-48 shrink-0" />
          </div>
        )}
      </main>

      {/* Grid Topics Menu Overlay */}
      {showGridMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-[#031636] flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                {isHindi ? "मौसम एवं कृषि विषय" : "Weather & Agro Topics"}
              </span>
              <button
                onClick={() => setShowGridMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {presetTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleSendMessageLocal(topic.query);
                    setShowGridMenu(false);
                  }}
                  className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 mb-0.5">
                    {topic.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {topic.query}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbulb Prompt Ideas Overlay */}
      {showLightbulbMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-[#031636] flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {isHindi ? "त्वरित प्रश्न सुझाव" : "Smart Prompt Suggestions"}
              </span>
              <button
                onClick={() => setShowLightbulbMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {smartSuggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleSendMessageLocal(item);
                    setShowLightbulbMenu(false);
                  }}
                  className="w-full p-3 text-left rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 text-xs font-medium text-slate-800 transition-all cursor-pointer"
                >
                  💡 {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.csv,.txt"
      />

      {/* Chat Input Area (Exact HTML specification & styling) */}
      <div className="fixed bottom-3 sm:bottom-4 left-0 w-full px-4 sm:px-6 max-w-5xl left-1/2 -translate-x-1/2 z-40">
        <div className="bg-[#f5f3f6] rounded-[28px] p-3 sm:p-4 flex flex-col gap-2 border border-slate-300/60 shadow-xl backdrop-blur-md">
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {[
              { label: isHindi ? "🌧️ बारिश की संभावना" : "🌧️ Rain forecast", q: isHindi ? "क्या आज या कल बारिश होगी?" : "Will it rain today or tomorrow?" },
              { label: isHindi ? "🌾 फसल व सिंचाई सलाह" : "🌾 Crop & irrigation", q: isHindi ? "फसलों की सुरक्षा व सिंचाई के लिए क्या सलाह है?" : "What is the crop and irrigation advisory for today?" },
              { label: isHindi ? "🌡️ 3 दिन का तापमान" : "🌡️ 3-day temp", q: isHindi ? "अगले 3 दिन का तापमान और मौसम कैसा रहेगा?" : "What is the 3-day temperature forecast?" },
              { label: isHindi ? "⚡ आंधी-तूफान अलर्ट" : "⚡ Storm alert", q: isHindi ? "क्या कोई आंधी या वज्रपात की चेतावनी है?" : "Are there any storm or lightning warnings active?" }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessageLocal(chip.q)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white text-slate-700 text-[11px] font-medium border border-slate-200/80 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* File Attachment Pill Preview */}
          {attachedFile && (
            <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl text-xs text-slate-800 border border-slate-200">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold truncate">{attachedFile.name}</span>
                <span className="text-[10px] text-slate-400">({attachedFile.size})</span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-slate-400 hover:text-rose-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Text Input */}
          <form onSubmit={handleSend} className="w-full">
            <input
              id="weathergpt-chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.askAnythingPlaceholder || (isHindi ? "मौसम या फसल संबंधी कुछ भी पूछें..." : "Ask WeatherGPT anything...")}
              type="text"
              className="bg-transparent border-none focus:ring-0 text-[15px] text-[#1b1b1e] placeholder:text-[#75777f] px-2 w-full outline-none"
            />
          </form>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {/* Attach File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center bg-[#e4e2e5] text-[#44474e] hover:bg-[#d8d6d9] transition-colors cursor-pointer shrink-0"
                title={isHindi ? "फ़ाइल संलग्न करें" : "Attach file or document"}
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>

              {/* Grid View Topics */}
              <button
                type="button"
                onClick={() => setShowGridMenu(!showGridMenu)}
                className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center bg-[#e4e2e5] text-[#44474e] hover:bg-[#d8d6d9] transition-colors cursor-pointer shrink-0"
                title={isHindi ? "मौसम श्रेणियाँ" : "Explore weather topics"}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>

              {/* Lightbulb Prompt Ideas */}
              <button
                type="button"
                onClick={() => setShowLightbulbMenu(!showLightbulbMenu)}
                className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center bg-[#e4e2e5] text-[#44474e] hover:bg-[#d8d6d9] transition-colors cursor-pointer shrink-0"
                title={isHindi ? "स्मार्ट सुझाव" : "Smart prompt ideas"}
              >
                <span className="material-symbols-outlined text-[20px]">lightbulb</span>
              </button>

              {/* Voice Input Mic */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  isListening
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-[#e4e2e5] text-[#44474e] hover:bg-[#d8d6d9]"
                }`}
                title={isListening ? "Listening... Click to stop" : "Voice Input"}
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={(!inputText.trim() && !attachedFile) || isLoading}
              className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] bg-[#031636] disabled:opacity-40 text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm shrink-0 border border-white/20"
              title="Send message"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#75777f] mt-1.5">
          {isHindi ? "AI त्रुटि कर सकता है। महत्वपूर्ण निर्णयों के लिए कृपया IMD अलर्ट अवश्य देखें।" : "AI can make mistakes. Please double-check responses."}
        </p>
      </div>
    </div>
  );
};
