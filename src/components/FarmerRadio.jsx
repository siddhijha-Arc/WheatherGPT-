import { useState, useEffect } from "react";
import { Play, Pause, Radio } from "lucide-react";
import { getTranslation, translateWeatherCondition } from "../lib/translations";
import { getLanguageConfig } from "../lib/languages";

export const FarmerRadio = ({
  location,
  weather,
  language = "en"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeSpeechText, setActiveSpeechText] = useState("");
  const t = getTranslation(language);
  const langConfig = getLanguageConfig(language);
  const city = location?.city || location?.locality || "District Area";
  const temp = weather?.temp ?? 32;
  const condition = weather?.condition ?? "Clear Conditions";
  const isRain = weather?.hazard_type === "heavy_rain" || weather?.hazard_type === "flood";
  const translatedCond = translateWeatherCondition(condition, language);

  let briefingText = "";
  if (language === "hi") {
    briefingText = isRain
      ? `नमस्कार किसान भाइयों एवं बहनों। यह है वेदर जीपीटी किसान रेडियो, आपके क्षेत्र ${city} का दैनिक मौसम बुलेटिन। आज क्षेत्र में भारी वर्षा का पूर्वानुमान है। खेतों में जल निकासी की व्यवस्था सुनिश्चित करें और कीटनाशक छिड़काव अभी स्थगित रखें। जय किसान!`
      : `नमस्कार किसान भाइयों एवं बहनों। यह है वेदर जीपीटी किसान रेडियो, आपके क्षेत्र ${city} का दैनिक मौसम बुलेटिन। आज तापमान लगभग ${temp} डिग्री सेल्सियस और मौसम ${translatedCond} रहने की संभावना है। फसलों में आवश्यकतानुसार हल्की सिंचाई करें। जय किसान!`;
  } else if (language === "bn") {
    briefingText = isRain
      ? `নমস্কার কৃষক ভাই ও বোনেরা। এটি ওয়েদার জিপিটি কৃষক রেডিও, আপনার এলাকা ${city}-র দৈনিক আবহাওয়া বুলেটিন। আজ এলাকায় ভারী বৃষ্টির সম্ভাবনা রয়েছে। জমিতে জল নিষ্কাশনের ব্যবস্থা করুন। জয় কিষাণ!`
      : `নমস্কার কৃষক ভাই ও বোনেরা। এটি ওয়েদার জিপিটি কৃষক রেডিও, আপনার এলাকা ${city}-র দৈনিক আবহাওয়া বুলেটিন। আজ তাপমাত্রা প্রায় ${temp}°C এবং আবহাওয়া ${translatedCond} থাকবে। জয় কিষাণ!`;
  } else if (language === "ta") {
    briefingText = isRain
      ? `வணக்கம் விவசாய தோழர்களே. இது WeatherGPT விவசாய ரேடியோ, உங்கள் பகுதி ${city} தினசரி வானிலை தகவல். இன்று கனமழை வாய்ப்புள்ளது. வயல்களில் நீர் வடிகால் அமைப்பை உறுதி செய்யவும். ஜெய் கிசான்!`
      : `வணக்கம் விவசாய தோழர்களே. இது WeatherGPT விவசாய ரேடியோ, உங்கள் பகுதி ${city} தினசரி வானிலை தகவல். இன்று வெப்பநிலை சுமார் ${temp}°C ஆகவும் வானிலை ${translatedCond} ஆகவும் இருக்கும். ஜெய் கிசான்!`;
  } else if (language === "te") {
    briefingText = isRain
      ? `నమస్కారం రైతు సోదరులారా. ఇది WeatherGPT రైతు రేడియో, మీ ప్రాంతం ${city} దైనందిన వాతావరణ బులెటిన్. ఈ రోజు ప్రాంతంలో భారీ వర్ష సూచన ఉంది. పొలాల్లో నీటి పారుదల సౌకర్యం ఏర్పాటు చేసుకోండి. జై కిసాన్!`
      : `నమస్కారం రైతు సోదరులారా. ఇది WeatherGPT రైతు రేడియో, మీ ప్రాంతం ${city} దైనందిన వాతావరణ బులెటిన్. ఈ రోజు ఉష్ణోగ్రత సుమారు ${temp}°C మరియు వాతావరణం ${translatedCond} ఉంటుంది. జై కిసాన్!`;
  } else if (language === "mr") {
    briefingText = isRain
      ? `नमस्कार शेतकरी बंधू-भगिनींनो. हे आहे वेदर जीपीटी शेतकरी रेडिओ, तुमच्या ${city} क्षेत्राचे दैनिक हवामान बुलेटिन. आज परिसरात मुसळधार पावसाचा अंदाज आहे. शेतात पाणी निचरा होण्याची सोय करा. जय किसान!`
      : `नमस्कार शेतकरी बंधू-भगिनींनो. हे आहे वेदर जीपीटी शेतकरी रेडिओ, तुमच्या ${city} क्षेत्राचे दैनिक हवामान बुलेटिन. आज तापमान सुमारे ${temp}°C आणि हवामान ${translatedCond} राहण्याची शक्यता आहे. जय किसान!`;
  } else if (language === "gu") {
    briefingText = isRain
      ? `નમસ્કાર ખેડૂત ભાઈઓ અને બહેનો. આ છે વેધર જીપીટી ખેડૂત રેડિયો, તમારા વિસ્તાર ${city} નું દૈનિક હવામાન બુલેટિન. આજે ભારે વરસાદની આગાહી છે. ખેતરમાં પાણીના નિકાલની વ્યવસ્થા કરો. જય કિસાન!`
      : `નમસ્કાર ખેડૂત ભાઈઓ અને બહેનો. આ છે વેધર જીપીટી ખેડૂત રેડિયો, તમારા વિસ્તાર ${city} નું દૈનિક હવામાન બુલેટિન. આજે તાપમાન આશરે ${temp}°C અને હવામાન ${translatedCond} રહેવાની શક્યતા છે. જય કિસાન!`;
  } else if (language === "kn") {
    briefingText = isRain
      ? `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ. ಇದು WeatherGPT ರೈತ ರೇಡಿಯೋ, ನಿಮ್ಮ ${city} ಪ್ರದೇಶದ ದೈನಂದಿನ ಹವಾಮಾನ ವರದಿ. ಇಂದು ಭಾರಿ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇದೆ. ಹೊಲಗಳಲ್ಲಿ ನೀರು ಹರಿದುಹೋಗುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಜೈ ಕಿಸಾನ್!`
      : `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ. ಇದು WeatherGPT ರೈತ ರೇಡಿಯೋ, ನಿಮ್ಮ ${city} ಪ್ರದೇಶದ ದೈನಂದಿನ ಹವಾಮಾನ ವರದಿ. ಇಂದು ತಾಪಮಾನ ಸುಮಾರು ${temp}°C ಮತ್ತು ಹವಾಮಾನ ${translatedCond} ಇರಲಿದೆ. ಜೈ ಕಿಸಾನ್!`;
  } else if (language === "ml") {
    briefingText = isRain
      ? `നമസ്കാരം കർഷക സുഹൃത്തുക്കളേ. ഇത് WeatherGPT കർഷക റേഡിയോ, ${city} പ്രദേശത്തെ പ്രതിദിന കാലാവസ്ഥ ബുള്ളറ്റിൻ. ഇന്ന് കനത്ത മഴയ്ക്ക് സാധ്യതയുണ്ട്. വയലുകളിൽ ഡ്രെയിനേജ് ഉറപ്പാക്കുക. ജയ് കിസാൻ!`
      : `നമസ്കാരം കർഷക സുഹൃത്തുക്കളേ. ഇത് WeatherGPT കർഷക റേഡിയോ, ${city} പ്രദേശത്തെ പ്രതിദിന കാലാവസ്ഥ ബുള്ളറ്റിൻ. ഇന്ന് താപനില ഏകദേശം ${temp}°C ഉം കാലാവസ്ഥ ${translatedCond} ഉം ആയിരിക്കും. ജയ് കിസാൻ!`;
  } else if (language === "pa") {
    briefingText = isRain
      ? `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ। ਇਹ ਹੈ ਵੈਦਰ ਜੀਪੀਟੀ ਕਿਸਾਨ ਰੇਡੀਓ, ਤੁਹਾਡੇ ਖੇਤਰ ${city} ਦਾ ਰੋਜ਼ਾਨਾ ਮੌਸਮ ਬੁਲੇਟਿਨ। ਅੱਜ ਭਾਰੀ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਖੇਤਾਂ ਵਿੱਚ ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਦਾ ਪ੍ਰਬੰਧ ਸੁਨਿਸ਼ਚਿਤ ਕਰੋ। ਜੈ ਕਿਸਾਨ!`
      : `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ। ਇਹ ਹੈ ਵੈਦਰ ਜੀਪੀਟੀ ਕਿਸਾਨ ਰੇਡੀਓ, ਤੁਹਾਡੇ ਖੇਤਰ ${city} ਦਾ ਰੋਜ਼ਾਨਾ ਮੌਸਮ ਬੁਲੇਟਿਨ। ਅੱਜ ਤਾਪਮਾਨ ਲਗਭਗ ${temp}°C ਅਤੇ ਮੌਸਮ ${translatedCond} ਰਹਿਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਜੈ ਕਿਸਾਨ!`;
  } else {
    briefingText = isRain
      ? `Welcome to Farmer Radio daily weather bulletin for ${city}. Heavy rainfall is observed across the region today. Farmers are advised to inspect field drainage and postpone chemical spraying.`
      : `Welcome to Farmer Radio daily weather bulletin for ${city}. Today's temperature is approximately ${temp}°C with ${translatedCond}. Conditions are favorable for routine agricultural operations.`;
  }

  useEffect(() => {
    const cleanedBriefing = briefingText.replace(/ जय किसान!| Jai Kisan!| Jai Kisaan!/g, "");
    setActiveSpeechText(cleanedBriefing);
    if (!("speechSynthesis" in window)) {
      setSpeechSupported(false);
    } else {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [city, temp, condition, isRain, language]);

  const handleTogglePlay = () => {
    if (!("speechSynthesis" in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeSpeechText);
      const voices = window.speechSynthesis.getVoices();
      
      utterance.lang = langConfig?.ttsLang || "en-IN";
      const codePrefix = (language || "hi").toLowerCase();
      const matchedVoice = voices.find((v) => 
        (v.lang || "").toLowerCase().startsWith(codePrefix) || 
        (v.lang || "").toLowerCase().includes(codePrefix) ||
        (v.name || "").toLowerCase().includes(langConfig.name.toLowerCase())
      ) || voices.find((v) => (v.lang || "").toLowerCase().includes("hi") || (v.lang || "").toLowerCase().includes("in"));

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  return <div
    id="farmer-radio-card"
    className="w-full rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/35 p-3.5 sm:p-4 shadow-2xl relative overflow-hidden text-slate-100"
  >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-0.5 shadow-lg flex items-center justify-center text-emerald-400">
              <Radio className="w-6 h-6" />
            </div>
            {isPlaying && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {language === "hi" ? "\u0926\u0948\u0928\u093F\u0915 \u092C\u0941\u0932\u0947\u091F\u093F\u0928" : "Daily Broadcast"}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{city}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
              {t.farmerRadioTitle}
            </h3>
          </div>
        </div>

        {
    /* Play / Pause Broadcast Button */
  }
        <button
    id="farmer-radio-play-btn"
    onClick={handleTogglePlay}
    className={`h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-xs shadow-lg transition-all cursor-pointer ${isPlaying ? "bg-rose-500 text-white animate-pulse" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95"}`}
  >
          {isPlaying ? <>
              <Pause className="w-4 h-4" />
              <span>{language === "hi" ? "\u0930\u094B\u0915\u0947\u0902" : "Pause"}</span>
            </> : <>
              <Play className="w-4 h-4 fill-current" />
              <span>{language === "hi" ? "\u0938\u0941\u0928\u0947\u0902" : "Listen"}</span>
            </>}
        </button>
      </div>

      {
    /* Broadcast Text Script */
  }
      <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        {activeSpeechText}
      </div>
    </div>;
};
