const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus, sendQuote, initiatePayment, verifyPayment } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { uploadOrder } = require('../middleware/upload');

router.post('/', protect, authorize('customer'), uploadOrder.array('referenceImages', 5), createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/quote', protect, authorize('tailor'), sendQuote);
router.post('/:id/pay', protect, authorize('customer'), initiatePayment);
router.post('/:id/verify-payment', protect, authorize('customer'), verifyPayment);

module.exports = router;
