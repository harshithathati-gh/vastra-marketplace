const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const { validationResult } = require('express-validator');

// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, phone, password, role, location } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Create user
        const user = await User.create({ name, email, phone, password, role: role || 'customer', location });

        // If registering as tailor, create an empty tailor profile
        if (role === 'tailor') {
            await TailorProfile.create({ userId: user._id });
        }

        // Generate token
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                location: user.location,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = user.getSignedJwtToken();

        // If tailor, include verification status
        let tailorProfile = null;
        if (user.role === 'tailor') {
            tailorProfile = await TailorProfile.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                location: user.location,
                tailorProfile: tailorProfile ? {
                    verificationStatus: tailorProfile.verificationStatus,
                    specializations: tailorProfile.specializations,
                } : undefined,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        let tailorProfile = null;
        if (user.role === 'tailor') {
            tailorProfile = await TailorProfile.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                location: user.location,
                createdAt: user.createdAt,
                tailorProfile,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/auth/update-profile
exports.updateProfile = async (req, res, next) => {
    try {
        const updates = {};
        const allowed = ['name', 'phone', 'location'];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/auth/update-password
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        const token = user.getSignedJwtToken();
        res.json({ success: true, token, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/auth/avatar
exports.updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: req.file.path },
            { new: true }
        );

        res.json({ success: true, avatar: user.avatar });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/auth/account
exports.deleteAccount = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { isActive: false });
        res.json({ success: true, message: 'Account deactivated successfully' });
    } catch (error) {
        next(error);
    }
};
