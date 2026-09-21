const mongoose = require('mongoose');

const colorCombinationSchema = new mongoose.Schema({
    baseColor: {
        name: { type: String, required: true },
        hex: { type: String, required: true }
    },
    complementaryColors: [{
        name: { type: String, required: true },
        hex: { type: String, required: true },
        styleType: { type: String, enum: ['contrast', 'monochromatic', 'accent', 'complementary'], default: 'complementary' }
    }],
    description: { type: String },
    season: { type: String, enum: ['summer', 'winter', 'monsoon', 'all'], default: 'all' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ColorCombination', colorCombinationSchema);
