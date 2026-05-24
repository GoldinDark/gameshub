const express = require('express');
const router  = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate); // semua route cart butuh login

router.get('/',           getCart);
router.post('/:gameId',   addToCart);
router.delete('/:gameId', removeFromCart);
router.delete('/',        clearCart);

module.exports = router;