import express from 'express';
import upload from '../middleware/upload.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/single', auth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' })
        }

        res.status(200).json({ success: true, message: 'Image uploaded successfully', url: req.file.path, public_id: req.file.filename })
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to upload image' })
    }
})

router.post('/multiple', auth, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' })
        }
        const uploadedImages = req.files.map(file => ({ url: file.path, public_id: file.filename }))

        res.status(200).json({ success: true, message: `${req.files.length} image(s) uploaded successfully`, images: uploadedImages })
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to upload images' })
    }
})

export default router;
