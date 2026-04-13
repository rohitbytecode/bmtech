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

// Extract domain for RP_ID (e.g., 'bmtlab.vercel.app' from 'https://bmtlab.vercel.app')
const getRpId = () => {
  try {
    return new URL(APP_URL).hostname;
  } catch {
    return 'localhost';
  }
};

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || getRpId();
const RP_NAME = 'BMTech Admin Panel';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || APP_URL.replace(/\/$/, ''); // Ensure no trailing slash


export const webauthnUtils = {
  // 1. Registration Options
  async getRegistrationOptions(userEmail: string, userId: string, existingCredentials: any[] = []) {
    return generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(userId),
      userName: userEmail,
      attestationType: 'direct', // Request attestation to verify hardware
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform', // Strictly enforce Windows Hello/TouchID/TPM
      },
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
        transports: cred.transports || ['internal'], // Hint that it's an internal key
      })),
    });
  },

  // 2. Verify Registration
  async verifyRegistration(body: any, expectedChallenge: string) {
    return verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
  },

  // 3. Authentication Options
  async getAuthenticationOptions(allowCredentials: any[] = []) {
    return generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: allowCredentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
        transports: cred.transports || undefined, // Let the browser decide
      })),
      userVerification: 'required',
    });
  },

  // 4. Verify Authentication
  async verifyAuthentication(
    body: any,
    expectedChallenge: string,
    publicKey: string,
    counter: number
  ) {
    return verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: body.id,
        publicKey: isoBase64URL.toBuffer(publicKey),
        counter,
      },
    });
  }
};
