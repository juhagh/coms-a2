const Order = require('../models/Order');
const { InvalidOrderTransitionError } = require('../patterns/state/OrderState');
const { visibilityStrategyFor, sortStrategyFor } = require('../patterns/strategy/OrderQueryStrategy');
const { OrderValidationError } = require('../patterns/chain/ValidationHandler');
const { orderService } = require('../patterns/facade/OrderService');

// POST /api/orders : create new order (staff)
// Orchestration (validate -> price -> persist) is delegated to the
// OrderService facade (patterns/facade).
const createOrder = async (req, res) => {
    try {
        const { items, notes } = req.body;

        const order = await orderService.placeOrder({
            userId: req.user._id,
            items,
            notes,
        });

        res.status(201).json(order);
    } catch (error) {
        // OrderValidationError (bad request shape) and menu errors are both
        // client errors -> 400, preserving prior behaviour.
        res.status(400).json({ message: error.message });
    }
};

// GET /api/orders : get orders.
// Visibility (which orders) and sort order are chosen by interchangeable
// strategies — see patterns/strategy. Visibility is driven by role; sort is
// switchable per request via ?sort=newest|oldest|status (default newest).
const getOrders = async (req, res) => {
    try {
        const visibility = visibilityStrategyFor(req.user.role);
        const sort = sortStrategyFor(req.query.sort);

        const orders = await Order.find(visibility.filter(req.user))
            .populate('createdBy', 'name')
            .sort(sort.sort());
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/orders/:id : get single order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('createdBy', 'name');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/orders/:id/status : update order status.
// The OrderService facade applies the State transition, persists, and publishes
// the Observer event; this handler only maps outcomes to HTTP responses.
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        let updated;
        try {
            updated = await orderService.changeStatus(req.params.id, status);
        } catch (err) {
            if (err instanceof InvalidOrderTransitionError) {
                return res.status(400).json({ message: err.message });
            }
            throw err;
        }

        if (!updated) return res.status(404).json({ message: 'Order not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus };
