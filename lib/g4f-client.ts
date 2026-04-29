/**
 * G4F (GPT4Free) Client - Free AI API
 * 
 * Completely free, no API key required
 * Uses community-driven providers
 * 
 * Documentation: https://g4f.dev/docs
 * Website: https://g4f.space
 */

// Free endpoints (no API key required)
const G4F_ENDPOINTS = {
  AUTO: 'https://g4f.space/api/auto',
  GROQ: 'https://g4f.space/api/groq',
  POLLINATIONS: 'https://g4f.space/api/pollinations',
  NVIDIA: 'https://g4f.space/api/nvidia',
  GEMINI: 'https://g4f.space/api/gemini',
  GROK: 'https://g4f.space/api/grok',
} as const;

// Available models
export const G4F_MODELS = {
  AUTO: 'auto',
  // Groq (very fast, free)
  LLAMA_3_1_70B: 'llama-3.1-70b-versatile',
  LLAMA_3_1_8B: 'llama-3.1-8b-instant',
  MIXTRAL_8X7B: 'mixtral-8x7b-32768',
  // OpenAI
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  // Claude
  CLAUDE_3_OPUS: 'claude-3-opus',
  CLAUDE_3_SONNET: 'claude-3-sonnet',
  // Google
  GEMINI_PRO: 'gemini-pro',
  GEMINI_FLASH: 'gemini-flash',
  // DeepSeek
  DEEPSEEK_CHAT: 'deepseek-chat',
  // Grok
  GROK_4: 'grok-4-fast-non-reasoning',
} as const;

export type G4FModel = typeof G4F_MODELS[keyof typeof G4F_MODELS];
export type G4FProvider = 'auto' | 'groq' | 'pollinations' | 'nvidia' | 'gemini' | 'grok';

export interface G4FChatOptions {
  model?: G4FModel;
  provider?: G4FProvider;
  temperature?: number;
  max_tokens?: number;
}

export interface G4FResponse {
  success: boolean;
  response?: string;
  error?: string;
  model?: string;
  provider?: string;
}

/**
 * Chat with AI using G4F - completely free
 * 
 * @param prompt - The user message
 * @param options - Model and provider options
 * @returns Promise with AI response
 */
export async function chatWithG4F(
  prompt: string,
  options: G4FChatOptions = {}
): Promise<G4FResponse> {
  const {
    model = G4F_MODELS.AUTO,
    provider = 'auto',
    temperature = 0.7,
    max_tokens = 4096
  } = options;

  try {
    // Select endpoint based on provider
    let endpoint = G4F_ENDPOINTS.AUTO;
    
    switch (provider) {
      case 'groq':
        endpoint = G4F_ENDPOINTS.GROQ;
        break;
      case 'pollinations':
        endpoint = G4F_ENDPOINTS.POLLINATIONS;
        break;
      case 'nvidia':
        endpoint = G4F_ENDPOINTS.NVIDIA;
        break;
      case 'gemini':
        endpoint = G4F_ENDPOINTS.GEMINI;
        break;
      case 'grok':
        endpoint = G4F_ENDPOINTS.GROK;
        break;
      default:
        endpoint = G4F_ENDPOINTS.AUTO;
    }

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API Error ${response.status}: ${errorText}`
      };
    }

    const data = await response.json();
    
    const responseText = data.choices?.[0]?.message?.content || 
                        data.content || 
                        'No response';

    return {
      success: true,
      response: responseText,
      model: data.model || model,
      provider
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Get list of available models
 */
export function getAvailableModels() {
  return Object.values(G4F_MODELS);
}

/**
 * Get list of available providers
 */
export function getAvailableProviders() {
  return Object.keys(G4F_ENDPOINTS);
}

export default { 
  chatWithG4F, 
  G4F_MODELS, 
  getAvailableModels, 
  getAvailableProviders 
};