const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const fs   = require('fs');
const path = require('path');



// ══════════════════════════════════════════════════════
// GET ALL GAMES (dengan filter, search, sort, pagination)
// GET /api/games
// ══════════════════════════════════════════════════════
const getAllGames = async (req, res) => {
  try {
    const {
      search,
      genre,
      minPrice,
      maxPrice,
      sort     = 'createdAt',
      order    = 'desc',
      page     = 1,
      limit    = 12,
      featured,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ── Build filter ───────────────────────────────────
    const where = {};

    if (search) {
      where.OR = [
        { title:     { contains: search } },
        { developer: { contains: search } },
        { publisher: { contains: search } },
      ];
    }

    if (genre) {
      where.genre = { slug: genre };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // ── Allowed sort fields ────────────────────────────
    const allowedSort = ['createdAt', 'price', 'rating', 'title'];
    const sortField   = allowedSort.includes(sort) ? sort : 'createdAt';

    // ── Query ──────────────────────────────────────────
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
        include: {
          genre: { select: { name: true, slug: true } },
          tags:  { include: { tag: true } },
        },
      }),
      prisma.game.count({ where }),
    ]);

    return successResponse(res, {
      games,
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });

  } catch (error) {
    console.error('GetAllGames error:', error);
    return errorResponse(res, 'Gagal mengambil data games.');
  }
};

// ══════════════════════════════════════════════════════
// GET SINGLE GAME BY SLUG
// GET /api/games/:slug
// ══════════════════════════════════════════════════════
const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        genre:       { select: { name: true, slug: true } },
        tags:        { include: { tag: true } },
        screenshots: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
        _count: {
          select: { reviews: true, library: true },
        },
      },
    });

    if (!game) {
      return errorResponse(res, 'Game tidak ditemukan.', 404);
    }

    return successResponse(res, game);

  } catch (error) {
    console.error('GetGameBySlug error:', error);
    return errorResponse(res, 'Gagal mengambil data game.');
  }
};

// ══════════════════════════════════════════════════════
// CREATE GAME (Admin only)
// POST /api/games
// ══════════════════════════════════════════════════════
const createGame = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discount,
      genreId,
      developer,
      publisher,
      releaseDate,
      platform,
      isFeatured,
      trailer,
      tags, // array of tag IDs: [1, 2, 3]
    } = req.body;

    // ── Validasi wajib ─────────────────────────────────
    if (!title || !description || !price || !genreId || !developer || !publisher || !releaseDate) {
      return errorResponse(res, 'Semua field wajib diisi.', 400);
    }

    // ── Generate slug dari title ───────────────────────
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    // ── Cek slug duplikat ──────────────────────────────
    const existing = await prisma.game.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse(res, 'Game dengan judul ini sudah ada.', 409);
    }

    // ── Thumbnail path ─────────────────────────────────
    const thumbnail = req.file
      ? `/uploads/thumbnails/${req.file.filename}`
      : null;

    // ── Parse tags ─────────────────────────────────────
    let tagConnect = [];
    if (tags) {
      const tagIds = typeof tags === 'string' ? JSON.parse(tags) : tags;
      tagConnect = tagIds.map((tagId) => ({
        tag: { connect: { id: parseInt(tagId) } },
      }));
    }

    const game = await prisma.game.create({
      data: {
        title,
        slug,
        description,
        price:       parseFloat(price),
        discount:    discount ? parseFloat(discount) : 0,
        thumbnail,
        trailer,
        genreId:     parseInt(genreId),
        developer,
        publisher,
        releaseDate: new Date(releaseDate),
        platform:    platform || 'PC',
        isFeatured:  isFeatured === 'true' || isFeatured === true,
        tags:        { create: tagConnect },
      },
      include: {
        genre: true,
        tags:  { include: { tag: true } },
      },
    });

    return successResponse(res, game, 'Game berhasil ditambahkan!', 201);

  } catch (error) {
    console.error('CreateGame error:', error);
    return errorResponse(res, 'Gagal menambahkan game.');
  }
};

// ══════════════════════════════════════════════════════
// UPDATE GAME (Admin only)
// PUT /api/games/:id
// ══════════════════════════════════════════════════════
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      discount,
      genreId,
      developer,
      publisher,
      releaseDate,
      platform,
      isFeatured,
      trailer,
    } = req.body;

    const gameId = parseInt(id);

    // ── Cek game ada ───────────────────────────────────
    const existing = await prisma.game.findUnique({ where: { id: gameId } });
    if (!existing) {
      return errorResponse(res, 'Game tidak ditemukan.', 404);
    }

    // ── Jika ada file baru, hapus thumbnail lama ───────
    let thumbnail = existing.thumbnail;
    if (req.file) {
      if (existing.thumbnail) {
        const oldPath = path.join(__dirname, '../../', existing.thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        title:       title       || existing.title,
        description: description || existing.description,
        price:       price       ? parseFloat(price)    : existing.price,
        discount:    discount    !== undefined ? parseFloat(discount) : existing.discount,
        thumbnail,
        trailer:     trailer     || existing.trailer,
        genreId:     genreId     ? parseInt(genreId)    : existing.genreId,
        developer:   developer   || existing.developer,
        publisher:   publisher   || existing.publisher,
        releaseDate: releaseDate ? new Date(releaseDate) : existing.releaseDate,
        platform:    platform    || existing.platform,
        isFeatured:  isFeatured  !== undefined
          ? isFeatured === 'true' || isFeatured === true
          : existing.isFeatured,
      },
      include: {
        genre: true,
        tags:  { include: { tag: true } },
      },
    });

    return successResponse(res, game, 'Game berhasil diupdate!');

  } catch (error) {
    console.error('UpdateGame error:', error);
    return errorResponse(res, 'Gagal mengupdate game.');
  }
};

// ══════════════════════════════════════════════════════
// DELETE GAME (Admin only)
// DELETE /api/games/:id
// ══════════════════════════════════════════════════════
const deleteGame = async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return errorResponse(res, 'Game tidak ditemukan.', 404);
    }

    // ── Hapus thumbnail dari disk ──────────────────────
    if (game.thumbnail) {
      const thumbPath = path.join(__dirname, '../../', game.thumbnail);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    // ── Hapus data game (cascade ke tags, screenshots) ─
    await prisma.game.delete({ where: { id: gameId } });

    return successResponse(res, null, 'Game berhasil dihapus.');

  } catch (error) {
    console.error('DeleteGame error:', error);
    return errorResponse(res, 'Gagal menghapus game.');
  }
};

// ══════════════════════════════════════════════════════
// ADD SCREENSHOTS
// POST /api/games/:id/screenshots
// ══════════════════════════════════════════════════════
const addScreenshots = async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return errorResponse(res, 'Game tidak ditemukan.', 404);
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'Tidak ada file yang diupload.', 400);
    }

    const screenshots = await Promise.all(
      req.files.map((file) =>
        prisma.screenshot.create({
          data: {
            gameId,
            url: `/uploads/screenshots/${file.filename}`,
          },
        })
      )
    );

    return successResponse(res, screenshots, 'Screenshots berhasil ditambahkan!', 201);

  } catch (error) {
    console.error('AddScreenshots error:', error);
    return errorResponse(res, 'Gagal menambahkan screenshots.');
  }
};

// ══════════════════════════════════════════════════════
// GET ALL GENRES
// GET /api/games/genres
// ══════════════════════════════════════════════════════
const getAllGenres = async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: { select: { games: true } },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(res, genres);

  } catch (error) {
    console.error('GetAllGenres error:', error);
    return errorResponse(res, 'Gagal mengambil data genre.');
  }
};

module.exports = {
  getAllGames,
  getGameBySlug,
  createGame,
  updateGame,
  deleteGame,
  addScreenshots,
  getAllGenres,
};