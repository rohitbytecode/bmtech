import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export const webauthnClient = {
  // 1. Register a new hardware device
  async register(email: string, enrollmentToken: string, deviceName?: string) {
    try {
      // Get registration options from server
      const res = await fetch('/api/auth/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, enrollmentToken }),
      });

      const options = await res.json();
      if (options.error) throw new Error(options.error);

      // Start the WebAuthn registration (triggers TPM/Biometrics)
      const credential = await startRegistration({ optionsJSON: options });

      // Send the credential back to server for verification
      const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credential, email, enrollmentToken, deviceName }),
      });

      const verifyResult = await verifyRes.json();
      if (verifyResult.error) throw new Error(verifyResult.error);

      return verifyResult;
    } catch (err: any) {
      console.error('WebAuthn Registration Error:', err);
      throw err;
    }
  },

  // 2. Authenticate with a hardware device
  async authenticate(email: string, password?: string) {
    let options: any = null;
    try {
      // Get authentication options from server
      const res = await fetch('/api/auth/webauthn/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      options = await res.json();

      if (options.webauthnAvailable === false) {
        return { fallback: true };
      }

      if (options.error) {
        throw new Error(options.error);
      }

      if (!options.challenge) {
        throw new Error("Invalid WebAuthn options received");
      }

      const assertion = await startAuthentication({ optionsJSON: options });
      // Send the assertion back to server for verification
      const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assertion, email, password }),
      });

      const verifyResult = await verifyRes.json();
      if (verifyResult.error) throw new Error(verifyResult.error);

      return verifyResult;
    } catch (err: any) {
      // Detailed error identification for hardware auth
      let errorMessage = err.message;
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Hardware authentication was not allowed. This usually happens if the domain mismatch or user canceled the request.';
        console.warn('WebAuthn Configuration Check:', {
          currentOrigin: window.location.origin,
          currentHost: window.location.hostname,
          rpId: options?.rpID || 'unknown'
        });
      } else if (err.name === 'SecurityError') {
        errorMessage = 'WebAuthn is only available over HTTPS or localhost.';
      }

      console.error('WebAuthn Authentication Error:', err);
      throw new Error(errorMessage);
    }
  }
};
