const express  = require('express');
const router   = express.Router();
const {
  generateQris,
  checkStatus,
  confirmPayment,
  getPaymentInfo,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

// Public — untuk halaman konfirmasi saat scan QR
router.get('/:paymentId',            getPaymentInfo);
router.post('/confirm/:paymentId',   confirmPayment);

// Protected — generate QR butuh login
router.post('/generate',   authenticate, generateQris);
router.get('/status/:paymentId', authenticate, checkStatus);

module.exports = router;