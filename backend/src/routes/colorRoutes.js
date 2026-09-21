const express = require('express');
const router = express.Router();
const { getColors, createColor } = require('../controllers/colorController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(getColors)
    .post(protect, admin, createColor);

module.exports = router;
