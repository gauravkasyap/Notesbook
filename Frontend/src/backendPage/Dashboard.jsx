// src/pages/Dashboard.jsx
import "./Dashboard.css";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Cards from "../component/cards.jsx";

const API_URL = "http://localhost:5000";

function fmtINR(v) {
  if (v == null) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const dragNode = useRef(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // load notes
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_URL}/api/notes/mine?userId=${user.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load your notes"))
      .finally(() => setLoading(false));
  }, [user]);

  /* ----------------- selection helpers ----------------- */
  function toggleSelect(id) {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(notes.map((n) => n._id)));
  }
  function clearSelection() {
    setSelected(new Set());
  }

  /* ----------------- bulk actions ----------------- */
  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected note(s)? This can't be undone.`)) return;

    setBulkLoading(true);
    const ids = Array.from(selected);
    // optimistic local remove
    const prev = notes;
    setNotes((n) => n.filter((x) => !selected.has(x._id)));
    setSelected(new Set());

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_URL}/api/notes/${id}`, { method: "DELETE" }).then((r) => {
            if (!r.ok) throw new Error("delete failed");
          })
        )
      );
    } catch (err) {
      setError("Failed to delete some notes. Refresh to sync.");
      setNotes(prev); // revert
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkTogglePublish(publish) {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    // optimistic
    setNotes((prev) => prev.map((n) => (selected.has(n._id) ? { ...n, published: publish } : n)));

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_URL}/api/notes/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ published: publish }),
          }).then((r) => {
            if (!r.ok) throw new Error("publish failed");
          })
        )
      );
      setSelected(new Set());
    } catch (err) {
      setError("Failed to update publish state for some notes.");
      // fallback: reload notes
      const r = await fetch(`${API_URL}/api/notes/mine?userId=${user.id}`);
      if (r.ok) {
        const data = await r.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } finally {
      setBulkLoading(false);
    }
  }

  /* ----------------- drag & drop ----------------- */
  function handleDragStart(e, index) {
    dragNode.current = e.currentTarget;
    setDragIndex(index);
    // small data to allow drag in Firefox
    try {
      e.dataTransfer.setData("text/plain", `${index}`);
    } catch {}
    e.currentTarget.classList.add("dragging");
  }

  function handleDragEnter(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDropIndex(index);

    // compute new order locally
    setNotes((prev) => {
      const copy = [...prev];
      const dragged = copy.splice(dragIndex, 1)[0];
      copy.splice(index, 0, dragged);
      setDragIndex(index); // next dragIndex position
      return copy;
    });
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnd(e) {
    if (dragNode.current) dragNode.current.classList.remove("dragging");
    dragNode.current = null;
    setDragIndex(null);
    setDropIndex(null);
  }

  async function saveOrder() {
    // POST to /api/notes/reorder with ordered array of ids
    setSavingOrder(true);
    const ids = notes.map((n) => n._id);
    try {
      const res = await fetch(`${API_URL}/api/notes/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: ids, userId: user.id }),
      });

      if (!res.ok) {
        // server might not have this endpoint - inform user but keep local order
        const text = await res.text().catch(() => "");
        console.warn("reorder failed:", res.status, text);
        alert("Order saved locally. Server didn't accept reorder (no endpoint).");
        setSavingOrder(false);
        return;
      }

      alert("Order saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save order to server. Order preserved locally.");
    } finally {
      setSavingOrder(false);
    }
  }

  /* ----------------- small UI helpers ----------------- */
  const anySelected = selected.size > 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <h1>Seller Dashboard</h1>

        <div className="hero-row">
          <div className="summary">
            <div className="summary-item">
              <div className="muted">Listings</div>
              <div className="value">{notes.length}</div>
            </div>
            <div className="summary-item">
              <div className="muted">Selected</div>
              <div className="value">{selected.size}</div>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn-primary large" onClick={() => navigate("/create")}>
              Upload New Notes
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                if (anySelected) clearSelection();
                else selectAllVisible();
              }}
            >
              {anySelected ? "Clear selection" : "Select all"}
            </button>
            <button className="btn-ghost" onClick={() => saveOrder()} disabled={savingOrder}>
              {savingOrder ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {loading && <div className="loader">Loading your notes…</div>}

        {error && <div className="error-banner">{error}</div>}

        <div className="bulk-actions-bar">
          <div className="left">
            <button className="btn-danger" onClick={bulkDelete} disabled={!anySelected || bulkLoading}>
              {bulkLoading ? "Working…" : `Delete (${selected.size})`}
            </button>
            <button className="btn-primary small" onClick={() => bulkTogglePublish(true)} disabled={!anySelected || bulkLoading}>
              Publish ({selected.size})
            </button>
            <button className="btn-ghost small" onClick={() => bulkTogglePublish(false)} disabled={!anySelected || bulkLoading}>
              Unpublish ({selected.size})
            </button>
          </div>

          <div className="right muted">{anySelected ? `${selected.size} selected` : "No selection"}</div>
        </div>

        <section className="dashboard-grid">
          {notes.map((note, idx) => (
            <article
              key={note._id}
              className={`dashboard-card ${selected.has(note._id) ? "selected-card" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="card-top">
                <input
                  type="checkbox"
                  aria-label={`select ${note.title}`}
                  checked={selected.has(note._id)}
                  onChange={() => toggleSelect(note._id)}
                />
                <div className="card-btns">
                  <button className="icon-btn small" onClick={() => window.open(note.pdfUrl, "_blank")}>Preview</button>
                  <button className="icon-btn small" onClick={() => navigate(`/notes/${note._id}`)}>Details</button>
                </div>
              </div>

              <div className="card-wrap">
                <Cards
                  image={{
                    id: note._id,
                    title: note.title,
                    upload_date: note.createdAt,
                    language: note.language,
                    pdfUrl: note.pdfUrl,
                    likes: note.likes,
                    price: note.price,
                    isFree: note.isFree,
                  }}
                />
              </div>

              <div className="dashboard-card-controls">
                <div className="price-block">
                  <span className="price-label">{note.price == null || note.price === 0 ? "FREE" : fmtINR(note.price)}</span>
                </div>

                <div className="mini-stats">
                  <span className="stat">❤️ {note.likes || 0}</span>
                  <span className="stat">👁️ {note.views || 0}</span>
                  <span className="stat">⭐ {note.favorites || 0}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
