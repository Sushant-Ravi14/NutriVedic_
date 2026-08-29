import { create } from 'zustand';

const safeJSONParse = (val) => {
  try {
    if (!val || val === 'undefined' || val === 'null') return null;
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
};

const storedUser = safeJSONParse(localStorage.getItem('nutrivedic_user'));
const storedProfile = safeJSONParse(localStorage.getItem('nutrivedic_profile'));
const storedToken = localStorage.getItem('nutrivedic_token');

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  profile: storedProfile,
  accessToken: storedToken || null,
  isAuthenticated: Boolean(storedToken && storedUser),

  setAuth: (user, profile, token) => {
    if (user) localStorage.setItem('nutrivedic_user', JSON.stringify(user));
    else localStorage.removeItem('nutrivedic_user');

    if (profile) localStorage.setItem('nutrivedic_profile', JSON.stringify(profile));
    else localStorage.removeItem('nutrivedic_profile');

    if (token) localStorage.setItem('nutrivedic_token', token);
    else localStorage.removeItem('nutrivedic_token');

    set({
      user,
      profile,
      accessToken: token,
      isAuthenticated: Boolean(user && token)
    });
  },

  setAccessToken: (token) => {
    if (token) localStorage.setItem('nutrivedic_token', token);
    else localStorage.removeItem('nutrivedic_token');
    set({ accessToken: token });
  },

  updateProfile: (profile) => {
    if (profile) localStorage.setItem('nutrivedic_profile', JSON.stringify(profile));
    else localStorage.removeItem('nutrivedic_profile');
    set((state) => ({ ...state, profile }));
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    localStorage.setItem('nutrivedic_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearAuth: () => {
    localStorage.removeItem('nutrivedic_user');
    localStorage.removeItem('nutrivedic_profile');
    localStorage.removeItem('nutrivedic_token');
    set({
      user: null,
      profile: null,
      accessToken: null,
      isAuthenticated: false
    });
  },

  isPremium: () => {
    const user = get().user;
    return user?.subscriptionTier === 'premium';
  }
}));
