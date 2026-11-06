import { useRef, useEffect, useState } from "react";
import {
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sprout,
  Trash2
} from "lucide-react";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ChatInput } from "./ChatInput";
import { MarkdownMessage } from "./MarkdownMessage";
export const ChatPanel = ({
  messages,
  onSendMessage,
  isLoading,
  persona,
  location,
  weather,
  onClearChat
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2e3);
  };
  const handleSpeak = (text, id) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis not supported on this browser.");
      return;
    }
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };
  return <div id="chat-panel-container" className="flex flex-col h-full bg-slate-950/80 backdrop-blur-2xl border border-sky-500/20 rounded-3xl overflow-hidden shadow-2xl">
      {
    /* Panel Top Header */
  }
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-sky-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">WeatherGPT Assistant</span>
              <span className="text-[10px] text-sky-400 font-medium px-1.5 py-0.2 rounded-full bg-sky-500/10 border border-sky-500/30">
                Gemini 3.7
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Grounded in {location.city || "India"} Meteorological Data
            </span>
          </div>
        </div>

        {messages.length > 0 && <button
    onClick={onClearChat}
    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
    title="Clear Chat History"
  >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>}
      </div>

      {
    /* Messages Scroll Area */
  }
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">
                Welcome to WeatherGPT AI
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Ask anything about rainfall, agricultural advisories, heatwaves, cyclones, or route hazards across India.
              </p>
            </div>
          </div> : messages.map((msg) => {
    const isUser = msg.role === "user";
    return <div
      key={msg.id}
      id={`chat-msg-${msg.id}`}
      className={`flex gap-2.5 sm:gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
                {!isUser && <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-sky-500/20">
                    <Bot className="w-4 h-4" />
                  </div>}

                <div
      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-lg ${isUser ? "bg-sky-600 text-white rounded-br-none border border-sky-400/40" : "bg-slate-900/90 text-slate-100 rounded-bl-none border border-sky-500/20"}`}
    >
                  {
      /* Persona Tag if Assistant */
    }
                  {!isUser && <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-sky-300">
                        {msg.persona === "farmer" ? <>
                            <Sprout className="w-3 h-3 text-emerald-400" /> Kisan Salah
                          </> : msg.persona === "disaster" ? <>
                            <ShieldAlert className="w-3 h-3 text-rose-400" /> Disaster Advisory
                          </> : <>
                            <Sparkles className="w-3 h-3 text-sky-400" /> Citizen Assistant
                          </>}
                      </span>
                      <span className="font-mono text-[9px]">{msg.timestamp}</span>
                    </div>}

                  {
      /* Message Content formatted with Markdown-like lists */
    }
                  <MarkdownMessage content={msg.content} isUser={isUser} />

                  {
      /* Actions for Assistant Messages */
    }
                  {!isUser && <div className="flex items-center gap-2 mt-2.5 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <button
      onClick={() => handleCopy(msg.content, msg.id)}
      className="hover:text-sky-300 flex items-center gap-1 transition-colors"
      title="Copy text"
    >
                        {copiedId === msg.id ? <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copied</span>
                          </> : <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copy</span>
                          </>}
                      </button>

                      <button
      onClick={() => handleSpeak(msg.content, msg.id)}
      className="hover:text-sky-300 flex items-center gap-1 transition-colors ml-2"
      title="Read Aloud"
    >
                        {speakingId === msg.id ? <>
                            <VolumeX className="w-3 h-3 text-rose-400 animate-pulse" />
                            <span className="text-[10px] text-rose-400">Stop Voice</span>
                          </> : <>
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[10px]">Listen</span>
                          </>}
                      </button>
                    </div>}
                </div>

                {isUser && <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>}
              </div>;
  })}

        {
    /* Loading Spinner Indicator */
  }
        {isLoading && <div className="flex items-center gap-2 text-sky-400 text-xs p-3 rounded-2xl bg-slate-900/60 border border-sky-500/20 max-w-xs animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>WeatherGPT is analyzing weather intelligence...</span>
          </div>}

        <div ref={messagesEndRef} />
      </div>

      {
    /* Suggested Questions Section */
  }
      <div className="px-3 sm:px-4 py-2 border-t border-slate-800/80 bg-slate-900/50">
        <SuggestedQuestions
    persona={persona}
    location={location}
    onSelectQuestion={(q) => {
      onSendMessage(q);
      scrollToBottom();
    }}
  />
      </div>

      {
    /* Input Form Bar */
  }
      <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-sky-500/15">
        <ChatInput
    onSendMessage={(txt) => {
      onSendMessage(txt);
      scrollToBottom();
    }}
    isLoading={isLoading}
    persona={persona}
    cityName={location.city || "India"}
  />
      </div>
    </div>;
};
