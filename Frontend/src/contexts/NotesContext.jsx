/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const NotesContext = createContext(null);

export function useNotesContext() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotesContext must be used inside NotesProvider");
  return ctx;
}

export function NotesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("favoriteNotes");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("favoriteNotes", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (note) =>
    setFavorites((prev) =>
      prev.some((n) => n.id === note.id) ? prev : [...prev, note]
    );

  const removeFromFavorites = (noteId) =>
    setFavorites((prev) => prev.filter((n) => n.id !== noteId));

  const isFavorite = (noteId) => favorites.some((n) => n.id === noteId);

  return (
    <NotesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
    >
      {children}
    </NotesContext.Provider>
  );
}
