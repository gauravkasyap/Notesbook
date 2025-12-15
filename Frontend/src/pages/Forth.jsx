// src/pages/Forth.jsx
import { useLocation } from "react-router-dom";
import "./Forth.css";
import Cards from "../component/cards.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import { searchNotes, getPopularNotes } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "http://localhost:5000"; // backend base

function Forth() {
  const { user } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQ = params.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [filterMode, setFilterMode] = useState("all"); // "all" | "mine"
  const [sortMode, setSortMode] = useState("newest"); // "newest" | "oldest" | "popular"

  const [categoryFilter, setCategoryFilter] = useState(""); // "" = all
  const [languageFilter, setLanguageFilter] = useState(""); // "" = all

  // for progressive reveal (client-side "infinite" feel)
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!initialQ) return;
    // fake event for initial search
    handleSubmit({ preventDefault: () => {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  // Map local Mongo notes -> shape Cards expects
  function mapLocalNotes(data) {
    if (!Array.isArray(data)) return [];
    return data.map((note) => ({
      id: note._id,
      title: note.title,
      upload_date: note.createdAt,
      language: note.language,
      pdfUrl: note.pdfUrl,
      userId: note.userId,
      category: note.category || "General",
      likes: note.likes || 0,
      isFree: note.isFree ?? (note.price === undefined || note.price === null),
      price: note.price,
    }));
  }

  // Merge local and external notes, avoid duplicate ids (prefer local note fields when available)
  function mergeNotes(local, external) {
    const localArr = Array.isArray(local) ? local : [];
    const extArr = Array.isArray(external) ? external : [];

    const seen = new Set();
    const merged = [];

    // prefer local first so local metadata (price, likes) wins
    for (const n of [...localArr, ...extArr]) {
      const id = n.id || n._id || n.pdfUrl || `${n.title}-${n.userId || "ext"}`;
      if (!id || seen.has(id)) continue;
      seen.add(id);

      merged.push({
        id,
        ...n,
        likes: n.likes || 0,
        category: n.category || "General",
      });
    }

    return merged;
  }

  function sortNotes(arr) {
    const list = [...arr];

    switch (sortMode) {
      case "oldest":
        return list.sort(
          (a, b) => new Date(a.upload_date || 0) - new Date(b.upload_date || 0)
        );
      case "popular":
        return list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "newest":
      default:
        return list.sort(
          (a, b) => new Date(b.upload_date || 0) - new Date(a.upload_date || 0)
        );
    }
  }

  // Load initial notes (popular + local)
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const [externalPopular, localRes] = await Promise.all([
          getPopularNotes().catch((err) => {
            console.error("External getPopularNotes error:", err);
            return [];
          }),
          fetch(`${API_URL}/api/notes`).catch((err) => {
            console.error("Local notes fetch error:", err);
            return { ok: false };
          }),
        ]);

        let localNotes = [];
        if (localRes && localRes.ok) {
          const localData = await localRes.json();
          localNotes = mapLocalNotes(localData);
        }

        const merged = mergeNotes(localNotes, externalPopular);
        setNotes(merged);

        if (!merged.length) setError("No notes available yet.");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recent notes...");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  // Search in BOTH APIs
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (loading || searching) return;

    setSearching(true);
    setError(null);
    setVisibleCount(12);

    try {
      const externalPromise = searchNotes(q).catch((err) => {
        console.error("External searchNotes error:", err);
        return [];
      });

      const localPromise = fetch(
        `${API_URL}/api/notes?${new URLSearchParams({ q }).toString()}`
      )
        .then((res) => (res.ok ? res.json() : []))
        .catch((err) => {
          console.error("Local /api/notes search error:", err);
          return [];
        });

      const [externalResults, localRaw] = await Promise.all([
        externalPromise,
        localPromise,
      ]);

      const localMapped = mapLocalNotes(localRaw);
      const merged = mergeNotes(localMapped, externalResults);

      setNotes(merged);

      if (!merged.length) setError("No results found.");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch search results...");
      setNotes([]);
    } finally {
      setSearching(false);
    }
  };

  // Derived view: filter + sort
  const viewNotes = useMemo(() => {
    let filtered = [...notes];

    if (filterMode === "mine" && user) {
      const userId = user.id || user.email;
      filtered = filtered.filter((n) => (n.userId || "") === userId);
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (n) => (n.category || "").toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (languageFilter) {
      filtered = filtered.filter(
        (n) => (n.language || "").toLowerCase() === languageFilter.toLowerCase()
      );
    }

    const sorted = sortNotes(filtered);
    return sorted;
  }, [notes, filterMode, sortMode, categoryFilter, languageFilter, user]);

  // progressive reveal: show more when user scrolls near bottom
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setVisibleCount((v) => Math.min(v + 12, viewNotes.length));
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [viewNotes.length]);

  // reveal animation: mark visible items with intersection observer for nice stagger
  useEffect(() => {
    const nodes = document.querySelectorAll(".card-fade");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.12 }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [notes, visibleCount]);

  const shownNotes = viewNotes.slice(0, visibleCount);

  return (
    <div className="forth-page section-fade">
      <h1 className="page-title">Recent Notes</h1>

      {/* Sticky compact search bar */}
      <div className="search-sticky">
        <form onSubmit={handleSubmit} className="searchContainers">
          <input
            className="p_Bases"
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notes"
          />
          <button
            className="button_Bases"
            type="submit"
            disabled={loading || searching}
            aria-label="Search"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="controls-row">
          <div className="filter-toggle" role="tablist" aria-label="Show">
            <button
              type="button"
              className={filterMode === "all" ? "active" : ""}
              onClick={() => setFilterMode("all")}
            >
              All Notes
            </button>
            <button
              type="button"
              className={filterMode === "mine" ? "active" : ""}
              onClick={() => setFilterMode("mine")}
              disabled={!user}
              title={!user ? "Login to see your notes only" : ""}
            >
              My Notes
            </button>
          </div>

          <div className="filters-right">
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="Computer">Computer</option>
            </select>

            <select
              className="filter-select"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="sort-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-grid">Loading recent notes…</div>
      ) : (
        <>
          <div className="cards-wrapper">
            {shownNotes.length === 0 && !error ? (
              <div className="no-results">No notes to display.</div>
            ) : (
              shownNotes.map((image, i) => (
                <div
                  key={image.id || i}
                  className="card-fade"
                  style={{ transitionDelay: `${(i % 12) * 40}ms` }}
                >
                  <Cards image={image} />
                </div>
              ))
            )}
          </div>

          <div ref={loadMoreRef} className="load-more-anchor" aria-hidden>
            {visibleCount < viewNotes.length ? (
              <button
                className="load-more-btn"
                onClick={() =>
                  setVisibleCount((v) => Math.min(v + 12, viewNotes.length))
                }
              >
                Load more
              </button>
            ) : (
              <div className="end-msg">You've reached the end</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Forth;
