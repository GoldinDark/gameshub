import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import ProtectedRoute  from './components/ProtectedRoute';
import ScrollToTop     from './components/ScrollToTop';
import WakingUp        from './components/WakingUp';
import useCartStore    from './store/useCartStore';
import useAuthStore    from './store/useAuthStore';

import Home           from './pages/Home';
import Store          from './pages/Store';
import GameDetail     from './pages/GameDetail';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Library        from './pages/Library';
import Cart           from './pages/Cart';
import Profile        from './pages/Profile';
import NotFound       from './pages/NotFound';
import Wishlist       from './pages/Wishlist';
import PaymentConfirm from './pages/PaymentConfirm';

export default function App() {
  const { user }      = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  return (
    <WakingUp>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-dark flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* ── Public ─────────────────────────────── */}
              <Route path="/"           element={<Home />} />
              <Route path="/store"      element={<Store />} />
              <Route path="/game/:slug" element={<GameDetail />} />
              <Route path="/login"      element={<Login />} />
              <Route path="/register"   element={<Register />} />

              {/* ── Payment confirm (public, bisa diakses dari HP) */}
              <Route path="/payment/confirm/:paymentId" element={<PaymentConfirm />} />

              {/* ── Protected ──────────────────────────── */}
              <Route path="/cart" element={
                <ProtectedRoute><Cart /></ProtectedRoute>
              } />
              <Route path="/library" element={
                <ProtectedRoute><Library /></ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute><Wishlist /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />

              {/* ── 404 ────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background:   '#0a1628',
              color:        '#e2e8f0',
              border:       '1px solid rgba(26,39,68,0.8)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0a1628' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0a1628' } },
          }}
        />
      </BrowserRouter>
    </WakingUp>
  );
}