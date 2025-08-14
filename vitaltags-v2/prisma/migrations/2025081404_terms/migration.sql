-- Terms MVP tables

CREATE TABLE IF NOT EXISTS "Condition" (
  "id" TEXT PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "system" TEXT,
  "code" TEXT,
  "onsetDate" TIMESTAMP(3),
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Condition_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Condition_profileId_idx" ON "Condition" ("profileId");

CREATE TABLE IF NOT EXISTS "Medication" (
  "id" TEXT PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "system" TEXT,
  "code" TEXT,
  "doseText" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Medication_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Medication_profileId_idx" ON "Medication" ("profileId");

CREATE TABLE IF NOT EXISTS "Allergy" (
  "id" TEXT PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "system" TEXT,
  "code" TEXT,
  "criticality" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Allergy_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Allergy_profileId_idx" ON "Allergy" ("profileId");

CREATE TABLE IF NOT EXISTS "TermI18n" (
  "slug" TEXT PRIMARY KEY,
  "lang" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE "Condition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Medication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Allergy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TermI18n" ENABLE ROW LEVEL SECURITY;

-- Policies: server full access; owner scoped by app.user_id
DO $$ BEGIN
  CREATE POLICY condition_server ON "Condition" FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY medication_server ON "Medication" FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY allergy_server ON "Allergy" FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY termi18n_server ON "TermI18n" FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY condition_owner ON "Condition"
    FOR ALL TO vitaltags_owner
    USING (EXISTS (SELECT 1 FROM "Profile" p WHERE p."id" = "Condition"."profileId" AND p."userId" = current_setting('app.user_id', true)))
    WITH CHECK (EXISTS (SELECT 1 FROM "Profile" p WHERE p."id" = "Condition"."profileId" AND p."userId" = current_setting('app.user_id', true)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY medication_owner ON "Medication"
    FOR ALL TO vitaltags_owner
    USING (EXISTS (SELECT 1 FROM "Profile" p WHERE p."id" = "Medication"."profileId" AND p."userId" = current_setting('app.user_id', true)))
    WITH CHECK (EXISTS (SELECT 1 FROM "Profile" p WHERE p."id" = "Medication"."profileId" AND p."userId" = current_setting('app.user_id', true)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY allergy_owner ON "Allergy"
    FOR ALL TO vitaltags_owner
    USING (EXISTS (SELECT 1 FROM "Profile" p WHERE p."id" = "Allergy"."profileId" AND p."userId" = current_setting('app.user_id', true)))
    WITH CHECK (EXISTS (SELECT 1 FROM "Profile" p WHERE p."id" = "Allergy"."profileId" AND p."userId" = current_setting('app.user_id', true)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY termi18n_public ON "TermI18n" FOR SELECT TO PUBLIC USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


