import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import api from '../api';
import toast from 'react-hot-toast';

const getImageSrc = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith('http')) return thumbnail;
  return `http://localhost:5000${thumbnail}`;
};

export default function Wishlist() {
  const { user, updateUser } = useAuthStore();
  const { addToCart }        = useCartStore();
  const navigate             = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.data);
    } catch {
      toast.error('Gagal memuat wishlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (gameId) => {
    setRemoving(gameId);
    try {
      await api.post(`/wishlist/${gameId}`);
      setWishlist((prev) => prev.filter((w) => w.gameId !== gameId));
      // Refresh user count
      const meRes = await api.get('/auth/me');
      updateUser(meRes.data.data);
      toast.success('Dihapus dari wishlist.');
    } catch {
      toast.error('Gagal menghapus dari wishlist.');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (gameId) => {
    await addToCart(gameId);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
          <FiHeart className="text-pink-500" />
          Wishlist Saya
        </h1>
        <p className="text-muted text-sm">{wishlist.length} game dalam wishlist</p>
      </div>

      {wishlist.length === 0 ? (
        /* Empty state */
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-5 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
            <FiHeart className="text-4xl text-pink-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Wishlist Kosong</h2>
            <p className="text-muted text-sm max-w-md">
              Belum ada game di wishlist kamu. Jelajahi store dan tambahkan game yang ingin kamu beli nanti.
            </p>
          </div>
          <Link to="/store" className="btn-primary flex items-center gap-2 px-6">
            Jelajahi Store <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.map((item) => {
            const game = item.game;
            const discountedPrice = game.discount > 0
              ? game.price - (game.price * game.discount / 100)
              : game.price;

            return (
              <div
                key={item.id}
                className="flex gap-5 p-4 rounded-2xl transition-all duration-200 group"
                style={{
                  background: 'rgba(10,22,40,0.8)',
                  border: '1px solid rgba(26,39,68,0.8)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(26,39,68,0.8)'}
              >
                {/* Thumbnail */}
                <Link to={`/game/${game.slug}`} className="flex-shrink-0">
                  <div className="w-40 h-24 rounded-xl overflow-hidden bg-border">
                    {game.thumbnail ? (
                      <img
                        src={getImageSrc(game.thumbnail)}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl"
                        style={{ background: 'linear-gradient(135deg, #0a1628, #1d4ed8)' }}>
                        🎮
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {/* Genre */}
                      <span className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: '#38bdf8' }}>
                        {game.genre?.name}
                      </span>

                      {/* Title */}
                      <Link to={`/game/${game.slug}`}>
                        <h3 className="text-white font-bold text-lg mt-0.5 mb-1 hover:text-glow transition-colors line-clamp-1">
                          {game.title}
                        </h3>
                      </Link>

                      {/* Developer */}
                      <p className="text-muted text-xs mb-2">{game.developer}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5">
                        <AiFillStar className="text-yellow-400 text-sm" />
                        <span className="text-sm text-slate-400">
                          {game.rating > 0 ? game.rating.toFixed(1) : 'Belum ada rating'}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      {game.discount > 0 && (
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                            -{game.discount}%
                          </span>
                          <span className="text-xs text-muted line-through">
                            Rp {game.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      <span className="text-xl font-black text-white">
                        {discountedPrice === 0
                          ? 'Gratis'
                          : `Rp ${discountedPrice.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleAddToCart(game.id)}
                      className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <FiShoppingCart /> Tambah ke Cart
                    </button>

                    <button
                      onClick={() => handleRemove(game.id)}
                      disabled={removing === game.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                      }}
                    >
                      {removing === game.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <FiTrash2 />
                      )}
                      Hapus
                    </button>

                    <Link
                      to={`/game/${game.slug}`}
                      className="text-sm text-muted hover:text-white transition-colors ml-auto"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}