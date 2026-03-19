import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsC-Dlwrn70ZSC060FpS0RblDdfEEFgrc",
  authDomain: "mindprint-d6b19.firebaseapp.com",
  projectId: "mindprint-d6b19",
  storageBucket: "mindprint-d6b19.firebasestorage.app",
  messagingSenderId: "543370372743",
  appId: "1:543370372743:web:8084f4f8160a7d1248ba22",
  measurementId: "G-PC1V4FGG5V"
};

const app = initializeApp(firebaseConfig);

// Auth export
export const auth = getAuth(app);

// Firestore export
export const db = getFirestore(app);
