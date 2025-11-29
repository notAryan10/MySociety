import express from 'express';
import Post from '../models/posts.js';
import { auth } from '../middleware/auth.js';
import User from '../models/users.js';
import { Expo } from 'expo-server-sdk';

const router = express.Router();
const expo = new Expo();

router.post('/create', auth, async (req, res) => {
    try {
        const { text, category, block, building, images } = req.body

        if (!text || !category || !block || !building) {
            return res.status(400).json({ message: 'Text, category, block, and building are required' })
        }

        const newPost = await Post.create({ user_id: req.user.userId, text, category, block, building, images: images || [], })

        const populatedPost = await Post.findById(newPost._id).populate('user_id', 'name email block building')

        // Send push notifications to users in the same building
        try {
            const usersInBuilding = await User.find({
                building: building,
                _id: { $ne: req.user.userId }, // Exclude the post creator
                pushToken: { $exists: true, $ne: null }
            });

            const messages = [];
            for (const user of usersInBuilding) {
                // Check if the push token is valid
                if (!Expo.isExpoPushToken(user.pushToken)) {
                    console.error(`Push token ${user.pushToken} is not a valid Expo push token`);
                    continue;
                }

                messages.push({
                    to: user.pushToken,
                    sound: 'default',
                    title: `New post in ${building}`,
                    body: `${populatedPost.user_id.name}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
                    data: { postId: newPost._id.toString(), category }
                });
            }

            // Send notifications in chunks
            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log('Notification tickets:', ticketChunk);
                } catch (error) {
                    console.error('Error sending notification chunk:', error);
                }
            }
        } catch (notificationError) {
            console.error('Error sending push notifications:', notificationError);
            // Don't fail the post creation if notifications fail
        }

        res.status(201).json(populatedPost)
    } catch (error) {
        console.error('Create Post Error:', error)
        res.status(500).json({ message: error.message || 'Failed to create post' })
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const { category, block } = req.query;
        const filter = {
            building: user.building
        }

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
        const user = await User.findById(req.user.userId)
        const post = await Post.findById(req.params.id).populate('user_id', 'name email block building')

        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
        if (post.building !== user.building) {
            return res.status(403).json({ message: 'Access denied - post from different building' })
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

router.post('/:id/report', auth, async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Report reason is required' })
        }

        const user = await User.findById(req.user.userId)
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        if (post.building !== user.building) {
            return res.status(403).json({ message: 'Access denied - post from different building' })
        }

        const alreadyReported = post.reports.some(
            report => report.user_id.toString() === req.user.userId
        )

        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this post' })
        }

        post.reports.push({ user_id: req.user.userId, reason: reason, reportedAt: new Date() })

        await post.save()

        res.status(200).json({ message: 'Post reported successfully', reportCount: post.reports.length })
    } catch (error) {
        console.error('Report Post Error:', error)
        res.status(500).json({ message: error.message || 'Failed to report post' })
    }
})

export default router;
