const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    commissionPercentage: {
        type: Number,
        default: 10,
        min: 0,
        max: 50,
    },
    supportedLocations: [{
        state: String,
        cities: [String],
    }],
    minOrderAmount: {
        type: Number,
        default: 200,
    },
    advancePercentage: {
        type: Number,
        default: 50,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
