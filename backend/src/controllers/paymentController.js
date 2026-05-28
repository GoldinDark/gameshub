const { PrismaClient } = require('@prisma/client');
const QRCode  = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');

const prisma = new PrismaClient();

// ── Generate QR untuk Top Up ───────────────────────────
// POST /api/payment/qris/generate
const generateQris = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId     = req.user.id;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Jumlah tidak valid', 400);
    }

    // Buat pending payment dengan expiry 10 menit
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const payment   = await prisma.pendingPayment.create({
      data: { userId, amount: parseFloat(amount), expiresAt },
    });

    // URL konfirmasi yang akan di-encode ke QR
    // Gunakan URL frontend production kamu
    const confirmUrl = `${process.env.FRONTEND_URL}/payment/confirm/${payment.id}`;

    // Generate QR code sebagai base64 image
    const qrBase64 = await QRCode.toDataURL(confirmUrl, {
      width:  300,
      margin: 2,
      color:  { dark: '#000000', light: '#ffffff' },
    });

    return successResponse(res, {
      paymentId:  payment.id,
      amount:     payment.amount,
      qrCode:     qrBase64,
      confirmUrl,
      expiresAt:  payment.expiresAt,
    }, 'QR Code berhasil dibuat');

  } catch (error) {
    console.error('GenerateQris error:', error);
    return errorResponse(res, 'Gagal membuat QR Code');
  }
};

// ── Cek status payment (polling dari frontend) ─────────
// GET /api/payment/qris/status/:paymentId
const checkStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.pendingPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return errorResponse(res, 'Payment tidak ditemukan', 404);
    }

    // Cek expired
    if (new Date() > payment.expiresAt && payment.status === 'PENDING') {
      await prisma.pendingPayment.update({
        where: { id: paymentId },
        data:  { status: 'EXPIRED' },
      });
      return successResponse(res, { status: 'EXPIRED' });
    }

    return successResponse(res, { status: payment.status });

  } catch (error) {
    return errorResponse(res, 'Gagal cek status');
  }
};

// ── Konfirmasi pembayaran (dari halaman scan QR) ───────
// POST /api/payment/qris/confirm/:paymentId
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.pendingPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return errorResponse(res, 'Payment tidak ditemukan', 404);
    }
    if (payment.status === 'CONFIRMED') {
      return errorResponse(res, 'Pembayaran sudah dikonfirmasi', 400);
    }
    if (payment.status === 'EXPIRED' || new Date() > payment.expiresAt) {
      return errorResponse(res, 'QR Code sudah kadaluarsa', 400);
    }

    // Update status payment + tambah saldo user (dalam transaction)
    await prisma.$transaction(async (tx) => {
      await tx.pendingPayment.update({
        where: { id: paymentId },
        data:  { status: 'CONFIRMED' },
      });
      await tx.user.update({
        where: { id: payment.userId },
        data:  { balance: { increment: payment.amount } },
      });
    });

    return successResponse(res, {
      amount:   payment.amount,
      status:   'CONFIRMED',
    }, 'Pembayaran berhasil dikonfirmasi!');

  } catch (error) {
    console.error('ConfirmPayment error:', error);
    return errorResponse(res, 'Gagal konfirmasi pembayaran');
  }
};

// ── Get payment info (untuk halaman konfirmasi) ────────
// GET /api/payment/qris/:paymentId (public)
const getPaymentInfo = async (req, res) => {
  try {
    const payment = await prisma.pendingPayment.findUnique({
      where: { id: req.params.paymentId },
      include: { user: { select: { username: true } } },
    });

    if (!payment) return errorResponse(res, 'Payment tidak ditemukan', 404);

    return successResponse(res, {
      id:        payment.id,
      amount:    payment.amount,
      status:    payment.status,
      username:  payment.user.username,
      expiresAt: payment.expiresAt,
    });
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil info payment');
  }
};

module.exports = { generateQris, checkStatus, confirmPayment, getPaymentInfo };