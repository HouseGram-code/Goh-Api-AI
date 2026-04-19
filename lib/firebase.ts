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
    const testRef = doc(db, '_internal_', 'connection_test');
    await getDocFromServer(testRef).catch(() => {}); // We don't care if it exists, just that the call works
    console.log("Firebase connection established successfully.");
    return true;
  } catch (error: any) {
    console.error("Firebase Connection Error:", error.message);
    if (error.message.includes('offline')) {
      alert("System Offline: Check your internet connection.");
    }
    return false;
  }
}
