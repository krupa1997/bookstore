import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, cartApi } from '../api/api';

const AuthContext = createContext(null);

// Guest cart token — persisted in localStorage so it survives page refresh
function getGuestToken() {
  let t = localStorage.getItem('bw_guest_token');
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem('bw_guest_token', t);
  }
  return t;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bw_user')) ?? null; }
    catch { return null; }
  });
  const [cart, setCart]           = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ── helpers ────────────────────────────────────────────────────────────────
  function persistSession(data) {
    localStorage.setItem('bw_token', data.accessToken);
    localStorage.setItem('bw_user', JSON.stringify(data.user));
    setUser(data.user);
    setAuthError('');
  }

  function clearSession() {
    localStorage.removeItem('bw_token');
    localStorage.removeItem('bw_user');
    setUser(null);
    setCart(null);
  }

  // ── cart ───────────────────────────────────────────────────────────────────
  const refreshCart = useCallback(async (mergeGuestToken = null) => {
    try {
      // If mergeGuestToken is supplied (post-login), send it once so the backend
      // migrates the guest cart to the user account.
      const guestToken = mergeGuestToken ?? (user ? null : getGuestToken());
      const data = await cartApi.getCart(guestToken);
      setCart(data);
    } catch {
      setCart(null);
    }
  }, [user]);

  // Load cart on mount and whenever auth state changes
  useEffect(() => { refreshCart(); }, [refreshCart]);

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  // ── auth actions ───────────────────────────────────────────────────────────
  async function login(email, password) {
    setAuthLoading(true);
    setAuthError('');
    try {
      const guestToken = getGuestToken(); // capture before session changes
      const data = await authApi.login(email, password);
      persistSession(data);
      await refreshCart(guestToken);     // merge guest cart into user cart
      return true;
    } catch (err) {
      setAuthError(err.message ?? 'Login failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }

  async function register(firstName, lastName, email, password) {
    setAuthLoading(true);
    setAuthError('');
    try {
      const guestToken = getGuestToken(); // capture before session changes
      const data = await authApi.register(firstName, lastName, email, password);
      persistSession(data);
      await refreshCart(guestToken);     // merge guest cart into user cart
      return true;
    } catch (err) {
      setAuthError(err.message ?? 'Registration failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* swallow */ }
    clearSession();
  }

  // ── cart actions ───────────────────────────────────────────────────────────
  async function addToCart(productId, quantity = 1) {
    try {
      const guestToken = user ? null : getGuestToken();
      const data = await cartApi.addToCart(productId, quantity, guestToken);
      setCart(data);
    } catch (err) {
      console.error('addToCart error:', err.message);
    }
  }

  async function removeFromCart(itemId) {
    try {
      const guestToken = user ? null : getGuestToken();
      const data = await cartApi.removeItem(itemId, guestToken);
      setCart(data);
    } catch (err) {
      console.error('removeFromCart error:', err.message);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      cart,
      setCart,
      cartCount,
      authError,
      authLoading,
      guestToken: user ? null : getGuestToken(),
      login,
      register,
      logout,
      addToCart,
      removeFromCart,
      refreshCart,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
