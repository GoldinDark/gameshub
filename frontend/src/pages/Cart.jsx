import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiArrowRight, FiCreditCard } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import QrisPayment    from '../components/QrisPayment';
import useCartStore   from '../store/useCartStore';
import useAuthStore   from '../store/useAuthStore';
import api from '../api';
import toast from 'react-hot-toast';

const getImageSrc = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith('http')) return thumbnail;
  return `http://localhost:5000${thumbnail}`;
};

export default function Cart() {
  const { user, updateUser }                         = useAuthStore();
  const { items, total, loading, fetchCart,
          removeFromCart }                           = useCartStore();
  const navigate                                     = useNavigate();

  const [checkingOut, setCheckingOut] = useState(false);
  const [showQris,    setShowQris]    = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
  }, [user]);

  // ── Setelah QRIS sukses ────────────────────────────
  const handleQrisSuccess = async () => {
    setShowQris(false);
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) updateUser(res.data.data);
    } catch {}
    fetchCart();
    toast.success('Saldo berhasil ditambahkan! 🎉');
  };

  // ── Checkout ───────────────────────────────────────
  const handleCheckout = async () => {
    if (items.length === 0) return;

    if ((user?.balance || 0) < total) {
      toast.error('Saldo tidak cukup! Silakan top up terlebih dahulu.');
      setShowQris(true);
      return;
    }

    try {
      setCheckingOut(true);
      await api.post('/orders/checkout');
      toast.success('Pembelian berhasil! Game sudah ada di library kamu 🎮');
      fetchCart();
      const meRes = await api.get('/auth/me');
      if (meRes.data.success) updateUser(meRes.data.data);
      navigate('/library');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout gagal.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!user) return null;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
        <FiShoppingCart className="text-accent" />
        Keranjang Belanja
      </h1>

      {items.length === 0 ? (
        /* ── Empty state ─────────────────────────────── */
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-8xl">🛒</span>
          <h2 className="text-2xl font-bold text-white">Cart Kosong</h2>
          <p className="text-muted">Belum ada game di cart. Yuk cari game dulu!</p>
          <Link to="/store" className="btn-primary flex items-center gap-2">
            Ke Store <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Kiri: List item ─────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const harga = item.game.price -
                (item.game.price * item.game.discount / 100);
              return (
                <div key={item.id}
                  className="flex gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: 'rgba(10,22,40,0.8)',
                    border:     '1px solid rgba(26,39,68,0.8)',
                  }}>
                  {/* Thumbnail */}
                  <Link to={`/game/${item.game.slug}`} className="flex-shrink-0">
                    <div className="w-28 h-20 rounded-xl overflow-hidden bg-border">
                      {item.game.thumbnail ? (
                        <img
                          src={getImageSrc(item.game.thumbnail)}
                          alt={item.game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/game/${item.game.slug}`}>
                      <h3 className="font-bold text-white hover:text-glow transition-colors mb-1 line-clamp-1">
                        {item.game.title}
                      </h3>
                    </Link>
                    <span className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: '#38bdf8' }}>
                      {item.game.genre?.name}
                    </span>
                    <div className="mt-2">
                      {item.game.discount > 0 && (
                        <span className="text-xs text-muted line-through block">
                          Rp {item.game.price.toLocaleString('id-ID')}
                        </span>
                      )}
                      <span className="font-bold text-white">
                        Rp {harga.toLocaleString('id-ID')}
                      </span>
                      {item.game.discount > 0 && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(34,197,94,0.15)',
                            color: '#4ade80',
                          }}>
                          -{item.game.discount}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.gameId)}
                    className="self-start p-2 rounded-lg transition-colors"
                    style={{ color: '#64748b' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Kanan: Summary ──────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 sticky top-20 space-y-4"
              style={{
                background:   'rgba(10,22,40,0.9)',
                border:       '1px solid rgba(26,39,68,0.8)',
                backdropFilter: 'blur(12px)',
              }}>
              <h2 className="text-lg font-bold text-white">Ringkasan Pesanan</h2>

              {/* Item list */}
              <div className="space-y-2 pb-4"
                style={{ borderBottom: '1px solid rgba(26,39,68,0.8)' }}>
                {items.map((item) => {
                  const h = item.game.price -
                    (item.game.price * item.game.discount / 100);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted line-clamp-1 flex-1 mr-2">
                        {item.game.title}
                      </span>
                      <span className="text-slate-300 flex-shrink-0">
                        Rp {h.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-lg" style={{ color: '#38bdf8' }}>
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Saldo */}
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(5,11,24,0.8)' }}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Saldo kamu</span>
                  <span className={`font-bold ${
                    (user?.balance || 0) >= total
                      ? 'text-success' : 'text-danger'
                  }`}>
                    Rp {(user?.balance || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                {(user?.balance || 0) < total && (
                  <p className="text-xs text-danger mt-1">
                    Kurang Rp {(total - (user?.balance || 0)).toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* Checkout */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {checkingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <><FiShoppingCart /> Checkout Sekarang</>
                )}
              </button>

              {/* Top Up via QRIS */}
              <button
                onClick={() => setShowQris(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-sm transition-all"
                style={{
                  background:  'transparent',
                  border:      '1px solid rgba(6,182,212,0.5)',
                  color:       '#06b6d4',
                }}>
                <FiCreditCard /> Top Up via QRIS
              </button>
            </div>
          </div>

        </div>
      )}

      {/* QRIS Modal */}
      {showQris && (
        <QrisPayment
          onSuccess={handleQrisSuccess}
          onClose={() => setShowQris(false)}
        />
      )}
    </div>
  );
}