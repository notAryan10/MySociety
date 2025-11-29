import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{
        text: { type: String, required: true },
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    building: { type: String, required: true },
    block: { type: String, required: true },
    category: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Poll", pollSchema);
