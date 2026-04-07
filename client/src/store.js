import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  entries: [],
  stats: {
    currentStreak: 0,
    longestStreak: 0,
    weeklyCompletion: 0,
  },
  loading: false,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, isAuthenticated: false, user: null, entries: [] });
    }
  },

  initAuth: () => {
    const { token, setToken } = get();
    if (token) {
      setToken(token); // set axios header
    }
  },

  register: async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { username, password });
      get().setToken(res.data.token);
      set({ user: res.data.user });
      return true;
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
      return false;
    }
  },

  login: async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      get().setToken(res.data.token);
      set({ user: res.data.user });
      return true;
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
      return false;
    }
  },

  logout: () => {
    get().setToken(null);
  },

  fetchUser: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`);
      set({ user: res.data });
    } catch (err) {
      get().logout();
    }
  },

  fetchEntries: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_URL}/entries`);
      set({ entries: res.data });
    } catch (err) {
      console.error('Fetch entries failed', err);
      if(err.response?.status === 401) get().logout();
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      set({ stats: res.data });
    } catch (err) {
      console.error('Fetch stats failed', err);
    }
  },

  saveEntry: async (entryData) => {
    try {
      const res = await axios.post(`${API_URL}/entry`, entryData);
      await get().fetchEntries();
      await get().fetchStats();
      return res.data;
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
      throw err;
    }
  }
}));

export default useStore;
