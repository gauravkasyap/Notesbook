/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load login from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function login(email, password) {
    if (!email || !password) {
      throw new Error("Email & password required");
    }

    const userData = { email };
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
  }

  function signup(name, email, password) {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    const userData = { name, email };
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("authUser");
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
