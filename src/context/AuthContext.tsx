import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const demoUsers: User[] = [
  {
    id: '1',
    email: 'admin@forfit.qa',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'staff@forfit.qa',
    name: 'Staff Member',
    role: 'staff',
  },
  {
    id: '3',
    email: 'member@forfit.qa',
    name: 'Sarah Johnson',
    role: 'member',
  },
  {
    id: '4',
    email: 'trainer@forfit.qa',
    name: 'Sarah Johnson',
    role: 'trainer',
  },
];

const demoPasswords: Record<string, string> = {
  'admin@forfit.qa': 'admin123',
  'staff@forfit.qa': 'staff123',
  'member@forfit.qa': 'member123',
  'trainer@forfit.qa': 'trainer123',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('forfit-auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
    return { user: null, isAuthenticated: false };
  });

  // Get members data from localStorage directly to avoid circular dependency
  const getMembers = () => {
    try {
      const stored = localStorage.getItem('forfit-members');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const updateMemberLastLogin = (memberId: string) => {
    try {
      const members = getMembers();
      const updatedMembers = members.map((member: any) => 
        member.id === memberId 
          ? { ...member, lastLogin: new Date().toISOString(), loginStatus: 'active' }
          : member
      );
      localStorage.setItem('forfit-members', JSON.stringify(updatedMembers));
    } catch (error) {
      console.error('Failed to update member last login:', error);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('forfit-auth', JSON.stringify(authState));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }, [authState]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try Supabase authentication if available
      if (isSupabaseAvailable) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (data.user && !error) {
            const user = {
              id: data.user.id,
              email: data.user.email!,
              name: 'Admin User',
              role: 'admin' as const
            };

            setAuthState({
              user,
              isAuthenticated: true,
            });

            setTimeout(() => {
              window.location.href = '/';
            }, 100);
            
            return true;
          }
        } catch (supabaseError) {
          console.warn('Supabase auth failed, falling back to demo users:', supabaseError);
        }
      }

      // Check demo users first
      let user = demoUsers.find(u => u.email === email);
      let correctPassword = demoPasswords[email];
      
      if (user && password === correctPassword) {
        setAuthState({
          user,
          isAuthenticated: true,
        });
        
        // Redirect based on role after successful login
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
      }

      // Check database members
      if (isSupabaseAvailable) {
        try {
          const { data: members, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', email);
          
          if (!error && members && members.length > 0 && members[0].password === password) {
            const memberData = members[0];
            user = {
              id: memberData.id,
              email: memberData.email,
              name: memberData.name,
              role: 'member' as const,
            };
            
            // Update last login
            await supabase
              .from('members')
              .update({ 
                last_login: new Date().toISOString(),
                login_status: 'active'
              })
              .eq('id', memberData.id);
            
            setAuthState({
              user,
              isAuthenticated: true,
            });
            
            setTimeout(() => {
              window.location.href = '/member-portal';
            }, 100);
            
            return true;
          }
        } catch (dbError) {
          console.warn('Database member check failed:', dbError);
        }
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
      localStorage.removeItem('forfit-auth');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
    }}>
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