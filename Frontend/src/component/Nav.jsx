// src/component/Nav.jsx
import "./Nav.css";
import { Link } from "react-router-dom";

function Nav() {
  return (
    <nav className="nav">

      {/* HOME */}
      <div className="NAV-details">
        <Link to="/" className="nav-link">
          Home
        </Link>
      </div>

      {/* EXPLORE NOTES */}
      <div className="NAV-details">
        <p>hii</p>
      </div>

      {/* UPLOAD / SELL */}
      <div className="NAV-details">
        <p>hello</p>
      </div>

      {/* CREATOR DASHBOARD */}
      <div className="NAV-details">
        <p>hjjj</p>
      </div>

      {/* FAVORITES */}
      <div className="NAV-details">
        <Link to="/favorite" className="nav-link">
          Favorites
        </Link>
      </div>

    </nav>
  );
}

export default Nav;
