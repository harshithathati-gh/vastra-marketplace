const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Product = require('../models/Product');
const PlatformSettings = require('../models/PlatformSettings');

// ========= DASHBOARD =========

// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
    try {
        const [totalCustomers, totalTailors, totalOrders, pendingVerifications, openDisputes, totalRevenue] = await Promise.all([
            User.countDocuments({ role: 'customer', isActive: true }),
            User.countDocuments({ role: 'tailor', isActive: true }),
            Order.countDocuments(),
            TailorProfile.countDocuments({ verificationStatus: 'pending' }),
            Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } }),
            Order.aggregate([
                { $match: { status: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$platformCommission' } } },
            ]),
        ]);

        // Recent orders
        const recentOrders = await Order.find()
            .populate('customerId', 'name')
            .populate('tailorId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            stats: {
                totalCustomers,
                totalTailors,
                totalOrders,
                pendingVerifications,
                openDisputes,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalCommission: totalRevenue[0]?.commission || 0,
                ordersByStatus,
            },
            recentOrders,
        });
    } catch (error) {
        next(error);
    }
};

// ========= USER MANAGEMENT =========

// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const { role, search, isActive, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ success: true, total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), users });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // If deactivating tailor, also deactivate profile
        if (user.role === 'tailor') {
            await TailorProfile.findOneAndUpdate({ userId: user._id }, { isActive });
        }

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// ========= TAILOR VERIFICATION =========

// @route   GET /api/admin/tailors/pending
exports.getPendingTailors = async (req, res, next) => {
    try {
        const tailors = await TailorProfile.find({ verificationStatus: 'pending' })
            .populate('userId', 'name email phone location createdAt')
            .sort({ createdAt: 1 });

        res.json({ success: true, count: tailors.length, tailors });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/admin/tailors/:id/verify
exports.verifyTailor = async (req, res, next) => {
    try {
        const { status, rejectionReason } = req.body; // 'approved' or 'rejected'
        const updates = { verificationStatus: status };
        if (status === 'rejected') updates.rejectionReason = rejectionReason || '';

        const tailor = await TailorProfile.findByIdAndUpdate(req.params.id, updates, { new: true })
            .populate('userId', 'name email');

        if (!tailor) return res.status(404).json({ success: false, message: 'Tailor not found' });

        res.json({ success: true, tailor });
    } catch (error) {
        next(error);
    }
};

// ========= ORDER MANAGEMENT =========

// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('customerId', 'name email phone')
            .populate('tailorId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ success: true, total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), orders });
    } catch (error) {
        next(error);
    }
};

// ========= DISPUTE MANAGEMENT =========

// @route   GET /api/admin/disputes
exports.getDisputes = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const disputes = await Dispute.find(filter)
            .populate('orderId')
            .populate('raisedBy', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: disputes.length, disputes });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/admin/disputes/:id
exports.resolveDispute = async (req, res, next) => {
    try {
        const { status, adminNotes, resolution, refundAmount } = req.body;
        const dispute = await Dispute.findByIdAndUpdate(
            req.params.id,
            { status, adminNotes, resolution, refundAmount, resolvedAt: status === 'resolved' || status === 'refunded' ? new Date() : undefined },
            { new: true }
        ).populate('orderId raisedBy');

        if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

        // If refunded, update order status
        if (status === 'refunded' && dispute.orderId) {
            await Order.findByIdAndUpdate(dispute.orderId._id, { status: 'disputed' });
        }

        res.json({ success: true, dispute });
    } catch (error) {
        next(error);
    }
};

// ========= REVIEW MODERATION =========

// @route   GET /api/admin/reviews/flagged
exports.getFlaggedReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ isFlagged: true })
            .populate('customerId', 'name email')
            .populate('tailorId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/admin/reviews/:id/unflag
exports.unflagReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { isFlagged: false, flagReason: '' }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

// ========= PRODUCT MANAGEMENT =========

// @route   POST /api/admin/products
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/admin/products/:id
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Product deactivated' });
    } catch (error) {
        next(error);
    }
};

// ========= PLATFORM SETTINGS =========

// @route   GET /api/admin/settings
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({});
        }
        res.json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/admin/settings
exports.updateSettings = async (req, res, next) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create(req.body);
        } else {
            Object.assign(settings, req.body);
            await settings.save();
        }
        res.json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};

// ========= FINANCE LEDGER =========

// @route   GET /api/admin/finance
exports.getFinanceLedger = async (req, res, next) => {
    try {
        const orders = await Order.find({ isEscrowFunded: true })
            .populate('tailorId', 'name email')
            .populate('customerId', 'name email')
            .sort({ updatedAt: -1 });

        let escrowHeld = 0;
        let totalPaidOutToTailors = 0;
        let platformEarnings = 0;

        const ledgerItems = orders.map(order => {
            const hasCommission = order.platformCommission > 0;
            const comm = order.platformCommission || 0;

            if (order.escrowStatus === 'held') {
                escrowHeld += order.totalAmount;
            } else if (order.escrowStatus === 'released') {
                const payout = order.totalAmount - comm;
                totalPaidOutToTailors += payout;
                platformEarnings += comm;
            }

            return {
                id: order._id,
                totalAmount: order.totalAmount,
                commission: comm,
                tailorPayout: order.totalAmount - comm,
                escrowStatus: order.escrowStatus,
                tailorName: order.tailorId?.name || 'Unknown',
                customerName: order.customerId?.name || 'Unknown',
                date: order.updatedAt
            };
        });

        res.json({
            success: true,
            summary: {
                escrowHeld,
                totalPaidOutToTailors,
                platformEarnings
            },
            ledger: ledgerItems
        });
    } catch (error) {
        next(error);
    }
};
