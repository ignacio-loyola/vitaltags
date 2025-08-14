-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "allowBreakGlass" BOOLEAN NOT NULL DEFAULT true;

-- Update the public view to include allowBreakGlass
DROP VIEW IF EXISTS v_profile_public;
CREATE VIEW v_profile_public AS
SELECT
  p."publicId",
  p."alias",
  p."ageRange",
  p."criticalAllergies",
  p."criticalConditions",
  p."criticalMeds",
  p."icePhone",
  p."allowBreakGlass"
FROM "Profile" p
WHERE p."revoked" = FALSE;

-- Secure the view: allow public read on the view only if intended; otherwise restrict to web anon role
GRANT SELECT ON v_profile_public TO PUBLIC;

-- Set view owner to server role so base-table access works via view
ALTER VIEW v_profile_public OWNER TO vitaltags_server;