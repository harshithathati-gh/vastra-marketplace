const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/:orderId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
