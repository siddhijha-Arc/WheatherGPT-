import { Sparkles, ArrowUpRight } from "lucide-react";
export const SuggestedQuestions = ({
  persona,
  location,
  onSelectQuestion
}) => {
  const city = location.city || "Delhi";
  const getQuestions = () => {
    switch (persona) {
      case "farmer":
        return [
          { text: `Kal se ${city} mein kheti aur sinchai ke liye mausam kaisa rahega?`, category: "\u{1F331} Irrigation" },
          { text: `Kya agle 3 din mein fasal par keet-nashak spray karna safe hai?`, category: "\u{1F33E} Crop Health" },
          { text: `Monsoon ki baarish se anaaj mandi transport par kya asar hoga?`, category: "\u{1F69C} Mandi Alert" },
          { text: `Pashuon ko heatwave aur loo se bachane ke liye IMD advisory kya hai?`, category: "\u{1F404} Livestock" }
        ];
      case "fisherman":
        return [
          { text: `Kya aaj ${city} ke aas-paas ke samundar mein jana safe hai ya high waves hain?`, category: "⚓ Go/No-Go" },
          { text: `INCOIS ke hisab se ${city} ke paas Potential Fishing Zone (PFZ) coordinates kya hain?`, category: "🐟 Fishing Zone" },
          { text: `Agar samundar mein engine kharab ho jaye to local Coast Guard helpline kya hai?`, category: "🚨 Emergency SOS" },
          { text: `Swell (स्वेल) aur normal wave mein kya farq hota hai aur ye kyun dangerous hai?`, category: "🌊 Sea Safety" }
        ];
      case "disaster":
        return [
          { text: `Kya ${city} ya aas-paas ke highway par koi flash flood risk hai?`, category: "\u{1F6A8} Flood Risk" },
          { text: `Samundar aur coastal belt mein machhuaon ke liye safe hai kya?`, category: "\u{1F300} Cyclone Watch" },
          { text: `Emergency disaster helplines aur local relief camps kahan hain?`, category: "\u{1F6E1}\uFE0F Relief Prep" },
          { text: `High wind gusts aur lightning ke dauran safe shelter guidelines kya hain?`, category: "\u26A1 Lightning" }
        ];
      case "traveller":
        return [
          { text: `Kya ${city} se outstation highway par kohra ya visibility ki koi problem hai?`, category: "🚗 Highway Safety" },
          { text: `Agle 3 dinon mein ghumne ke liye destination weather aur packing tips kya hain?`, category: "🧳 Trip Planner" },
          { text: `Kya raste mein kahin flash flood ya landslide hazard alert hai?`, category: "⚠️ Route Hazard" },
          { text: `Drive karte samay aaj ka live UV index aur temp kaisa rahega?`, category: "☀️ Travel Comfort" }
        ];
      case "citizen":
      default:
        return [
          { text: `Kya aaj ${city} mein baarish hogi ya chhatri le jaana padega?`, category: "\u{1F327}\uFE0F Commute" },
          { text: `Shaam ko outdoor running / sports ke liye AQI aur temp kaisa hai?`, category: "\u{1F3C3} Outdoor" },
          { text: `Weekend trip ke liye outstation road conditions safe hain kya?`, category: "\u{1F697} Travel" },
          { text: `Aaj ka UV index aur afternoon loo protection advisory kya hai?`, category: "\u2600\uFE0F Heat Care" }
        ];
    }
  };
  const questions = getQuestions();
  return <div id="suggested-questions-container" className="w-full">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-xs font-bold text-slate-200">People are asking...</span>
        <span className="text-[10px] text-slate-400 font-medium ml-auto">Click to ask Gemini</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar snap-x">
        {questions.map((q, idx) => <button
    key={idx}
    id={`suggested-q-${idx}`}
    onClick={() => onSelectQuestion(q.text)}
    className="snap-start shrink-0 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-sky-500/20 hover:border-sky-400/50 text-left transition-all text-xs text-slate-200 group max-w-[260px] sm:max-w-[300px] shadow-sm cursor-pointer"
  >
            <div className="space-y-0.5">
              <span className="text-[9px] font-semibold text-sky-400 uppercase tracking-wider block">
                {q.category}
              </span>
              <p className="line-clamp-2 leading-snug font-medium text-slate-200 group-hover:text-white">
                "{q.text}"
              </p>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </button>)}
      </div>
    </div>;
};
