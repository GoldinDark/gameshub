import { useState, useEffect, useRef } from 'react';
import { FiX, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import api from '../api';

export default function QrisPayment({ amount, onSuccess, onClose }) {
  const [step,        setStep]        = useState('select'); // select | qr | success
  const [qrData,      setQrData]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [timeLeft,    setTimeLeft]    = useState(600); // 10 menit
  const [pollStatus,  setPollStatus]  = useState('pending');
  const pollRef    = useRef(null);
  const countdownRef = useRef(null);

  const AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];
  const selectedAmt = amount || 100000;

  const generateQR = async (amt) => {
    setLoading(true);
    try {
      const res = await api.post('/payment/generate', { amount: amt });
      if (res.data.success) {
        setQrData(res.data.data);
        setStep('qr');
        setTimeLeft(600);
        startPolling(res.data.data.paymentId);
        startCountdown();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat QR');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentId) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/payment/status/${paymentId}`);
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
        }
      } catch {}
    }, 3000); // poll setiap 3 detik
  };

  const startCountdown = () => {
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          clearInterval(pollRef.current);
          setPollStatus('EXPIRED');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => {
    clearInterval(pollRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const formatRp   = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#0a1628',
        border: '1px solid #1a2744',
        borderRadius: 24, padding: 28,
        position: 'relative',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.05)',
          border: 'none', borderRadius: 8,
          color: '#94a3b8', cursor: 'pointer',
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiX />
        </button>

        {/* STEP: SELECT AMOUNT */}
        {step === 'select' && (
          <>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
              💰 Top Up via QRIS
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Pilih nominal top up
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10, marginBottom: 20,
            }}>
              {AMOUNTS.map(amt => (
                <button key={amt} onClick={() => generateQR(amt)}
                  disabled={loading}
                  style={{
                    padding: '14px 8px',
                    background: 'rgba(37,99,235,0.08)',
                    border: '1px solid rgba(37,99,235,0.2)',
                    borderRadius: 12, color: 'white',
                    fontSize: 14, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(37,99,235,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(37,99,235,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)';
                  }}
                >
                  {loading ? '...' : formatRp(amt)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP: SHOW QR */}
        {step === 'qr' && qrData && (
          <>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center' }}>
              Scan QR Code
            </h2>
            <p style={{ color: '#38bdf8', fontWeight: 700, fontSize: 20, textAlign: 'center', marginBottom: 16 }}>
              {formatRp(qrData.amount)}
            </p>

            {/* QR Image */}
            <div style={{
              background: 'white', borderRadius: 16,
              padding: 16, display: 'inline-block',
              margin: '0 auto 16px', display: 'flex',
              justifyContent: 'center',
            }}>
              <img src={qrData.qrCode} alt="QRIS" style={{ width: 220, height: 220 }} />
            </div>

            {/* Instruksi */}
            <div style={{
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: 12, padding: '12px 16px',
              marginBottom: 16, fontSize: 13,
              color: '#94a3b8', lineHeight: 1.7,
            }}>
              <p style={{ margin: 0 }}>
                📱 Buka kamera HP → scan QR di atas → klik <strong style={{ color: '#38bdf8' }}>Konfirmasi Pembayaran</strong>
              </p>
            </div>

            {/* Countdown */}
            {pollStatus !== 'EXPIRED' ? (
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                color: timeLeft < 60 ? '#ef4444' : '#64748b',
                fontSize: 14,
              }}>
                <FiClock />
                <span>Kadaluarsa dalam <strong>{formatTime(timeLeft)}</strong></span>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>
                  QR Code kadaluarsa
                </p>
                <button onClick={() => setStep('select')} style={{
                  background: 'none',
                  border: '1px solid #38bdf8',
                  borderRadius: 10, color: '#38bdf8',
                  padding: '8px 20px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <FiRefreshCw size={14} /> Generate Ulang
                </button>
              </div>
            )}

            {/* Polling status indicator */}
            {pollStatus === 'PENDING' && (
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6,
                marginTop: 12, color: '#64748b', fontSize: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#22c55e',
                  animation: 'blink 1.5s infinite',
                }} />
                Menunggu konfirmasi...
              </div>
            )}
          </>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <FiCheckCircle style={{ color: '#22c55e', fontSize: 64, marginBottom: 16 }} />
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Pembayaran Berhasil! 🎉
            </h2>
            <p style={{ color: '#4ade80', fontSize: 16 }}>
              {formatRp(qrData?.amount)} telah ditambahkan ke saldo
            </p>
          </div>
        )}

        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    </div>
  );
}