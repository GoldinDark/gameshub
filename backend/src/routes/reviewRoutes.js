const express  = require('express');
const router   = express.Router();
const { createReview } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, createReview);

module.exports = router;