-- Database initialization script
-- This runs when the PostgreSQL container starts for the first time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for better performance (will be created by migrations, but good to have as backup)
-- These will be ignored if they already exist from migrations

-- Performance settings for the database
-- These are applied at database level for all connections
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log slow queries > 1 second
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Create a read-only user for monitoring/analytics (optional)
-- CREATE USER vitaltags_readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE vitaltags TO vitaltags_readonly;
-- GRANT USAGE ON SCHEMA public TO vitaltags_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO vitaltags_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO vitaltags_readonly;

-- Some useful functions for the application

-- Function to generate short IDs (alternative to Python implementation)
CREATE OR REPLACE FUNCTION generate_short_id(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars))::INTEGER + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to hash strings (for privacy)
CREATE OR REPLACE FUNCTION hash_string(input TEXT, salt TEXT DEFAULT 'vitaltags')
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(salt || input, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize IP addresses (keep first 3 octets for IPv4, first 48 bits for IPv6)
CREATE OR REPLACE FUNCTION anonymize_ip(ip_address INET)
RETURNS INET AS $$
BEGIN
    IF family(ip_address) = 4 THEN
        -- IPv4: mask last octet
        RETURN network(set_masklen(ip_address, 24));
    ELSE
        -- IPv6: mask last 80 bits (keep first 48)
        RETURN network(set_masklen(ip_address, 48));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Useful views for analytics (respecting privacy)

-- View for scan statistics without PII
CREATE OR REPLACE VIEW scan_stats AS
SELECT 
    DATE_TRUNC('hour', ts) as hour,
    country,
    COUNT(*) as scan_count,
    COUNT(DISTINCT tag_id) as unique_tags
FROM scan_logs 
GROUP BY DATE_TRUNC('hour', ts), country
ORDER BY hour DESC;

-- View for tag usage statistics
CREATE OR REPLACE VIEW tag_usage_stats AS
SELECT 
    t.tag_type,
    t.status,
    COUNT(*) as tag_count,
    AVG(t.scan_count) as avg_scans,
    MAX(t.scan_count) as max_scans
FROM tags t
GROUP BY t.tag_type, t.status;

-- Comments for documentation
COMMENT ON DATABASE vitaltags IS 'Vital Tags - Emergency Medical Information System Database';
COMMENT ON FUNCTION generate_short_id IS 'Generate URL-safe short identifiers for tags';
COMMENT ON FUNCTION hash_string IS 'Hash strings for privacy while maintaining searchability';
COMMENT ON FUNCTION anonymize_ip IS 'Anonymize IP addresses while preserving geographical information';
COMMENT ON VIEW scan_stats IS 'Hourly scan statistics aggregated by country (privacy-preserving)';
COMMENT ON VIEW tag_usage_stats IS 'Tag usage statistics by type and status';