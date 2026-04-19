import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../../../firebase-applet-config.json';

// Initialize firebase admin-like access
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const API_TOKEN = process.env.PUTER_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiZ3VpIiwidmVyc2lvbiI6IjAuMC4wIiwidXVpZCI6ImVmNDZkNjNkLWNjNjQtNDZiMy04NzkwLTE1ZjAxMzdlNmI2YyIsInVzZXJfdWlkIjoiMjAxOGRiOWUtZThiZi00NmYwLWI5MWYtNGY3NmRiNTM3MzdhIiwiaWF0IjoxNzc2NTE5NjA4fQ.WEYpNU7xlO63GKfz5fd9zEinx5CPdCBXt3kf_Q_FgUk";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const xApiKey = req.headers.get('X-API-Key');
    
    let uid: string | null = null;
    let userData: any = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        uid = authHeader.split(' ')[1];
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            userData = userSnap.data();
        } else {
            // Auto-create user document if it doesn't exist yet but user is authenticated
            userData = { 
                email: 'authenticated_user', 
                dailyRequests: 0, 
                lastReset: new Date().toISOString() 
            };
            await setDoc(userRef, userData);
            console.log("Auto-created user document for UID:", uid);
        }
    } else if (xApiKey) {
        // Find user by mapping document ID (Fast & Secure)
        const keyRef = doc(db, 'apiKeys', xApiKey);
        const keySnap = await getDoc(keyRef);
        if (keySnap.exists()) {
            uid = keySnap.data().uid;
            const userRef = doc(db, 'users', uid!);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                userData = userSnap.data();
            }
        }
    }

    if (!uid || !userData) {
        return NextResponse.json({ error: 'Unauthorized: Invalid UID or API Key' }, { status: 401 });
    }

    const now = new Date();
    const lastReset = new Date(userData.lastReset || now);
    
    // Daily Reset Logic
    if (now.toDateString() !== lastReset.toDateString()) {
        userData.dailyRequests = 0;
        userData.lastReset = now.toISOString();
        await setDoc(doc(db, 'users', uid), { dailyRequests: 0, lastReset: now.toISOString() }, { merge: true });
    }

    // Daily Limit enforcement: 5 requests
    if (userData.dailyRequests >= 5) {
        return NextResponse.json({ error: 'Daily limit reached (5/5 requests). Upgrade your plan at GOH AI.' }, { status: 429 });
    }

    const body = await req.json();
    const { prompt, model } = body;

    // Strict character limit: 5000 characters
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Empty prompt' }, { status: 400 });
    }

    if (prompt.length > 5000) {
      return NextResponse.json({ 
        error: `Prompt too long (${prompt.length}/5000 chars). Reduce your input and try again.`,
        limitReached: true
      }, { status: 400 });
    }

    // Call AI core
    const aiResponse = await fetch('https://api.puter.com/drivers/call', {
      method: 'POST',
      headers: { 
          'Content-Type': 'text/plain;actually=json', 
          'Authorization': `Bearer ${API_TOKEN}`,
          'Origin': 'https://puter.com',
          'Referer': 'https://puter.com/'
      },
      body: JSON.stringify({
        interface: 'puter-chat-completion', service: 'ai-chat', method: 'complete',
        args: { messages: [{ content: prompt }], model: model || 'qwen/qwen3.6-plus' },
        auth_token: API_TOKEN
      })
    });

    if (!aiResponse.ok) throw new Error('AI Provider error');
    
    const data = await aiResponse.json();
    const responseText = data.result?.message?.content || data.result || 'No response from core';

    // Increment usage
    await setDoc(doc(db, 'users', uid), { dailyRequests: (userData.dailyRequests || 0) + 1 }, { merge: true });

    return NextResponse.json({ 
        success: true, 
        response: responseText,
        usage: { current: (userData.dailyRequests || 0) + 1, limit: 5 }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


