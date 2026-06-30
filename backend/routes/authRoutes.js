
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile, getUsers, updateUserRole, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/users', protect, requireRole('admin'), getUsers);
router.put('/users/:id/role', protect, requireRole('admin'), updateUserRole);
router.delete('/users/:id', protect, requireRole('admin'), deleteUser);

module.exports = router;
