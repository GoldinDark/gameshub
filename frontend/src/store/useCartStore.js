import { create } from 'zustand';
import api from '../api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const res = await api.get('/cart');
      set({ items: res.data.data.cart, total: res.data.data.total });
    } catch {
      // cart kosong atau belum login
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (gameId) => {
    try {
      await api.post(`/cart/${gameId}`);
      toast.success('Game ditambahkan ke cart!');
      get().fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke cart.');
    }
  },

  removeFromCart: async (gameId) => {
    try {
      await api.delete(`/cart/${gameId}`);
      toast.success('Game dihapus dari cart.');
      get().fetchCart();
    } catch {
      toast.error('Gagal menghapus dari cart.');
    }
  },
}));

export default useCartStore;