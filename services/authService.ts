import { supabase } from '../lib/supabaseClient';

export interface AuthResponse {
  data: any;
  error: string | null;
}

export interface SignUpResponse extends AuthResponse {
  requiresEmailVerification?: boolean;
}

export const authService = {
  /**
   * Sign up a new user with email, password, and optional role
   * After signup, user receives an email verification link
   */
  async signUp(
    email: string,
    password: string,
    role: 'admin' | 'team' | 'client' = 'client',
  ): Promise<SignUpResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role, // save initial role in user metadata
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        // Handle known Supabase errors
        if (error.message.includes('already registered')) {
          return { data: null, error: 'This email is already registered' };
        }
        throw error;
      }

      return {
        data,
        error: null,
        requiresEmailVerification: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Sign up error:', errorMessage);
      return { data: null, error: errorMessage };
    }
  },

  /**
   * Sign in existing user with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { data: null, error: 'Invalid email or password' };
        }
        throw error;
      }

      if (!data.session) {
        return {
          data: null,
          error: 'Email not verified yet. Check your email for the verification link.',
        };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Sign in error:', errorMessage);
      return { data: null, error: errorMessage };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Sign out error:', errorMessage);
      return { error: errorMessage };
    }
  },

  /**
   * Get the current user's session
   */
  async getSession(): Promise<{ session: any; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      return { session: data.session, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Get session error:', errorMessage);
      return { session: null, error: errorMessage };
    }
  },

  /**
   * Get the current authenticated user
   */
  async getUser(): Promise<{ user: any; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Get user error:', errorMessage);
      return { user: null, error: errorMessage };
    }
  },

  /**
   * Resend email confirmation link
   */
  async resendEmailVerification(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Resend email error:', errorMessage);
      return { error: errorMessage };
    }
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Update password error:', errorMessage);
      return { error: errorMessage };
    }
  },
};
