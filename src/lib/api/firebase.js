
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { browser } from '$app/environment';

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


let analytics;

if (browser) {
  // Only run this in the browser
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { app, analytics };