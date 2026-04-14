import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse
} from '@simplewebauthn/server';
import base64url from 'base64url';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Robustly identify the RP ID for the current context.
 * In WebAuthn, RP_ID must be the domain (e.g., 'bmtlab.vercel.app') or a suffix.
 */
export const getRpId = (host?: string, hint?: string) => {
  // 1. Prioritize Client-side hint (The browser knows exactly where it is)
  if (hint && hint.trim()) {
    return hint.trim().toLowerCase();
  }

  // 2. Prioritize explicit Host from headers (provided by caller)
  if (host) {
    // Handle potential list of hosts from X-Forwarded-Host
    const firstHost = host.split(',')[0].trim();
    const cleanHost = firstHost.split(':')[0].toLowerCase();
    return cleanHost;
  }

  // 3. Client-side fallback (if running in browser)
  if (typeof window !== 'undefined') {
    return window.location.hostname.toLowerCase();
  }

  // 4. Environment Variables (Server-side fallbacks)
  const explicitRpId = process.env.NEXT_PUBLIC_RP_ID;
  if (explicitRpId) return explicitRpId.toLowerCase();

  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) return vercelUrl.replace(/^https?:\/\//, '').toLowerCase();

  try {
    return new URL(APP_URL).hostname.toLowerCase();
  } catch {
    return 'localhost';
  }
};

/**
 * Robustly identify the origin for the current context.
 * WebAuthn origins MUST NOT have a trailing slash.
 */
export const getOrigin = (originHeader?: string) => {
  // Priority 1: Use the actual 'Origin' header from the browser
  if (originHeader && originHeader !== 'null') {
    return originHeader.replace(/\/$/, '').toLowerCase();
  }

  // Priority 2: Fallback to environment variables
  const envOrigin = process.env.NEXT_PUBLIC_ORIGIN || APP_URL;
  return envOrigin.replace(/\/$/, '').toLowerCase();
};

export const webauthnUtils = {
  // 1. Registration Options
  async getRegistrationOptions(userEmail: string, userId: string, existingCredentials: any[] = [], overrideRpId?: string, hint?: string) {
    const rpId = getRpId(overrideRpId, hint);

    console.log(`[WebAuthn] Generating Registration Options:
      - User: ${userEmail}
      - RP_ID (Final): ${rpId}
      - Hint Source: ${hint ? 'Client' : 'Header/Env'}`);

    return generateRegistrationOptions({
      rpName: 'BMTech Admin Panel',
      rpID: rpId,
      userID: Buffer.from(userId),
      userName: userEmail,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.credential_id,
        transports: cred.transports || ['internal'],
      })),
    });
  },

  // 2. Verify Registration
  async verifyRegistration(body: any, expectedChallenge: string, overrideOrigin?: string, overrideRpId?: string, hint?: string) {
    const rpId = getRpId(overrideRpId, hint);
    const origin = getOrigin(overrideOrigin);

    // Filter out our custom fields to prevent library validation crashes
    const { email, enrollmentToken, deviceName, rpIdHint, ...cleanResponse } = body;

    console.log(`[WebAuthn] Verifying Registration:
      - Expected RP_ID: ${rpId}
      - Expected Origin: ${origin}`);

    return verifyRegistrationResponse({
      response: cleanResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      requireUserVerification: false, // Don't require UV flag during initial enrollment
    });
  },

  // 3. Authentication Options
  async getAuthenticationOptions(allowCredentials: any[] = [], overrideRpId?: string, hint?: string) {
    const rpId = getRpId(overrideRpId, hint);

    console.log(`[WebAuthn] Generating Authentication Options:
      - RP_ID (Final): ${rpId}
      - Hint Source: ${hint ? 'Client' : 'Header/Env'}`);

    return generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials: allowCredentials.map(cred => ({
        id: cred.credential_id,
        transports: cred.transports || undefined,
      })),
      userVerification: 'preferred',
    });
  },

  // 4. Verify Authentication
  async verifyAuthentication(
  body: any,
  expectedChallenge: string,
  credentialID: string | Uint8Array | Buffer,
  publicKey: string,
  counter: number,
  overrideOrigin?: string,
  overrideRpId?: string,
  hint?: string
) {
  const rpId = getRpId(overrideRpId, hint);
  const origin = getOrigin(overrideOrigin);

  const { email, password, rpIdHint, ...cleanResponse } = body;

  console.log(`[WebAuthn] Verifying Authentication:
    - Expected RP_ID: ${rpId}
    - Expected Origin: ${origin}`);

  let credentialIDBuffer: Buffer;
  if (typeof credentialID === 'string') {
    credentialIDBuffer = base64url.toBuffer(credentialID);
  } else {
    credentialIDBuffer = Buffer.from(credentialID);
  }

  const publicKeyBuffer =
    publicKey.includes('-') || publicKey.includes('_')
      ? Buffer.from(publicKey, 'base64url')
      : Buffer.from(publicKey, 'base64');

  if (!credentialIDBuffer || !publicKeyBuffer || typeof counter !== 'number') {
    throw new Error('Invalid authenticator data passed to verification');
  }

  const opts: any = {
    response: cleanResponse,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpId,
    authenticator: {
      credentialID: credentialIDBuffer,
      credentialPublicKey: publicKeyBuffer,
      counter,
    },
    requireUserVerification: false,
  };

  return verifyAuthenticationResponse(opts);
}
};
