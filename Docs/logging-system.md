# SIMRS Logging System Documentation

This document explains the file-based audit logging system for SIMRS.

---

## 1. Purpose of the Logging System

The audit logging system provides:
- **Accountability**: Track who made what changes and when
- **Compliance**: Meet hospital regulatory requirements for data auditing
- **Debugging**: Help developers understand data flow and changes
- **Security**: Detect unauthorized modifications

---

## 2. Why Raw SQL is NOT Logged

We intentionally do NOT log raw SQL queries because:

| Issue | Explanation |
|-------|-------------|
| **Security Risk** | SQL may contain sensitive data (passwords, patient info) |
| **Readability** | Raw SQL is hard for non-developers to understand |
| **Storage Bloat** | SQL text is verbose and wasteful |
| **Legal Compliance** | Some data shouldn't be stored in plain text logs |

Instead, we log **logical representations** of data changes that are:
- Structured and machine-parseable (JSON)
- Human-readable without SQL knowledge
- Safe from accidental sensitive data exposure

---

## 3. Audit Logs vs Error Logs

| Aspect | Audit Logs | Error Logs |
|--------|-----------|------------|
| **Purpose** | Track business data changes | Track application errors |
| **Location** | `storage/logs/audit/` | Application stderr/stdout |
| **Format** | NDJSON (structured) | Text (unstructured) |
| **Retention** | Long-term (years) | Short-term (days/weeks) |
| **Content** | WHO changed WHAT and WHY | WHAT went wrong and WHERE |

---

## 4. When Audit Logging is REQUIRED

Audit logging is **MANDATORY** for:

| Module | Operations |
|--------|------------|
| Users | Create, update, delete, role changes |
| Permissions | Grant, revoke, role assignment |
| Sessions | Login, logout, revoke |
| Patients | Registration, updates, status changes |
| Billing | Invoice creation, payment, adjustments |
| Pharmacy | Stock changes, dispensing, returns |
| Inventory | Stock in/out, adjustments |

Audit logging is **NOT REQUIRED** for:
- Read-only operations (SELECT)
- Health checks
- Static file serving
- Session validation (non-modifying)

---

## 5. Audit Log JSON Schema

```json
{
  "ts": "2026-01-11T09:30:00+08:00",
  "level": "AUDIT",

  "module": "farmasi",
  "action": "UPDATE",

  "entity": {
    "table": "databarang",
    "primary_key": {
      "kode_brng": "OBT001"
    }
  },

  "sql_context": {
    "operation": "UPDATE",
    "changed_columns": {
      "stok": {
        "old": 100,
        "new": 95
      }
    },
    "where": {
      "kode_brng": "OBT001"
    }
  },

  "business_key": "OBT001",

  "actor": {
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "apoteker1"
  },

  "ip": "192.168.1.100",

  "summary": "Stok obat OBT001 dikurangi dari 100 menjadi 95 unit"
}
```

### Field Descriptions

| Field | Description |
|-------|-------------|
| `ts` | ISO-8601 timestamp with timezone |
| `level` | Always "AUDIT" for audit logs |
| `module` | Business domain (farmasi, pasien, billing) |
| `action` | INSERT, UPDATE, or DELETE |
| `entity.table` | Database table name |
| `entity.primary_key` | Primary key column(s) and value(s) |
| `sql_context` | Logical representation of data change |
| `business_key` | Human-readable identifier (no_rawat, kode_obat) |
| `actor` | User who performed the action |
| `ip` | Client IP address |
| `summary` | Indonesian sentence describing the action |

---

## 6. Examples

### INSERT Example

```json
{
  "ts": "2026-01-11T09:00:00+08:00",
  "level": "AUDIT",
  "module": "pasien",
  "action": "INSERT",
  "entity": {
    "table": "pasien",
    "primary_key": {"no_rkm_medis": "RM-2026-0001"}
  },
  "sql_context": {
    "operation": "INSERT",
    "inserted_data": {
      "no_rkm_medis": "RM-2026-0001",
      "nm_pasien": "Budi Santoso",
      "jk": "L",
      "tgl_lahir": "1985-03-15"
    }
  },
  "business_key": "RM-2026-0001",
  "actor": {"user_id": "uuid", "username": "admin"},
  "ip": "192.168.1.50",
  "summary": "Pasien baru RM-2026-0001 (Budi Santoso) berhasil didaftarkan"
}
```

### UPDATE Example

```json
{
  "ts": "2026-01-11T10:30:00+08:00",
  "level": "AUDIT",
  "module": "pasien",
  "action": "UPDATE",
  "entity": {
    "table": "pasien",
    "primary_key": {"no_rkm_medis": "RM-2026-0001"}
  },
  "sql_context": {
    "operation": "UPDATE",
    "changed_columns": {
      "alamat": {
        "old": "Jl. Merdeka No. 10",
        "new": "Jl. Sudirman No. 25"
      },
      "no_tlp": {
        "old": "08123456789",
        "new": "08198765432"
      }
    },
    "where": {"no_rkm_medis": "RM-2026-0001"}
  },
  "business_key": "RM-2026-0001",
  "actor": {"user_id": "uuid", "username": "admin"},
  "ip": "192.168.1.50",
  "summary": "Data pasien RM-2026-0001 diperbarui: alamat, no_tlp"
}
```

### DELETE Example

```json
{
  "ts": "2026-01-11T11:00:00+08:00",
  "level": "AUDIT",
  "module": "auth",
  "action": "DELETE",
  "entity": {
    "table": "login_sessions",
    "primary_key": {"id": "session-uuid"}
  },
  "sql_context": {
    "operation": "DELETE",
    "deleted_data": {
      "id": "session-uuid",
      "user_id": "user-uuid",
      "device_info": "Mozilla/5.0..."
    },
    "where": {"id": "session-uuid"}
  },
  "business_key": "session-uuid",
  "actor": {"user_id": "user-uuid", "username": "admin"},
  "ip": "192.168.1.50",
  "summary": "Sesi login session-uuid dibatalkan oleh admin"
}
```

---

## 7. Architectural Enforcement (CRITICAL)

> **THIS SECTION IS NON-NEGOTIABLE**

### Single Source of Truth

**`pkg/audit/Logger` is the ONLY authorized way to write audit logs.**

| Rule | Description |
|------|-------------|
| **NO** `os.OpenFile` | Services MUST NOT open log files directly |
| **NO** `json.Marshal` to file | Services MUST NOT serialize audit data manually |
| **NO** alternative loggers | No "custom audit logger" in any module |
| **NO** direct file writes | All audit writes go through `audit.Logger` |

### Why This Matters

```
WRONG (6-12 months later = chaos):

  - auth/audit_helper.go
  - billing/my_audit.go
  - inventory/custom_logger.go
  - patient/audit_v2.go
```

```
CORRECT (single entry point):

  pkg/audit/audit.go    ← ALL audit writes go here
      ↑
      └─── services call LogInsert/LogUpdate/LogDelete
```

### Enforcement Checklist

When reviewing code, **REJECT** any PR that:

- [ ] Opens files in `storage/logs/` from service layer
- [ ] Creates new audit-related `.go` files outside `pkg/audit/`
- [ ] Uses `os.OpenFile`, `os.Create`, or `log.New()` for audit purposes
- [ ] Defines new audit log structs outside `pkg/audit/`
- [ ] Bypasses `audit.Logger` methods

### Allowed Patterns

```go
// CORRECT - use injected logger
func (s *MyService) CreateItem(ctx context.Context, ...) error {
    // ... business logic ...
    s.auditLogger.LogInsert(audit.InsertParams{...})
}

// WRONG - direct file access
func (s *MyService) CreateItem(ctx context.Context, ...) error {
    f, _ := os.OpenFile("storage/logs/audit/my-log.json", ...)
    json.NewEncoder(f).Encode(data)  // ← VIOLATION
}

// WRONG - custom logger
type MyAuditLogger struct { ... }  // ← VIOLATION
func (l *MyAuditLogger) Log(...) { ... }
```

---

## 8. Developer Rules

### DO:
- Call audit logging from **SERVICE layer only**
- Include `business_key` in every log
- Write `summary` in **Bahasa Indonesia**
- Include all changed columns for UPDATE
- Include data snapshot for INSERT/DELETE

### DON'T:
- Log from handler or repository layer
- Log raw SQL queries
- Log passwords or secrets
- Skip audit logging for data-modifying operations
- Use multiline JSON (always single-line NDJSON)

### Common Mistakes

| Mistake | Correction |
|---------|------------|
| Logging from handler | Move to service layer |
| Missing business_key | Always include human-readable ID |
| English summary | Write in Indonesian for end users |
| Logging SELECT queries | Only log INSERT/UPDATE/DELETE |
| Not logging permission changes | Always audit security-related changes |

---

## 9. Adding Audit Logs to New Features

### Step 1: Inject AuditLogger into Service

```go
type MyService struct {
    repo        *repository.MyRepository
    auditLogger *audit.Logger
}

func NewMyService(repo *repository.MyRepository, auditLogger *audit.Logger) *MyService {
    return &MyService{repo: repo, auditLogger: auditLogger}
}
```

### Step 2: Log After Successful Operation

```go
func (s *MyService) CreateItem(ctx context.Context, actor audit.Actor, ip string, item *Item) error {
    // 1. Perform the operation
    if err := s.repo.Create(ctx, item); err != nil {
        return err
    }

    // 2. Log the audit (after success)
    if err := s.auditLogger.LogInsert(audit.InsertParams{
        Module: "inventory",
        Entity: audit.Entity{
            Table:      "items",
            PrimaryKey: map[string]string{"id": item.ID},
        },
        InsertedData: map[string]interface{}{
            "id":    item.ID,
            "name":  item.Name,
            "stock": item.Stock,
        },
        BusinessKey: item.ID,
        Actor:       actor,
        IP:          ip,
        Summary:     fmt.Sprintf("Barang baru %s (%s) ditambahkan", item.ID, item.Name),
    }); err != nil {
        // Log error but don't fail the operation
        log.Printf("Failed to write audit log: %v", err)
    }

    return nil
}
```

### Step 3: For UPDATE, Track Changed Columns

```go
func (s *MyService) UpdateItem(ctx context.Context, actor audit.Actor, ip string, id string, updates map[string]interface{}) error {
    // 1. Get old data
    old, err := s.repo.GetByID(ctx, id)
    if err != nil {
        return err
    }

    // 2. Perform update
    if err := s.repo.Update(ctx, id, updates); err != nil {
        return err
    }

    // 3. Build changed columns
    changedColumns := make(map[string]audit.ColumnChange)
    for col, newVal := range updates {
        oldVal := getOldValue(old, col) // Helper to get old value
        if oldVal != newVal {
            changedColumns[col] = audit.ColumnChange{Old: oldVal, New: newVal}
        }
    }

    // 4. Log audit
    s.auditLogger.LogUpdate(audit.UpdateParams{
        Module: "inventory",
        Entity: audit.Entity{
            Table:      "items",
            PrimaryKey: map[string]string{"id": id},
        },
        ChangedColumns: changedColumns,
        Where:          map[string]interface{}{"id": id},
        BusinessKey:    id,
        Actor:          actor,
        IP:             ip,
        Summary:        fmt.Sprintf("Data barang %s diperbarui", id),
    })

    return nil
}
```

---

## 10. File Structure

```
backend/
├── storage/
│   └── logs/
│       └── audit/
│           ├── audit-2026-01-10.json
│           ├── audit-2026-01-11.json
│           └── ...
├── pkg/
│   └── audit/
│       └── audit.go
└── docs/
    └── logging-system.md (this file)
```

---

## 11. Searching Logs

Logs are searchable using standard tools:

```bash
# Find all actions by specific user
grep '"username":"admin"' storage/logs/audit/audit-2026-01-11.json

# Find all changes to specific record
grep '"business_key":"RM-2026-0001"' storage/logs/audit/*.json

# Find all INSERT operations
grep '"action":"INSERT"' storage/logs/audit/audit-2026-01-11.json

# Parse with jq
cat storage/logs/audit/audit-2026-01-11.json | jq 'select(.module=="farmasi")'
```
