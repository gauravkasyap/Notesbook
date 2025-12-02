import "./Forth.css";
import Cards from "../component/cards.jsx";
import { useState, useEffect } from "react";
import { searchNotes, getPopularNotes } from "../services/api";

function Forth() {
  const [SearchQuery, setSearchQuery] = useState("");
  const [Notes, setNotes] = useState([]);
  const [Error, setError] = useState(null);
  const [Loading, setLoading] = useState(true);
  const [Searching, setSearching] = useState(false); // separate flag for search-in-progress

  useEffect(() => {
    const loadPopularNotes = async () => {
      try {
        setLoading(true);
        const popularNotes = await getPopularNotes();
        // ensure it's an array
        setNotes(Array.isArray(popularNotes) ? popularNotes : []);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch popular notes...");
      } finally {
        setLoading(false);
      }
    };

    loadPopularNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = SearchQuery.trim();
    if (!q) return; // ignore empty searches
    if (Loading || Searching) return; // prevent duplicate requests

    setSearching(true);
    setError(null);
    try {
      const results = await searchNotes(q);
      // normalize to array
      setNotes(Array.isArray(results) ? results : []);
      if (!results || (Array.isArray(results) && results.length === 0)) {
        setError("No results found.");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch search results...");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="forth-page">
      <h1>Recent Notes</h1>

      <form onSubmit={handleSubmit} className="searchContainers">
        <input
          className="p_Bases"
          type="text"
          placeholder="Search your notes..."
          value={SearchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="button_Bases"
          type="submit"
          disabled={Loading || Searching}
        >
          {Searching ? "Searching..." : "Search"}
        </button>
      </form>

      {Error && <div className="error-message">{Error}</div>}

      {Loading ? (
        <div>Loading...</div>
      ) : (
        <div className="cards-wrapper">
          {Notes.length === 0 && !Error ? (
            <div className="no-results">No notes to display.</div>
          ) : (
            Notes.map((image) => <Cards key={image.id} image={image} />)
          )}
        </div>
      )}
    </div>
  );
}

export default Forth;
