import { NextResponse } from 'next/server';

// Pollinations AI - Free, no key required, very generous
// Works in 2026 - Direct API without authentication

export async function POST(req: Request) {
  try {
    const { prompt, model = 'openai', temperature = 0.7 } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Pollinations AI - free, no key needed
    const url = new URL('https://text.pollinations.ai/');
    url.searchParams.set('prompt', prompt);
    url.searchParams.set('model', model);
    url.searchParams.set('temperature', temperature.toString());
    url.searchParams.set('json', 'false');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const text = await response.text();

    return NextResponse.json({
      success: true,
      response: text,
      model,
      provider: 'pollinations_ai'
    });
  } catch (error: any) {
    console.error('Pollinations Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Pollinations AI',
    description: 'Free, no API key required',
    models: ['openai', 'openai-large', 'anthropic', 'deepseek', 'qwen', 'mistral'],
    usage: 'POST with { prompt, model? }'
  });
}