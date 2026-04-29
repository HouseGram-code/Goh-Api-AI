/**
 * Puter.js AI Client - MiniMax M2.7
 * 
 * Uses "User-Pays" model:
 * - No API key required for developer
 * - Users pay for their own usage directly to Puter
 * - Completely free for you to implement
 * 
 * Documentation: https://developer.puter.com/tutorials/free-unlimited-minimax-api/
 */

export interface PuterChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface PuterChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// Available MiniMax models
export const MINIMAX_MODELS: Record<string, string> = {
  M2_7: 'minimax/minimax-m2.7',
  M2_5: 'minimax/minimax-m2.5',
  M2_1: 'minimax/minimax-m2.1',
  M2_HER: 'minimax/minimax-m2-her',
};

/**
 * Chat with MiniMax via Puter.js
 * Works directly in browser without backend
 * 
 * @param prompt - The user message
 * @param options - Model and generation options
 * @returns Promise with AI response
 */
export async function chatWithMiniMax(
  prompt: string, 
  options: PuterChatOptions = {}
): Promise<PuterChatResponse> {
  const { 
    model = MINIMAX_MODELS.M2_7,
    temperature = 0.7,
    max_tokens = 2048
  } = options;

  try {
    // Load Puter.js dynamically
    if (typeof window !== 'undefined' && !(window as any).puter) {
      await loadPuterScript();
    }

    // Use Puter global if available
    const puter = (window as any).puter;
    if (!puter?.ai?.chat) {
      // Fallback to direct API call
      return await callPuterAPI(prompt, { model, temperature, max_tokens });
    }

    return new Promise((resolve) => {
      puter.ai.chat(prompt, { model })
        .then((response: any) => {
          resolve({
            success: true,
            response: typeof response === 'string' ? response : response?.text || response?.content || 'No response'
          });
        })
        .catch((error: Error) => {
          resolve({
            success: false,
            error: error.message || 'Puter.js error'
          });
        });
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Load Puter.js script dynamically
 */
function loadPuterScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).puter) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Puter.js'));
    document.head.appendChild(script);
  });
}

/**
 * Fallback: Direct API call to Puter
 */
async function callPuterAPI(
  prompt: string,
  options: { model: string; temperature: number; max_tokens: number }
): Promise<PuterChatResponse> {
  try {
    const response = await fetch('https://api.puter.com/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        error: error.message || `API error: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      response: data.choices?.[0]?.message?.content || data.text || data.content || 'No response'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
}

export default { chatWithMiniMax, MINIMAX_MODELS };