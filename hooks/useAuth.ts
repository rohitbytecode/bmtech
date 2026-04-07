import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string;
  isAuthenticated: boolean;
  emailVerified: boolean;
}

/**
 * Custom hook for managing authentication state
 * Handles:
 * - Initial session loading
 * - Real-time auth state changes
 * - User role extraction from metadata
 * - Email verification status
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (mounted) {
          if (error) {
            console.warn('Error fetching initial session:', error.message);
          }

          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.error('Unexpected error fetching session:', error);
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    role: user?.user_metadata?.role || 'client',
    isAuthenticated: !!user && !!session,
    emailVerified: user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined,
  };
};
