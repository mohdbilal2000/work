import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const HOSTED_FRONTEND = 'recruitor.defitex2.0.org';
const HOSTED_API = 'https://api-recruitor.defitex2.0.org/api';

const resolveApiBase = () => {
  if (import.meta.env.VITE_RECRUITOR_API) {
    return import.meta.env.VITE_RECRUITOR_API;
  }
  if (typeof window !== 'undefined' && window.location.hostname === HOSTED_FRONTEND) {
    return HOSTED_API;
  }
  return 'http://localhost:5100/api';
};

const API_BASE = resolveApiBase();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('recruitor:user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    const data = await response.json();
    localStorage.setItem('recruitor:token', data.token);
    localStorage.setItem('recruitor:user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('recruitor:token');
    localStorage.removeItem('recruitor:user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    token: () => localStorage.getItem('recruitor:token'),
    apiBase: API_BASE
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


