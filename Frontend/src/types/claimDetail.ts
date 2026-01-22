// Comprehensive Claim Detail Types - matches backend ClaimDetailFull
// All 23 data categories from SIMRS

export type JenisLayanan = 'ralan' | 'ranap' | 'Ralan' | 'Ranap';
export type ClaimStatus = 'RENCANA' | 'PENGAJUAN' | 'PERBAIKAN' | 'LENGKAP' | 'SETUJU';

// ==================== Patient & Registration ====================

export interface PatientInfo {
    no_rkm_medis: string;
    nama_pasien: string;
    no_ktp?: string;
    jenis_kelamin: string;
    tgl_lahir: string;
    umur?: string;
    alamat: string;
    kelurahan?: string;
    kecamatan?: string;
    kabupaten?: string;
    no_tlp?: string;
    pekerjaan?: string;
}

export interface RegistrationInfo {
    no_rawat: string;
    tgl_registrasi: string;
    jam_reg: string;
    nama_dokter: string;
    nama_poli: string;
    cara_bayar: string;
    status_lanjut: string;
    status: string;
}

// ==================== SEP & BPJS ====================

export interface SEPInfo {
    no_sep: string;
    no_kartu: string;
    tgl_sep: string;
    tgl_rujukan?: string;
    batas_rujukan?: string;
    kelas_rawat: string;
    jns_rawat: string;
    nm_diagnosa?: string;
    asal_rujukan?: string;
    nm_rujukan?: string;
    catatan?: string;
}

export interface PRBInfo {
    no_sep: string;
    no_prb: string;
    tgl_mulai: string;
    tgl_akhir: string;
    nm_dokter?: string;
    alamat?: string;
    nm_diagnosa?: string;
    nm_diagnosa2?: string;
}

// ==================== Resume & DPJP ====================

export interface ResumeInfo {
    no_rawat: string;
    tgl_periksa?: string;
    keluhan_utama: string;
    jalannya_penyakit?: string;
    anamnesa?: string;
    pemeriksaan_fisik: string;
    diagnosa_akhir: string;
    terapi: string;
    anjuran?: string;
    program_terapi?: string;
    cara_keluar?: string;
    keadaan_keluar?: string;
    nm_dokter: string;
}

export interface DPJPItem {
    tgl_dpjp: string;
    nm_dokter: string;
}

// ==================== Diagnoses & Procedures ====================

export interface DiagnosisItemFull {
    kode_penyakit: string;
    nama_penyakit: string;
    status_dx: string;
    prioritas: number;
}

export interface ProcedureItemFull {
    kode: string;
    deskripsi: string;
    prioritas: number;
    status?: string;
}

// ==================== Examinations ====================

export interface ExaminationItem {
    tgl_perawatan: string;
    jam_rawat: string;
    suhu_tubuh?: string;
    tensi?: string;
    nadi?: string;
    respirasi?: string;
    tinggi?: string;
    berat?: string;
    spo2?: string;
    gcs?: string;
    kesadaran?: string;
    keluhan?: string;
    pemeriksaan?: string;
    penilaian?: string;
    rtl?: string;
    instruksi?: string;
    evaluasi?: string;
    nm_dokter?: string;
    nm_perawat?: string;
}

// ==================== Treatments ====================

export interface TreatmentItem {
    tgl_perawatan: string;
    jam_rawat: string;
    nm_perawatan: string;
    nm_dokter?: string;
    nm_perawat?: string;
    biaya: number;
}

// ==================== Room (Ranap) ====================

export interface RoomInfo {
    tgl_masuk: string;
    jam_masuk: string;
    tgl_keluar?: string;
    jam_keluar?: string;
    kd_kamar: string;
    nm_bangsal: string;
    tarif?: number;
    lama_menginap: number;
    total_biaya: number;
}

// ==================== Surgery ====================

export interface SurgeryInfo {
    tgl_operasi: string;
    jns_operasi: string;
    nm_perawatan: string;
    operator1?: string;
    operator2?: string;
    operator3?: string;
    asisten1?: string;
    asisten2?: string;
    dokter_anak?: string;
    dokter?: string;
    biaya?: number;
}

// ==================== Radiology ====================

export interface RadiologyInfo {
    tgl_periksa: string;
    jam_periksa: string;
    nm_perawatan: string;
    nm_dokter: string;
    nm_petugas?: string;
    hasil?: string;
    biaya: number;
}

// ==================== Laboratory ====================

export interface LabDetail {
    pemeriksaan: string;
    hasil: string;
    satuan?: string;
    nilai_rujukan?: string;
    keterangan?: string;
}

export interface LabInfo {
    tgl_periksa: string;
    jam_periksa: string;
    nm_perawatan: string;
    nm_dokter?: string;
    biaya: number;
    details?: LabDetail[];
}

// ==================== Medicines ====================

export interface MedicineInfo {
    tgl_perawatan: string;
    jam_perawatan?: string;
    nama_obat: string;
    jumlah: number;
    satuan?: string;
    dosis?: string;
    aturan_pakai?: string;
    total_biaya?: number;
}

// ==================== Documents ====================

export interface DocumentInfoFull {
    kode: string;
    nama_berkas: string;
    lokasi: string;
    file_path?: string;
}

// ==================== Billing ====================

export interface BillingItem {
    no: string;
    nm_perawatan: string;
    pemisah?: string;
    biaya: number;
    jumlah: number;
    tambahan?: number;
    total_biaya: number;
}

// ==================== Main ClaimDetailFull ====================

export interface ClaimDetailFull {
    no_rawat: string;
    jenis: string;

    // Core Data
    patient: PatientInfo;
    registration: RegistrationInfo;
    sep?: SEPInfo;
    prb?: PRBInfo;

    // Medical Resume
    resume?: ResumeInfo;
    dpjp_ranap?: DPJPItem[];

    // Medical Data
    diagnoses: DiagnosisItemFull[];
    procedures: ProcedureItemFull[];

    // Examinations (SOAP)
    examinations?: ExaminationItem[];

    // Treatments
    treatments_ralan_dr?: TreatmentItem[];
    treatments_ralan_pr?: TreatmentItem[];
    treatments_ranap_dr?: TreatmentItem[];
    treatments_ranap_pr?: TreatmentItem[];

    // Room Info (Ranap)
    rooms?: RoomInfo[];

    // Surgery
    surgeries?: SurgeryInfo[];

    // Radiology
    radiology?: RadiologyInfo[];

    // Laboratory
    laboratory?: LabInfo[];

    // Medicines
    medicines_given?: MedicineInfo[];
    medicines_surgery?: MedicineInfo[];
    medicines_home?: MedicineInfo[];

    // Documents
    documents?: DocumentInfoFull[];

    // Billing
    billing?: BillingItem[];

    // Status
    status: ClaimStatus;
}

export interface ClaimDetailFullResponse {
    success: boolean;
    data: ClaimDetailFull;
}
