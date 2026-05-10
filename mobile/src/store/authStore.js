import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,

  // ---- helpers ----
  isAdmin: () => get().user?.rol === 'admin',

  // ---- init (call once on app mount) ----
  init: async () => {
    try {
      const token = await AsyncStorage.getItem('cyclerace_token');
      if (token) {
        const res = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: res.data, token, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      await AsyncStorage.removeItem('cyclerace_token');
      set({ user: null, token: null, loading: false });
    }
  },

  // ---- login ----
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    await AsyncStorage.setItem('cyclerace_token', token);
    set({ user, token });
    return user;
  },

  // ---- register ----
  register: async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    const { token, user } = res.data;
    await AsyncStorage.setItem('cyclerace_token', token);
    set({ user, token });
    return user;
  },

  // ---- logout ----
  logout: async () => {
    await AsyncStorage.removeItem('cyclerace_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
