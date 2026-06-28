const MenuItem = require('../models/MenuItem');

// GET /api/menu : get all menu items (optionally filter by category)
const getMenuItems = async (req, res) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/menu/:id : get single menu item
const getMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/menu : create menu item (admin only)
const createMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, available, image } = req.body;
        const item = await MenuItem.create({ name, description, price, category, available, image });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/menu/:id : update menu item (admin only)
const updateMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Menu item not found' });

        const { name, description, price, category, available, image } = req.body;
        item.name = name ?? item.name;
        item.description = description ?? item.description;
        item.price = price ?? item.price;
        item.category = category ?? item.category;
        item.available = available ?? item.available;
        item.image = image ?? item.image;

        const updated = await item.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/menu/:id : delete menu item (admin only)
const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        await item.deleteOne();
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };