'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { MOCK_PROFILE } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        const currentUser = data.session?.user ?? null;
        const hasDemoCookie = typeof document !== 'undefined' && document.cookie.includes('undertow-demo-session=true');

        if (currentUser) {
          const googleName =
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0] ||
            'User';

          setUser(currentUser);
          setProfile({
            id: currentUser.id,
            name: googleName,
            email: currentUser.email || '',
            avatar_url: currentUser.user_metadata?.avatar_url,
            stage: 'Active Maintenance',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (hasDemoCookie) {
          setUser({ id: 'usr_demo_123', email: 'alex@example.com' } as User);
          setProfile(MOCK_PROFILE);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Supabase auth check:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        const hasDemoCookie = typeof document !== 'undefined' && document.cookie.includes('undertow-demo-session=true');

        if (currentUser) {
          setUser(currentUser);
          const googleName =
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0] ||
            'User';

          setProfile({
            id: currentUser.id,
            name: googleName,
            email: currentUser.email || '',
            avatar_url: currentUser.user_metadata?.avatar_url,
            stage: 'Active Maintenance',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (hasDemoCookie) {
          setUser({ id: 'usr_demo_123', email: 'alex@example.com' } as User);
          setProfile(MOCK_PROFILE);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (prof) setProfile(prof);
  };

  const signInWithGoogle = async () => {
    document.cookie = 'undertow-demo-session=true; path=/';
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('OAuth redirect notice, proceeding in demo session:', error.message);
        }
        window.location.href = '/dashboard';
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Redirecting to dashboard:', err);
      }
      window.location.href = '/dashboard';
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    document.cookie = 'undertow-demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setSession(null);
    setProfile(null);
    window.location.href = '/auth/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
