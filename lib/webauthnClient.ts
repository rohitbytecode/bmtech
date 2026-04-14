import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export const webauthnClient = {
  // 1. Register a new hardware device
  async register(email: string, enrollmentToken: string, deviceName?: string) {
    try {
      // Get registration options from server
      const res = await fetch('/api/auth/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          enrollmentToken,
          rpIdHint: typeof window !== 'undefined' ? window.location.hostname : undefined 
        }),
      });

      const options = await res.json();
      if (options.error) throw new Error(options.error);

      console.log('[WebAuthn] Registration Options received:');
      console.table({
        RP_ID: options.rp.id,
        User_Name: options.user.name,
        Challenge: options.challenge.substring(0, 10) + '...',
      });

      // Start the WebAuthn registration (triggers TPM/Biometrics)
      const credential = await startRegistration({ optionsJSON: options });

      // Send the credential back to server for verification
      const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...credential, 
          email, 
          enrollmentToken, 
          deviceName,
          rpIdHint: typeof window !== 'undefined' ? window.location.hostname : undefined 
        }),
      });

      const verifyResult = await verifyRes.json();
      if (verifyResult.error) {
        // Show BOTH the general error and the technical details if available
        const fullError = verifyResult.details ? `${verifyResult.error}: ${verifyResult.details}` : verifyResult.error;
        throw new Error(fullError);
      }

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
        body: JSON.stringify({ 
          email,
          rpIdHint: typeof window !== 'undefined' ? window.location.hostname : undefined
        }),
      });

      options = await res.json();

      if (options.webauthnAvailable === false) {
        return { fallback: true };
      }

      if (options.error) {
        throw new Error(options.error);
      }

      console.log('[WebAuthn] Authentication Options received:');
      console.table({
        RP_ID: options.rpID || "MISSING_RP_ID",
        Challenge: options.challenge ? options.challenge.substring(0, 10) + '...' : 'MISSING',
      });

      if (!options.challenge) {
        throw new Error("Invalid WebAuthn options received");
      }

      const assertion = await startAuthentication({ optionsJSON: options });
      
      // Send the assertion back to server for verification
      const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...assertion, 
          email, 
          password,
          rpIdHint: typeof window !== 'undefined' ? window.location.hostname : undefined 
        }),
      });

      const verifyResult = await verifyRes.json();
      if (verifyResult.error) {
        const fullError = verifyResult.details ? `${verifyResult.error}: ${verifyResult.details}` : verifyResult.error;
        throw new Error(fullError);
      }

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
