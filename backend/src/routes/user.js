import express from 'express';
import User from '../models/users.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/settings', auth, async (req, res) => {
    try {
        const { mutedCategories } = req.body;

        if (!Array.isArray(mutedCategories)) {
            return res.status(400).json({ message: 'mutedCategories must be an array' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { mutedCategories },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
