const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tailorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true, // One review per order
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5,
    },
    text: {
        type: String,
        maxlength: [1000, 'Review cannot exceed 1000 characters'],
        default: '',
    },
    photos: [{
        type: String, // Cloudinary URLs
    }],
    isFlagged: {
        type: Boolean,
        default: false,
    },
    flagReason: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

reviewSchema.index({ tailorId: 1, createdAt: -1 });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (tailorId) {
    const TailorProfile = require('./TailorProfile');
    const stats = await this.aggregate([
        { $match: { tailorId: tailorId } },
        { $group: { _id: '$tailorId', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
        await TailorProfile.findOneAndUpdate(
            { userId: tailorId },
            { averageRating: Math.round(stats[0].averageRating * 10) / 10, totalReviews: stats[0].totalReviews }
        );
    } else {
        await TailorProfile.findOneAndUpdate(
            { userId: tailorId },
            { averageRating: 0, totalReviews: 0 }
        );
    }
};

// Recalculate after save/remove
reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.tailorId);
});
reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) doc.constructor.calcAverageRating(doc.tailorId);
});

module.exports = mongoose.model('Review', reviewSchema);
