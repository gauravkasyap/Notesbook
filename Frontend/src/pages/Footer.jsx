// Last.jsx
import "./Footer.css";
import logo from "../assets/image.png";
import { useNavDetailsToggle } from "./Footer";

function Last() {
  const { expanded, toggleExpanded } = useNavDetailsToggle();

  console.log("NavDetails mounted, expanded:", expanded);

  return (
    <footer
    className={`nm-footer ${expanded ? "expanded" : ""}`}
    >
      {/* Logo + tagline */}
        <div className="nm-footer__brand">
          <img src={logo} alt="NotesMate logo" className="nm-footer__logo" />
          <div className="nm-footer__brand-text">
            <h3>NotesMate</h3>
            <p className="muted">Buy • Sell • Study — quality notes for every course</p>
          </div>
          <button
          className="nav_down_button"
          aria-expanded={expanded}
          aria-controls="nm-footer"
          title={expanded ? "Collapse details" : "Expand details"}
          onClick={toggleExpanded}
          type="button"
        >
          <svg
            className="svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="#000000ff"
              d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
            />
          </svg>
        </button>
        </div>
        
      <div className="nm-footer__inner">

        {/* Quick links */}
        <div className="nm-footer__links">
          <h4>Explore</h4>
          <ul>
            <li><a href="/notes">Notes</a></li>
            <li><a href="/sell">Sell Notes</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/popular">Popular</a></li>
          </ul>
        </div>

        {/* Company */}
        <div className="nm-footer__company">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/privacy">Privacy</a></li>
          </ul>
        </div>

        {/* Newsletter / contact */}
        <div className="nm-footer__newsletter">
          <h4>Stay updated</h4>
          <p className="muted">Get notified about new notes and deals.</p>
          <form
            className="nm-newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              // integrate with your mailing API or state handler
            }}
          >
            <input
              type="email"
              aria-label="Email address"
              placeholder="Your email"
              required
              className="nm-input"
            />
            <button className="nm-btn" type="submit">Subscribe</button>
          </form>

          <div className="nm-socials" aria-label="Social links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="nm-social">
              {/* Facebook SVG */}
              <svg viewBox="0 0 24 24" className="nm-icon" aria-hidden="true"><path d="M22 12a10 10 0 10-11.6 9.9v-7h-2.3V12h2.3V9.8c0-2.3 1.4-3.6 3.4-3.6.98 0 2 .17 2 .17v2.2h-1.12c-1.1 0-1.44.68-1.44 1.38V12h2.46l-.39 2.89h-2.07v7A10 10 0 0022 12z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="nm-social">
              {/* Twitter SVG */}
              <svg viewBox="0 0 24 24" className="nm-icon" aria-hidden="true"><path d="M22 5.9c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.4-1.7-.7.4-1.4.7-2.1.9A3.4 3.4 0 0016.3 5c-1.9 0-3.4 1.7-3 3.6-2.6-.1-4.9-1.4-6.4-3.4-.8 1.3-.4 3 .9 3.8-.6 0-1.2-.2-1.7-.5v.1c0 1.6 1.1 2.9 2.7 3.2-.5.1-1.1.2-1.6.1.5 1.5 2 2.6 3.7 2.6A6.8 6.8 0 013 19.5a9.5 9.5 0 005.2 1.5c6.3 0 9.7-5.2 9.7-9.7v-.44c.7-.5 1.2-1.1 1.6-1.8-.6.3-1.3.5-2 .6z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="nm-social">
              {/* Instagram SVG */}
              <svg viewBox="0 0 24 24" className="nm-icon" aria-hidden="true"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm5.5-3.6a1.1 1.1 0 11-1.1 1.1 1.1 1.1 0 011.1-1.1z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="nm-footer__bottom">
        <p>© {new Date().getFullYear()} NotesMate — All rights reserved.</p>
        <div className="nm-footer__bottom-links">
          <a href="/sitemap">Sitemap</a>
          <a href="/support">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Last;
