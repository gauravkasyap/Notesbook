// src/pages/Home.jsx
import React, { useRef, useEffect } from "react";
import "./Home.css";
// removed unused NavSearchCompact import
import { Link } from "react-router-dom";

export default function Home() {
  const mascotRef = useRef(null);
  const cardARef = useRef(null);
  const cardBRef = useRef(null);

  // Simple parallax: translate elements slightly based on mouse position
  useEffect(() => {
    function onMove(e) {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w) * 2 - 1; // -1 .. 1
      const y = (e.clientY / h) * 2 - 1;

      const mx = x * 8; // mascot movement range px
      const my = y * 8;

      if (mascotRef.current) {
        mascotRef.current.style.transform = `translate(${mx}px, ${my}px) rotate(${x * 2}deg)`;
      }
      if (cardARef.current) {
        cardARef.current.style.transform = `translate(${mx * 0.6}px, ${-my * 0.6}px) rotate(${x * 1.5}deg)`;
      }
      if (cardBRef.current) {
        cardBRef.current.style.transform = `translate(${-mx * 0.8}px, ${my * 0.8}px) rotate(${x * -2}deg)`;
      }
    }

    // only attach when pointer is available (desktop)
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="hero-root">
      {/* animated background layers */}
      <div className="bg-blob blob-one" />
      <div className="bg-blob blob-two" />
      <div className="bg-noise" />

      <main className="hero-main">
        <div className="hero-inner">
          <section className="hero-left">
            <h1 className="hero-title">
              <span className="grad-accent">Find the notes</span>
              <br />
              you need
            </h1>

            <p className="hero-sub">
              Access and organize notes for your courses in one place. Study
              smarter, not harder — upload once and share with the world.
            </p>

            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary">
                Get Started →
              </Link>
              <Link to="/browse" className="btn btn-outline">
                Browse Notes
              </Link>
            </div>
          </section>

          <section className="hero-right" aria-hidden>
            {/* Simple vector mascot (inline SVG) — parallax target */}
            <div className="mascot-wrap" ref={mascotRef}>
              <svg
                className="mascot"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Mascot"
              >
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#00C2FF" />
                    <stop offset="1" stopColor="#8A2BE2" />
                  </linearGradient>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width="200"
                  height="200"
                  rx="20"
                  fill="url(#g1)"
                  opacity="0.07"
                />
                <g transform="translate(30,20)">
                  <ellipse cx="70" cy="120" rx="60" ry="50" fill="#FF734B" />
                  <circle cx="70" cy="65" r="36" fill="#FFCBA5" />
                  <circle cx="58" cy="58" r="5" fill="#111" />
                  <circle cx="82" cy="58" r="5" fill="#111" />
                  <path
                    d="M55 78 q15 12 30 0"
                    stroke="#111"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <rect
                    x="8"
                    y="8"
                    width="18"
                    height="14"
                    rx="3"
                    fill="#3CE8D0"
                    transform="rotate(-20 17 15)"
                  />
                  <rect
                    x="110"
                    y="-2"
                    width="18"
                    height="14"
                    rx="3"
                    fill="#FF6FB3"
                    transform="rotate(18 119 5)"
                  />
                  <rect
                    x="18"
                    y="100"
                    width="18"
                    height="14"
                    rx="3"
                    fill="#2D7CFF"
                    transform="rotate(6 27 107)"
                  />
                </g>
              </svg>
            </div>

            {/* decorative floating cards */}
            <div className="floating-card card-a" ref={cardARef}>
              Top Notes
            </div>
            <div className="floating-card card-b" ref={cardBRef}>
              Free
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
