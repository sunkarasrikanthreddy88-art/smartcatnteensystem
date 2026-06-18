const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

// Configure multer for food image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/menu/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Get all menu items (public - for users)
router.get('/', async (req, res) => {
    try {
        const { category, adminId, available } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (adminId) filter.adminId = adminId;
        if (available !== undefined) filter.available = available === 'true';

        const menuItems = await MenuItem.find(filter)
            .populate('adminId', 'restaurantName')
            .sort({ createdAt: -1 });

        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get menu items by admin (for admin dashboard)
router.get('/my-menu', auth, async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ adminId: req.adminId })
            .sort({ createdAt: -1 });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single menu item
router.get('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id)
            .populate('adminId', 'restaurantName email phone');

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create menu item (admin only)
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, price, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Food image is required' });
        }

        const menuItem = new MenuItem({
            name,
            price,
            category,
            image: '/uploads/menu/' + req.file.filename,
            adminId: req.adminId
        });

        await menuItem.save();
        await menuItem.populate('adminId', 'restaurantName');

        res.status(201).json({
            message: 'Menu item created successfully',
            menuItem
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update menu item (admin only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const menuItem = await MenuItem.findOne({
            _id: req.params.id,
            adminId: req.adminId
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found or unauthorized' });
        }

        const updates = {};
        const allowedUpdates = ['name', 'price', 'category', 'available'];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (req.file) {
            updates.image = '/uploads/menu/' + req.file.filename;
        }

        Object.assign(menuItem, updates);
        await menuItem.save();
        await menuItem.populate('adminId', 'restaurantName');

        res.json({
            message: 'Menu item updated successfully',
            menuItem
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete menu item (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const menuItem = await MenuItem.findOneAndDelete({
            _id: req.params.id,
            adminId: req.adminId
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found or unauthorized' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle availability (admin only)
router.patch('/:id/toggle-availability', auth, async (req, res) => {
    try {
        const menuItem = await MenuItem.findOne({
            _id: req.params.id,
            adminId: req.adminId
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found or unauthorized' });
        }

        menuItem.available = !menuItem.available;
        await menuItem.save();

        res.json({
            message: 'Availability updated successfully',
            menuItem
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
