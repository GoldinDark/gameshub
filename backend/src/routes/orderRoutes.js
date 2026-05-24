const express = require('express');
const router  = express.Router();
const { checkout, getOrderHistory, getLibrary, topUp } = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/checkout', checkout);
router.post('/topup',    topUp);
router.get('/',          getOrderHistory);
router.get('/library',   getLibrary);

module.exports = router;