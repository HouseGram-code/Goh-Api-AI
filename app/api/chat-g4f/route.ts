import { NextResponse } from 'next/server';

// G4F (GPT4Free) API - completely free, no API key required
// Uses community-driven providers to access AI models for free
// Documentation: https://g4f.dev/docs

// Free endpoints (no API key required)
const G4F_ENDPOINTS: Record<string, string> = {
  AUTO: 'https://g4f.space/api/auto',
  GROQ: 'https://g4f.space/api/groq',
  POLLINATIONS: 'https://g4f.space/api/pollinations',
  NVIDIA: 'https://g4f.space/api/nvidia',
  GEMINI: 'https://g4f.space/api/gemini',
  GROK: 'https://g4f.space/api/grok',
  DEEPSEEK: 'https://g4f.space/api/deepseek',
  QWEN: 'https://g4f.space/api/qwen',
  MISTRAL: 'https://g4f.space/api/mistral',
};

// Available models via G4F
const MODELS: Record<string, string> = {
  // Auto - automatically selects best available model
  AUTO: 'auto',
  // Groq models (fast, free)
  LLAMA_3_1_70B: 'llama-3.1-70b-versatile',
  LLAMA_3_1_8B: 'llama-3.1-8b-instant',
  MIXTRAL_8X7B: 'mixtral-8x7b-32768',
  LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
  // OpenAI models
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  // Claude via pollinations
  CLAUDE_3_OPUS: 'claude-3-opus',
  CLAUDE_3_SONNET: 'claude-3-sonnet',
  CLAUDE_3_5_SONNET: 'claude-3.5-sonnet',
  // Google
  GEMINI_PRO: 'gemini-pro',
  GEMINI_FLASH: 'gemini-flash',
  GEMINI_2_FLASH: 'gemini-2.0-flash-exp',
  // DeepSeek
  DEEPSEEK_CHAT: 'deepseek-chat',
  DEEPSEEK_R1: 'deepseek-reasoner',
  // Grok
  GROK_4: 'grok-4-fast-non-reasoning',
  GROK_3: 'grok-3-fast',
  // Qwen
  QWEN_2_5: 'qwen-2.5-72b-instruct',
  // Mistral
  MISTRAL: 'mistral-small-3.1',
};

export async function POST(req: Request) {
  try {
    const { prompt, model = MODELS.AUTO, provider = 'auto' } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Select endpoint based on provider
    let endpoint = G4F_ENDPOINTS.AUTO;
    
    if (provider && provider !== 'auto' && G4F_ENDPOINTS[provider.toUpperCase()]) {
      endpoint = G4F_ENDPOINTS[provider.toUpperCase()];
    }

    // Try the selected provider first
    let result = await tryEndpoint(endpoint, model, prompt);
    
    // If failed, try fallback providers
    let selectedProvider = provider;
    if (!result.success) {
      const fallbacks = ['GROQ', 'POLLINATIONS', 'DEEPSEEK', 'QWEN', 'MISTRAL', 'GROK', 'NVIDIA'];
      for (const fallback of fallbacks) {
        if (G4F_ENDPOINTS[fallback] !== endpoint) {
          result = await tryEndpoint(G4F_ENDPOINTS[fallback], model, prompt);
          if (result.success) {
            selectedProvider = fallback.toLowerCase();
            break;
          }
        }
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'All providers failed'
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      response: result.response,
      model: result.model || model,
      provider: selectedProvider
    });
  } catch (error) {
    console.error('G4F Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function tryEndpoint(
  endpoint: string, 
  model: string, 
  prompt: string
): Promise<{ success: boolean; response?: string; error?: string; model?: string }> {
  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      })
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || data.content;
    
    if (responseText) {
      return { success: true, response: responseText, model: data.model };
    }
    
    return { success: false, error: 'No response content' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'G4F (GPT4Free)',
    description: 'Free AI API without API key - community driven',
    endpoints: Object.keys(G4F_ENDPOINTS),
    models: Object.values(MODELS),
    docs: 'https://g4f.dev/docs'
  });
}