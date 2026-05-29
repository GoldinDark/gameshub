const express = require('express');
const router  = express.Router();
const {
  generateQris,
  checkStatus,
  confirmPayment,
  getPaymentInfo,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

// Public — tidak butuh login (diakses dari HP saat scan)
router.get('/:paymentId',           getPaymentInfo);
router.post('/confirm/:paymentId',  confirmPayment);

// Protected — butuh token
router.post('/generate',            authenticate, generateQris);
router.get('/status/:paymentId',    authenticate, checkStatus);

module.exports = router;