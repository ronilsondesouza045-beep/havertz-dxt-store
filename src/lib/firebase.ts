import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("[FIREBASE] Initializing web SDK for project:", firebaseConfig.projectId);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app, firebaseConfig.storageBucket);

// Test connection
async function testConnection() {
  try {
    const testDoc = await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("[FIREBASE] Firestore connection check successful.");
  } catch (error: any) {
    console.warn("[FIREBASE] Firestore connectivity check warning:", error.message);
  }
}

testConnection();
