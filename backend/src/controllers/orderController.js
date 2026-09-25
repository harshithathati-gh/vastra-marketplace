const Order = require('../models/Order');
const TailorProfile = require('../models/TailorProfile');
const PlatformSettings = require('../models/PlatformSettings');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
    try {
        const { tailorId, measurementProfileName, fabricPreference, specialInstructions, deliveryType, preferredDeliveryDate } = req.body;

        // When using FormData, complex objects come as strings. We must parse them if necessary.
        let product = typeof req.body.product === 'string' ? JSON.parse(req.body.product) : req.body.product;
        const measurements = typeof req.body.measurements === 'string' ? JSON.parse(req.body.measurements) : req.body.measurements;
        let deliveryAddress = typeof req.body.deliveryAddress === 'string' ? JSON.parse(req.body.deliveryAddress) : (req.body.deliveryAddress || {});

        if (deliveryType === 'self_pickup') {
            deliveryAddress = {
                street: deliveryAddress.street || 'Self Pickup at Tailor Workshop',
                city: deliveryAddress.city || 'Self Pickup',
                state: deliveryAddress.state || 'N/A',
                pincode: deliveryAddress.pincode || '000000',
            };
        }

        // Handle Cloudinary file uploads
        if (req.files && req.files.length > 0) {
            product.referenceImages = req.files.map(file => file.path);
        }

        // Verify tailor exists and is approved
        const tailor = await TailorProfile.findOne({ userId: tailorId, verificationStatus: 'approved', isActive: true });
        if (!tailor) {
            return res.status(400).json({ success: false, message: 'Tailor not found or not verified' });
        }

        const order = await Order.create({
            customerId: req.user._id,
            tailorId,
            product,
            measurements,
            measurementProfileName,
            fabricPreference,
            specialInstructions,
            deliveryAddress,
            deliveryType,
            preferredDeliveryDate,
            status: 'placed',
            statusHistory: [{ status: 'placed', note: 'Order placed by customer' }],
        });

        // Notify tailor via socket if online
        const io = req.app.get('io');
        io.to(`user_${tailorId}`).emit('newOrder', { orderId: order._id, message: 'New order received!' });

        res.status(201).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};

        // Show orders based on role
        if (req.user.role === 'customer') {
            filter.customerId = req.user._id;
        } else if (req.user.role === 'tailor') {
            filter.tailorId = req.user._id;
        }

        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('customerId', 'name email phone avatar location')
            .populate('tailorId', 'name email phone avatar location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: orders.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            orders,
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customerId', 'name email phone avatar location')
            .populate('tailorId', 'name email phone avatar location');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only allow customer or tailor of this order (or admin)
        if (req.user.role !== 'admin' &&
            order.customerId._id.toString() !== req.user._id.toString() &&
            order.tailorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note, trackingNumber, estimatedDelivery } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only tailor can update status (except customer cancellation)
        if (req.user.role === 'tailor' && order.tailorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Validate status transitions
        const validTransitions = {
            placed: ['accepted', 'rejected'],
            accepted: ['in_progress'],
            quoted: ['in_progress'],
            in_progress: ['shipped'],
            shipped: ['delivered'],
        };

        if (req.user.role === 'customer') {
            // Customer can only cancel placed orders
            if (order.status !== 'placed' || status !== 'cancelled') {
                return res.status(400).json({ success: false, message: 'You can only cancel orders that are in placed status' });
            }
        } else {
            if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
                return res.status(400).json({ success: false, message: `Cannot transition from ${order.status} to ${status}` });
            }
        }

        order.status = status;
        order.statusHistory.push({ status, note: note || '' });

        if (status === 'rejected') order.rejectReason = req.body.rejectReason || '';
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

        // Update tailor total orders on delivery
        if (status === 'delivered') {
            await TailorProfile.findOneAndUpdate(
                { userId: order.tailorId },
                { $inc: { totalOrders: 1 } }
            );
        }

        await order.save();

        // Notify via socket
        const io = req.app.get('io');
        const targetUserId = req.user.role === 'tailor' ? order.customerId : order.tailorId;
        io.to(`user_${targetUserId}`).emit('orderUpdate', {
            orderId: order._id,
            status,
            message: `Order status updated to ${status}`,
        });

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/orders/:id/quote
exports.sendQuote = async (req, res, next) => {
    try {
        const { quotedPrice, shippingCost, estimatedDelivery } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.tailorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (order.status !== 'accepted' && order.status !== 'placed') {
            return res.status(400).json({ success: false, message: 'Can only quote on accepted or placed orders' });
        }

        order.quotedPrice = quotedPrice;
        order.shippingCost = shippingCost || 0;
        order.totalAmount = quotedPrice + (shippingCost || 0);
        order.estimatedDelivery = estimatedDelivery;
        order.status = 'quoted';
        order.statusHistory.push({ status: 'quoted', note: `Price quoted: ₹${quotedPrice}` });

        await order.save();

        // Notify customer
        const io = req.app.get('io');
        io.to(`user_${order.customerId}`).emit('orderUpdate', {
            orderId: order._id,
            status: 'quoted',
            message: `Tailor has quoted ₹${quotedPrice} for your order`,
        });

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/orders/:id/pay
exports.initiatePayment = async (req, res, next) => {
    try {
        const { paymentType } = req.body; // 'advance' or 'balance'
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Get platform settings
        let settings = await PlatformSettings.findOne();
        if (!settings) settings = { advancePercentage: 50, commissionPercentage: 10 };

        let amount;
        if (paymentType === 'advance') {
            amount = Math.round((order.totalAmount * settings.advancePercentage) / 100);
        } else if (paymentType === 'escrow') {
            amount = order.totalAmount;
        } else {
            amount = order.totalAmount - order.advancePaid;
        }

        // --- MOCK GATEWAY BYPASS ---
        // Instead of calling: await razorpay.orders.create({ ... })
        const razorpayOrder = {
            id: `mock_order_${order._id}_${Date.now()}`
        };

        // Store payment record
        order.payments.push({
            razorpayOrderId: razorpayOrder.id,
            amount,
            type: paymentType,
            status: 'created',
        });
        await order.save();

        res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        if (error.error && error.error.description) {
            return res.status(500).json({ success: false, message: 'Razorpay API rejected: ' + error.error.description });
        }
        if (error.statusCode) {
            return res.status(500).json({ success: false, message: 'Razorpay API crashed. Code: ' + error.statusCode });
        }
        next(error);
    }
};

// @route   POST /api/orders/:id/verify-payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature (or accept MOCK bypass)
        let isAuthentic = false;

        if (razorpay_signature === 'mock_signature') {
            isAuthentic = true;
        } else {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret')
                .update(body.toString())
                .digest('hex');
            isAuthentic = expectedSignature === razorpay_signature;
        }

        if (!isAuthentic) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const order = await Order.findById(req.params.id);
        const payment = order.payments.find((p) => p.razorpayOrderId === razorpay_order_id);
        if (payment) {
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.status = 'paid';
            payment.paidAt = new Date();

            if (payment.type === 'escrow') {
                order.isEscrowFunded = true;
                order.escrowStatus = 'held';
                if (order.status === 'quoted') {
                    order.status = 'in_progress';
                    order.statusHistory.push({ status: 'in_progress', note: '100% Escrow securely funded via Razorpay' });
                }
            } else if (payment.type === 'advance') {
                order.advancePaid = payment.amount;
                // Auto-move to in_progress after advance payment
                if (order.status === 'quoted') {
                    order.status = 'in_progress';
                    order.statusHistory.push({ status: 'in_progress', note: 'Advance payment received' });
                }
            } else {
                order.balancePaid = payment.amount;
            }

            // Calculate platform commission
            let settings = await PlatformSettings.findOne();
            if (!settings) settings = { commissionPercentage: 10 };
            order.platformCommission = Math.round((order.totalAmount * settings.commissionPercentage) / 100);

            await order.save();
        }

        res.json({ success: true, message: 'Payment verified successfully', order });
    } catch (error) {
        next(error);
    }
};
