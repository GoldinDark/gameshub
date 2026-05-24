import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiArrowRight, FiPlus } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import api from '../api';
import toast from 'react-hot-toast';

export default function Cart() {
    const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    return `http://localhost:5000${thumbnail}`;
  };
  const { user, updateUser } = useAuthStore();
  const { items, total, loading, fetchCart, removeFromCart } = useCartStore();
  const navigate = useNavigate();

  const [checkingOut, setCheckingOut] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [toppingUp,   setToppingUp]   = useState(false);
  const [showTopUp,   setShowTopUp]   = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
  }, [user]);

  // ── Top Up saldo ───────────────────────────────────────
  const handleTopUp = async () => {
    if (!topUpAmount || parseInt(topUpAmount) <= 0) {
      toast.error('Masukkan jumlah top up yang valid.');
      return;
    }
    try {
      setToppingUp(true);
      const res = await api.post('/orders/topup', { amount: parseInt(topUpAmount) });
      updateUser({ balance: res.data.data.balance });
      toast.success(`Top up Rp${parseInt(topUpAmount).toLocaleString('id-ID')} berhasil!`);
      setTopUpAmount('');
      setShowTopUp(false);
    } catch {
      toast.error('Gagal top up.');
    } finally {
      setToppingUp(false);
    }
  };

  // ── Checkout ───────────────────────────────────────────
  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (user.balance < total) {
      toast.error('Saldo tidak cukup! Lakukan top up terlebih dahulu.');
      setShowTopUp(true);
      return;
    }
    try {
      setCheckingOut(true);
      await api.post('/orders/checkout');
      toast.success('Pembelian berhasil! Game sudah ada di library kamu 🎮');
      fetchCart();
      const meRes = await api.get('/auth/me');
      updateUser(meRes.data.data);
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
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <FiShoppingCart className="text-accent" /> Keranjang Belanja
      </h1>

      {items.length === 0 ? (
        /* Empty cart */
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

          {/* ── Kiri: List item cart ─────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const harga = item.game.price - (item.game.price * item.game.discount / 100);
              return (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-xl p-4 flex gap-4 hover:border-accent/50 transition-all"
                >
                  {/* Thumbnail */}
                  <Link to={`/game/${item.game.slug}`} className="flex-shrink-0">
                    <div className="w-28 h-20 rounded-lg overflow-hidden bg-border">
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
                  <div className="flex-1">
                    <Link to={`/game/${item.game.slug}`}>
                      <h3 className="font-semibold text-white hover:text-accent transition-colors mb-1">
                        {item.game.title}
                      </h3>
                    </Link>
                    <span className="text-xs text-accent">{item.game.genre?.name}</span>
                    <div className="mt-2">
                      {item.game.discount > 0 && (
                        <span className="text-xs text-muted line-through block">
                          Rp {item.game.price.toLocaleString('id-ID')}
                        </span>
                      )}
                      <span className="text-white font-bold">
                        Rp {harga.toLocaleString('id-ID')}
                      </span>
                      {item.game.discount > 0 && (
                        <span className="ml-2 badge bg-success/20 text-success text-xs">
                          -{item.game.discount}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.gameId)}
                    className="self-start p-2 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Kanan: Summary & Checkout ────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-20 space-y-4">
              <h2 className="text-lg font-bold text-white">Ringkasan Pesanan</h2>

              {/* Item list */}
              <div className="space-y-2 border-b border-border pb-4">
                {items.map((item) => {
                  const harga = item.game.price - (item.game.price * item.game.discount / 100);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted line-clamp-1 flex-1 mr-2">{item.game.title}</span>
                      <span className="text-slate-300 flex-shrink-0">Rp {harga.toLocaleString('id-ID')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-accent text-lg">Rp {total.toLocaleString('id-ID')}</span>
              </div>

              {/* Saldo user */}
              <div className="bg-darker rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Saldo kamu</span>
                  <span className={`font-bold ${user.balance >= total ? 'text-success' : 'text-danger'}`}>
                    Rp {(user.balance || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                {user.balance < total && (
                  <p className="text-xs text-danger mt-1">
                    Kurang Rp {(total - user.balance).toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {checkingOut ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
                ) : (
                  <><FiShoppingCart /> Checkout Sekarang</>
                )}
              </button>

              {/* Top Up section */}
              <button
                onClick={() => setShowTopUp(!showTopUp)}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <FiPlus /> Top Up Saldo
              </button>

              {showTopUp && (
                <div className="bg-darker rounded-lg p-4 space-y-3 animate-fade-in">
                  <p className="text-sm text-slate-300 font-medium">Jumlah Top Up</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 200000, 500000, 1000000, 2000000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTopUpAmount(amt.toString())}
                        className={`text-xs py-2 rounded-lg border transition-all
                          ${topUpAmount === amt.toString()
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-card border-border text-muted hover:border-accent/50'
                          }`}
                      >
                        {(amt/1000).toFixed(0)}rb
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Atau masukkan jumlah..."
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="input-field w-full text-sm"
                  />
                  <button
                    onClick={handleTopUp}
                    disabled={toppingUp}
                    className="btn-neon w-full text-sm"
                  >
                    {toppingUp ? 'Memproses...' : `Top Up Rp ${parseInt(topUpAmount || 0).toLocaleString('id-ID')}`}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}