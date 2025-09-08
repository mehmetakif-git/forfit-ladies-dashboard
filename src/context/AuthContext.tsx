import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const restoreSession = async () => {
      if (!isSupabaseAvailable) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        sessionStorage.setItem(
          'forfit-session',
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          })
        );

        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          role: (session.user.user_metadata?.role as User['role']) || 'member',
        };

        setAuthState({ user, isAuthenticated: true });
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!isSupabaseAvailable) return false;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) return false;

      sessionStorage.setItem(
        'forfit-session',
        JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      );

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!,
        role: (data.user.user_metadata?.role as User['role']) || 'member',
      };

      setAuthState({ user, isAuthenticated: true });

      setTimeout(() => {
        if (user.role === 'member') {
          window.location.href = '/member-portal';
        } else if (user.role === 'trainer') {
          window.location.href = '/trainer-portal';
        } else {
          window.location.href = '/';
        }
      }, 100);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseAvailable) {
        await supabase.auth.signOut();
      }
      sessionStorage.removeItem('forfit-session');
      setAuthState({ user: null, isAuthenticated: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

