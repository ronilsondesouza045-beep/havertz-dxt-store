import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("[FIREBASE] Initializing web SDK for project:", firebaseConfig.projectId);

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app, firebaseConfig.storageBucket);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("[FIREBASE] Firestore connection established successfully on:", firebaseConfig.firestoreDatabaseId || "(default)");
  } catch (error: any) {
    console.warn("[FIREBASE] Firestore connectivity check warning:", error.message);
    if (error.code === 'not-found' || error.message?.includes('5 NOT_FOUND') || error.message?.includes('not found')) {
      console.error("[FIREBASE] CUSTOM DATABASE NOT FOUND or ACCESS DENIED. The reviews might be missing if the databaseId is invalid.");
    }
  }
}

testConnection();
