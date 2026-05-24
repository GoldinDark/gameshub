const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');

const prisma = new PrismaClient();

// ── Generate Token ─────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    {
      id:       user.id,
      email:    user.email,
      username: user.username,
      role:     user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // ← ubah dari '7d' menjadi '30d'
  );
};

// ══════════════════════════════════════════════════════
// REGISTER
// POST /api/auth/register
// ══════════════════════════════════════════════════════
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ── Validasi input ─────────────────────────────────
    if (!username || !email || !password) {
      return errorResponse(res, 'Username, email, dan password wajib diisi.', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password minimal 6 karakter.', 400);
    }

    // ── Cek email & username sudah ada ─────────────────
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return errorResponse(res, 'Email sudah digunakan.', 409);
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return errorResponse(res, 'Username sudah digunakan.', 409);
    }

    // ── Hash password ──────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Simpan ke database ─────────────────────────────
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id:        true,
        username:  true,
        email:     true,
        role:      true,
        balance:   true,
        createdAt: true,
      },
    });

    // ── Generate token ─────────────────────────────────
    const token = generateToken(user);

    return successResponse(
      res,
      { user, token },
      'Registrasi berhasil!',
      201
    );

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
};

// ══════════════════════════════════════════════════════
// LOGIN
// POST /api/auth/login
// ══════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validasi input ─────────────────────────────────
    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi.', 400);
    }

    // ── Cari user by email ─────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    // ── Cek password ───────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    // ── Generate token ─────────────────────────────────
    const token = generateToken(user);

    // ── Response tanpa password ────────────────────────
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(
      res,
      { user: userWithoutPassword, token },
      'Login berhasil!'
    );

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
};

// ══════════════════════════════════════════════════════
// GET CURRENT USER (Me)
// GET /api/auth/me
// ══════════════════════════════════════════════════════
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:        true,
        username:  true,
        email:     true,
        avatar:    true,
        role:      true,
        balance:   true,
        createdAt: true,
        _count: {
          select: {
            library:  true,
            wishlist: true,
            orders:   true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan.', 404);
    }

    return successResponse(res, user, 'Data user berhasil diambil.');

  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
};

// ══════════════════════════════════════════════════════
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ══════════════════════════════════════════════════════
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return errorResponse(res, 'Password lama dan baru wajib diisi.', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password baru minimal 6 karakter.', 400);
    }

    // ── Ambil user dengan password ─────────────────────
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // ── Verifikasi password lama ───────────────────────
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return errorResponse(res, 'Password lama tidak sesuai.', 401);
    }

    // ── Hash & simpan password baru ────────────────────
    const hashedNew = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data:  { password: hashedNew },
    });

    return successResponse(res, null, 'Password berhasil diubah.');

  } catch (error) {
    console.error('ChangePassword error:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
};

module.exports = { register, login, getMe, changePassword };