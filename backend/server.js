import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Favorite from "./models/Favorite.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DB CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo error", err));

// --- SIMPLE USER MODEL ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // in real app: hash this!
});

const User = mongoose.model("User", userSchema);

// --- AUTH ROUTES ---

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password }); // TODO: hash password
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // For simple demo: return user data (no tokens yet)
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// GET favorites for a user
app.get("/api/favorites", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

// ADD a favorite
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, noteId, title, upload_date, language, pdfUrl } = req.body;
    if (!userId || !noteId) {
      return res
        .status(400)
        .json({ message: "userId and noteId are required" });
    }

    const fav = await Favorite.findOneAndUpdate(
      { userId, noteId },
      { userId, noteId, title, upload_date, language, pdfUrl },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(fav);
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// REMOVE a favorite by database id
app.delete("/api/favorites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Favorite.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});