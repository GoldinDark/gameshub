import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiGamepadLine } from 'react-icons/ri';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import api from '../api';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({
    username: '',
    email:    '',
    password: '',
    confirm:  '',
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Password strength ──────────────────────────────────
  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6)              score++;
    if (pass.length >= 10)             score++;
    if (/[A-Z]/.test(pass))            score++;
    if (/[0-9]/.test(pass))            score++;
    if (/[^A-Za-z0-9]/.test(pass))    score++;
    const levels = [
      { label: '',          color: '' },
      { label: 'Lemah',     color: 'bg-danger' },
      { label: 'Cukup',     color: 'bg-yellow-500' },
      { label: 'Baik',      color: 'bg-blue-500' },
      { label: 'Kuat',      color: 'bg-success' },
      { label: 'Sangat Kuat', color: 'bg-success' },
    ];
    return { score, ...levels[score] };
  };

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password || !form.confirm) {
      toast.error('Semua field wajib diisi.'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter.'); return;
    }
    if (form.password !== form.confirm) {
      toast.error('Konfirmasi password tidak cocok.'); return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        username: form.username,
        email:    form.email,
        password: form.password,
      });
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success('Registrasi berhasil! Selamat datang!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-10">

      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
            <RiGamepadLine className="text-accent text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Daftar ke <span className="text-accent">GameStore</span>
          </h1>
          <p className="text-muted text-sm mt-1">Bergabung dan mulai bermain!</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input
                  type="text"
                  name="username"
                  placeholder="username_kamu"
                  value={form.username}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 karakter"
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

              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300
                          ${i <= strength.score ? strength.color : 'bg-border'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted">{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  placeholder="Ulangi password"
                  value={form.confirm}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${
                    form.confirm && form.password !== form.confirm
                      ? 'border-danger focus:border-danger focus:ring-danger'
                      : form.confirm && form.password === form.confirm
                      ? 'border-success focus:border-success focus:ring-success'
                      : ''
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {form.confirm && form.password === form.confirm && (
                    <FiCheck className="text-success" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-muted hover:text-white transition-colors"
                  >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-danger mt-1">Password tidak cocok.</p>
              )}
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
              ) : 'Buat Akun'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-xs">atau</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-accent hover:text-glow font-medium transition-colors">
              Masuk sekarang
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}