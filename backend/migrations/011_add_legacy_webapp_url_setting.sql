-- ============================================
-- Migration: 011_add_legacy_webapp_url_setting
-- Purpose: Add base URL for legacy webapp digital documents
-- ============================================

SET NAMES utf8mb4;

INSERT INTO mera_settings (module, setting_key, setting_value, value_type, scope, is_active, created_by)
VALUES
    ('vedika', 'legacy_webapp_url', '"http://localhost/webapps/"', 'string', 'hospital', 1, 'system')
ON DUPLICATE KEY UPDATE
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'migration';
