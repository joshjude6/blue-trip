import { initializeApp } from "firebase/app";
import "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
const firebaseConfig = {
  apiKey: "AIzaSyAdNX5w10w62U409INArUAzMEUk1ElHNO8",
  authDomain: "blue-trip.firebaseapp.com",
  projectId: "blue-trip",
  storageBucket: "blue-trip.firebasestorage.app",
  messagingSenderId: "546185706998",
  appId: "1:546185706998:web:fef215dcb0498ac6c01bd7",
  measurementId: "G-8YK9FJVZRW"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
getFunctions(app, "europe-west1");
export {
  auth as a,
  db as d,
  storage as s
};
