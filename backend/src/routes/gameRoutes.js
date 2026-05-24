const express = require('express');
const router  = express.Router();

const {
  getAllGames,
  getGameBySlug,
  createGame,
  updateGame,
  deleteGame,
  addScreenshots,
  getAllGenres,
} = require('../controllers/gameController');

const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const { uploadThumbnail, uploadScreenshots } = require('../utils/multer');

// ── Public routes ──────────────────────────────────────
router.get('/',          getAllGames);
router.get('/genres',    getAllGenres);
router.get('/:slug',     getGameBySlug);

// ── Admin only routes ──────────────────────────────────
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  uploadThumbnail.single('thumbnail'),
  createGame
);

router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  uploadThumbnail.single('thumbnail'),
  updateGame
);

router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  deleteGame
);

router.post(
  '/:id/screenshots',
  authenticate,
  authorizeAdmin,
  uploadScreenshots.array('screenshots', 10),
  addScreenshots
);

module.exports = router;