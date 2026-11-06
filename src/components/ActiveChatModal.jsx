import { useState, useRef, useEffect } from "react";
import {
  X,
  Minus,
  Maximize2,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Bot,
  Loader2
} from "lucide-react";
import { translations, getTranslation } from "../lib/translations";
import { MarkdownMessage } from "./MarkdownMessage";
export const ActiveChatModal = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  persona,
  location,
  weather,
  onClearChat,
  isListening = false,
  onStartVoice,
  language = "en"
}) => {
  const [inputText, setInputText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const t = getTranslation(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);
  if (!isOpen) return null;
  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText("");
      scrollToBottom();
    }
  };
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2e3);
  };
  const handleSpeak = (text) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*_#`[\]()]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;
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
  if (isMinimized) {
    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
    return <div
      id="minimized-chat-pill"
      onClick={() => setIsMinimized(false)}
      className="fixed bottom-24 right-4 z-50 bg-white border border-slate-200 rounded-full shadow-2xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all text-slate-800 animate-in slide-in-from-bottom-2"
    >
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="max-w-[200px] min-w-0">
          <span className="text-xs font-bold text-slate-900 block truncate">WeatherGPT AI</span>
          <span className="text-[10px] text-slate-500 truncate block">
            {lastAssistantMsg?.content.slice(0, 45) || "Tap to expand chat..."}
          </span>
        </div>
        <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMinimized(false);
      }}
      className="text-blue-600 p-1 hover:bg-slate-100 rounded"
    >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>;
  }
  return <div
    id="active-chat-modal-overlay"
    className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
  >
      <div
    id="active-chat-dialog"
    className="w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[650px] overflow-hidden animate-in slide-in-from-bottom-4 duration-200 text-slate-800"
  >
        {
    /* Header */
  }
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">WeatherGPT AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold uppercase">
                  {persona}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {location.city} • {weather?.temp ?? 32}°C ({weather?.condition ?? "Live"})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
    onClick={onClearChat}
    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
    title="Clear Conversation"
  >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
    onClick={() => setIsMinimized(true)}
    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
    title={t.minimize}
  >
              <Minus className="w-4 h-4" />
            </button>
            <button
    onClick={onClose}
    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
    title={t.close}
  >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {
    /* Message Feed */
  }
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
          {messages.map((msg) => {
    const isUser = msg.role === "user";
    return <div
      key={msg.id}
      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
                {!isUser && <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>}

                <div
      className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-sm ${isUser ? "bg-blue-600 text-white rounded-br-xs font-medium" : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"}`}
    >
                  <MarkdownMessage content={msg.content} isUser={isUser} />

                  {!isUser && <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1.5">
                        <button
      onClick={() => handleSpeak(msg.content)}
      className="hover:text-blue-600 p-0.5 cursor-pointer"
      title="Read Aloud"
    >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-blue-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
      onClick={() => handleCopy(msg.id, msg.content)}
      className="hover:text-blue-600 p-0.5 cursor-pointer"
      title="Copy"
    >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>}
                </div>
              </div>;
  })}

          {isLoading && <div className="flex gap-2.5 items-center text-slate-500 text-xs">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>{t.weatherGptAnalyzing || "Processing meteorological data..."}</span>
            </div>}

          <div ref={messagesEndRef} />
        </div>

        {
    /* Input Form */
  }
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
    type="button"
    onClick={onStartVoice}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isListening ? "bg-rose-500 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
    title="Voice Input"
  >
            <Mic className="w-4.5 h-4.5" />
          </button>

          <input
    type="text"
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    placeholder={t.askAnythingPlaceholder || "Ask anything about rain, crops, alerts..."}
    className="flex-1 bg-slate-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none font-sans"
  />

          <button
    type="submit"
    disabled={!inputText.trim() || isLoading}
    className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer"
  >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>;
};
