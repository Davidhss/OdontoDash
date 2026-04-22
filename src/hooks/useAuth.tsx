import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check for demo user in session storage
    const demoUser = sessionStorage.getItem('demo_user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!sessionStorage.getItem('demo_user')) {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setIsDemo(false);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      setIsDemo(false);
    }
  };

  const signInDemo = () => {
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@blent.com',
      user_metadata: {
        full_name: 'Usuário Demo (Apresentação)',
      }
    } as any;
    
    sessionStorage.setItem('demo_user', JSON.stringify(mockUser));
    setIsDemo(true);
    setUser(mockUser);
  };

  const signOut = async () => {
    sessionStorage.removeItem('demo_user');
    setIsDemo(false);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, signIn, signUp, signInDemo, signOut }}>
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
