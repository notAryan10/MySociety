import express from 'express';
import Comment from '../models/comments.js';
import Post from '../models/posts.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, async (req, res) => {
    try {
        const { post_id, text } = req.body;

        if (!post_id || !text) {
            return res.status(400).json({ message: 'Post ID and text are required' });
        }

        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = await Comment.create({
            post_id,
            user_id: req.user.userId,
            text
        });

        const populatedComment = await Comment.findById(newComment._id).populate('user_id', 'name email');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Create Comment Error:', error);
        res.status(500).json({ message: error.message || 'Failed to create comment' });
    }
});

router.get('/:post_id', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ post_id: req.params.post_id })
            .populate('user_id', 'name email')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch comments' });
    }
});

export default router;
