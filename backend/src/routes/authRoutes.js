const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
} = require('../controllers/authController');

const { authenticate } = require('../middleware/authMiddleware');

// ── Public routes ──────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ── Protected routes (butuh token) ────────────────────
router.get('/me',                   authenticate, getMe);
router.put('/change-password',      authenticate, changePassword);

module.exports = router;