const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');



// ══════════════════════════════════════════════════════
// GET WISHLIST USER
// GET /api/wishlist
// ══════════════════════════════════════════════════════
const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        game: {
          include: {
            genre: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    return successResponse(res, wishlist);

  } catch (error) {
    console.error('GetWishlist error:', error);
    return errorResponse(res, 'Gagal mengambil wishlist.');
  }
};

// ══════════════════════════════════════════════════════
// TOGGLE WISHLIST (add kalau belum ada, remove kalau sudah)
// POST /api/wishlist/:gameId
// ══════════════════════════════════════════════════════
const toggleWishlist = async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const userId = req.user.id;

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return errorResponse(res, 'Game tidak ditemukan.', 404);

    const existing = await prisma.wishlist.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { userId_gameId: { userId, gameId } },
      });
      return successResponse(res, { wishlisted: false }, 'Game dihapus dari wishlist.');
    } else {
      await prisma.wishlist.create({ data: { userId, gameId } });
      return successResponse(res, { wishlisted: true }, 'Game ditambahkan ke wishlist!', 201);
    }

  } catch (error) {
    console.error('ToggleWishlist error:', error);
    return errorResponse(res, 'Gagal mengubah wishlist.');
  }
};

module.exports = { getWishlist, toggleWishlist };