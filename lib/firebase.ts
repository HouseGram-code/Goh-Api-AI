import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth(app);

// Connectivity Test
export async function testFirebaseConnection() {
  try {
    console.log("Starting Firebase connection test...");
    const testRef = doc(db, '_internal_', 'connection_test');
    // Try a simple getDoc first
    await getDocFromServer(testRef);
    console.log("Firebase connection: OK (Server reached)");
    return true;
  } catch (error: any) {
    console.warn("Firebase Connection Warning:", error.code, error.message);
    // If it's a permission error on the test path, the server is still reached
    if (error.code === 'permission-denied') {
      console.log("Firebase connection: OK (Server reached, but permissions logic active)");
      return true;
    }
    if (error.message.includes('offline')) {
      alert("System Offline: Check your internet connection.");
    }
    return false;
  }
}
