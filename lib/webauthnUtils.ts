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

// Extract domain for RP_ID (e.g., 'bmtlab.vercel.app')
const getRpId = () => {
  if (typeof window !== 'undefined') return window.location.hostname;
  
  // Try to use Vercel's automatic environment variable or our custom one
  const explicitRpId = process.env.NEXT_PUBLIC_RP_ID;
  if (explicitRpId) return explicitRpId;

  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) return vercelUrl.replace(/^https?:\/\//, '');

  try {
    return new URL(APP_URL).hostname;
  } catch {
    return 'localhost';
  }
};

const RP_ID = getRpId();
const RP_NAME = 'BMTech Admin Panel';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || APP_URL.replace(/\/$/, ''); // Ensure no trailing slash


export const webauthnUtils = {
  // 1. Registration Options
  async getRegistrationOptions(userEmail: string, userId: string, existingCredentials: any[] = [], overrideRpId?: string) {
    const activeRpId = overrideRpId || RP_ID;
    return generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: activeRpId,
      userID: Buffer.from(userId),
      userName: userEmail,
      attestationType: 'none', 
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
        transports: cred.transports || ['internal'], // Hint that it's an internal key
      })),
    });
  },

  // 2. Verify Registration
  async verifyRegistration(body: any, expectedChallenge: string, overrideOrigin?: string, overrideRpId?: string) {
    return verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: overrideOrigin || ORIGIN,
      expectedRPID: overrideRpId || RP_ID,
    });
  },

  // 3. Authentication Options
  async getAuthenticationOptions(allowCredentials: any[] = [], overrideRpId?: string) {
    const activeRpId = overrideRpId || RP_ID;
    return generateAuthenticationOptions({
      rpID: activeRpId,
      allowCredentials: allowCredentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
        transports: cred.transports || undefined,
      })),
      userVerification: 'required',
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
    return verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: overrideOrigin || ORIGIN,
      expectedRPID: overrideRpId || RP_ID,
      credential: {
        id: body.id,
        publicKey: isoBase64URL.toBuffer(publicKey),
        counter,
      },
    });
  }
};
