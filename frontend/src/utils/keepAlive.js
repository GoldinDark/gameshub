const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ping backend setiap 10 menit agar tidak tidur
export const startKeepAlive = () => {
  const ping = async () => {
    try {
      await fetch(`${BACKEND_URL.replace('/api', '')}/`);
    } catch {}
  };

  ping(); // ping langsung saat pertama load
  setInterval(ping, 10 * 60 * 1000); // setiap 10 menit
};