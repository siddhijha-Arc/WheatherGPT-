import { useState } from "react";
import {
  signInUser,
  signUpUser
} from "../lib/supabase";

export const LoginPage = ({
  onLoginSuccess,
  onSkip,
  language = "en",
  onLanguageChange
}) => {
  const [authMode, setAuthMode] = useState("phone"); // 'phone' | 'email'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState("5829");

  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const isHi = language === "hi";

  const handleSendOtp = (e) => {
    e?.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setErrorMsg(isHi ? "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    // Simulate Instant OTP delivery
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setDemoOtp(generated);

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setSuccessMsg(
        isHi
          ? `+91 ${cleaned} पर ओटीपी भेजा गया! (परीक्षण के लिए कोड: ${generated})`
          : `OTP sent to +91 ${cleaned}! (For testing, enter code: ${generated})`
      );
    }, 600);
  };

  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!otpCode.trim()) {
      setErrorMsg(isHi ? "कृपया 4-अंकीय ओटीपी दर्ज करें।" : "Please enter the 4-digit OTP.");
      return;
    }

    if (otpCode.trim() !== demoOtp && otpCode.trim() !== "1234") {
      setErrorMsg(isHi ? "अमान्य ओटीपी कोड। कृपया ऊपर दिखाया गया ओटीपी या 1234 दर्ज करें।" : "Invalid OTP code. Please enter the OTP displayed above or 1234.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const userObj = {
        id: `phone_${phoneNumber.replace(/\D/g, "")}`,
        name: isHi ? `उपयोगकर्ता +91 ${phoneNumber.slice(-4)}` : `User +91 ${phoneNumber.slice(-4)}`,
        phone: `+91 ${phoneNumber.replace(/\D/g, "")}`,
        email: `user${phoneNumber.replace(/\D/g, "")}@indianweather.com`,
        provider: "phone"
      };

      localStorage.setItem("weathergpt_auth_user", JSON.stringify(userObj));
      setLoading(false);
      onLoginSuccess(userObj);
    }, 500);
  };

  const handleEmailAuth = async (e) => {
    e?.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg(isHi ? "कृपया ईमेल और पासवर्ड दोनों दर्ज करें।" : "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpUser(email, password, fullName || email.split("@")[0]);
        if (res.error) {
          setErrorMsg(res.error.message || (isHi ? "खाता बनाने में विफल।" : "Failed to create account."));
        } else {
          setSuccessMsg(isHi ? "खाता सफलतापूर्वक बन गया!" : "Account created successfully!");
          const userObj = {
            id: res.data?.user?.id || Date.now().toString(),
            name: fullName || email.split("@")[0],
            email: email,
            provider: "supabase_email"
          };
          localStorage.setItem("weathergpt_auth_user", JSON.stringify(userObj));
          setTimeout(() => onLoginSuccess(userObj), 600);
        }
      } else {
        const res = await signInUser(email, password);
        if (res.error) {
          // If supabase not configured, provide fallback local login
          const userObj = {
            id: `user_${Date.now()}`,
            name: fullName || email.split("@")[0],
            email: email,
            provider: "email"
          };
          localStorage.setItem("weathergpt_auth_user", JSON.stringify(userObj));
          setSuccessMsg(isHi ? "सफलतापूर्वक लॉगिन हो गया!" : "Logged in successfully!");
          setTimeout(() => onLoginSuccess(userObj), 500);
        } else {
          setSuccessMsg(isHi ? "सफलतापूर्वक लॉगिन हो गया!" : "Logged in successfully!");
          const userObj = {
            id: res.data?.user?.id || Date.now().toString(),
            name: res.data?.user?.user_metadata?.name || email.split("@")[0],
            email: email,
            provider: "supabase_email"
          };
          localStorage.setItem("weathergpt_auth_user", JSON.stringify(userObj));
          setTimeout(() => onLoginSuccess(userObj), 600);
        }
      }
    } catch (err) {
      // Local fallback
      const userObj = {
        id: `user_${Date.now()}`,
        name: fullName || email.split("@")[0],
        email: email,
        provider: "email"
      };
      localStorage.setItem("weathergpt_auth_user", JSON.stringify(userObj));
      onLoginSuccess(userObj);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      const userObj = {
        id: `${provider.toLowerCase()}_${Date.now()}`,
        name: `${provider} User`,
        email: `${provider.toLowerCase()}.user@example.com`,
        provider: provider.toLowerCase()
      };
      localStorage.setItem("weathergpt_auth_user", JSON.stringify(userObj));
      setLoading(false);
      onLoginSuccess(userObj);
    }, 400);
  };

  return (
    <div className="bg-[#f9f9ff] text-[#191c21] antialiased min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden font-sans select-none">
      {/* Background Elements */}
      <div className="mesh-bg fixed inset-0 -z-20 bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]"></div>
      <div className="fixed inset-0 -z-10 opacity-10 bg-[radial-gradient(#004583_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      {/* Language Switcher in top corner */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-600">🌐</span>
        <button
          type="button"
          onClick={() => onLanguageChange && onLanguageChange("en")}
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !isHi ? "bg-[#004583] text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange && onLanguageChange("hi")}
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isHi ? "bg-[#004583] text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          हिन्दी
        </button>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[600px] flex-grow flex flex-col relative z-10 p-6 sm:p-8 justify-center">
        {/* Content Canvas */}
        <div className="flex-grow flex flex-col justify-center text-center space-y-4 sm:space-y-6">
          {/* Headers */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#004583] tracking-tight">
              {isHi ? "नमस्ते, " : "Namaste, "}
              <span className="font-bold text-[#191c21]">
                {isHi ? "मौसम से पहले रहें तैयार" : "Stay Ahead of the Weather"}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#414751] max-w-md mx-auto">
              {isHi
                ? "सटीक मौसम अपडेट, कृषि सलाह एवं देश भर के रडार अलर्ट पाने के लिए लॉगिन करें।"
                : "Log in to get personalized weather updates, agriculture advisories & hazard radar across India."}
            </p>
          </div>

          {/* Mode Switcher Tabs (Phone vs Email) */}
          <div className="flex justify-center items-center gap-2 max-w-xs mx-auto w-full p-1 bg-white/40 backdrop-blur-md rounded-full border border-white/60">
            <button
              type="button"
              onClick={() => {
                setAuthMode("phone");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                authMode === "phone"
                  ? "bg-[#004583] text-white shadow-xs"
                  : "text-[#414751] hover:text-[#191c21]"
              }`}
            >
              {isHi ? "मोबाइल (ओटीपी)" : "Phone (OTP)"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("email");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                authMode === "email"
                  ? "bg-[#004583] text-white shadow-xs"
                  : "text-[#414751] hover:text-[#191c21]"
              }`}
            >
              {isHi ? "ईमेल एवं पासवर्ड" : "Email & Password"}
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="max-w-md mx-auto w-full p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-rose-600 text-base">error</span>
              <span className="text-left">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="max-w-md mx-auto w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
              <span className="text-left">{successMsg}</span>
            </div>
          )}

          {/* 1. Phone OTP Form */}
          {authMode === "phone" && (
            <form
              onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
              className="space-y-4 max-w-md mx-auto w-full animate-in fade-in"
            >
              {!otpSent ? (
                <>
                  {/* Phone Input */}
                  <div className="glass-input rounded-full flex items-center px-4 py-3.5 shadow-inner focus-within:ring-2 focus-within:ring-[#004583] focus-within:border-transparent transition-all">
                    <span className="text-sm font-bold text-[#191c21] pr-3 border-r border-[#c1c6d3]/60 mr-3">
                      +91
                    </span>
                    <input
                      id="login-phone-input"
                      aria-label="Phone number"
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-[#191c21] text-sm sm:text-base placeholder:text-[#414751]/60 font-medium outline-none"
                      placeholder={isHi ? "10-अंकीय मोबाइल नंबर दर्ज करें" : "Enter 10-digit phone number"}
                      required
                    />
                    <span aria-hidden="true" className="material-symbols-outlined text-[#727783] ml-2 text-[20px]">
                      call
                    </span>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    id="login-get-otp-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#004583] to-[#006398] hover:from-[#00386b] hover:to-[#005280] text-white text-sm sm:text-base font-semibold rounded-full py-3.5 sm:py-4 shadow-[0_4px_16px_rgba(0,69,131,0.3)] hover:shadow-[0_6px_20px_rgba(0,69,131,0.4)] transition-all active:scale-95 cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                    ) : null}
                    <span>{loading ? (isHi ? "ओटीपी भेजा जा रहा है..." : "Sending OTP...") : (isHi ? "ओटीपी प्राप्त करें" : "Get OTP")}</span>
                  </button>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <div className="glass-input rounded-full flex items-center px-4 py-3.5 shadow-inner focus-within:ring-2 focus-within:ring-[#004583] transition-all">
                    <span className="material-symbols-outlined text-[#004583] mr-3 text-[20px]">
                      pin
                    </span>
                    <input
                      id="login-otp-input"
                      aria-label="OTP Code"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-[#191c21] text-sm sm:text-base placeholder:text-[#414751]/60 font-mono tracking-widest font-bold outline-none"
                      placeholder={isHi ? "4-अंकीय ओटीपी दर्ज करें" : "Enter 4-digit OTP"}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs px-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#004583] hover:underline font-semibold cursor-pointer"
                    >
                      {isHi ? "नंबर बदलें" : "Change Number"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#004583] hover:underline font-semibold cursor-pointer"
                    >
                      {isHi ? "ओटीपी पुनः भेजें" : "Resend OTP"}
                    </button>
                  </div>

                  {/* Verify Action Button */}
                  <button
                    id="login-verify-otp-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#004583] to-[#006398] hover:from-[#00386b] hover:to-[#005280] text-white text-sm sm:text-base font-semibold rounded-full py-3.5 sm:py-4 shadow-[0_4px_16px_rgba(0,69,131,0.3)] hover:shadow-[0_6px_20px_rgba(0,69,131,0.4)] transition-all active:scale-95 cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                    ) : null}
                    <span>{loading ? (isHi ? "सत्यापित किया जा रहा है..." : "Verifying...") : (isHi ? "सत्यापित करें एवं आगे बढ़ें" : "Verify & Continue")}</span>
                  </button>
                </>
              )}
            </form>
          )}

          {/* 2. Email & Password Form */}
          {authMode === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-3 max-w-md mx-auto w-full animate-in fade-in">
              {isSignUp && (
                <div className="glass-input rounded-full flex items-center px-4 py-3 shadow-inner focus-within:ring-2 focus-within:ring-[#004583] transition-all">
                  <span className="material-symbols-outlined text-[#727783] mr-2 text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-transparent border-none w-full focus:ring-0 p-0 text-[#191c21] text-sm placeholder:text-[#414751]/60 font-medium outline-none"
                    placeholder={isHi ? "आपका पूरा नाम" : "Your Full Name"}
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="glass-input rounded-full flex items-center px-4 py-3 shadow-inner focus-within:ring-2 focus-within:ring-[#004583] transition-all">
                <span className="material-symbols-outlined text-[#727783] mr-2 text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none w-full focus:ring-0 p-0 text-[#191c21] text-sm placeholder:text-[#414751]/60 font-medium outline-none"
                  placeholder={isHi ? "ईमेल पता" : "Email address"}
                  required
                />
              </div>

              <div className="glass-input rounded-full flex items-center px-4 py-3 shadow-inner focus-within:ring-2 focus-within:ring-[#004583] transition-all">
                <span className="material-symbols-outlined text-[#727783] mr-2 text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none w-full focus:ring-0 p-0 text-[#191c21] text-sm placeholder:text-[#414751]/60 font-medium outline-none"
                  placeholder={isHi ? "पासवर्ड" : "Password"}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#004583] to-[#006398] hover:from-[#00386b] hover:to-[#005280] text-white text-sm sm:text-base font-semibold rounded-full py-3.5 shadow-[0_4px_16px_rgba(0,69,131,0.3)] transition-all active:scale-95 cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                ) : null}
                <span>{isSignUp ? (isHi ? "खाता बनाएं" : "Create Account") : (isHi ? "ईमेल से लॉगिन करें" : "Sign In with Email")}</span>
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="text-xs text-[#004583] hover:underline font-semibold cursor-pointer"
                >
                  {isSignUp
                    ? (isHi ? "पहले से खाता है? लॉगिन करें" : "Already have an account? Sign In")
                    : (isHi ? "खाता नहीं है? साइन अप करें" : "Don't have an account? Sign Up")}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center justify-center space-x-4 max-w-md mx-auto w-full py-2 sm:py-3">
            <div className="h-px bg-[#c1c6d3]/50 flex-grow"></div>
            <span className="text-[11px] font-bold tracking-wider text-[#414751] uppercase">
              {isHi ? "या इसके साथ जारी रखें" : "OR CONTINUE WITH"}
            </span>
            <div className="h-px bg-[#c1c6d3]/50 flex-grow"></div>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
            <button
              id="google-login-btn"
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="glass-panel flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 sm:py-3 hover:bg-white/70 active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-[#191c21]">Google</span>
            </button>

            <button
              id="facebook-login-btn"
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="glass-panel flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 sm:py-3 hover:bg-white/70 active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-[#191c21]">Facebook</span>
            </button>
          </div>

          {/* Guest / Skip Option */}
          <div className="pt-2">
            <button
              id="guest-skip-btn"
              type="button"
              onClick={onSkip}
              className="text-xs text-[#004583] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
            >
              <span>{isHi ? "लॉगिन किए बिना अतिथि के रूप में देखें" : "Explore as Guest without login"}</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          {/* Footer terms */}
          <div className="mt-4 pt-2">
            <p className="text-[11px] text-[#414751] text-center">
              {isHi ? "आगे बढ़कर, आप हमारे " : "By continuing, you agree to our "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-[#004583] hover:underline font-medium cursor-pointer"
              >
                {isHi ? "नियम" : "Terms"}
              </button>{" "}
              {isHi ? "एवं " : "& "}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-[#004583] hover:underline font-medium cursor-pointer"
              >
                {isHi ? "गोपनीयता नीति" : "Privacy Policy"}
              </button>{" "}
              {isHi ? "से सहमत होते हैं।" : "."}
            </p>
          </div>
        </div>
      </main>

      {/* Terms & Privacy Modals */}
      {(showTermsModal || showPrivacyModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {showPrivacyModal ? (isHi ? "गोपनीयता नीति" : "Privacy Policy") : (isHi ? "सेवा की शर्तें" : "Terms of Service")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowTermsModal(false);
                  setShowPrivacyModal(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto leading-relaxed">
              {showPrivacyModal ? (
                <>
                  <p>
                    {isHi
                      ? "WeatherGPT आपके मौसम डैशबोर्ड, आपदा चेतावनी एवं कृषि सलाह को व्यक्तिगत बनाने के लिए प्रमाणीकरण जानकारी एकत्रित करता है।"
                      : "WeatherGPT collects authentication details strictly to personalize your meteorological dashboard, hazard alerts, and farmer crop advisories."}
                  </p>
                  <p>
                    {isHi
                      ? "हम उच्च सुरक्षा एन्क्रिप्शन का उपयोग करते हैं। आपका फ़ोन नंबर या ईमेल किसी अनाधिकृत पक्ष से साझा नहीं किया जाता।"
                      : "We implement industry-standard encryption. Your phone number and email are not shared with unauthorized third parties."}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {isHi
                      ? "WeatherGPT मौसम संबंधी जानकारी आधिकारिक मौसम एजेंसियों (IMD, Doppler Radars, OpenMeteo) के आधार पर सलाहकार उद्देश्य से प्रदान करता है।"
                      : "By logging into WeatherGPT, you acknowledge that weather intelligence is provided based on official meteorological feeds (IMD, Doppler Radars, OpenMeteo) for advisory purposes."}
                  </p>
                  <p>
                    {isHi
                      ? "गंभीर आपात स्थिति में सदैव राष्ट्रीय एवं राज्य आपदा प्रबंधन प्राधिकरण (NDMA, SDMA) के आधिकारिक निर्देशों का पालन करें।"
                      : "For critical disaster situations, always heed official NDMA, SDMA, and emergency sirens."}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowTermsModal(false);
                setShowPrivacyModal(false);
              }}
              className="w-full py-2.5 rounded-full bg-[#004583] text-white font-semibold text-xs cursor-pointer hover:bg-[#004583]/90"
            >
              {isHi ? "समझ गया / ठीक है" : "Understood"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
