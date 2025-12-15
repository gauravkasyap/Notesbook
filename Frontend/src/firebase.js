// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyArkFliR68sz1cxTZIgdkS1dUS09q7SgZY",
  authDomain: "auth-d2b16.firebaseapp.com",
  projectId: "auth-d2b16",
  storageBucket: "auth-d2b16.appspot.com",   // ✅ FIXED
  messagingSenderId: "971356790796",
  appId: "1:971356790796:web:ab86d67c1d415b44c54e29",
  measurementId: "G-2CYWL8QXNS",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
