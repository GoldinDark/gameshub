const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');



// ══════════════════════════════════════════════════════
// GET CART USER
// GET /api/cart
// ══════════════════════════════════════════════════════
const getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findMany({
      where: { userId: req.user.id },
      include: {
        game: {
          include: {
            genre: { select: { name: true, slug: true } },
          },
        },
      },
    });

    const total = cart.reduce((sum, item) => {
      const harga = item.game.price - (item.game.price * item.game.discount / 100);
      return sum + harga;
    }, 0);

    return successResponse(res, { cart, total });

  } catch (error) {
    console.error('GetCart error:', error);
    return errorResponse(res, 'Gagal mengambil data cart.');
  }
};

// ══════════════════════════════════════════════════════
// ADD TO CART
// POST /api/cart/:gameId
// ══════════════════════════════════════════════════════
const addToCart = async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const userId = req.user.id;

    // ── Cek game ada ───────────────────────────────────
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return errorResponse(res, 'Game tidak ditemukan.', 404);

    // ── Cek sudah di library (sudah dibeli) ────────────
    const owned = await prisma.library.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    if (owned) return errorResponse(res, 'Kamu sudah memiliki game ini.', 400);

    // ── Cek sudah di cart ──────────────────────────────
    const existing = await prisma.cart.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    if (existing) return errorResponse(res, 'Game sudah ada di cart.', 400);

    const cart = await prisma.cart.create({
      data: { userId, gameId },
      include: { game: true },
    });

    return successResponse(res, cart, 'Game berhasil ditambahkan ke cart!', 201);

  } catch (error) {
    console.error('AddToCart error:', error);
    return errorResponse(res, 'Gagal menambahkan ke cart.');
  }
};

// ══════════════════════════════════════════════════════
// REMOVE FROM CART
// DELETE /api/cart/:gameId
// ══════════════════════════════════════════════════════
const removeFromCart = async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const userId = req.user.id;

    const item = await prisma.cart.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    if (!item) return errorResponse(res, 'Game tidak ada di cart.', 404);

    await prisma.cart.delete({
      where: { userId_gameId: { userId, gameId } },
    });

    return successResponse(res, null, 'Game berhasil dihapus dari cart.');

  } catch (error) {
    console.error('RemoveFromCart error:', error);
    return errorResponse(res, 'Gagal menghapus dari cart.');
  }
};

// ══════════════════════════════════════════════════════
// CLEAR CART
// DELETE /api/cart
// ══════════════════════════════════════════════════════
const clearCart = async (req, res) => {
  try {
    await prisma.cart.deleteMany({ where: { userId: req.user.id } });
    return successResponse(res, null, 'Cart berhasil dikosongkan.');
  } catch (error) {
    console.error('ClearCart error:', error);
    return errorResponse(res, 'Gagal mengosongkan cart.');
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };