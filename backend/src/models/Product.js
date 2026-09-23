const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['men', 'women', 'kids'],
    },
    subCategory: {
        type: String,
        required: true,
        enum: ['ethnic', 'western', 'fusion'],
    },
    type: {
        type: String,
        required: true,
        // e.g. shirt, kurta, lehenga, blouse, trousers, suit, sherwani, dress, saree_blouse
    },
    description: {
        type: String,
        default: '',
    },
    baseImage: {
        type: String,
        default: '',
    },
    images: [{
        type: String,
    }],
    designOptions: {
        collarTypes: [{ type: String }],
        sleeveStyles: [{ type: String }],
        necklineTypes: [{ type: String }],
        fitTypes: [{ type: String }],
        embroideryOptions: [{ type: String }],
        fabricTypes: [{ type: String }],
    },
    measurementFields: [{
        name: { type: String, required: true },
        label: { type: String, required: true },
        unit: { type: String, default: 'inches' },
        required: { type: Boolean, default: true },
        helpText: { type: String, default: '' },
    }],
    priceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

productSchema.index({ category: 1, subCategory: 1, type: 1 });

module.exports = mongoose.model('Product', productSchema);
