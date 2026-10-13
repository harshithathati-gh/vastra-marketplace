const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const { validationResult } = require('express-validator');
const { sendWelcomeEmail, sendOtpEmail } = require('../services/notificationService');

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

        // Send welcome email asynchronously (non-blocking)
        sendWelcomeEmail({ to: user.email, name: user.name, role: user.role }).catch(err => {
            console.error('Failed to send welcome email:', err.message);
        });

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

// @route   POST /api/auth/send-otp
exports.sendOtp = async (req, res, next) => {
    try {
        const { email, purpose = 'verification' } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.otpPurpose = purpose;
        await user.save({ validateBeforeSave: false });

        await sendOtpEmail({
            to: user.email,
            name: user.name,
            otp,
            purpose: purpose === 'password_reset' ? 'Password Reset' : 'Account Verification',
        });

        res.json({
            success: true,
            message: `OTP sent successfully to ${email}`,
            // In dev environment or mock mode, include OTP for easy testing
            ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp, purpose = 'verification' } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email }).select('+otpCode +otpExpire +otpPurpose');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otpCode || user.otpCode !== otp.trim()) {
            return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        }

        if (!user.otpExpire || user.otpExpire < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (purpose === 'verification' || purpose === 'email_verification') {
            user.isEmailVerified = true;
        }

        user.otpCode = undefined;
        user.otpExpire = undefined;
        user.otpPurpose = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'OTP verified successfully',
            isEmailVerified: user.isEmailVerified,
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        user.otpPurpose = 'password_reset';
        await user.save({ validateBeforeSave: false });

        await sendOtpEmail({
            to: user.email,
            name: user.name,
            otp,
            purpose: 'Password Reset',
        });

        res.json({
            success: true,
            message: 'Password reset OTP sent to your email',
            ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ email }).select('+password +otpCode +otpExpire +otpPurpose');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otpCode || user.otpCode !== otp.trim()) {
            return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        }

        if (!user.otpExpire || user.otpExpire < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        user.password = newPassword;
        user.otpCode = undefined;
        user.otpExpire = undefined;
        user.otpPurpose = undefined;
        await user.save();

        const token = user.getSignedJwtToken();
        res.json({
            success: true,
            token,
            message: 'Password reset successfully. You are now logged in.',
        });
    } catch (error) {
        next(error);
    }
};

