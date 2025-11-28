import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import { auth } from "./middleware/auth.js";
import User from "./models/users.js";

dotenv.config();
const app = express()
connectDB();
const jwtSec = process.env.JWT_SECRET

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  dbName: "mydatabase",
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.status(200).json({ "message": "API is working" });
});

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword, });
    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSec, { expiresIn: "1h" })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) {
    res.status(500).json({ message: "Server error during login" })
  }
})

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
