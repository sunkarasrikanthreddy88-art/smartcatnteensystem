const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    items: [{
        menuItemId: {
            type: Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: String
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'Paid'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online', 'Cash', 'Card', 'UPI'],
        default: 'cash'
    },
    paymentId: {
        type: String,
        default: ''
    },
    tokenNumber: {
        type: String,
        unique: true,
        required: true
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
