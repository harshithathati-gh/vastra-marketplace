const mongoose = require('mongoose');

const tailorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: '',
    },
    specializations: [{
        type: String,
        enum: ['men_ethnic', 'men_western', 'women_ethnic', 'women_western', 'kids', 'bridal', 'uniforms', 'alterations', 'embroidery', 'designer'],
    }],
    experience: {
        type: Number,
        min: 0,
        max: 60,
        default: 0,
    },
    serviceArea: [{
        type: String,
        trim: true,
    }],
    startingPrices: {
        shirt: { type: Number, default: 0 },
        trousers: { type: Number, default: 0 },
        kurta: { type: Number, default: 0 },
        kurti: { type: Number, default: 0 },
        suit: { type: Number, default: 0 },
        lehenga: { type: Number, default: 0 },
        blouse: { type: Number, default: 0 },
        sherwani: { type: Number, default: 0 },
        saree_blouse: { type: Number, default: 0 },
        dress: { type: Number, default: 0 },
    },
    portfolio: [{
        imageUrl: { type: String, required: true },
        publicId: { type: String }, // Cloudinary public ID for deletion
        caption: { type: String, default: '' },
        category: { type: String, default: 'general' },
        uploadedAt: { type: Date, default: Date.now },
    }],
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    verificationDocs: [{
        type: String, // Cloudinary URLs
    }],
    rejectionReason: {
        type: String,
        default: '',
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    totalOrders: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Index for search queries
tailorProfileSchema.index({ specializations: 1 });
tailorProfileSchema.index({ averageRating: -1 });
tailorProfileSchema.index({ 'userId': 1 });

module.exports = mongoose.model('TailorProfile', tailorProfileSchema);
