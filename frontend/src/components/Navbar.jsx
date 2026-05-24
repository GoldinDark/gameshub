import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  FiShoppingCart, FiLogOut, FiMenu, FiX,
  FiBookOpen, FiHeart
} from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout }  = useAuthStore();
  const { items }         = useCartStore();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Sampai jumpa!');
    navigate('/login');
  };

  const navLinks = [
    { to: '/',      label: 'Home' },
    { to: '/store', label: 'Store' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(2,8,16,0.92)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(26,39,68,0.8)',
      }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* ── Logo ──────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:shadow-glow"
            style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
            <RiGamepadLine className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Games<span className="gradient-text">Hub</span>
          </span>
        </Link>

        {/* ── Nav Links Desktop ─────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: isActive(link.to) ? '#38bdf8' : '#64748b',
                background: isActive(link.to) ? 'rgba(37,99,235,0.1)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right Side Desktop ────────────────────────── */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Saldo */}
              <div className="px-3 py-1.5 rounded-lg text-sm mr-1"
                style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(26,39,68,0.8)' }}>
                <span className="text-muted text-xs">Rp </span>
                <span className="font-bold" style={{ color: '#4ade80' }}>
                  {(user.balance || 0).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Cart */}
              <Link to="/cart"
                className="relative p-2 rounded-lg transition-all duration-200"
                style={{ color: '#64748b' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                title="Cart"
              >
                <FiShoppingCart className="text-xl" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                    {items.length > 9 ? '9+' : items.length}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist"
                className="relative p-2 rounded-lg transition-all duration-200"
                style={{ color: '#64748b' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f472b6'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                title="Wishlist"
              >
                <FiHeart className="text-xl" />
                {user?._count?.wishlist > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
                    {user._count.wishlist > 9 ? '9+' : user._count.wishlist}
                  </span>
                )}
              </Link>

              {/* Library */}
              <Link to="/library"
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: '#64748b' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                title="Library"
              >
                <FiBookOpen className="text-xl" />
              </Link>

              {/* Divider */}
              <div className="w-px h-6 mx-1" style={{ background: 'rgba(26,39,68,0.8)' }} />

              {/* Avatar + Username */}
              <Link to="/profile"
                className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200"
                style={{ color: '#94a3b8' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(6,182,212,0.3))',
                    border: '1px solid rgba(56,189,248,0.3)',
                    color: '#38bdf8',
                  }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300">{user.username}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: '#64748b' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                title="Logout"
              >
                <FiLogOut className="text-lg" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Masuk</Link>
              <Link to="/register" className="btn-primary  text-sm py-2 px-4">Daftar</Link>
            </div>
          )}
        </div>

        {/* ── Hamburger Mobile ──────────────────────────── */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: '#64748b' }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1 animate-fade-in"
          style={{
            background: 'rgba(2,8,16,0.97)',
            borderColor: 'rgba(26,39,68,0.8)',
          }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: isActive(link.to) ? '#38bdf8' : '#64748b' }}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <div className="h-px my-2" style={{ background: 'rgba(26,39,68,0.8)' }} />

              {/* Saldo mobile */}
              <div className="px-4 py-2 text-sm">
                <span className="text-muted">Saldo: </span>
                <span className="font-bold" style={{ color: '#4ade80' }}>
                  Rp {(user.balance || 0).toLocaleString('id-ID')}
                </span>
              </div>

              <Link to="/cart" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#64748b' }}>
                <span>🛒 Cart</span>
                {items.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa' }}>
                    {items.length}
                  </span>
                )}
              </Link>

              <Link to="/wishlist" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#64748b' }}>
                <span>❤️ Wishlist</span>
                {user?._count?.wishlist > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(236,72,153,0.2)', color: '#f472b6' }}>
                    {user._count.wishlist}
                  </span>
                )}
              </Link>

              <Link to="/library" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#64748b' }}>
                📚 Library
              </Link>

              <Link to="/profile" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#64748b' }}>
                👤 Profil
              </Link>

              <div className="h-px my-2" style={{ background: 'rgba(26,39,68,0.8)' }} />

              <button onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#ef4444' }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login"    className="btn-secondary text-sm flex-1 text-center py-2">Masuk</Link>
              <Link to="/register" className="btn-primary  text-sm flex-1 text-center py-2">Daftar</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}