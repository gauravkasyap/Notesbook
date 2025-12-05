/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { uid, email, displayName } = firebaseUser;
        setUser({ id: uid, email, name: displayName });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  async function signup(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }

    const { uid, displayName } = cred.user;
    setUser({ id: uid, email, name: displayName || name });
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const { uid, displayName } = cred.user;
    setUser({ id: uid, email: cred.user.email, name: displayName });
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const { uid, email, displayName } = result.user;
    setUser({ id: uid, email, name: displayName });
  }

  async function resetPassword(email) {
    if (!email) throw new Error("Please enter your email first");
    await sendPasswordResetEmail(auth, email);
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  const value = {
    user,
    authLoading,
    signup,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
}
