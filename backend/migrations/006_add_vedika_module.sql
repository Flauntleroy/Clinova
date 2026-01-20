-- ============================================
-- Vedika Module - Database Schema
-- Verifikasi Digital Klaim BPJS
-- ============================================

-- ---------------------------------------------
-- Table: mlite_vedika
-- Tabel utama untuk menyimpan data status klaim
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS mlite_vedika (
    id INT AUTO_INCREMENT,
    tanggal DATE NOT NULL,
    no_rkm_medis VARCHAR(50) NOT NULL,
    no_rawat VARCHAR(50) NOT NULL,
    tgl_registrasi DATE NOT NULL,
    nosep VARCHAR(50) NOT NULL,
    jenis ENUM('1', '2') NOT NULL COMMENT '1=Ranap, 2=Ralan',
    status VARCHAR(20) NOT NULL COMMENT 'Lengkap/Pengajuan/Perbaiki/Setuju',
    username VARCHAR(100) NOT NULL,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_nosep (nosep),
    INDEX idx_no_rawat (no_rawat),
    INDEX idx_status (status),
    INDEX idx_jenis (jenis),
    INDEX idx_tgl_registrasi (tgl_registrasi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------
-- Table: mlite_vedika_feedback
-- Tabel untuk menyimpan catatan/feedback klaim
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS mlite_vedika_feedback (
    id INT AUTO_INCREMENT,
    nosep VARCHAR(50) NOT NULL,
    tanggal DATE NOT NULL,
    catatan TEXT NOT NULL,
    username VARCHAR(100) NOT NULL,
    
    PRIMARY KEY (id),
    INDEX idx_nosep (nosep)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------
-- Table: mlite_users_vedika
-- Tabel untuk user verifikator BPJS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS mlite_users_vedika (
    id INT AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------
-- Table: mlite_settings
-- Pengaturan modul (termasuk Vedika)
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS mlite_settings (
    id INT AUTO_INCREMENT,
    module VARCHAR(50) NOT NULL,
    field VARCHAR(100) NOT NULL,
    value TEXT,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_module_field (module, field)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default settings for Vedika
INSERT IGNORE INTO mlite_settings (module, field, value) VALUES
    ('vedika', 'periode', '2026-01'),
    ('vedika', 'carabayar', 'BPJ'),
    ('vedika', 'jenis_billing', 'mlite');

-- ---------------------------------------------
-- Permissions untuk modul Vedika
-- ---------------------------------------------
INSERT INTO mera_permissions (id, code, domain, action, description) VALUES
    (UUID(), 'vedika.read', 'vedika', 'read', 'View Vedika claims'),
    (UUID(), 'vedika.write', 'vedika', 'write', 'Create/Update Vedika claims'),
    (UUID(), 'vedika.verify', 'vedika', 'verify', 'Verify claims as BPJS verifier'),
    (UUID(), 'vedika.settings', 'vedika', 'settings', 'Manage Vedika settings');

