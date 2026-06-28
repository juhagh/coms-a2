const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { transitionOrder } = require('../patterns/state/OrderStateMachine');
const { InvalidOrderTransitionError } = require('../patterns/state/OrderState');
const { visibilityStrategyFor, sortStrategyFor } = require('../patterns/strategy/OrderQueryStrategy');
const { validateOrderRequest, OrderValidationError } = require('../patterns/chain/ValidationHandler');

// POST /api/orders : create new order (staff)
const createOrder = async (req, res) => {
    try {
        const { items, notes } = req.body;

        // Validation runs through an explicit Chain of Responsibility
        // (patterns/chain): items present -> well-formed -> valid quantity.
        try {
            validateOrderRequest({ items });
        } catch (err) {
            if (err instanceof OrderValidationError) {
                return res.status(400).json({ message: err.message });
            }
            throw err;
        }

        // Fetch each menu item to snapshot name+price
        const orderItems = await Promise.all(items.map(async (item) => {
            const menuItem = await MenuItem.findById(item.menuItemId);
            if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
            if (!menuItem.available) throw new Error(`${menuItem.name} is not available`);
            return {
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity,
                image: menuItem.image || '',
            };
        }));

        const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const order = await Order.create({
            createdBy: req.user._id,
            items: orderItems,
            notes,
            totalPrice,
            status: 'queued',
        });

        res.status(201).json(order);
    } catch (error) {
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

// PUT /api/orders/:id/status : update order status
// Transition validation is delegated to the State pattern (patterns/state).
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        try {
            // Asks the current state object whether this move is legal.
            transitionOrder(order, status);
        } catch (err) {
            if (err instanceof InvalidOrderTransitionError) {
                return res.status(400).json({ message: err.message });
            }
            throw err; // unknown status / unexpected -> 500 below
        }

        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus };