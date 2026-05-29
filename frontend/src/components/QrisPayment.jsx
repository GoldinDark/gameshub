import { useState, useEffect, useRef } from 'react';
import { FiX, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';
import api from '../api';

const formatRp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

export default function QrisPayment({ amount, type = 'TOPUP', onSuccess, onClose }) {
  const [step,       setStep]       = useState('generating'); // generating|qr|success|expired
  const [qrData,     setQrData]     = useState(null);
  const [timeLeft,   setTimeLeft]   = useState(600);
  const [pollStatus, setPollStatus] = useState('PENDING');
  const [error,      setError]      = useState('');

  const pollRef      = useRef(null);
  const countdownRef = useRef(null);

  // Generate QR saat komponen mount
  useEffect(() => {
    generateQR();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const generateQR = async () => {
    setStep('generating');
    setError('');
    try {
      const res = await api.post('/payment/generate', { amount, type });
      if (res.data.success) {
        setQrData(res.data.data);
        setStep('qr');
        setTimeLeft(600);
        startPolling(res.data.data.paymentId);
        startCountdown();
      } else {
        setError(res.data.message || 'Gagal membuat QR');
        setStep('error');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat QR Code');
      setStep('error');
    }
  };

  const startPolling = (paymentId) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res    = await api.get(`/payment/status/${paymentId}`);
        const status = res.data.data?.status;
        setPollStatus(status);

        if (status === 'CONFIRMED') {
          clearInterval(pollRef.current);
          clearInterval(countdownRef.current);
          setStep('success');
          setTimeout(() => onSuccess(), 2000);
        }
        if (status === 'EXPIRED') {
          clearInterval(pollRef.current);
          clearInterval(countdownRef.current);
          setStep('expired');
        }
      } catch {}
    }, 3000);
  };

  const startCountdown = () => {
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          clearInterval(pollRef.current);
          setStep('expired');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const formatTime = (s) =>
    `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const title = type === 'CHECKOUT'
    ? '🎮 Pembayaran Checkout'
    : '💰 Top Up via QRIS';

  const successMsg = type === 'CHECKOUT'
    ? 'Pembayaran berhasil! Game masuk ke Library kamu 🎮'
    : `Top up ${qrData ? formatRp(qrData.amount) : ''} berhasil! 🎉`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#0a1628',
        border: '1px solid #1a2744',
        borderRadius: 24, padding: '28px 24px',
        position: 'relative', textAlign: 'center',
      }}>
        {/* Close button */}
        {step !== 'success' && (
          <button onClick={() => { clearInterval(pollRef.current); clearInterval(countdownRef.current); onClose(); }}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 8,
              color: '#94a3b8', cursor: 'pointer',
              width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <FiX size={16} />
          </button>
        )}

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RiGamepadLine style={{ color: 'white', fontSize: 18 }} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
            Games<span style={{ color: '#38bdf8' }}>Hub</span>
          </span>
        </div>

        {/* ── Generating ── */}
        {step === 'generating' && (
          <>
            <div style={{
              width: 40, height: 40, margin: '0 auto 16px',
              border: '3px solid rgba(37,99,235,0.3)',
              borderTopColor: '#2563eb', borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Membuat QR Code...</p>
          </>
        )}

        {/* ── Error ── */}
        {step === 'error' && (
          <>
            <p style={{ color: '#ef4444', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              ❌ {error}
            </p>
            <button onClick={generateQR} style={{
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(37,99,235,0.4)',
              borderRadius: 10, color: '#60a5fa',
              padding: '10px 20px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <FiRefreshCw size={14} /> Coba Lagi
            </button>
          </>
        )}

        {/* ── QR ── */}
        {step === 'qr' && qrData && (
          <>
            <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
              {title}
            </h2>
            <p style={{
              fontSize: 24, fontWeight: 900, marginBottom: 16,
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {formatRp(qrData.amount)}
            </p>

            {/* QR Image — scannable */}
            <div style={{
              background: 'white', borderRadius: 16, padding: 12,
              display: 'inline-block', marginBottom: 16,
              boxShadow: '0 0 24px rgba(37,99,235,0.3)',
            }}>
              <img
                src={qrData.qrCode}
                alt="QRIS Payment QR Code"
                style={{ width: 200, height: 200, display: 'block' }}
              />
            </div>

            {/* Label QRIS */}
            <div style={{
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: 10, padding: '10px 14px',
              marginBottom: 14, fontSize: 12,
              color: '#94a3b8', lineHeight: 1.7,
            }}>
              📱 Buka <strong style={{ color: '#38bdf8' }}>kamera HP</strong> → scan QR di atas →
              klik <strong style={{ color: '#38bdf8' }}>Konfirmasi Pembayaran</strong>
            </div>

            {/* Polling indicator */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6,
              marginBottom: 10, color: '#64748b', fontSize: 12,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#22c55e', animation: 'blink 1.5s infinite',
              }} />
              Menunggu konfirmasi pembayaran...
            </div>

            {/* Countdown */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 5,
              color: timeLeft < 60 ? '#ef4444' : '#64748b',
              fontSize: 13,
            }}>
              <FiClock size={13} />
              <span>Kadaluarsa dalam <strong>{formatTime(timeLeft)}</strong></span>
            </div>
          </>
        )}

        {/* ── Expired ── */}
        {step === 'expired' && (
          <>
            <FiClock style={{ color: '#f59e0b', fontSize: 52, marginBottom: 12 }} />
            <p style={{ color: '#f59e0b', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
              QR Code Kadaluarsa
            </p>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              QR berlaku selama 10 menit.<br />Silakan generate ulang.
            </p>
            <button onClick={generateQR} style={{
              background: 'linear-gradient(135deg, #2563eb, #0891b2)',
              border: 'none', borderRadius: 12,
              color: 'white', padding: '12px 24px',
              cursor: 'pointer', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <FiRefreshCw size={14} /> Generate QR Baru
            </button>
          </>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <>
            <FiCheckCircle style={{ color: '#22c55e', fontSize: 60, marginBottom: 12 }} />
            <p style={{ color: '#22c55e', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Berhasil! 🎉
            </p>
            <p style={{ color: '#4ade80', fontSize: 14, lineHeight: 1.6 }}>
              {successMsg}
            </p>
          </>
        )}

        <style>{`
          @keyframes spin  { to { transform: rotate(360deg); } }
          @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        `}</style>
      </div>
    </div>
  );
}