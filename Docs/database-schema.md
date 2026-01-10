# Database Schema - Authentication Domain

Database: `rsaz_sik`

---

## Tables Overview

| Table | Description |
|-------|-------------|
| users | User accounts |
| roles | Role definitions |
| permissions | Action permissions |
| role_permissions | Role → Permission mapping |
| user_roles | User → Role assignments |
| user_permissions | Per-user permission overrides |
| login_sessions | Login session tracking |

---

## Entity Relationship

```
┌─────────┐     ┌─────────────┐     ┌─────────┐
│  users  │────<│ user_roles  │>────│  roles  │
└─────────┘     └─────────────┘     └─────────┘
     │                                   │
     │          ┌──────────────────┐     │
     │          │ user_permissions │     │
     └─────────<│    (overrides)   │     │
                └──────────────────┘     │
                         │               │
                         ▼               │
                  ┌─────────────┐        │
                  │ permissions │<───────┘
                  └─────────────┘  role_permissions
```

---

## Table: users

| Column | Type | Description |
|--------|------|-------------|
| id | CHAR(36) PK | UUID |
| username | VARCHAR(50) UNIQUE | Login username |
| email | VARCHAR(100) UNIQUE | Email address |
| password_hash | VARCHAR(255) | bcrypt hash |
| is_active | BOOLEAN | Account status |
| last_login_at | DATETIME | Last login time |
| created_at | DATETIME | Created time |
| updated_at | DATETIME | Updated time |

---

## Table: roles

| Column | Type | Description |
|--------|------|-------------|
| id | CHAR(36) PK | UUID |
| name | VARCHAR(50) UNIQUE | Role name |
| description | VARCHAR(255) | Description |
| created_at | DATETIME | Created time |
| updated_at | DATETIME | Updated time |

---

## Table: permissions

| Column | Type | Description |
|--------|------|-------------|
| id | CHAR(36) PK | UUID |
| code | VARCHAR(100) UNIQUE | e.g., "patient.read" |
| domain | VARCHAR(50) | e.g., "patient" |
| action | VARCHAR(50) | e.g., "read" |
| description | VARCHAR(255) | Description |
| created_at | DATETIME | Created time |

---

## Table: login_sessions

| Column | Type | Description |
|--------|------|-------------|
| id | CHAR(36) PK | UUID |
| user_id | CHAR(36) FK | User reference |
| refresh_token_hash | VARCHAR(64) | SHA256 of refresh token |
| device_info | VARCHAR(255) | User-Agent |
| ip_address | VARCHAR(45) | Client IP |
| created_at | DATETIME | Session start |
| last_seen_at | DATETIME | Last activity |
| revoked_at | DATETIME | Revocation time (NULL = active) |

**Note:** Sessions are never deleted, only revoked (audit compliance).

---

## Permission Resolution Algorithm

```
1. Get all permissions from user's roles (UNION)
2. Apply user_permissions overrides:
   - type='grant' → ADD permission
   - type='revoke' → REMOVE permission
3. Result = effective permissions
```

Example:
- User has role "nurse" with permissions: [patient.read, patient.update]
- User has override: grant lab.create
- User has override: revoke patient.update
- **Effective**: [patient.read, lab.create]
