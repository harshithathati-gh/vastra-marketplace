const TailorProfile = require('../models/TailorProfile');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @route   GET /api/tailors
exports.getTailors = async (req, res, next) => {
    try {
        const {
            search, specialization, city, state, minRating,
            minExperience, sortBy, page = 1, limit = 12,
        } = req.query;

        // Build filter
        const filter = { verificationStatus: 'approved', isActive: true };

        if (specialization) {
            filter.specializations = { $in: specialization.split(',') };
        }
        if (minRating) {
            filter.averageRating = { $gte: parseFloat(minRating) };
        }
        if (minExperience) {
            filter.experience = { $gte: parseInt(minExperience) };
        }

        // Location filter — join with User model
        let userFilter = {};
        if (city) userFilter['location.city'] = new RegExp(city, 'i');
        if (state) userFilter['location.state'] = new RegExp(state, 'i');
        if (search) {
            userFilter['$or'] = [
                { name: new RegExp(search, 'i') },
                { 'location.city': new RegExp(search, 'i') },
            ];
        }

        // Find matching user IDs if location/search filter exists
        if (Object.keys(userFilter).length > 0) {
            userFilter.role = 'tailor';
            const users = await User.find(userFilter).select('_id');
            filter.userId = { $in: users.map((u) => u._id) };
        }

        // Sort
        let sort = {};
        switch (sortBy) {
            case 'rating': sort = { averageRating: -1 }; break;
            case 'experience': sort = { experience: -1 }; break;
            case 'reviews': sort = { totalReviews: -1 }; break;
            case 'newest': sort = { createdAt: -1 }; break;
            default: sort = { averageRating: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await TailorProfile.countDocuments(filter);
        const tailors = await TailorProfile.find(filter)
            .populate('userId', 'name email phone avatar location')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: tailors.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            tailors,
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/tailors/:id
exports.getTailor = async (req, res, next) => {
    try {
        const tailor = await TailorProfile.findOne({ userId: req.params.id, isActive: true })
            .populate('userId', 'name email phone avatar location createdAt');

        if (!tailor) {
            return res.status(404).json({ success: false, message: 'Tailor not found' });
        }

        res.json({ success: true, tailor });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/tailors/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const allowed = ['bio', 'specializations', 'experience', 'serviceArea', 'startingPrices'];
        const updates = {};
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const tailor = await TailorProfile.findOneAndUpdate(
            { userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone avatar location');

        if (!tailor) {
            return res.status(404).json({ success: false, message: 'Tailor profile not found' });
        }

        res.json({ success: true, tailor });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/tailors/portfolio
exports.addPortfolioImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image' });
        }

        const tailor = await TailorProfile.findOne({ userId: req.user._id });
        if (!tailor) {
            return res.status(404).json({ success: false, message: 'Tailor profile not found' });
        }

        tailor.portfolio.push({
            imageUrl: req.file.path,
            publicId: req.file.filename,
            caption: req.body.caption || '',
            category: req.body.category || 'general',
        });

        await tailor.save();
        res.status(201).json({ success: true, portfolio: tailor.portfolio });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/tailors/portfolio/:imageId
exports.removePortfolioImage = async (req, res, next) => {
    try {
        const tailor = await TailorProfile.findOne({ userId: req.user._id });
        if (!tailor) {
            return res.status(404).json({ success: false, message: 'Tailor profile not found' });
        }

        const image = tailor.portfolio.id(req.params.imageId);
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }

        // Delete from Cloudinary
        if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        image.deleteOne();
        await tailor.save();

        res.json({ success: true, portfolio: tailor.portfolio });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/tailors/verification-docs
exports.uploadVerificationDocs = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Please upload documents' });
        }

        const tailor = await TailorProfile.findOne({ userId: req.user._id });
        if (!tailor) {
            return res.status(404).json({ success: false, message: 'Tailor profile not found' });
        }

        const docUrls = req.files.map((f) => f.path);
        tailor.verificationDocs.push(...docUrls);
        tailor.verificationStatus = 'pending';
        await tailor.save();

        res.json({ success: true, message: 'Documents uploaded. Verification pending.', verificationDocs: tailor.verificationDocs });
    } catch (error) {
        next(error);
    }
};
