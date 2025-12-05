import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    noteId: { type: String, required: true }, // original note id
    title: String,
    upload_date: String,
    language: String,
    pdfUrl: String,
  },
  { timestamps: true }
);

// prevent duplicate favorites per user/note
favoriteSchema.index({ userId: 1, noteId: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
