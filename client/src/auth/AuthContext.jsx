import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
const KEY = 'britpath_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY));
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Validate the stored token on load and whenever it changes
  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setUser(null);
      setReady(true);
      return undefined;
    }

    api('/auth/me', { token })
      .then((d) => {
        if (!cancelled) setUser(d.user);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  // role: 'admin' for /admin/login, 'client' for /portal/login
  const login = useCallback(async (email, password, role = 'admin') => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });

    if (data.user.role !== role) {
      throw new Error(
        role === 'admin'
          ? 'This area is for BritPath staff only.'
          : 'This page is for clients. Staff please use the admin sign in.'
      );
    }

    localStorage.setItem(KEY, data.token);
    setUser(data.user);
    setToken(data.token);
  }, []);

  // Authenticated API call; logs out automatically when the token is rejected
  const request = useCallback(
    async (path, opts = {}) => {
      try {
        return await api(path, { ...opts, token });
      } catch (err) {
        if (err.status === 401) logout();
        throw err;
      }
    },
    [token, logout]
  );

  const value = useMemo(
    () => ({ user, token, ready, login, logout, request }),
    [user, token, ready, login, logout, request]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}