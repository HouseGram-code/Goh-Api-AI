/**
 * Free AI Client - No API Key Required
 * Works in 2026 - Multiple free providers with fallback
 */

// Provider endpoints
const PROVIDERS: Record<string, string> = {
  G4F_AUTO: 'https://g4f.space/api/auto',
  G4F_GROQ: 'https://g4f.space/api/groq',
  G4F_POLLINATIONS: 'https://g4f.space/api/pollinations',
  G4F_NVIDIA: 'https://g4f.space/api/nvidia',
  G4F_GEMINI: 'https://g4f.space/api/gemini',
  G4F_GROK: 'https://g4f.space/api/grok',
  G4F_DEEPSEEK: 'https://g4f.space/api/deepseek',
  G4F_QWEN: 'https://g4f.space/api/qwen',
  G4F_MISTRAL: 'https://g4f.space/api/mistral',
  POLLINATIONS_AI: 'https://text.pollinations.ai',
};

// Available models
export const MODELS: Record<string, string> = {
  AUTO: 'auto',
  // Groq
  LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
  LLAMA_3_1_70B: 'llama-3.1-70b-versatile',
  LLAMA_3_1_8B: 'llama-3.1-8b-instant',
  MIXTRAL: 'mixtral-8x7b-32768',
  // OpenAI
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  // Claude
  CLAUDE_3_5_SONNET: 'claude-3.5-sonnet',
  CLAUDE_3_HAIKU: 'claude-3-haiku',
  // Google
  GEMINI_2_FLASH: 'gemini-2.0-flash-exp',
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
};

export type ModelType = typeof MODELS[keyof typeof MODELS];
export type ProviderType = keyof typeof PROVIDERS;

export interface FreeAIOptions {
  model?: ModelType;
  provider?: ProviderType;
  temperature?: number;
  max_tokens?: number;
}

export interface FreeAIResponse {
  success: boolean;
  response?: string;
  error?: string;
  model?: string;
  provider?: string;
}

/**
 * Chat with Free AI - No API Key Required
 * 
 * @param prompt - Your message
 * @param options - Model and provider options
 * @returns AI response
 */
export async function chatWithFreeAI(
  prompt: string,
  options: FreeAIOptions = {}
): Promise<FreeAIResponse> {
  const {
    model = MODELS.AUTO,
    provider,
    temperature = 0.7,
    max_tokens = 4096
  } = options;

  try {
    // Use server API for better reliability
    const response = await fetch('/api/chat-free', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model,
        provider,
        temperature,
        max_tokens
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Direct call to Pollinations AI (works in browser)
 */
export async function chatWithPollinations(
  prompt: string,
  model: string = 'openai'
): Promise<FreeAIResponse> {
  try {
    const url = new URL('https://text.pollinations.ai/');
    url.searchParams.set('prompt', prompt);
    url.searchParams.set('model', model);
    url.searchParams.set('json', 'false');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const text = await response.text();
    return {
      success: true,
      response: text,
      provider: 'pollinations_ai'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get available models
 */
export function getModels() {
  return Object.values(MODELS);
}

/**
 * Get available providers
 */
export function getProviders() {
  return Object.keys(PROVIDERS);
}

export default { 
  chatWithFreeAI, 
  chatWithPollinations,
  MODELS, 
  getModels, 
  getProviders 
};