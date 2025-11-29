import express from 'express';
import Poll from '../models/polls.js';
import { auth } from '../middleware/auth.js';
import User from '../models/users.js';
import { Expo } from 'expo-server-sdk';

const router = express.Router();
const expo = new Expo();

router.post('/create', auth, async (req, res) => {
    try {
        const { question, options, category, block, building } = req.body;

        if (!question || !options || !category || !block || !building) {
            return res.status(400).json({ message: 'Question, options, category, block, and building are required' });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: 'At least 2 options are required' });
        }

        const pollOptions = options.map(opt => ({
            text: opt,
            votes: []
        }));

        const newPoll = await Poll.create({
            user_id: req.user.userId,
            question,
            options: pollOptions,
            category,
            block,
            building
        });

        const populatedPoll = await Poll.findById(newPoll._id).populate('user_id', 'name email block building');

        try {
            const usersInBuilding = await User.find({
                building: building,
                _id: { $ne: req.user.userId },
                pushToken: { $exists: true, $ne: null }
            });

            const messages = [];
            for (const user of usersInBuilding) {
                if (!Expo.isExpoPushToken(user.pushToken)) {
                    console.error(`Push token ${user.pushToken} is not a valid Expo push token`);
                    continue;
                }

                messages.push({
                    to: user.pushToken,
                    sound: 'default',
                    title: `New poll in ${building}`,
                    body: `${populatedPoll.user_id.name}: ${question}`,
                    data: { pollId: newPoll._id.toString(), category, type: 'poll' }
                });
            }

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
        }

        res.status(201).json(populatedPoll);
    } catch (error) {
        console.error('Create Poll Error:', error);
        res.status(500).json({ message: error.message || 'Failed to create poll' });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { category, block } = req.query;
        const filter = {
            building: user.building
        };

        if (category && category !== 'All') {
            filter.category = category;
        }
        if (block) {
            filter.block = block;
        }

        const polls = await Poll.find(filter)
            .populate('user_id', 'name email block building')
            .populate('options.votes', 'name')
            .sort({ isPinned: -1, createdAt: -1 });

        res.json(polls);
    } catch (error) {
        console.error('Get Polls Error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch polls' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const poll = await Poll.findById(req.params.id)
            .populate('user_id', 'name email block building')
            .populate('options.votes', 'name');

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        if (poll.building !== user.building) {
            return res.status(403).json({ message: 'Access denied - poll from different building' });
        }

        res.json(poll);
    } catch (error) {
        console.error('Get Poll Error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch poll' });
    }
});

router.post('/:id/vote', auth, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        if (optionIndex === undefined || optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ message: 'Invalid option index' });
        }

        const userHasVoted = poll.options.some(option =>
            option.votes.some(vote => vote.toString() === req.user.userId)
        );

        if (userHasVoted) {
            poll.options.forEach(option => {
                option.votes = option.votes.filter(vote => vote.toString() !== req.user.userId);
            });
        }

        poll.options[optionIndex].votes.push(req.user.userId);
        await poll.save();

        const updatedPoll = await Poll.findById(req.params.id)
            .populate('user_id', 'name email block building')
            .populate('options.votes', 'name');

        res.json(updatedPoll);
    } catch (error) {
        console.error('Vote Poll Error:', error);
        res.status(500).json({ message: error.message || 'Failed to vote on poll' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const user = await User.findById(req.user.userId);
        if (!user.is_admin && poll.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this poll' });
        }

        await Poll.findByIdAndDelete(req.params.id);
        res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error('Delete Poll Error:', error);
        res.status(500).json({ message: error.message || 'Failed to delete poll' });
    }
});

router.put('/pin/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user.is_admin) {
            return res.status(403).json({ message: 'Only admins can pin polls' });
        }

        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        poll.isPinned = !poll.isPinned;
        await poll.save();

        res.json(poll);
    } catch (error) {
        console.error('Pin Poll Error:', error);
        res.status(500).json({ message: error.message || 'Failed to pin poll' });
    }
});

export default router;
