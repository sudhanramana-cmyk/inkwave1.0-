import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserPublic } from '../types';
import { api, authStorage } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserPublic | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: { name: string; username: string; email: string; password: string; avatar_url?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: UserPublic) => void;
  quickSwitch: (identifier: string, password?: string) => Promise<void>;
  authModal: {
    isOpen: boolean;
    mode: 'login' | 'register' | 'forgot';
    open: (mode?: 'login' | 'register' | 'forgot') => void;
    close: () => void;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'forgot' }>({
    isOpen: false,
    mode: 'login'
  });
  const { success, error } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      authStorage.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await api.login({ identifier, password });
      authStorage.setToken(res.token);
      setUser(res.user);
      setAuthModalState(prev => ({ ...prev, isOpen: false }));
      success(`Welcome back, ${res.user.name}`);
    } catch (err: any) {
      error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (payload: { name: string; username: string; email: string; password: string; avatar_url?: string }) => {
    try {
      const res = await api.register(payload);
      authStorage.setToken(res.token);
      setUser(res.user);
      setAuthModalState(prev => ({ ...prev, isOpen: false }));
      success(`Account created! Welcome to INKWAVE, ${res.user.name}`);
    } catch (err: any) {
      error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    authStorage.clearToken();
    setUser(null);
    success('Logged out successfully');
  };

  const updateUser = (updatedUser: UserPublic) => {
    setUser(updatedUser);
  };

  const quickSwitch = async (identifier: string, password = 'password123') => {
    try {
      const pass = identifier === 'admin' ? 'admin123' : password;
      const res = await api.login({ identifier, password: pass });
      authStorage.setToken(res.token);
      setUser(res.user);
      success(`Switched account to ${res.user.name} (${res.user.role})`);
    } catch (err: any) {
      error(err.message || 'Quick switch failed');
    }
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        quickSwitch,
        authModal: {
          isOpen: authModalState.isOpen,
          mode: authModalState.mode,
          open: openAuthModal,
          close: closeAuthModal
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
