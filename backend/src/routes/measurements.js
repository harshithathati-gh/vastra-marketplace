const express = require('express');
const router = express.Router();
const { getProfiles, createProfile, updateProfile, deleteProfile, getTemplate } = require('../controllers/measurementController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProfiles);
router.post('/', protect, createProfile);
router.put('/:id', protect, updateProfile);
router.delete('/:id', protect, deleteProfile);
router.get('/templates/:garmentType', getTemplate);

module.exports = router;
