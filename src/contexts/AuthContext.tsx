import { createContext, useContext, useEffect, useState, ReactNode, } from 'react';
import type { Profile } from '../types';

/**
 * Temporary User & Session types
 * (replace later with your backend response types)
 */
export interface User {
  id: string;
  email: string;
}

export interface Session {
  token: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔧 INITIAL AUTH CHECK (LOCAL STORAGE PLACEHOLDER)
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setSession({ token: storedToken });
    }

    setLoading(false);
  }, []);

  /**
   * 🔧 SIGN UP (NODE BACKEND PLACEHOLDER)
   */
  async function signUp(email: string, password: string, fullName: string) {
    try {
      // TODO: Replace with Node API
      // const res = await fetch('/api/auth/register', {...})

      const fakeUser = { id: crypto.randomUUID(), email };

      setUser(fakeUser);
      setSession({ token: 'mock-token' });
      setProfile({ full_name: fullName, email });

      localStorage.setItem('user', JSON.stringify(fakeUser));
      localStorage.setItem('token', 'mock-token');

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  /**
   * 🔧 SIGN IN (NODE BACKEND PLACEHOLDER)
   */
  async function signIn(email: string, password: string) {
    try {
      // TODO: Replace with Node API
      // const res = await fetch('/api/auth/login', {...})

      const fakeUser = { id: crypto.randomUUID(), email };

      setUser(fakeUser);
      setSession({ token: 'mock-token' });

      localStorage.setItem('user', JSON.stringify(fakeUser));
      localStorage.setItem('token', 'mock-token');

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  /**
   * 🔧 SIGN OUT
   */
  async function signOut() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);
    setSession(null);
    setProfile(null);
  }

  /**
   * 🔧 UPDATE PROFILE (NODE BACKEND PLACEHOLDER)
   */
  async function updateProfile(updates: Partial<Profile>) {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      // TODO: Replace with Node API
      // await fetch(`/api/profile/${user.id}`, {...})

      setProfile(prev => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
