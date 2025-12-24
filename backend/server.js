// backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";
import Purchase from "./models/Purchase.js";

import Favorite from "./models/Favorite.js";
import Note from "./models/Note.js";
 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- MULTER STORAGE FOR NOTES (PDF) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
}

const upload = multer({ storage, fileFilter });
// --- USER PROFILE ROUTES ---
// (helper + GET + PATCH here)

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// serve uploaded files
app.use("/uploads", express.static("uploads"));

// --- AVATAR UPLOAD (add near user/profile routes in server.js) ---

// ensure folder exists on disk (create 'uploads/avatars' in your project)
import fs from "fs";
const avatarsDir = "uploads/avatars";
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

// multer storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `avatar-${unique}${ext}`);
  },
});

function avatarFileFilter(req, file, cb) {
  // Allow common image types
  if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Avatar must be an image (png/jpg/webp/gif)"), false);
  }
}

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
});

// POST /api/users/avatar
// body: form-data { userId, avatar (file) }
app.post(
  "/api/users/avatar",
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        // cleanup file if present
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "userId is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "avatar file required" });
      }

      const avatarUrl = `http://localhost:${PORT}/uploads/avatars/${req.file.filename}`;

      // update or create user doc (you already have User model)
      const user = await User.findOneAndUpdate(
        { userId },
        { avatarUrl },
        { new: true, upsert: true }
      );

      // return full profile payload so frontend can refresh stats too
      const payload = await buildUserProfilePayload(userId, user);
      res.json(payload);
    } catch (err) {
      console.error("Avatar upload error:", err);
      res
        .status(500)
        .json({ message: "Avatar upload failed", error: err.message });
    }
  }
);


// --- DB CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo error", err));

// --- USER MODEL WITH PROFILE FIELDS ---
const userSchema = new mongoose.Schema(
  {
    // we’ll store the same id you use on frontend: user.id || user.email
    userId: { type: String, unique: true, sparse: true },

    name: String,
    email: { type: String, unique: true, sparse: true },
    password: String, // if you still use backend auth
    earnings: { type: Number, default: 0 },

    avatarUrl: String,
    bio: String,

    // optional extra badges
    badges: [String],
  },
  { timestamps: true }
);

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
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
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
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// --- NOTES ROUTES ---

// Create a new note with PDF upload
// CREATE NOTE
app.post("/api/notes", upload.single("pdf"), async (req, res) => {
  try {
    const { title, description, language, category, userId, price, isFree } =
      req.body;

    if (!title || !userId)
      return res.status(400).json({ message: "Missing required data" });

    if (!req.file) return res.status(400).json({ message: "PDF required" });

    const pdfUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    const note = await Note.create({
      userId,
      title,
      description,
      language,
      category,
      pdfUrl,
      isFree: isFree === "true",
      price: isFree === "true" ? 0 : Number(price),
    });

    res.json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Failed to upload note" });
  }
});

// Get notes (supports q, userId, category, language)
app.get("/api/notes", async (req, res) => {
  try {
    const { q, userId, category, language } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    if (language) filter.language = language;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// Like a note (for "Popular")
app.patch("/api/notes/:id/like", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    console.error("Error liking note:", err);
    res.status(500).json({ message: "Failed to like note" });
  }
});

// --- FAVORITES ROUTES ---

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

// --- USER PROFILE ROUTES ---

// Helper to build user profile payload
async function buildUserProfilePayload(userId, userDoc) {
  // Stats from notes & favorites
  const notesCount = await Note.countDocuments({ userId });

  const likesAgg = await Note.aggregate([
    { $match: { userId } },
    { $group: { _id: null, totalLikes: { $sum: "$likes" } } },
  ]);

  const likesReceived = likesAgg.length > 0 ? likesAgg[0].totalLikes : 0;

  const favoritesCount = await Favorite.countDocuments({ userId });

  // Simple badge rules
  const badges = [];

  if (notesCount >= 1) badges.push("New Creator");
  if (notesCount >= 5) badges.push("Active Contributor");
  if (likesReceived >= 10) badges.push("Top Helper");
  if (favoritesCount >= 5) badges.push("Collector");

  // also include any custom badges stored on user
  if (Array.isArray(userDoc.badges)) {
    for (const b of userDoc.badges) {
      if (!badges.includes(b)) badges.push(b);
    }
  }

  return {
    user: {
      id: userDoc._id,
      userId: userDoc.userId,
      name: userDoc.name,
      email: userDoc.email,
      avatarUrl: userDoc.avatarUrl,
      bio: userDoc.bio,
      createdAt: userDoc.createdAt,
    },
    stats: {
      notesCount,
      likesReceived,
      favoritesCount,
    },
    badges,
  };
}

// GET /api/users/profile?userId=...
app.get("/api/users/profile", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Find or create user doc for this userId
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({
        userId,
        name: "New User",
        email: `${userId}@placeholder.local`, // placeholder email
      });
    }

    const payload = await buildUserProfilePayload(userId, user);
    res.json(payload);
  } catch (err) {
    console.error("Error getting profile:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

// PATCH /api/users/profile
// body: { userId, name, bio, avatarUrl }
app.patch("/api/users/profile", async (req, res) => {
  try {
    const { userId, name, bio, avatarUrl } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let user = await User.findOneAndUpdate(
      { userId },
      { name, bio, avatarUrl },
      { new: true, upsert: true }
    );

    const payload = await buildUserProfilePayload(userId, user);
    res.json(payload);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET notes by a specific user (seller dashboard)
app.get("/api/notes/mine", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Error loading my notes:", err);
    res.status(500).json({ message: "Failed to load your notes" });
  }
});

// --- PAYMENT ROUTES ---

// ✅ CREATE ORDER
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { amount, noteId, buyerId, sellerId } = req.body;

    if (!amount || !noteId || !buyerId || !sellerId) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // razorpay works in paise
      currency: "INR",
      receipt: `note_${noteId}_${Date.now()}`,
    });

    res.json({ order });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// UPDATE PRICE
app.patch("/api/notes/:id", async (req, res) => {
  try {
    const { isFree, price } = req.body;

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        isFree,
        price: isFree ? 0 : Number(price),
      },
      { new: true }
    );

    res.json(note);
  } catch (err) {
    console.error("Price update error:", err);
    res.status(500).json({ message: "Price update failed" });
  }
});

// ✅ VERIFY PAYMENT

app.post("/api/payments/verify", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      noteId,
      buyerId,
      sellerId,
      amount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ Save purchase
    await Purchase.create({
      noteId,
      buyerId,
      sellerId,
      amount,
      razorpay_payment_id,
      createdAt: new Date(),
    });

    // ✅ Add earnings to seller
    await User.findByIdAndUpdate(sellerId, {
      $inc: { earnings: amount },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// CHECK IF NOTE IS PURCHASED
app.get("/api/purchases/check", async (req, res) => {
  try {
    const { buyerId, noteId } = req.query;

    if (!buyerId || !noteId) {
      return res.status(400).json({ purchased: false });
    }

    const exists = await Purchase.findOne({ buyerId, noteId });

    res.json({ purchased: !!exists });
  } catch (err) {
    console.error("Purchase check failed:", err);
    res.status(500).json({ purchased: false });
  }
});

// CREATOR EARNINGS DASHBOARD STATS
// CREATOR EARNINGS DASHBOARD STATS
app.get("/api/creator/stats", async (req, res) => {
  try {
    const { userId } = req.query; // this is Firebase UID or your custom id

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let creator = null;

    // 1) If userId happens to be a Mongo ObjectId (backend-auth case)
    if (mongoose.Types.ObjectId.isValid(userId)) {
      creator = await User.findById(userId);
    }

    // 2) If not found, or it's a Firebase UID → look by userId field
    if (!creator) {
      creator = await User.findOne({ userId });
    }

    // 3) If still not found, create a new user doc for this creator
    if (!creator) {
      creator = await User.create({
        userId,
        name: "New Creator",
      });
    }

    // Notes uploaded by this user (Note.userId stores the same userId string)
    const notesCount = await Note.countDocuments({ userId });

    // Aggregate total earnings + total sales from purchases
    const salesAgg = await Purchase.aggregate([
      { $match: { sellerId: userId } }, // Purchase.sellerId is same userId string
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
          totalSales: { $sum: 1 },
        },
      },
    ]);

    const totalEarnings = salesAgg.length > 0 ? salesAgg[0].totalEarnings : 0;
    const totalSales = salesAgg.length > 0 ? salesAgg[0].totalSales : 0;

    // Latest 10 sales
    const recentSales = await Purchase.find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("noteId", "title");

    res.json({
      creator: {
        id: creator._id,
        userId: creator.userId,
        name: creator.name,
        email: creator.email,
        avatarUrl: creator.avatarUrl,
        // use DB earnings if present, else fallback to calculated total
        earnings:
          typeof creator.earnings === "number"
            ? creator.earnings
            : totalEarnings,
      },
      stats: {
        notesCount,
        totalEarnings,
        totalSales,
      },
      recentSales: recentSales.map((sale) => ({
        id: sale._id,
        noteTitle: sale.noteId?.title || "Untitled",
        amount: sale.amount,
        buyerId: sale.buyerId,
        createdAt: sale.createdAt,
      })),
    });
  } catch (err) {
    console.error("Creator stats error:", err);
    res.status(500).json({ message: "Failed to load creator stats" });
  }
});

// root
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// --- START SERVER ---
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
