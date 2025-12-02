import "./Cards.css";
import PdfThumbnail from "../pdfThumbnail/pdfThumbnail";
import { useNotesContext } from "../contexts/NotesContext.jsx";

function Cards({ image }) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useNotesContext();
  const favorite = isFavorite(image.id);

  const title = image.title || "Untitled";
  const uploadDate = image.upload_date || "Unknown date";
  const language = image.language || "English";

  function onFavoriteClick(e) {
    e.preventDefault();
    if (favorite) {
      removeFromFavorites(image.id);
    } else {
      addToFavorites(image);
    }
  }

  return (
    <div className="cards-container">
      <div className="card">
        {image.pdfUrl ? (
          <PdfThumbnail
            pdfUrl={image.pdfUrl}
            alt={title}
            className="card_image"
          />
        ) : (
          <img
            className="card_image"
            src="/placeholder-thumbnail.png"
            alt={title}
          />
        )}

        <div className="card_overlay">
          <button
            className={`favorite-btn ${favorite ? "active" : ""}`}
            onClick={onFavoriteClick}
          >
            <span>♥</span>
          </button>
        </div>
      </div>

      <div className="card_info">
        <h2>{title}</h2>
        <p>{uploadDate?.split("-")[0]}</p>
        <p>{language}</p>
      </div>
    </div>
  );
}

export default Cards;
