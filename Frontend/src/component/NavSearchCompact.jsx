// src/component/NavSearchCompact.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suggestNotes } from "../services/api";
import "./NavSearchCompact.css"; // small styles we add below

// simple debounce
function debounce(fn, wait = 280) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function NavSearchCompact({ placeholder = "Search notes..." }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // fetcher
  async function fetchSuggestions(q) {
    if (!q || !q.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await suggestNotes(q, { limit: 6 }).catch(() => []);
      setSuggestions(res || []);
      setActiveIndex(-1);
      setOpen(res && res.length > 0);
    } catch (err) {
      console.warn("NavSearchCompact suggestion error", err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  const debouncedFetch = useRef(debounce(fetchSuggestions, 260)).current;

  // outside click closes the dropdown
  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!value || !value.trim()) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    debouncedFetch(value);
  }, [value, debouncedFetch]);

  function onKeyDown(e) {
    if (!open) {
      if (e.key === "Enter") goToSearch(value);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const s = suggestions[activeIndex];
      if (s) selectSuggestion(s);
      else goToSearch(value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function goToSearch(q) {
    if (!q || !q.trim()) return;
    setOpen(false);
    setActiveIndex(-1);
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  function selectSuggestion(item) {
    const title = item.title || item.id || "";
    setValue(title);
    setOpen(false);
    nav(`/search?q=${encodeURIComponent(title)}`);
  }

  return (
    <div className="navsearch-compact" ref={rootRef}>
      <button
        className="navsearch-icon"
        aria-label="Search"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 60);
        }}
      >
        🔍
      </button>

      {/* popup */}
      {open && (
        <div className="navsearch-popup" role="dialog" aria-modal="false">
          <div className="navsearch-inputwrap">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              aria-label="Search notes"
              className="navsearch-input"
            />
            <button
              className="navsearch-go"
              onClick={() => goToSearch(value)}
              aria-label="Search"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>

          <div className="navsearch-listwrap">
            {loading && <div className="navsearch-loading">Loading…</div>}
            {!loading && suggestions.length === 0 && value.trim() && (
              <div className="navsearch-empty">
                No suggestions — <button className="linkish" onMouseDown={() => goToSearch(value)}>search</button>
              </div>
            )}
            {!loading && suggestions.length > 0 && (
              <ul className="navsearch-list" role="listbox">
                {suggestions.map((s, i) => (
                  <li
                    key={s.id || s.title || i}
                    className={i === activeIndex ? "active" : ""}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // keep focus
                      selectSuggestion(s);
                    }}
                  >
                    <div className="navsearch-title">{s.title}</div>
                    {s.snippet && <div className="navsearch-snippet">{s.snippet}</div>}
                    <div className="navsearch-meta">
                      {s.isFree ? <span className="pill-free">FREE</span> : <span className="price">₹{s.price}</span>}
                      <span className="src">{s.source}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
