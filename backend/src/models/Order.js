const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    product: {
        type: { type: String, required: true },
        name: { type: String, required: true },
        designChoices: {
            collar: String,
            sleeve: String,
            neckline: String,
            fit: String,
            embroidery: String,
            fabric: String,
        },
        referenceImages: [{ type: String }], // Cloudinary URLs
    },
    measurements: {
        type: Map,
        of: Number,
        default: {},
    },
    measurementProfileName: {
        type: String,
        default: '',
    },
    fabricPreference: {
        type: String,
        enum: ['tailor_provided', 'self_provided'],
        default: 'tailor_provided',
    },
    specialInstructions: {
        type: String,
        maxlength: 1000,
        default: '',
    },
    deliveryAddress: {
        street: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    deliveryType: {
        type: String,
        enum: ['shipping', 'self_pickup'],
        default: 'shipping',
    },
    preferredDeliveryDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['placed', 'accepted', 'rejected', 'quoted', 'in_progress', 'shipped', 'delivered', 'disputed', 'cancelled'],
        default: 'placed',
    },
    rejectReason: {
        type: String,
        default: '',
    },
    quotedPrice: {
        type: Number,
        default: 0,
    },
    shippingCost: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
    advancePaid: {
        type: Number,
        default: 0,
    },
    balancePaid: {
        type: Number,
        default: 0,
    },
    platformCommission: {
        type: Number,
        default: 0,
    },
    trackingNumber: {
        type: String,
        default: '',
    },
    estimatedDelivery: {
        type: Date,
    },
    // Razorpay payment tracking
    payments: [{
        razorpayOrderId: String,
        razorpayPaymentId: String,
        amount: Number,
        type: { type: String, enum: ['advance', 'balance'] },
        status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
        paidAt: Date,
    }],
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
    }],
}, {
    timestamps: true,
});

orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ tailorId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
