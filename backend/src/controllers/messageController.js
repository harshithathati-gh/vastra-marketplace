const Message = require('../models/Message');
const Order = require('../models/Order');

// @route   GET /api/messages/:orderId
exports.getMessages = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only customer or tailor of this order
        if (order.customerId.toString() !== req.user._id.toString() &&
            order.tailorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const messages = await Message.find({ orderId: req.params.orderId })
            .populate('senderId', 'name avatar')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { orderId: req.params.orderId, receiverId: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/messages
exports.sendMessage = async (req, res, next) => {
    try {
        const { orderId, content, imageUrl } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Determine receiver
        const receiverId = order.customerId.toString() === req.user._id.toString()
            ? order.tailorId
            : order.customerId;

        const message = await Message.create({
            orderId,
            senderId: req.user._id,
            receiverId,
            content,
            imageUrl: imageUrl || '',
        });

        await message.populate('senderId', 'name avatar');

        // Emit via socket
        const io = req.app.get('io');
        io.to(`user_${receiverId}`).emit('newMessage', message);
        io.to(`order_${orderId}`).emit('newMessage', message);

        res.status(201).json({ success: true, message });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/messages/conversations
exports.getConversations = async (req, res, next) => {
    try {
        // Get all unique order conversations for this user
        const filter = {
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
        };

        const conversations = await Message.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$orderId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$receiverId', req.user._id] }, { $eq: ['$isRead', false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { 'lastMessage.createdAt': -1 } },
            { $limit: 50 },
        ]);

        // Populate order and user details
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const order = await Order.findById(conv._id)
                    .populate('customerId', 'name avatar')
                    .populate('tailorId', 'name avatar');
                return {
                    orderId: conv._id,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount,
                    order: order ? {
                        product: order.product,
                        status: order.status,
                        customer: order.customerId,
                        tailor: order.tailorId,
                    } : null,
                };
            })
        );

        res.json({ success: true, conversations: populatedConversations });
    } catch (error) {
        next(error);
    }
};
