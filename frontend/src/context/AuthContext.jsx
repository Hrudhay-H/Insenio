import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('role', role || '');
      localStorage.setItem('user_id', userId || '');
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      setIsAuthenticated(false);
    }
  }, [token, role, userId]);

  const login = (data) => {
    setToken(data.access_token);
    setRole(data.role);
    setUserId(data.user_id);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
