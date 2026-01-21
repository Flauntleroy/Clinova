package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/clinova/simrs/backend/internal/vedika/entity"
)

// DashboardRepository handles dashboard-specific data access.
// Uses active_period from mera_settings.
type DashboardRepository interface {
	CountRencanaRalan(ctx context.Context, period string, carabayar []string) (int, error)
	CountRencanaRanap(ctx context.Context, period string, carabayar []string) (int, error)
	CountPengajuanByJenis(ctx context.Context, period string, jenis entity.JenisPelayanan) (int, error)
	GetDailyTrend(ctx context.Context, period string, carabayar []string) ([]entity.DashboardTrendItem, error)
}

// MySQLDashboardRepository implements DashboardRepository.
type MySQLDashboardRepository struct {
	db *sql.DB
}

// NewMySQLDashboardRepository creates a new dashboard repository.
func NewMySQLDashboardRepository(db *sql.DB) *MySQLDashboardRepository {
	return &MySQLDashboardRepository{db: db}
}

// buildPlaceholders creates SQL placeholders for IN clause.
func buildPlaceholders(count int) string {
	if count == 0 {
		return "''"
	}
	placeholders := make([]string, count)
	for i := range placeholders {
		placeholders[i] = "?"
	}
	return strings.Join(placeholders, ",")
}

// toInterfaceSlice converts string slice to interface slice for query args.
func toInterfaceSlice(s []string) []interface{} {
	result := make([]interface{}, len(s))
	for i, v := range s {
		result[i] = v
	}
	return result
}

// CountRencanaRalan counts RALAN episodes not in mlite_vedika.
// Uses reg_periksa.tgl_registrasi for period filtering.
func (r *MySQLDashboardRepository) CountRencanaRalan(ctx context.Context, period string, carabayar []string) (int, error) {
	if len(carabayar) == 0 {
		return 0, nil
	}

	query := fmt.Sprintf(`
		SELECT COUNT(*) FROM reg_periksa rp
		INNER JOIN penjab pj ON rp.kd_pj = pj.kd_pj
		WHERE pj.kd_pj IN (%s)
		  AND DATE_FORMAT(rp.tgl_registrasi, '%%Y-%%m') = ?
		  AND rp.status_lanjut = 'Ralan'
		  AND rp.stts != 'Batal'
		  AND rp.no_rawat NOT IN (SELECT no_rawat FROM mlite_vedika WHERE jenis = '2')
	`, buildPlaceholders(len(carabayar)))

	args := append(toInterfaceSlice(carabayar), period)

	var count int
	if err := r.db.QueryRowContext(ctx, query, args...).Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count rencana ralan: %w", err)
	}

	return count, nil
}

// CountRencanaRanap counts RANAP episodes not in mlite_vedika.
// Uses kamar_inap.tgl_keluar for period filtering. Only includes discharged patients.
func (r *MySQLDashboardRepository) CountRencanaRanap(ctx context.Context, period string, carabayar []string) (int, error) {
	if len(carabayar) == 0 {
		return 0, nil
	}

	query := fmt.Sprintf(`
		SELECT COUNT(DISTINCT rp.no_rawat) FROM reg_periksa rp
		INNER JOIN penjab pj ON rp.kd_pj = pj.kd_pj
		INNER JOIN kamar_inap ki ON rp.no_rawat = ki.no_rawat
		WHERE pj.kd_pj IN (%s)
		  AND ki.tgl_keluar IS NOT NULL
		  AND DATE_FORMAT(ki.tgl_keluar, '%%Y-%%m') = ?
		  AND rp.status_lanjut = 'Ranap'
		  AND rp.stts != 'Batal'
		  AND rp.no_rawat NOT IN (SELECT no_rawat FROM mlite_vedika WHERE jenis = '1')
	`, buildPlaceholders(len(carabayar)))

	args := append(toInterfaceSlice(carabayar), period)

	var count int
	if err := r.db.QueryRowContext(ctx, query, args...).Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count rencana ranap: %w", err)
	}

	return count, nil
}

// CountPengajuanByJenis counts episodes in mlite_vedika by jenis.
func (r *MySQLDashboardRepository) CountPengajuanByJenis(ctx context.Context, period string, jenis entity.JenisPelayanan) (int, error) {
	query := `
		SELECT COUNT(*) FROM mlite_vedika
		WHERE DATE_FORMAT(tgl_registrasi, '%Y-%m') = ?
		  AND jenis = ?
	`

	var count int
	if err := r.db.QueryRowContext(ctx, query, period, jenis.ToDBValue()).Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count pengajuan: %w", err)
	}

	return count, nil
}

// GetDailyTrend returns daily aggregation data for the dashboard chart.
func (r *MySQLDashboardRepository) GetDailyTrend(ctx context.Context, period string, carabayar []string) ([]entity.DashboardTrendItem, error) {
	if len(carabayar) == 0 {
		return []entity.DashboardTrendItem{}, nil
	}

	// Get all days in the period
	daysQuery := `
		SELECT DISTINCT DATE(tgl_registrasi) as day
		FROM reg_periksa
		WHERE DATE_FORMAT(tgl_registrasi, '%Y-%m') = ?
		ORDER BY day
	`

	rows, err := r.db.QueryContext(ctx, daysQuery, period)
	if err != nil {
		return nil, fmt.Errorf("failed to get days: %w", err)
	}
	defer rows.Close()

	var days []string
	for rows.Next() {
		var day string
		if err := rows.Scan(&day); err != nil {
			return nil, fmt.Errorf("failed to scan day: %w", err)
		}
		days = append(days, day)
	}

	// For each day, count rencana and pengajuan
	var trend []entity.DashboardTrendItem
	for _, day := range days {
		item := entity.DashboardTrendItem{Date: day}

		// Count rencana ralan for this day
		ralanQuery := fmt.Sprintf(`
			SELECT COUNT(*) FROM reg_periksa rp
			INNER JOIN penjab pj ON rp.kd_pj = pj.kd_pj
			WHERE pj.kd_pj IN (%s)
			  AND DATE(rp.tgl_registrasi) = ?
			  AND rp.status_lanjut = 'Ralan'
			  AND rp.stts != 'Batal'
		`, buildPlaceholders(len(carabayar)))

		args := append(toInterfaceSlice(carabayar), day)
		r.db.QueryRowContext(ctx, ralanQuery, args...).Scan(&item.Rencana.Ralan)

		// Count pengajuan ralan for this day
		r.db.QueryRowContext(ctx, `
			SELECT COUNT(*) FROM mlite_vedika
			WHERE DATE(tgl_registrasi) = ? AND jenis = '2'
		`, day).Scan(&item.Pengajuan.Ralan)

		// Count pengajuan ranap for this day
		r.db.QueryRowContext(ctx, `
			SELECT COUNT(*) FROM mlite_vedika
			WHERE DATE(tgl_registrasi) = ? AND jenis = '1'
		`, day).Scan(&item.Pengajuan.Ranap)

		trend = append(trend, item)
	}

	if trend == nil {
		trend = []entity.DashboardTrendItem{}
	}

	return trend, nil
}
