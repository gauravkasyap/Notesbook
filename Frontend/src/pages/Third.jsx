// Third.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import "./Third.css";

export default function Third() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const floatRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // small pointer-parallax for the floating card
  useEffect(() => {
    function onMove(e) {
      const el = floatRef.current;
      if (!el || !isHovering) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;

      el.style.transform = `translate3d(${dx * 12}px, ${dy * 8}px, 0) rotate(${dx * 1.5}deg)`;
    }

    if (isHovering) window.addEventListener("pointermove", onMove);
    else {
      if (floatRef.current) floatRef.current.style.transform = "";
    }

    return () => window.removeEventListener("pointermove", onMove);
  }, [isHovering]);

  // demo "upload" visual
  function handleUploadDemo(e) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setUploaded(false);
    // quick demo animation
    setTimeout(() => setUploaded(true), 700);
    setTimeout(() => setUploaded(false), 2600);
  }

  return (
    <section className="Third root">
      <div className="third-bg">
        <div className="blob t-left" />
        <div className="blob t-right" />
        <div className="radial-overlay" />
      </div>

      <div className="third-inner">
        <div className="third-left">
          <div className="promo-pill">Sell • Share • Earn</div>

          <h2 className="third-title">
            A smarter way to learn, <span className="accent">share</span>, and
            succeed with high-quality notes from students and creators worldwide
          </h2>

          <p className="third-desc">
            Upload once — reach thousands. Create study packs, set a price, or
            offer resources for free. You keep control.
          </p>

          <div className="third-cta-row">
            {user ? (
              <button
                className="btn primary large"
                onClick={handleUploadDemo}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                aria-label="Share notes"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M12 3l4 4h-3v6h-2V7H8l4-4zm-7 13v3h10v-3h2v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3h2z"
                    fill="currentColor"
                  />
                </svg>
                Share Notes
              </button>
            ) : (
              <Link to="/login" className="btn-link">
                <button
                  className="btn ghost large"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  Login to share notes
                </button>
              </Link>
            )}

            <Link to="/create" className="btn-outline-container">
              <button className="btn outline">Create a Note</button>
            </Link>
          </div>

          <ul className="stats">
            <li>
              <strong>5k+</strong>
              <span>notes indexed</span>
            </li>
            <li>
              <strong>1.2k+</strong>
              <span>active sellers</span>
            </li>
            <li>
              <strong>40+</strong>
              <span>subjects</span>
            </li>
          </ul>
        </div>

        <div
          className="third-right"
          ref={cardRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          aria-hidden
        >
          <div className="floating-card" ref={floatRef}>
            <div className={`card-inner ${uploaded ? "card-sent" : ""}`}>
              <div className="card-top">
                <span className="tag">Top Notes</span>
                <span className="pill free">FREE</span>
              </div>

              <div className="card-preview">
                <div className="paper-lines" />
                <div className="paper-lines short" />
                <div className="paper-lines" />
              </div>

              <div className="card-meta">
                <div className="meta-title">Cyber Security — Exam Pack</div>
                <div className="meta-sub">4.9 • 120 downloads</div>
              </div>

              <div className="confetti" aria-hidden>
                <span className="c c1" />
                <span className="c c2" />
                <span className="c c3" />
                <span className="c c4" />
                <span className="c c5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
