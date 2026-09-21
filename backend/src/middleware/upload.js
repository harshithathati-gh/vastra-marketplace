const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage for portfolio images
const portfolioStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vastra/portfolio',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    },
});

// Storage for review photos & videos
const reviewStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vastra/reviews',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm'],
    },
});

// Storage for reference images (order)
const orderStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vastra/orders',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
});

// Storage for avatar
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vastra/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
    },
});

// Storage for verification documents
const docStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vastra/verification',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
});

// File size limit: 5MB
const limits = { fileSize: 5 * 1024 * 1024 };

const uploadPortfolio = multer({ storage: portfolioStorage, limits });
const uploadReview = multer({ storage: reviewStorage, limits: { fileSize: 50 * 1024 * 1024 } });
const uploadOrder = multer({ storage: orderStorage, limits });
const uploadAvatar = multer({ storage: avatarStorage, limits });
const uploadDoc = multer({ storage: docStorage, limits });

module.exports = { uploadPortfolio, uploadReview, uploadOrder, uploadAvatar, uploadDoc };
