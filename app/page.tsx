'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Terminal, Loader2, Copy, CheckCircle2, Bot, Languages, ShieldAlert, X } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'telegram'>('basic');
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [showRules, setShowRules] = useState(false);

  const t = {
    ru: {
      title: 'Нейронная мощь',
      subtitle: 'Мгновенный доступ к AI. Просто подключи и создавай.',
      testInterface: 'Тестовый интерфейс',
      basicReq: 'Запрос API',
      telegramBot: 'Telegram Бот',
      copy: 'Скопировать',
      copied: 'Скопировано',
      placeholder: 'Задай вопрос нейросети...',
      rulesTitle: 'Правила использования',
      rules: ['Не используйте API для спама и ботнетов.', 'Запрещено передавать персональные данные.', 'Beta-версия: возможны временные перерывы.'],
      langToggle: 'RU/EN'
    },
    en: {
      title: 'Neural Might',
      subtitle: 'Instant AI access. Just plug and play.',
      testInterface: 'Live Test Interface',
      basicReq: 'API Request',
      telegramBot: 'Telegram Bot',
      copy: 'Copy',
      copied: 'Copied',
      placeholder: 'Ask the AI anything...',
      rulesTitle: 'Usage Rules',
      rules: ['No spam or botnet usage.', 'Sensitive data is strictly prohibited.', 'Beta-version: temporary interruptions may occur.'],
      langToggle: 'EN/RU'
    }
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'qwen/qwen3.6-plus' }),
      });
      const data = await res.json();
      setResponse(data.error ? `Error: ${data.error}` : data.response || 'No response.');
    } catch (error: any) {
      setResponse(`Request Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const basicCode = `import requests
API_URL = "https://goh-api-ai-v5yn.vercel.app/api/chat"
def ask_ai(q):
    res = requests.post(API_URL, json={"prompt": q})
    return res.json().get("response")
print(ask_ai("Привет!"))`;

  const telegramCode = `import telebot, requests
bot = telebot.TeleBot("YOUR_TOKEN")
API = "https://goh-api-ai-v5yn.vercel.app/api/chat"
@bot.message_handler(func=lambda _: True)
def chat(m):
    a = requests.post(API, json={"prompt": m.text}).json().get("response")
    bot.reply_to(m, a)
bot.infinity_polling()`;

  const activeCode = activeTab === 'basic' ? basicCode : telegramCode;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-blue-50 font-sans selection:bg-blue-900 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-blue-900/30 blur-[200px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 w-full h-full rounded-full bg-indigo-900/20 blur-[200px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
        <header className="flex justify-between w-full mb-16 items-center">
          <div className="text-blue-400 font-mono text-xl font-bold">GOH_AI</div>
          <div className="flex gap-4">
            <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="p-2 rounded-full border border-blue-900/50 hover:bg-blue-900/30"><Languages className="w-5 h-5"/></button>
            <button onClick={() => setShowRules(true)} className="p-2 rounded-full border border-blue-900/50 hover:bg-blue-900/30"><ShieldAlert className="w-5 h-5"/></button>
          </div>
        </header>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white text-center">
          {t.title}
        </h1>
        <p className="text-xl text-blue-200/60 text-center mb-16">{t.subtitle}</p>

        {/* Rules Modal */}
        <AnimatePresence>
            {showRules && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-black border border-blue-900 p-8 rounded-2xl max-w-md w-full relative">
                        <button onClick={() => setShowRules(false)} className="absolute top-4 right-4"><X/></button>
                        <h2 className="text-2xl font-bold text-blue-400 mb-6">{t.rulesTitle}</h2>
                        <ul className="space-y-4">
                            {t.rules.map((rule, i) => <li key={i} className="flex gap-3 text-blue-100/70"><span>{i+1}.</span> {rule}</li>)}
                        </ul>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Editor */}
            <div className="bg-gray-950/50 border border-blue-900/50 rounded-2xl p-6 h-full flex flex-col">
                <div className="flex gap-2 mb-4">
                   <button onClick={() => setActiveTab('basic')} className={`px-4 py-2 rounded-lg ${activeTab === 'basic' ? 'bg-blue-600' : 'bg-gray-800'}`}>{t.basicReq}</button>
                   <button onClick={() => setActiveTab('telegram')} className={`px-4 py-2 rounded-lg ${activeTab === 'telegram' ? 'bg-blue-600' : 'bg-gray-800'}`}>{t.telegramBot}</button>
                </div>
                <pre className="bg-black p-4 rounded-lg flex-1 overflow-auto text-blue-300 font-mono text-sm">{activeCode}</pre>
                <button onClick={copyToClipboard} className="mt-4 flex gap-2 justify-center py-2 bg-blue-900/30 rounded-lg hover:bg-blue-900/50">
                    {copied ? <CheckCircle2 /> : <Copy />} {copied ? t.copied : t.copy}
                </button>
            </div>
            
            {/* Tester */}
            <div className="bg-gray-950/50 border border-blue-900/50 rounded-2xl p-6 flex flex-col h-[500px]">
                <h3 className="text-blue-400 mb-4">{t.testInterface}</h3>
                <div className="flex-1 overflow-y-auto mb-4 p-4 bg-black rounded-lg text-blue-100">{response}</div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.placeholder} className="flex-1 bg-gray-900 p-2 rounded-lg text-white" />
                    <button type="submit" disabled={isLoading} className="p-2 bg-blue-600 rounded-lg">{isLoading ? <Loader2 className="animate-spin"/> : <Send />}</button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}

