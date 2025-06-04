// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);