const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
    },
    raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: [true, 'Dispute reason is required'],
        enum: ['quality_issue', 'wrong_product', 'delayed_delivery', 'measurement_mismatch', 'not_received', 'other'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 2000,
    },
    evidencePhotos: [{
        type: String, // Cloudinary URLs
    }],
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'refunded'],
        default: 'open',
    },
    adminNotes: {
        type: String,
        default: '',
    },
    resolution: {
        type: String,
        default: '',
    },
    refundAmount: {
        type: Number,
        default: 0,
    },
    resolvedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

disputeSchema.index({ status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
