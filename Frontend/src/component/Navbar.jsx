// Navbar.jsx (updated)
import { useEffect, useState } from "react";
import "./Navbar.css";
// import assets from "../assets/logo2.png";
import Nav from "./nav.jsx";
import NavSearch from "./NavSearch.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
 
export default function Navbar() {
  const { user, logout } = useAuth();

  // track dark mode state
  // const [dark, setDark] = useState(() => {
  //   try {
  //     const saved = localStorage.getItem("dark-mode");
  //     return saved ? JSON.parse(saved) : false;
  //   } catch {
  //     return false;
  //   }
  // });

  // shrink-on-scroll state
  const [scrolled, setScrolled] = useState(false);

  // useEffect(() => {
  //   if (dark) document.body.classList.add("dark-mode");
  //   else document.body.classList.remove("dark-mode");
  //   try { localStorage.setItem("dark-mode", JSON.stringify(dark)); } catch { /* ignore */ }
  // }, [dark]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24); // tweak threshold
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // function toggleMode() {
  //   setDark((d) => !d);
  // }

  return (
    <header className={`head ${scrolled ? "head--scrolled" : ""}`}>
      <div className="head-left">
        <Link to="/" className="brand" aria-label="NotesMate home">
          {/* <img src={assets} alt="NotesMate" className="brand-logo" /> */}
          <span className="brand-text"><h1><span>Your</span><span className="brand-text-notes">Notes</span></h1></span>
        </Link>
      </div>

      <nav className="head-center" aria-label="Main navigation">
        <Nav />
      </nav>

      <div className="head-right">
        <div className="search-wrap">
          <NavSearch />
        </div>

        <div className="controls">
          {/* <button
            id="mode-toggle"
            onClick={toggleMode}
            aria-pressed={dark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="mode-btn"
            title={dark ? "Light mode" : "Dark mode"}
          >
            <span className="mode-emoji">{dark ? "☀️" : "🌙"}</span>
          </button> */}

          {user ? (
            <>
              <Link to="/profile" className="profile-btn" title="Profile">
                <span className="user-email">
                  {user.name ? user.name : user.email}
                </span>
              </Link>
              <button className="button_login" onClick={logout} type="button">
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
      </div>
    </header>
  );
}
