import "./CreatorDashboard.css";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "http://localhost:5000";

function CreatorDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_URL}/api/creator/stats?userId=${user.id}`
        );

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load stats");
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Creator dashboard error:", err);
        setError("Failed to load earnings. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  if (!user) {
    return (
      <div className="creator-dashboard-page">
        <div className="creator-card">
          <h2>Please login</h2>
          <p>You need to be logged in to see your earnings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="creator-dashboard-page">
        <div className="creator-card">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="creator-dashboard-page">
        <div className="creator-card error">{error}</div>
      </div>
    );
  }

  const { creator, stats: s, recentSales } = stats;

  return (
    <div className="creator-dashboard-page">
      {/* Header */}
      <header className="creator-header">
        <div className="creator-info">
          <div className="creator-avatar">
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt={creator.name} />
            ) : (
              <span>{creator.name?.[0] || "U"}</span>
            )}
          </div>
          <div>
            <h1>{creator.name || "Creator"}</h1>
            <p>{creator.email}</p>
          </div>
        </div>
        <div className="creator-earnings-main">
          <span>Total Earnings</span>
          <h2>₹{(s.totalEarnings || 0).toFixed(2)}</h2>
        </div>
      </header>

      {/* Stat cards */}
      <section className="creator-stats-grid">
        <div className="creator-stat-card">
          <span>Notes uploaded</span>
          <h3>{s.notesCount}</h3>
        </div>

        <div className="creator-stat-card">
          <span>Total sales</span>
          <h3>{s.totalSales}</h3>
        </div>

        <div className="creator-stat-card">
          <span>Avg earning / sale</span>
          <h3>
            ₹
            {s.totalSales
              ? (s.totalEarnings / s.totalSales).toFixed(2)
              : "0.00"}
          </h3>
        </div>
      </section>

      {/* Recent sales table */}
      <section className="creator-sales-section">
        <h2>Recent sales</h2>

        {(!recentSales || recentSales.length === 0) && (
          <p className="muted">
            No sales yet — upload and share more notes to start earning!
          </p>
        )}

        {recentSales && recentSales.length > 0 && (
          <div className="sales-table">
            <div className="sales-row sales-header">
              <span>Note</span>
              <span>Amount</span>
              <span>Date</span>
            </div>
            {recentSales.map((sale) => (
              <div key={sale.id} className="sales-row">
                <span>{sale.noteTitle}</span>
                <span>₹{sale.amount.toFixed(2)}</span>
                <span>
                  {new Date(sale.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CreatorDashboard;
