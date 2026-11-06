import { useState, useEffect, useRef } from "react";
import { Send, Mic, Loader2, Globe } from "lucide-react";
export const ChatInput = ({
  onSendMessage,
  isLoading,
  persona,
  cityName
}) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speechLanguage, setSpeechLanguage] = useState("en-IN");
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLanguage;
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const text = finalTranscript || interimTranscript;
      if (text) {
        setInput(text);
      }
    };
    recognition.onerror = (event) => {
      console.warn("Web Speech recognition error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
        }
      }
    };
  }, [speechLanguage]);
  const toggleListening = () => {
    if (!voiceSupported) {
      alert("Speech recognition is not supported in this browser. Please type your question.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = speechLanguage;
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error("Failed to start voice recognition:", err);
        setIsListening(false);
      }
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };
  const getPlaceholder = () => {
    if (persona === "farmer") {
      return `Kheti, baarish ya sinchai ke baare mein puchein (${cityName})...`;
    }
    if (persona === "disaster") {
      return `Flood, cyclone, wind hazard ya route safety alert puchein...`;
    }
    if (persona === "traveller") {
      return `Highway visibility, trip weather ya road safety ke baare mein puchein...`;
    }
    return `Ask WeatherGPT about weather in ${cityName} (English / Hinglish)...`;
  };
  return <div id="chat-input-wrapper" className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-sky-500/30 shadow-2xl focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          {
    /* Language Toggle for Voice Recognition */
  }
          {voiceSupported && <button
    type="button"
    id="voice-lang-toggle"
    onClick={() => setSpeechLanguage((l) => l === "en-IN" ? "hi-IN" : "en-IN")}
    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-[10px] font-bold text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition-colors"
    title="Toggle Voice Recognition Language (Hindi / English)"
  >
              <Globe className="w-3 h-3 text-sky-400" />
              <span>{speechLanguage === "hi-IN" ? "HI" : "EN"}</span>
            </button>}

          {
    /* Voice Microphone Button with Web Speech API */
  }
          <button
    type="button"
    id="voice-mic-btn"
    onClick={toggleListening}
    aria-label={isListening ? "Stop listening" : "Start voice input"}
    className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all cursor-pointer ${isListening ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40" : "bg-slate-900 text-slate-400 hover:text-sky-300 hover:bg-slate-800"}`}
    title={voiceSupported ? isListening ? "Listening... Speak in Hindi/English" : "Voice Input (Web Speech API)" : "Voice unsupported in this browser"}
  >
            {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
          </button>

          {
    /* Text Input */
  }
          <input
    type="text"
    id="chat-text-input"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder={getPlaceholder()}
    disabled={isLoading}
    className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-1"
  />

          {
    /* Send Button */
  }
          <button
    type="submit"
    id="chat-send-btn"
    disabled={!input.trim() || isLoading}
    aria-label="Send query to Gemini"
    className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all cursor-pointer ${input.trim() && !isLoading ? "bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-bold hover:scale-105 shadow-md shadow-sky-500/30" : "bg-slate-900 text-slate-600 cursor-not-allowed"}`}
  >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <Send className="w-4 h-4 fill-current ml-0.5" />}
          </button>
        </div>

        {
    /* Listening Indicator Status Subtitle */
  }
        {isListening && <div className="absolute -top-7 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-semibold animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>Listening ({speechLanguage === "hi-IN" ? "Hindi" : "English"})... Speak now</span>
          </div>}
      </form>
      <div className="text-[10px] text-slate-400 text-center mt-1 font-medium">
        Get instant, location-based weather insights powered by Gemini 3.7 & IMD data
      </div>
    </div>;
};
