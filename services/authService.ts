import { supabase } from '../lib/supabaseClient';

export const authService = {
  async signUp(email: string, password: string, role: 'admin' | 'team' | 'client' = 'client') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role, // save initial role in user metadata
          },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error(error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error) {
      console.error(error);
      return { session: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error(error);
      return { user: null, error: error instanceof Error ? error.message : String(error) };
    }
  }
};
