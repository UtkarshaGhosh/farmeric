import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LanguageCode =
  | "en"
  | "hi"
  | "bn"
  | "ml"
  | "ta"
  | "as"
  | "gu"
  | "mr";

type Dict = Record<string, string>;

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  n: (value: number | bigint, opts?: Intl.NumberFormatOptions) => string;
};

export const LANGUAGES: { code: LanguageCode; label: string; locale: string }[] = [
  { code: "en", label: "English", locale: "en-IN" },
  { code: "hi", label: "हिन्दी", locale: "hi-IN" },
  { code: "bn", label: "বাংলা", locale: "bn-IN" },
  { code: "ml", label: "മലയാളം", locale: "ml-IN" },
  { code: "ta", label: "தமிழ்", locale: "ta-IN" },
  { code: "as", label: "অসমীয়া", locale: "as-IN" },
  { code: "gu", label: "ગુજરાતી", locale: "gu-IN" },
  { code: "mr", label: "मराठी", locale: "mr-IN" },
];

const dictionaries: Record<LanguageCode, Dict> = {
  en: {
    "auth.welcome": "Welcome",
    "auth.signInOrCreate": "Sign in or create an account",
    "auth.login": "Login",
    "auth.signUp": "Sign Up",
    "auth.signIn": "Sign In",
    "auth.confirmPassword": "Confirm Password",
    "auth.role": "Role",
    "auth.didntGetEmail": "Didn’t get the email?",
    "auth.resendVerification": "Resend verification",
    "roles.farmer": "Farmer",
    "roles.vet": "Vet",
    "common.email": "Email",
    "common.password": "Password",
    "common.name": "Name",
    "common.phone": "Phone",
    "common.of": "of",
    "common.progress": "Progress",
    "common.review": "Review",
    "common.start": "Start",
    "common.all": "All",
    "common.low": "Low",
    "common.medium": "Medium",
    "common.high": "High",
    "common.district": "District",
    "common.village": "Village",
    "common.state": "State",
    "common.preferredLanguage": "Preferred Language",
    "common.selectLanguage": "Select language",
    "common.continue": "Continue",
    "common.logout": "Logout",
    "common.noFarms": "No farms",
    "common.noAlerts": "No alerts",
    "common.riskLevel": "Risk Level",
    "common.districtsAll": "All Districts",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "Your name",
    "ph.phone": "e.g., 9876543210",
    "ph.confirm": "••••••",
    "nav.vetPortal": "Biosecurity Vet Portal",
    "nav.dashboard": "Dashboard",
    "nav.farmOversight": "Farm Oversight",
    "nav.complianceReview": "Compliance Review",
    "nav.outbreakReporting": "Outbreak Reporting",
    "header.welcome": "Welcome",
    "header.risk": "Risk",
    "farm.yourFarm": "Your Farm",
    "training.progress": "Training Progress",
    "training.modulesCompleted": "modules completed",
    "compliance.status": "Compliance Status",
    "compliance.pendingReview": "documents pending review",
    "compliance.uploadNew": "Upload New Document",
    "alerts.activeAlerts": "Active Alerts",
    "alerts.inYourArea": "disease outbreaks in your area",
    "risk.assessment": "Risk Assessment",
    "risk.currentScore": "Current Score",
    "risk.lastAssessment": "Last Assessment",
    "risk.nextDue": "Next Due",
    "risk.days": "days",
    "risk.startNew": "Start New Assessment",
    "onboarding.welcome": "Welcome",
    "onboarding.setupProfile": "Let's set up your profile",
    "onboarding.fullName": "Full Name",
    "farm.setupTitle": "Set up your farm",
    "farm.setupDesc": "Create a farm profile to continue",
    "farm.name": "Farm Name",
    "farm.namePh": "e.g., Green Valley Farm",
    "farm.livestockType": "Livestock Type",
    "farm.pig": "Pig",
    "farm.poultry": "Poultry",
    "farm.herdSize": "Herd Size",
    "farm.numberOfAnimals": "Number of animals",
    "farm.saveFarm": "Save Farm",
    "logout.signingOut": "Signing out",
    "logout.pleaseWait": "Please wait while we log you out…",
    "notFound.subtitle": "Oops! Page not found",
    "notFound.backHome": "Return to Home",
    "vet.dashboardTitle": "Vet Dashboard",
    "vet.dashboardDesc": "Overview of farms, risks and alerts",
    "vet.totalFarms": "Total Farms",
    "vet.highRiskFarms": "High Risk Farms",
    "vet.pendingCompliance": "Pending Compliance",
    "vet.mapTitle": "Farm & Outbreak Map",
    "vet.filterByDistrict": "Filter by district",
    "vet.farms": "Farms",
    "vet.outbreaks": "Outbreaks",
    "vet.latestAlerts": "Latest Alerts",
    "vet.noRecentAlerts": "No recent alerts",
    "vet.searchPlaceholder": "Search by farm ID or farmer name",
    "vet.allRisks": "All Risks",
    "vet.noFarmsMatch": "No farms match your filters.",
    "vet.last": "Last",
    "compliance.document": "Document",
    "compliance.farmer": "Farmer",
    "compliance.date": "Date",
    "compliance.statusCol": "Status",
    "compliance.approve": "Approve",
    "compliance.reject": "Reject",
    "compliance.nonePending": "No pending submissions.",
    "outbreaks.diseaseName": "Disease Name",
    "outbreaks.severity": "Severity",
    "outbreaks.notes": "Notes",
    "outbreaks.submitReport": "Submit Report",
    "outbreaks.history": "Outbreak History",
    "outbreaks.none": "No history yet.",
    "outbreaks.reported": "Outbreak reported",
  },
  hi: {
    "auth.welcome": "स्वागत है",
    "auth.signInOrCreate": "साइन इन करें या खाता बनाएं",
    "auth.login": "लॉगिन",
    "auth.signUp": "साइन अप",
    "auth.signIn": "साइन इन",
    "auth.confirmPassword": "पासवर्ड की पुष्टि करें",
    "auth.role": "भूमिका",
    "auth.didntGetEmail": "ईमेल नहीं मिला?",
    "auth.resendVerification": "पुष्टिकरण पुनः भेजें",
    "roles.farmer": "किसान",
    "roles.vet": "पशु चिकित्सक",
    "common.email": "ईमेल",
    "common.password": "पासवर्ड",
    "common.name": "नाम",
    "common.phone": "फोन",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "आपका नाम",
    "ph.phone": "उदा., 9876543210",
    "ph.confirm": "••••••",
  },
  bn: {
    "auth.welcome": "স্ব���গতম",
    "auth.signInOrCreate": "সাইন ইন করুন বা একটি অ্যাকাউন্ট তৈরি করুন",
    "auth.login": "লগইন",
    "auth.signUp": "সাইন আপ",
    "auth.signIn": "সাইন ইন",
    "auth.confirmPassword": "পাসওয়ার্ড নিশ্চিত করুন",
    "auth.role": "ভূমিকা",
    "auth.didntGetEmail": "ইমেল পাননি?",
    "auth.resendVerification": "যাচাইকরণ আবার পাঠান",
    "roles.farmer": "কৃষক",
    "roles.vet": "ভেট",
    "common.email": "ইমেল",
    "common.password": "পাসওয়ার্ড",
    "common.name": "নাম",
    "common.phone": "ফোন",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "আপনার নাম",
    "ph.phone": "যেমন, 9876543210",
    "ph.confirm": "••••••",
  },
  ml: {
    "auth.welcome": "സ്വാഗതം",
    "auth.signInOrCreate": "സൈൻ ഇൻ ചെയ്യുക അല്ലെങ്കിൽ അക്കൗണ്ട് സൃഷ്ടിക്കുക",
    "auth.login": "ലോഗിൻ",
    "auth.signUp": "സൈൻ അപ്പ്",
    "auth.signIn": "സൈൻ ഇൻ",
    "auth.confirmPassword": "പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക",
    "auth.role": "പദവി",
    "auth.didntGetEmail": "ഇമെയിൽ ലഭിച്ചില്ലേ?",
    "auth.resendVerification": "സ്ഥിരീകരണം വീണ്ടും അയക്കുക",
    "roles.farmer": "കർഷകൻ",
    "roles.vet": "വെറ്റ്",
    "common.email": "ഇമെയിൽ",
    "common.password": "പാസ്വേഡ്",
    "common.name": "പേര്",
    "common.phone": "ഫോൺ",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "നിങ്ങളുടെ പേര്",
    "ph.phone": "ഉദാ., 9876543210",
    "ph.confirm": "••••••",
  },
  ta: {
    "auth.welcome": "வரவேற்பு",
    "auth.signInOrCreate": "உள்நுழைய அல்லது கணக்கு உருவாக்கவும்",
    "auth.login": "லாகின்",
    "auth.signUp": "சைன் அப்",
    "auth.signIn": "உள்நுழைக",
    "auth.confirmPassword": "���டவுச்சொல்லை உறுதிப்படுத்தவும்",
    "auth.role": "பங்கு",
    "auth.didntGetEmail": "மின்னஞ்சல் கிடைக்கவில்லையா?",
    "auth.resendVerification": "சரிபார்ப்பை மீண்டும் அனுப்பவும்",
    "roles.farmer": "விவசாயி",
    "roles.vet": "வெட்",
    "common.email": "மின்னஞ்சல்",
    "common.password": "கடவுச்சொல்",
    "common.name": "பெயர்",
    "common.phone": "தொலைபேசி",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "உங்கள் பெயர்",
    "ph.phone": "உதா., 9876543210",
    "ph.confirm": "••••••",
  },
  as: {
    "auth.welcome": "স্বাগতম",
    "auth.signInOrCreate": "চাইন ইন কৰক বা একাউণ্ট সৃষ্টি কৰক",
    "auth.login": "লগিন",
    "auth.signUp": "চাইন আপ",
    "auth.signIn": "চাইন ইন",
    "auth.confirmPassword": "পাছৱৰ্ড নিশ্চিত কৰক",
    "auth.role": "ভূমিকা",
    "auth.didntGetEmail": "ই-মেইল নাপালেনে?",
    "auth.resendVerification": "যাচাই পুনৰ পঠিয়াওক",
    "roles.farmer": "কৃষক",
    "roles.vet": "ভেট",
    "common.email": "ই-মেইল",
    "common.password": "পাছৱৰ্ড",
    "common.name": "নাম",
    "common.phone": "ফোন",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "আপোনাৰ নাম",
    "ph.phone": "যেমন, 9876543210",
    "ph.confirm": "••••••",
  },
  gu: {
    "auth.welcome": "સ્વાગત છે",
    "auth.signInOrCreate": "સાઇન ઇન કરો અથવા એકાઉન્ટ બનાવો",
    "auth.login": "લોગિન",
    "auth.signUp": "સાઇન અપ",
    "auth.signIn": "સાઇન ઇન",
    "auth.confirmPassword": "પાસવર્ડની પુષ્ટિ કરો",
    "auth.role": "ભૂમિકા",
    "auth.didntGetEmail": "ઇમેઇલ મળ્યો નથી?",
    "auth.resendVerification": "ચકાસણી ફરી મોકલો",
    "roles.farmer": "ખેડૂત",
    "roles.vet": "વેટ",
    "common.email": "ઇમેઇલ",
    "common.password": "પાસવર્ડ",
    "common.name": "નામ",
    "common.phone": "ફોન",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "તમારું નામ",
    "ph.phone": "દા., 9876543210",
    "ph.confirm": "••••••",
  },
  mr: {
    "auth.welcome": "स्वागत आहे",
    "auth.signInOrCreate": "साइन इन करा किंवा खाते तयार करा",
    "auth.login": "लॉगिन",
    "auth.signUp": "साइन अप",
    "auth.signIn": "साइन इन",
    "auth.confirmPassword": "पासवर्डची पुष्टी करा",
    "auth.role": "भूमिका",
    "auth.didntGetEmail": "ईमेल मिळाला नाही?",
    "auth.resendVerification": "पुष्टीकरण पुन्हा पाठवा",
    "roles.farmer": "शेतकरी",
    "roles.vet": "पशुवैद्य",
    "common.email": "ईमेल",
    "common.password": "पासवर्ड",
    "common.name": "नाव",
    "common.phone": "फोन",
    "ph.email": "you@example.com",
    "ph.password": "••••••",
    "ph.name": "तुमचे नाव",
    "ph.phone": "उदा., 9876543210",
    "ph.confirm": "••••••",
  },
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function detectInitial(): LanguageCode {
  const saved = localStorage.getItem("lang") as LanguageCode | null;
  if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  const nav = (navigator.language || "en").toLowerCase();
  const found = LANGUAGES.find((l) => nav.startsWith(l.code));
  return found?.code || "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(detectInitial());

  useEffect(() => {
    localStorage.setItem("lang", lang);
    const html = document.documentElement;
    html.lang = LANGUAGES.find((l) => l.code === lang)?.locale || "en-IN";
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[lang] || dictionaries.en;
    const t = (key: string, fallback?: string) => dict[key] ?? fallback ?? key;
    const n = (value: number | bigint, opts?: Intl.NumberFormatOptions) => {
      const locale = LANGUAGES.find((l) => l.code === lang)?.locale || "en-IN";
      return new Intl.NumberFormat(locale, opts).format(value as number);
    };
    const setLang = (l: LanguageCode) => setLangState(l);
    return { lang, setLang, t, n };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
