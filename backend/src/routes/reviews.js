const express = require('express');
const router = express.Router();
const { createReview, getTailorReviews, updateReview, deleteReview, flagReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { uploadReview } = require('../middleware/upload');

router.post('/', protect, uploadReview.array('photos', 5), createReview);
router.get('/tailor/:tailorId', getTailorReviews);
router.put('/:id', protect, uploadReview.array('photos', 5), updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/flag', protect, flagReview);

module.exports = router;
