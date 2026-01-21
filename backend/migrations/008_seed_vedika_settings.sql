-- ============================================
-- Migration: 008_seed_vedika_settings
-- Purpose: Seed required Vedika settings into mera_settings
-- ============================================

SET NAMES utf8mb4;

-- Insert required Vedika settings
-- These settings MUST exist for Vedika dashboard to function

INSERT INTO mera_settings (module, setting_key, setting_value, value_type, scope, is_active, created_by)
VALUES
    ('vedika', 'active_period', '"2026-01"', 'year_month', 'hospital', 1, 'system'),
    ('vedika', 'allowed_carabayar', '["BPJ"]', 'string_array', 'hospital', 1, 'system')
ON DUPLICATE KEY UPDATE
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'migration';
