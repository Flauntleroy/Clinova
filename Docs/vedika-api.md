# Vedika API Documentation

Dokumentasi API untuk modul Vedika (Verifikasi Digital Klaim BPJS).

---

## Autentikasi

Semua endpoint memerlukan:
- Header: `Authorization: Bearer <access_token>`
- Permission: Sesuai endpoint (lihat tabel di bawah)

---

## Dashboard API (Policy-Driven)

Dashboard menggunakan `active_period` dari `mera_settings`.

### GET /admin/vedika/dashboard

**Permission:** `vedika.read`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "2026-01",
    "summary": {
      "rencana": { "ralan": 150, "ranap": 45 },
      "pengajuan": { "ralan": 120, "ranap": 30 },
      "maturasi": { "ralan": 80.0, "ranap": 66.67 }
    }
  }
}
```

### GET /admin/vedika/dashboard/trend

**Permission:** `vedika.read`

Returns daily trend data for charts.

---

## Index Workbench API (Data-Driven)

Index menggunakan **DATE RANGE FILTER** (bukan active_period).

### GET /admin/vedika/index

**Permission:** `vedika.read`

**Query Parameters (Required):**
| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `date_from` | string | Start date (YYYY-MM-DD) |
| `date_to` | string | End date (YYYY-MM-DD) |
| `status` | string | `RENCANA`, `PENGAJUAN`, `PERBAIKAN`, `LENGKAP`, `SETUJU` |

**Query Parameters (Optional):**
| Parameter | Tipe | Default | Deskripsi |
|-----------|------|---------|-----------|
| `jenis` | string | ralan | `ralan` atau `ranap` |
| `page` | int | 1 | Nomor halaman |
| `limit` | int | 10 | Item per halaman (max 100) |
| `search` | string | - | Cari berdasarkan nama, no_rawat, no_rm |

**Response:**
```json
{
  "success": true,
  "data": {
    "filter": {
      "date_from": "2026-01-01",
      "date_to": "2026-01-31",
      "status": "RENCANA",
      "jenis": "ralan"
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 120
    },
    "items": [
      {
        "no_rawat": "2026/01/01/000001",
        "no_rm": "000001",
        "nama_pasien": "Budi Santoso",
        "jenis": "ralan",
        "tgl_pelayanan": "2026-01-01",
        "unit": "POLI UMUM",
        "dokter": "dr. Andi",
        "cara_bayar": "BPJS",
        "status": "RENCANA"
      }
    ]
  }
}
```

---

### GET /admin/vedika/claim/:no_rawat

**Permission:** `vedika.claim.read`

Returns full claim context.

---

### POST /admin/vedika/claim/:no_rawat/status

**Permission:** `vedika.claim.update_status`

**Request Body:**
```json
{
  "status": "PENGAJUAN",
  "catatan": "Berkas lengkap"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status berhasil diubah",
  "data": { "status": "PENGAJUAN" }
}
```

---

### POST /admin/vedika/claim/:no_rawat/diagnosis

**Permission:** `vedika.claim.edit_medical_data`

**Request Body:**
```json
{
  "kode_penyakit": "A01.0",
  "status_dx": "Utama",
  "prioritas": 1
}
```

---

### POST /admin/vedika/claim/:no_rawat/procedure

**Permission:** `vedika.claim.edit_medical_data`

**Request Body:**
```json
{
  "kode": "99.25",
  "prioritas": 1
}
```

---

### POST /admin/vedika/claim/:no_rawat/documents

**Permission:** `vedika.claim.upload_document`

> ⚠️ Not yet implemented (file upload handling)

---

### GET /admin/vedika/claim/:no_rawat/resume

**Permission:** `vedika.claim.read_resume`

Returns medical resume (read-only).

---

## Status Definitions

| Status | Kode | Deskripsi |
|--------|------|-----------|
| RENCANA | `RENCANA` | Episode eligible, belum di mlite_vedika |
| PENGAJUAN | `PENGAJUAN` | Sudah recorded di mlite_vedika |
| PERBAIKAN | `PERBAIKAN` | Dikembalikan untuk koreksi |
| LENGKAP | `LENGKAP` | Klaim lengkap, siap |
| SETUJU | `SETUJU` | Klaim disetujui |

---

## Date Logic

| Jenis | Kolom Filter | Keterangan |
|-------|--------------|------------|
| **RALAN** | `reg_periksa.tgl_registrasi` | Tanggal registrasi |
| **RANAP** | `kamar_inap.tgl_keluar` | Tanggal pulang (MUST NOT NULL) |

---

## Permissions

| Permission | Deskripsi |
|------------|-----------|
| `vedika.read` | Dashboard + list index |
| `vedika.claim.read` | View claim detail |
| `vedika.claim.update_status` | Update status |
| `vedika.claim.edit_medical_data` | Edit diagnosis/procedure |
| `vedika.claim.upload_document` | Upload documents |
| `vedika.claim.read_resume` | View resume |

---

## Error Responses

| Code | HTTP Status | Deskripsi |
|------|-------------|-----------|
| `INVALID_PARAMS` | 400 | Missing required parameter |
| `VEDIKA_SETTINGS_MISSING` | 503 | Settings not configured |
| `UNAUTHORIZED` | 401 | Token tidak valid |
| `PERMISSION_DENIED` | 403 | Missing permission |
