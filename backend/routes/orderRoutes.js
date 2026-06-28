const express = require('express');
const { createOrder, getOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/', protect, requireRole('staff', 'admin'), createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, requireRole('staff', 'kitchen', 'admin'), updateOrderStatus);

module.exports = router;