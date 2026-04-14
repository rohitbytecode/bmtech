import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

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
 * Robustly identify the Origin for the current context.
 */
export const getOrigin = (originHeader?: string) => {
  if (originHeader) return originHeader.replace(/\/$/, '');
  
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '');
  }

  return (process.env.NEXT_PUBLIC_ORIGIN || APP_URL).replace(/\/$/, '');
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
        type: 'public-key',
        transports: cred.transports || ['internal'],
      })),
    });
  },

  // 2. Verify Registration
  async verifyRegistration(body: any, expectedChallenge: string, overrideOrigin?: string, overrideRpId?: string, hint?: string) {
    const rpId = getRpId(overrideRpId, hint);
    const origin = getOrigin(overrideOrigin);

    console.log(`[WebAuthn] Verifying Registration:
      - Expected RP_ID: ${rpId}
      - Expected Origin: ${origin}`);

    return verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
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
        type: 'public-key',
        transports: cred.transports || undefined,
      })),
      userVerification: 'preferred',
    });
  },

  // 4. Verify Authentication
  async verifyAuthentication(
    body: any,
    expectedChallenge: string,
    publicKey: string,
    counter: number,
    overrideOrigin?: string,
    overrideRpId?: string,
    hint?: string
  ) {
    const rpId = getRpId(overrideRpId, hint);
    const origin = getOrigin(overrideOrigin);

    console.log(`[WebAuthn] Verifying Authentication:
      - Expected RP_ID: ${rpId}
      - Expected Origin: ${origin}`);

    return verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: body.id,
        publicKey: isoBase64URL.toBuffer(publicKey),
        counter,
      },
    });
  }
};
