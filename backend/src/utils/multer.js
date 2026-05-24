const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');

// ── Storage Thumbnail ──────────────────────────────────
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/thumbnails/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `thumb_${uuidv4()}${ext}`);
  },
});

// ── Storage Screenshot ─────────────────────────────────
const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/screenshots/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `screen_${uuidv4()}${ext}`);
  },
});

// ── Filter hanya gambar ────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan (jpg, png, webp)'));
  }
};

const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

const uploadScreenshots = multer({
  storage: screenshotStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadThumbnail, uploadScreenshots };