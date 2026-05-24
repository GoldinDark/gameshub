import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Terbaru' },
  { value: 'price-asc',      label: 'Harga Terendah' },
  { value: 'price-desc',     label: 'Harga Tertinggi' },
  { value: 'rating-desc',    label: 'Rating Tertinggi' },
  { value: 'title-asc',      label: 'A - Z' },
];

export default function Store() {
  const [searchParams] = useSearchParams();

  const [games,      setGames]      = useState([]);
  const [genres,     setGenres]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [search,   setSearch]   = useState(searchParams.get('search')   || '');
  const [genre,    setGenre]    = useState(searchParams.get('genre')    || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort,     setSort]     = useState('createdAt-desc');
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    api.get('/games/genres').then((res) => setGenres(res.data.data));
  }, []);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sort.split('-');
      const params = new URLSearchParams();
      if (search)   params.set('search',   search);
      if (genre)    params.set('genre',    genre);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('sort',  sortField);
      params.set('order', sortOrder);
      params.set('page',  page);
      params.set('limit', '12');
      const res = await api.get(`/games?${params.toString()}`);
      setGames(res.data.data.games);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Fetch games error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, genre, minPrice, maxPrice, sort, page]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setGenre(''); setMinPrice('');
    setMaxPrice(''); setSort('createdAt-desc'); setPage(1);
  };

  const hasFilter = search || genre || minPrice || maxPrice;

  return (
    <div className="relative min-h-screen">

      {/* ══════════════════════════════════════════════
          GAMING BACKGROUND
      ══════════════════════════════════════════════ */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #050b18 0%, #0a1628 60%, #050b18 100%)' }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.06,
            filter: 'grayscale(20%) blur(1.5px)',
          }} />
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(5,11,24,0.7) 0%, rgba(5,11,24,0.55) 40%, rgba(5,11,24,0.8) 100%)',
          }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            opacity: 0.025,
          }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

        {/* ── Header ──────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">🎮 Game Store</h1>
          <p className="text-muted text-sm">
            {pagination.total ? `${pagination.total} game tersedia` : 'Memuat game...'}
          </p>
        </div>

        {/* ── Search + Sort + Filter ───────────────────── */}
        <div className="flex gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-lg" />
            <input
              type="text"
              placeholder="Cari game, developer, publisher..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
              className="input-field pl-11 w-full"
            />
            {search && (
              <button onClick={() => handleFilterChange(setSearch)('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
                <FiX />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleFilterChange(setSort)(e.target.value)}
              className="input-field pr-10 appearance-none cursor-pointer min-w-[160px]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
            style={{
              background: showFilter ? 'rgba(37,99,235,0.15)' : 'rgba(10,22,40,0.8)',
              border: showFilter ? '1px solid rgba(37,99,235,0.5)' : '1px solid rgba(26,39,68,0.8)',
              color: showFilter ? '#60a5fa' : '#94a3b8',
            }}
          >
            <FiFilter />
            Filter
            {hasFilter && (
              <span className="w-2 h-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }} />
            )}
          </button>
        </div>

        {/* ── Filter Panel ────────────────────────────── */}
        {showFilter && (
          <div className="rounded-xl p-5 mb-6 animate-fade-in"
            style={{
              background: 'rgba(10,22,40,0.9)',
              border: '1px solid rgba(26,39,68,0.8)',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                <div className="relative">
                  <select
                    value={genre}
                    onChange={(e) => handleFilterChange(setGenre)(e.target.value)}
                    className="input-field w-full appearance-none"
                  >
                    <option value="">Semua Genre</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.slug}>{g.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Harga Minimum</label>
                <input type="number" placeholder="0"
                  value={minPrice}
                  onChange={(e) => handleFilterChange(setMinPrice)(e.target.value)}
                  className="input-field w-full" />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Harga Maksimum</label>
                <input type="number" placeholder="1000000"
                  value={maxPrice}
                  onChange={(e) => handleFilterChange(setMaxPrice)(e.target.value)}
                  className="input-field w-full" />
              </div>
            </div>

            {hasFilter && (
              <button onClick={clearFilters}
                className="mt-4 text-sm flex items-center gap-1 transition-colors"
                style={{ color: '#ef4444' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fca5a5'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}>
                <FiX /> Hapus semua filter
              </button>
            )}
          </div>
        )}

        {/* ── Active filter chip ───────────────────────── */}
        {genre && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted">Filter aktif:</span>
            <button onClick={() => handleFilterChange(setGenre)('')}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all"
              style={{
                background: 'rgba(37,99,235,0.15)',
                border: '1px solid rgba(37,99,235,0.4)',
                color: '#60a5fa',
              }}>
              {genres.find((g) => g.slug === genre)?.name}
              <FiX className="text-xs" />
            </button>
          </div>
        )}

        {/* ── Games Grid ──────────────────────────────── */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : games.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={i} className="text-muted px-2">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="w-9 h-9 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: p === page ? 'linear-gradient(135deg, #2563eb, #0891b2)' : 'rgba(10,22,40,0.8)',
                          border: p === page ? 'none' : '1px solid rgba(26,39,68,0.8)',
                          color: p === page ? 'white' : '#64748b',
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-6xl">🔍</span>
            <h3 className="text-xl font-bold text-white">Game Tidak Ditemukan</h3>
            <p className="text-muted text-sm">Coba ubah filter atau kata kunci pencarian.</p>
            <button onClick={clearFilters} className="btn-secondary">Reset Filter</button>
          </div>
        )}

      </div>
    </div>
  );
}