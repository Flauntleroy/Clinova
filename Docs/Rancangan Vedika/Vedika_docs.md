# Dokumentasi Plugin Vedika

> **Ve**rifikasi **D**igital **K**laim - Modul Klaim Online BPJS untuk mLITE

---

## 1. Apa itu Vedika?

**Vedika** (Verifikasi Digital Klaim) adalah plugin mLITE yang berfungsi untuk:

1. **Mengelola klaim online BPJS Kesehatan** - Menjadi jembatan antara SIMRS dan sistem klaim BPJS
2. **Mengintegrasikan data perawatan pasien** dari SIMRS dengan sistem **E-Klaim INACBG BPJS**
3. **Memfasilitasi verifikasi digital** antara Rumah Sakit dan BPJS

---

## 2. Fungsi Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Manajemen Status Klaim** | Tracking status: Belum Diproses → Lengkap → Pengajuan → Perbaiki → Disetujui |
| **Bridging INACBG** | Kirim data klaim ke E-Klaim BPJS, grouping tarif INA-CBG |
| **Upload Berkas Digital** | Upload dokumen pendukung (SEP, SKDP, Laporan Operasi, dll) |
| **Dashboard Statistik** | Monitoring progress klaim per periode |
| **Dual Interface** | Admin RS (`/admin/vedika/...`) & Verifikator BPJS (`/veda/...`) |
| **Export Excel** | Export daftar klaim ke format Excel |
| **PDF Klaim** | Generate dokumen PDF lengkap untuk setiap klaim |

---

## 3. Tabel Database

### 3.1 Tabel Khusus Vedika

| Tabel | Fungsi | Kolom Utama |
|-------|--------|-------------|
| `mlite_vedika` | Status klaim per SEP | `id`, `tanggal`, `no_rkm_medis`, `no_rawat`, `tgl_registrasi`, `nosep`, `jenis`, `status`, `username` |
| `mlite_vedika_feedback` | Catatan/feedback verifikasi | `id`, `nosep`, `tanggal`, `catatan`, `username` |
| `mlite_users_vedika` | User verifikator BPJS | `id`, `username`, `fullname`, `password` |
| `mlite_settings` | Konfigurasi (module='vedika') | `module`, `field`, `value` |

### 3.2 Tabel Bridging BPJS

| Tabel | Fungsi |
|-------|--------|
| `bridging_sep` | Data SEP dari BPJS (40+ kolom) |
| `bridging_surat_pri_bpjs` | Surat Perintah Rawat Inap |
| `bpjs_prb` | Data Program Rujuk Balik |
| `maping_poli_bpjs` | Mapping poli RS ↔ kode BPJS |
| `maping_dokter_dpjpvclaim` | Mapping dokter ↔ DPJP BPJS |

### 3.3 Tabel SIMRS yang Dibaca

| Kategori | Tabel |
|----------|-------|
| **Master** | `pasien`, `dokter`, `poliklinik`, `penjab`, `pegawai`, `petugas`, `bangsal`, `kamar`, `penyakit`, `icd9`, `kecamatan`, `kabupaten`, `kategori_perawatan` |
| **Registrasi** | `reg_periksa`, `kamar_inap`, `dpjp_ranap` |
| **Medis** | `diagnosa_pasien`, `prosedur_pasien`, `resume_pasien`, `resume_pasien_ranap`, `pemeriksaan_ralan`, `pemeriksaan_ranap` |
| **Tindakan** | `rawat_jl_dr`, `rawat_jl_pr`, `rawat_jl_drpr`, `rawat_inap_dr`, `rawat_inap_pr`, `rawat_inap_drpr`, `jns_perawatan`, `jns_perawatan_inap` |
| **Penunjang** | `periksa_lab`, `detail_periksa_lab`, `jns_perawatan_lab`, `periksa_radiologi`, `hasil_radiologi`, `jns_perawatan_radiologi` |
| **Operasi** | `operasi`, `paket_operasi`, `beri_obat_operasi`, `laporan_operasi` |
| **Farmasi** | `detail_pemberian_obat`, `databarang`, `resep_pulang` |
| **Berkas** | `berkas_digital_perawatan`, `master_berkas_digital` |
| **Billing** | `billing`, `mlite_billing`, `tambahan_biaya`, `piutang_pasien` |

---

## 4. Relasi Antar Tabel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RELASI TABEL VEDIKA                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                  ┌──────────────────┐
                  │     pasien       │
                  │  (no_rkm_medis)  │◄────────────────────────┐
                  └────────┬─────────┘                         │
                           │ 1:N                               │
                           ▼                                   │
                  ┌──────────────────┐                         │
                  │   reg_periksa    │                         │
                  │   (no_rawat)     │◄─────┐                  │
                  └────────┬─────────┘      │                  │
                           │                │                  │
         ┌─────────────────┼─────────────┬──┴────────┬─────────┤
         │                 │             │           │         │
         ▼                 ▼             ▼           ▼         │
┌─────────────────┐ ┌────────────┐ ┌──────────┐ ┌─────────┐    │
│  bridging_sep   │ │ kamar_inap │ │ diagnosa │ │ billing │    │
│   (no_rawat)    │ │ (no_rawat) │ │ _pasien  │ │(no_rawat)    │
│   (no_sep)      │ └────────────┘ └──────────┘ └─────────┘    │
└────────┬────────┘                                            │
         │ no_sep                                              │
         │                                                     │
         ▼                                                     │
┌──────────────────────┐     ┌─────────────────────────┐       │
│    mlite_vedika      │     │  mlite_vedika_feedback  │       │
│                      │     │                         │       │
│ • no_rawat ──────────┼─────┼── → reg_periksa         │       │
│ • nosep ◄────────────┼─────┼── → bridging_sep        │       │
│ • no_rkm_medis ──────┼─────┼─────────────────────────┼───────┘
│ • status             │     │ • nosep ◄───────────────┘
│ • jenis (1=Ranap,    │     │ • catatan
│         2=Ralan)     │     │ • username
└──────────────────────┘     └─────────────────────────┘

                           ┌─────────────────────────┐
                           │  mlite_users_vedika     │
                           │  (User Verifikator BPJS)│
                           │                         │
                           │  • username (PK)        │
                           │  • fullname             │
                           │  • password             │
                           └─────────────────────────┘
```

---

## 5. Detail Struktur Tabel

### 5.1 mlite_vedika

Tabel utama untuk menyimpan status klaim per SEP.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT (PK) | Auto increment |
| `tanggal` | DATE | Tanggal status diubah |
| `no_rkm_medis` | VARCHAR(15) | FK → pasien.no_rkm_medis |
| `no_rawat` | VARCHAR(17) | FK → reg_periksa.no_rawat |
| `tgl_registrasi` | DATE | Tanggal registrasi pasien |
| `nosep` | VARCHAR(40) | FK → bridging_sep.no_sep (UNIQUE) |
| `jenis` | ENUM('1','2') | 1=Rawat Inap, 2=Rawat Jalan |
| `status` | VARCHAR(20) | Lengkap \| Pengajuan \| Perbaiki \| Setuju |
| `username` | VARCHAR(50) | FK → pegawai.nik / mlite_users.username |

### 5.2 mlite_vedika_feedback

Tabel untuk menyimpan catatan/feedback verifikasi.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT (PK) | Auto increment |
| `nosep` | VARCHAR(40) | FK → bridging_sep.no_sep |
| `tanggal` | DATE | Tanggal feedback |
| `catatan` | TEXT | Isi feedback |
| `username` | VARCHAR(50) | User pemberi feedback |

### 5.3 mlite_users_vedika

Tabel user verifikator BPJS dengan login terpisah.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT (PK) | Auto increment |
| `username` | VARCHAR(50) | Username (UNIQUE) |
| `fullname` | VARCHAR(100) | Nama lengkap |
| `password` | VARCHAR(255) | Password (hashed) |

---

## 6. Catatan Penting

| Item | Keterangan |
|------|------------|
| **Jenis Pelayanan** | 1 = Rawat Inap, 2 = Rawat Jalan |
| **Alur Status** | Lengkap → Pengajuan → Perbaiki (jika ditolak) → Setuju |
| **File Storage** | `webapps/berkasrawat/pages/upload/` |
| **Enkripsi BPJS** | Menggunakan LZ-String compression |
| **Session Verifikator** | `$_SESSION['vedika_user']`, `$_SESSION['vedika_token']` |
| **Konversi no_rawat** | Slash dihapus untuk URL, dikembalikan untuk query |

---