-- ============================================
-- Migration: 009_add_vedika_index_permissions
-- Purpose: Add permissions for Vedika Index workbench
-- ============================================

SET NAMES utf8mb4;

-- Insert Vedika Index permissions
INSERT INTO mera_permissions (id, code, domain, action, description) VALUES
    (UUID(), 'vedika.claim.read', 'vedika', 'claim.read', 'View claim details'),
    (UUID(), 'vedika.claim.update_status', 'vedika', 'claim.update_status', 'Update claim status'),
    (UUID(), 'vedika.claim.edit_medical_data', 'vedika', 'claim.edit_medical_data', 'Edit diagnosis and procedures'),
    (UUID(), 'vedika.claim.upload_document', 'vedika', 'claim.upload_document', 'Upload supporting documents'),
    (UUID(), 'vedika.claim.read_resume', 'vedika', 'claim.read_resume', 'View medical resume')
ON DUPLICATE KEY UPDATE
    description = VALUES(description);
