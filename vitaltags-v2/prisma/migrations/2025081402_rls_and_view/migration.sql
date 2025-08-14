-- Enable extensions required (pgcrypto for future use)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles setup (note: creation may require superuser; alternatively pre-provision in infra)
DO $$ BEGIN
  CREATE ROLE vitaltags_server NOINHERIT;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'role vitaltags_server already exists';
END $$;

DO $$ BEGIN
  CREATE ROLE vitaltags_owner NOINHERIT;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'role vitaltags_owner already exists';
END $$;

-- Ensure tables exist
-- (Prisma manages table DDL in previous migration)

-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Basic policies

-- Users: owner-only access; assume app sets current_user to db role with limited rights; 
-- For simplicity, restrict direct access and let server go through stored procedures, or use policy tied to session variables.
-- We'll use application-level setting via PostgreSQL settings: request.jwt.claims.user_id in future. For now, deny by default.
DROP POLICY IF EXISTS user_select ON "User";
DROP POLICY IF EXISTS user_mod ON "User";
CREATE POLICY user_select ON "User" FOR SELECT TO vitaltags_server USING (true);
CREATE POLICY user_mod ON "User" FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);

-- Owner policies using session variable app.user_id
DROP POLICY IF EXISTS user_owner_select ON "User";
DROP POLICY IF EXISTS user_owner_update ON "User";
CREATE POLICY user_owner_select ON "User"
  FOR SELECT TO vitaltags_owner
  USING ("id" = current_setting('app.user_id', true));
CREATE POLICY user_owner_update ON "User"
  FOR UPDATE TO vitaltags_owner
  USING ("id" = current_setting('app.user_id', true))
  WITH CHECK ("id" = current_setting('app.user_id', true));

-- Profiles: owners can CRUD; server can read all; anonymous can read via public view only (not base table)
DROP POLICY IF EXISTS profile_owner_mod ON "Profile";
DROP POLICY IF EXISTS profile_owner_select ON "Profile";
DROP POLICY IF EXISTS profile_server_select ON "Profile";
CREATE POLICY profile_owner_select ON "Profile"
  FOR SELECT TO vitaltags_server USING (true);

CREATE POLICY profile_owner_mod ON "Profile"
  FOR ALL TO vitaltags_server USING (true) WITH CHECK (true);

-- Owner CRUD where owner_id matches session
DROP POLICY IF EXISTS profile_owner_select_self ON "Profile";
DROP POLICY IF EXISTS profile_owner_mod_self ON "Profile";
CREATE POLICY profile_owner_select_self ON "Profile"
  FOR SELECT TO vitaltags_owner
  USING ("userId" = current_setting('app.user_id', true));
CREATE POLICY profile_owner_mod_self ON "Profile"
  FOR ALL TO vitaltags_owner
  USING ("userId" = current_setting('app.user_id', true))
  WITH CHECK ("userId" = current_setting('app.user_id', true));

-- AuditLog: write-only by server; read by server
DROP POLICY IF EXISTS audit_select ON "AuditLog";
DROP POLICY IF EXISTS audit_insert ON "AuditLog";
CREATE POLICY audit_select ON "AuditLog" FOR SELECT TO vitaltags_server USING (true);
CREATE POLICY audit_insert ON "AuditLog" FOR INSERT TO vitaltags_server WITH CHECK (true);

-- Allow owners to read their own audit logs only
DROP POLICY IF EXISTS audit_owner_select_self ON "AuditLog";
CREATE POLICY audit_owner_select_self ON "AuditLog"
  FOR SELECT TO vitaltags_owner
  USING (EXISTS (
    SELECT 1 FROM "Profile" p
    WHERE p."id" = "AuditLog"."profileId"
      AND p."userId" = current_setting('app.user_id', true)
  ));

-- Public view exposing Tier E only for non-revoked profiles
DROP VIEW IF EXISTS v_profile_public;
CREATE VIEW v_profile_public AS
SELECT
  p."publicId",
  p."alias",
  p."ageRange",
  p."criticalAllergies",
  p."criticalConditions",
  p."criticalMeds",
  p."icePhone"
FROM "Profile" p
WHERE p."revoked" = FALSE;

-- Secure the view: allow public read on the view only if intended; otherwise restrict to web anon role
GRANT SELECT ON v_profile_public TO PUBLIC;

-- Set view owner to server role so base-table access works via view
ALTER VIEW v_profile_public OWNER TO vitaltags_server;

-- Grants for roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Profile" TO vitaltags_owner;
GRANT SELECT, UPDATE ON TABLE "User" TO vitaltags_owner;
GRANT SELECT ON TABLE "AuditLog" TO vitaltags_owner;

-- Only server can read Tier C columns directly
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "User", "Profile", "AuditLog" TO vitaltags_server;
REVOKE SELECT ("c_ciphertext", "c_nonce", "dek_wrapped") ON TABLE "Profile" FROM vitaltags_owner;


