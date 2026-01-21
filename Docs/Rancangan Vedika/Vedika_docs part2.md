

## 7. Antarmuka Utama

Vedika memiliki **dua interface berbeda** yang digunakan oleh pengguna yang berbeda:

### 7.1 Ringkasan Interface

| Interface | URL | Pengguna | File Controller |
|-----------|-----|----------|-----------------|
| **Admin RS** | `/admin/vedika/...` | Admin RS, Petugas Klaim | `Admin.php` (3744 baris, 75+ methods) |
| **Verifikator BPJS** | `/veda/...` | Verifikator BPJS | `Site.php` (1299 baris, 35+ methods) |

---

### 7.2 Halaman Admin RS (`/admin/vedika/...`)

Interface utama untuk staf Rumah Sakit dengan akses penuh ke semua fitur.

#### A. Halaman Utama

| No | Halaman | URL | Template | Fungsi |
|----|---------|-----|----------|--------|
| 1 | **Dashboard** | `/admin/vedika/manage` | `manage.html` | Dashboard statistik & menu navigasi |
| 2 | **Index** | `/admin/vedika/index` | `index.html` | Daftar klaim belum diproses |
| 3 | **Lengkap** | `/admin/vedika/lengkap` | `lengkap.html` | Daftar klaim dengan status "Lengkap" |
| 4 | **Pengajuan** | `/admin/vedika/pengajuan` | `pengajuan.html` | Daftar klaim yang sudah diajukan |
| 5 | **Perbaikan** | `/admin/vedika/perbaikan` | `perbaikan.html` | Daftar klaim yang perlu diperbaiki |

#### B. Halaman Pengaturan

| No | Halaman | URL | Template | Fungsi |
|----|---------|-----|----------|--------|
| 6 | **Settings** | `/admin/vedika/settings` | `settings.html` | Pengaturan umum plugin |
| 7 | **Mapping INACBG** | `/admin/vedika/mappinginacbgs` | `mapping.inacbgs.html` | Mapping kategori perawatan ke komponen INACBG |
| 8 | **Bridging E-Klaim** | `/admin/vedika/bridgingeklaim` | `bridging.eklaim.html` | Konfigurasi koneksi ke E-Klaim BPJS |
| 9 | **User Vedika** | `/admin/vedika/users` | `users.html` | Manajemen user verifikator BPJS |

#### C. Modal/Popup

| No | Modal | Template | Fungsi |
|----|-------|----------|--------|
| 10 | **Set Status** | `setstatus.html` | Form ubah status klaim + riwayat feedback |
| 11 | **Berkas Perawatan** | `berkasperawatan.html` | Upload berkas digital pendukung |
| 12 | **Grouping INACBG** | `inacbgs.html` | Form lengkap bridging E-Klaim (42KB, 5 tab) |
| 13 | **Form Resume Ralan** | `form.resume.html` | Input resume rawat jalan |
| 14 | **Form Resume Ranap** | `form.resume.ranap.html` | Input resume rawat inap |
| 15 | **Ubah Diagnosa** | `ubah.diagnosa.html` | Edit diagnosa pasien (ICD-10) |
| 16 | **Ubah Prosedur** | `ubah.prosedur.html` | Edit prosedur pasien (ICD-9) |
| 17 | **Form SEP VClaim** | `form.sepvclaim.html` | Ambil SEP dari VClaim BPJS |
| 18 | **Form User** | `user.form.html` | Tambah/edit user verifikator |

#### D. Output/Export

| No | Output | Template | Fungsi |
|----|--------|----------|--------|
| 19 | **PDF Klaim** | `pdf.html` | Template PDF klaim lengkap (78KB) |
| 20 | **Excel Lengkap** | `lengkap_excel.html` | Export daftar klaim lengkap |
| 21 | **Excel Pengajuan** | `pengajuan_excel.html` | Export daftar pengajuan |
| 22 | **Excel Perbaikan** | `perbaikan_excel.html` | Export daftar perbaikan |

---

### 7.3 Halaman Verifikator BPJS (`/veda/...`)

Interface khusus untuk verifikator BPJS dengan login terpisah.

| No | Halaman | URL | Template | Fungsi |
|----|---------|-----|----------|--------|
| 1 | **Login** | `/veda` | `login.html` | Halaman login verifikator |
| 2 | **Dashboard** | `/veda` (setelah login) | `index.html` | Dashboard statistik verifikator |
| 3 | **Pengajuan Ralan** | `/veda/pengajuan/ralan` | `pengajuan_ralan.html` | Review klaim rawat jalan |
| 4 | **Pengajuan Ranap** | `/veda/pengajuan/ranap` | `pengajuan_ranap.html` | Review klaim rawat inap |
| 5 | **Perbaikan** | `/veda/perbaikan` | `perbaikan.html` | Daftar klaim yang perlu diperbaiki |
| 6 | **PDF Klaim** | `/veda/pdf/{no_rawat}` | `pdf.html` | Lihat PDF klaim |
| 7 | **Catatan** | `/veda/catatan/{nosep}` | `catatan.html` | Tambah catatan/feedback |
| 8 | **Export Excel** | `/veda/perbaikan/excel` | `perbaikan_excel.html` | Export daftar perbaikan |

---

### 7.4 Detail Halaman Dashboard (`/admin/vedika/manage`)

Dashboard utama yang menampilkan ringkasan statistik klaim.

**Komponen:**

```
┌─────────────────────────────────────────────────────────────┐
│  Periode Klaim [Bulan] [Tahun]          [📅 Pilih] [Go]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  │ 🔴 RENCANA   │ │ 🔵 LENGKAP   │ │ 🟡 PENGAJUAN │ │ 🟢 PERBAIKAN │
│  │    KLAIM     │ │              │ │              │ │              │
│  │ Ralan: XX    │ │ Ralan: XX    │ │ Ralan: XX    │ │ Ralan: XX    │
│  │ Ranap: XX    │ │ Ranap: XX    │ │ Ranap: XX    │ │ Ranap: XX    │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │         📊 Maturasi Klaim BPJS Dalam %                  │
│  │  [Bar Chart: Rencana Klaim | Rawat Jalan | Rawat Inap]  │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ Index  │ │Lengkap │ │Pengajuan│ │Perbaikan│ ...          │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
└─────────────────────────────────────────────────────────────┘
```

**Panel Statistik (4 panel warna berbeda):**

| Panel | Warna | Icon | Isi |
|-------|-------|------|-----|
| Rencana Klaim | 🔴 Merah (bg-danger) | `fa-calendar-plus-o` | Jumlah target klaim Ralan & Ranap + persentase |
| Status Lengkap | 🔵 Biru (bg-info) | `fa-calendar` | Jumlah klaim lengkap Ralan & Ranap + persentase |
| Status Pengajuan | 🟡 Kuning (bg-warning) | `fa-users` | Jumlah klaim diajukan Ralan & Ranap + persentase |
| Status Perbaikan | 🟢 Hijau (bg-success) | `fa-wheelchair` | Jumlah klaim perbaiki Ralan & Ranap + persentase |

**Menu Sub-Module (8 item):**
1. Index - Daftar klaim belum diproses
2. Lengkap - Daftar klaim lengkap
3. Pengajuan - Daftar klaim pengajuan
4. Perbaikan - Daftar klaim perbaikan
5. Mapping Inacbgs - Pengaturan mapping
6. Bridging Eklaim - Konfigurasi E-Klaim
7. User Vedika - Manajemen user verifikator
8. Pengaturan - Setting umum

---

### 7.5 Detail Halaman Index (`/admin/vedika/index`)

Halaman daftar klaim yang **belum diproses** (belum ada di tabel `mlite_vedika`).

**Komponen:**

| Komponen | Deskripsi |
|----------|-----------|
| **Filter Panel** | Dropdown dengan pilihan tanggal (start/end), tab Ralan/Ranap |
| **Info Bar** | Label jumlah data + search box |
| **Tabel Data** | 5 kolom utama |
| **Pagination** | Navigasi halaman |

**Kolom Tabel:**

| Kolom | Isi |
|-------|-----|
| **Aksi dan Proses** | Tombol-tombol aksi (SEP, PDF, Status, Hapus) |
| **Data Pasien** | No.Rawat, No.RM, Nama, Umur, JK, Alamat |
| **Data Registrasi** | Tgl.Registrasi, Poliklinik/Bangsal, Dokter, Status |
| **Data Kunjungan** | No. Kunjungan, No. Kartu, Dx. Utama, Pros. Utama |
| **Berkas Digital** | Tombol upload + daftar berkas + tombol Resume |

**Tombol Aksi:**

| Tombol | Warna | Fungsi | Kondisi |
|--------|-------|--------|---------|
| "Ambil SEP dari Vclaim" | 🔵 Info | Buka modal ambil SEP | Jika no_sep kosong |
| [No SEP] | 🔵 Info | Menampilkan nomor SEP | Jika no_sep ada |
| "Lihat Data Klaim" | 🔵 Primary | Buka PDF di tab baru | Selalu |
| "Status" (disabled) | 🟡 Warning | - | Jika no_sep kosong |
| "Status" | 🟢 Success | Buka modal setstatus | Jika no_sep ada |
| Badge status | Varies | Menampilkan status | Jika sudah diproses |
| "Hapus" | 🔴 Danger | Hapus data vedika | Jika no_sep ada |
| "Unggah Berkas" | 🔵 Info | Buka modal upload | Selalu |
| "Resume" | 🔴 Danger | Buka form resume | Selalu |
