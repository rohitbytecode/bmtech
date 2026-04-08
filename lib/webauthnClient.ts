import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export const webauthnClient = {
  // 1. Register a new hardware device
  async register(email: string, enrollmentToken: string) {
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
        body: JSON.stringify({ ...credential, email, enrollmentToken }),
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
    try {
      // Get authentication options from server
      const res = await fetch('/api/auth/webauthn/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const options = await res.json();
      if (options.error) throw new Error(options.error);

      // Start the WebAuthn authentication (triggers TPM/Biometrics)
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
      console.error('WebAuthn Authentication Error:', err);
      throw err;
    }
  }
};
