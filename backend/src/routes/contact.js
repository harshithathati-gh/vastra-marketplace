const express = require('express');
const router = express.Router();
const { submitContactMessage, getContactMessages, updateMessageStatus } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitContactMessage);
router.get('/', protect, authorize('admin'), getContactMessages);
router.patch('/:id/status', protect, authorize('admin'), updateMessageStatus);

module.exports = router;
