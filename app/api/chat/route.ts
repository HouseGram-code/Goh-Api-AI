import { NextResponse } from 'next/server';

// Use environment variable for security, with hardcoded fallback provided by user
const API_TOKEN = process.env.PUTER_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiZ3VpIiwidmVyc2lvbiI6IjAuMC4wIiwidXVpZCI6ImVmNDZkNjNkLWNjNjQtNDZiMy04NzkwLTE1ZjAxMzdlNmI2YyIsInVzZXJfdWlkIjoiMjAxOGRiOWUtZThiZi00NmYwLWI5MWYtNGY3NmRiNTM3MzdhIiwiaWF0IjoxNzc2NTE5NjA4fQ.WEYpNU7xlO63GKfz5fd9zEinx5CPdCBXt3kf_Q_FgUk";

export async function POST(req: Request) {
  try {
    // If neither env nor fallback is set
    if (!API_TOKEN) {
        return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const body = await req.json();
    const { prompt, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Call AI core via direct REST API
    const aiResponse = await fetch('https://api.puter.com/drivers/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;actually=json',
        'Authorization': `Bearer ${API_TOKEN}`,
        'Origin': 'https://puter.com',
        'Referer': 'https://puter.com/'
      },
      body: JSON.stringify({
        interface: 'puter-chat-completion',
        service: 'ai-chat',
        method: 'complete',
        args: {
            messages: [{ content: prompt }],
            model: model || 'qwen/qwen3.6-plus'
        },
        auth_token: API_TOKEN
      })
    });

    if (!aiResponse.ok) {
       const errText = await aiResponse.text();
       throw new Error(`AI Core returned ${aiResponse.status}: ${errText}`);
    }

    const data = await aiResponse.json();
    
    // Parse the response format
    let responseText = '';
    const result = data.result || data;

    if (typeof result === 'string') {
      responseText = result;
    } else if (result && typeof result === 'object') {
      if ('message' in result) {
        responseText = result.message?.content || result.message || '';
      } else if ('text' in result) {
        responseText = result.text || '';
      } else {
        responseText = JSON.stringify(result);
      }
    }

    return NextResponse.json({ 
      success: true,
      response: responseText
    });

  } catch (error: any) {
    console.error("AI Core Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


