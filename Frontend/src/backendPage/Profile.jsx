// src/pages/Profile.jsx
import "./Profile.css";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";

const API_URL = "http://localhost:5000";

function useAnimatedNumber(value, duration = 700) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = Number(display) || 0;
    const to = Number(value) || 0;
    const start = performance.now();

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * eased);
      setDisplay(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]); // eslint-disable-line

  return display;
}

function SkeletonBlock({ height = 16, width = "100%", radius = 8 }) {
  return (
    <div
      className="skeleton"
      style={{ height, width, borderRadius: radius, marginBottom: 8 }}
      aria-hidden
    />
  );
}

export default function Profile() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [stats, setStats] = useState({
    notesCount: 0,
    likesReceived: 0,
    favoritesCount: 0,
  });

  const [badges, setBadges] = useState([]);
  const [newBadge, setNewBadge] = useState("");

  const [ setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const notesCountAnim = useAnimatedNumber(stats.notesCount);
  const likesAnim = useAnimatedNumber(stats.likesReceived);
  const favsAnim = useAnimatedNumber(stats.favoritesCount);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Please login</h2>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userId = user.id || user.email;

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      setInfo("");
      const res = await fetch(`${API_URL}/api/users/profile?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setName(data.user.name || "");
      setBio(data.user.bio || "");
      setAvatarUrl(data.user.avatarUrl || "");
      setStats(data.stats || {});
      setBadges(data.badges || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setInfo("");
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, bio, avatarUrl }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setStats(data.stats || {});
      setBadges(data.badges || []);
      setInfo("Profile updated ✔");
      setTimeout(() => setInfo(""), 2200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile");
      setTimeout(() => setError(""), 4000);
    } finally {
      setSaving(false);
    }
  }

  function addBadge() {
    const b = (newBadge || "").trim();
    if (!b) return;
    if (badges.includes(b)) {
      setNewBadge("");
      return;
    }
    setBadges((prev) => [...prev, b]);
    setNewBadge("");
  }

  function removeBadge(b) {
    setBadges((prev) => prev.filter((x) => x !== b));
  }

  // Avatar preview
  function handleAvatarSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    // preview URL
    const preview = URL.createObjectURL(f);
    setAvatarUrl(preview);
    // auto upload
    uploadAvatar(f);
  }

  async function uploadAvatar(file) {
    try {
      setAvatarUploading(true);
      const form = new FormData();
      form.append("userId", userId);
      form.append("avatar", file);
      const res = await fetch(`${API_URL}/api/users/avatar`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Avatar upload failed");
      }
      const payload = await res.json();
      // server returns full profile payload
      setAvatarUrl(payload.user.avatarUrl || "");
      setStats(payload.stats || {});
      setBadges(payload.badges || []);
      setInfo("Avatar uploaded ✔");
      setTimeout(() => setInfo(""), 1800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload avatar");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        {loading ? (
          <>
            <div className="profile-header">
              <div className="profile-avatar skeleton-avatar" />
              <div style={{ flex: 1 }}>
                <SkeletonBlock height={20} width="60%" />
                <SkeletonBlock height={14} width="40%" />
                <div style={{ height: 12 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <SkeletonBlock height={48} width="110px" radius={12} />
                  <SkeletonBlock height={48} width="110px" radius={12} />
                  <SkeletonBlock height={48} width="110px" radius={12} />
                </div>
              </div>
            </div>
            <div style={{ height: 16 }} />
            <SkeletonBlock height={14} width="100%" />
            <SkeletonBlock height={140} width="100%" />
          </>
        ) : (
          <>
            <div className="profile-header">
              <div className="profile-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name || "avatar"} />
                ) : (
                  <div className="avatar-placeholder">
                    {(name || user.email || "?")[0]?.toUpperCase()}
                  </div>
                )}
                <div className="avatar-pulse" aria-hidden />
              </div>

              <div className="profile-main-info">
                <h2 className="profile-name">{name || "New User"}</h2>
                <p className="profile-email">{user.email}</p>

                <div className="profile-badges">
                  {badges.length ? (
                    badges.map((badge) => (
                      <span key={badge} className="badge-pill">
                        {badge}
                        <button
                          type="button"
                          className="badge-remove"
                          onClick={() => removeBadge(badge)}
                          aria-label={`remove ${badge}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="badge-pill muted">
                      No badges yet — upload notes to earn some!
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{notesCountAnim}</span>
                <span className="stat-label">Notes uploaded</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{likesAnim}</span>
                <span className="stat-label">Likes received</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{favsAnim}</span>
                <span className="stat-label">Favorites</span>
              </div>
            </div>

            {error && <div className="profile-error">{error}</div>}
            {info && <div className="profile-info">{info}</div>}

            <form className="profile-form" onSubmit={handleSave}>
              <label>
                Display name
                <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </label>

              <label>
                Avatar (upload)
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    aria-label="Upload avatar"
                  />
                  <div style={{ minWidth: 72 }}>
                    {avatarUploading ? (
                      <small>Uploading…</small>
                    ) : (
                      avatarUrl && <img src={avatarUrl} alt="preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                    )}
                  </div>
                </div>
              </label>

              <label>
                Bio
                <textarea rows={3} placeholder="Tell others about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
              </label>

              <div className="badge-editor">
                <input value={newBadge} onChange={(e) => setNewBadge(e.target.value)} placeholder="Add badge (e.g. Top Contributor)" />
                <button type="button" className="btn-outline" onClick={addBadge}>Add</button>
              </div>

              <button className={`profile-save-btn ${info ? "save-success" : ""}`} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
