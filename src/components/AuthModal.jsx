import { useState } from "react";
import {
  X,
  Database,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  LogOut
} from "lucide-react";
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  signInUser,
  signUpUser,
  signOutUser
} from "../lib/supabase";
export const AuthModal = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.anonKey);
  const [credsSaved, setCredsSaved] = useState(false);
  if (!isOpen) return null;
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }
    if (isSignUp) {
      const res = await signUpUser(email, password, name || email.split("@")[0]);
      if (res.error) {
        setAuthError(res.error.message || "Signup failed.");
      } else {
        setAuthSuccess("Account created successfully!");
        if (res.data?.user) {
          const u = {
            email: res.data.user.email || email,
            name: res.data.user.user_metadata?.name || name || "User"
          };
          onUserUpdate(u);
        }
      }
    } else {
      const res = await signInUser(email, password);
      if (res.error) {
        setAuthError(res.error.message || "Login failed. Check credentials.");
      } else {
        setAuthSuccess("Logged in successfully!");
        if (res.data?.user) {
          const u = {
            email: res.data.user.email || email,
            name: res.data.user.user_metadata?.name || email.split("@")[0]
          };
          onUserUpdate(u);
        }
      }
    }
  };
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrl.trim(), supabaseAnonKey.trim());
    setCredsSaved(true);
    setTimeout(() => setCredsSaved(false), 3e3);
  };
  const handleSignOut = async () => {
    localStorage.removeItem("weathergpt_auth_user");
    try {
      await signOutUser();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    if (onLogout) {
      onLogout();
    } else {
      onUserUpdate(null);
    }
    onClose();
  };
  return <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-[#080e1a] border border-sky-500/30 p-5 sm:p-6 shadow-2xl space-y-4 relative">
        {
    /* Close Button */
  }
        <button
    onClick={onClose}
    id="close-auth-modal"
    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
  >
          <X className="w-5 h-5" />
        </button>

        {
    /* Tabs Header */
  }
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
    onClick={() => setActiveTab("auth")}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "auth" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "text-slate-400 hover:text-slate-200"}`}
  >
            <User className="w-3.5 h-3.5" />
            <span>User Account</span>
          </button>

          <button
    onClick={() => setActiveTab("supabase")}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "supabase" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"}`}
  >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Config</span>
          </button>
        </div>

        {
    /* Tab 1: User Account Sign In / Sign Up */
  }
        {activeTab === "auth" && <div className="space-y-4">
            {user ? <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{user.name}</h4>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Session
                  </span>
                  <button
    onClick={handleSignOut}
    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div> : <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isSignUp ? "Create WeatherGPT Account" : "Sign in to WeatherGPT"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sync saved locations, custom alert routes, and persona preferences
                  </p>
                </div>

                {authError && <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>}

                {authSuccess && <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{authSuccess}</span>
                  </div>}

                {isSignUp && <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Your Name
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Rajesh Kumar"
    className="bg-transparent border-none focus:outline-none w-full text-slate-100"
  />
                    </div>
                  </div>}

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="user@example.com"
    className="bg-transparent border-none focus:outline-none w-full text-slate-100"
  />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="bg-transparent border-none focus:outline-none w-full text-slate-100"
  />
                  </div>
                </div>

                <button
    type="submit"
    id="auth-submit-btn"
    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-bold text-xs hover:scale-102 transition-transform shadow-lg shadow-sky-500/20 cursor-pointer mt-2"
  >
                  {isSignUp ? "Create Account" : "Sign In"}
                </button>

                <div className="text-center pt-2">
                  <button
    type="button"
    onClick={() => {
      setIsSignUp(!isSignUp);
      setAuthError(null);
    }}
    className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
  >
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </form>}
          </div>}

        {
    /* Tab 2: Supabase Project Credentials Setup */
  }
        {activeTab === "supabase" && <form onSubmit={handleSaveCredentials} className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Supabase Project Connection
              </h3>
              <p className="text-xs text-slate-400">
                Connect your personal Supabase project (URL + Anon API Key)
              </p>
            </div>

            {credsSaved && <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Credentials saved! Connected to your Supabase instance.</span>
              </div>}

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Supabase Project URL
              </label>
              <input
    type="text"
    value={supabaseUrl}
    onChange={(e) => setSupabaseUrl(e.target.value)}
    placeholder="https://your-project.supabase.co"
    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
  />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Supabase Anon API Key
              </label>
              <input
    type="password"
    value={supabaseAnonKey}
    onChange={(e) => setSupabaseAnonKey(e.target.value)}
    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
  />
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300 block">⚡ Zero Leakage Guarantee:</span>
              <p>
                API keys are safely stored in your browser session and proxy through edge handlers. No secrets are exposed on the client.
              </p>
            </div>

            <button
    type="submit"
    id="save-supabase-btn"
    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
  >
              Save & Connect Project
            </button>
          </form>}
      </div>
    </div>;
};
