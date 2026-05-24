import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuthStore from '../store/useAuthStore';
import api from '../api';

export default function Library() {
    const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    return `http://localhost:5000${thumbnail}`;
  };
  const { user }     = useAuthStore();
  const navigate     = useNavigate();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const res = await api.get('/orders/library');
        setLibrary(res.data.data);
      } catch {
        /* error */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <FiBookOpen className="text-accent" /> Library Saya
        </h1>
        <p className="text-muted">{library.length} game dimiliki</p>
      </div>

      {library.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-8xl">📚</span>
          <h2 className="text-2xl font-bold text-white">Library Kosong</h2>
          <p className="text-muted">Kamu belum punya game. Yuk beli game pertamamu!</p>
          <Link to="/store" className="btn-primary flex items-center gap-2">
            Ke Store <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {library.map((item) => (
            <Link
              key={item.id}
              to={`/game/${item.game.slug}`}
              className="card-game group block"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-border">
                {item.game.thumbnail ? (
                  <img
                    src={getImageSrc(item.game.thumbnail)}
                    alt={item.game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                )}
                {/* Owned badge */}
                <span className="absolute top-2 left-2 badge bg-success/20 text-success border border-success/30 text-xs">
                  ✓ Dimiliki
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <span className="text-xs text-accent font-medium">
                  {item.game.genre?.name}
                </span>
                <h3 className="text-white font-semibold text-sm mt-0.5 line-clamp-1 group-hover:text-accent transition-colors">
                  {item.game.title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <AiFillStar className="text-yellow-400 text-xs" />
                    <span className="text-xs text-muted">
                      {item.game.rating > 0 ? item.game.rating.toFixed(1) : '-'}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(item.addedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}