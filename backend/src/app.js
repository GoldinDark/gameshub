const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes   = require('./routes/authRoutes');
const gameRoutes   = require('./routes/gameRoutes');
const userRoutes   = require('./routes/userRoutes');
const orderRoutes  = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes     = require('./routes/cartRoutes');     // tambah
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

// ── Middleware Global ──────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static folder untuk gambar upload ─────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/games',   gameRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart',     cartRoutes);      // tambah
app.use('/api/wishlist', wishlistRoutes);

// ── Health check ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎮 GameStore API is running!',
    version: '1.0.0',
  });
});

// ── 404 Handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;