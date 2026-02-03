
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { browser } from '$app/environment';
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";


const firebaseConfig = {
  apiKey: "AIzaSyAdNX5w10w62U409INArUAzMEUk1ElHNO8",
  authDomain: "blue-trip.firebaseapp.com",
  projectId: "blue-trip",
  storageBucket: "blue-trip.firebasestorage.app",
  messagingSenderId: "546185706998",
  appId: "1:546185706998:web:fef215dcb0498ac6c01bd7",
  measurementId: "G-8YK9FJVZRW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');

let analytics;

if (browser) {
  // Only run this in the browser
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { app, analytics };