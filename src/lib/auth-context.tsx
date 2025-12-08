'use client'

import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  tokenBalance?: number;
  role?: 'USER' | 'SELLER' | 'ADMIN';
  shopId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiry, setExpiry] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const expiryTimeout = useRef<number | null>(null);

  // Fetch current user on mount ONLY ONCE
  useEffect(() => {
    // Don't fetch on login/register pages
    const isAuthPage = pathname === '/register' || pathname === '/login';
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    // Fetch user once on mount
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Ensure cookies are sent
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (typeof data.exp === 'number') {
          setExpiry(data.exp);
        }
      } else {
        // Only set user to null if we get a clear 401/403, not on network errors
        if (response.status === 401 || response.status === 403) {
          setUser(null);
          setExpiry(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Don't set user to null on network errors, keep current state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuthPage = pathname === '/register' || pathname === '/login';
    if (loading) return;
    if (!isAuthPage && !user) {
      const redirect = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirect}`);
    }
  }, [user, loading, pathname, router]);

  
  useEffect(() => {
    const isAuthPage = pathname === '/register' || pathname === '/login';
    if (isAuthPage) return;
    if (!user || !expiry) return;
    if (expiryTimeout.current) {
      clearTimeout(expiryTimeout.current);
      expiryTimeout.current = null;
    }
    const ms = expiry * 1000 - Date.now();
    if (ms <= 0) {
      const redirect = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirect}`);
      return;
    }
    const id = setTimeout(() => {
      const redirect = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      setUser(null);
      router.replace(`/login${redirect}`);
    }, ms);
    expiryTimeout.current = id as unknown as number;
    return () => {
      if (expiryTimeout.current) {
        clearTimeout(expiryTimeout.current);
        expiryTimeout.current = null;
      }
    };
  }, [expiry, user, pathname, router]);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Đăng nhập thất bại');
    }

    const data = await response.json();
    setUser(data.user);
    await fetchUser();
  };

  const register = async (email: string, name: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Đăng ký thất bại');
    }

    const data = await response.json();
    setUser(data.user);
    await fetchUser();
  };

  const logout = async () => {
    try {
      document.cookie = 'token=; Max-Age=0; path=/';
    } catch {}
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setExpiry(null);
    if (expiryTimeout.current) {
      clearTimeout(expiryTimeout.current);
      expiryTimeout.current = null;
    }
    router.push('/login');
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
