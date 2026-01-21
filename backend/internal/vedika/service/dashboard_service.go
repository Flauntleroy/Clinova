// Package service contains business logic for the Vedika module.
package service

import (
	"context"
	"fmt"
	"sync"

	"github.com/clinova/simrs/backend/internal/vedika/entity"
	"github.com/clinova/simrs/backend/internal/vedika/repository"
	"github.com/clinova/simrs/backend/pkg/audit"
)

// DashboardService handles dashboard business logic.
type DashboardService struct {
	settingsRepo  repository.SettingsRepository
	dashboardRepo repository.DashboardRepository
	auditLogger   *audit.Logger
}

// NewDashboardService creates a new dashboard service.
func NewDashboardService(
	settingsRepo repository.SettingsRepository,
	dashboardRepo repository.DashboardRepository,
	auditLogger *audit.Logger,
) *DashboardService {
	return &DashboardService{
		settingsRepo:  settingsRepo,
		dashboardRepo: dashboardRepo,
		auditLogger:   auditLogger,
	}
}

// GetDashboardSummary returns the dashboard summary with all counts and maturasi.
// OPTIMIZED: Uses parallel execution for independent database queries.
func (s *DashboardService) GetDashboardSummary(ctx context.Context, actor audit.Actor, ip string) (*entity.DashboardSummary, error) {
	// Get required settings (must be sequential as other queries depend on these)
	period, err := s.settingsRepo.GetActivePeriod(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active period: %w", err)
	}

	carabayar, err := s.settingsRepo.GetAllowedCarabayar(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get allowed carabayar: %w", err)
	}

	// Execute all count queries in parallel
	var (
		wg                sync.WaitGroup
		rencanaRalan      int
		rencanaRanap      int
		pengajuanRalan    int
		pengajuanRanap    int
		errRencanaRalan   error
		errRencanaRanap   error
		errPengajuanRalan error
		errPengajuanRanap error
	)

	wg.Add(4)

	// Count rencana ralan
	go func() {
		defer wg.Done()
		rencanaRalan, errRencanaRalan = s.dashboardRepo.CountRencanaRalan(ctx, period, carabayar)
	}()

	// Count rencana ranap
	go func() {
		defer wg.Done()
		rencanaRanap, errRencanaRanap = s.dashboardRepo.CountRencanaRanap(ctx, period, carabayar)
	}()

	// Count pengajuan ralan
	go func() {
		defer wg.Done()
		pengajuanRalan, errPengajuanRalan = s.dashboardRepo.CountPengajuanByJenis(ctx, period, entity.JenisRalan)
	}()

	// Count pengajuan ranap
	go func() {
		defer wg.Done()
		pengajuanRanap, errPengajuanRanap = s.dashboardRepo.CountPengajuanByJenis(ctx, period, entity.JenisRanap)
	}()

	wg.Wait()

	// Check for errors
	if errRencanaRalan != nil {
		return nil, fmt.Errorf("failed to count rencana ralan: %w", errRencanaRalan)
	}
	if errRencanaRanap != nil {
		return nil, fmt.Errorf("failed to count rencana ranap: %w", errRencanaRanap)
	}
	if errPengajuanRalan != nil {
		return nil, fmt.Errorf("failed to count pengajuan ralan: %w", errPengajuanRalan)
	}
	if errPengajuanRanap != nil {
		return nil, fmt.Errorf("failed to count pengajuan ranap: %w", errPengajuanRanap)
	}

	// Calculate maturasi
	// Total rencana = rencana (not submitted) + pengajuan (already submitted)
	totalRencanaRalan := rencanaRalan + pengajuanRalan
	totalRencanaRanap := rencanaRanap + pengajuanRanap

	var maturasi entity.MaturasiPersen
	if totalRencanaRalan > 0 {
		maturasi.Ralan = float64(pengajuanRalan) / float64(totalRencanaRalan) * 100
	}
	if totalRencanaRanap > 0 {
		maturasi.Ranap = float64(pengajuanRanap) / float64(totalRencanaRanap) * 100
	}

	summary := &entity.DashboardSummary{
		Period: period,
		Rencana: entity.ClaimCount{
			Ralan: totalRencanaRalan,
			Ranap: totalRencanaRanap,
		},
		Pengajuan: entity.ClaimCount{
			Ralan: pengajuanRalan,
			Ranap: pengajuanRanap,
		},
		Maturasi: maturasi,
	}

	// Write audit log (async, non-blocking)
	go s.auditLogger.LogInsert(audit.InsertParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "dashboard",
			PrimaryKey: map[string]string{"period": period},
		},
		InsertedData: map[string]interface{}{
			"action": "view_dashboard",
			"period": period,
		},
		BusinessKey: period,
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Melihat dashboard Vedika periode %s", period),
	})

	return summary, nil
}

// GetDashboardTrend returns daily trend data for the dashboard chart.
func (s *DashboardService) GetDashboardTrend(ctx context.Context, actor audit.Actor, ip string) ([]entity.DashboardTrendItem, error) {
	period, err := s.settingsRepo.GetActivePeriod(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active period: %w", err)
	}

	carabayar, err := s.settingsRepo.GetAllowedCarabayar(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get allowed carabayar: %w", err)
	}

	trend, err := s.dashboardRepo.GetDailyTrend(ctx, period, carabayar)
	if err != nil {
		return nil, fmt.Errorf("failed to get daily trend: %w", err)
	}

	return trend, nil
}
