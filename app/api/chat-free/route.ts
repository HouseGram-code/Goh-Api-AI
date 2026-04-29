import { NextResponse } from 'next/server';

// Universal Free AI API - Multiple providers, no key required
// Works in 2026 - uses community-driven free endpoints

// ============ FREE PROVIDERS (NO KEY REQUIRED) ============

const PROVIDERS = {
  // G4F Community - Multiple free endpoints (most reliable)
  G4F_AUTO: 'https://g4f.space/api/auto/chat/completions',
  G4F_GROQ: 'https://g4f.space/api/groq/chat/completions',
  G4F_POLLINATIONS: 'https://g4f.space/api/pollinations/chat/completions',
  G4F_NVIDIA: 'https://g4f.space/api/nvidia/chat/completions',
  G4F_GEMINI: 'https://g4f.space/api/gemini/chat/completions',
  G4F_GROK: 'https://g4f.space/api/grok/chat/completions',
  
  // Pollinations AI - Direct free endpoint (very reliable)
  POLLINATIONS_AI: 'https://text.pollinations.ai/',
  
  // DeepSeek via OpenRouter (free tier - needs fake key for auth)
  DEEPSEEK_OPENROUTER: 'https://openrouter.ai/api/v1/chat/completions',
  
  // Other free endpoints
  LLAMAFILE: 'https://llamafile.ai/api/chat',
  
  // Additional working free endpoints 2026
  G4F_DEEPSEEK: 'https://g4f.space/api/deepseek/chat/completions',
  G4F_QWEN: 'https://g4f.space/api/qwen/chat/completions',
  G4F_MISTRAL: 'https://g4f.space/api/mistral/chat/completions',
} as const;

// Models for each provider
const MODELS = {
  // Auto-select best
  AUTO: 'auto',
  
  // Groq (very fast, free)
  LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
  LLAMA_3_1_70B: 'llama-3.1-70b-versatile',
  LLAMA_3_1_8B: 'llama-3.1-8b-instant',
  MIXTRAL: 'mixtral-8x7b-32768',
  
  // OpenAI (via g4f)
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  
  // Claude (via g4f)
  CLAUDE_3_5_SONNET: 'claude-3.5-sonnet',
  CLAUDE_3_HAIKU: 'claude-3-haiku',
  
  // Google
  GEMINI_2_FLASH: 'gemini-2.0-flash-exp',
  GEMINI_PRO: 'gemini-pro',
  
  // DeepSeek
  DEEPSEEK_V3: 'deepseek-chat',
  DEEPSEEK_R1: 'deepseek-reasoner',
  
  // Grok
  GROK_4: 'grok-4-fast-non-reasoning',
  GROK_3: 'grok-3-fast',
  
  // Qwen
  QWEN_2_5: 'qwen-2.5-72b-instruct',
  
  // Mistral
  MISTRAL: 'mistral-small-3.1',
} as const;

interface RequestBody {
  prompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
}

async function tryProvider(
  url: string, 
  model: string, 
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 4096
): Promise<{ success: boolean; response?: string; error?: string; provider?: string }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    
    // OpenAI format
    if (data.choices?.[0]?.message?.content) {
      return { 
        success: true, 
        response: data.choices[0].message.content,
        provider: url 
      };
    }
    
    // Pollinations format
    if (data.text || data.content) {
      return { 
        success: true, 
        response: data.text || data.content,
        provider: url 
      };
    }
    
    // Direct text response
    if (typeof data === 'string') {
      return { success: true, response: data, provider: url };
    }

    return { success: false, error: 'Unknown response format' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function tryPollinationsAI(prompt: string): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const url = new URL('https://text.pollinations.ai/');
    url.searchParams.set('prompt', prompt);
    url.searchParams.set('model', 'openai');
    url.searchParams.set('json', 'false');

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const text = await response.text();
    return { success: true, response: text };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, model = MODELS.AUTO, provider, temperature = 0.7, max_tokens = 4096 } = await req.json() as RequestBody;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // If specific provider requested
    if (provider && PROVIDERS[provider as keyof typeof PROVIDERS]) {
      const url = PROVIDERS[provider as keyof typeof PROVIDERS];
      const result = await tryProvider(url, model, prompt, temperature, max_tokens);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          response: result.response,
          model,
          provider
        });
      }
      
      return NextResponse.json({
        success: false,
        error: result.error || 'Provider failed'
      }, { status: 502 });
    }

    // Try multiple providers in order (fallback strategy)
    const providersToTry = [
      { name: 'pollinations', url: PROVIDERS.POLLINATIONS_AI },
      { name: 'g4f_auto', url: PROVIDERS.G4F_AUTO },
      { name: 'g4f_groq', url: PROVIDERS.G4F_GROQ },
      { name: 'g4f_deepseek', url: PROVIDERS.G4F_DEEPSEEK },
      { name: 'g4f_qwen', url: PROVIDERS.G4F_QWEN },
      { name: 'g4f_mistral', url: PROVIDERS.G4F_MISTRAL },
      { name: 'g4f_pollinations', url: PROVIDERS.G4F_POLLINATIONS },
      { name: 'g4f_nvidia', url: PROVIDERS.G4F_NVIDIA },
      { name: 'g4f_grok', url: PROVIDERS.G4F_GROK },
    ];

    let lastError = 'All providers failed';

    for (const p of providersToTry) {
      const result = await tryProvider(p.url, model, prompt, temperature, max_tokens);
      
      if (result.success && result.response) {
        return NextResponse.json({
          success: true,
          response: result.response,
          model,
          provider: p.name
        });
      }
      
      lastError = result.error || 'Unknown error';
    }

    // Try Pollinations AI as last resort
    const pollinationsResult = await tryPollinationsAI(prompt);
    if (pollinationsResult.success) {
      return NextResponse.json({
        success: true,
        response: pollinationsResult.response,
        model: 'openai',
        provider: 'pollinations_ai'
      });
    }

    return NextResponse.json({
      success: false,
      error: lastError
    }, { status: 503 });

  } catch (error: any) {
    console.error('Free API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Free AI API - No Key Required',
    year: '2026',
    providers: Object.keys(PROVIDERS),
    models: Object.values(MODELS),
    usage: 'POST with { prompt, model?, provider? }',
    examples: {
      simple: { prompt: 'Hello!' },
      withModel: { prompt: 'Hello!', model: 'llama-3.3-70b-versatile' },
      withProvider: { prompt: 'Hello!', provider: 'g4f_groq' }
    }
  });
}