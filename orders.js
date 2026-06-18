const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

// Create order (public - for users)
router.post('/', async (req, res) => {
    try {
        const { items, customerName, customerPhone, adminId } = req.body;

        // Validate items and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);

            if (!menuItem) {
                return res.status(404).json({ error: `Menu item ${item.menuItemId} not found` });
            }

            if (!menuItem.available) {
                return res.status(400).json({ error: `${menuItem.name} is currently unavailable` });
            }

            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                menuItemId: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity,
                image: menuItem.image
            });
        }

        // Generate unique token number (numeric only)
        const tokenNumber = String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 1000)).padStart(3, '0');

        // Create order
        const order = new Order({
            items: orderItems,
            totalAmount,
            customerName,
            customerPhone,
            tokenNumber,
            adminId,
            paymentMethod: req.body.paymentMethod || 'cash',
            paymentId: req.body.paymentId || '',
            paymentStatus: req.body.paymentStatus || 'pending'
        });

        await order.save();
        await order.populate('adminId', 'restaurantName email phone');

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders for admin
router.get('/admin/orders', auth, async (req, res) => {
    try {
        const filter = { adminId: req.adminId };

        const orders = await Order.find(filter)
            .populate('items.menuItemId', 'name price image')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('adminId', 'restaurantName email phone address');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Update payment status (admin only)
router.patch('/:id/payment', auth, async (req, res) => {
    try {
        const { paymentStatus, paymentMethod } = req.body;
        const validPaymentStatuses = ['pending', 'completed', 'failed'];

        if (!validPaymentStatuses.includes(paymentStatus)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            adminId: req.adminId
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found or unauthorized' });
        }

        order.paymentStatus = paymentStatus;
        if (paymentMethod) {
            order.paymentMethod = paymentMethod;
        }

        await order.save();

        res.json({
            message: 'Payment status updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get order statistics (admin only)
router.get('/admin/statistics', auth, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Start of current day
        const startOfDay = new Date(currentYear, currentMonth, now.getDate());

        // Start of current month
        const startOfMonth = new Date(currentYear, currentMonth, 1);

        // Start of current year
        const startOfYear = new Date(currentYear, 0, 1);

        // Convert adminId to ObjectId for aggregation
        const adminObjectId = new mongoose.Types.ObjectId(req.adminId);

        // Total orders
        const totalOrders = await Order.countDocuments({ adminId: req.adminId });

        // Daily orders count
        const dailyOrders = await Order.countDocuments({
            adminId: req.adminId,
            createdAt: { $gte: startOfDay }
        });

        // Total revenue (all time) - include all orders
        const totalRevenueResult = await Order.aggregate([
            { $match: { adminId: adminObjectId } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // Daily revenue
        const dailyRevenueResult = await Order.aggregate([
            {
                $match: {
                    adminId: adminObjectId,
                    createdAt: { $gte: startOfDay }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const dailyRevenue = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].total : 0;

        // Monthly revenue - include all orders from current month
        const monthlyRevenueResult = await Order.aggregate([
            {
                $match: {
                    adminId: adminObjectId,
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

        // Yearly revenue - include all orders from current year
        const yearlyRevenueResult = await Order.aggregate([
            {
                $match: {
                    adminId: adminObjectId,
                    createdAt: { $gte: startOfYear }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const yearlyRevenue = yearlyRevenueResult.length > 0 ? yearlyRevenueResult[0].total : 0;

        // Monthly orders count
        const monthlyOrders = await Order.countDocuments({
            adminId: req.adminId,
            createdAt: { $gte: startOfMonth }
        });

        res.json({
            totalOrders,
            dailyOrders,
            totalRevenue,
            dailyRevenue,
            monthlyRevenue,
            yearlyRevenue,
            monthlyOrders
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
