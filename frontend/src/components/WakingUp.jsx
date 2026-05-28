import { useState, useEffect } from 'react';
import { RiGamepadLine } from 'react-icons/ri';

export default function WakingUp({ children }) {
  const [status,  setStatus]  = useState('checking'); // checking | awake | waking
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    const check = async () => {
      try {
        const start = Date.now();
        const res   = await fetch(
          `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}/`,
          { signal: AbortSignal.timeout(60000) }
        );
        if (res.ok) {
          setStatus('awake');
          clearInterval(interval);
        }
      } catch {
        setStatus('waking');
      }
    };

    check();
    interval = setInterval(check, 5000);

    const counter = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(counter);
    };
  }, []);

  if (status === 'awake') return children;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050b18',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    }}>
      {/* Logo */}
      <div style={{
        width: 64, height: 64,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 2s infinite',
      }}>
        <RiGamepadLine style={{ color: 'white', fontSize: 32 }} />
      </div>

      <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0 }}>
        Games<span style={{ color: '#38bdf8' }}>Hub</span>
      </h1>

      {status === 'checking' ? (
        <p style={{ color: '#64748b', fontSize: 14 }}>Menghubungkan ke server...</p>
      ) : (
        <>
          <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
            Server sedang bangun dari mode hemat daya.<br/>
            Mohon tunggu sebentar...
          </p>

          {/* Progress bar animasi */}
          <div style={{
            width: 260, height: 4,
            background: '#1a2744', borderRadius: 999, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min((seconds / 50) * 100, 95)}%`,
              background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
              borderRadius: 999,
              transition: 'width 1s linear',
            }} />
          </div>

          <p style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600 }}>
            {seconds} detik...
          </p>
          <p style={{ color: '#64748b', fontSize: 12 }}>
            Biasanya membutuhkan 20-50 detik
          </p>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
          50% { box-shadow: 0 0 0 16px rgba(37,99,235,0); }
        }
      `}</style>
    </div>
  );
}