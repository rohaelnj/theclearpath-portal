// src/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- YOUR FIREBASE CONFIG ---
// (You can move these to .env.local later if you want)
const firebaseConfig = {
  apiKey: "AIzaSyAWszwwj7r3aQfYFnrGDcHElctKIpEszeY",
  authDomain: "theclearpath-6864e.firebaseapp.com",
  projectId: "theclearpath-6864e",
  storageBucket: "theclearpath-6864e.appspot.com",
  messagingSenderId: "424848862076",
  appId: "1:424848862076:web:b7d709da0fed000122d2f9",
  measurementId: "G-RNFQXLZ6DD"
};

// Avoid re-initializing app on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
