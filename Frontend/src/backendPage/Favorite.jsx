import "./Favorite.css";
import { useNotesContext } from "../contexts/NotesContext.jsx";
import Cards from "../component/cards.jsx";

function Favorite() {
  const { favorites = [], loadingFavorites } = useNotesContext();

  const hasFavorites = favorites.length > 0;

  return (
    <div className="favorites">
      {loadingFavorites ? (
        <div className="favorites-empty">
          <h2>Loading your favorites...</h2>
        </div>
      ) : hasFavorites ? (
        <>
          <h1>Your Favorite Notes</h1>
          <div className="cards-wrapper">
            {favorites.map((note) => (
              <Cards key={note.id} image={note} />
            ))}
          </div>
        </>
      ) : (
        <div className="favorites-empty">
          <h2>No Favorite Notes</h2>
          <p>
            Start adding notes to your Favorite page and they will appear here
          </p>
        </div>
      )}
    </div>
  );
}

export default Favorite;
