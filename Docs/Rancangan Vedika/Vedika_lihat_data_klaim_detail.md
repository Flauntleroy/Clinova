# Dokumentasi Database: Lihat Data Klaim

> Referensi lengkap tabel dan field yang digunakan dalam fitur **Lihat Data Klaim** pada modul Vedika.

---

## 📊 Ringkasan Tabel

| No | Kategori | Tabel | Fungsi |
|----|----------|-------|--------|
| 1 | SEP | `bridging_sep` | Data SEP dari VClaim |
| 2 | SEP | `bpjs_prb` | Status PRB |
| 3 | Pasien | `pasien` | Master data pasien |
| 4 | Pasien | `kecamatan` | Referensi wilayah |
| 5 | Pasien | `kabupaten` | Referensi wilayah |
| 6 | Registrasi | `reg_periksa` | Data kunjungan |
| 7 | Registrasi | `dokter` | Master dokter |
| 8 | Registrasi | `poliklinik` | Master poli |
| 9 | Registrasi | `penjab` | Cara bayar |
| 10 | Registrasi | `dpjp_ranap` | DPJP rawat inap |
| 11 | Diagnosa | `diagnosa_pasien` | Link diagnosa |
| 12 | Diagnosa | `penyakit` | Master ICD-10 |
| 13 | Prosedur | `prosedur_pasien` | Link prosedur |
| 14 | Prosedur | `icd9` | Master ICD-9 |
| 15 | SOAP | `pemeriksaan_ralan` | SOAP rawat jalan |
| 16 | SOAP | `pemeriksaan_ranap` | SOAP rawat inap |
| 17 | Tindakan | `rawat_jl_dr` | Tindakan ralan dokter |
| 18 | Tindakan | `rawat_jl_pr` | Tindakan ralan perawat |
| 19 | Tindakan | `rawat_jl_drpr` | Tindakan ralan dr+pr |
| 20 | Tindakan | `rawat_inap_dr` | Tindakan ranap dokter |
| 21 | Tindakan | `rawat_inap_pr` | Tindakan ranap perawat |
| 22 | Tindakan | `rawat_inap_drpr` | Tindakan ranap dr+pr |
| 23 | Tindakan | `jns_perawatan` | Master jenis ralan |
| 24 | Tindakan | `jns_perawatan_inap` | Master jenis ranap |
| 25 | Tindakan | `petugas` | Master perawat |
| 26 | Kamar | `kamar_inap` | Data rawat inap |
| 27 | Kamar | `kamar` | Master kamar |
| 28 | Kamar | `bangsal` | Master bangsal |
| 29 | Operasi | `operasi` | Data operasi |
| 30 | Operasi | `paket_operasi` | Master paket |
| 31 | Operasi | `laporan_operasi` | Laporan op |
| 32 | Radiologi | `periksa_radiologi` | Pemeriksaan rad |
| 33 | Radiologi | `jns_perawatan_radiologi` | Master jenis rad |
| 34 | Radiologi | `hasil_radiologi` | Hasil interpretasi |
| 35 | Radiologi | `gambar_radiologi` | Gambar rad |
| 36 | Lab | `periksa_lab` | Pemeriksaan lab |
| 37 | Lab | `jns_perawatan_lab` | Master jenis lab |
| 38 | Lab | `detail_periksa_lab` | Detail hasil |
| 39 | Lab | `template_laboratorium` | Template parameter |
| 40 | Obat | `detail_pemberian_obat` | Pemberian obat |
| 41 | Obat | `databarang` | Master barang |
| 42 | Obat | `beri_obat_operasi` | Obat operasi |
| 43 | Obat | `obatbhp_ok` | Master obat OK |
| 44 | Obat | `resep_pulang` | Resep pulang |
| 45 | Resume | `resume_pasien` | Resume ralan |
| 46 | Resume | `resume_pasien_ranap` | Resume ranap |
| 47 | Billing | `billing` | Billing legacy |
| 48 | Billing | `mlite_billing` | Billing mLite |
| 49 | Billing | `tambahan_biaya` | Biaya tambahan |
| 50 | SPRI | `bridging_surat_pri_bpjs` | Surat perintah rawat inap |
| 51 | Berkas | `berkas_digital_perawatan` | Berkas upload |
| 52 | Berkas | `master_berkas_digital` | Kategori berkas |
| 53 | Billing | `penjab` | Cara bayar (via reg_periksa) |
| 54 | Lab PA | `periksa_labpa` | Pemeriksaan PA |
| 55 | Lab PA | `jns_perawatan_labpa` | Master jenis PA |

---

## 📋 Detail Field per Tabel

### 1. bridging_sep

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_sep` | VARCHAR(40) | **PK** - Nomor SEP |
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tglsep` | DATE | Tanggal SEP |
| `no_kartu` | VARCHAR(25) | Nomor kartu BPJS |
| `nomr` | VARCHAR(15) | Nomor rekam medis |
| `nama_pasien` | VARCHAR(40) | Nama peserta |
| `peserta` | VARCHAR(30) | Jenis peserta |
| `tanggal_lahir` | DATE | Tanggal lahir |
| `jkel` | CHAR(10) | Jenis kelamin |
| `jnspelayanan` | CHAR(1) | 1=Ranap, 2=Ralan |
| `notelep` | VARCHAR(15) | No. telepon |
| `klsrawat` | CHAR(5) | Kelas rawat hak |
| `klsnaik` | CHAR(5) | Kelas naik |
| `nmpolitujuan` | VARCHAR(50) | Nama poli tujuan |
| `nmdpdjp` | VARCHAR(50) | Nama DPJP |
| `nmppkrujukan` | VARCHAR(100) | Faskes perujuk |
| `nmdiagnosaawal` | VARCHAR(100) | Diagnosa awal |
| `catatan` | VARCHAR(200) | Catatan SEP |
| `tglrujukan` | DATE | Tanggal rujukan |
| `cob` | CHAR(5) | COB status |

---

### 2. pasien

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rkm_medis` | VARCHAR(15) | **PK** - No. RM |
| `nm_pasien` | VARCHAR(40) | Nama pasien |
| `alamat` | VARCHAR(200) | Alamat |
| `jk` | ENUM('L','P') | Jenis kelamin |
| `tmp_lahir` | VARCHAR(15) | Tempat lahir |
| `tgl_lahir` | DATE | Tanggal lahir |
| `nm_ibu` | VARCHAR(40) | Nama ibu |
| `gol_darah` | CHAR(5) | Golongan darah |
| `stts_nikah` | ENUM | Status nikah |
| `agama` | VARCHAR(12) | Agama |
| `pnd` | VARCHAR(20) | Pendidikan |
| `tgl_daftar` | DATE | Tanggal pertama daftar |
| `kd_kec` | INT | **FK** → kecamatan |
| `kd_kab` | INT | **FK** → kabupaten |

---

### 3. reg_periksa

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **PK** - No. rawat |
| `no_reg` | VARCHAR(8) | No. registrasi |
| `no_rkm_medis` | VARCHAR(15) | **FK** → pasien |
| `tgl_registrasi` | DATE | Tanggal registrasi |
| `jam_reg` | TIME | Jam registrasi |
| `kd_dokter` | VARCHAR(20) | **FK** → dokter |
| `kd_poli` | VARCHAR(5) | **FK** → poliklinik |
| `kd_pj` | CHAR(3) | **FK** → penjab |
| `status_lanjut` | ENUM('Ralan','Ranap') | Jenis rawat |
| `stts` | VARCHAR(15) | Status kunjungan |
| `p_jawab` | VARCHAR(65) | Penanggung jawab |
| `almt_pj` | VARCHAR(65) | Alamat PJ |
| `hubunganpj` | VARCHAR(20) | Hubungan PJ |
| `status_poli` | ENUM('Baru','Lama') | Status kunjungan |

---

### 4. pemeriksaan_ralan / pemeriksaan_ranap

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_perawatan` | DATE | Tanggal pemeriksaan |
| `jam_rawat` | TIME | Jam pemeriksaan |
| `suhu_tubuh` | VARCHAR(5) | Suhu (°C) |
| `tensi` | VARCHAR(8) | Tekanan darah |
| `nadi` | VARCHAR(5) | Nadi/menit |
| `respirasi` | VARCHAR(5) | Respirasi/menit |
| `tinggi` | VARCHAR(5) | Tinggi badan (cm) |
| `berat` | VARCHAR(5) | Berat badan (kg) |
| `gcs` | VARCHAR(10) | GCS (E,V,M) |
| `kesadaran` | VARCHAR(15) | Tingkat kesadaran |
| `keluhan` | TEXT | **S**ubjektif |
| `pemeriksaan` | TEXT | **O**bjektif |
| `penilaian` | TEXT | **A**ssessment |
| `rtl` | TEXT | **P**lan (Rencana) |
| `instruksi` | TEXT | Instruksi |
| `evaluasi` | TEXT | Evaluasi |
| `alergi` | VARCHAR(50) | Riwayat alergi |

---

### 5. diagnosa_pasien

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kd_penyakit` | VARCHAR(10) | **FK** → penyakit |
| `status` | ENUM('Ralan','Ranap') | Status rawat |
| `prioritas` | INT | 1=Utama, 2+=Sekunder |

---

### 6. prosedur_pasien

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kode` | VARCHAR(10) | **FK** → icd9 |
| `status` | ENUM('Ralan','Ranap') | Status rawat |
| `prioritas` | INT | 1=Utama, 2+=Sekunder |

---

### 7. rawat_jl_dr (& rawat_jl_pr, rawat_jl_drpr)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kd_jenis_prw` | VARCHAR(15) | **FK** → jns_perawatan |
| `kd_dokter` | VARCHAR(20) | **FK** → dokter |
| `nip` | VARCHAR(20) | **FK** → petugas (pr/drpr) |
| `tgl_perawatan` | DATE | Tanggal tindakan |
| `jam_rawat` | TIME | Jam tindakan |
| `biaya_rawat` | DOUBLE | Biaya tindakan |

---

### 8. kamar_inap

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kd_kamar` | VARCHAR(15) | **FK** → kamar |
| `tgl_masuk` | DATE | Tanggal masuk |
| `jam_masuk` | TIME | Jam masuk |
| `tgl_keluar` | DATE | Tanggal keluar |
| `jam_keluar` | TIME | Jam keluar |
| `lama` | INT | Lama inap (hari) |
| `stts_pulang` | VARCHAR(20) | Status pulang |
| `trf_kamar` | DOUBLE | Tarif kamar/hari |
| `ttl_biaya` | DOUBLE | Total biaya kamar |

---

### 9. operasi

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_operasi` | DATE | Tanggal operasi |
| `kode_paket` | VARCHAR(15) | **FK** → paket_operasi |
| `jenis_anasthesi` | VARCHAR(50) | Jenis anastesi |
| `status` | ENUM('Ralan','Ranap') | Status rawat |
| `biayaoperator1` | DOUBLE | Biaya operator 1 |
| `biayaoperator2` | DOUBLE | Biaya operator 2 |
| `biayaoperator3` | DOUBLE | Biaya operator 3 |
| `biayaasisten_operator1` | DOUBLE | Biaya asisten op 1 |
| `biayaasisten_operator2` | DOUBLE | Biaya asisten op 2 |
| `biayadokter_anak` | DOUBLE | Biaya dokter anak |
| `biayaperawaat_resusitas` | DOUBLE | Biaya resusitasi |
| `biayadokter_anestesi` | DOUBLE | Biaya anestesi |
| `biayaasisten_anestesi` | DOUBLE | Biaya asisten anestesi |
| `biayabidan` | DOUBLE | Biaya bidan |
| `biayaperawat_luar` | DOUBLE | Biaya perawat luar |

---

### 10. laporan_operasi

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tanggal` | DATETIME | Waktu mulai operasi |
| `selesaioperasi` | DATETIME | Waktu selesai |
| `diagnosa_preop` | VARCHAR(200) | Diagnosa pre-op |
| `diagnosa_postop` | VARCHAR(200) | Diagnosa post-op |
| `jaringan_dieksekusi` | VARCHAR(200) | Jaringan dieksisi |
| `permintaan_pa` | VARCHAR(100) | Permintaan PA |
| `laporan_operasi` | TEXT | Laporan lengkap |

---

### 11. periksa_radiologi

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_periksa` | DATE | Tanggal periksa |
| `jam` | TIME | Jam periksa |
| `kd_jenis_prw` | VARCHAR(15) | **FK** → jns_perawatan_radiologi |
| `kd_dokter` | VARCHAR(20) | **FK** → dokter |
| `nip` | VARCHAR(20) | **FK** → petugas |
| `biaya` | DOUBLE | Biaya pemeriksaan |
| `status` | ENUM('Ralan','Ranap') | Status rawat |

---

### 12. hasil_radiologi

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_periksa` | DATE | Tanggal hasil |
| `jam` | TIME | Jam hasil |
| `hasil` | TEXT | Hasil pemeriksaan |
| `klinis` | TEXT | Klinis |
| `kesan` | TEXT | Kesan |
| `saran` | TEXT | Saran |
| `judul` | VARCHAR(200) | Judul pemeriksaan |

---

### 13. periksa_lab

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_periksa` | DATE | Tanggal periksa |
| `jam` | TIME | Jam periksa |
| `kd_jenis_prw` | VARCHAR(15) | **FK** → jns_perawatan_lab |
| `biaya` | DOUBLE | Biaya pemeriksaan |
| `status` | ENUM('Ralan','Ranap') | Status rawat |

---

### 14. detail_periksa_lab

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kd_jenis_prw` | VARCHAR(15) | **FK** → periksa_lab |
| `id_template` | INT | **FK** → template_laboratorium |
| `nilai` | VARCHAR(200) | Nilai hasil |
| `nilai_rujukan` | VARCHAR(200) | Nilai normal |
| `satuan` | VARCHAR(40) | Satuan |
| `keterangan` | TEXT | Keterangan |

---

### 15. detail_pemberian_obat

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_perawatan` | DATE | Tanggal pemberian |
| `jam` | TIME | Jam pemberian |
| `kode_brng` | VARCHAR(15) | **FK** → databarang |
| `jml` | DOUBLE | Jumlah |
| `biaya_obat` | DOUBLE | Harga satuan |
| `total` | DOUBLE | Total harga |
| `status` | ENUM('Ralan','Ranap') | Status rawat |

---

### 16. resep_pulang

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_perawatan` | DATE | Tanggal resep |
| `jam` | TIME | Jam resep |
| `kode_brng` | VARCHAR(15) | **FK** → databarang |
| `jml_barang` | DOUBLE | Jumlah |
| `dosis` | VARCHAR(150) | Aturan dosis |

---

### 17. resume_pasien (Rawat Jalan)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kd_dokter` | VARCHAR(20) | **FK** → dokter |
| `diagnosa_utama` | TEXT | Diagnosa utama |
| `diagnosa_sekunder` | TEXT | Diagnosa sekunder 1 |
| `diagnosa_sekunder2` | TEXT | Diagnosa sekunder 2 |
| `diagnosa_sekunder3` | TEXT | Diagnosa sekunder 3 |
| `diagnosa_sekunder4` | TEXT | Diagnosa sekunder 4 |
| `prosedur_utama` | TEXT | Prosedur utama |
| `prosedur_sekunder` | TEXT | Prosedur sekunder 1 |
| `prosedur_sekunder2` | TEXT | Prosedur sekunder 2 |
| `prosedur_sekunder3` | TEXT | Prosedur sekunder 3 |

---

### 18. resume_pasien_ranap (Rawat Inap)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kd_dokter` | VARCHAR(20) | **FK** → dokter |
| `diagnosa_awal` | TEXT | Diagnosa masuk |
| `keluhan_utama` | TEXT | Keluhan utama |
| `jalannya_penyakit` | TEXT | Perjalanan penyakit |
| `pemeriksaan_fisik` | TEXT | Pemeriksaan fisik |
| `pemeriksaan_penunjang` | TEXT | Pemeriksaan penunjang |
| `hasil_laborat` | TEXT | Hasil laboratorium |
| `diagnosa_utama` | TEXT | Diagnosa utama |
| `diagnosa_sekunder` - `4` | TEXT | Diagnosa sekunder 1-4 |
| `prosedur_utama` | TEXT | Prosedur utama |
| `prosedur_sekunder` - `3` | TEXT | Prosedur sekunder 1-3 |
| `obat_pulang` | TEXT | Obat pulang/nasihat |
| `kondisi_pulang` | TEXT | Kondisi waktu pulang |

---

### 19. mlite_billing

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id_billing` | INT | **PK** - Auto increment |
| `kd_billing` | VARCHAR(20) | Kode billing (RJ/RI) |
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `id_user` | INT | **FK** → mlite_users |
| `jumlah_total` | DOUBLE | Total sebelum diskon |
| `potongan` | DOUBLE | Potongan/diskon |
| `jumlah_harus_bayar` | DOUBLE | Total bayar |

---

### 20. bridging_surat_pri_bpjs

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_surat` | VARCHAR(40) | **PK** - Nomor surat |
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `no_kartu` | VARCHAR(25) | Nomor kartu BPJS |
| `tgl_surat` | DATE | Tanggal surat |
| `tgl_rencana` | DATE | Tanggal rencana ranap |
| `nm_dokter_bpjs` | VARCHAR(50) | Nama dokter BPJS |
| `nm_poli_bpjs` | VARCHAR(50) | Nama poli BPJS |
| `diagnosa` | VARCHAR(200) | Diagnosa |

> [!IMPORTANT]
> **Data Retrieval Note:** 
> Karena tabel `bridging_surat_pri_bpjs` tidak menyimpan metadata pasien secara lengkap, rujukan data ditarik melalui JOIN ke `reg_periksa` dan `pasien` untuk mendapatkan `nm_pasien`, `tgl_lahir`, dan `jk`.

---

### 21. berkas_digital_perawatan

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `kode` | VARCHAR(10) | **FK** → master_berkas_digital |
| `lokasi_file` | VARCHAR(200) | Path file berkas |

---

### 22. periksa_labpa

| Field | Tipe | Keterangan |
|-------|------|------------|
| `no_rawat` | VARCHAR(17) | **FK** → reg_periksa |
| `tgl_periksa` | DATE | Tanggal periksa |
| `jam` | TIME | Jam periksa |
| `kd_jenis_prw` | VARCHAR(15) | **FK** → jns_perawatan_labpa |
| `dokter_perujuk` | VARCHAR(20) | **FK** → dokter (Pengirim) |
| `kd_dokter` | VARCHAR(20) | **FK** → dokter (Dokter PA) |
| `diagnosa` | TEXT | Diagnosa klinis |
| `bahan` | TEXT | Bahan/Jaringan |
| `makroskopis` | TEXT | Deskripsi Makroskopis |
| `mikroskopis` | TEXT | Deskripsi Mikroskopis |
| `kesimpulan` | TEXT | Kesimpulan Hasil |
| `saran` | TEXT | Saran medis |

---

## 🔗 Diagram Relasi

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   pasien    │────►│ reg_periksa  │────►│ diagnosa_pasien │
│ no_rkm_medis│     │   no_rawat   │     │   kd_penyakit   │
└─────────────┘     └──────┬───────┘     └────────┬────────┘
                           │                      ▼
      ┌────────────────────┼──────────────┬─────────────────┐
      ▼                    ▼              ▼                 ▼
┌───────────┐   ┌─────────────────┐  ┌─────────┐   ┌────────────┐
│bridging_  │   │pemeriksaan_ralan│  │ operasi │   │ periksa_lab│
│sep        │   │pemeriksaan_ranap│  │         │   │            │
└───────────┘   └─────────────────┘  └─────────┘   └────────────┘
                                          │              │
                                          ▼              ▼
                                   ┌────────────┐  ┌────────────────┐
                                   │ laporan_   │  │detail_periksa_ │
                                   │ operasi    │  │lab             │
                                   └────────────┘  └────────────────┘
```

---

## 📝 Query Contoh

### Ambil Data SEP
```sql
SELECT * FROM bridging_sep 
WHERE no_rawat = '2024/01/01/000001';
```

### Ambil Data Pasien + Registrasi
```sql
SELECT p.*, r.*, d.nm_dokter, pk.nm_poli 
FROM reg_periksa r
JOIN pasien p ON p.no_rkm_medis = r.no_rkm_medis
JOIN dokter d ON d.kd_dokter = r.kd_dokter
JOIN poliklinik pk ON pk.kd_poli = r.kd_poli
WHERE r.no_rawat = '2024/01/01/000001';
```

### Ambil Diagnosa
```sql
SELECT dp.*, py.nm_penyakit 
FROM diagnosa_pasien dp
JOIN penyakit py ON py.kd_penyakit = dp.kd_penyakit
WHERE dp.no_rawat = '2024/01/01/000001'
ORDER BY dp.prioritas;
```

### Ambil SOAP
```sql
SELECT * FROM pemeriksaan_ralan 
WHERE no_rawat = '2024/01/01/000001'
ORDER BY tgl_perawatan, jam_rawat;
```

### Ambil Hasil Lab + Detail
```sql
SELECT pl.*, jpl.nm_perawatan, dpl.*, tl.Pemeriksaan
FROM periksa_lab pl
JOIN jns_perawatan_lab jpl ON jpl.kd_jenis_prw = pl.kd_jenis_prw
JOIN detail_periksa_lab dpl ON dpl.no_rawat = pl.no_rawat 
  AND dpl.kd_jenis_prw = pl.kd_jenis_prw
JOIN template_laboratorium tl ON tl.id_template = dpl.id_template
WHERE pl.no_rawat = '2024/01/01/000001';
```

### Ambil Hasil Lab PA
```sql
SELECT pl.*, jpl.nm_perawatan, d.nm_dokter as pengirim, dp.nm_dokter as dokter_pa
FROM periksa_labpa pl
LEFT JOIN jns_perawatan_labpa jpl ON pl.kd_jenis_prw = jpl.kd_jenis_prw
LEFT JOIN dokter d ON pl.dokter_perujuk = d.kd_dokter
LEFT JOIN dokter dp ON pl.kd_dokter = dp.kd_dokter
WHERE pl.no_rawat = '2024/01/01/000001';
```

---

## 🛡️ Standar Implementasi "Pure Data & Robustness"

Sejak perbaikan fase 5, seluruh komponen **Detail Klaim** wajib mengikuti standar berikut:

1.  **Pure Data Policy**: Tidak boleh ada data placeholder (seperti `Cetakan ke 1`, `.....`, `_____`) atau fallback manual (seperti signature default jika dokter kosong). Jika data di database kosong, UI harus menampilkan state kosong yang bersih atau pesan "Data tidak tersedia".
2.  **Robust Rendering**: Seluruh komponen wajib menggunakan *Optional Chaining* (`?.`) dan *Null Coalescing* (`|| '-'`) untuk mencegah *Silent Crash* yang dapat menghentikan proses rendering komponen di bawahnya.
3.  **Indonesian Terbilang**: Backend wajib menghasilkan teks terbilang yang akurat sesuai tata bahasa Indonesia (menangani "sebelas", "seribu", "seratus", dsb) untuk data Billing.
4.  **Priority Display**: Dokumen resmi BPJS (SPRI dan SEP) diposisikan di paling atas sebagai *Leading Documents* klaim.

---

*Last updated: 2026-01-26 - Vedika Phase 5 Enhancement*
