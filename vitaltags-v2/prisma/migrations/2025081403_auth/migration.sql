-- Auth tables for sessions and WebAuthn credentials

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "WebAuthnCredential" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "publicKey" BYTEA NOT NULL,
  "counter" INTEGER NOT NULL,
  "transports" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "backedUp" BOOLEAN,
  "deviceType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebAuthnCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "WebAuthnCredential_userId_idx" ON "WebAuthnCredential" ("userId");

-- RLS enable and policies
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebAuthnCredential" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS session_server ON "Session";
CREATE POLICY session_server ON "Session" FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS webauthn_server ON "WebAuthnCredential";
CREATE POLICY webauthn_server ON "WebAuthnCredential" FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);


