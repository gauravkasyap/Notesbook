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

      {/* university NOTES */}
      <div className="NAV-details">
        <Link to="/university" className="nav-link">
          University
        </Link>
      </div>

      {/* FAVORITES */}
      <div className="NAV-details">
        <Link to="/favorite" className="nav-link">
          Favorites
        </Link>
      </div>

      {/* Contact us */}
      <div className="NAV-details">
        <Link to="/contact" className="nav-link">
          Contact us
        </Link>
      </div>

    </nav>
  );
}

export default Nav;
