const ColorCombination = require('../models/ColorCombination');

// @desc    Get all active color combinations
// @route   GET /api/colors
// @access  Public
exports.getColors = async (req, res) => {
    try {
        const colors = await ColorCombination.find({ isActive: true });
        res.json(colors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error calling colors API', error: error.message });
    }
};

// @desc    Create new color combination
// @route   POST /api/colors
// @access  Admin
exports.createColor = async (req, res) => {
    try {
        const { baseColor, complementaryColors, description, season } = req.body;
        const newColor = new ColorCombination({
            baseColor,
            complementaryColors,
            description,
            season
        });
        const saved = await newColor.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};
