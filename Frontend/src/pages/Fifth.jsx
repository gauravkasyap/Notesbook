// src/pages/Fifth.jsx
import "./Fifth.css";
import According from "../component/According/According";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Fifth() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleStartSelling() {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="fifth-page">
      {/* decorative background shapes */}
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      <header className="fifth-hero">
        <h1 className="fifth-title">
          Frequently Asked <span className="accent">Questions</span>
        </h1>
        <p className="fifth-sub">
          Quick answers to help you sell, buy and manage notes. Still stuck?
          Reach out to us — we're happy to help.
        </p>
      </header>

      <main className="fifth-body">
        <section className="faq-card">
          <div className="faq-intro">
            <h3>Everything you need to know</h3>
            <p>
              Browse the most common questions below. Each answer expands with a
              smooth animation and helpful examples.
            </p>
          </div>

          <div className="faq-list-wrap">
            {/* your existing accordion component */}
            <According />
          </div>

          <div className="faq-cta-row">
            <button
              className="selling_button"
              onClick={handleStartSelling}
              aria-label="Start selling notes"
            >
              Start Selling
              <svg
                className="right_arrow"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                role="img"
                aria-hidden
              >
                <path
                  d="M10 6 L16 12 L10 18"
                  stroke="#0b1020"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <a className="help-link" href="/contact">
              Still need help? Contact support →
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
