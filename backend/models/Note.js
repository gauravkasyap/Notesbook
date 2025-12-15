// backend/models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    title: { type: String, required: true },
    description: String,
    language: { type: String, default: "English" },
    category: { type: String, default: "General" },
    pdfUrl: { type: String, required: true },

    // 🔥 PRICE SYSTEM
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0 },

    // Popularity
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
