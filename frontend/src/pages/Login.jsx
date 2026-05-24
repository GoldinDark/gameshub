import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiGamepadLine } from 'react-icons/ri';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import api from '../api';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate      = useNavigate();
  const { setAuth }   = useAuthStore();
  const { fetchCart } = useCartStore();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email dan password wajib diisi.');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/login', form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      await fetchCart();
      toast.success(`Selamat datang, ${user.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">

      {/* Background glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
            <RiGamepadLine className="text-accent text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Masuk ke <span className="text-accent">GameStore</span>
          </h1>
          <p className="text-muted text-sm mt-1">Selamat datang kembali, gamer!</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input
                  type="email"
                  name="email"
                  placeholder="email@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : 'Masuk'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-xs">atau</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted">
            Belum punya akun?{' '}
            <Link to="/register" className="text-accent hover:text-glow font-medium transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}