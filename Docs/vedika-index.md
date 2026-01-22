# Vedika Index (Workbench) - Technical Documentation

## Overview

Halaman **Vedika Index** adalah workbench untuk petugas Vedika mengelola klaim BPJS. Halaman ini menampilkan daftar episode pasien yang memenuhi syarat klaim dan memungkinkan berbagai aksi seperti update status, edit diagnosis/prosedur, dan lihat resume.

---

## URL & Routes

| Route | Description |
|-------|-------------|
| `/vedika/index` | Halaman Index Workbench |
| `/vedika` | Dashboard (terpisah) |

---

## API Endpoints

### List Index
```
GET /admin/vedika/index
Query: date_from, date_to, status, jenis, search, page, limit
```

### Claim Detail
```
GET /admin/vedika/claim/{no_rawat}
Note: no_rawat mengandung slash (e.g., 2025/12/29/000045)
```

### Claim Actions (menggunakan query parameter)
```
POST /admin/vedika/claim-action/status?no_rawat=...
POST /admin/vedika/claim-action/diagnosis?no_rawat=...
POST /admin/vedika/claim-action/procedure?no_rawat=...
POST /admin/vedika/claim-action/documents?no_rawat=...
GET  /admin/vedika/claim-action/resume?no_rawat=...
```

---

## Masalah & Solusi

### 1. Route 404 karena Slash dalam no_rawat

**Masalah:**
- `no_rawat` format: `2025/12/29/000045` mengandung slash
- Gin router tidak bisa handle `/:no_rawat` dengan encoded slash
- Request `/claim/2025%2F12%2F29%2F000045` return 404

**Solusi:**
- Claim detail: Gunakan wildcard `*no_rawat` → `/admin/vedika/claim/*no_rawat`
- Claim actions: Gunakan query parameter → `/claim-action/status?no_rawat=...`

**Files Changed:**
- `router.go` - Route patterns
- `workbench_handler.go` - Parameter extraction
- `api.ts` (frontend) - Endpoint URLs

---

### 2. Query Performance Lambat (28 detik → 1.5 detik)

**Masalah Awal:**
Query untuk status RENCANA sangat lambat (28 detik untuk 10 data).

**Root Causes:**

| Penyebab | Waktu | Solusi |
|----------|-------|--------|
| `NOT IN` subquery | +19s | Ganti dengan `NOT EXISTS` |
| COUNT query | +9s | Skip COUNT, gunakan LIMIT+1 pattern |
| Scan semua pasien | +10s | Filter `penjab.kd_pj IN ('BPJ')` - **KRITIS!** |

**Query Original vs Optimized:**

```sql
-- SEBELUM (lambat)
SELECT ... FROM reg_periksa rp
WHERE rp.tgl_registrasi BETWEEN ? AND ?
  AND rp.status_lanjut = 'Ralan'
  AND rp.no_rawat NOT IN (SELECT no_rawat FROM mlite_vedika)

-- SESUDAH (cepat)
SELECT ... FROM reg_periksa rp
INNER JOIN penjab pj ON rp.kd_pj = pj.kd_pj
WHERE rp.tgl_registrasi >= ?
  AND rp.tgl_registrasi < DATE_ADD(?, INTERVAL 1 DAY)
  AND rp.status_lanjut = 'Ralan'
  AND rp.stts <> 'Batal'
  AND pj.kd_pj IN ('BPJ')  -- <-- FILTER BPJS!
  AND NOT EXISTS (SELECT 1 FROM mlite_vedika mv WHERE mv.no_rawat = rp.no_rawat)
```

**Files Changed:**
- `index_repository.go` - Query optimization
- `claim.go` - Added `Carabayar` field to `IndexFilter`

---

### 3. usePermissions Import Error

**Masalah:**
```
SyntaxError: 'AuthContext' is not exported
```

**Solusi:**
Gunakan `useAuth` hook yang sudah ada, bukan akses langsung ke `AuthContext`.

**File Changed:**
- `usePermissions.ts`

---

## Database Index (Rekomendasi)

Untuk performa optimal (< 1 detik), tambahkan index:

```sql
-- Index untuk filter utama
CREATE INDEX idx_regperiksa_optimal 
ON reg_periksa(kd_pj, tgl_registrasi, status_lanjut, stts);

-- Index untuk NOT EXISTS lookup
CREATE INDEX idx_mlitevedika_norawat 
ON mlite_vedika(no_rawat);
```

> **Note:** Index tidak akan merusak SIMRS Java yang ada. Index hanya mempercepat query.

---

## File Structure

### Backend
```
internal/vedika/
├── entity/
│   └── claim.go              # IndexFilter + Carabayar field
├── handler/
│   ├── router.go             # Route patterns (wildcard + query param)
│   ├── workbench_handler.go  # Handler functions
│   └── errors.go             # Error handling
├── repository/
│   └── index_repository.go   # Optimized queries
└── service/
    └── workbench_service.go  # Business logic
```

### Frontend
```
src/pages/Vedika/
├── VedikaIndex.tsx           # Main page
└── components/
    ├── VedikaFilterPanel.tsx # Filter form
    ├── VedikaClaimItem.tsx   # Claim card
    ├── StatusModal.tsx       # Update status
    ├── DiagnosisModal.tsx    # Edit diagnosis
    ├── ProcedureModal.tsx    # Edit procedure
    ├── ClaimDetailModal.tsx  # View detail
    └── ResumeDrawer.tsx      # View resume

src/config/api.ts             # API endpoints
src/hooks/usePermissions.ts   # RBAC hook
```

---

## RBAC Permissions

| Permission | Description |
|------------|-------------|
| `vedika.read` | View index list |
| `vedika.claim.read` | View claim detail |
| `vedika.claim.update_status` | Update status |
| `vedika.claim.edit_medical_data` | Edit Dx/Procedure |
| `vedika.claim.upload_document` | Upload documents |
| `vedika.claim.read_resume` | View resume |

---

## Status Fitur

### ✅ Selesai
- Index Workbench (List, Filter, Search, Pagination)
- Claim Detail dengan 23 kategori data
- Routes untuk `no_rawat` dengan slash
- Query optimization (28s → 1.5s)

### Claim Detail Modal
- [x] Data Pasien & Registrasi
- [x] Data SEP & PRB
- [x] Diagnosa & Prosedur
- [x] Resume Medis
- [x] Pemeriksaan SOAP
- [x] Tindakan Ralan/Ranap
- [x] Radiologi & Laboratorium
- [x] Obat (Pemberian & Pulang)
- [x] Billing

### 🚧 Belum Selesai
- [ ] Document Upload Modal & Backend
- [ ] Surgery data display
- [ ] DPJP Ranap display

---

## Performance Summary

| Metric | Before | After |
|--------|--------|-------|
| Index query (2 bulan) | 28s | 1.5s |
| Index query (dengan index DB) | 1.5s | < 0.5s (estimated) |
| Claim detail | 3s | 3s (needs DB index) |

---

## Related Documentation

- [Vedika Dashboard](./vedika-dashboard.md)
- [OpenAPI Spec](../backend/openapi-vedika.yaml)
