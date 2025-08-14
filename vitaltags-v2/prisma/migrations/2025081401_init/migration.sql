-- Prisma initial schema migration
-- Create tables: User, Profile, AuditLog

-- CreateEnum / extensions: none required at this stage

-- Table: "User"
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Table: "Profile"
CREATE TABLE IF NOT EXISTS "Profile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,

  -- Tier E (public)
  "publicId" TEXT NOT NULL UNIQUE,
  "alias" TEXT,
  "ageRange" TEXT NOT NULL,
  "criticalAllergies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "criticalConditions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "criticalMeds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "icePhone" TEXT NOT NULL,

  -- Tier C (protected)
  "c_ciphertext" BYTEA,
  "c_nonce" BYTEA,
  "dek_wrapped" BYTEA,

  -- Controls
  "revoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "revocationCode" TEXT NOT NULL UNIQUE,
  "lastAccessAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Profile_userId_idx" ON "Profile" ("userId");

-- Table: "AuditLog"
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "reason" TEXT,
  "ipHash" TEXT,
  "uaHash" TEXT,
  "country" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditLog_profileId_idx" ON "AuditLog" ("profileId");


