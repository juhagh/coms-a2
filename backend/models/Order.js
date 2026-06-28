const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    customer: { type: String, default: 'Walk-in customer' },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema({
    orderNumber: { type: Number, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'queued', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'draft'
    },
    notes: { type: String },
    totalPrice: { type: Number, required: true },
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastOrder = await mongoose.model('Order').findOne().sort({ orderNumber: -1 });
        this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);