// src/component/NavSearch.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suggestNotes } from "../services/api";
import "./NavSearch.css"; // reuse / adapt your styles

// tiny debounce helper
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function NavSearch({ placeholder = "Search notes..." }) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]); // {id,title,snippet,isFree,price,source,pdfUrl}
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const nav = useNavigate();
  const rootRef = useRef(null);

  // fetch suggestions using the service helper
  async function fetchSuggestions(q) {
    if (!q || !q.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await suggestNotes(q, { limit: 8 });
      setSuggestions(res || []);
      setOpen(res && res.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      console.error("NavSearch fetchSuggestions error:", err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  const debouncedFetch = useRef(debounce(fetchSuggestions, 300)).current;

  // close dropdown on outside click
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

  // run suggestions when value changes
  useEffect(() => {
    const q = (value || "").trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debouncedFetch(q);
  }, [value, debouncedFetch]);

  // keyboard navigation
  function onKeyDown(e) {
    if (!open) {
      if (e.key === "Enter") {
        const q = (value || "").trim();
        if (q) navToQuery(q);
      }
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
      else {
        const q = (value || "").trim();
        if (q) navToQuery(q);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function navToQuery(q) {
    setOpen(false);
    setActiveIndex(-1);
    setValue(q);
    nav(`/search?q=${encodeURIComponent(q)}`);
  }

  function selectSuggestion(s) {
    // Default behavior: search for the suggestion title.
    // You can change to navigate to a detail page if you have one.
    navToQuery(s.title);
  }

  return (
    <div className="nav-search" ref={rootRef} style={{ position: "relative" }}>
      <input
        className="nav-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
      />

      <button
        className="nav-search-btn"
        type="button"
        onClick={() => {
          const q = (value || "").trim();
          if (q) navToQuery(q);
        }}
        aria-label="Search"
      >
        {loading ? "..." : "Search"}
      </button>

      {open && suggestions.length > 0 && (
        <ul className="nav-suggestions" role="listbox" aria-label="Search suggestions">
          {suggestions.map((s, idx) => (
            <li
              key={s.id || `${s.title}-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              className={`nav-suggestion ${idx === activeIndex ? "active" : ""}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => {
                // prevent blur before click handler runs
                e.preventDefault();
                selectSuggestion(s);
              }}
            >
              <div className="nav-suggest-title">{s.title}</div>
              {/* {s.snippet && <div className="nav-suggest-snippet">{s.snippet}</div>}
              <div className="nav-suggest-meta">
                {s.isFree ? <span className="pill-free">FREE</span> : <span className="price">₹{s.price}</span>}
                <span className="source"> • {s.source}</span>
              </div> */} 
            </li>
          ))}
        </ul>
      )}

      {open && !loading && value.trim() && suggestions.length === 0 && (
        <div className="nav-no-suggestions">
          No suggestions —{" "}
          <button
            className="nav-no-suggest-btn"
            onClick={() => navToQuery(value.trim())}
            type="button"
          >
            search for "{value.trim()}"
          </button>
        </div>
      )}
    </div>
  );
}
