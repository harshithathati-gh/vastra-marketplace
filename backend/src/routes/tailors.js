const express = require('express');
const router = express.Router();
const { getTailors, getTailor, updateProfile, addPortfolioImage, removePortfolioImage, uploadVerificationDocs } = require('../controllers/tailorController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPortfolio, uploadDoc } = require('../middleware/upload');

router.get('/', getTailors);
router.get('/:id', getTailor);

// Tailor-only routes
router.put('/profile', protect, authorize('tailor'), updateProfile);
router.post('/portfolio', protect, authorize('tailor'), uploadPortfolio.single('image'), addPortfolioImage);
router.delete('/portfolio/:imageId', protect, authorize('tailor'), removePortfolioImage);
router.post('/verification-docs', protect, authorize('tailor'), uploadDoc.array('documents', 3), uploadVerificationDocs);

module.exports = router;
