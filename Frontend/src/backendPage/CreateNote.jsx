// src/pages/CreateNote.jsx

import "./CreateNote.css";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function CreateNote() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("English");
  const [pdf, setPdf] = useState(null);

  // 🔥 PRICING STATES
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(49);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return <h2>Please login to upload notes</h2>;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title || !pdf) {
      setError("Title and PDF required");
      return;
    }

    if (!isFree && (!price || Number(price) <= 0)) {
      setError("Paid notes must have a valid price.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("userId", user.id);
    data.append("title", title);
    data.append("description", description);
    data.append("language", language);
    data.append("isFree", isFree.toString());

    if (!isFree) data.append("price", String(price));

    data.append("pdf", pdf);

    const res = await fetch(`${API_URL}/api/notes`, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      setError("Upload failed");
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="create-note-page">
      <form onSubmit={handleSubmit} className="create-note-card">
        <h2>📄 Upload Notes</h2>

        {error && <p className="create-note-error">{error}</p>}

        <input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Other</option>
        </select>

        {/* 💰 FREE / PAID selector */}
        <div className="note-type">
          <label>
            <input
              type="radio"
              checked={isFree}
              onChange={() => setIsFree(true)}
            />
            Free
          </label>

          <label>
            <input
              type="radio"
              checked={!isFree}
              onChange={() => setIsFree(false)}
            />
            Paid
          </label>
        </div>

        {!isFree && (
          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price ₹"
          />
        )}

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0])}
        />

        <button disabled={loading || !pdf}>
          {loading ? "Uploading..." : "Upload Notes"}
        </button>
      </form>
    </div>
  );
}

export default CreateNote;
