/**
 * Utility for managing application URLs across development and production environments.
 * Ensures consistent redirect URLs for Supabase auth and OAuth callbacks.
 */

export const getAppUrl = (): string => {
  // Always use NEXT_PUBLIC_APP_URL from environment
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  // Client-side
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
};

export const getAuthRedirectUrl = (path: string = '/auth/callback'): string => {
  const baseUrl = getAppUrl();
  return `${baseUrl}${path}`;
};

export const getEmailVerificationUrl = (): string => {
  return getAuthRedirectUrl('/auth/callback');
};

/**
 * Validates that the required environment variables are set.
 * Throw an error in development if critical variables are missing.
 */
export const validateAppUrl = (): boolean => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  NEXT_PUBLIC_APP_URL is not set. Using default: http://localhost:3000');
    }
    return false;
  }
  return true;
};
