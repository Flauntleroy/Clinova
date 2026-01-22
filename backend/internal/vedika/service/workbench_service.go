package service

import (
	"context"
	"fmt"
	"log"

	"github.com/clinova/simrs/backend/internal/vedika/entity"
	"github.com/clinova/simrs/backend/internal/vedika/repository"
	"github.com/clinova/simrs/backend/pkg/audit"
)

// WorkbenchService handles Index workbench business logic.
// Uses explicit date range filtering, NOT active_period.
type WorkbenchService struct {
	indexRepo   repository.IndexRepository
	detailRepo  repository.DetailRepository
	auditLogger *audit.Logger
}

// NewWorkbenchService creates a new workbench service.
func NewWorkbenchService(
	indexRepo repository.IndexRepository,
	detailRepo repository.DetailRepository,
	auditLogger *audit.Logger,
) *WorkbenchService {
	return &WorkbenchService{
		indexRepo:   indexRepo,
		detailRepo:  detailRepo,
		auditLogger: auditLogger,
	}
}

// ListIndex lists episodes by date range and status.
func (s *WorkbenchService) ListIndex(ctx context.Context, filter entity.IndexFilter, actor audit.Actor, ip string) (*entity.PaginatedResult[entity.ClaimEpisode], error) {
	// Validate required filters
	if filter.DateFrom == "" || filter.DateTo == "" {
		return nil, fmt.Errorf("date_from and date_to are required")
	}
	if filter.Status == "" {
		return nil, fmt.Errorf("status is required")
	}

	// Set defaults
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = 10
	}

	result, err := s.indexRepo.ListByDateRange(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list index: %w", err)
	}

	// Audit log - READ
	s.auditLogger.LogInsert(audit.InsertParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "index",
			PrimaryKey: map[string]string{"date_from": filter.DateFrom, "date_to": filter.DateTo},
		},
		InsertedData: map[string]interface{}{
			"action":    "list_index",
			"status":    string(filter.Status),
			"jenis":     string(filter.Jenis),
			"date_from": filter.DateFrom,
			"date_to":   filter.DateTo,
			"page":      filter.Page,
		},
		BusinessKey: fmt.Sprintf("%s_%s", filter.DateFrom, filter.DateTo),
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Melihat daftar klaim status %s periode %s s/d %s", filter.Status, filter.DateFrom, filter.DateTo),
	})

	return result, nil
}

// GetClaimDetailFull returns comprehensive claim context with all 23 data categories.
func (s *WorkbenchService) GetClaimDetailFull(ctx context.Context, noRawat string, actor audit.Actor, ip string) (*entity.ClaimDetailFull, error) {
	detail, err := s.detailRepo.GetFullClaimDetail(ctx, noRawat)
	if err != nil {
		// Debug logging - will show in console
		log.Printf("ERROR GetClaimDetailFull for no_rawat=%s: %v", noRawat, err)
		return nil, fmt.Errorf("failed to get claim detail: %w", err)
	}

	// Audit log - READ
	s.auditLogger.LogInsert(audit.InsertParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "claim",
			PrimaryKey: map[string]string{"no_rawat": noRawat},
		},
		InsertedData: map[string]interface{}{
			"action":   "view_claim_detail_full",
			"no_rawat": noRawat,
		},
		BusinessKey: noRawat,
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Melihat detail lengkap klaim %s", noRawat),
	})

	return detail, nil
}

// GetClaimDetail returns full claim context (legacy, use GetClaimDetailFull for comprehensive data).
func (s *WorkbenchService) GetClaimDetail(ctx context.Context, noRawat string, actor audit.Actor, ip string) (*entity.ClaimDetail, error) {
	detail, err := s.indexRepo.GetClaimDetail(ctx, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get claim detail: %w", err)
	}

	// Audit log - READ
	s.auditLogger.LogInsert(audit.InsertParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "claim",
			PrimaryKey: map[string]string{"no_rawat": noRawat},
		},
		InsertedData: map[string]interface{}{
			"action":   "view_claim_detail",
			"no_rawat": noRawat,
		},
		BusinessKey: noRawat,
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Melihat detail klaim %s", noRawat),
	})

	return detail, nil
}

// UpdateClaimStatus updates the status of a claim.
func (s *WorkbenchService) UpdateClaimStatus(ctx context.Context, noRawat string, req entity.StatusUpdateRequest, actor audit.Actor, ip string) error {
	// Validate status
	if !req.Status.IsValid() {
		return fmt.Errorf("invalid status: %s", req.Status)
	}

	// Get current status for audit
	oldStatus, _ := s.indexRepo.GetEpisodeStatus(ctx, noRawat)

	// Update status
	if err := s.indexRepo.UpdateClaimStatus(ctx, noRawat, req.Status, actor.Username, req.Catatan); err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}

	// Audit log - WRITE
	s.auditLogger.LogUpdate(audit.UpdateParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "mlite_vedika",
			PrimaryKey: map[string]string{"no_rawat": noRawat},
		},
		ChangedColumns: map[string]audit.ColumnChange{
			"status": {Old: string(oldStatus), New: string(req.Status)},
		},
		Where:       map[string]interface{}{"no_rawat": noRawat},
		BusinessKey: noRawat,
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Mengubah status klaim %s dari %s ke %s", noRawat, oldStatus, req.Status),
	})

	return nil
}

// UpdateDiagnosis updates or adds a diagnosis.
func (s *WorkbenchService) UpdateDiagnosis(ctx context.Context, noRawat string, req entity.DiagnosisUpdateRequest, actor audit.Actor, ip string) error {
	if err := s.indexRepo.AddDiagnosis(ctx, noRawat, req); err != nil {
		return fmt.Errorf("failed to update diagnosis: %w", err)
	}

	// Audit log - WRITE (do NOT log diagnosis text)
	s.auditLogger.LogInsert(audit.InsertParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "diagnosa_pasien",
			PrimaryKey: map[string]string{"no_rawat": noRawat, "kd_penyakit": req.KodePenyakit},
		},
		InsertedData: map[string]interface{}{
			"action":      "update_diagnosis",
			"kd_penyakit": req.KodePenyakit,
			"status_dx":   req.StatusDx,
		},
		BusinessKey: noRawat,
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Mengubah diagnosa klaim %s: %s", noRawat, req.KodePenyakit),
	})

	return nil
}

// UpdateProcedure updates or adds a procedure.
func (s *WorkbenchService) UpdateProcedure(ctx context.Context, noRawat string, req entity.ProcedureUpdateRequest, actor audit.Actor, ip string) error {
	if err := s.indexRepo.AddProcedure(ctx, noRawat, req); err != nil {
		return fmt.Errorf("failed to update procedure: %w", err)
	}

	// Audit log - WRITE (do NOT log procedure text)
	s.auditLogger.LogInsert(audit.InsertParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "prosedur_pasien",
			PrimaryKey: map[string]string{"no_rawat": noRawat, "kode": req.Kode},
		},
		InsertedData: map[string]interface{}{
			"action": "update_procedure",
			"kode":   req.Kode,
		},
		BusinessKey: noRawat,
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Mengubah prosedur klaim %s: %s", noRawat, req.Kode),
	})

	return nil
}

// GetResume returns medical resume.
func (s *WorkbenchService) GetResume(ctx context.Context, noRawat string, actor audit.Actor, ip string) (*entity.MedicalResume, error) {
	resume, err := s.indexRepo.GetResume(ctx, noRawat)
	if err != nil {
		return nil, fmt.Errorf("failed to get resume: %w", err)
	}

	// Audit log - READ
	s.auditLogger.LogInsert(audit.InsertParams{
		Module: "vedika",
		Entity: audit.Entity{
			Table:      "resume",
			PrimaryKey: map[string]string{"no_rawat": noRawat},
		},
		InsertedData: map[string]interface{}{
			"action":   "view_resume",
			"no_rawat": noRawat,
		},
		BusinessKey: noRawat,
		Actor:       actor,
		IP:          ip,
		Summary:     fmt.Sprintf("Melihat resume medis %s", noRawat),
	})

	return resume, nil
}
