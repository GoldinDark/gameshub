const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');



const createReview = async (req, res) => {
  try {
    const { gameId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!gameId || !rating || !comment) {
      return errorResponse(res, 'gameId, rating, dan comment wajib diisi.', 400);
    }
    if (rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating harus antara 1 - 5.', 400);
    }

    const existing = await prisma.review.findUnique({
      where: { userId_gameId: { userId, gameId: parseInt(gameId) } },
    });
    if (existing) {
      return errorResponse(res, 'Kamu sudah memberi ulasan untuk game ini.', 409);
    }

    const review = await prisma.review.create({
      data: {
        userId,
        gameId:  parseInt(gameId),
        rating:  parseInt(rating),
        comment,
      },
      include: { user: { select: { username: true } } },
    });

    // ── Update rating rata-rata game ───────────────────
    const avg = await prisma.review.aggregate({
      where:   { gameId: parseInt(gameId) },
      _avg:    { rating: true },
      _count:  { rating: true },
    });

    await prisma.game.update({
      where: { id: parseInt(gameId) },
      data: {
        rating:       avg._avg.rating || 0,
        totalReviews: avg._count.rating,
      },
    });

    return successResponse(res, review, 'Review berhasil ditambahkan!', 201);

  } catch (error) {
    console.error('CreateReview error:', error);
    return errorResponse(res, 'Gagal menambahkan review.');
  }
};

module.exports = { createReview };