const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getDashboard, getUsers, updateUser,
    getPendingTailors, verifyTailor,
    getAllOrders,
    getDisputes, resolveDispute,
    getFlaggedReviews, deleteReview, unflagReview,
    createProduct, updateProduct, deleteProduct,
    getSettings, updateSettings,
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);

// User management
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);

// Tailor verification
router.get('/tailors/pending', getPendingTailors);
router.patch('/tailors/:id/verify', verifyTailor);

// Order management
router.get('/orders', getAllOrders);

// Dispute management
router.get('/disputes', getDisputes);
router.patch('/disputes/:id', resolveDispute);

// Review moderation
router.get('/reviews/flagged', getFlaggedReviews);
router.delete('/reviews/:id', deleteReview);
router.patch('/reviews/:id/unflag', unflagReview);

// Product catalog management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Platform settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
