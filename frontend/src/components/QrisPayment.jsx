import { useState, useEffect, useRef } from 'react';
import { FiX, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';
import api from '../api';

const formatRp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

const TOPUP_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function QrisPayment({ amount, type = 'TOPUP', onSuccess, onClose }) {
  const [step,         setStep]         = useState(
    type === 'TOPUP' && !amount ? 'select' : 'generating'
  );
  const [selectedAmt,  setSelectedAmt]  = useState(amount || null);
  const [qrData,       setQrData]       = useState(null);
  const [timeLeft,     setTimeLeft]     = useState(600);
  const [error,        setError]        = useState('');

  const pollRef      = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (step === 'generating' && selectedAmt) {
      generateQR(selectedAmt);
    }
    return () => {
      clearInterval(pollRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const handleSelectAmount = (amt) => {
    setSelectedAmt(amt);
    setStep('generating');
    generateQR(amt);
  };

  const generateQR = async (amt) => {
    setStep('generating');
    setError('');
    try {
      const res = await api.post('/payment/generate', {
        amount: Number(amt),
        type,
      });
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

  const title      = type === 'CHECKOUT' ? '🎮 Pembayaran Checkout' : '💰 Top Up via QRIS';
  const successMsg = type === 'CHECKOUT'
    ? 'Pembayaran berhasil! Game masuk ke Library kamu 🎮'
    : `Top up ${selectedAmt ? formatRp(selectedAmt) : ''} berhasil! 🎉`;

  const handleClose = () => {
    clearInterval(pollRef.current);
    clearInterval(countdownRef.current);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#0a1628',
        border: '1px solid #1a2744',
        borderRadius: 24, padding: '28px 24px',
        position: 'relative', textAlign: 'center',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Close */}
        {step !== 'success' && (
          <button onClick={handleClose} style={{
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
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, marginBottom: 20,
        }}>
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

        {/* ── SELECT AMOUNT (Top Up only) ── */}
        {step === 'select' && (
          <>
            <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              💰 Top Up via QRIS
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Pilih nominal top up
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10, marginBottom: 8,
            }}>
              {TOPUP_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  onClick={() => handleSelectAmount(amt)}
                  style={{
                    padding: '14px 8px',
                    background: 'rgba(37,99,235,0.08)',
                    border: '1px solid rgba(37,99,235,0.25)',
                    borderRadius: 12, color: 'white',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(37,99,235,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.6)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(37,99,235,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)';
                  }}
                >
                  {formatRp(amt)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── GENERATING ── */}
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

        {/* ── ERROR ── */}
        {step === 'error' && (
          <>
            <p style={{ color: '#ef4444', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              ❌ {error}
            </p>
            <button
              onClick={() => type === 'TOPUP' && !amount
                ? setStep('select')
                : generateQR(selectedAmt)
              }
              style={{
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
              fontSize: 26, fontWeight: 900, marginBottom: 16,
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {formatRp(selectedAmt || qrData.amount)}
            </p>

            {/* QR Image */}
            <div style={{
              background: 'white', borderRadius: 16, padding: 12,
              display: 'flex', justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 0 24px rgba(37,99,235,0.3)',
            }}>
              <img
                src={qrData.qrCode}
                alt="QRIS Payment"
                style={{ width: 200, height: 200, display: 'block' }}
              />
            </div>

            {/* Instruksi */}
            <div style={{
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: 10, padding: '10px 14px',
              marginBottom: 14, fontSize: 12,
              color: '#94a3b8', lineHeight: 1.7,
            }}>
              📱 Buka <strong style={{ color: '#38bdf8' }}>kamera HP</strong> → scan QR →
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
              justifyContent: 'center', gap: 5, fontSize: 13,
              color: timeLeft < 60 ? '#ef4444' : '#64748b',
            }}>
              <FiClock size={13} />
              <span>Kadaluarsa dalam <strong>{formatTime(timeLeft)}</strong></span>
            </div>
          </>
        )}

        {/* ── EXPIRED ── */}
        {step === 'expired' && (
          <>
            <FiClock style={{ color: '#f59e0b', fontSize: 52, marginBottom: 12 }} />
            <p style={{ color: '#f59e0b', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
              QR Code Kadaluarsa
            </p>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              QR berlaku 10 menit. Silakan generate ulang.
            </p>
            <button
              onClick={() => {
                if (type === 'TOPUP' && !amount) {
                  setStep('select');
                } else {
                  generateQR(selectedAmt);
                }
              }}
              style={{
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

        {/* ── SUCCESS ── */}
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
          @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        `}</style>
      </div>
    </div>
  );
}