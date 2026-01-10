# Authentication API Documentation

Base URL: `http://localhost:8080`

---

## Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | - | User login |
| POST | `/auth/logout` | Bearer | Logout current session |
| POST | `/auth/refresh` | - | Refresh access token |
| GET | `/auth/me` | Bearer | Get current user |
| GET | `/auth/sessions` | Bearer | List active sessions |
| POST | `/auth/sessions/:id/revoke` | Bearer | Revoke a session |

---

## Authentication

Protected endpoints require `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## POST /auth/login

Login dengan username dan password.

### Request
```json
{
  "username": "admin",
  "password": "password123"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "admin",
      "email": "admin@hospital.com",
      "is_active": true,
      "roles": [
        { "id": "uuid", "name": "admin" }
      ],
      "permissions": [
        "patient.read",
        "patient.create",
        "billing.read"
      ]
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "Bearer",
      "expires_at": "2026-01-11T01:15:00Z"
    },
    "session": {
      "id": "session-uuid",
      "created_at": "2026-01-11T01:00:00Z"
    }
  }
}
```

### Error Responses

| Code | Error Code | Message |
|------|------------|---------|
| 401 | INVALID_CREDENTIALS | Invalid username or password |
| 401 | USER_INACTIVE | User account is inactive |

---

## POST /auth/logout

Logout dan revoke session saat ini.

### Headers
```
Authorization: Bearer <access_token>
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## POST /auth/refresh

Refresh access token menggunakan refresh token.

### Request
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "Bearer",
      "expires_at": "2026-01-11T01:30:00Z"
    }
  }
}
```

### Error Responses

| Code | Error Code | Message |
|------|------------|---------|
| 401 | INVALID_TOKEN | Invalid refresh token |
| 401 | SESSION_REVOKED | Session has been revoked |

---

## GET /auth/me

Get informasi user yang sedang login.

### Headers
```
Authorization: Bearer <access_token>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "admin",
      "email": "admin@hospital.com",
      "is_active": true,
      "roles": [
        { "id": "uuid", "name": "admin" }
      ],
      "permissions": [
        "patient.read",
        "patient.create",
        "billing.read"
      ]
    }
  }
}
```

---

## GET /auth/sessions

List semua active sessions user.

### Headers
```
Authorization: Bearer <access_token>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid-1",
        "device_info": "Mozilla/5.0 (Windows NT 10.0...)",
        "ip_address": "192.168.1.100",
        "created_at": "2026-01-11T00:30:00Z",
        "last_seen_at": "2026-01-11T01:00:00Z",
        "is_current": true,
        "is_active": true
      },
      {
        "id": "session-uuid-2",
        "device_info": "Mozilla/5.0 (iPhone...)",
        "ip_address": "192.168.1.101",
        "created_at": "2026-01-10T10:00:00Z",
        "last_seen_at": "2026-01-10T15:00:00Z",
        "is_current": false,
        "is_active": true
      }
    ],
    "total": 2
  }
}
```

---

## POST /auth/sessions/:id/revoke

Revoke (logout) session tertentu.

### Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Session UUID to revoke |

### Response (200 OK)
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

### Error Responses

| Code | Error Code | Message |
|------|------------|---------|
| 404 | NOT_FOUND | Session not found |

---

## Error Response Format

Semua error mengikuti format standard:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CREDENTIALS | 401 | Wrong username/password |
| USER_NOT_FOUND | 404 | User doesn't exist |
| USER_INACTIVE | 401 | Account disabled |
| INVALID_TOKEN | 401 | Token invalid/malformed |
| EXPIRED_TOKEN | 401 | Token has expired |
| SESSION_REVOKED | 401 | Session was revoked |
| PERMISSION_DENIED | 403 | No permission for action |
| VALIDATION_ERROR | 400 | Invalid request body |
| INTERNAL_ERROR | 500 | Server error |

---

## Permission Codes

Format: `domain.action`

| Permission | Description |
|------------|-------------|
| patient.read | View patient data |
| patient.create | Create new patients |
| patient.update | Update patient records |
| patient.delete | Delete patients |
| billing.read | View billing data |
| billing.create | Create invoices |
| billing.update | Update billing |
| pharmacy.read | View pharmacy data |
| pharmacy.dispense | Dispense medications |
| lab.read | View lab results |
| lab.create | Create lab orders |
| user.read | View user list |
| user.manage | Create/edit users |
| role.manage | Manage roles |
| session.revoke | Revoke any session |
