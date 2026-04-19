'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Terminal, Loader2, Copy, CheckCircle2, Bot } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'telegram'>('basic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse('');
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          model: 'qwen/qwen3.6-plus' 
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setResponse(`Error: ${data.error}`);
      } else {
        setResponse(data.response || 'No response returned.');
      }
    } catch (error: any) {
      setResponse(`Request Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const basicCode = `import requests

# Goh API AI - Keyless Puter.js Wrapper
API_URL = "https://goh-api-ai-v5yn.vercel.app/api/chat"

def get_ai_response(prompt: str, model="qwen/qwen3.6-plus"):
    payload = {
        "prompt": prompt,
        "model": model
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        return response.json().get("response", "No response in payload")
    except Exception as e:
        return f"API Error: {e}"

if __name__ == "__main__":
    reply = get_ai_response("Tell me a fun trivia fact about space.")
    print("AI says:", reply)
`;

  const telegramCode = `import telebot
import requests

# 1. Install pyTelegramBotAPI and requests:
#    pip install pyTelegramBotAPI requests

TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
API_URL = "https://goh-api-ai-v5yn.vercel.app/api/chat"

bot = telebot.TeleBot(TELEGRAM_BOT_TOKEN)

def get_ai_response(prompt: str):
    try:
        res = requests.post(API_URL, json={"prompt": prompt})
        res.raise_for_status()
        return res.json().get("response", "No response")
    except Exception as e:
        return f"API Error: {e}"

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    bot.reply_to(message, "Думаю... 🤔")
    reply = get_ai_response(message.text)
    bot.reply_to(message, reply)

if __name__ == "__main__":
    print("AI Telegram Bot is running...")
    bot.infinity_polling()
`;

  const activeCode = activeTab === 'basic' ? basicCode : telegramCode;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-blue-50 font-sans selection:bg-blue-900 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-800/10 blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center space-x-3 mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/30 text-blue-400 text-sm font-mono tracking-wider uppercase backdrop-blur-sm shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>GOH API AI v1.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-white drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
            Keyless Intelligence.
          </h1>
          <p className="text-lg text-blue-200/60 max-w-2xl mx-auto">
            A beautiful blue & black playground powered by Puter. 
            Build chatbots, automate tasks, or integrate AI into any app using our simple REST endpoint.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          
          {/* Left Panel: Python Setup */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col bg-[#050A15] border border-blue-900/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(30,58,138,0.2)] h-full"
          >
            <div className="flex items-center justify-between px-3 py-3 border-b border-blue-900/50 bg-blue-950/20">
              <div className="flex overflow-hidden rounded-lg bg-blue-950/30 border border-blue-900/50 p-1">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${activeTab === 'basic' ? 'bg-blue-600/30 text-blue-300' : 'text-blue-500 hover:text-blue-400'}`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Basic Request</span>
                </button>
                <button
                  onClick={() => setActiveTab('telegram')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${activeTab === 'telegram' ? 'bg-blue-600/30 text-blue-300' : 'text-blue-500 hover:text-blue-400'}`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Telegram Bot</span>
                </button>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center space-x-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-md ml-2"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-5 overflow-x-auto bg-[#020510] text-sm leading-relaxed flex-1">
              <pre className="font-mono text-blue-300">
                <code>{activeCode}</code>
              </pre>
            </div>
            <div className="px-5 py-4 mt-auto border-t border-blue-900/50 bg-[#020510]">
              <p className="text-sm text-blue-400/80">
                <span className="text-blue-400 font-bold">1.</span> Replace <code className="font-mono bg-blue-900/30 px-1 py-0.5 rounded">&lt;your-domain&gt;</code> with this app's URL.
                <br/><span className="text-blue-400 font-bold">2.</span> {activeTab === 'telegram' ? 'Install pyTelegramBotAPI and requests.' : 'Install requests library.'}
                <br/><span className="text-blue-400 font-bold">3.</span> Run the script to start testing!
              </p>
            </div>
          </motion.div>

          {/* Right Panel: Live Tester */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col bg-[#050A15] border border-blue-900/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(30,58,138,0.2)] h-full min-h-[500px]"
          >
            <div className="px-5 py-4 border-b border-blue-900/50 bg-blue-950/20">
              <h2 className="text-blue-400 font-mono text-sm tracking-wide uppercase">Live Testing Interface</h2>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto min-h-[250px] scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
              {response ? (
                <div className="prose prose-invert prose-blue max-w-none">
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-blue-500/70 font-mono uppercase tracking-wider">AI Response</div>
                    <div className="text-blue-100/90 whitespace-pre-wrap leading-relaxed">
                      {response}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-blue-500/30 font-mono text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
                    <Send className="w-6 h-6" />
                  </div>
                  <p>Send a message to test the GOH API.<br/>Model: qwen/qwen3.6-plus</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-blue-900/50 bg-[#020510]">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell me a fun trivia fact about space..."
                  disabled={isLoading}
                  className="w-full bg-[#0A1020] border border-blue-800/50 rounded-xl px-5 py-4 pr-14 text-white placeholder-blue-600/50 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/70 transition-all font-mono text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:shadow-none"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
