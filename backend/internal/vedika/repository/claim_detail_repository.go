package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/clinova/simrs/backend/internal/vedika/entity"
)

// ClaimDetailRepository handles comprehensive claim detail data access.
type ClaimDetailRepository interface {
	// GetClaimFullDetail returns complete claim data for all sections.
	GetClaimFullDetail(ctx context.Context, noRawat string) (*entity.ClaimFullDetail, error)

	// Section-specific methods
	GetSEPDetail(ctx context.Context, noRawat string) (*entity.SEPDetail, error)
	GetPatientRegistration(ctx context.Context, noRawat string) (*entity.PatientRegistration, error)
	GetSOAPExams(ctx context.Context, noRawat string) ([]entity.SOAPExamination, error)
	GetMedicalActions(ctx context.Context, noRawat string) ([]entity.MedicalAction, error)
	GetRoomStays(ctx context.Context, noRawat string) ([]entity.RoomStay, error)
	GetOperations(ctx context.Context, noRawat string) ([]entity.OperationItem, error)
	GetOperationReports(ctx context.Context, noRawat string) ([]entity.OperationReport, error)
	GetRadiology(ctx context.Context, noRawat string) (*entity.RadiologyFullData, error)
	GetLabExams(ctx context.Context, noRawat string) ([]entity.LabExam, error)
	GetMedicines(ctx context.Context, noRawat string) ([]entity.MedicineItem, error)
	GetResumeRalan(ctx context.Context, noRawat string) (*entity.MedicalResumeRalan, error)
	GetResumeRanap(ctx context.Context, noRawat string) (*entity.MedicalResumeRanap, error)
	GetBilling(ctx context.Context, noRawat string, statusLanjut string) (*entity.BillingSummary, error)
	GetSPRI(ctx context.Context, noRawat string) (*entity.SPRIDetail, error)
	GetDigitalDocuments(ctx context.Context, noRawat string) ([]entity.DigitalDocument, error)
}

// MySQLClaimDetailRepository implements ClaimDetailRepository.
type MySQLClaimDetailRepository struct {
	db *sql.DB
}

// NewMySQLClaimDetailRepository creates a new claim detail repository.
func NewMySQLClaimDetailRepository(db *sql.DB) *MySQLClaimDetailRepository {
	return &MySQLClaimDetailRepository{db: db}
}

// =============================================================================
// SECTION 1: SEP (Surat Eligibilitas Peserta)
// =============================================================================

// GetSEPDetail fetches SEP data from bridging_sep and bpjs_prb.
func (r *MySQLClaimDetailRepository) GetSEPDetail(ctx context.Context, noRawat string) (*entity.SEPDetail, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			COALESCE(bs.no_sep, '') as no_sep,
			COALESCE(bs.tglsep, '') as tgl_sep,
			COALESCE(bs.no_kartu, '') as no_kartu,
			COALESCE(bs.nomr, '') as no_rm,
			COALESCE(bs.nama_pasien, '') as nama_peserta,
			COALESCE(bs.peserta, '') as peserta,
			COALESCE(bs.tanggal_lahir, '') as tgl_lahir,
			COALESCE(bs.jkel, '') as jenis_kelamin,
			COALESCE(bs.jnspelayanan, '') as jenis_pelayanan,
			COALESCE(bs.notelep, '') as no_telp,
			COALESCE(bs.klsrawat, '') as kelas_rawat,
			COALESCE(bs.klsnaik, '') as kelas_hak,
			COALESCE(bs.nmpolitujuan, '') as poli_tujuan,
			COALESCE(bs.nmdpdjp, '') as dpjp,
			COALESCE(bs.nmppkrujukan, '') as faskes_perujuk,
			COALESCE(bs.nmdiagnosaawal, '') as diagnosa_awal,
			COALESCE(bs.catatan, '') as catatan,
			COALESCE(bs.tglrujukan, '') as tgl_rujukan,
			COALESCE(bs.cob, '') as cob,
			COALESCE(prb.prb, '') as prb_status
		FROM bridging_sep bs
		LEFT JOIN bpjs_prb prb ON bs.no_sep = prb.no_sep
		WHERE bs.no_rawat = ?
		LIMIT 1
	`

	var sep entity.SEPDetail
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&sep.NoSEP,
		&sep.TglSEP,
		&sep.NoKartu,
		&sep.NoRM,
		&sep.NamaPeserta,
		&sep.Peserta,
		&sep.TglLahir,
		&sep.JenisKelamin,
		&sep.JenisPelayanan,
		&sep.NoTelp,
		&sep.KelasRawat,
		&sep.KelasHak,
		&sep.PoliTujuan,
		&sep.DPJP,
		&sep.FaskesPerujuk,
		&sep.DiagnosaAwal,
		&sep.Catatan,
		&sep.TglRujukan,
		&sep.COB,
		&sep.PRBStatus,
	)
	if err == sql.ErrNoRows {
		return nil, nil // No SEP found
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get SEP detail: %w", err)
	}

	return &sep, nil
}

// =============================================================================
// SECTION 2: Patient & Registration
// =============================================================================

// GetPatientRegistration fetches complete patient and registration data.
func (r *MySQLClaimDetailRepository) GetPatientRegistration(ctx context.Context, noRawat string) (*entity.PatientRegistration, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			p.no_rkm_medis,
			p.nm_pasien,
			COALESCE(p.alamat, ''),
			CONCAT(rp.umurdaftar, ' ', rp.sttsumur) as umur,
			COALESCE(p.jk, ''),
			COALESCE(p.tmp_lahir, ''),
			COALESCE(DATE_FORMAT(p.tgl_lahir, '%Y-%m-%d'), ''),
			COALESCE(p.nm_ibu, ''),
			COALESCE(p.gol_darah, ''),
			COALESCE(p.stts_nikah, ''),
			COALESCE(p.agama, ''),
			COALESCE(p.pnd, ''),
			COALESCE(DATE_FORMAT(p.tgl_daftar, '%Y-%m-%d'), ''),
			COALESCE(kc.nm_kec, ''),
			COALESCE(kb.nm_kab, ''),
			rp.no_rawat,
			rp.no_reg,
			DATE_FORMAT(rp.tgl_registrasi, '%Y-%m-%d'),
			rp.jam_reg,
			CASE 
				WHEN rp.status_lanjut = 'Ranap' THEN COALESCE(b.nm_bangsal, '')
				ELSE COALESCE(pol.nm_poli, '')
			END as unit,
			rp.kd_dokter,
			COALESCE(d.nm_dokter, ''),
			COALESCE(pj.png_jawab, ''),
			COALESCE(rp.p_jawab, ''),
			COALESCE(rp.almt_pj, ''),
			COALESCE(rp.hubunganpj, ''),
			rp.status_lanjut
		FROM reg_periksa rp
		INNER JOIN pasien p ON rp.no_rkm_medis = p.no_rkm_medis
		INNER JOIN penjab pj ON rp.kd_pj = pj.kd_pj
		LEFT JOIN dokter d ON rp.kd_dokter = d.kd_dokter
		LEFT JOIN poliklinik pol ON rp.kd_poli = pol.kd_poli
		LEFT JOIN kecamatan kc ON p.kd_kec = kc.kd_kec
		LEFT JOIN kabupaten kb ON p.kd_kab = kb.kd_kab
		LEFT JOIN kamar_inap ki ON rp.no_rawat = ki.no_rawat
		LEFT JOIN kamar km ON ki.kd_kamar = km.kd_kamar
		LEFT JOIN bangsal b ON km.kd_bangsal = b.kd_bangsal
		WHERE rp.no_rawat = ?
		LIMIT 1
	`

	var pt entity.PatientRegistration
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&pt.NoRM,
		&pt.NamaPasien,
		&pt.Alamat,
		&pt.Umur,
		&pt.JenisKelamin,
		&pt.TempatLahir,
		&pt.TglLahir,
		&pt.IbuKandung,
		&pt.GolDarah,
		&pt.StatusNikah,
		&pt.Agama,
		&pt.Pendidikan,
		&pt.TglPertamaDaftar,
		&pt.Kecamatan,
		&pt.Kabupaten,
		&pt.NoRawat,
		&pt.NoReg,
		&pt.TglRegistrasi,
		&pt.JamReg,
		&pt.Unit,
		&pt.KdDokter,
		&pt.Dokter,
		&pt.CaraBayar,
		&pt.PenanggungJawab,
		&pt.AlamatPJ,
		&pt.HubunganPJ,
		&pt.StatusLanjut,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get patient registration: %w", err)
	}

	// Get DPJP list for Ranap
	if pt.StatusLanjut == "Ranap" {
		dpjpQuery := `
			SELECT COALESCE(d.nm_dokter, '') 
			FROM dpjp_ranap dr 
			INNER JOIN dokter d ON dr.kd_dokter = d.kd_dokter
			WHERE dr.no_rawat = ?
			ORDER BY dr.nomor
		`
		rows, err := r.db.QueryContext(ctx, dpjpQuery, noRawat)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var nama string
				if err := rows.Scan(&nama); err == nil && nama != "" {
					pt.DPJPList = append(pt.DPJPList, nama)
				}
			}
		}
	}

	if pt.DPJPList == nil {
		pt.DPJPList = []string{}
	}

	return &pt, nil
}

// =============================================================================
// SECTION 2 (continued): SOAP Examinations
// =============================================================================

// GetSOAPExams fetches SOAP examination data from pemeriksaan_ralan and pemeriksaan_ranap.
func (r *MySQLClaimDetailRepository) GetSOAPExams(ctx context.Context, noRawat string) ([]entity.SOAPExamination, error) {
	// Trim slash for safety with wildcard routes
	noRawat = strings.TrimPrefix(noRawat, "/")

	// Get status to determine which table to query
	var statusLanjut string
	if err := r.db.QueryRowContext(ctx, "SELECT status_lanjut FROM reg_periksa WHERE no_rawat = ?", noRawat).Scan(&statusLanjut); err != nil {
		return nil, fmt.Errorf("failed to get status_lanjut: %w", err)
	}

	var query string
	if statusLanjut == "Ranap" {
		query = `
			SELECT 
				DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'),
				jam_rawat,
				COALESCE(suhu_tubuh, ''),
				COALESCE(tensi, ''),
				COALESCE(nadi, ''),
				COALESCE(respirasi, ''),
				COALESCE(tinggi, ''),
				COALESCE(berat, ''),
				COALESCE(gcs, ''),
				COALESCE(kesadaran, ''),
				COALESCE(keluhan, ''),
				COALESCE(pemeriksaan, ''),
				COALESCE(penilaian, ''),
				COALESCE(rtl, ''),
				COALESCE(instruksi, ''),
				COALESCE(evaluasi, ''),
				COALESCE(alergi, '')
			FROM pemeriksaan_ranap
			WHERE no_rawat = ?
			ORDER BY tgl_perawatan, jam_rawat
		`
	} else {
		query = `
			SELECT 
				DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'),
				jam_rawat,
				COALESCE(suhu_tubuh, ''),
				COALESCE(tensi, ''),
				COALESCE(nadi, ''),
				COALESCE(respirasi, ''),
				COALESCE(tinggi, ''),
				COALESCE(berat, ''),
				COALESCE(gcs, ''),
				COALESCE(kesadaran, ''),
				COALESCE(keluhan, ''),
				COALESCE(pemeriksaan, ''),
				COALESCE(penilaian, ''),
				COALESCE(rtl, ''),
				COALESCE(instruksi, ''),
				COALESCE(evaluasi, ''),
				COALESCE(alergi, '')
			FROM pemeriksaan_ralan
			WHERE no_rawat = ?
			ORDER BY tgl_perawatan, jam_rawat
		`
	}

	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get SOAP exams: %w", err)
	}
	defer rows.Close()

	var exams []entity.SOAPExamination
	for rows.Next() {
		var e entity.SOAPExamination
		if err := rows.Scan(
			&e.TglPerawatan,
			&e.JamRawat,
			&e.SuhuTubuh,
			&e.Tensi,
			&e.Nadi,
			&e.Respirasi,
			&e.Tinggi,
			&e.Berat,
			&e.GCS,
			&e.Kesadaran,
			&e.Keluhan,
			&e.Pemeriksaan,
			&e.Penilaian,
			&e.RTL,
			&e.Instruksi,
			&e.Evaluasi,
			&e.Alergi,
		); err != nil {
			return nil, fmt.Errorf("failed to scan SOAP exam: %w", err)
		}
		exams = append(exams, e)
	}

	if exams == nil {
		exams = []entity.SOAPExamination{}
	}

	return exams, nil
}

// =============================================================================
// SECTION 3: Medical Actions
// =============================================================================

// GetMedicalActions fetches all types of medical actions.
func (r *MySQLClaimDetailRepository) GetMedicalActions(ctx context.Context, noRawat string) ([]entity.MedicalAction, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	var actions []entity.MedicalAction

	// Query templates for different action types
	actionQueries := []struct {
		query    string
		kategori string
	}{
		{
			query: `
				SELECT DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'), jam_rawat, jp.kd_jenis_prw, jp.nm_perawatan, COALESCE(d.nm_dokter, ''), '', COALESCE(rjd.biaya_rawat, 0)
				FROM rawat_jl_dr rjd
				INNER JOIN jns_perawatan jp ON rjd.kd_jenis_prw = jp.kd_jenis_prw
				LEFT JOIN dokter d ON rjd.kd_dokter = d.kd_dokter
				WHERE rjd.no_rawat = ?
			`,
			kategori: "Tindakan Dokter (Ralan)",
		},
		{
			query: `
				SELECT DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'), jam_rawat, jp.kd_jenis_prw, jp.nm_perawatan, '', COALESCE(pt.nama, ''), COALESCE(rjp.biaya_rawat, 0)
				FROM rawat_jl_pr rjp
				INNER JOIN jns_perawatan jp ON rjp.kd_jenis_prw = jp.kd_jenis_prw
				LEFT JOIN petugas pt ON rjp.nip = pt.nip
				WHERE rjp.no_rawat = ?
			`,
			kategori: "Tindakan Perawat (Ralan)",
		},
		{
			query: `
				SELECT DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'), jam_rawat, jp.kd_jenis_prw, jp.nm_perawatan, COALESCE(d.nm_dokter, ''), COALESCE(pt.nama, ''), COALESCE(rjdp.biaya_rawat, 0)
				FROM rawat_jl_drpr rjdp
				INNER JOIN jns_perawatan jp ON rjdp.kd_jenis_prw = jp.kd_jenis_prw
				LEFT JOIN dokter d ON rjdp.kd_dokter = d.kd_dokter
				LEFT JOIN petugas pt ON rjdp.nip = pt.nip
				WHERE rjdp.no_rawat = ?
			`,
			kategori: "Tindakan Dokter & Perawat (Ralan)",
		},
		{
			query: `
				SELECT DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'), jam_rawat, jpi.kd_jenis_prw, jpi.nm_perawatan, COALESCE(d.nm_dokter, ''), '', COALESCE(rid.biaya_rawat, 0)
				FROM rawat_inap_dr rid
				INNER JOIN jns_perawatan_inap jpi ON rid.kd_jenis_prw = jpi.kd_jenis_prw
				LEFT JOIN dokter d ON rid.kd_dokter = d.kd_dokter
				WHERE rid.no_rawat = ?
			`,
			kategori: "Tindakan Dokter (Ranap)",
		},
		{
			query: `
				SELECT DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'), jam_rawat, jpi.kd_jenis_prw, jpi.nm_perawatan, '', COALESCE(pt.nama, ''), COALESCE(rip.biaya_rawat, 0)
				FROM rawat_inap_pr rip
				INNER JOIN jns_perawatan_inap jpi ON rip.kd_jenis_prw = jpi.kd_jenis_prw
				LEFT JOIN petugas pt ON rip.nip = pt.nip
				WHERE rip.no_rawat = ?
			`,
			kategori: "Tindakan Perawat (Ranap)",
		},
		{
			query: `
				SELECT DATE_FORMAT(tgl_perawatan, '%Y-%m-%d'), jam_rawat, jpi.kd_jenis_prw, jpi.nm_perawatan, COALESCE(d.nm_dokter, ''), COALESCE(pt.nama, ''), COALESCE(ridp.biaya_rawat, 0)
				FROM rawat_inap_drpr ridp
				INNER JOIN jns_perawatan_inap jpi ON ridp.kd_jenis_prw = jpi.kd_jenis_prw
				LEFT JOIN dokter d ON ridp.kd_dokter = d.kd_dokter
				LEFT JOIN petugas pt ON ridp.nip = pt.nip
				WHERE ridp.no_rawat = ?
			`,
			kategori: "Tindakan Dokter & Perawat (Ranap)",
		},
	}

	for _, aq := range actionQueries {
		rows, err := r.db.QueryContext(ctx, aq.query, noRawat)
		if err != nil {
			continue // Skip if table doesn't exist or other error
		}

		for rows.Next() {
			var a entity.MedicalAction
			if err := rows.Scan(&a.Tanggal, &a.Jam, &a.Kode, &a.Nama, &a.Dokter, &a.Petugas, &a.Cost); err == nil {
				a.Kategori = aq.kategori
				actions = append(actions, a)
			}
		}
		rows.Close()
	}

	if actions == nil {
		actions = []entity.MedicalAction{}
	}

	return actions, nil
}

// =============================================================================
// SECTION 3 (continued): Room Stays
// =============================================================================

// GetRoomStays fetches room stay data for inpatients.
func (r *MySQLClaimDetailRepository) GetRoomStays(ctx context.Context, noRawat string) ([]entity.RoomStay, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			DATE_FORMAT(ki.tgl_masuk, '%Y-%m-%d'),
			ki.jam_masuk,
			COALESCE(DATE_FORMAT(ki.tgl_keluar, '%Y-%m-%d'), ''),
			COALESCE(ki.jam_keluar, ''),
			COALESCE(ki.lama, 0),
			COALESCE(km.kd_kamar, ''),
			COALESCE(b.nm_bangsal, ''),
			COALESCE(ki.trf_kamar, 0),
			COALESCE(ki.ttl_biaya, 0),
			COALESCE(ki.stts_pulang, '')
		FROM kamar_inap ki
		LEFT JOIN kamar km ON ki.kd_kamar = km.kd_kamar
		LEFT JOIN bangsal b ON km.kd_bangsal = b.kd_bangsal
		WHERE ki.no_rawat = ?
		ORDER BY ki.tgl_masuk, ki.jam_masuk
	`

	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get room stays: %w", err)
	}
	defer rows.Close()

	var stays []entity.RoomStay
	for rows.Next() {
		var s entity.RoomStay
		if err := rows.Scan(
			&s.TglMasuk,
			&s.JamMasuk,
			&s.TglKeluar,
			&s.JamKeluar,
			&s.LamaInap,
			&s.Kamar,
			&s.Bangsal,
			&s.Tarif,
			&s.TotalBiaya,
			&s.StatusPulang,
		); err != nil {
			return nil, fmt.Errorf("failed to scan room stay: %w", err)
		}
		stays = append(stays, s)
	}

	if stays == nil {
		stays = []entity.RoomStay{}
	}

	return stays, nil
}

// =============================================================================
// SECTION 4: Operations
// =============================================================================

// GetOperations fetches operation data.
func (r *MySQLClaimDetailRepository) GetOperations(ctx context.Context, noRawat string) ([]entity.OperationItem, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			DATE_FORMAT(o.tgl_operasi, '%Y-%m-%d %H:%i:%s'),
			COALESCE(o.kode_paket, ''),
			COALESCE(po.nm_perawatan, ''),
			COALESCE(o.jenis_anasthesi, ''),
			COALESCE(o.status, '')
		FROM operasi o
		LEFT JOIN paket_operasi po ON o.kode_paket = po.kode_paket
		WHERE o.no_rawat = ?
		ORDER BY o.tgl_operasi
	`

	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get operations: %w", err)
	}
	defer rows.Close()

	var ops []entity.OperationItem
	for rows.Next() {
		var o entity.OperationItem
		if err := rows.Scan(&o.TglOperasi, &o.KodePaket, &o.NamaTindakan, &o.JenisAnastesi, &o.Status); err != nil {
			return nil, fmt.Errorf("failed to scan operation: %w", err)
		}
		ops = append(ops, o)
	}

	if ops == nil {
		ops = []entity.OperationItem{}
	}

	return ops, nil
}

// GetOperationReports fetches operation report data.
func (r *MySQLClaimDetailRepository) GetOperationReports(ctx context.Context, noRawat string) ([]entity.OperationReport, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			lo.no_rawat,
			DATE_FORMAT(lo.tanggal, '%Y-%m-%d %H:%i:%s'),
			COALESCE(DATE_FORMAT(lo.selesaioperasi, '%Y-%m-%d %H:%i:%s'), ''),
			COALESCE(lo.diagnosa_preop, ''),
			COALESCE(lo.diagnosa_postop, ''),
			COALESCE(lo.jaringan_dieksekusi, ''),
			COALESCE(lo.permintaan_pa, ''),
			COALESCE(lo.laporan_operasi, ''),
			COALESCE(d.nm_dokter, '')
		FROM laporan_operasi lo
		LEFT JOIN dokter d ON lo.operator1 = d.kd_dokter
		WHERE lo.no_rawat = ?
	`

	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get operation reports: %w", err)
	}
	defer rows.Close()

	var reports []entity.OperationReport
	for rows.Next() {
		var r entity.OperationReport
		if err := rows.Scan(
			&r.NoRawat,
			&r.Tanggal,
			&r.SelesaiOperasi,
			&r.DiagnosaPreop,
			&r.DiagnosaPostop,
			&r.JaringanDieksekusi,
			&r.PermintaanPA,
			&r.LaporanOperasi,
			&r.DokterOperator,
		); err != nil {
			continue
		}
		reports = append(reports, r)
	}

	if reports == nil {
		reports = []entity.OperationReport{}
	}

	return reports, nil
}

// =============================================================================
// SECTION 5: Radiology
// =============================================================================

// GetRadiology fetches radiology exam and result data.
func (r *MySQLClaimDetailRepository) GetRadiology(ctx context.Context, noRawat string) (*entity.RadiologyFullData, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	data := &entity.RadiologyFullData{
		Exams:   []entity.RadiologyExam{},
		Results: []entity.RadiologyResult{},
	}

	// Get exams
	examQuery := `
		SELECT 
			DATE_FORMAT(pr.tgl_periksa, '%Y-%m-%d'),
			pr.jam,
			pr.kd_jenis_prw,
			COALESCE(jpr.nm_perawatan, ''),
			COALESCE(d.nm_dokter, ''),
			COALESCE(pt.nama, ''),
			COALESCE(pr.biaya, 0)
		FROM periksa_radiologi pr
		LEFT JOIN jns_perawatan_radiologi jpr ON pr.kd_jenis_prw = jpr.kd_jenis_prw
		LEFT JOIN dokter d ON pr.kd_dokter = d.kd_dokter
		LEFT JOIN petugas pt ON pr.nip = pt.nip
		WHERE pr.no_rawat = ?
		ORDER BY pr.tgl_periksa, pr.jam
	`

	examRows, err := r.db.QueryContext(ctx, examQuery, noRawat)
	if err == nil {
		defer examRows.Close()
		for examRows.Next() {
			var e entity.RadiologyExam
			if err := examRows.Scan(&e.TglPeriksa, &e.Jam, &e.Kode, &e.Nama, &e.Dokter, &e.Petugas, &e.Biaya); err == nil {
				data.Exams = append(data.Exams, e)
			}
		}
	}

	// Get results
	resultQuery := `
		SELECT 
			DATE_FORMAT(tgl_periksa, '%Y-%m-%d'),
			jam,
			COALESCE(hasil, ''),
			COALESCE(klinis, ''),
			COALESCE(judul, ''),
			COALESCE(kesan, ''),
			COALESCE(saran, '')
		FROM hasil_radiologi
		WHERE no_rawat = ?
	`

	resultRows, err := r.db.QueryContext(ctx, resultQuery, noRawat)
	if err == nil {
		defer resultRows.Close()
		for resultRows.Next() {
			var res entity.RadiologyResult
			if err := resultRows.Scan(&res.TglPeriksa, &res.Jam, &res.Hasil, &res.Klinis, &res.Judul, &res.Kesan, &res.Saran); err == nil {
				data.Results = append(data.Results, res)
			}
		}
	}

	// Get images
	imageQuery := `SELECT lokasi_gambar FROM gambar_radiologi WHERE no_rawat = ?`
	imageRows, err := r.db.QueryContext(ctx, imageQuery, noRawat)
	if err == nil {
		defer imageRows.Close()
		for imageRows.Next() {
			var path string
			if err := imageRows.Scan(&path); err == nil && len(data.Results) > 0 {
				data.Results[0].Gambar = append(data.Results[0].Gambar, path)
			}
		}
	}

	return data, nil
}

// =============================================================================
// SECTION 6: Laboratory
// =============================================================================

// GetLabExams fetches laboratory examination data with details.
func (r *MySQLClaimDetailRepository) GetLabExams(ctx context.Context, noRawat string) ([]entity.LabExam, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")

	query := `
		SELECT 
			DATE_FORMAT(pl.tgl_periksa, '%Y-%m-%d') as tgl_periksa,
			pl.jam,
			pl.kd_jenis_prw,
			COALESCE(jpl.nm_perawatan, '') as nm_perawatan,
			COALESCE(d.nm_dokter, '') as nm_dokter,
			COALESCE(pl.biaya, 0) as biaya,
			COALESCE(tl.Pemeriksaan, '') as nm_pemeriksaan,
			COALESCE(dpl.nilai, '') as nilai,
			COALESCE(tl.satuan, '') as satuan,
			COALESCE(dpl.nilai_rujukan, '') as rujukan,
			COALESCE(dpl.keterangan, '') as keterangan
		FROM periksa_lab pl
		LEFT JOIN jns_perawatan_lab jpl ON pl.kd_jenis_prw = jpl.kd_jenis_prw
		LEFT JOIN dokter d ON pl.dokter_perujuk = d.kd_dokter
		LEFT JOIN detail_periksa_lab dpl ON pl.no_rawat = dpl.no_rawat 
			AND pl.kd_jenis_prw = dpl.kd_jenis_prw 
			AND pl.tgl_periksa = dpl.tgl_periksa 
			AND pl.jam = dpl.jam
		LEFT JOIN template_laboratorium tl ON dpl.id_template = tl.id_template
		WHERE pl.no_rawat = ?
		ORDER BY pl.tgl_periksa, pl.jam, tl.urut
	`

	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get lab exams: %w", err)
	}
	defer rows.Close()

	// Map to group details by header
	examMap := make(map[string]*entity.LabExam)
	var examKeys []string

	for rows.Next() {
		var tgl, jam, kode, nama, dokter, pNama, pNilai, pSatuan, pRujukan, pKet string
		var biaya float64

		if err := rows.Scan(&tgl, &jam, &kode, &nama, &dokter, &biaya, &pNama, &pNilai, &pSatuan, &pRujukan, &pKet); err != nil {
			continue
		}

		key := tgl + jam + kode
		if _, ok := examMap[key]; !ok {
			exam := &entity.LabExam{
				TglPeriksa:   tgl,
				Jam:          jam,
				Kode:         kode,
				NamaTindakan: nama,
				Dokter:       dokter,
				Biaya:        biaya,
				Details:      []entity.LabDetail{},
			}
			examMap[key] = exam
			examKeys = append(examKeys, key)
		}

		if pNama != "" {
			examMap[key].Details = append(examMap[key].Details, entity.LabDetail{
				Pemeriksaan:  pNama,
				Nilai:        pNilai,
				Satuan:       pSatuan,
				NilaiRujukan: pRujukan,
				Keterangan:   pKet,
			})
		}
	}

	exams := []entity.LabExam{}
	for _, k := range examKeys {
		exams = append(exams, *examMap[k])
	}

	return exams, nil
}

// =============================================================================
// SECTION 7: Medicines
// =============================================================================

// GetMedicines fetches all medicine data (pemberian, operasi, resep_pulang).
func (r *MySQLClaimDetailRepository) GetMedicines(ctx context.Context, noRawat string) ([]entity.MedicineItem, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	var medicines []entity.MedicineItem

	// 1. Pemberian obat
	pemberianQuery := `
		SELECT 
			DATE_FORMAT(dpo.tgl_perawatan, '%Y-%m-%d'),
			dpo.jam,
			dpo.kode_brng,
			COALESCE(db.nama_brng, ''),
			dpo.jml,
			COALESCE(kso.satuan, ''),
			'',
			COALESCE(dpo.total, 0)
		FROM detail_pemberian_obat dpo
		LEFT JOIN databarang db ON dpo.kode_brng = db.kode_brng
		LEFT JOIN kodesatuan kso ON db.kode_sat = kso.kode_sat
		WHERE dpo.no_rawat = ?
		ORDER BY dpo.tgl_perawatan, dpo.jam
	`

	rows, err := r.db.QueryContext(ctx, pemberianQuery, noRawat)
	if err == nil {
		for rows.Next() {
			var m entity.MedicineItem
			if err := rows.Scan(&m.TglPerawatan, &m.Jam, &m.KodeBrng, &m.NamaObat, &m.Jumlah, &m.Satuan, &m.Dosis, &m.Biaya); err == nil {
				m.Kategori = "Pemberian Obat"
				medicines = append(medicines, m)
			}
		}
		rows.Close()
	}

	// 2. Obat operasi
	opObatQuery := `
		SELECT 
			DATE_FORMAT(boo.tanggal, '%Y-%m-%d'),
			'',
			boo.kd_obat,
			COALESCE(ok.nm_obat, ''),
			boo.jumlah,
			'',
			'',
			COALESCE(boo.hargasatuan * boo.jumlah, 0)
		FROM beri_obat_operasi boo
		LEFT JOIN obatbhp_ok ok ON boo.kd_obat = ok.kd_obat
		WHERE boo.no_rawat = ?
	`

	rows2, err := r.db.QueryContext(ctx, opObatQuery, noRawat)
	if err == nil {
		for rows2.Next() {
			var m entity.MedicineItem
			if err := rows2.Scan(&m.TglPerawatan, &m.Jam, &m.KodeBrng, &m.NamaObat, &m.Jumlah, &m.Satuan, &m.Dosis, &m.Biaya); err == nil {
				m.Kategori = "Obat Operasi"
				medicines = append(medicines, m)
			}
		}
		rows2.Close()
	}

	// 3. Resep pulang
	resepQuery := `
		SELECT 
			DATE_FORMAT(rp.tgl_perawatan, '%Y-%m-%d'),
			rp.jam,
			rp.kode_brng,
			COALESCE(db.nama_brng, ''),
			rp.jml_barang,
			COALESCE(kso.satuan, ''),
			COALESCE(rp.dosis, ''),
			0
		FROM resep_pulang rp
		LEFT JOIN databarang db ON rp.kode_brng = db.kode_brng
		LEFT JOIN kodesatuan kso ON db.kode_sat = kso.kode_sat
		WHERE rp.no_rawat = ?
	`

	rows3, err := r.db.QueryContext(ctx, resepQuery, noRawat)
	if err == nil {
		for rows3.Next() {
			var m entity.MedicineItem
			if err := rows3.Scan(&m.TglPerawatan, &m.Jam, &m.KodeBrng, &m.NamaObat, &m.Jumlah, &m.Satuan, &m.Dosis, &m.Biaya); err == nil {
				m.Kategori = "Resep Pulang"
				medicines = append(medicines, m)
			}
		}
		rows3.Close()
	}

	if medicines == nil {
		medicines = []entity.MedicineItem{}
	}

	return medicines, nil
}

// =============================================================================
// SECTION 8: Medical Resume
// =============================================================================

func (r *MySQLClaimDetailRepository) GetResumeRalan(ctx context.Context, noRawat string) (*entity.MedicalResumeRalan, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")

	query := `
		SELECT 
			rp.no_rawat,
			rp.kd_dokter,
			d.nm_dokter,
			COALESCE(rs.diagnosa_utama, ''),
			COALESCE(rs.diagnosa_sekunder, ''),
			COALESCE(rs.diagnosa_sekunder2, ''),
			COALESCE(rs.diagnosa_sekunder3, ''),
			COALESCE(rs.diagnosa_sekunder4, ''),
			COALESCE(rs.prosedur_utama, ''),
			COALESCE(rs.prosedur_sekunder, ''),
			COALESCE(rs.prosedur_sekunder2, ''),
			COALESCE(rs.prosedur_sekunder3, ''),
			COALESCE(pr.keluhan, ''),
			COALESCE(pr.pemeriksaan, ''),
			COALESCE(pr.tensi, ''),
			COALESCE(pr.respirasi, ''),
			COALESCE(pr.nadi, ''),
			COALESCE(pr.suhu_tubuh, ''),
			COALESCE(pr.alergi, ''),
			COALESCE(pr.penilaian, ''),
			COALESCE(pr.rtl, '')
		FROM reg_periksa rp
		INNER JOIN dokter d ON rp.kd_dokter = d.kd_dokter
		LEFT JOIN resume_pasien rs ON rp.no_rawat = rs.no_rawat
		LEFT JOIN pemeriksaan_ralan pr ON rp.no_rawat = pr.no_rawat
		WHERE rp.no_rawat = ?
		ORDER BY pr.tgl_perawatan DESC, pr.jam_rawat DESC
		LIMIT 1
	`

	var res entity.MedicalResumeRalan
	var diagnosaAssessment, planInstruksi string
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&res.NoRawat,
		&res.KdDokter,
		&res.NamaDokter,
		&res.DiagnosaUtama,
		&res.DiagnosaSekunder1,
		&res.DiagnosaSekunder2,
		&res.DiagnosaSekunder3,
		&res.DiagnosaSekunder4,
		&res.ProsedurUtama,
		&res.ProsedurSekunder1,
		&res.ProsedurSekunder2,
		&res.ProsedurSekunder3,
		&res.KeluhanUtama,
		&res.Pemeriksaan,
		&res.Tensi,
		&res.Respirasi,
		&res.Nadi,
		&res.Suhu,
		&res.Alergi,
		&diagnosaAssessment, // Dummy for assessment from pr
		&planInstruksi,      // Dummy for plan from pr
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get resume ralan: %w", err)
	}

	return &res, nil
}

// GetResumeRanap fetches inpatient resume.
func (r *MySQLClaimDetailRepository) GetResumeRanap(ctx context.Context, noRawat string) (*entity.MedicalResumeRanap, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			r.no_rawat,
			COALESCE(r.kd_dokter, ''),
			COALESCE(d.nm_dokter, ''),
			COALESCE(r.diagnosa_awal, ''),
			COALESCE(r.keluhan_utama, ''),
			COALESCE(r.jalannya_penyakit, ''),
			COALESCE(r.pemeriksaan_fisik, ''),
			COALESCE(r.pemeriksaan_penunjang, ''),
			COALESCE(r.hasil_laborat, ''),
			COALESCE(r.diagnosa_utama, ''),
			COALESCE(r.diagnosa_sekunder, ''),
			COALESCE(r.diagnosa_sekunder2, ''),
			COALESCE(r.diagnosa_sekunder3, ''),
			COALESCE(r.diagnosa_sekunder4, ''),
			COALESCE(r.prosedur_utama, ''),
			COALESCE(r.prosedur_sekunder, ''),
			COALESCE(r.prosedur_sekunder2, ''),
			COALESCE(r.prosedur_sekunder3, ''),
			COALESCE(r.obat_pulang, ''),
			COALESCE(r.ket_keluar, '')
		FROM resume_pasien_ranap r
		LEFT JOIN dokter d ON r.kd_dokter = d.kd_dokter
		WHERE r.no_rawat = ?
		LIMIT 1
	`

	var res entity.MedicalResumeRanap
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&res.NoRawat,
		&res.KdDokter,
		&res.NamaDokter,
		&res.DiagnosaAwal,
		&res.KeluhanUtama,
		&res.JalannyaPenyakit,
		&res.PemeriksaanFisik,
		&res.PemeriksaanPenunjang,
		&res.HasilLaborat,
		&res.DiagnosaUtama,
		&res.DiagnosaSekunder1,
		&res.DiagnosaSekunder2,
		&res.DiagnosaSekunder3,
		&res.DiagnosaSekunder4,
		&res.ProsedurUtama,
		&res.ProsedurSekunder1,
		&res.ProsedurSekunder2,
		&res.ProsedurSekunder3,
		&res.ObatPulang,
		&res.KondisiPulang,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get resume ranap: %w", err)
	}

	return &res, nil
}

// =============================================================================
// SECTION 9: Billing
// =============================================================================

// GetBilling fetches billing data (legacy or mlite mode).
func (r *MySQLClaimDetailRepository) GetBilling(ctx context.Context, noRawat string, statusLanjut string) (*entity.BillingSummary, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	billing := &entity.BillingSummary{
		Categories: []entity.BillingCategory{},
	}

	// 1. Fetch Nota Header (No Nota, Kasir, Tgl Bayar)
	var notaQuery string
	if statusLanjut == "Ranap" {
		notaQuery = `SELECT no_nota, DATE_FORMAT(tanggal, '%Y-%m-%d'), jam FROM nota_inap WHERE no_rawat = ? LIMIT 1`
	} else {
		notaQuery = `SELECT no_nota, DATE_FORMAT(tanggal, '%Y-%m-%d'), jam FROM nota_jalan WHERE no_rawat = ? LIMIT 1`
	}
	var tgl, jam string
	r.db.QueryRowContext(ctx, notaQuery, noRawat).Scan(&billing.NoNota, &tgl, &jam)
	if tgl != "" {
		billing.TglBayar = tgl + " " + jam
	}

	// 2. Fetch Kasir (joining with reg_periksa or nota)
	// Simple lookup for cashier name from nota if possible
	r.db.QueryRowContext(ctx, "SELECT COALESCE(login, '') FROM nota_jalan WHERE no_rawat = ? UNION SELECT COALESCE(login, '') FROM nota_inap WHERE no_rawat = ? LIMIT 1", noRawat, noRawat).Scan(&billing.Kasir)

	// 3. Check if mlite_billing exists for summary totals
	var mliteCount int
	r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM mlite_billing WHERE no_rawat = ?", noRawat).Scan(&mliteCount)

	if mliteCount > 0 {
		billing.Mode = "mlite"
		r.db.QueryRowContext(ctx, `
			SELECT COALESCE(jumlah_total, 0), COALESCE(potongan, 0), COALESCE(jumlah_harus_bayar, 0)
			FROM mlite_billing WHERE no_rawat = ? LIMIT 1
		`, noRawat).Scan(&billing.JumlahTotal, &billing.Potongan, &billing.JumlahBayar)
	} else {
		billing.Mode = "legacy"
	}

	// ALWAYS Trim slash for sub-queries too
	noRawat = strings.TrimPrefix(noRawat, "/")

	// 4. Always fetch detailed items from 'billing' table for transparency (mLite's requirement)
	rows, err := r.db.QueryContext(ctx, `
		SELECT no, nm_perawatan, pemisah, biaya, jumlah, tambahan, totalbiaya
		FROM billing WHERE no_rawat = ? ORDER BY no
	`, noRawat)
	if err == nil {
		defer rows.Close()
		var cat entity.BillingCategory
		cat.Kategori = "Rincian Komponen Biaya"
		for rows.Next() {
			var item entity.BillingItem
			if err := rows.Scan(&item.No, &item.NamaPerawatan, &item.Pemisah, &item.Biaya, &item.Jumlah, &item.Tambahan, &item.TotalBiaya); err == nil {
				cat.Items = append(cat.Items, item)
				if billing.Mode == "legacy" {
					cat.Subtotal += item.TotalBiaya
				}
			}
		}
		if len(cat.Items) > 0 {
			billing.Categories = append(billing.Categories, cat)
			if billing.Mode == "legacy" {
				billing.JumlahTotal = cat.Subtotal
				billing.JumlahBayar = cat.Subtotal - billing.Potongan
			}
		}
	}

	// If no billing found in 'billing' table or totals are zero, fallback to aggregation from source tables
	if len(billing.Categories) == 0 || (billing.Mode == "legacy" && billing.JumlahTotal == 0) {
		r.aggregateBillingDetails(ctx, noRawat, billing)
	}

	// Generate terbilang (simple implementation)
	billing.Terbilang = formatTerbilang(billing.JumlahBayar)

	return billing, nil
}

// formatTerbilang converts number to Indonesian words (simplified).
func formatTerbilang(amount float64) string {
	if amount == 0 {
		return "Nol Rupiah"
	}
	return fmt.Sprintf("%.0f Rupiah", amount) // Simplified for now
}

// =============================================================================
// SECTION 10: SPRI
// =============================================================================

// GetSPRI fetches SPRI data if exists.
func (r *MySQLClaimDetailRepository) GetSPRI(ctx context.Context, noRawat string) (*entity.SPRIDetail, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			no_surat,
			COALESCE(DATE_FORMAT(tgl_surat, '%Y-%m-%d'), ''),
			COALESCE(no_kartu, ''),
			COALESCE(nama, ''),
			COALESCE(jkel, ''),
			COALESCE(DATE_FORMAT(tgl_lahir, '%Y-%m-%d'), ''),
			COALESCE(diagnosa, ''),
			COALESCE(DATE_FORMAT(tgl_rencana, '%Y-%m-%d'), ''),
			COALESCE(nm_dokter_bpjs, ''),
			COALESCE(nm_poli_bpjs, '')
		FROM bridging_surat_pri_bpjs
		WHERE no_rawat = ?
		LIMIT 1
	`

	var spri entity.SPRIDetail
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&spri.NoSurat,
		&spri.TglSurat,
		&spri.NoKartu,
		&spri.NamaPasien,
		&spri.JenisKelamin,
		&spri.TglLahir,
		&spri.DiagnosaAwal,
		&spri.TglRencana,
		&spri.NamaDokter,
		&spri.NamaPoli,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get SPRI: %w", err)
	}

	return &spri, nil
}

// =============================================================================
// SECTION 11-13: Digital Documents
// =============================================================================

// GetDigitalDocuments fetches uploaded documents.
func (r *MySQLClaimDetailRepository) GetDigitalDocuments(ctx context.Context, noRawat string) ([]entity.DigitalDocument, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")
	query := `
		SELECT 
			bdp.kode,
			bdp.no_rawat,
			bdp.kode,
			COALESCE(mbd.nama, ''),
			bdp.lokasi_file
		FROM berkas_digital_perawatan bdp
		LEFT JOIN master_berkas_digital mbd ON bdp.kode = mbd.kode
		WHERE bdp.no_rawat = ?
	`

	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get documents: %w", err)
	}
	defer rows.Close()

	var docs []entity.DigitalDocument
	for rows.Next() {
		var d entity.DigitalDocument
		if err := rows.Scan(&d.ID, &d.NoRawat, &d.Kode, &d.Kategori, &d.LokasiFile); err != nil {
			continue
		}
		// FileURL will be populated by the service layer using dynamic settings
		d.FileURL = d.LokasiFile
		docs = append(docs, d)
	}

	if docs == nil {
		docs = []entity.DigitalDocument{}
	}

	return docs, nil
}

// =============================================================================
// MAIN: GetClaimFullDetail
// =============================================================================

// GetClaimFullDetail assembles complete claim data from all sections.
func (r *MySQLClaimDetailRepository) GetClaimFullDetail(ctx context.Context, noRawat string) (*entity.ClaimFullDetail, error) {
	noRawat = strings.TrimPrefix(noRawat, "/")

	// Get patient registration first (required)
	patient, err := r.GetPatientRegistration(ctx, noRawat)
	if err != nil {
		return nil, fmt.Errorf("patient registration for %s not found: %w", noRawat, err)
	}

	detail := &entity.ClaimFullDetail{
		Patient:      *patient,
		StatusLanjut: patient.StatusLanjut,
	}

	// Get SEP (optional)
	if sep, err := r.GetSEPDetail(ctx, noRawat); err == nil {
		detail.SEP = sep
	}

	// Get SOAP exams
	if exams, err := r.GetSOAPExams(ctx, noRawat); err == nil {
		detail.SOAPExams = exams
	} else {
		fmt.Printf("vedika_debug: error GetSOAPExams for %s: %v\n", noRawat, err)
	}

	// Get diagnoses (reuse existing method from IndexRepository)
	indexRepo := &MySQLIndexRepository{db: r.db}
	if diagnoses, err := indexRepo.GetDiagnoses(ctx, noRawat); err == nil {
		detail.Diagnoses = diagnoses
	} else {
		fmt.Printf("vedika_debug: error GetDiagnoses for %s: %v\n", noRawat, err)
	}

	// Get procedures
	if procedures, err := indexRepo.GetProcedures(ctx, noRawat); err == nil {
		detail.Procedures = procedures
	} else {
		fmt.Printf("vedika_debug: error GetProcedures for %s: %v\n", noRawat, err)
	}

	// Get medical actions
	if actions, err := r.GetMedicalActions(ctx, noRawat); err == nil {
		detail.Actions = actions
	}

	// Get room stays (for Ranap)
	if patient.StatusLanjut == "Ranap" {
		if stays, err := r.GetRoomStays(ctx, noRawat); err == nil {
			detail.RoomStays = stays
		}
	}

	// Get operations
	if ops, err := r.GetOperations(ctx, noRawat); err == nil {
		detail.Operations = ops
	}
	if reports, err := r.GetOperationReports(ctx, noRawat); err == nil {
		detail.OpReports = reports
	}

	// Get radiology
	if rad, err := r.GetRadiology(ctx, noRawat); err == nil {
		detail.Radiology = *rad
	}

	// Get lab exams
	if labs, err := r.GetLabExams(ctx, noRawat); err == nil {
		detail.LabExams = labs
	}

	// Get medicines
	if meds, err := r.GetMedicines(ctx, noRawat); err == nil {
		detail.Medicines = meds
	}

	// Get resume (based on status)
	if patient.StatusLanjut == "Ranap" {
		if resume, err := r.GetResumeRanap(ctx, noRawat); err == nil {
			detail.ResumeRanap = resume
		} else {
			fmt.Printf("vedika_debug: error GetResumeRanap for %s: %v\n", noRawat, err)
		}
	} else {
		if resume, err := r.GetResumeRalan(ctx, noRawat); err == nil {
			detail.ResumeRalan = resume
		} else {
			fmt.Printf("vedika_debug: error GetResumeRalan for %s: %v\n", noRawat, err)
		}
	}

	// Get billing
	if billing, err := r.GetBilling(ctx, noRawat, patient.StatusLanjut); err == nil {
		detail.Billing = billing
	} else {
		fmt.Printf("vedika_debug: error GetBilling for %s: %v\n", noRawat, err)
	}

	// Get SPRI
	if spri, err := r.GetSPRI(ctx, noRawat); err == nil {
		detail.SPRI = spri
	}

	// Get documents
	if docs, err := r.GetDigitalDocuments(ctx, noRawat); err == nil {
		detail.Documents = docs
	}

	// Get claim status
	if status, err := indexRepo.GetEpisodeStatus(ctx, noRawat); err == nil {
		detail.ClaimStatus = status
	}

	return detail, nil
}

// aggregateBillingDetails aggregates data from detail tables if the summary 'billing' table is empty.
func (r *MySQLClaimDetailRepository) aggregateBillingDetails(ctx context.Context, noRawat string, billing *entity.BillingSummary) {
	noRawat = strings.TrimPrefix(noRawat, "/")

	// Reset if we're doing a full aggregate
	billing.Categories = []entity.BillingCategory{}
	billing.JumlahTotal = 0
	billing.Mode = "aggregated"

	// 1. Medicines
	meds, _ := r.GetMedicines(ctx, noRawat)
	if len(meds) > 0 {
		cat := entity.BillingCategory{Kategori: "Obat & BHP"}
		for i, m := range meds {
			if m.Biaya > 0 {
				item := entity.BillingItem{
					No:            i + 1,
					NamaPerawatan: m.NamaObat,
					Biaya:         m.Biaya / m.Jumlah, // Standardize to unit price
					Jumlah:        int(m.Jumlah),
					TotalBiaya:    m.Biaya,
				}
				if m.Jumlah > 0 && item.Biaya == 0 {
					item.Biaya = m.Biaya
				}
				cat.Items = append(cat.Items, item)
				cat.Subtotal += item.TotalBiaya
			}
		}
		if len(cat.Items) > 0 {
			billing.Categories = append(billing.Categories, cat)
			billing.JumlahTotal += cat.Subtotal
		}
	}

	// 2. Room Stays
	rooms, _ := r.GetRoomStays(ctx, noRawat)
	if len(rooms) > 0 {
		cat := entity.BillingCategory{Kategori: "Kamar Inap"}
		for i, rs := range rooms {
			item := entity.BillingItem{
				No:            i + 1,
				NamaPerawatan: fmt.Sprintf("%s (%s)", rs.Bangsal, rs.Kamar),
				Biaya:         rs.Tarif,
				Jumlah:        rs.LamaInap,
				TotalBiaya:    rs.TotalBiaya,
			}
			cat.Items = append(cat.Items, item)
			cat.Subtotal += item.TotalBiaya
		}
		billing.Categories = append(billing.Categories, cat)
		billing.JumlahTotal += cat.Subtotal
	}

	// 3. Surgery (Aggregated from 'operasi' table)
	queryOp := `
		SELECT 
			COALESCE(biayaoperator1, 0) + COALESCE(biayaoperator2, 0) + COALESCE(biayaoperator3, 0) +
			COALESCE(biayaasisten_operator1, 0) + COALESCE(biayaasisten_operator2, 0) + COALESCE(biayaasisten_operator3, 0) +
			COALESCE(biayainstrumen, 0) + COALESCE(biayadokter_anak, 0) + COALESCE(biayaperawaat_resusitas, 0) +
			COALESCE(biayabidan, 0) + COALESCE(biayabidan2, 0) + COALESCE(biayabidan3, 0) +
			COALESCE(biayadokter_anestesi, 0) + COALESCE(biayaasisten_anestesi, 0) + COALESCE(biayaasisten_anestesi2, 0) +
			COALESCE(biayaperawat_luar, 0) as jasa_medis,
			COALESCE(biayaalat, 0) as biaya_alat,
			COALESCE(biayasewaok, 0) as sewa_ok,
			COALESCE(akomodasi, 0) + COALESCE(bagian_rs, 0) as sarana,
			COALESCE(biaya_omloop, 0) + COALESCE(biaya_omloop2, 0) + 
			COALESCE(biaya_omloop3, 0) + COALESCE(biaya_omloop4, 0) + COALESCE(biaya_omloop5, 0) as omloop,
			COALESCE(biayasarpras, 0) as sarpras,
			COALESCE(biaya_dokter_pjanak, 0) + COALESCE(biaya_dokter_umum, 0) as jm_lain
		FROM operasi WHERE no_rawat = ?
	`
	rowsOp, err := r.db.QueryContext(ctx, queryOp, noRawat)
	if err == nil {
		cat := entity.BillingCategory{Kategori: "Operasi & VK"}
		idx := 1
		for rowsOp.Next() {
			var jm, alat, ok, sarana, oml, srp, lain float64
			rowsOp.Scan(&jm, &alat, &ok, &sarana, &oml, &srp, &lain)

			if jm > 0 {
				cat.Items = append(cat.Items, entity.BillingItem{No: idx, NamaPerawatan: "Jasa Medis & Tim Operasi", Biaya: jm, Jumlah: 1, TotalBiaya: jm})
				cat.Subtotal += jm
				idx++
			}
			if alat > 0 {
				cat.Items = append(cat.Items, entity.BillingItem{No: idx, NamaPerawatan: "Biaya Alat Operasi", Biaya: alat, Jumlah: 1, TotalBiaya: alat})
				cat.Subtotal += alat
				idx++
			}
			if ok > 0 {
				cat.Items = append(cat.Items, entity.BillingItem{No: idx, NamaPerawatan: "Sewa Kamar OK/VK", Biaya: ok, Jumlah: 1, TotalBiaya: ok})
				cat.Subtotal += ok
				idx++
			}
			if sarana > 0 {
				cat.Items = append(cat.Items, entity.BillingItem{No: idx, NamaPerawatan: "Sarana Operasi", Biaya: sarana, Jumlah: 1, TotalBiaya: sarana})
				cat.Subtotal += sarana
				idx++
			}
			if oml+srp+lain > 0 {
				val := oml + srp + lain
				cat.Items = append(cat.Items, entity.BillingItem{No: idx, NamaPerawatan: "Penunjang Operasi Lainnya", Biaya: val, Jumlah: 1, TotalBiaya: val})
				cat.Subtotal += val
				idx++
			}
		}
		rowsOp.Close()
		if len(cat.Items) > 0 {
			billing.Categories = append(billing.Categories, cat)
			billing.JumlahTotal += cat.Subtotal
		}
	}

	// 4. Medical Actions
	actions, _ := r.GetMedicalActions(ctx, noRawat)
	if len(actions) > 0 {
		cat := entity.BillingCategory{Kategori: "Tindakan Medis"}
		for i, a := range actions {
			if a.Cost > 0 {
				item := entity.BillingItem{
					No:            i + 1,
					NamaPerawatan: a.Nama,
					Biaya:         a.Cost,
					Jumlah:        1,
					TotalBiaya:    a.Cost,
				}
				cat.Items = append(cat.Items, item)
				cat.Subtotal += item.TotalBiaya
			}
		}
		if len(cat.Items) > 0 {
			billing.Categories = append(billing.Categories, cat)
			billing.JumlahTotal += cat.Subtotal
		}
	}

	// 5. Lab & Rad
	lab, _ := r.GetLabExams(ctx, noRawat)
	if len(lab) > 0 {
		cat := entity.BillingCategory{Kategori: "Laboratorium"}
		for i, l := range lab {
			item := entity.BillingItem{
				No:            i + 1,
				NamaPerawatan: l.NamaTindakan,
				Biaya:         l.Biaya,
				Jumlah:        1,
				TotalBiaya:    l.Biaya,
			}
			cat.Items = append(cat.Items, item)
			cat.Subtotal += item.TotalBiaya
		}
		billing.Categories = append(billing.Categories, cat)
		billing.JumlahTotal += cat.Subtotal
	}

	rad, _ := r.GetRadiology(ctx, noRawat)
	if rad != nil && len(rad.Exams) > 0 {
		cat := entity.BillingCategory{Kategori: "Radiologi"}
		for i, re := range rad.Exams {
			item := entity.BillingItem{
				No:            i + 1,
				NamaPerawatan: re.Nama,
				Biaya:         re.Biaya,
				Jumlah:        1,
				TotalBiaya:    re.Biaya,
			}
			cat.Items = append(cat.Items, item)
			cat.Subtotal += item.TotalBiaya
		}
		billing.Categories = append(billing.Categories, cat)
		billing.JumlahTotal += cat.Subtotal
	}

	billing.JumlahBayar = billing.JumlahTotal - billing.Potongan
}
