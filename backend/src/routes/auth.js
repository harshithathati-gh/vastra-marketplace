const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, updatePassword, updateAvatar, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['customer', 'tailor']).withMessage('Role must be customer or tailor'),
], register);

router.post('/login', login);

router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.put('/avatar', protect, uploadAvatar.single('avatar'), updateAvatar);
router.delete('/account', protect, deleteAccount);

module.exports = router;
