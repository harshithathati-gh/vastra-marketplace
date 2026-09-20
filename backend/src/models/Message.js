const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        maxlength: 2000,
        default: '',
    },
    imageUrl: {
        type: String,
        default: '',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

messageSchema.index({ orderId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
