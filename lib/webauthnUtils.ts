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
export const getRpId = (host?: string) => {
  // 1. Prioritize explicit Host from headers (provided by caller)
  if (host) {
    const cleanHost = host.split(':')[0].toLowerCase();
    return cleanHost;
  }

  // 2. Client-side fallback
  if (typeof window !== 'undefined') {
    return window.location.hostname.toLowerCase();
  }
  
  // 3. Environment Variables (Server-side fallbacks)
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
  async getRegistrationOptions(userEmail: string, userId: string, existingCredentials: any[] = [], overrideRpId?: string) {
    const rpId = getRpId(overrideRpId);
    
    console.log(`[WebAuthn] Generating Registration Options:
      - User: ${userEmail}
      - RP_ID (Final): ${rpId}
      - Input Host: ${overrideRpId || 'N/A'}`);

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
  async verifyRegistration(body: any, expectedChallenge: string, overrideOrigin?: string, overrideRpId?: string) {
    const rpId = getRpId(overrideRpId);
    const origin = getOrigin(overrideOrigin);

    console.log(`[WebAuthn] Verifying Registration:
      - Expected RP_ID: ${rpId}
      - Expected Origin: ${origin}
      - Client-sent Origin: ${body.response?.clientDataJSON ? 'Present' : 'Missing'}`);

    return verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
    });
  },

  // 3. Authentication Options
  async getAuthenticationOptions(allowCredentials: any[] = [], overrideRpId?: string) {
    const rpId = getRpId(overrideRpId);

    console.log(`[WebAuthn] Generating Authentication Options:
      - RP_ID (Final): ${rpId}
      - Keys Available: ${allowCredentials.length}`);

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
    overrideRpId?: string
  ) {
    const rpId = getRpId(overrideRpId);
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
