import mongoose from "mongoose";
const buildingSchema = new mongoose.Schema({
  name: String,
  floors: Number
});
const societySchema = new mongoose.Schema({
  society_name: { type: String, required: true },
  buildings: [buildingSchema]
});
export default mongoose.model("Society", societySchema);