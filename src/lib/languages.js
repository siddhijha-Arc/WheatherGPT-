export const ALL_INDIC_LANGUAGES = [
  { id: "en", name: "English", nativeName: "English", flag: "🌐", ttsLang: "en-IN", script: "Latin" },
  { id: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", ttsLang: "hi-IN", script: "Devanagari" },
  { id: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", ttsLang: "bn-IN", script: "Bengali" },
  { id: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳", ttsLang: "or-IN", script: "Odia" },
  { id: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", ttsLang: "ta-IN", script: "Tamil" },
  { id: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", ttsLang: "te-IN", script: "Telugu" },
  { id: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", ttsLang: "ml-IN", script: "Malayalam" },
  { id: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", ttsLang: "kn-IN", script: "Kannada" },
  { id: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", ttsLang: "mr-IN", script: "Devanagari" },
  { id: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", ttsLang: "gu-IN", script: "Gujarati" }
];

export const getLanguageConfig = (langId) => {
  return ALL_INDIC_LANGUAGES.find((l) => l.id === langId) || ALL_INDIC_LANGUAGES[0];
};

