const Review = require('../models/Review');
const Order = require('../models/Order');

// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
    try {
        const { orderId, rating, text } = req.body;

        // Verify order exists and belongs to customer
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (order.status !== 'delivered') {
            return res.status(400).json({ success: false, message: 'Can only review delivered orders' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ orderId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You already reviewed this order' });
        }

        const photos = req.files ? req.files.map((f) => f.path) : [];

        const review = await Review.create({
            customerId: req.user._id,
            tailorId: order.tailorId,
            orderId,
            rating,
            text,
            photos,
        });

        await review.populate('customerId', 'name avatar');

        res.status(201).json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/reviews/tailor/:tailorId
exports.getTailorReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

        let sort = {};
        switch (sortBy) {
            case 'highest': sort = { rating: -1, createdAt: -1 }; break;
            case 'lowest': sort = { rating: 1, createdAt: -1 }; break;
            default: sort = { createdAt: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const filter = { tailorId: req.params.tailorId, isFlagged: false };
        const total = await Review.countDocuments(filter);
        const reviews = await Review.find(filter)
            .populate('customerId', 'name avatar')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Rating distribution
        const distribution = await Review.aggregate([
            { $match: { tailorId: require('mongoose').Types.ObjectId.createFromHexString(req.params.tailorId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            count: reviews.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            distribution,
            reviews,
        });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/reviews/:id
exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        if (review.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { rating, text } = req.body;
        if (rating) review.rating = rating;
        if (text !== undefined) review.text = text;
        if (req.files && req.files.length > 0) {
            const newPhotos = req.files.map((f) => f.path);
            review.photos.push(...newPhotos);
        }

        await review.save();
        res.json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        if (review.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/reviews/:id/flag
exports.flagReview = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isFlagged: true, flagReason: reason || 'Reported by user' },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.json({ success: true, message: 'Review flagged for moderation' });
    } catch (error) {
        next(error);
    }
};
