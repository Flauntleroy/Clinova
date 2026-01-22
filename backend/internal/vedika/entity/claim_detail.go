// Package entity contains domain models for the Vedika module.
package entity

// ==================== Claim Detail Types ====================

// ClaimDetailFull contains comprehensive claim data for detail view.
// This includes all 23 categories of data from the SIMRS.
type ClaimDetailFull struct {
	// Basic Info
	NoRawat string `json:"no_rawat"`
	Jenis   string `json:"jenis"` // ralan or ranap

	// Core Data
	Patient      PatientInfo      `json:"patient"`
	Registration RegistrationInfo `json:"registration"`
	SEP          *SEPInfo         `json:"sep,omitempty"`
	PRB          *PRBInfo         `json:"prb,omitempty"`

	// Medical Resume
	Resume    *ResumeInfo `json:"resume,omitempty"`
	DPJPRanap []DPJPItem  `json:"dpjp_ranap,omitempty"`

	// Medical Data
	Diagnoses  []DiagnosisItemFull `json:"diagnoses"`
	Procedures []ProcedureItemFull `json:"procedures"`

	// Examinations (SOAP)
	Examinations []ExaminationItem `json:"examinations,omitempty"`

	// Treatments
	TreatmentsRalanDr []TreatmentItem `json:"treatments_ralan_dr,omitempty"`
	TreatmentsRalanPr []TreatmentItem `json:"treatments_ralan_pr,omitempty"`
	TreatmentsRanapDr []TreatmentItem `json:"treatments_ranap_dr,omitempty"`
	TreatmentsRanapPr []TreatmentItem `json:"treatments_ranap_pr,omitempty"`

	// Room Info (Ranap)
	Rooms []RoomInfo `json:"rooms,omitempty"`

	// Surgery
	Surgeries []SurgeryInfo `json:"surgeries,omitempty"`

	// Radiology
	Radiology []RadiologyInfo `json:"radiology,omitempty"`

	// Laboratory
	Laboratory []LabInfo `json:"laboratory,omitempty"`

	// Medicines
	MedicinesGiven   []MedicineInfo `json:"medicines_given,omitempty"`
	MedicinesSurgery []MedicineInfo `json:"medicines_surgery,omitempty"`
	MedicinesHome    []MedicineInfo `json:"medicines_home,omitempty"`

	// Documents
	Documents []DocumentInfoFull `json:"documents,omitempty"`

	// Billing
	Billing []BillingItem `json:"billing,omitempty"`

	// Status
	Status ClaimStatus `json:"status"`
}

// ==================== Patient & Registration ====================

// PatientInfo contains patient demographic data.
type PatientInfo struct {
	NoRkmMedis   string `json:"no_rkm_medis"`
	NamaPasien   string `json:"nama_pasien"`
	NoKTP        string `json:"no_ktp,omitempty"`
	JenisKelamin string `json:"jenis_kelamin"`
	TglLahir     string `json:"tgl_lahir"`
	Umur         string `json:"umur"`
	Alamat       string `json:"alamat"`
	Kelurahan    string `json:"kelurahan,omitempty"`
	Kecamatan    string `json:"kecamatan,omitempty"`
	Kabupaten    string `json:"kabupaten,omitempty"`
	NoTelp       string `json:"no_tlp,omitempty"`
	Pekerjaan    string `json:"pekerjaan,omitempty"`
}

// RegistrationInfo contains registration/visit data.
type RegistrationInfo struct {
	NoRawat       string `json:"no_rawat"`
	TglRegistrasi string `json:"tgl_registrasi"`
	JamReg        string `json:"jam_reg"`
	NamaDokter    string `json:"nama_dokter"`
	NamaPoli      string `json:"nama_poli"`
	CaraBayar     string `json:"cara_bayar"`
	StatusLanjut  string `json:"status_lanjut"`
	Status        string `json:"status"`
}

// ==================== SEP & BPJS ====================

// SEPInfo contains BPJS SEP data.
type SEPInfo struct {
	NoSEP        string `json:"no_sep"`
	NoKartu      string `json:"no_kartu"`
	TglSEP       string `json:"tgl_sep"`
	TglRujukan   string `json:"tgl_rujukan,omitempty"`
	BatasRujukan string `json:"batas_rujukan,omitempty"` // tglrujukan + 85 days
	KelasRawat   string `json:"kelas_rawat"`
	JnsRawat     string `json:"jns_rawat"` // 1=Ranap, 2=Ralan
	NmDiagnosa   string `json:"nm_diagnosa,omitempty"`
	AsalRujukan  string `json:"asal_rujukan,omitempty"`
	NmRujukan    string `json:"nm_rujukan,omitempty"`
	Catatan      string `json:"catatan,omitempty"`
}

// PRBInfo contains Program Rujuk Balik data.
type PRBInfo struct {
	NoSEP       string `json:"no_sep"`
	NoPRB       string `json:"no_prb"`
	TglMulai    string `json:"tgl_mulai"`
	TglAkhir    string `json:"tgl_akhir"`
	NmDokter    string `json:"nm_dokter,omitempty"`
	Alamat      string `json:"alamat,omitempty"`
	NmDiagnosa  string `json:"nm_diagnosa,omitempty"`
	NmDiagnosa2 string `json:"nm_diagnosa2,omitempty"`
}

// ==================== Resume & DPJP ====================

// ResumeInfo contains medical resume data.
type ResumeInfo struct {
	NoRawat          string `json:"no_rawat"`
	TglPeriksa       string `json:"tgl_periksa,omitempty"`
	KeluhanUtama     string `json:"keluhan_utama"`
	JalannyaPenyakit string `json:"jalannya_penyakit,omitempty"`
	Anamnesa         string `json:"anamnesa,omitempty"`
	PemeriksaanFisik string `json:"pemeriksaan_fisik"`
	DiagnosaAkhir    string `json:"diagnosa_akhir"`
	Terapi           string `json:"terapi"`
	Anjuran          string `json:"anjuran,omitempty"`
	ProgramTerapi    string `json:"program_terapi,omitempty"`
	CaraKeluar       string `json:"cara_keluar,omitempty"`
	KeadaanKeluar    string `json:"keadaan_keluar,omitempty"`
	NmDokter         string `json:"nm_dokter"`
}

// DPJPItem contains DPJP Ranap data.
type DPJPItem struct {
	TglDPJP  string `json:"tgl_dpjp"`
	NmDokter string `json:"nm_dokter"`
}

// ==================== Diagnoses & Procedures ====================

// DiagnosisItemFull contains diagnosis data with disease name.
type DiagnosisItemFull struct {
	KodePenyakit string `json:"kode_penyakit"`
	NamaPenyakit string `json:"nama_penyakit"`
	StatusDx     string `json:"status_dx"` // Ralan/Ranap
	Prioritas    int    `json:"prioritas"`
}

// ProcedureItemFull contains procedure data with description.
type ProcedureItemFull struct {
	Kode       string `json:"kode"`
	Deskripsi  string `json:"deskripsi"`
	Prioritas  int    `json:"prioritas"`
	StatusProc string `json:"status,omitempty"` // Ralan/Ranap
}

// ==================== Examinations ====================

// ExaminationItem contains SOAP examination data.
type ExaminationItem struct {
	TglPerawatan string `json:"tgl_perawatan"`
	JamRawat     string `json:"jam_rawat"`
	Suhu         string `json:"suhu_tubuh,omitempty"`
	Tensi        string `json:"tensi,omitempty"`
	Nadi         string `json:"nadi,omitempty"`
	Respirasi    string `json:"respirasi,omitempty"`
	Tinggi       string `json:"tinggi,omitempty"`
	Berat        string `json:"berat,omitempty"`
	SpO2         string `json:"spo2,omitempty"`
	GCS          string `json:"gcs,omitempty"`
	Kesadaran    string `json:"kesadaran,omitempty"`
	Keluhan      string `json:"keluhan,omitempty"`
	Pemeriksaan  string `json:"pemeriksaan,omitempty"`
	Penilaian    string `json:"penilaian,omitempty"`
	Rtl          string `json:"rtl,omitempty"` // Rencana Tindak Lanjut
	Instruksi    string `json:"instruksi,omitempty"`
	Evaluasi     string `json:"evaluasi,omitempty"`
	NmDokter     string `json:"nm_dokter,omitempty"`
	NmPerawat    string `json:"nm_perawat,omitempty"`
}

// ==================== Treatments ====================

// TreatmentItem contains treatment/procedure data.
type TreatmentItem struct {
	TglPerawatan string  `json:"tgl_perawatan"`
	JamRawat     string  `json:"jam_rawat"`
	NmPerawatan  string  `json:"nm_perawatan"`
	NmDokter     string  `json:"nm_dokter,omitempty"`
	NmPerawat    string  `json:"nm_perawat,omitempty"`
	Biaya        float64 `json:"biaya"`
}

// ==================== Room (Ranap) ====================

// RoomInfo contains room/ward data for inpatient.
type RoomInfo struct {
	TglMasuk     string  `json:"tgl_masuk"`
	JamMasuk     string  `json:"jam_masuk"`
	TglKeluar    string  `json:"tgl_keluar,omitempty"`
	JamKeluar    string  `json:"jam_keluar,omitempty"`
	KdKamar      string  `json:"kd_kamar"`
	NmBangsal    string  `json:"nm_bangsal"`
	Tarif        float64 `json:"tarif"`
	LamaMenginap int     `json:"lama_menginap"`
	TotalBiaya   float64 `json:"total_biaya"`
}

// ==================== Surgery ====================

// SurgeryInfo contains surgery/operation data.
type SurgeryInfo struct {
	TglOperasi  string  `json:"tgl_operasi"`
	JnsOperasi  string  `json:"jns_operasi"` // Besar/Sedang/Kecil
	NmPerawatan string  `json:"nm_perawatan"`
	Operator1   string  `json:"operator1,omitempty"`
	Operator2   string  `json:"operator2,omitempty"`
	Operator3   string  `json:"operator3,omitempty"`
	Asisten1    string  `json:"asisten1,omitempty"`
	Asisten2    string  `json:"asisten2,omitempty"`
	DokterAnak  string  `json:"dokter_anak,omitempty"`
	Dokter      string  `json:"dokter,omitempty"`
	Biaya       float64 `json:"biaya,omitempty"`
}

// ==================== Radiology ====================

// RadiologyInfo contains radiology exam data.
type RadiologyInfo struct {
	TglPeriksa  string  `json:"tgl_periksa"`
	JamPeriksa  string  `json:"jam_periksa"`
	NmPerawatan string  `json:"nm_perawatan"`
	NmDokter    string  `json:"nm_dokter"`
	NmPetugas   string  `json:"nm_petugas,omitempty"`
	Hasil       string  `json:"hasil,omitempty"`
	Biaya       float64 `json:"biaya"`
}

// ==================== Laboratory ====================

// LabInfo contains laboratory exam data.
type LabInfo struct {
	TglPeriksa  string      `json:"tgl_periksa"`
	JamPeriksa  string      `json:"jam_periksa"`
	NmPerawatan string      `json:"nm_perawatan"`
	NmDokter    string      `json:"nm_dokter,omitempty"`
	Biaya       float64     `json:"biaya"`
	Details     []LabDetail `json:"details,omitempty"`
}

// LabDetail contains individual lab test results.
type LabDetail struct {
	Pemeriksaan  string `json:"pemeriksaan"`
	Hasil        string `json:"hasil"`
	Satuan       string `json:"satuan,omitempty"`
	NilaiRujukan string `json:"nilai_rujukan,omitempty"`
	Keterangan   string `json:"keterangan,omitempty"`
}

// ==================== Medicines ====================

// MedicineInfo contains medicine/drug data.
type MedicineInfo struct {
	TglPerawatan string  `json:"tgl_perawatan"`
	JamPerawatan string  `json:"jam_perawatan,omitempty"`
	NamaObat     string  `json:"nama_obat"`
	Jumlah       float64 `json:"jumlah"`
	Satuan       string  `json:"satuan,omitempty"`
	Dosis        string  `json:"dosis,omitempty"`
	Aturan       string  `json:"aturan_pakai,omitempty"`
	TotalBiaya   float64 `json:"total_biaya,omitempty"`
}

// ==================== Documents ====================

// DocumentInfoFull contains uploaded document metadata.
type DocumentInfoFull struct {
	Kode       string `json:"kode"`
	NamaBerkas string `json:"nama_berkas"`
	Lokasi     string `json:"lokasi"`
	FilePath   string `json:"file_path,omitempty"` // URL for download
}

// ==================== Billing ====================

// BillingItem contains billing line item.
type BillingItem struct {
	No          string  `json:"no"`
	NmPerawatan string  `json:"nm_perawatan"`
	Pemisah     string  `json:"pemisah,omitempty"`
	Biaya       float64 `json:"biaya"`
	Jumlah      float64 `json:"jumlah"`
	Tambahan    float64 `json:"tambahan,omitempty"`
	TotalBiaya  float64 `json:"total_biaya"`
}
