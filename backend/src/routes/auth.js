import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import dotenv from 'dotenv';
import { auth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const jwtSec = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    const { name, email, password, block, building, floor, room_no } = req.body;

    if (!email || !password || !name || !block || !building || !floor || !room_no) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const isAdmin = email.endsWith('@admin.com');

        const newUser = await User.create({ name, email, password: hashedPassword, block, building, floor: Number(floor), room_no, is_admin: isAdmin });
        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, jwtSec, { expiresIn: "1h" });
        res.status(201).json({ message: "User registered successfully", token, user: { id: newUser._id, name: newUser.name, email: newUser.email, block: newUser.block, building: newUser.building, floor: newUser.floor, room_no: newUser.room_no } });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message || "Server error during registration" });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, jwtSec, { expiresIn: "1h" });
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ token, user: userResponse });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message || "Server error during login" });
    }
});

router.put('/update-push-token', auth, async (req, res) => {
    try {
        const { pushToken } = req.body;

        if (!pushToken) {
            return res.status(400).json({ message: 'Push token is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { pushToken },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Push token updated successfully' });
    } catch (error) {
        console.error('Update Push Token Error:', error);
        res.status(500).json({ message: error.message || 'Failed to update push token' });
    }
});


export default router;
