import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';
import useAuthStore from '../store/useAuthStore';
import api from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();

  const [passForm, setPassForm] = useState({
    oldPassword: '', newPassword: '', confirm: '',
  });
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) {
      toast.error('Konfirmasi password tidak cocok.'); return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter.'); return;
    }
    try {
      setSaving(true);
      await api.put('/auth/change-password', {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password berhasil diubah!');
      setPassForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">👤 Profil Saya</h1>

      {/* ── Info Card ─────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-bold text-3xl">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <span className={`badge mt-1 inline-block ${
              user?.role === 'ADMIN'
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-card border border-border text-muted'
            }`}>
              {user?.role === 'ADMIN' ? '⚡ Admin' : '🎮 Player'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Game Dimiliki', value: user?._count?.library  || 0, icon: <RiGamepadLine /> },
            { label: 'Wishlist',      value: user?._count?.wishlist || 0, icon: '❤️' },
            { label: 'Total Order',   value: user?._count?.orders   || 0, icon: '🛒' },
          ].map((stat) => (
            <div key={stat.label} className="bg-darker rounded-xl p-4 text-center border border-border">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-muted mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Info rows */}
        <div className="space-y-3 border-t border-border pt-4">
          {[
            { icon: <FiUser />,  label: 'Username', value: user?.username },
            { icon: <FiMail />,  label: 'Email',    value: user?.email },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="text-xs text-muted">{item.label}</div>
                <div className="text-sm text-slate-200 font-medium">{item.value}</div>
              </div>
            </div>
          ))}

          {/* Saldo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success flex-shrink-0">
              💰
            </div>
            <div>
              <div className="text-xs text-muted">Saldo</div>
              <div className="text-sm font-bold text-success">
                Rp {(user?.balance || 0).toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ganti Password ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <FiLock className="text-accent" /> Ganti Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Password lama */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password Lama
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="••••••••"
                value={passForm.oldPassword}
                onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                className="input-field pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                {showOld ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Password baru */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Min. 6 karakter"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="input-field pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                {showNew ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Konfirmasi */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                placeholder="Ulangi password baru"
                value={passForm.confirm}
                onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                className={`input-field pl-9 ${
                  passForm.confirm && passForm.newPassword !== passForm.confirm
                    ? 'border-danger focus:border-danger'
                    : ''
                }`}
              />
            </div>
            {passForm.confirm && passForm.newPassword !== passForm.confirm && (
              <p className="text-xs text-danger mt-1">Password tidak cocok.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
            ) : (
              <><FiSave /> Simpan Password</>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}