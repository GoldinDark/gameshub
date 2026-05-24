import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart, FiStar, FiCalendar,
  FiMonitor, FiUser, FiArrowLeft, FiCheck
} from 'react-icons/fi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import LoadingSpinner from '../components/LoadingSpinner';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import api from '../api';
import toast from 'react-hot-toast';

const getImageSrc = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith('http')) return thumbnail;
  return `http://localhost:5000${thumbnail}`;
};

export default function GameDetail() {
  const { slug }               = useParams();
  const { user, updateUser }   = useAuthStore();
  const { addToCart, items }   = useCartStore();
  const navigate               = useNavigate();

  const [game,       setGame]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeImg,  setActiveImg]  = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [owned,      setOwned]      = useState(false);
  const [inCart,     setInCart]     = useState(false);
  const [review,     setReview]     = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch game detail ──────────────────────────────────
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/games/${slug}`);
        setGame(res.data.data);
        setActiveImg(res.data.data.thumbnail);
      } catch {
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [slug]);

  // ── Cek apakah sudah di cart ───────────────────────────
  useEffect(() => {
    if (!game) return;
    setInCart(items.some((i) => i.gameId === game.id));
  }, [items, game]);

  // ── Cek owned & wishlisted ─────────────────────────────
  useEffect(() => {
    if (!user || !game) return;
    const checkStatus = async () => {
      try {
        const [libRes, wishRes] = await Promise.all([
          api.get('/orders/library'),
          api.get('/wishlist'),
        ]);
        setOwned(libRes.data.data.some((l) => l.gameId === game.id));
        setWishlisted(wishRes.data.data.some((w) => w.gameId === game.id));
      } catch {}
    };
    checkStatus();
  }, [user, game]);

  // ── Toggle wishlist ────────────────────────────────────
  const handleWishlist = async () => {
    if (!user) { toast.error('Login dulu untuk menambah wishlist!'); return; }
    try {
      const res = await api.post(`/wishlist/${game.id}`);
      setWishlisted(res.data.data.wishlisted);
      toast.success(res.data.message);

      // Refresh data user agar counter wishlist di Navbar & Profile update
      const meRes = await api.get('/auth/me');
      updateUser(meRes.data.data);
    } catch {
      toast.error('Gagal mengubah wishlist.');
    }
  };

  // ── Submit review ──────────────────────────────────────
  const handleReview = async (e) => {
    e.preventDefault();
    if (!user)                   { toast.error('Login dulu untuk memberi review!'); return; }
    if (!review.comment.trim())  { toast.error('Tulis komentar dulu.'); return; }
    try {
      setSubmitting(true);
      await api.post('/reviews', { gameId: game.id, ...review });
      toast.success('Review berhasil dikirim!');
      const res = await api.get(`/games/${slug}`);
      setGame(res.data.data);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
  if (!game) return null;

  const discountedPrice = game.discount > 0
    ? game.price - (game.price * game.discount / 100)
    : game.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors text-sm"
      >
        <FiArrowLeft /> Kembali
      </button>

      {/* ══════════════════════════════════════════════
          HERO — Image + Info
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

        {/* Kiri: Images */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-3"
            style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(26,39,68,0.8)' }}>
            {activeImg ? (
              <img
                src={getImageSrc(activeImg)}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl"
                style={{ background: 'linear-gradient(135deg, #0a1628, #1d4ed8)' }}>
                🎮
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {game.screenshots?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {game.thumbnail && (
                <button
                  onClick={() => setActiveImg(game.thumbnail)}
                  className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all"
                  style={{
                    border: activeImg === game.thumbnail
                      ? '2px solid #38bdf8'
                      : '2px solid rgba(26,39,68,0.8)',
                  }}
                >
                  <img src={getImageSrc(game.thumbnail)} alt="thumb"
                    className="w-full h-full object-cover" />
                </button>
              )}
              {game.screenshots.map((ss) => (
                <button
                  key={ss.id}
                  onClick={() => setActiveImg(ss.url)}
                  className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all"
                  style={{
                    border: activeImg === ss.url
                      ? '2px solid #38bdf8'
                      : '2px solid rgba(26,39,68,0.8)',
                  }}
                >
                  <img src={getImageSrc(ss.url)} alt="screenshot"
                    className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kanan: Info & Buy Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-6 sticky top-20"
            style={{
              background: 'rgba(10,22,40,0.9)',
              border: '1px solid rgba(26,39,68,0.8)',
              backdropFilter: 'blur(12px)',
            }}>

            {/* Genre badge */}
            <span className="text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block"
              style={{
                background: 'rgba(37,99,235,0.15)',
                border: '1px solid rgba(37,99,235,0.3)',
                color: '#60a5fa',
              }}>
              {game.genre?.name}
            </span>

            {/* Title */}
            <h1 className="text-2xl font-black text-white mb-2 leading-tight">
              {game.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  s <= Math.round(game.rating)
                    ? <AiFillStar  key={s} className="text-yellow-400 text-base" />
                    : <AiOutlineStar key={s} className="text-muted text-base" />
                ))}
              </div>
              <span className="text-sm text-muted">
                {game.rating > 0 ? game.rating.toFixed(1) : 'Belum ada'} ({game._count?.reviews} ulasan)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {game.discount > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#4ade80',
                    }}>
                    -{game.discount}%
                  </span>
                  <span className="text-muted text-sm line-through">
                    Rp {game.price.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <span className="text-3xl font-black text-white">
                {discountedPrice === 0
                  ? 'Gratis'
                  : `Rp ${discountedPrice.toLocaleString('id-ID')}`}
              </span>
            </div>

            {/* CTA Buttons */}
            {owned ? (
              <div className="flex items-center gap-2 w-full rounded-xl px-4 py-3 mb-3"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                }}>
                <FiCheck className="text-lg flex-shrink-0" />
                <span className="font-semibold">Sudah dimiliki</span>
              </div>
            ) : inCart ? (
              <Link to="/cart"
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 mb-3 font-semibold text-sm transition-all"
                style={{
                  background: 'rgba(10,22,40,0.8)',
                  border: '1px solid rgba(56,189,248,0.4)',
                  color: '#38bdf8',
                }}>
                <FiShoppingCart /> Ada di Cart — Lihat Cart
              </Link>
            ) : (
              <button
                onClick={() => addToCart(game.id)}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3 py-3"
              >
                <FiShoppingCart /> Tambah ke Cart
              </button>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-sm transition-all duration-200"
              style={{
                background: wishlisted ? 'rgba(236,72,153,0.1)' : 'rgba(10,22,40,0.5)',
                border: wishlisted
                  ? '1px solid rgba(236,72,153,0.4)'
                  : '1px solid rgba(26,39,68,0.8)',
                color: wishlisted ? '#f472b6' : '#64748b',
              }}
              onMouseEnter={(e) => {
                if (!wishlisted) e.currentTarget.style.borderColor = 'rgba(236,72,153,0.3)';
              }}
              onMouseLeave={(e) => {
                if (!wishlisted) e.currentTarget.style.borderColor = 'rgba(26,39,68,0.8)';
              }}
            >
              <FiHeart className={wishlisted ? 'fill-pink-400 text-pink-400' : ''} />
              {wishlisted ? 'Di Wishlist — Hapus' : 'Tambah ke Wishlist'}
            </button>

            {/* Meta info */}
            <div className="mt-6 pt-4 space-y-2.5"
              style={{ borderTop: '1px solid rgba(26,39,68,0.8)' }}>
              {[
                { icon: <FiUser />,     label: 'Developer',  val: game.developer },
                { icon: <FiUser />,     label: 'Publisher',  val: game.publisher },
                { icon: <FiMonitor />,  label: 'Platform',   val: game.platform },
                { icon: <FiCalendar />, label: 'Rilis',
                  val: new Date(game.releaseDate).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start text-sm gap-2">
                  <span className="flex items-center gap-1.5 text-muted flex-shrink-0">
                    {item.icon} {item.label}
                  </span>
                  <span className="text-slate-300 text-right text-xs">{item.val}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESCRIPTION
      ══════════════════════════════════════════════ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">📖 Deskripsi</h2>
        <div className="rounded-2xl p-6"
          style={{
            background: 'rgba(10,22,40,0.8)',
            border: '1px solid rgba(26,39,68,0.8)',
          }}>
          <p className="text-slate-400 leading-relaxed whitespace-pre-line text-sm">
            {game.description}
          </p>
        </div>

        {/* Tags */}
        {game.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {game.tags.map((t) => (
              <span key={t.tagId}
                className="text-xs font-medium px-3 py-1 rounded-full cursor-default transition-colors"
                style={{
                  background: 'rgba(10,22,40,0.8)',
                  border: '1px solid rgba(26,39,68,0.8)',
                  color: '#64748b',
                }}>
                {t.tag.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════════ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          ⭐ Ulasan Pengguna
          <span className="text-sm font-normal text-muted">({game._count?.reviews})</span>
        </h2>

        {/* Form review */}
        {user && (
          <div className="rounded-2xl p-6 mb-6"
            style={{
              background: 'rgba(10,22,40,0.8)',
              border: '1px solid rgba(26,39,68,0.8)',
            }}>
            <h3 className="font-semibold text-white mb-4">Tulis Ulasan</h3>
            <form onSubmit={handleReview} className="space-y-4">
              {/* Rating stars */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReview({ ...review, rating: s })}
                      className="text-2xl transition-transform hover:scale-110 active:scale-95"
                    >
                      {s <= review.rating
                        ? <AiFillStar className="text-yellow-400" />
                        : <AiOutlineStar className="text-muted" />
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* Komentar */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Komentar</label>
                <textarea
                  rows={3}
                  placeholder="Bagaimana pengalaman bermain game ini?"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting
                  ? <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </span>
                  : 'Kirim Ulasan'
                }
              </button>
            </form>
          </div>
        )}

        {/* List reviews */}
        {game.reviews?.length > 0 ? (
          <div className="space-y-4">
            {game.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl p-5"
                style={{
                  background: 'rgba(10,22,40,0.8)',
                  border: '1px solid rgba(26,39,68,0.8)',
                }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(6,182,212,0.3))',
                        border: '1px solid rgba(56,189,248,0.3)',
                        color: '#38bdf8',
                      }}>
                      {r.user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{r.user.username}</div>
                      <div className="text-xs text-muted">
                        {new Date(r.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      s <= r.rating
                        ? <AiFillStar  key={s} className="text-yellow-400 text-sm" />
                        : <AiOutlineStar key={s} className="text-muted text-sm" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted"
            style={{
              background: 'rgba(10,22,40,0.5)',
              border: '1px solid rgba(26,39,68,0.8)',
              borderRadius: '16px',
            }}>
            <FiStar className="text-4xl mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada ulasan untuk game ini.</p>
            <p className="text-xs mt-1 opacity-60">Jadilah yang pertama memberi ulasan!</p>
          </div>
        )}
      </section>

    </div>
  );
}