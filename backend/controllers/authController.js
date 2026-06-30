
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { UserFactory } = require('../patterns/factory/UserFactory');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id, user.role) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id, user.role) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Factory builds the role-specific domain user, whose permission set is
        // returned so the client can show only role-appropriate actions.
        const domainUser = UserFactory.create(user.role, {
            id: user.id,
            name: user.name,
            email: user.email,
        });

        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            university: user.university,
            address: user.address,
            permissions: domainUser.permissions(),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, university, address, password } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.university = university || user.university;
        user.address = address || user.address;
        if (password) user.password = password; // pre-save hook re-hashes it

        const updatedUser = await user.save();
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, university: updatedUser.university, address: updatedUser.address, token: generateToken(updatedUser.id, updatedUser.role) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/users : list all users (admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/auth/users/:id/role : change a user's role (admin only)
const ALLOWED_ROLES = ['staff', 'kitchen', 'admin'];

// Pure guard: returns an error message, or null if the change is allowed.
const validateRoleChange = (role, targetUserId, requesterId) => {
    if (!ALLOWED_ROLES.includes(role)) {
        return `Role must be one of: ${ALLOWED_ROLES.join(', ')}`;
    }
    if (targetUserId === requesterId) {
        return 'You cannot change your own role'; // avoid self-lockout
    }
    return null;
};

const updateUserRole = async (req, res) => {
    try {
        const problem = validateRoleChange(req.body.role, req.params.id, req.user.id);
        if (problem) return res.status(400).json({ message: problem });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = req.body.role;
        const updated = await user.save();

        // Factory resolves the permission set for the new role.
        const domainUser = UserFactory.create(updated.role, {
            id: updated.id, name: updated.name, email: updated.email,
        });

        res.json({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            permissions: domainUser.permissions(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/auth/users/:id : remove a user (admin only)
const deleteUser = async (req, res) => {
    try {
        // Guard: an admin cannot delete their own account.
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile, getUsers, updateUserRole, deleteUser, validateRoleChange };
