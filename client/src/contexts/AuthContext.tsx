import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../../shared/types.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setDemoUser: (role: 'admin' | 'candidate') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('growthops_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('growthops_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('growthops_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('growthops_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('growthops_token');
    setToken(null);
    setUser(null);
  };

  // Quick switch for demo testing between Admin and Candidate perspectives
  const setDemoUser = async (role: 'admin' | 'candidate') => {
    if (role === 'admin') {
      try {
        await login('admin@growthops.com', 'admin123');
      } catch {
        setUser({
          id: 'demo-admin-id',
          email: 'admin@growthops.com',
          fullName: 'Head of Growth (Admin)',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      try {
        await login('alex.intern@growthops.com', 'admin123');
      } catch {
        setUser({
          id: 'demo-candidate-id',
          email: 'alex.intern@growthops.com',
          fullName: 'Alex Chen (Candidate)',
          role: 'candidate',
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'reviewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        login,
        logout,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
