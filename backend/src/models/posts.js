import mongoose from "mongoose";
const reportSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: String,
  reportedAt: { type: Date, default: Date.now }
});
const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  block: { type: String, required: true },
  category: {
    type: String,
    enum: ["Maintenance", "Buy/Sell", "Lost & Found", "Events", "Other"],
    required: true
  },
  text: String,
  images: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  reports: [reportSchema],
});
postSchema.index({ isPinned: -1, createdAt: -1 });
export default mongoose.model("Post", postSchema);
