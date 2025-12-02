// Navbar.jsx
import React, { useEffect, useState } from "react";
import "./Navbar.css";
import assets from "../assets/image.png";
import Nav from "./nav.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Navbar() {
 const { user, logout } = useAuth();

  // track dark mode state
  const [dark, setDark] = useState(() => {
    // try to read a saved preference (optional)
    try {
      const saved = localStorage.getItem("dark-mode");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // apply/remove class on body and persist preference
  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    try {
      localStorage.setItem("dark-mode", JSON.stringify(dark));
    } catch {
      // ignore write errors
    }

    // no cleanup needed because we always reflect current state
  }, [dark]);

  // toggle handler
  function toggleMode() {
    setDark((d) => !d);
  }

  return (
    <header className="head">
      <div className="logo" aria-hidden>
        <img src={assets} alt="Site logo" />
      </div>

      <Nav />

      <div className="login">
        {/* accessible toggle button */}
        <button
          id="mode-toggle"
          onClick={toggleMode}
          aria-pressed={dark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? "☀️" : "🌙"}
        </button>
        {user ? (
          <>
            <span className="user-email">
              {user.name ? user.name : user.email}
            </span>
            <button
              className="button_login"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup">
              <button className="button_signin" type="button">
                Sign Up
              </button>
            </Link>
            <Link to="/login">
              <button className="button_login" type="button">
                Login
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
