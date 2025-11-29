import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  block: String,
  building: String,
  floor: Number,
  room_no: String,
  is_admin: { type: Boolean, default: false },
  mutedCategories: [{ type: String }],
  pushToken: { type: String }
});
export default mongoose.model("User", userSchema);