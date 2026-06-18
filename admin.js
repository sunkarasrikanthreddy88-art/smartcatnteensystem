const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, restaurantName, phone } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists with this email or username' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const admin = new Admin({
            username,
            email,
            password: hashedPassword,
            restaurantName,
            phone: phone || ''
        });

        await admin.save();

        // Generate token
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Admin created successfully',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                restaurantName: admin.restaurantName,
                phone: admin.phone
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                restaurantName: admin.restaurantName,
                profileImage: admin.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get admin profile
router.get('/profile', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select('-password');
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update admin profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
    try {
        const updates = {};
        const allowedUpdates = ['username', 'email', 'restaurantName', 'phone', 'address'];

        allowedUpdates.forEach(field => {
            if (req.body[field]) {
                updates[field] = req.body[field];
            }
        });

        if (req.file) {
            updates.profileImage = '/uploads/profiles/' + req.file.filename;
        }

        const admin = await Admin.findByIdAndUpdate(
            req.adminId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.json({ message: 'Profile updated successfully', admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.adminId);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash and update new password
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
