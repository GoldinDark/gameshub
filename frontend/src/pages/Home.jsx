import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiStar, FiZap } from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const getImageSrc = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith('http')) return thumbnail;
  return `http://localhost:5000${thumbnail}`;
};

export default function Home() {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [newReleases,   setNewReleases]   = useState([]);
  const [genres,        setGenres]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [heroIndex,     setHeroIndex]     = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featuredRes, newRes, genreRes] = await Promise.all([
          api.get('/games?featured=true&limit=5'),
          api.get('/games?sort=createdAt&order=desc&limit=8'),
          api.get('/games/genres'),
        ]);
        setFeaturedGames(featuredRes.data.data.games);
        setNewReleases(newRes.data.data.games);
        setGenres(genreRes.data.data);
      } catch (err) {
        console.error('Fetch home error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (featuredGames.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredGames.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredGames]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const heroGame = featuredGames[heroIndex];

  return (
    <div className="animate-fade-in relative">

      {/* ══════════════════════════════════════════════
          GAMING BACKGROUND
      ══════════════════════════════════════════════ */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #050b18 0%, #0a1628 60%, #050b18 100%)' }} />

        {/* Gaming image layer */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            opacity: 0.07,
            filter: 'grayscale(20%) blur(1.5px)',
          }} />

        {/* Dark overlay */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(5,11,24,0.65) 0%, rgba(5,11,24,0.5) 30%, rgba(5,11,24,0.75) 70%, rgba(5,11,24,0.95) 100%)',
          }} />

        {/* Grid pattern */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            opacity: 0.025,
          }} />

        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)' }} />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)' }} />
        <div className="absolute bottom-1/3 left-1/2 w-[350px] h-[350px] rounded-full blur-[90px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)' }} />
      </div>

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      {heroGame && (
        <section className="relative h-[580px] overflow-hidden">

          {/* Background thumbnail */}
          <div className="absolute inset-0">
            {heroGame.thumbnail ? (
              <img
                src={getImageSrc(heroGame.thumbnail)}
                alt={heroGame.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, #0a1628, #1d4ed8)' }} />
            )}
            {/* Gradasi overlay */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(5,11,24,0.97) 0%, rgba(5,11,24,0.8) 50%, rgba(5,11,24,0.3) 100%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(0deg, rgba(5,11,24,1) 0%, transparent 40%)' }} />
          </div>

          {/* Hero content */}
          <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
            <div className="max-w-xl animate-slide-up">

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className="badge text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', color: '#60a5fa' }}>
                  ⚡ Featured Game
                </span>
                <span className="badge text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(26,39,68,0.8)', color: '#94a3b8' }}>
                  {heroGame.genre?.name}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black text-white mb-3 leading-tight tracking-tight">
                {heroGame.title}
              </h1>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3 max-w-lg">
                {heroGame.description}
              </p>

              {/* Price & CTA */}
              <div className="flex items-center gap-4">
                <div>
                  {heroGame.discount > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                        -{heroGame.discount}%
                      </span>
                      <span className="text-sm text-muted line-through">
                        Rp {heroGame.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <span className="text-3xl font-black text-white">
                    Rp {(heroGame.price - (heroGame.price * heroGame.discount / 100))
                      .toLocaleString('id-ID')}
                  </span>
                </div>
                <Link to={`/game/${heroGame.slug}`} className="btn-primary flex items-center gap-2 px-6 py-3 text-base">
                  Lihat Game <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredGames.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === heroIndex ? '2rem' : '0.5rem',
                  height: '0.5rem',
                  background: i === heroIndex
                    ? 'linear-gradient(90deg, #2563eb, #06b6d4)'
                    : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          GENRE BAR
      ══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Link to="/store"
            className="flex-shrink-0 px-5 py-2 rounded-full text-white text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
            🎮 Semua Game
          </Link>
          {genres.map((genre) => (
            <Link key={genre.id} to={`/store?genre=${genre.slug}`}
              className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
              style={{
                background: 'rgba(10,22,40,0.8)',
                border: '1px solid rgba(26,39,68,0.8)',
                color: '#94a3b8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26,39,68,0.8)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {genre.name}
              <span className="ml-1.5 text-xs opacity-60">({genre._count.games})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED GAMES
      ══════════════════════════════════════════════ */}
      {featuredGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
                  <FiZap className="text-white text-xs" />
                </div>
                <h2 className="text-2xl font-bold text-white">Featured Games</h2>
              </div>
              <p className="text-muted text-sm">Game pilihan terbaik untuk kamu</p>
            </div>
            <Link to="/store?featured=true"
              className="btn-secondary text-sm flex items-center gap-1.5 px-4 py-2">
              Lihat Semua <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          NEW RELEASES
      ══════════════════════════════════════════════ */}
      {newReleases.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)' }}>
                  <FiTrendingUp className="text-white text-xs" />
                </div>
                <h2 className="text-2xl font-bold text-white">New Releases</h2>
              </div>
              <p className="text-muted text-sm">Game terbaru yang baru saja hadir</p>
            </div>
            <Link to="/store?sort=createdAt&order=desc"
              className="btn-secondary text-sm flex items-center gap-1.5 px-4 py-2">
              Lihat Semua <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newReleases.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          EMPTY STATE
      ══════════════════════════════════════════════ */}
      {featuredGames.length === 0 && newReleases.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20 text-center">
          <RiGamepadLine className="text-6xl mx-auto mb-6 opacity-30"
            style={{ color: '#2563eb' }} />
          <h2 className="text-3xl font-bold text-white mb-3">Belum Ada Game</h2>
          <p className="text-muted mb-6">Database masih kosong.</p>
          <Link to="/store" className="btn-primary inline-flex items-center gap-2">
            Ke Store <FiArrowRight />
          </Link>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="relative rounded-2xl overflow-hidden p-8 md:p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(10,22,40,0.9) 50%, rgba(6,182,212,0.1) 100%)',
            border: '1px solid rgba(37,99,235,0.25)',
          }}>

          {/* Decorative glow */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.2), transparent)', transform: 'translate(-30%, -30%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2), transparent)', transform: 'translate(30%, 30%)' }} />

          <div className="absolute inset-0 flex items-center justify-end pr-16 opacity-5 pointer-events-none">
            <span className="text-[180px]">🎮</span>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiStar className="text-yellow-400" />
                <span className="text-sm font-semibold uppercase tracking-widest"
                  style={{ background: 'linear-gradient(135deg, #38bdf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Promo Spesial
                </span>
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Top Up Saldo Sekarang</h3>
              <p className="text-muted text-sm">Isi saldo dan mulai beli game favoritmu hari ini.</p>
            </div>
            <Link to="/cart" className="btn-neon flex-shrink-0 flex items-center gap-2 px-6 py-3">
              Top Up Saldo <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}