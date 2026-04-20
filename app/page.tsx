"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Loader2,
  Copy,
  CheckCircle2,
  Languages,
  ShieldAlert,
  X,
  User,
  Key,
  Activity,
  RefreshCw,
  MoreVertical,
  LogOut,
  ExternalLink,
  MessageSquare,
  Settings,
  LayoutDashboard,
  Terminal as TerminalIcon,
  ChevronRight,
  AlertCircle,
  Info,
  ChevronDown,
} from "lucide-react";
import { auth, db, testFirebaseConnection } from "../lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

// --- Components ---

const Badge = ({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: string;
}) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider border ${colors[color]}`}
    >
      {children}
    </span>
  );
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard" | "docs">(
    "chat",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const userEmail = userData?.email?.trim().toLowerCase() || "";
  const isUnlimited = ["warek2508@gmail.com", "goh@gmail.com"].includes(userEmail);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    testFirebaseConnection();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User is authenticated as:", currentUser.uid);
        const userRef = doc(db, "users", currentUser.uid);

        // Initial silent attempt to check profile
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            console.log("Creating new user profile doc...");
            await setDoc(userRef, {
              email: currentUser.email || "",
              dailyRequests: 0,
              lastReset: new Date().toISOString(),
              apiKey: "",
              createdAt: new Date().toISOString(),
            });
            console.log("Profile created successfully.");
          } else {
            const data = snap.data();
            // If email is missing OR it's the backend placeholder 'authenticated_user', sync it!
            if (data.email !== currentUser.email && currentUser.email) {
              console.log("Syncing actual user email to database");
              await setDoc(userRef, { email: currentUser.email }, { merge: true });
            }
          }
        } catch (e: any) {
          console.error("Profile check/create failed:", e.code, e.message);
          if (e.code === "permission-denied") {
            console.warn(
              "Permission denied during initialization. This might happen if auth token is still refreshing.",
            );
          }
        }

        const unsubDoc = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            }
          },
          (error) => {
            console.error("Snapshot error:", error);
            if (error.message.includes("permissions")) {
              alert(
                lang === "ru"
                  ? "Ошибка доступа к данным. Проверьте консоль Firebase."
                  : "Data access error. Check Firebase console.",
              );
            }
          },
        );

        // Correctly handle cleanup
        return () => {
          unsubDoc();
        };
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, [lang]);

  const login = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      if (error.code === "auth/popup-blocked") {
        alert(lang === "ru" ? "Окно заблокировано." : "Popup blocked.");
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail || !authPassword) return;
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  useEffect(() => {
    console.log("Auth State Changed - User:", user?.uid);
  }, [user]);

  useEffect(() => {
    console.log("UserData Updated:", userData);
  }, [userData]);

  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const generateKey = async () => {
    console.log("generateKey triggered");
    // Immediate feedback for mobile users to confirm click
    if (typeof window !== "undefined") {
      alert(
        lang === "ru"
          ? "Начинаю создание ключа..."
          : "Starting key generation...",
      );
    }

    if (!user) {
      console.warn("generateKey: No user found");
      return;
    }

    setIsGeneratingKey(true);
    try {
      const newKey =
        "goh_" +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      console.log("Attempting to generate key:", newKey);

      // Step 1: Update API Keys mapping FIRST (to ensure it works before updating user)
      await setDoc(doc(db, "apiKeys", newKey), {
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });
      console.log("API Key mapping created successfully");

      // Step 2: Update user profile
      await setDoc(
        doc(db, "users", user.uid),
        { apiKey: newKey },
        { merge: true },
      );
      console.log("User profile updated successfully");

      setMenuOpen(false);
      alert(
        lang === "ru" ? "Ключ успешно создан!" : "Key generated successfully!",
      );
    } catch (error: any) {
      console.error("CRITICAL: Key generation failed", error);
      alert(
        lang === "ru" ? `ОШИБКА: ${error.message}` : `ERROR: ${error.message}`,
      );
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !prompt.trim() ||
      !user ||
      prompt.length > 5000 ||
      (!isUnlimited && userData?.dailyRequests >= 5)
    )
      return;
    setIsLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify({ prompt, model: "qwen/qwen3.6-plus" }),
      });
      const data = await res.json();
      setResponse(
        data.error ? `Error: ${data.error}` : data.response || "No response.",
      );
    } catch (error: any) {
      setResponse(`System Failure: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    ru: {
      appName: "GOH NEURAL",
      chat: "Терминал",
      dashboard: "Профиль",
      docs: "Доки",
      usage: "Использование",
      ofLimit: "запросов из 5",
      chars: "символов",
      placeholder: "Введите ваш запрос здесь...",
      genKey: "Создать новый API Ключ",
      apiKey: "Ваш ключ",
      copy: "Копировать",
      copied: "Готово!",
      logout: "Выйти из системы",
      rules: "Правила системы",
      limitWarn: "Лимит исчерпан. Сброс через 24ч.",
      charWarn: "Лимит символов превышен!",
      loginTitle: "Доступ к Нейросети",
      loginSub:
        "Войдите, чтобы получить персональный API ключ и доступ к терминалу.",
      loginBtn: "Вход через Google",
      docsTitle: "Интеграция по API",
      docsSub: "Подключите GOH AI к вашему коду или Telegram-боту.",
      support: "Гид и Поддержка",
      community: "Сообщество",
    },
    en: {
      appName: "GOH NEURAL",
      chat: "Terminal",
      dashboard: "Profile",
      docs: "Docs",
      usage: "Usage",
      ofLimit: "requests of 5",
      chars: "chars",
      placeholder: "Enter your prompt here...",
      genKey: "Generate New API Key",
      apiKey: "Your Key",
      copy: "Copy",
      copied: "Done!",
      logout: "Log Out",
      rules: "System Rules",
      limitWarn: "Limit reached. Resets in 24h.",
      charWarn: "Character limit exceeded!",
      loginTitle: "Neural Access",
      loginSub: "Sign in to get your dedicated API key and terminal access.",
      loginBtn: "Sign in with Google",
      docsTitle: "API Integration",
      docsSub: "Connect GOH AI to your code or Telegram bot.",
      support: "Guide & Support",
      community: "Community",
    },
  };

  const t = translations[lang];

  const codeSnippet = `import requests
API = "https://${typeof window !== "undefined" ? window.location.host : "goh-ai"}/api/chat"
HEADERS = {"X-API-Key": "${userData?.apiKey || "YOUR_KEY_HERE"}"}

response = requests.post(API, json={"prompt": "Hello AI!"}, headers=HEADERS)
print(response.json())`;

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col md:flex-row">
      {/* --- Sidebar (Desktop) / Header (Mobile) --- */}
      <aside className="w-full md:w-72 bg-[#050510]/60 backdrop-blur-3xl border-b md:border-b-0 md:border-r border-white/5 flex flex-col z-40">
        <div className="p-6 md:p-8 flex items-center justify-between md:flex-col md:items-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-mono font-black text-xl tracking-tighter text-white">
              {t.appName}
            </h1>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="text-xs font-bold uppercase py-1 px-2 border border-white/10 rounded"
            >
              {lang}
            </button>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-lg border border-white/5"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email || 'User'}&background=2563eb&color=fff`}
                    className="w-6 h-6 rounded-md"
                    alt=""
                  />
                  <MoreVertical className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-[#101018] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden shadow-blue-500/10 z-50 flex flex-col"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="text-xs font-bold text-white truncate">{user.displayName || (user.email ? user.email.split('@')[0] : 'User')}</div>
                        <div className="text-[9px] text-slate-500 font-mono truncate">{user.email || userData?.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setShowRules(true);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-500" />{" "}
                        {t.rules}
                      </button>
                      <a
                        href="https://t.me/GohNeural"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <Send className="w-4 h-4 text-blue-500" /> Telegram Channel
                      </a>
                      <a
                        href="https://t.me/GohNeuralBot"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-500" />{" "}
                        {t.support}
                      </a>
                      <div className="h-px bg-white/5 my-1" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> {t.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 hidden md:block">
          <div className="space-y-1">
            {[
              { id: "chat", label: t.chat, icon: MessageSquare },
              { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
              { id: "docs", label: t.docs, icon: TerminalIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8 px-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold mb-4">
              {t.rules}
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center justify-between w-full group py-2"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-amber-500 transition-colors">
                <ShieldAlert className="w-3.5 h-3.5" />
                {lang === "ru" ? "Системный Код" : "System Code"}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            </button>

            <div className="mt-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold mb-4">
                {t.community}
              </div>
              <a
                href="https://t.me/GohNeural"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between w-full group py-2"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-blue-500 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                  Telegram Channel
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              </a>
              <a
                href="https://t.me/GohNeuralBot"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between w-full group py-2"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-emerald-500 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.support}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              </a>
            </div>
          </div>
        </nav>

        {/* User Info / Profile Button */}
        <div className="p-4 border-t border-white/5 hidden md:block">
          {user ? (
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 relative group">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email || 'User'}&background=2563eb&color=fff`}
                className="w-9 h-9 rounded-xl border border-white/10"
                alt="avatar"
              />
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {user.displayName || (user.email ? user.email.split('@')[0] : 'User')}
                </div>
                <div className="text-[9px] text-slate-500 font-mono truncate mb-1">
                  {user.email || userData?.email}
                </div>
                <Badge
                  color={
                    isUnlimited
                      ? "green"
                      : userData?.dailyRequests >= 5
                        ? "red"
                        : "blue"
                  }
                >
                  {isUnlimited
                    ? "UNLIMITED"
                    : `${userData?.dailyRequests || 0}/5 LIMIT`}
                </Badge>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 hover:bg-white/10 rounded-lg"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-[#101018] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        setLang(lang === "ru" ? "en" : "ru");
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <Languages className="w-4 h-4" />{" "}
                      {lang === "ru" ? "English Version" : "Русская Версия"}
                    </button>
                    <button
                      onClick={() => {
                        setShowRules(true);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-500" />{" "}
                      {t.rules}
                    </button>
                    <a
                      href="https://t.me/GohNeural"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <Send className="w-4 h-4 text-blue-500" /> Telegram Channel
                    </a>
                    <a
                      href="https://t.me/GohNeuralBot"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-500" />{" "}
                      {t.support}
                    </a>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> {t.logout}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={login}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <User className="w-4 h-4" /> {t.loginBtn}
            </button>
          )}
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col relative z-0 overflow-hidden">
        {/* Mobile Tabs */}
        <div className="flex md:hidden bg-[#050510]/60 backdrop-blur-xl border-b border-white/5 px-2 py-1 sticky top-0 z-50">
          {["chat", "dashboard", "docs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest ${activeTab === tab ? "text-blue-500" : "text-slate-600"}`}
            >
              {translations[lang][tab as "chat" | "dashboard" | "docs"]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center"
              >
                <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-10 border border-blue-500/20">
                  <Activity className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                  {t.loginTitle}
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-lg">
                  {t.loginSub}
                </p>

                <div className="w-full max-w-sm space-y-4">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {authError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
                        {authError}
                      </div>
                    )}
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-[#101018] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <input
                      type="password"
                      required
                      placeholder={lang === "ru" ? "Пароль" : "Password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-[#101018] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <button
                      type="submit"
                      className="w-full px-6 py-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      <User className="w-4 h-4" /> 
                      {isSignUp ? (lang === "ru" ? "Зарегистрироваться" : "Sign Up") : (lang === "ru" ? "Войти по Email" : "Sign In with Email")}
                    </button>
                    <div className="text-sm text-slate-500 mb-4 cursor-pointer hover:text-white" onClick={() => setIsSignUp(!isSignUp)}>
                      {isSignUp ? (lang === "ru" ? "Уже есть аккаунт? Войти" : "Already have an account? Sign in") : (lang === "ru" ? "Нет аккаунта? Создать" : "Don't have an account? Sign up")}
                    </div>
                  </form>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-xs text-slate-600 uppercase font-bold tracking-widest px-2">OR</span>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>

                  <button
                    onClick={login}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t.loginBtn}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full max-w-5xl mx-auto flex flex-col"
              >
                {activeTab === "chat" && (
                  <div className="h-full flex flex-col bg-[#05050a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {/* Terminal Header */}
                    <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5 mr-4">
                          <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <Badge color="blue">NEURAL v1.0 BETA</Badge>
                        {isUnlimited && (
                           <Badge color="green">PRIORITY ACCESS</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className={`text-[10px] font-mono ${prompt.length > 5000 ? "text-rose-500" : "text-slate-500"}`}
                        >
                          {prompt.length} / 5000 {t.chars}
                        </div>
                        {isLoading && (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                      </div>
                    </div>

                    {/* Chat Messages / Terminal Body */}
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-8 space-y-6 font-mono text-sm"
                    >
                      {!response && !isLoading && (
                        <div className="flex items-start gap-4 text-slate-500">
                          <ChevronRight className="w-4 h-4 mt-1" />
                          <span className="animate-pulse">
                            {lang === "ru"
                              ? "Ожидание инструкций от оператора..."
                              : "Waiting for operator instructions..."}
                          </span>
                        </div>
                      )}

                      {response && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-start gap-4 text-blue-400">
                            <Badge color="blue">OUTPUT</Badge>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-slate-300 leading-relaxed whitespace-pre-wrap max-w-[90%] md:max-w-[80%]">
                            {response}
                          </div>
                          <div className="flex justify-end pr-4">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(response);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="text-[10px] uppercase font-bold text-slate-600 hover:text-white flex items-center gap-2 transition-all"
                            >
                              {copied ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copied ? t.copied : t.copy}
                            </button>
                          </div>
                        </div>
                      )}

                      {isLoading && (
                        <div className="flex items-center gap-4 text-blue-500/50">
                          <div className="w-2 h-4 bg-blue-500 animate-pulse" />
                          <span className="text-xs uppercase tracking-widest font-black">
                            {lang === "ru"
                              ? "Анализ нейронных связей..."
                              : "Analyzing neural pathways..."}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white/5 border-t border-white/5">
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                      >
                        <div className="relative">
                          <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t.placeholder}
                            className={`w-full bg-[#101018]/50 backdrop-blur-md border rounded-2xl p-6 text-white text-sm font-mono outline-none transition-all resize-none h-32 pr-20 ${
                              !isUnlimited && userData?.dailyRequests >= 5
                                ? "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                                : isUnlimited
                                  ? "border-emerald-500/20 focus:border-emerald-500/40 focus:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                                  : "border-white/10 focus:border-blue-500/40"
                            }`}
                            disabled={!isUnlimited && userData?.dailyRequests >= 5}
                          />
                          <button
                            type="submit"
                            disabled={
                              isLoading ||
                              !prompt.trim() ||
                              prompt.length > 5000 ||
                              (!isUnlimited && userData?.dailyRequests >= 5)
                            }
                            className={`absolute bottom-6 right-6 p-4 text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all ${
                              isUnlimited ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"
                            }`}
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>

                        {!isUnlimited && userData?.dailyRequests >= 5 && (
                          <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-2">
                            <AlertCircle className="w-3 h-3" /> {t.limitWarn}
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === "dashboard" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div
                      className={`md:col-span-2 border rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[340px] relative overflow-hidden group transition-all duration-500 ${
                        isUnlimited
                          ? "bg-emerald-950/10 border-emerald-500/20"
                          : userData?.dailyRequests >= 5
                            ? "bg-rose-950/20 border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.1)]"
                            : "bg-[#080812] border-white/5"
                      }`}
                    >
                      <div
                        className={`absolute -right-20 -top-20 w-64 h-64 blur-[100px] transition-all duration-700 ${
                           isUnlimited
                            ? "bg-emerald-600/10 animate-pulse"
                            : userData?.dailyRequests >= 5
                              ? "bg-rose-600/20 animate-pulse"
                              : "bg-blue-600/10"
                        }`}
                      />
                      <div className="relative">
                        <Badge
                          color={
                            isUnlimited
                              ? "green"
                              : userData?.dailyRequests >= 5
                                ? "red"
                                : "blue"
                          }
                        >
                          {isUnlimited
                            ? "Priority Access"
                            : userData?.dailyRequests >= 5
                              ? "Quota Exceeded"
                              : "Quota Management"}
                        </Badge>
                        <h3
                          className={`text-3xl font-black mt-4 mb-2 transition-colors ${isUnlimited ? "text-emerald-400" : userData?.dailyRequests >= 5 ? "text-rose-400" : "text-white"}`}
                        >
                          {t.usage}
                        </h3>
                        <p className={`text-sm max-w-xs ${isUnlimited ? "text-emerald-500/70" : "text-slate-500"}`}>
                          {isUnlimited
                            ? lang === "ru"
                              ? "У вас безлимитный доступ к нейросети."
                              : "You have unlimited access to the neural network."
                            : userData?.dailyRequests >= 5
                              ? lang === "ru"
                                ? "Лимит исчерпан. Доступ восстановится через 24 часа."
                                : "Limit reached. Access restored in 24h."
                              : lang === "ru"
                                ? "Лимиты обновляются каждые 24 часа."
                                : "Quotas reset every 24 hours."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end relative z-10">
                          <div
                            className={`text-5xl font-mono font-black ${isUnlimited ? "text-emerald-500" : userData?.dailyRequests >= 5 ? "text-rose-500" : "text-white"}`}
                          >
                            {isUnlimited ? "∞" : userData?.dailyRequests || 0}{" "}
                            {!isUnlimited && (
                              <span className="text-xl font-normal text-slate-600">
                                / 5
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs font-bold uppercase tracking-widest ${isUnlimited ? "text-emerald-500" : userData?.dailyRequests >= 5 ? "text-rose-500/50" : "text-slate-500"}`}
                          >
                            {isUnlimited
                              ? lang === "ru"
                                ? "БЕЗЛИМИТНЫЙ ДОСТУП"
                                : "UNLIMITED ACCESS"
                              : t.ofLimit}
                          </div>
                        </div>
                        <div
                          className={`h-4 rounded-full overflow-hidden border transition-all duration-500 relative z-10 ${isUnlimited ? "bg-emerald-950/40 border-emerald-500/20" : userData?.dailyRequests >= 5 ? "bg-rose-950/40 border-rose-500/20" : "bg-white/5 border-white/5"}`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: isUnlimited
                                ? "100%"
                                : `${Math.min((userData?.dailyRequests || 0) * 20, 100)}%`,
                            }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isUnlimited
                                ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                : userData?.dailyRequests >= 5
                                  ? "bg-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.6)]"
                                  : "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Key Management Card */}
                    <div className="bg-[#080812] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <Key className="w-12 h-12 text-slate-800 mb-6 group-hover:text-blue-500/50 transition-colors" />
                      <h3 className="text-xl font-bold mb-8">{t.apiKey}</h3>

                      {userData?.apiKey ? (
                        <div className="w-full space-y-4">
                          <div className="bg-[#020205] border border-white/10 p-4 rounded-2xl font-mono text-xs tracking-widest text-blue-400 select-all shadow-inner truncate">
                            {userData.apiKey}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(userData.apiKey);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              {copied ? t.copied : t.copy}
                            </button>
                            <button
                              onClick={generateKey}
                              disabled={isGeneratingKey}
                              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`w-4 h-4 text-slate-400 ${isGeneratingKey ? "animate-spin" : ""}`}
                              />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={generateKey}
                          disabled={isGeneratingKey}
                          className="w-full py-4 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative z-50 pointer-events-auto"
                        >
                          {isGeneratingKey ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            t.genKey
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "docs" && (
                  <div className="bg-[#080812] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-2xl">
                    <div className="w-full md:w-1/2 p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                      <Badge color="amber">API DOCUMENTATION</Badge>
                      <h2 className="text-4xl font-black text-white mt-6 mb-4 leading-tight">
                        {t.docsTitle}
                      </h2>
                      <p className="text-slate-500 text-lg leading-relaxed mb-10">
                        {t.docsSub}
                      </p>

                      <div className="space-y-6">
                        {[
                          { title: "Endpoint", value: "POST /api/chat" },
                          { title: "Headers", value: "X-API-Key: goh_..." },
                          { title: "Body", value: '{"prompt": "string"}' },
                        ].map((item) => (
                          <div
                            key={item.title}
                            className="flex items-center gap-6"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <div>
                              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                {item.title}
                              </div>
                              <div className="text-sm font-mono text-blue-400">
                                {item.value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full md:w-1/2 bg-black/40 p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            Example Integration
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(codeSnippet);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="text-blue-500 hover:text-blue-300"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex-1 bg-[#101018] rounded-2xl p-6 font-mono text-xs text-blue-300 leading-relaxed border border-white/5 shadow-inner overflow-auto whitespace-pre">
                        {codeSnippet}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Floating Hint */}
        {user && activeTab !== "dashboard" && (
          <div className="absolute top-10 right-10 hidden lg:flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 py-2 px-4 rounded-2xl">
            <div className="flex flex-col items-end">
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                {t.usage}
              </div>
              <div className="text-xs font-mono text-white font-bold">
                {userData?.dailyRequests || 0} / 5
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white/10 p-0.5">
              <div className="w-full h-full rounded-full bg-blue-600/20 flex items-center justify-center overflow-hidden">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: (userData?.dailyRequests || 0) / 5 }}
                  className={`w-full h-full origin-bottom ${userData?.dailyRequests >= 5 ? "bg-rose-600" : "bg-blue-600"}`}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rules Modal Overlays */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#101018] border border-white/10 rounded-[2.5rem] p-12 max-w-2xl w-full relative"
            >
              <button
                onClick={() => setShowRules(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
              <Badge color="blue">Secure Protocol</Badge>
              <h3 className="text-4xl font-black text-white mt-8 mb-4 tracking-tighter uppercase italic">
                GOH_SYSTEM_RULES
              </h3>
              <p className="text-slate-500 mb-10">
                {lang === "ru"
                  ? "Соблюдайте эти правила для бесперебойной работы."
                  : "Observe these protocols for optimal service stability."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Activity,
                    title: lang === "ru" ? "Квота" : "Quota",
                    desc:
                      lang === "ru"
                        ? "5 запросов в сутки. Лимит сбрасывается каждые 24 часа."
                        : "5 requests per day. Limit resets every 24 hours.",
                  },
                  {
                    icon: TerminalIcon,
                    title: lang === "ru" ? "Символы" : "Characters",
                    desc:
                      lang === "ru"
                        ? "Лимит 5,000 символов на одно сообщение."
                        : "Limit of 5,000 characters per single message.",
                  },
                  {
                    icon: ShieldAlert,
                    title: lang === "ru" ? "Безопасность" : "Security",
                    desc:
                      lang === "ru"
                        ? "Запрещен спам и автоматизация запросов."
                        : "Spam and request automation are strictly prohibited.",
                  },
                  {
                    icon: Key,
                    title: lang === "ru" ? "Доступ" : "Access",
                    desc:
                      lang === "ru"
                        ? "Никогда не передавайте ваш персональный API ключ."
                        : "Never share your dedicated API key with others.",
                    color: "amber",
                  },
                  {
                    icon: Info,
                    title: lang === "ru" ? "Политика" : "Policy",
                    desc:
                      lang === "ru"
                        ? "ИИ может ошибаться. Проверяйте важную информацию."
                        : "AI can be wrong. Always verify critical information.",
                  },
                ].map((rule) => (
                  <div
                    key={rule.title}
                    className="flex gap-4 items-start group relative"
                  >
                    <div className="absolute -inset-2 bg-blue-500/5 rounded-2xl scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all" />
                    <div className="relative p-3 bg-white/5 rounded-xl border border-white/10 text-blue-500 group-hover:border-blue-500/30 transition-colors">
                      <rule.icon className="w-5 h-5" />
                    </div>
                    <div className="relative">
                      <div className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                        {rule.title}
                      </div>
                      <div className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                        {rule.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
