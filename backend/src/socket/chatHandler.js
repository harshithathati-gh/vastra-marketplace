const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const setupSocket = (io) => {
    // Authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.userId}`);

        // Join personal room for notifications
        socket.join(`user_${socket.userId}`);

        // Join order chat room
        socket.on('joinOrder', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`User ${socket.userId} joined order room: ${orderId}`);
        });

        // Leave order chat room
        socket.on('leaveOrder', (orderId) => {
            socket.leave(`order_${orderId}`);
        });

        // Handle sending messages in real-time
        socket.on('sendMessage', async (data) => {
            try {
                const { orderId, content, receiverId, imageUrl } = data;

                const message = await Message.create({
                    orderId,
                    senderId: socket.userId,
                    receiverId,
                    content,
                    imageUrl: imageUrl || '',
                });

                const populated = await message.populate('senderId', 'name avatar');

                // Emit to order room and receiver personal room
                io.to(`order_${orderId}`).emit('newMessage', populated);
                io.to(`user_${receiverId}`).emit('newMessage', populated);
            } catch (error) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Mark messages as read
        socket.on('markRead', async ({ orderId }) => {
            try {
                await Message.updateMany(
                    { orderId, receiverId: socket.userId, isRead: false },
                    { isRead: true }
                );
                io.to(`order_${orderId}`).emit('messagesRead', { orderId, userId: socket.userId });
            } catch (error) {
                socket.emit('error', { message: 'Failed to mark messages read' });
            }
        });

        // Typing indicators
        socket.on('typing', ({ orderId }) => {
            socket.to(`order_${orderId}`).emit('userTyping', { userId: socket.userId, orderId });
        });

        socket.on('stopTyping', ({ orderId }) => {
            socket.to(`order_${orderId}`).emit('userStopTyping', { userId: socket.userId, orderId });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.userId}`);
        });
    });
};

module.exports = { setupSocket };
