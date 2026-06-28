const express = require('express');
const {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', protect, getMenuItems);
router.get('/:id', protect, getMenuItem);
router.post('/', protect, requireRole('admin'), createMenuItem);
router.put('/:id', protect, requireRole('admin'), updateMenuItem);
router.delete('/:id', protect, requireRole('admin'), deleteMenuItem);

module.exports = router;