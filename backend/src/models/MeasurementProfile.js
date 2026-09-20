const mongoose = require('mongoose');

const measurementProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profileName: {
        type: String,
        required: [true, 'Profile name is required'],
        trim: true,
        // e.g. "Self", "Mom", "Wife", "Son"
    },
    garmentType: {
        type: String,
        default: 'general',
        // e.g. "shirt", "kurta", "blouse", "general"
    },
    measurements: {
        type: Map,
        of: Number,
        default: {},
        // Example: { chest: 40, waist: 34, hip: 38, shoulder: 18, ... }
    },
}, {
    timestamps: true,
});

measurementProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('MeasurementProfile', measurementProfileSchema);
