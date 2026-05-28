import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RiGamepadLine } from 'react-icons/ri';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import api from '../api';

export default function PaymentConfirm() {
  const { paymentId }                       = useParams();
  const [info,        setInfo]              = useState(null);
  const [status,      setStatus]            = useState('loading');
  const [confirming,  setConfirming]        = useState(false);
  const [message,     setMessage]           = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get(`/payment/${paymentId}`);
        if (res.data.success) {
          const data = res.data.data;
          setInfo(data);
          if (data.status === 'CONFIRMED')    setStatus('confirmed');
          else if (data.status === 'EXPIRED') setStatus('expired');
          else                                setStatus('pending');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };
    fetchInfo();
  }, [paymentId]);

  const handleConfirm = async () => {
    setConfirming(true);
    setMessage('');
    try {
      const res = await api.post(`/payment/confirm/${paymentId}`);
      if (res.data.success) {
        setStatus('confirmed');
        setMessage(
          `Top up Rp ${Number(info?.amount).toLocaleString('id-ID')} berhasil!`
        );
      } else {
        setMessage(res.data.message || 'Gagal konfirmasi');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setConfirming(false);
    }
  };

  const formatRp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  // ── Shared page container style ────────────────────
  const pageStyle = {
    minHeight:      '100vh',
    background:     '#050b18',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        24,
    fontFamily:     "'Inter', sans-serif",
  };

  const cardStyle = {
    width:        '100%',
    maxWidth:     420,
    background:   '#0a1628',
    border:       '1px solid #1a2744',
    borderRadius: 24,
    padding:      32,
    textAlign:    'center',
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* ── Logo ──────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, marginBottom: 28,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RiGamepadLine style={{ color: 'white', fontSize: 20 }} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>
            Games<span style={{ color: '#38bdf8' }}>Hub</span>
          </span>
        </div>

        {/* ── Loading ───────────────────────────────── */}
        {status === 'loading' && (
          <div>
            <div style={{
              width: 40, height: 40, margin: '0 auto 16px',
              border: '3px solid rgba(37,99,235,0.3)',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              Memuat informasi pembayaran...
            </p>
          </div>
        )}

        {/* ── Error ─────────────────────────────────── */}
        {status === 'error' && (
          <>
            <FiXCircle style={{ color: '#ef4444', fontSize: 56, marginBottom: 16 }} />
            <p style={{ color: '#ef4444', fontSize: 18, fontWeight: 700 }}>
              Payment tidak ditemukan
            </p>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
              Link mungkin sudah tidak valid.
            </p>
          </>
        )}

        {/* ── Expired ───────────────────────────────── */}
        {status === 'expired' && (
          <>
            <FiClock style={{ color: '#f59e0b', fontSize: 56, marginBottom: 16 }} />
            <p style={{ color: '#f59e0b', fontSize: 18, fontWeight: 700 }}>
              QR Code Kadaluarsa
            </p>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              QR Code berlaku selama 10 menit.<br />
              Silakan generate QR baru di halaman Cart.
            </p>
          </>
        )}

        {/* ── Confirmed ─────────────────────────────── */}
        {status === 'confirmed' && (
          <>
            <FiCheckCircle style={{ color: '#22c55e', fontSize: 64, marginBottom: 16 }} />
            <p style={{ color: '#22c55e', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Pembayaran Berhasil!
            </p>
            {message && (
              <p style={{ color: '#4ade80', fontSize: 16, marginBottom: 12 }}>
                {message}
              </p>
            )}
            <div style={{
              background:   'rgba(34,197,94,0.08)',
              border:       '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12, padding: '12px 16px',
              marginTop:    16,
            }}>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                ✅ Saldo telah ditambahkan ke akun kamu.<br />
                Kamu bisa menutup halaman ini.
              </p>
            </div>
          </>
        )}

        {/* ── Pending — form konfirmasi ──────────────── */}
        {status === 'pending' && info && (
          <>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              Konfirmasi Pembayaran
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
              Halo,{' '}
              <strong style={{ color: '#38bdf8' }}>{info.username}</strong>!
            </p>

            {/* Amount */}
            <div style={{
              background:   '#0d1e35',
              border:       '1px solid #1a2744',
              borderRadius: 16, padding: '20px 24px',
              marginBottom: 20,
            }}>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 6px' }}>
                Jumlah Top Up
              </p>
              <p style={{
                fontSize: 34, fontWeight: 900, margin: 0,
                background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {formatRp(info.amount)}
              </p>
            </div>

            {/* Info box */}
            <div style={{
              background:   'rgba(37,99,235,0.08)',
              border:       '1px solid rgba(37,99,235,0.2)',
              borderRadius: 12, padding: '12px 16px',
              marginBottom: 20, textAlign: 'left',
            }}>
              <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.7 }}>
                ℹ️ Pastikan kamu adalah pemilik akun{' '}
                <strong style={{ color: '#38bdf8' }}>{info.username}</strong>.
                Klik tombol di bawah untuk menyelesaikan pembayaran.
              </p>
            </div>

            {/* Error message */}
            {message && (
              <p style={{
                color: '#ef4444', fontSize: 13,
                marginBottom: 12, padding: '8px 12px',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: 8,
              }}>
                {message}
              </p>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={confirming}
              style={{
                width:       '100%',
                padding:     '16px',
                background:  confirming
                  ? '#1a2744'
                  : 'linear-gradient(135deg, #2563eb, #0891b2)',
                border:      'none',
                borderRadius: 14,
                color:       'white',
                fontSize:    16,
                fontWeight:  700,
                cursor:      confirming ? 'not-allowed' : 'pointer',
                display:     'flex',
                alignItems:  'center',
                justifyContent: 'center',
                gap:         8,
                transition:  'opacity 0.2s',
                opacity:     confirming ? 0.7 : 1,
              }}>
              {confirming ? (
                <>
                  <div style={{
                    width: 18, height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius:   '50%',
                    animation:      'spin 1s linear infinite',
                  }} />
                  Memproses...
                </>
              ) : (
                '✅ Konfirmasi Pembayaran'
              )}
            </button>
          </>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}