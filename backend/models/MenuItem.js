const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['coffee', 'breakfast', 'lunch', 'pastries']
    },
    available: { type: Boolean, default: true },
    image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);