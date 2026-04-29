import { NextResponse } from 'next/server';

// API route for MiniMax M2.7 via Puter.js
// Uses "User-Pays" model - no API key required, users pay for their own usage

export async function POST(req: Request) {
  try {
    const { prompt, model = 'minimax/minimax-m2.7' } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call Puter.js API directly from server-side
    // This keeps the implementation hidden from the frontend
    const puterResponse = await fetch('https://api.puter.com/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        // Use default free tier - users will be prompted for payment if needed
        stream: false
      })
    });

    if (!puterResponse.ok) {
      const errorData = await puterResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || 'Puter API error',
          code: errorData.code
        },
        { status: puterResponse.status }
      );
    }

    const data = await puterResponse.json();
    
    // Extract response text from Puter API format
    const responseText = data.choices?.[0]?.message?.content || 
                        data.text || 
                        data.content || 
                        'No response content';

    return NextResponse.json({ 
      success: true, 
      response: responseText,
      model: model
    });
  } catch (error) {
    console.error('MiniMax API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    model: 'MiniMax M2.7 via Puter.js',
    description: 'Free AI API without API key - users pay for their own usage'
  });
}