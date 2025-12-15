// src/pages/SearchResults.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Cards from "../component/cards.jsx";
import { searchNotes } from "../services/api";
import "./SearchResults.css"; // optional, create or reuse styles

const PAGE_SIZE = 12; // how many cards to show initially and per "Load more"

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const qParam = (searchParams.get("q") || "").trim();
  const navigate = useNavigate();

  const [query, setQuery] = useState(qParam);
  const [allResults, setAllResults] = useState([]); // full merged results from searchNotes
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE); // how many to show
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // when URL query param changes, update UI + run search
    setQuery(qParam);
    setVisibleCount(PAGE_SIZE);
    if (qParam) {
      doSearch(qParam);
    } else {
      // if no q, clear results (or optionally load popular)
      setAllResults([]);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  async function doSearch(q) {
    setLoading(true);
    setError("");
    setAllResults([]);

    try {
      // searchNotes merges local + zenodo and returns normalized objects
      const results = await searchNotes(q, { limit: 200 }); // request a reasonable max
      if (!mountedRef.current) return;

      if (!Array.isArray(results) || results.length === 0) {
        setAllResults([]);
        setError("No results found.");
        return;
      }

      setAllResults(results);
      setError("");
      // visibleCount reset is handled in parent effect
    } catch (err) {
      console.error("SearchResults.doSearch error:", err);
      setAllResults([]);
      setError(
        // prefer friendly message but include short detail for debugging
        err?.message ? `Failed to search notes: ${err.message}` : "Failed to search notes."
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;
    // update URL -> triggers effect above
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function loadMore() {
    setVisibleCount((c) => Math.min(allResults.length, c + PAGE_SIZE));
  }

  const visibleNotes = allResults.slice(0, visibleCount);

  return (
    <div className="search-results-page" style={{ padding: "4rem 3vw 6rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: 18 }}>
        Search results for {qParam ? <>&quot;{qParam}&quot;</> : <em>everything</em>}
      </h1>

      <form onSubmit={onSubmit} style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 22 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Refine search..."
          style={{
            width: 580,
            maxWidth: "80%",
            padding: "12px 16px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "transparent",
            color: "inherit",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg,#4cc9f0,#7c3aed)",
            color: "#020617",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {/* status */}
      {loading && <div style={{ textAlign: "center", marginTop: 24 }}>Searching...</div>}
      {!loading && error && (
        <div style={{ textAlign: "center", color: "#ff7676", marginTop: 18 }}>{error}</div>
      )}

      {/* results grid */}
      {!loading && !error && visibleNotes.length > 0 && (
        <div className="cards-wrapper">
          {visibleNotes.map((note) => (
            <Cards key={note.id} image={note} />
          ))}
        </div>
      )}

      {/* no results */}
      {!loading && !error && allResults.length === 0 && qParam && (
        <div style={{ textAlign: "center", marginTop: 30 }}>No notes found for "{qParam}".</div>
      )}

      {/* Load more */}
      {!loading && allResults.length > visibleNotes.length && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
          <button
            onClick={loadMore}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Load more ({allResults.length - visibleNotes.length} more)
          </button>
        </div>
      )}
    </div>
  );
}
