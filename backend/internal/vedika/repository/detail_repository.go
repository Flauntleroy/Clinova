// Package repository contains data access layer for Vedika module.
package repository

import (
	"context"
	"database/sql"
	"fmt"
	"sync"

	"github.com/clinova/simrs/backend/internal/vedika/entity"
)

// DetailRepository handles comprehensive claim detail queries.
type DetailRepository interface {
	GetFullClaimDetail(ctx context.Context, noRawat string) (*entity.ClaimDetailFull, error)
}

// MySQLDetailRepository implements DetailRepository using MySQL.
type MySQLDetailRepository struct {
	db *sql.DB
}

// NewMySQLDetailRepository creates a new detail repository.
func NewMySQLDetailRepository(db *sql.DB) *MySQLDetailRepository {
	return &MySQLDetailRepository{db: db}
}

// GetFullClaimDetail fetches comprehensive claim data using parallel queries.
func (r *MySQLDetailRepository) GetFullClaimDetail(ctx context.Context, noRawat string) (*entity.ClaimDetailFull, error) {
	result := &entity.ClaimDetailFull{
		NoRawat: noRawat,
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	var firstErr error

	setError := func(err error) {
		mu.Lock()
		if firstErr == nil {
			firstErr = err
		}
		mu.Unlock()
	}

	// Query 1: Patient Info
	wg.Add(1)
	go func() {
		defer wg.Done()
		patient, err := r.getPatientInfo(ctx, noRawat)
		if err != nil {
			setError(fmt.Errorf("patient: %w", err))
			return
		}
		mu.Lock()
		result.Patient = *patient
		mu.Unlock()
	}()

	// Query 2: Registration Info
	wg.Add(1)
	go func() {
		defer wg.Done()
		reg, err := r.getRegistrationInfo(ctx, noRawat)
		if err != nil {
			setError(fmt.Errorf("registration: %w", err))
			return
		}
		mu.Lock()
		result.Registration = *reg
		result.Jenis = reg.StatusLanjut
		mu.Unlock()
	}()

	// Query 3: SEP Info
	wg.Add(1)
	go func() {
		defer wg.Done()
		sep, _ := r.getSEPInfo(ctx, noRawat) // Not all have SEP
		if sep != nil {
			mu.Lock()
			result.SEP = sep
			mu.Unlock()
		}
	}()

	// Query 4: Diagnoses
	wg.Add(1)
	go func() {
		defer wg.Done()
		diagnoses, _ := r.getDiagnoses(ctx, noRawat)
		mu.Lock()
		result.Diagnoses = diagnoses
		mu.Unlock()
	}()

	// Query 5: Procedures
	wg.Add(1)
	go func() {
		defer wg.Done()
		procedures, _ := r.getProcedures(ctx, noRawat)
		mu.Lock()
		result.Procedures = procedures
		mu.Unlock()
	}()

	// Query 6: Resume (Ralan)
	wg.Add(1)
	go func() {
		defer wg.Done()
		resume, _ := r.getResumeRalan(ctx, noRawat)
		if resume != nil {
			mu.Lock()
			result.Resume = resume
			mu.Unlock()
		}
	}()

	// Query 7: Examinations (SOAP) - Ralan
	wg.Add(1)
	go func() {
		defer wg.Done()
		exams, _ := r.getExaminationsRalan(ctx, noRawat)
		mu.Lock()
		result.Examinations = append(result.Examinations, exams...)
		mu.Unlock()
	}()

	// Query 8: Treatments Ralan Dr
	wg.Add(1)
	go func() {
		defer wg.Done()
		treatments, _ := r.getTreatmentsRalanDr(ctx, noRawat)
		mu.Lock()
		result.TreatmentsRalanDr = treatments
		mu.Unlock()
	}()

	// Query 9: Treatments Ralan Pr
	wg.Add(1)
	go func() {
		defer wg.Done()
		treatments, _ := r.getTreatmentsRalanPr(ctx, noRawat)
		mu.Lock()
		result.TreatmentsRalanPr = treatments
		mu.Unlock()
	}()

	// Query 10: Rooms (Ranap)
	wg.Add(1)
	go func() {
		defer wg.Done()
		rooms, _ := r.getRooms(ctx, noRawat)
		mu.Lock()
		result.Rooms = rooms
		mu.Unlock()
	}()

	// Query 11: Radiology
	wg.Add(1)
	go func() {
		defer wg.Done()
		radiology, _ := r.getRadiology(ctx, noRawat)
		mu.Lock()
		result.Radiology = radiology
		mu.Unlock()
	}()

	// Query 12: Laboratory
	wg.Add(1)
	go func() {
		defer wg.Done()
		lab, _ := r.getLaboratory(ctx, noRawat)
		mu.Lock()
		result.Laboratory = lab
		mu.Unlock()
	}()

	// Query 13: Medicines Given
	wg.Add(1)
	go func() {
		defer wg.Done()
		meds, _ := r.getMedicinesGiven(ctx, noRawat)
		mu.Lock()
		result.MedicinesGiven = meds
		mu.Unlock()
	}()

	// Query 14: Medicines Home (Resep Pulang)
	wg.Add(1)
	go func() {
		defer wg.Done()
		meds, _ := r.getMedicinesHome(ctx, noRawat)
		mu.Lock()
		result.MedicinesHome = meds
		mu.Unlock()
	}()

	// Query 15: Documents
	wg.Add(1)
	go func() {
		defer wg.Done()
		docs, _ := r.getDocuments(ctx, noRawat)
		mu.Lock()
		result.Documents = docs
		mu.Unlock()
	}()

	// Query 16: Billing
	wg.Add(1)
	go func() {
		defer wg.Done()
		billing, _ := r.getBilling(ctx, noRawat)
		mu.Lock()
		result.Billing = billing
		mu.Unlock()
	}()

	wg.Wait()

	if firstErr != nil {
		return nil, firstErr
	}

	// Determine status based on mlite_vedika
	status, _ := r.getVedikaStatus(ctx, noRawat)
	result.Status = status

	return result, nil
}

// ==================== Individual Query Methods ====================

func (r *MySQLDetailRepository) getPatientInfo(ctx context.Context, noRawat string) (*entity.PatientInfo, error) {
	query := `
		SELECT 
			p.no_rkm_medis, p.nm_pasien, COALESCE(p.no_ktp, ''), p.jk, 
			COALESCE(DATE_FORMAT(p.tgl_lahir, '%Y-%m-%d'), ''), COALESCE(p.alamat, ''), 
			COALESCE(kel.nm_kel, ''), COALESCE(kec.nm_kec, ''), COALESCE(kab.nm_kab, ''),
			COALESCE(p.no_tlp, ''), COALESCE(p.pekerjaan, '')
		FROM reg_periksa rp
		INNER JOIN pasien p ON rp.no_rkm_medis = p.no_rkm_medis
		LEFT JOIN kelurahan kel ON p.kd_kel = kel.kd_kel
		LEFT JOIN kecamatan kec ON p.kd_kec = kec.kd_kec
		LEFT JOIN kabupaten kab ON p.kd_kab = kab.kd_kab
		WHERE rp.no_rawat = ?
	`
	var info entity.PatientInfo

	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&info.NoRkmMedis, &info.NamaPasien, &info.NoKTP, &info.JenisKelamin,
		&info.TglLahir, &info.Alamat,
		&info.Kelurahan, &info.Kecamatan, &info.Kabupaten,
		&info.NoTelp, &info.Pekerjaan,
	)
	if err != nil {
		return nil, err
	}

	return &info, nil
}

func (r *MySQLDetailRepository) getRegistrationInfo(ctx context.Context, noRawat string) (*entity.RegistrationInfo, error) {
	query := `
		SELECT 
			rp.no_rawat, DATE_FORMAT(rp.tgl_registrasi, '%Y-%m-%d'), COALESCE(rp.jam_reg, ''),
			d.nm_dokter, pol.nm_poli, pj.png_jawab,
			rp.status_lanjut, rp.stts
		FROM reg_periksa rp
		INNER JOIN dokter d ON rp.kd_dokter = d.kd_dokter
		INNER JOIN poliklinik pol ON rp.kd_poli = pol.kd_poli
		INNER JOIN penjab pj ON rp.kd_pj = pj.kd_pj
		WHERE rp.no_rawat = ?
	`
	var info entity.RegistrationInfo
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&info.NoRawat, &info.TglRegistrasi, &info.JamReg,
		&info.NamaDokter, &info.NamaPoli, &info.CaraBayar,
		&info.StatusLanjut, &info.Status,
	)
	if err != nil {
		return nil, err
	}
	return &info, nil
}

func (r *MySQLDetailRepository) getSEPInfo(ctx context.Context, noRawat string) (*entity.SEPInfo, error) {
	query := `
		SELECT 
			no_sep, nokartu, tglsep, 
			COALESCE(tglrujukan, ''), 
			COALESCE(DATE_ADD(tglrujukan, INTERVAL 85 DAY), ''),
			klsrawat, jnspelayanan,
			COALESCE(nmdiagnosaawal, ''), COALESCE(nmppkpelayanan, ''), 
			COALESCE(nmppkrujukan, ''), COALESCE(catatan, '')
		FROM bridging_sep
		WHERE no_rawat = ?
	`
	var info entity.SEPInfo
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&info.NoSEP, &info.NoKartu, &info.TglSEP,
		&info.TglRujukan, &info.BatasRujukan,
		&info.KelasRawat, &info.JnsRawat,
		&info.NmDiagnosa, &info.AsalRujukan,
		&info.NmRujukan, &info.Catatan,
	)
	if err != nil {
		return nil, err
	}
	return &info, nil
}

func (r *MySQLDetailRepository) getDiagnoses(ctx context.Context, noRawat string) ([]entity.DiagnosisItemFull, error) {
	query := `
		SELECT dp.kd_penyakit, COALESCE(p.nm_penyakit, ''), dp.status, dp.prioritas
		FROM diagnosa_pasien dp
		LEFT JOIN penyakit p ON dp.kd_penyakit = p.kd_penyakit
		WHERE dp.no_rawat = ?
		ORDER BY dp.prioritas ASC
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.DiagnosisItemFull
	for rows.Next() {
		var item entity.DiagnosisItemFull
		if err := rows.Scan(&item.KodePenyakit, &item.NamaPenyakit, &item.StatusDx, &item.Prioritas); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getProcedures(ctx context.Context, noRawat string) ([]entity.ProcedureItemFull, error) {
	query := `
		SELECT pp.kode, COALESCE(i.deskripsi_panjang, ''), pp.prioritas, COALESCE(pp.status, '')
		FROM prosedur_pasien pp
		LEFT JOIN icd9 i ON pp.kode = i.kode
		WHERE pp.no_rawat = ?
		ORDER BY pp.prioritas ASC
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.ProcedureItemFull
	for rows.Next() {
		var item entity.ProcedureItemFull
		if err := rows.Scan(&item.Kode, &item.Deskripsi, &item.Prioritas, &item.StatusProc); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getResumeRalan(ctx context.Context, noRawat string) (*entity.ResumeInfo, error) {
	query := `
		SELECT 
			rp.no_rawat, COALESCE(rp.keluhan, ''), COALESCE(rp.pemeriksaan, ''),
			COALESCE(rp.penilaian, ''), COALESCE(rp.rtl, ''), COALESCE(rp.instruksi, ''),
			d.nm_dokter
		FROM resume_pasien rp
		JOIN dokter d ON rp.kd_dokter = d.kd_dokter
		WHERE rp.no_rawat = ?
	`
	var info entity.ResumeInfo
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(
		&info.NoRawat, &info.KeluhanUtama, &info.PemeriksaanFisik,
		&info.DiagnosaAkhir, &info.Terapi, &info.Anjuran,
		&info.NmDokter,
	)
	if err != nil {
		return nil, err
	}
	return &info, nil
}

func (r *MySQLDetailRepository) getExaminationsRalan(ctx context.Context, noRawat string) ([]entity.ExaminationItem, error) {
	query := `
		SELECT 
			DATE(tgl_perawatan), jam_rawat,
			COALESCE(suhu_tubuh, ''), COALESCE(tensi, ''), COALESCE(nadi, ''),
			COALESCE(respirasi, ''), COALESCE(tinggi, ''), COALESCE(berat, ''),
			COALESCE(spo2, ''), COALESCE(gcs, ''), COALESCE(kesadaran, ''),
			COALESCE(keluhan, ''), COALESCE(pemeriksaan, ''), 
			COALESCE(penilaian, ''), COALESCE(rtl, ''),
			COALESCE(instruksi, ''), COALESCE(evaluasi, '')
		FROM pemeriksaan_ralan
		WHERE no_rawat = ?
		ORDER BY tgl_perawatan ASC, jam_rawat ASC
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.ExaminationItem
	for rows.Next() {
		var item entity.ExaminationItem
		if err := rows.Scan(
			&item.TglPerawatan, &item.JamRawat,
			&item.Suhu, &item.Tensi, &item.Nadi,
			&item.Respirasi, &item.Tinggi, &item.Berat,
			&item.SpO2, &item.GCS, &item.Kesadaran,
			&item.Keluhan, &item.Pemeriksaan,
			&item.Penilaian, &item.Rtl,
			&item.Instruksi, &item.Evaluasi,
		); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getTreatmentsRalanDr(ctx context.Context, noRawat string) ([]entity.TreatmentItem, error) {
	query := `
		SELECT 
			DATE(r.tgl_perawatan), r.jam_rawat, 
			j.nm_perawatan, d.nm_dokter, r.biaya_rawat
		FROM rawat_jl_dr r
		JOIN jns_perawatan j ON r.kd_jenis_prw = j.kd_jenis_prw
		JOIN dokter d ON r.kd_dokter = d.kd_dokter
		WHERE r.no_rawat = ?
		ORDER BY r.tgl_perawatan, r.jam_rawat
	`
	return r.queryTreatments(ctx, query, noRawat)
}

func (r *MySQLDetailRepository) getTreatmentsRalanPr(ctx context.Context, noRawat string) ([]entity.TreatmentItem, error) {
	query := `
		SELECT 
			DATE(r.tgl_perawatan), r.jam_rawat, 
			j.nm_perawatan, COALESCE(p.nama, ''), r.biaya_rawat
		FROM rawat_jl_pr r
		JOIN jns_perawatan j ON r.kd_jenis_prw = j.kd_jenis_prw
		LEFT JOIN petugas p ON r.nip = p.nip
		WHERE r.no_rawat = ?
		ORDER BY r.tgl_perawatan, r.jam_rawat
	`
	return r.queryTreatmentsNurse(ctx, query, noRawat)
}

func (r *MySQLDetailRepository) queryTreatments(ctx context.Context, query, noRawat string) ([]entity.TreatmentItem, error) {
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.TreatmentItem
	for rows.Next() {
		var item entity.TreatmentItem
		if err := rows.Scan(&item.TglPerawatan, &item.JamRawat, &item.NmPerawatan, &item.NmDokter, &item.Biaya); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) queryTreatmentsNurse(ctx context.Context, query, noRawat string) ([]entity.TreatmentItem, error) {
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.TreatmentItem
	for rows.Next() {
		var item entity.TreatmentItem
		if err := rows.Scan(&item.TglPerawatan, &item.JamRawat, &item.NmPerawatan, &item.NmPerawat, &item.Biaya); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getRooms(ctx context.Context, noRawat string) ([]entity.RoomInfo, error) {
	query := `
		SELECT 
			DATE(ki.tgl_masuk), ki.jam_masuk,
			COALESCE(DATE(ki.tgl_keluar), ''), COALESCE(ki.jam_keluar, ''),
			ki.kd_kamar, b.nm_bangsal, ki.ttl_biaya,
			ki.lama
		FROM kamar_inap ki
		JOIN kamar k ON ki.kd_kamar = k.kd_kamar
		JOIN bangsal b ON k.kd_bangsal = b.kd_bangsal
		WHERE ki.no_rawat = ?
		ORDER BY ki.tgl_masuk
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.RoomInfo
	for rows.Next() {
		var item entity.RoomInfo
		if err := rows.Scan(
			&item.TglMasuk, &item.JamMasuk,
			&item.TglKeluar, &item.JamKeluar,
			&item.KdKamar, &item.NmBangsal, &item.TotalBiaya,
			&item.LamaMenginap,
		); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getRadiology(ctx context.Context, noRawat string) ([]entity.RadiologyInfo, error) {
	query := `
		SELECT 
			DATE(pr.tgl_periksa), pr.jam,
			j.nm_perawatan, d.nm_dokter, COALESCE(p.nama, ''),
			COALESCE(hr.hasil, ''), pr.biaya
		FROM periksa_radiologi pr
		JOIN jns_perawatan_radiologi j ON pr.kd_jenis_prw = j.kd_jenis_prw
		JOIN dokter d ON pr.kd_dokter = d.kd_dokter
		LEFT JOIN petugas p ON pr.nip = p.nip
		LEFT JOIN hasil_radiologi hr ON pr.no_rawat = hr.no_rawat AND pr.tgl_periksa = hr.tgl_periksa
		WHERE pr.no_rawat = ?
		ORDER BY pr.tgl_periksa
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.RadiologyInfo
	for rows.Next() {
		var item entity.RadiologyInfo
		if err := rows.Scan(
			&item.TglPeriksa, &item.JamPeriksa,
			&item.NmPerawatan, &item.NmDokter, &item.NmPetugas,
			&item.Hasil, &item.Biaya,
		); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getLaboratory(ctx context.Context, noRawat string) ([]entity.LabInfo, error) {
	query := `
		SELECT 
			DATE(pl.tgl_periksa), pl.jam,
			j.nm_perawatan, COALESCE(d.nm_dokter, ''), pl.biaya
		FROM periksa_lab pl
		JOIN jns_perawatan_lab j ON pl.kd_jenis_prw = j.kd_jenis_prw
		LEFT JOIN dokter d ON pl.kd_dokter = d.kd_dokter
		WHERE pl.no_rawat = ?
		ORDER BY pl.tgl_periksa
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.LabInfo
	for rows.Next() {
		var item entity.LabInfo
		if err := rows.Scan(
			&item.TglPeriksa, &item.JamPeriksa,
			&item.NmPerawatan, &item.NmDokter, &item.Biaya,
		); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getMedicinesGiven(ctx context.Context, noRawat string) ([]entity.MedicineInfo, error) {
	query := `
		SELECT 
			DATE(dpo.tgl_perawatan), dpo.jam,
			db.nama_brng, dpo.jml, COALESCE(db.satuan, ''), 
			COALESCE(dpo.dosis, ''), dpo.total
		FROM detail_pemberian_obat dpo
		JOIN databarang db ON dpo.kode_brng = db.kode_brng
		WHERE dpo.no_rawat = ?
		ORDER BY dpo.tgl_perawatan, dpo.jam
	`
	return r.queryMedicines(ctx, query, noRawat)
}

func (r *MySQLDetailRepository) getMedicinesHome(ctx context.Context, noRawat string) ([]entity.MedicineInfo, error) {
	query := `
		SELECT 
			DATE(rp.tgl_peresepan), '',
			db.nama_brng, rp.jml, COALESCE(db.satuan, ''), 
			COALESCE(rp.dosis, ''), rp.total
		FROM resep_pulang rp
		JOIN databarang db ON rp.kode_brng = db.kode_brng
		WHERE rp.no_rawat = ?
		ORDER BY rp.tgl_peresepan
	`
	return r.queryMedicines(ctx, query, noRawat)
}

func (r *MySQLDetailRepository) queryMedicines(ctx context.Context, query, noRawat string) ([]entity.MedicineInfo, error) {
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.MedicineInfo
	for rows.Next() {
		var item entity.MedicineInfo
		if err := rows.Scan(
			&item.TglPerawatan, &item.JamPerawatan,
			&item.NamaObat, &item.Jumlah, &item.Satuan,
			&item.Dosis, &item.TotalBiaya,
		); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getDocuments(ctx context.Context, noRawat string) ([]entity.DocumentInfoFull, error) {
	query := `
		SELECT 
			bdp.kode, mbd.nama, bdp.lokasi_file
		FROM berkas_digital_perawatan bdp
		JOIN master_berkas_digital mbd ON bdp.kode = mbd.kode
		WHERE bdp.no_rawat = ?
		ORDER BY mbd.nama
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.DocumentInfoFull
	for rows.Next() {
		var item entity.DocumentInfoFull
		if err := rows.Scan(&item.Kode, &item.NamaBerkas, &item.Lokasi); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getBilling(ctx context.Context, noRawat string) ([]entity.BillingItem, error) {
	query := `
		SELECT 
			no, nm_perawatan, COALESCE(pemisah, ''), 
			biaya, jumlah, COALESCE(tambahan, 0), totalbiaya
		FROM billing
		WHERE no_rawat = ?
		ORDER BY no
	`
	rows, err := r.db.QueryContext(ctx, query, noRawat)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.BillingItem
	for rows.Next() {
		var item entity.BillingItem
		if err := rows.Scan(
			&item.No, &item.NmPerawatan, &item.Pemisah,
			&item.Biaya, &item.Jumlah, &item.Tambahan, &item.TotalBiaya,
		); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *MySQLDetailRepository) getVedikaStatus(ctx context.Context, noRawat string) (entity.ClaimStatus, error) {
	query := `SELECT status FROM mlite_vedika WHERE no_rawat = ? LIMIT 1`
	var status string
	err := r.db.QueryRowContext(ctx, query, noRawat).Scan(&status)
	if err == sql.ErrNoRows {
		return entity.StatusRencana, nil
	}
	if err != nil {
		return entity.StatusRencana, err
	}
	return entity.ClaimStatus(status), nil
}
