/*
===============================================================================
 Migration : 007_add_mera_settings
 Project   : SIMRS MERA
 Purpose   : Structured global settings table for system-level configuration
===============================================================================

WHY THIS TABLE EXISTS
---------------------
This table is intentionally created to store SYSTEM POLICY / OPERATIONAL
CONFIGURATION for SIMRS MERA.

It is NOT:
- transaction data
- medical data
- claim data
- user data

This table exists to answer questions like:
- "What is the active Vedika claim period?"
- "Which payment methods are allowed for Vedika processing?"
- "Is a specific feature enabled for a module?"

WHY NOT USE mlite_settings?
---------------------------
The existing mlite_settings table:
- mixes many unrelated domains in one place
- stores everything as plain text
- has no clear ownership or access control
- is hard to validate and audit

MERA intentionally DOES NOT reuse mlite_settings to avoid repeating the same
architectural problems.

WHY ONLY ONE TABLE?
-------------------
We intentionally use ONE structured table instead of many domain-specific
tables to:
- avoid schema explosion
- keep migrations manageable
- keep configuration centralized but controlled

Domain separation is achieved via the `domain` column, NOT via table names.

IMPORTANT DESIGN RULES
----------------------
1. This table MUST ONLY contain configuration / policy data.
2. DO NOT store transactional or medical data here.
3. Each setting MUST belong to a logical domain (e.g. vedika, auth, billing).
4. Settings SHOULD be typed using `value_type`.
5. All critical changes SHOULD be audited via NDJSON audit log (application layer).

===============================================================================
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- Table structure for mera_settings
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `mera_settings`;
CREATE TABLE `mera_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  /*
    Logical bounded context / module.
    Example values:
    - vedika
    - auth
    - billing
    - satusehat
  */
  `module` VARCHAR(50) NOT NULL,

  /*
    Setting identifier inside a module.
    Example:
    - active_period
    - allowed_carabayar
  */
  `setting_key` VARCHAR(100) NOT NULL,

  /*
    Setting value stored as JSON.
    JSON is used to support:
    - scalar values
    - arrays
    - structured objects
  */
  `setting_value` JSON NULL,

  /*
    Explicit type hint for application-level validation.
    This prevents ambiguous interpretation of setting_value.
  */
  `value_type` ENUM(
    'string',
    'number',
    'boolean',
    'date',
    'year_month',
    'string_array',
    'number_array',
    'json'
  ) NOT NULL DEFAULT 'string',

  /*
    Scope defines how far this setting applies.
    For now, MOST settings will use 'hospital'.
    Other scopes are reserved for future growth.
  */
  `scope` ENUM(
    'global',
    'hospital',
    'module'
  ) NOT NULL DEFAULT 'global',

  /*
    Soft toggle for enabling/disabling a setting
    without deleting historical context.
  */
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,

  /*
    Lightweight metadata.
    Full audit trail MUST be handled by NDJSON audit log.
  */
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` VARCHAR(100) NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` VARCHAR(100) NULL,

  PRIMARY KEY (`id`),

  /*
    Enforce uniqueness of setting per module.
    One module cannot have duplicate keys.
  */
  UNIQUE KEY `uniq_module_key` (`module`, `setting_key`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Structured system-level settings for SIMRS MERA';

SET FOREIGN_KEY_CHECKS = 1;
