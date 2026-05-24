import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function GameCard({ game }) {
    const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    return `http://localhost:5000${thumbnail}`;
  };
  const { addToCart } = useCartStore();
  const { user }      = useAuthStore();

  const discountedPrice = game.discount > 0
    ? game.price - (game.price * game.discount / 100)
    : game.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login dulu untuk membeli game!'); return; }
    addToCart(game.id);
  };

  return (
    <Link to={`/game/${game.slug}`} className="card-game group block">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-border">
        {game.thumbnail ? (
          <img
            src={getImageSrc(game.thumbnail)}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-card">
            <span className="text-muted text-4xl">🎮</span>
          </div>
        )}

        {/* Discount badge */}
        {game.discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-success/20 text-success border border-success/30">
            -{game.discount}%
          </span>
        )}

        {/* Featured badge */}
        {game.isFeatured && (
          <span className="absolute top-2 right-2 badge bg-accent/20 text-accent border border-accent/30">
            Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Genre */}
        <span className="text-xs text-accent font-medium uppercase tracking-wide">
          {game.genre?.name}
        </span>

        {/* Title */}
        <h3 className="text-white font-semibold mt-1 mb-2 line-clamp-1 group-hover:text-accent transition-colors">
          {game.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <AiFillStar className="text-yellow-400 text-sm" />
          <span className="text-sm text-slate-400">
            {game.rating > 0 ? game.rating.toFixed(1) : 'Belum ada rating'}
          </span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between">
          <div>
            {game.discount > 0 && (
              <span className="text-xs text-muted line-through block">
                Rp {game.price.toLocaleString('id-ID')}
              </span>
            )}
            <span className="text-white font-bold">
              Rp {discountedPrice.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/30 transition-all duration-200"
          >
            <FiShoppingCart className="text-lg" />
          </button>
        </div>
      </div>
    </Link>
  );
}