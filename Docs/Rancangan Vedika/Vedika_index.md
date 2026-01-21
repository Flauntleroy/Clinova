# Dokumentasi Halaman Index Vedika

> Halaman daftar klaim BPJS yang **belum diproses**

---

## 1. Informasi Umum

| Item | Nilai |
|------|-------|
| **URL** | `/admin/vedika/index/{type}/{page}` |
| **Template** | `view/admin/index.html` |
| **Controller** | `Admin.php` → method `anyIndex()` |
| **Type** | `ralan` (Rawat Jalan) atau `ranap` (Rawat Inap) |

---

## 2. Fungsi Halaman

Halaman ini menampilkan daftar pasien BPJS yang:
- ✅ Sudah selesai perawatan (status registrasi bukan "Batal")
- ✅ Cara bayar sesuai konfigurasi BPJS (`vedika.carabayar`)
- ❌ **Belum ada** di tabel `mlite_vedika` (belum diproses)

**Query Filter:**
```sql
WHERE reg_periksa.no_rawat NOT IN (SELECT no_rawat FROM mlite_vedika)
```

---

## 3. Layout Halaman

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Panel Header: "Kelola e-Vedika"                    [📅 Pilihan dan Pemilahan]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Jumlah: XX                                              [🔍 Search Box]    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┐ │
│ │ Aksi dan    │ Data        │ Data        │ Data        │ Berkas          │ │
│ │ Proses      │ Pasien      │ Registrasi  │ Kunjungan   │ Digital         │ │
│ ├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────┤ │
│ │ [Tombol]    │ No.Rawat    │ Tgl.Reg     │ No.Kunjungan│ [Upload]        │ │
│ │ [SEP]       │ No.RM       │ Poliklinik  │ No.Kartu    │ - Berkas 1      │ │
│ │ [PDF]       │ Nama        │ Dokter      │ Dx.Utama    │ - Berkas 2      │ │
│ │ [Status]    │ Umur        │ Status      │ Pros.Utama  │ [Resume]        │ │
│ │ [Hapus]     │ JK, Alamat  │             │             │                 │ │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘ │
│                                                                             │
│                        [« Prev] [1] [2] [3] [Next »]                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Komponen Header

### 4.1 Dropdown "Pilihan dan Pemilahan"

| Komponen | Tipe | Fungsi |
|----------|------|--------|
| Start Date | Datepicker | Filter tanggal awal |
| End Date | Datepicker | Filter tanggal akhir |
| Tab Rawat Jalan | Button Link | Switch ke `/admin/vedika/index/ralan` |
| Tab Rawat Inap | Button Link | Switch ke `/admin/vedika/index/ranap` |
| Submit | Button | Terapkan filter tanggal |

### 4.2 Info Bar

| Komponen | Posisi | Fungsi |
|----------|--------|--------|
| "Jumlah: XX" | Kiri | Menampilkan total record |
| Search Box | Kanan | Cari berdasarkan: no_rkm_medis, no_rawat, nm_pasien |

---

## 5. Kolom Tabel

### 5.1 Kolom "Aksi dan Proses"

Berisi tombol-tombol aksi untuk setiap baris data.

| Tombol | Warna | Icon | Fungsi | Kondisi Tampil |
|--------|-------|------|--------|----------------|
| "Ambil SEP dari Vclaim" | 🔵 btn-info | `fa-download` | Buka modal form SEP | Jika `no_sep` kosong |
| [Nomor SEP] | 🔵 btn-info | `fa-file-o` | Menampilkan nomor SEP | Jika `no_sep` ada |
| "Lihat Data Klaim" | 🔵 btn-primary | `fa-print` | Buka PDF di tab baru | Selalu tampil |
| "Status" (disabled) | 🟡 btn-warning | `fa-check` | Button disabled | Jika `no_sep` kosong |
| "Status" | 🟢 btn-success | `fa-check` | Buka modal set status | Jika `no_sep` ada |
| Badge Status | 🟢/🟡/🔴 | - | Menampilkan status terkini | Jika sudah pernah diproses |
| "Hapus" | 🔴 btn-danger | `fa-trash` | Hapus data dari mlite_vedika | Jika `no_sep` ada |

**Catatan:** Tombol "Status" tidak bisa diklik jika belum ada SEP. User harus ambil SEP dulu.

---

## 5.A Detail Tombol-Tombol Aksi

### 🔵 Tombol 1: "Ambil SEP dari Vclaim"

**Tampilan:** Button biru dengan icon `fa-download`

**Fungsi:** Mengambil data SEP (Surat Eligibilitas Peserta) dari API VClaim BPJS dan menyimpan ke database lokal.

**Kondisi Tampil:** Hanya muncul jika pasien **belum memiliki SEP** di tabel `bridging_sep`.

**Modal Form (`form.sepvclaim.html`):**

| Field | Tipe | Keterangan |
|-------|------|------------|
| Nomor SEP | Text Input | Masukkan nomor SEP dari BPJS |
| Asal Rujukan | Select | Pilih: Faskes 1 atau Faskes 2 |
| Tanggal Rujukan | Datepicker | Format: YYYY-MM-DD |
| Kode Diagnosa | Text Input | Kode ICD-10 |
| Poli Tujuan | Select | Dari tabel `poliklinik` |
| Dokter PJ | Select | Dari tabel `dokter` |

**Proses:**
1. User mengisi form SEP
2. Sistem memanggil API VClaim BPJS
3. Data SEP disimpan ke tabel `bridging_sep`
4. Tombol SEP berubah menjadi menampilkan nomor SEP

---

### 🔵 Tombol 2: "Lihat Data Klaim" ⭐ (PENTING)

**Tampilan:** Button biru dengan icon `fa-print` dan label "Lihat Data Klaim"

**Fungsi:** Membuka halaman PDF lengkap di tab baru yang berisi **SEMUA data klaim** pasien.

**URL:** `/admin/vedika/pdf/{no_rawat_encoded}`

**Template:** `view/admin/pdf.html` (78 KB, 2071 baris)

#### Isi PDF Klaim:

PDF ini terdiri dari beberapa section yang ditampilkan secara berurutan:

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRUKTUR PDF DATA KLAIM                       │
└─────────────────────────────────────────────────────────────────┘

📄 PAGE 1: SURAT ELIGIBILITAS PESERTA (SEP)
├── Header BPJS + Logo
├── Barcode Nomor SEP
├── Data Peserta (No.Kartu, Nama, Tgl.Lahir, JK)
├── Data Rujukan (Faskes Perujuk, Diagnosa Awal)
├── Data Pelayanan (Poli, Kelas, DPJP)
├── QR Code + Tanda Tangan
└── Masa Berlaku Rujukan

📄 PAGE 2: SOAP DAN RIWAYAT PERAWATAN
├── Data Pasien Lengkap
│   ├── No.RM, Nama, Alamat, Umur, JK
│   ├── Tempat & Tgl Lahir, Ibu Kandung
│   ├── Gol.Darah, Status Nikah, Agama, Pendidikan
│   └── Tgl Pertama Daftar
├── Data Registrasi
│   ├── No.Rawat, No.Registrasi
│   ├── Tgl Registrasi, Unit/Poliklinik
│   ├── Dokter, Cara Bayar
│   └── Penanggung Jawab + Alamat + Hubungan
├── Diagnosa (ICD-10)
│   └── Tabel: Kode | Nama Penyakit
├── Prosedur (ICD-9)
│   └── Tabel: Kode | Nama Tindakan
└── Pemeriksaan (SOAP)
    ├── Rawat Jalan: Tgl, Vital Sign, Subjek/Objek/Asesmen/Plan
    └── Rawat Inap: Tgl, Vital Sign, Subjek/Objek/Asesmen/Plan

📄 PAGE 3: TINDAKAN MEDIS
├── Tindakan Rawat Jalan Dokter
├── Tindakan Rawat Jalan Paramedis
├── Tindakan Rawat Jalan Dokter & Perawat
├── Tindakan Rawat Inap Dokter
├── Tindakan Rawat Inap Perawat
├── Tindakan Rawat Inap Dokter & Perawat
└── Data Kamar Inap (jika Ranap)
    └── Tgl Masuk, Tgl Keluar, Lama Inap, Kamar, Status

📄 PAGE 4: OPERASI (jika ada)
├── Tabel Operasi: Tgl, Kode, Nama, Anastesi
└── Laporan Operasi (detail)

📄 PAGE 5: LABORATORIUM (jika ada)
├── Header Lab
└── Tabel Hasil: Parameter | Nilai | Satuan | Nilai Normal

📄 PAGE 6: RADIOLOGI (jika ada)
├── Header Radiologi
├── Hasil Pemeriksaan
└── Gambar Radiologi (jika ada)

📄 PAGE 7: OBAT & FARMASI
├── Resep Obat
└── Detail Pemberian Obat

📄 PAGE 8: RESUME MEDIS
├── Resume Rawat Jalan atau
└── Resume Rawat Inap

📄 PAGE 9: BILLING / RINCIAN BIAYA
├── Tabel Billing
│   └── No | Nama Perawatan | Biaya | Jumlah | Total
└── GRAND TOTAL

📄 PAGE 10: BERKAS DIGITAL
└── Galeri berkas yang sudah diupload
```

#### Sumber Data PDF:

| Section | Tabel Database |
|---------|----------------|
| SEP | `bridging_sep`, `bpjs_prb` |
| Data Pasien | `pasien`, `kecamatan`, `kabupaten` |
| Registrasi | `reg_periksa`, `dokter`, `poliklinik`, `penjab` |
| Diagnosa | `diagnosa_pasien`, `penyakit` |
| Prosedur | `prosedur_pasien`, `icd9` |
| Pemeriksaan Ralan | `pemeriksaan_ralan` |
| Pemeriksaan Ranap | `pemeriksaan_ranap` |
| Tindakan Ralan | `rawat_jl_dr`, `rawat_jl_pr`, `rawat_jl_drpr` |
| Tindakan Ranap | `rawat_inap_dr`, `rawat_inap_pr`, `rawat_inap_drpr` |
| Kamar Inap | `kamar_inap`, `bangsal` |
| Operasi | `operasi`, `paket_operasi`, `laporan_operasi` |
| Laboratorium | `periksa_lab`, `detail_periksa_lab`, `template_laboratorium` |
| Radiologi | `periksa_radiologi`, `hasil_radiologi`, `gambar_radiologi` |
| Obat | `detail_pemberian_obat`, `beri_obat_operasi` |
| Resume Ralan | `resume_pasien` |
| Resume Ranap | `resume_pasien_ranap` |
| Billing | `billing`, `mlite_billing` |
| Berkas Digital | `berkas_digital_perawatan`, `master_berkas_digital` |

#### Kegunaan:
1. **Review data** sebelum mengajukan klaim
2. **Cetak dokumen** untuk arsip fisik
3. **Validasi kelengkapan** data medis dan administrasi
4. **Dokumen pendukung** untuk verifikasi BPJS

---

### 🟢 Tombol 3: "Status"

**Tampilan:** 
- 🟡 Kuning (disabled) jika belum ada SEP
- 🟢 Hijau (aktif) jika sudah ada SEP

**Fungsi:** Mengubah status klaim dan menambahkan catatan.

**Modal Form:** Lihat bagian **6.1 Modal Set Status**.

**Pilihan Status:**
| Status | Warna Badge | Keterangan |
|--------|-------------|------------|
| Lengkap | 🟡 Warning | Berkas lengkap, siap diajukan |
| Pengajuan | 🔵 Primary | Sudah diajukan ke BPJS |
| Perbaiki | 🔴 Error | Perlu perbaikan/koreksi |
| Setuju | 🟢 Success | Klaim disetujui |

---

### 🔴 Tombol 4: "Hapus"

**Tampilan:** Button merah dengan icon `fa-trash`

**Fungsi:** Menghapus data klaim dari tabel `mlite_vedika`.

**Kondisi Tampil:** Hanya muncul jika sudah ada SEP.

**Proses:**
1. Tampil konfirmasi dengan bootbox
2. Jika dikonfirmasi, redirect ke `/admin/vedika/hapus/{no_sep}`
3. Data dihapus dari `mlite_vedika`
4. Pasien kembali muncul di halaman Index

---

### 🔵 Tombol 5: "Unggah Berkas Perawatan"

**Tampilan:** Button biru dengan teks "Unggah Berkas Perawatan"

**Fungsi:** Upload berkas digital pendukung klaim.

**Modal Form:** Lihat bagian **6.2 Modal Berkas Perawatan**.

**Kategori Berkas yang bisa diupload:**
- SEP
- Kartu BPJS
- KTP
- SKDP / Form DPJP
- Hasil Lab
- Hasil Radiologi
- Laporan Operasi
- Resume Medis
- dll (sesuai `master_berkas_digital`)

---

### 🔴 Tombol 6: "Resume"

**Tampilan:** Button merah dengan teks "Resume"

**Fungsi:** Membuka form input resume medis.

**Modal Form:**
- Ralan: `form.resume.html`
- Ranap: `form.resume.ranap.html`

**Isi Form Resume:**
- Anamnesa/Keluhan Utama
- Pemeriksaan Fisik
- Diagnosa Akhir
- Terapi/Tindakan
- Anjuran/Instruksi
- Dokter Penanggung Jawab

---

### 🔗 Link "Dx. Utama" dan "Pros. Utama"

**Tampilan:** Link teks di kolom Data Kunjungan

**Fungsi:** 
- **Dx. Utama** → Buka modal ubah diagnosa (ICD-10)
- **Pros. Utama** → Buka modal ubah prosedur (ICD-9)

**Modal Form:**
- `ubah.diagnosa.html` → Edit/tambah diagnosa
- `ubah.prosedur.html` → Edit/tambah prosedur

### 5.2 Kolom "Data Pasien"

| Field | Sumber Data |
|-------|-------------|
| No.Rawat | `reg_periksa.no_rawat` |
| No.RM | `reg_periksa.no_rkm_medis` |
| Nama Pasien | `pasien.nm_pasien` |
| Umur | `reg_periksa.umurdaftar` + `reg_periksa.sttsumur` |
| Jenis Kelamin | `pasien.jk` (L=Laki-Laki, P=Perempuan) |
| Alamat | `pasien.alamat` (truncated 20 karakter) |

### 5.3 Kolom "Data Registrasi"

| Field | Ralan | Ranap |
|-------|-------|-------|
| **Label Tanggal** | Tgl.Registrasi | Tgl.Pulang |
| **Nilai Tanggal** | `reg_periksa.tgl_registrasi` | `kamar_inap.tgl_keluar` |
| **Label Unit** | Poliklinik | Bangsal/kamar |
| **Nilai Unit** | `poliklinik.nm_poli` | `bangsal.nm_bangsal/kamar.kd_kamar` |
| **Dokter** | `dokter.nm_dokter` (single) | `dpjp_ranap` (multiple) |
| **Status** | `status_lanjut` + `penjab.png_jawab` | `status_lanjut` + `penjab.png_jawab` |

### 5.4 Kolom "Data Kunjungan"

| Field | Sumber Data | Aksi |
|-------|-------------|------|
| No. Kunjungan | `bridging_sep.no_rujukan` | - |
| No. Kartu | `bridging_sep.no_kartu` | - |
| Dx. Utama | `diagnosa_pasien` → `penyakit` | 🔗 Link ke modal "Ubah Diagnosa" |
| Pros. Utama | `prosedur_pasien` → `icd9` | 🔗 Link ke modal "Ubah Prosedur" |

### 5.5 Kolom "Berkas Digital"

| Komponen | Tipe | Fungsi |
|----------|------|--------|
| "Unggah Berkas Perawatan" | 🔵 btn-info | Buka modal upload berkas |
| Daftar Berkas | Link List | Klik untuk preview (lightbox) |
| 🗑️ Hapus | 🔴 btn-danger | Hapus berkas per item |
| "Resume" | 🔴 btn-danger | Buka form resume medis |

---

## 6. Modal Pop-up

### 6.1 Modal Set Status (`setstatus.html`)

**Trigger:** Klik tombol "Status" hijau

**Form Fields:**

| Field | Tipe | Readonly | Value Awal |
|-------|------|----------|------------|
| No. Rekam Medis | Text Input | No | `bridging_sep.nomr` |
| Nomor Rawat | Text Input | No | `bridging_sep.no_rawat` |
| Nomor SEP | Text Input | No | `bridging_sep.no_sep` |
| Status Klaim | Select | No | Options: Lengkap, Pengajuan, Perbaiki, Disetujui |
| Catatan dan Umpan Balik | Textarea | No | Kosong |

**Hidden Fields:**
- `tgl_registrasi` → dari `bridging_sep.tglsep`
- `jnspelayanan` → dari `bridging_sep.jnspelayanan`

**Riwayat Feedback:**
- Ditampilkan di bawah form
- Menampilkan avatar berbeda untuk BPJS vs RS
- Format: Username + Tanggal + Isi Catatan

**Aksi Submit:**
1. Insert/Update ke tabel `mlite_vedika`
2. Insert ke tabel `mlite_vedika_feedback`
3. Refresh halaman

---

### 6.2 Modal Berkas Perawatan (`berkasperawatan.html`)

**Trigger:** Klik tombol "Unggah Berkas Perawatan"

**Komponen:**

| Bagian | Isi |
|--------|-----|
| **Gallery** | Thumbnail berkas yang sudah diupload (lightbox preview) |
| **Form Upload** | Input file + kategori berkas |

**Form Fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| Nomor Rawat | Text Input | Readonly, terisi otomatis |
| Kategori Berkas | Select | Dari tabel `master_berkas_digital` |
| Pilih Berkas | File Input | Upload gambar atau PDF |

**Aksi Submit:**
1. Simpan file ke `webapps/berkasrawat/pages/upload/`
2. Insert ke tabel `berkas_digital_perawatan`

---

## 7. JavaScript Interaktif

### 7.1 Hapus Data Vedika

```javascript
// Trigger: Klik tombol "Hapus" merah
$(\"#display\").on(\"click\", \".hapus_vedika\", function(event){
    // Konfirmasi dengan bootbox
    bootbox.confirm("Apakah Anda yakin ingin menghapus data ini?", function(result){
        if (result){
            // Redirect ke: /admin/vedika/hapus/{no_sep}
        }
    });
});
```

### 7.2 Hapus Berkas Digital

```javascript
// Trigger: Klik icon trash pada berkas
$(\"#display\").on(\"click\", \".hapus_berkas\", function(event){
    // Konfirmasi dengan bootbox
    bootbox.confirm("Apakah Anda yakin ingin menghapus data ini?", function(result){
        if (result){
            // Redirect ke: /admin/vedika/hapusberkas/{no_rawat}/{nama_file}
        }
    });
});
```

### 7.3 Lightbox Gallery

```javascript
// Untuk preview berkas digital
$('.gallery').lightbox();
```

### 7.4 Datepicker

```javascript
// Format tanggal Indonesia
$('.tanggal').datetimepicker({
    defaultDate: 'YYYY-MM-DD',
    format: 'YYYY-MM-DD',
    locale: 'id'
});
```

---

## 8. Query Database

### 8.1 Query Rawat Jalan (Ralan)

```sql
SELECT 
    reg_periksa.*, 
    pasien.*, 
    dokter.nm_dokter, 
    poliklinik.nm_poli, 
    penjab.png_jawab 
FROM reg_periksa, pasien, dokter, poliklinik, penjab 
WHERE reg_periksa.no_rkm_medis = pasien.no_rkm_medis 
  AND reg_periksa.kd_dokter = dokter.kd_dokter 
  AND reg_periksa.kd_poli = poliklinik.kd_poli 
  AND reg_periksa.kd_pj = penjab.kd_pj 
  AND penjab.kd_pj IN ('BPJ','A02','A03')  -- sesuai vedika.carabayar
  AND reg_periksa.tgl_registrasi BETWEEN ? AND ?
  AND reg_periksa.status_lanjut = 'Ralan' 
  AND reg_periksa.no_rawat NOT IN (SELECT no_rawat FROM mlite_vedika)
LIMIT 10 OFFSET 0
```

### 8.2 Query Rawat Inap (Ranap)

```sql
SELECT 
    reg_periksa.*, 
    pasien.*, 
    dokter.nm_dokter, 
    poliklinik.nm_poli, 
    penjab.png_jawab,
    kamar_inap.tgl_keluar, 
    kamar_inap.jam_keluar, 
    kamar_inap.kd_kamar 
FROM reg_periksa, pasien, dokter, poliklinik, penjab, kamar_inap 
WHERE reg_periksa.no_rkm_medis = pasien.no_rkm_medis 
  AND reg_periksa.no_rawat = kamar_inap.no_rawat
  AND reg_periksa.kd_dokter = dokter.kd_dokter 
  AND reg_periksa.kd_poli = poliklinik.kd_poli 
  AND reg_periksa.kd_pj = penjab.kd_pj 
  AND penjab.kd_pj IN ('BPJ','A02','A03')
  AND kamar_inap.tgl_keluar BETWEEN ? AND ?
  AND reg_periksa.status_lanjut = 'Ranap'
LIMIT 10 OFFSET 0
```

---

## 9. Alur Kerja di Halaman Index

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ALUR KERJA HALAMAN INDEX                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [Pasien BPJS Selesai Perawatan]
              │
              ▼
  ┌───────────────────────┐
  │ Muncul di Halaman     │
  │ INDEX (Belum Diproses)│
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Tidak ada SEP?     ┌───────────────────┐
  │ Cek apakah ada        │───────────────────────►│ Klik "Ambil SEP   │
  │ Nomor SEP?            │                        │ dari Vclaim"      │
  └───────────┬───────────┘                        └─────────┬─────────┘
              │ Ada SEP                                      │
              ▼                                              ▼
  ┌───────────────────────┐                        ┌───────────────────┐
  │ Klik "Status"         │◄───────────────────────│ SEP berhasil      │
  │ (Tombol Hijau)        │                        │ diambil           │
  └───────────┬───────────┘                        └───────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Modal Set Status      │
  │ - Pilih status        │
  │ - Isi catatan         │
  │ - Klik Simpan         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Data tersimpan ke:    │
  │ - mlite_vedika        │
  │ - mlite_vedika_feedback│
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Data pindah ke        │
  │ halaman sesuai status:│
  │ - LENGKAP             │
  │ - PENGAJUAN           │
  │ - PERBAIKI            │
  └───────────────────────┘
```

---

## 10. Tips Penggunaan

| Tips | Keterangan |
|------|------------|
| 🔍 **Gunakan Search** | Cari cepat dengan no_rawat, no_RM, atau nama pasien |
| 📅 **Filter Tanggal** | Gunakan dropdown untuk filter periode tertentu |
| 📄 **Cek PDF Dulu** | Klik "Lihat Data Klaim" sebelum set status untuk review |
| 📎 **Upload Berkas** | Lengkapi berkas pendukung sebelum ajukan klaim |
| ✍️ **Isi Resume** | Pastikan resume medis sudah terisi lengkap |
