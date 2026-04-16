--Industry-Grade WebAuthn (FIDO2) Support

--Upgrade authorized_devices to store cryptographic credentials
ALTER TABLE authorized_devices ADD COLUMN IF NOT EXISTS credential_id TEXT;
ALTER TABLE authorized_devices ADD COLUMN IF NOT EXISTS public_key TEXT;
ALTER TABLE authorized_devices ADD COLUMN IF NOT EXISTS counter INT DEFAULT 0;
ALTER TABLE authorized_devices ADD COLUMN IF NOT EXISTS transports JSONB;
ALTER TABLE authorized_devices ADD COLUMN IF NOT EXISTS attestation_type TEXT;

-- One time enrollment token
CREATE TABLE IF NOT EXISTS enrollment_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- security
ALTER TABLE enrollment_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage enrollment tokens"
ON enrollment_tokens
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
