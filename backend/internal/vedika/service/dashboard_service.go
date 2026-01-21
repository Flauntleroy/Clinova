// Package service contains business logic for the Vedika module.
package service

import (
	"context"
	"fmt"

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
func (s *DashboardService) GetDashboardSummary(ctx context.Context, actor audit.Actor, ip string) (*entity.DashboardSummary, error) {
	// Get required settings
	period, err := s.settingsRepo.GetActivePeriod(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active period: %w", err)
	}

	carabayar, err := s.settingsRepo.GetAllowedCarabayar(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get allowed carabayar: %w", err)
	}

	// Count rencana klaim
	rencanaRalan, err := s.dashboardRepo.CountRencanaRalan(ctx, period, carabayar)
	if err != nil {
		return nil, fmt.Errorf("failed to count rencana ralan: %w", err)
	}

	rencanaRanap, err := s.dashboardRepo.CountRencanaRanap(ctx, period, carabayar)
	if err != nil {
		return nil, fmt.Errorf("failed to count rencana ranap: %w", err)
	}

	// Count pengajuan klaim
	pengajuanRalan, err := s.dashboardRepo.CountPengajuanByJenis(ctx, period, entity.JenisRalan)
	if err != nil {
		return nil, fmt.Errorf("failed to count pengajuan ralan: %w", err)
	}

	pengajuanRanap, err := s.dashboardRepo.CountPengajuanByJenis(ctx, period, entity.JenisRanap)
	if err != nil {
		return nil, fmt.Errorf("failed to count pengajuan ranap: %w", err)
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

	// Write audit log
	s.auditLogger.LogInsert(audit.InsertParams{
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
