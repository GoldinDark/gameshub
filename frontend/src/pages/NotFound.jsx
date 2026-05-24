import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const navigate          = useNavigate();
  const [count, setCount] = useState(10);

  // ── Countdown auto redirect ────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center animate-slide-up">

        {/* Icon */}
        <div className="relative inline-block mb-6">
          <RiGamepadLine className="text-accent/20 text-[180px] mx-auto" />
          <span className="absolute inset-0 flex items-center justify-center text-8xl font-bold text-white">
            404
          </span>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-muted mb-2 max-w-md mx-auto">
          Sepertinya halaman yang kamu cari sudah pindah, dihapus, atau memang tidak pernah ada.
        </p>
        <p className="text-muted text-sm mb-8">
          Kembali ke Home dalam{' '}
          <span className="text-accent font-bold text-base">{count}</span> detik...
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiArrowLeft /> Kembali
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <FiHome /> Ke Home
          </Link>
          <Link to="/store" className="btn-neon flex items-center gap-2">
            <FiSearch /> Cari Game
          </Link>
        </div>

      </div>
    </div>
  );
}