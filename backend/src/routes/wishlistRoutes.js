const express = require('express');
const router  = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/',          getWishlist);
router.post('/:gameId',  toggleWishlist);

module.exports = router;