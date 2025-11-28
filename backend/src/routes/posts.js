import express from 'express';
import Post from '../models/posts.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, async (req, res) => {
    try {
        const { text, category, block, images } = req.body

        if (!text || !category || !block) {
            return res.status(400).json({ message: 'Text, category, and block are required' })
        }

        const newPost = await Post.create({ user_id: req.user.userId, text, category, block, images: images || [],})

        const populatedPost = await Post.findById(newPost._id).populate('user_id', 'name email block building')
        res.status(201).json(populatedPost)
    } catch (error) {
        console.error('Create Post Error:', error)
        res.status(500).json({ message: error.message || 'Failed to create post' })
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const { category, block } = req.query;
        const filter = {}

        if (category && category !== 'All') {
            filter.category = category;
        }
        if (block) {
            filter.block = block;
        }

        const posts = await Post.find(filter)
            .populate('user_id', 'name email block building')
            .sort({ isPinned: -1, createdAt: -1 })

        res.json(posts)
    } catch (error) {
        console.error('Get Posts Error:', error)
        res.status(500).json({ message: error.message || 'Failed to fetch posts' })
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user_id', 'name email block building')

        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        res.json(post)
    } catch (error) {
        console.error('Get Post Error:', error)
        res.status(500).json({ message: error.message || 'Failed to fetch post' })
    }
})

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const user = await User.findById(req.user.userId);
        if (!user.is_admin && post.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' })
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete Post Error:', error);
        res.status(500).json({ message: error.message || 'Failed to delete post' })
    }
})

router.put('/pin/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)

        if (!user.is_admin) {
            return res.status(403).json({ message: 'Only admins can pin posts' })
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.json(post);
    } catch (error) {
        console.error('Pin Post Error:', error)
        res.status(500).json({ message: error.message || 'Failed to pin post' })
    }
})

export default router;
