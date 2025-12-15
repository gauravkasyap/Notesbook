import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
  amount: Number
},{
  timestamps: true
});

export default mongoose.model("Purchase", purchaseSchema);
