const express = require('express');
const router = express.Router();
const { getColors, createColor } = require('../controllers/colorController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getColors)
    .post(protect, authorize('admin'), createColor);

module.exports = router;
