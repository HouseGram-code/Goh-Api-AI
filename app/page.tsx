'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Loader2, Copy, CheckCircle2, Languages, ShieldAlert, X, 
  User, Key, Activity, RefreshCw, MoreVertical, LogOut, ExternalLink,
  MessageSquare, Settings, LayoutDashboard, Terminal as TerminalIcon,
  ChevronRight, AlertCircle, Info, ChevronDown
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// --- Components ---

const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'docs'>('chat');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              dailyRequests: 0,
              lastReset: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error("Auth init error", e);
        }

        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
        return () => unsubDoc();
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert(lang === 'ru' ? "Окно заблокировано." : "Popup blocked.");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  const generateKey = async () => {
    if (!user) return;
    const newKey = 'goh_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await setDoc(doc(db, 'users', user.uid), { apiKey: newKey }, { merge: true });
    await setDoc(doc(db, 'apiKeys', newKey), { uid: user.uid });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !user || prompt.length > 5000 || (userData?.dailyRequests >= 5)) return;
    setIsLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}` 
        },
        body: JSON.stringify({ prompt, model: 'qwen/qwen3.6-plus' }),
      });
      const data = await res.json();
      setResponse(data.error ? `Error: ${data.error}` : data.response || 'No response.');
    } catch (error: any) {
      setResponse(`System Failure: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    ru: {
      appName: 'GOH NEURAL',
      test: 'Терминал',
      dash: 'Профиль',
      docs: 'Доки',
      usage: 'Использование',
      ofLimit: 'запросов из 5',
      chars: 'символов',
      placeholder: 'Введите ваш запрос здесь...',
      genKey: 'Создать новый API Ключ',
      apiKey: 'Ваш ключ',
      copy: 'Копировать',
      copied: 'Готово!',
      logout: 'Выйти из системы',
      rules: 'Правила системы',
      limitWarn: 'Лимит исчерпан. Сброс через 24ч.',
      charWarn: 'Лимит символов превышен!',
      loginTitle: 'Доступ к Нейросети',
      loginSub: 'Войдите, чтобы получить персональный API ключ и доступ к терминалу.',
      loginBtn: 'Вход через Google',
      docsTitle: 'Интеграция по API',
      docsSub: 'Подключите GOH AI к вашему коду или Telegram-боту.',
    },
    en: {
      appName: 'GOH NEURAL',
      test: 'Terminal',
      dash: 'Profile',
      docs: 'Docs',
      usage: 'Usage',
      ofLimit: 'requests of 5',
      chars: 'chars',
      placeholder: 'Enter your prompt here...',
      genKey: 'Generate New API Key',
      apiKey: 'Your Key',
      copy: 'Copy',
      copied: 'Done!',
      logout: 'Log Out',
      rules: 'System Rules',
      limitWarn: 'Limit reached. Resets in 24h.',
      charWarn: 'Character limit exceeded!',
      loginTitle: 'Neural Access',
      loginSub: 'Sign in to get your dedicated API key and terminal access.',
      loginBtn: 'Sign in with Google',
      docsTitle: 'API Integration',
      docsSub: 'Connect GOH AI to your code or Telegram bot.',
    }
  };

  const t = translations[lang];

  const codeSnippet = `import requests
API = "https://${typeof window !== 'undefined' ? window.location.host : 'goh-ai'}/api/chat"
HEADERS = {"X-API-Key": "${userData?.apiKey || 'YOUR_KEY_HERE'}"}

response = requests.post(API, json={"prompt": "Hello AI!"}, headers=HEADERS)
print(response.json())`;

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col md:flex-row">
      {/* --- Sidebar (Desktop) / Header (Mobile) --- */}
      <aside className="w-full md:w-72 bg-[#050510] border-b md:border-b-0 md:border-r border-white/5 flex flex-col z-40">
        <div className="p-6 md:p-8 flex items-center justify-between md:flex-col md:items-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-mono font-black text-xl tracking-tighter text-white">{t.appName}</h1>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
             <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="text-xs font-bold uppercase py-1 px-2 border border-white/10 rounded">{lang}</button>
             {user && (
               <div className="relative">
                 <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-lg border border-white/5">
                   <img src={user.photoURL} className="w-6 h-6 rounded-md" alt="" />
                   <MoreVertical className="w-4 h-4" />
                 </button>
                 
                 <AnimatePresence>
                   {menuOpen && (
                     <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 10}} className="absolute top-full right-0 mt-2 w-48 bg-[#101018] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden shadow-blue-500/10">
                       <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-all">
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
               { id: 'chat', label: t.test, icon: MessageSquare },
               { id: 'dashboard', label: t.dash, icon: LayoutDashboard },
               { id: 'docs', label: t.docs, icon: TerminalIcon },
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
             ))}
           </div>

           <div className="mt-8 px-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold mb-4">{t.rules}</div>
              <button onClick={() => setShowRules(true)} className="flex items-center justify-between w-full group py-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-amber-500 transition-colors">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Системный Код' : 'System Code'}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              </button>
           </div>
        </nav>

        {/* User Info / Profile Button */}
        <div className="p-4 border-t border-white/5 hidden md:block">
          {user ? (
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 relative group">
              <img src={user.photoURL} className="w-9 h-9 rounded-xl border border-white/10" alt="avatar" />
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user.displayName}</div>
                <Badge color={userData?.dailyRequests >= 5 ? "red" : "blue"}>
                  {userData?.dailyRequests || 0}/5 LIMIT
                </Badge>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 hover:bg-white/10 rounded-lg"><MoreVertical className="w-4 h-4"/></button>
              </div>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 10}} className="absolute bottom-full left-0 w-full mb-2 bg-[#101018] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden">
                    <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                      <Languages className="w-4 h-4" /> {lang === 'ru' ? 'English Version' : 'Русская Версия'}
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-all">
                      <LogOut className="w-4 h-4" /> {t.logout}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={login} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
              <User className="w-4 h-4" /> {t.loginBtn}
            </button>
          )}
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col relative z-0 overflow-hidden">
        {/* Mobile Tabs */}
        <div className="flex md:hidden bg-[#050510] border-b border-white/5 px-2 py-1 sticky top-0">
          {['chat', 'dashboard', 'docs'].map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest ${activeTab === tab ? 'text-blue-500' : 'text-slate-600'}`}
             >
                {translations[lang][tab as 'chat' | 'dashboard' | 'docs']}
             </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
            {!user ? (
               <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-10 border border-blue-500/20">
                    <Activity className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.loginTitle}</h2>
                  <p className="text-slate-500 mb-10 leading-relaxed text-lg">{t.loginSub}</p>
                  <button onClick={login} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center gap-4 hover:scale-105 transition-all">
                    <User className="w-6 h-6" /> {t.loginBtn}
                  </button>
               </motion.div>
            ) : (
              <motion.div key={activeTab} initial={{opacity:0, x: 20}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -20}} className="h-full max-w-5xl mx-auto flex flex-col">
                {activeTab === 'chat' && (
                  <div className="h-full flex flex-col bg-[#080812] border border-white/5 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                     {/* Terminal Header */}
                     <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                           <div className="flex gap-1.5 mr-4">
                              <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                           </div>
                           <Badge color="blue">NEURAL ENGINE v3.6</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className={`text-[10px] font-mono ${prompt.length > 5000 ? 'text-rose-500' : 'text-slate-500'}`}>
                             {prompt.length} / 5000 {t.chars}
                           </div>
                           {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                        </div>
                     </div>

                     {/* Chat Messages / Terminal Body */}
                     <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 font-mono text-sm">
                        {!response && !isLoading && (
                          <div className="flex items-start gap-4 text-slate-500">
                             <ChevronRight className="w-4 h-4 mt-1" />
                             <span className="animate-pulse">{lang === 'ru' ? 'Ожидание инструкций от оператора...' : 'Waiting for operator instructions...'}</span>
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
                                <button onClick={() => { navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[10px] uppercase font-bold text-slate-600 hover:text-white flex items-center gap-2 transition-all">
                                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  {copied ? t.copied : t.copy}
                                </button>
                             </div>
                          </div>
                        )}

                        {isLoading && (
                          <div className="flex items-center gap-4 text-blue-500/50">
                             <div className="w-2 h-4 bg-blue-500 animate-pulse" />
                             <span className="text-xs uppercase tracking-widest font-black">{lang === 'ru' ? 'Анализ нейронных связей...' : 'Analyzing neural pathways...'}</span>
                          </div>
                        )}
                     </div>

                     {/* Input Area */}
                     <div className="p-6 bg-white/5 border-t border-white/5">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                           <div className="relative">
                              <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t.placeholder}
                                className="w-full bg-[#101018] border border-white/10 rounded-2xl p-6 text-white text-sm font-mono outline-none focus:border-blue-500/40 transition-all resize-none h-32 pr-20"
                                disabled={userData?.dailyRequests >= 5}
                              />
                              <button 
                                type="submit" 
                                disabled={isLoading || !prompt.trim() || prompt.length > 5000 || userData?.dailyRequests >= 5}
                                className="absolute bottom-6 right-6 p-4 bg-blue-600 text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                           </div>
                           
                           {userData?.dailyRequests >= 5 && (
                             <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-2">
                               <AlertCircle className="w-3 h-3" /> {t.limitWarn}
                             </div>
                           )}
                           {prompt.length > 5000 && (
                             <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-widest pl-2">
                               <AlertCircle className="w-3 h-3" /> {t.charWarn}
                             </div>
                           )}
                        </form>
                     </div>
                  </div>
                )}

                {activeTab === 'dashboard' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div className="md:col-span-2 bg-[#080812] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[340px] relative overflow-hidden group">
                       <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 blur-[100px] group-hover:bg-blue-600/20 transition-all" />
                       <div className="relative">
                          <Badge color="blue">Quota Management</Badge>
                          <h3 className="text-3xl font-black text-white mt-4 mb-2">{t.usage}</h3>
                          <p className="text-slate-500 text-sm max-w-xs">{lang === 'ru' ? 'Ваши суточные лимиты обновляются каждые 24 часа.' : 'Your daily usage quotas reset every 24 hours.'}</p>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <div className="text-4xl font-mono font-black text-white">
                                {userData?.dailyRequests || 0} <span className="text-sm font-normal text-slate-600">/ 5</span>
                             </div>
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.ofLimit}</div>
                          </div>
                          <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                             <motion.div 
                               initial={{width: 0}} 
                               animate={{width: `${(userData?.dailyRequests || 0) * 20}%`}} 
                               className={`h-full rounded-full ${userData?.dailyRequests >= 5 ? 'bg-rose-500' : 'bg-blue-600'} shadow-[0_0_20px_rgba(37,99,235,0.4)]`} 
                             />
                          </div>
                       </div>
                    </div>

                    {/* Key Management Card */}
                    <div className="bg-[#080812] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center justify-center relative overflow-hidden group">
                       <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <Key className="w-12 h-12 text-slate-800 mb-6 group-hover:text-blue-500/50 transition-colors" />
                       <h3 className="text-xl font-bold mb-8">{t.apiKey}</h3>
                       
                       {userData?.apiKey ? (
                         <div className="w-full space-y-4">
                           <div className="bg-[#020205] border border-white/10 p-4 rounded-2xl font-mono text-xs tracking-widest text-blue-400 select-all shadow-inner truncate">
                             {userData.apiKey}
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => { navigator.clipboard.writeText(userData.apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                               {copied ? t.copied : t.copy}
                             </button>
                             <button onClick={generateKey} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                               <RefreshCw className="w-4 h-4 text-slate-400" />
                             </button>
                           </div>
                         </div>
                       ) : (
                         <button onClick={generateKey} className="w-full py-4 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                           {t.genKey}
                         </button>
                       )}
                    </div>
                  </div>
                )}

                {activeTab === 'docs' && (
                  <div className="bg-[#080812] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-2xl">
                     <div className="w-full md:w-1/2 p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                        <Badge color="amber">API DOCUMENTATION</Badge>
                        <h2 className="text-4xl font-black text-white mt-6 mb-4 leading-tight">{t.docsTitle}</h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-10">{t.docsSub}</p>
                        
                        <div className="space-y-6">
                           {[
                             { title: 'Endpoint', value: 'POST /api/chat' },
                             { title: 'Headers', value: 'X-API-Key: goh_...' },
                             { title: 'Body', value: '{"prompt": "string"}' },
                           ].map((item) => (
                             <div key={item.title} className="flex items-center gap-6">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                               <div>
                                 <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.title}</div>
                                 <div className="text-sm font-mono text-blue-400">{item.value}</div>
                               </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="w-full md:w-1/2 bg-black/40 p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Example Integration</span>
                           </div>
                           <button onClick={() => { navigator.clipboard.writeText(codeSnippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-blue-500 hover:text-blue-300">
                             {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
        {user && activeTab !== 'dashboard' && (
          <div className="absolute top-10 right-10 hidden lg:flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 py-2 px-4 rounded-2xl">
             <div className="flex flex-col items-end">
                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{t.usage}</div>
                <div className="text-xs font-mono text-white font-bold">{userData?.dailyRequests || 0} / 5</div>
             </div>
             <div className="w-10 h-10 rounded-full border-2 border-white/10 p-0.5">
                <div className="w-full h-full rounded-full bg-blue-600/20 flex items-center justify-center overflow-hidden">
                   <motion.div 
                     initial={{scaleY: 0}} 
                     animate={{scaleY: (userData?.dailyRequests || 0) / 5}} 
                     className={`w-full h-full origin-bottom ${userData?.dailyRequests >= 5 ? 'bg-rose-600' : 'bg-blue-600'}`} 
                   />
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Rules Modal Overlays */}
      <AnimatePresence>
        {showRules && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
             <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} className="bg-[#101018] border border-white/10 rounded-[2.5rem] p-12 max-w-2xl w-full relative">
                <button onClick={() => setShowRules(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X className="w-8 h-8"/></button>
                <Badge color="blue">Secure Protocol</Badge>
                <h3 className="text-4xl font-black text-white mt-8 mb-4 tracking-tighter uppercase italic">GOH_SYSTEM_RULES</h3>
                <p className="text-slate-500 mb-10">{lang === 'ru' ? 'Соблюдайте эти правила для бесперебойной работы.' : 'Observe these protocols for optimal service stability.'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { icon: Activity, title: 'Quota', desc: lang === 'ru' ? '5 запросов в сутки.' : '5 requests per day.' },
                     { icon: TerminalIcon, title: 'Characters', desc: lang === 'ru' ? '5,000 символов на запрос.' : '5,000 chars per prompt.' },
                     { icon: ShieldAlert, title: 'Security', desc: lang === 'ru' ? 'Запрещен спам и боты.' : 'Spam & hostile use prohibited.' },
                     { icon: Key, title: 'API Key', desc: lang === 'ru' ? 'Не передавайте свой ключ.' : 'Never share your API key.' },
                   ].map((rule) => (
                      <div key={rule.title} className="flex gap-4 items-start">
                         <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-blue-500">
                           <rule.icon className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-300">{rule.title}</div>
                            <div className="text-sm text-slate-500 mt-1">{rule.desc}</div>
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
