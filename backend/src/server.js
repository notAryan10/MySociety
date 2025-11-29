import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();
const app = express()
connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({ "message": "API is working" });
})

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/upload', uploadRoutes);


app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
