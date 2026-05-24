const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');



// ══════════════════════════════════════════════════════
// CHECKOUT (buat order dari cart)
// POST /api/orders/checkout
// ══════════════════════════════════════════════════════
const checkout = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── Ambil semua item di cart ────────────────────────
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { game: true },
    });

    if (cartItems.length === 0) {
      return errorResponse(res, 'Cart kamu kosong.', 400);
    }

    // ── Hitung total harga ─────────────────────────────
    const total = cartItems.reduce((sum, item) => {
      const harga = item.game.price - (item.game.price * item.game.discount / 100);
      return sum + harga;
    }, 0);

    // ── Cek saldo user cukup ───────────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.balance < total) {
      return errorResponse(res, `Saldo tidak cukup. Saldo kamu: Rp${user.balance}, total: Rp${total}`, 400);
    }

    // ── Buat order + order items + kurangi saldo (transaction) ──
    const order = await prisma.$transaction(async (tx) => {

      // Buat order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PAID',
          items: {
            create: cartItems.map((item) => ({
              gameId: item.gameId,
              price:  item.game.price - (item.game.price * item.game.discount / 100),
            })),
          },
        },
        include: { items: { include: { game: true } } },
      });

      // Tambahkan semua game ke library user
      await Promise.all(
        cartItems.map((item) =>
          tx.library.upsert({
            where:  { userId_gameId: { userId, gameId: item.gameId } },
            update: {},
            create: { userId, gameId: item.gameId },
          })
        )
      );

      // Kurangi saldo user
      await tx.user.update({
        where: { id: userId },
        data:  { balance: { decrement: total } },
      });

      // Kosongkan cart
      await tx.cart.deleteMany({ where: { userId } });

      return newOrder;
    });

    return successResponse(res, order, 'Pembelian berhasil! Game ditambahkan ke library.', 201);

  } catch (error) {
    console.error('Checkout error:', error);
    return errorResponse(res, 'Gagal melakukan checkout.');
  }
};

// ══════════════════════════════════════════════════════
// GET ORDER HISTORY USER
// GET /api/orders
// ══════════════════════════════════════════════════════
const getOrderHistory = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            game: {
              select: {
                id: true, title: true, thumbnail: true, slug: true,
              },
            },
          },
        },
      },
    });

    return successResponse(res, orders);

  } catch (error) {
    console.error('GetOrderHistory error:', error);
    return errorResponse(res, 'Gagal mengambil riwayat order.');
  }
};

// ══════════════════════════════════════════════════════
// GET LIBRARY USER (game yang sudah dimiliki)
// GET /api/orders/library
// ══════════════════════════════════════════════════════
const getLibrary = async (req, res) => {
  try {
    const library = await prisma.library.findMany({
      where:   { userId: req.user.id },
      orderBy: { addedAt: 'desc' },
      include: {
        game: {
          include: {
            genre: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return successResponse(res, library);

  } catch (error) {
    console.error('GetLibrary error:', error);
    return errorResponse(res, 'Gagal mengambil library.');
  }
};

// ══════════════════════════════════════════════════════
// TOP UP SALDO (simulasi pembayaran)
// POST /api/orders/topup
// ══════════════════════════════════════════════════════
const topUp = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Jumlah top up tidak valid.', 400);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data:  { balance: { increment: parseFloat(amount) } },
      select: { id: true, username: true, balance: true },
    });

    return successResponse(res, user, `Top up Rp${amount} berhasil!`);

  } catch (error) {
    console.error('TopUp error:', error);
    return errorResponse(res, 'Gagal melakukan top up.');
  }
};

module.exports = { checkout, getOrderHistory, getLibrary, topUp };