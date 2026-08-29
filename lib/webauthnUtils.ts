import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import base64url from 'base64url';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const getRpId = (host?: string, hint?: string) => {
  if (hint && hint.trim()) {
    return hint.trim().toLowerCase();
  }

  if (host) {
    const firstHost = host.split(',')[0].trim();
    const cleanHost = firstHost.split(':')[0].toLowerCase();
    return cleanHost;
  }

  if (typeof window !== 'undefined') {
    return window.location.hostname.toLowerCase();
  }

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

export const getOrigin = (originHeader?: string) => {
  if (originHeader && originHeader !== 'null') {
    return originHeader.replace(/\/$/, '').toLowerCase();
  }

  const envOrigin = process.env.NEXT_PUBLIC_ORIGIN || APP_URL;
  return envOrigin.replace(/\/$/, '').toLowerCase();
};

export const webauthnUtils = {
  // 1. Registration Options
  async getRegistrationOptions(
    userEmail: string,
    userId: string,
    existingCredentials: any[] = [],
    overrideRpId?: string,
    hint?: string,
  ) {
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
      excludeCredentials: existingCredentials.map((cred) => ({
        id: cred.credential_id,
        transports: cred.transports || ['internal'],
      })),
    });
  },

  // 2. Verify Registration
  async verifyRegistration(
    body: any,
    expectedChallenge: string,
    overrideOrigin?: string,
    overrideRpId?: string,
    hint?: string,
  ) {
    const rpId = getRpId(overrideRpId, hint);
    const origin = getOrigin(overrideOrigin);

    const { email, enrollmentToken, deviceName, rpIdHint, ...cleanResponse } = body;

    console.log(`[WebAuthn] Verifying Registration:
      - Expected RP_ID: ${rpId}
      - Expected Origin: ${origin}`);

    return verifyRegistrationResponse({
      response: cleanResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      requireUserVerification: false,
    });
  },

  // 3. Authentication Options
  async getAuthenticationOptions(
    allowCredentials: any[] = [],
    overrideRpId?: string,
    hint?: string,
  ) {
    const rpId = getRpId(overrideRpId, hint);

    console.log(`[WebAuthn] Generating Authentication Options:
      - RP_ID (Final): ${rpId}
      - Hint Source: ${hint ? 'Client' : 'Header/Env'}`);

    return generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials: allowCredentials.map((cred) => ({
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
    hint?: string,
  ) {
    const rpId = getRpId(overrideRpId, hint);
    const origin = getOrigin(overrideOrigin);

    const { email, password, rpIdHint, ...cleanResponse } = body;

    console.log(`[WebAuthn] Verifying Authentication:
      - Expected RP_ID: ${rpId}
      - Expected Origin: ${origin}`);

    if (!cleanResponse.id) {
      throw new Error('Missing credential ID in authentication response');
    }
    if (!cleanResponse.response?.authenticatorData) {
      throw new Error('Missing authenticatorData');
    }
    if (!cleanResponse.response?.clientDataJSON) {
      throw new Error('Missing clientDataJSON');
    }

    // Derive credential ID as string (base64url)
    const credentialIdString =
      typeof credentialID === 'string' ? credentialID : base64url.encode(Buffer.from(credentialID));

    // Derive public key as Uint8Array
    // Derive public key as Uint8Array<ArrayBuffer>
    const publicKeyBuffer = (publicKey.includes('-') || publicKey.includes('_')
      ? base64url.toBuffer(publicKey)
      : Buffer.from(publicKey, 'base64')) as unknown as Uint8Array<ArrayBuffer>;

    if (!publicKeyBuffer?.length) {
      throw new Error('Invalid public key binary data');
    }

    const safeCounter = typeof counter === 'number' ? counter : 0;

    return verifyAuthenticationResponse({
      response: cleanResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: credentialIdString,
        publicKey: publicKeyBuffer,
        counter: safeCounter,
      },
      requireUserVerification: false,
    });
  },
};
