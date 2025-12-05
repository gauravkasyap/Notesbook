/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // path may be ../contexts/AuthContext

const NotesContext = createContext(null);

export function useNotesContext() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotesContext must be used inside NotesProvider");
  return ctx;
}

const API_URL = "http://localhost:5000/api";

export function NotesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Load favorites from backend when user changes
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    async function fetchFavorites() {
      setLoadingFavorites(true);
      try {
        const res = await fetch(`${API_URL}/favorites?userId=${user.id || user._id || user.email}`);
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();

        // map backend docs -> shape usable by Cards (id, upload_date, etc)
        const mapped = data.map((fav) => ({
          dbId: fav._id,
          id: fav.noteId,
          title: fav.title,
          upload_date: fav.upload_date,
          language: fav.language,
          pdfUrl: fav.pdfUrl,
        }));

        setFavorites(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFavorites(false);
      }
    }

    fetchFavorites();
  }, [user]);

  // Add favorite -> backend
  async function addToFavorites(note) {
    if (!user) {
      alert("Please login to add favorites");
      return;
    }

    // prevent duplicates in state
    if (favorites.some((n) => n.id === note.id)) return;

    try {
      const body = {
        userId: user.id || user._id || user.email,
        noteId: note.id,
        title: note.title,
        upload_date: note.upload_date,
        language: note.language,
        pdfUrl: note.pdfUrl,
      };

      const res = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add favorite");
      const saved = await res.json();

      const mapped = {
        dbId: saved._id,
        id: saved.noteId,
        title: saved.title,
        upload_date: saved.upload_date,
        language: saved.language,
        pdfUrl: saved.pdfUrl,
      };

      setFavorites((prev) => [...prev, mapped]);
    } catch (err) {
      console.error(err);
      alert("Could not add to favorites");
    }
  }

  // Remove favorite -> backend
  async function removeFromFavorites(noteId) {
    const fav = favorites.find((f) => f.id === noteId);
    if (!fav) return;

    setFavorites((prev) => prev.filter((f) => f.id !== noteId)); // optimistic update

    try {
      await fetch(`${API_URL}/favorites/${fav.dbId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
      // optional: revert on error
    }
  }

  function isFavorite(noteId) {
    return favorites.some((note) => note.id === noteId);
  }

  const value = {
    favorites,
    loadingFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}
