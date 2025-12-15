// src/component/Cards.jsx

import "./Cards.css";
import PdfThumbnail from "../pdfThumbnail/pdfThumbnail";
import { useNotesContext } from "../contexts/NotesContext.jsx";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const API_URL = "http://localhost:5000";

function Cards({ image }) {
  const noteId = image.id || image._id;
  const { user } = useAuth();

  const { addToFavorites, removeFromFavorites, isFavorite } = useNotesContext();

  const favorite = isFavorite(noteId);
  const [likes, setLikes] = useState(image.likes || 0);
  const [setCheckingPurchase] = useState(false);

  const title = image.title || "Untitled";
  const uploadDate = image.upload_date || image.createdAt || "Unknown date";
  const language = image.language || "English";

  function onFavoriteClick(e) {
    e.preventDefault();
    favorite ? removeFromFavorites(noteId) : addToFavorites(image);
  }

  async function onLikeClick(e) {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/notes/${noteId}/like`, {
        method: "PATCH",
      });
      setLikes((p) => p + 1);
    } catch {
      alert("Failed to like note");
    }
  }

  // Determine FREE vs PAID safely
const isFreeNote =
  image.isFree === true ||
  image.price === undefined ||
  image.price === null ||
  Number(image.price) === 0;

const priceValue = Number(image.price || 0);


  // ✅ OPEN PDF CLICK
async function onPdfClick() {
  const isFreeNote =
    image.isFree === true ||
    image.price === undefined ||
    image.price === null ||
    Number(image.price) === 0;

  // ✅ FREE: open directly
  if (isFreeNote) {
    window.open(image.pdfUrl, "_blank");
    return;
  }

  // ✅ Paid: login check
  if (!user) {
    alert("Please login to buy paid notes");
    return;
  }

  setCheckingPurchase(true);

  try {
    // purchase check
    const res = await fetch(
      `${API_URL}/api/purchases/check?buyerId=${user.id}&noteId=${image.id}`
    );

    if (!res.ok) throw new Error("Purchase check failed");

    const data = await res.json();

    if (data.purchased) {
      window.open(image.pdfUrl, "_blank");
      return;
    }

    // Not bought -> start pay flow
    await buyNote(image);
  } catch (err) {
    console.error("PDF open failed:", err);
    alert("Network error while verifying purchase");
  } finally {
    setCheckingPurchase(false);
  }
}



  // ✅ BUY FLOW
  async function buyNote(note) {
    const res = await fetch(`${API_URL}/api/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: note.price,
        noteId,
        buyerId: user.id,
        sellerId: note.userId,
      }),
    });

    const { order } = await res.json();

    const options = {
      key: "rzp_test_xxxxxxxxxx", // replace with real Razorpay key
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      name: "NotesMate",
      description: note.title,

      handler: async (response) => {
        await fetch(`${API_URL}/api/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            noteId,
            buyerId: user.id,
            sellerId: note.userId,
            amount: note.price,
          }),
        });

        alert("✅ Payment successful!");
        window.open(note.pdfUrl, "_blank");
      },
    };

    new window.Razorpay(options).open();
  }

  return (
    <div className="cards-container">
      <div className="card">
        {/* ✅ Click thumbnail to view PDF */}
        <div onClick={onPdfClick} className="pdf-click">
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
        </div>

        <div className="card_overlay">
          <button
            className={`favorite-btn ${favorite ? "active" : ""}`}
            onClick={onFavoriteClick}
          >
            ♥
          </button>

          <button className="like-btn" onClick={onLikeClick}>
            👍 {likes}
          </button>
        </div>
      </div>

      <div className="card_info">
        <h2>{title}</h2>
        <p>{uploadDate?.toString().split("-")[0]}</p>
        <p>{language}</p>

        <div className="price-tag">
  {isFreeNote ? (
    <span className="free-label">FREE</span>
  ) : (
    <>
      <span className="paid-label">₹{priceValue}</span>
      <button className="buy-btn" onClick={() => buyNote(image)}>
        Buy
      </button>
    </>
  )}
</div>

      </div>
    </div>
  );
}

export default Cards;
