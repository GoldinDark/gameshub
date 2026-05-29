const prisma   = require('../utils/prisma');
const QRCode   = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');

// ── Generate QR untuk Checkout ─────────────────────────
// POST /api/payment/generate
const generateQris = async (req, res) => {
  try {
    const { amount, type = 'TOPUP' } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Jumlah tidak valid', 400);
    }

    // Hapus pending payment lama milik user ini (cleanup)
    await prisma.pendingPayment.deleteMany({
      where: {
        userId,
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
    });

    // Buat pending payment baru, berlaku 10 menit
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const payment   = await prisma.pendingPayment.create({
      data: { userId, amount: parseFloat(amount), type, expiresAt },
    });

    // URL konfirmasi yang di-encode ke QR
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmUrl  = `${frontendUrl}/payment/confirm/${payment.id}`;

    // Generate QR Code sebagai data URL (base64 PNG)
    const qrBase64 = await QRCode.toDataURL(confirmUrl, {
      width:            300,
      margin:           2,
      errorCorrectionLevel: 'M',
      color: {
        dark:  '#000000',
        light: '#ffffff',
      },
    });

    return successResponse(res, {
      paymentId:  payment.id,
      amount:     payment.amount,
      type:       payment.type,
      qrCode:     qrBase64,
      confirmUrl,
      expiresAt:  payment.expiresAt,
    }, 'QR Code berhasil dibuat');

  } catch (error) {
    console.error('GenerateQris error:', error);
    return errorResponse(res, 'Gagal membuat QR Code');
  }
};

// ── Cek status (polling dari frontend desktop) ─────────
// GET /api/payment/status/:paymentId
const checkStatus = async (req, res) => {
  try {
    const payment = await prisma.pendingPayment.findUnique({
      where: { id: req.params.paymentId },
    });

    if (!payment) return errorResponse(res, 'Payment tidak ditemukan', 404);

    // Auto-expire
    if (new Date() > payment.expiresAt && payment.status === 'PENDING') {
      await prisma.pendingPayment.update({
        where: { id: payment.id },
        data:  { status: 'EXPIRED' },
      });
      return successResponse(res, { status: 'EXPIRED' });
    }

    return successResponse(res, { status: payment.status });
  } catch (error) {
    return errorResponse(res, 'Gagal cek status');
  }
};

// ── Konfirmasi pembayaran (dari halaman scan QR di HP) ─
// POST /api/payment/confirm/:paymentId  (public — tidak butuh token)
const confirmPayment = async (req, res) => {
  try {
    const payment = await prisma.pendingPayment.findUnique({
      where: { id: req.params.paymentId },
      include: { user: true },
    });

    if (!payment)
      return errorResponse(res, 'Payment tidak ditemukan', 404);
    if (payment.status === 'CONFIRMED')
      return errorResponse(res, 'Pembayaran sudah dikonfirmasi', 400);
    if (payment.status === 'EXPIRED' || new Date() > payment.expiresAt)
      return errorResponse(res, 'QR Code sudah kadaluarsa', 400);

    // Jalankan aksi sesuai type dalam transaction
    await prisma.$transaction(async (tx) => {
      if (payment.type === 'TOPUP') {
        // Tambah saldo user
        await tx.user.update({
          where: { id: payment.userId },
          data:  { balance: { increment: payment.amount } },
        });

      } else if (payment.type === 'CHECKOUT') {
        // Ambil cart user
        const cartItems = await tx.cart.findMany({
          where:   { userId: payment.userId },
          include: { game: true },
        });

        if (cartItems.length === 0) {
          throw new Error('Cart kosong');
        }

        // Buat order
        await tx.order.create({
          data: {
            userId: payment.userId,
            total:  payment.amount,
            status: 'PAID',
            items: {
              create: cartItems.map((item) => ({
                gameId: item.gameId,
                price:  item.game.price -
                        (item.game.price * item.game.discount / 100),
              })),
            },
          },
        });

        // Tambah semua game ke library
        for (const item of cartItems) {
          await tx.library.upsert({
            where:  { userId_gameId: { userId: payment.userId, gameId: item.gameId } },
            update: {},
            create: { userId: payment.userId, gameId: item.gameId },
          });
        }

        // Kosongkan cart
        await tx.cart.deleteMany({ where: { userId: payment.userId } });
      }

      // Update status payment
      await tx.pendingPayment.update({
        where: { id: payment.id },
        data:  { status: 'CONFIRMED' },
      });
    });

    return successResponse(res, {
      status:   'CONFIRMED',
      type:     payment.type,
      amount:   payment.amount,
      username: payment.user.username,
    }, 'Pembayaran berhasil dikonfirmasi!');

  } catch (error) {
    console.error('ConfirmPayment error:', error.message);
    return errorResponse(res, error.message || 'Gagal konfirmasi pembayaran');
  }
};

// ── Get info payment (untuk halaman konfirmasi di HP) ──
// GET /api/payment/:paymentId  (public)
const getPaymentInfo = async (req, res) => {
  try {
    const payment = await prisma.pendingPayment.findUnique({
      where:   { id: req.params.paymentId },
      include: { user: { select: { username: true } } },
    });

    if (!payment) return errorResponse(res, 'Payment tidak ditemukan', 404);

    // Auto-expire check
    let status = payment.status;
    if (new Date() > payment.expiresAt && status === 'PENDING') {
      status = 'EXPIRED';
    }

    return successResponse(res, {
      id:        payment.id,
      amount:    payment.amount,
      type:      payment.type,
      status,
      username:  payment.user.username,
      expiresAt: payment.expiresAt,
    });
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil info payment');
  }
};

module.exports = { generateQris, checkStatus, confirmPayment, getPaymentInfo };