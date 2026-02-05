'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function safeSetItem(key: string, value: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

function safeRemoveItem(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
};

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const AuthContext = createContext<{
  state: AuthState;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
} | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      safeSetItem('accessToken', action.payload.accessToken);
      safeSetItem('refreshToken', action.payload.refreshToken);
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      safeRemoveItem('accessToken');
      safeRemoveItem('refreshToken');
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const accessToken = safeGetItem('accessToken');
    const refreshToken = safeGetItem('refreshToken');
    if (accessToken) {
      dispatch({
        type: 'LOGIN',
        payload: { user: state.user!, accessToken, refreshToken: refreshToken || '' },
      });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    dispatch({ type: 'LOGIN', payload: { user, accessToken, refreshToken } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
