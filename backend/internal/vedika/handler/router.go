// Package handler contains HTTP handlers for the Vedika module.
package handler

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"github.com/clinova/simrs/backend/internal/auth/handler/middleware"
	"github.com/clinova/simrs/backend/internal/auth/service"
	"github.com/clinova/simrs/backend/internal/vedika/repository"
	vedikaService "github.com/clinova/simrs/backend/internal/vedika/service"
	"github.com/clinova/simrs/backend/pkg/audit"
)

// Router handles Vedika route setup.
type Router struct {
	dashboardHandler *DashboardHandler
	workbenchHandler *WorkbenchHandler
	jwtMiddleware    *middleware.JWTMiddleware
	permMiddleware   *middleware.PermissionMiddleware
}

// NewRouter creates a new Vedika router.
func NewRouter(
	db *sql.DB,
	auditLogger *audit.Logger,
	jwtMiddleware *middleware.JWTMiddleware,
	permMiddleware *middleware.PermissionMiddleware,
) *Router {
	// Initialize repositories
	settingsRepo := repository.NewMySQLSettingsRepository(db)
	dashboardRepo := repository.NewMySQLDashboardRepository(db)
	indexRepo := repository.NewMySQLIndexRepository(db)
	detailRepo := repository.NewMySQLDetailRepository(db)

	// Initialize services
	dashboardSvc := vedikaService.NewDashboardService(settingsRepo, dashboardRepo, auditLogger)
	workbenchSvc := vedikaService.NewWorkbenchService(indexRepo, detailRepo, auditLogger)

	return &Router{
		dashboardHandler: NewDashboardHandler(dashboardSvc),
		workbenchHandler: NewWorkbenchHandler(workbenchSvc),
		jwtMiddleware:    jwtMiddleware,
		permMiddleware:   permMiddleware,
	}
}

// RegisterRoutes registers Vedika routes on the given engine.
func (r *Router) RegisterRoutes(engine *gin.Engine, permissionService *service.PermissionService) {
	vedika := engine.Group("/admin/vedika")
	vedika.Use(r.jwtMiddleware.Authenticate())
	{
		// Dashboard endpoints (require vedika.read)
		dashboard := vedika.Group("")
		dashboard.Use(r.permMiddleware.RequirePermission("vedika.read"))
		{
			dashboard.GET("/dashboard", r.dashboardHandler.GetDashboard)
			dashboard.GET("/dashboard/trend", r.dashboardHandler.GetDashboardTrend)
		}

		// Index workbench - list endpoints (require vedika.read)
		index := vedika.Group("")
		index.Use(r.permMiddleware.RequirePermission("vedika.read"))
		{
			index.GET("/index", r.workbenchHandler.ListIndex)
		}

		// Claim detail - uses wildcard because no_rawat contains slashes
		// e.g., /claim/2025/12/29/000045
		claim := vedika.Group("/claim")
		{
			claim.GET("/*no_rawat", r.permMiddleware.RequirePermission("vedika.claim.read"), r.workbenchHandler.GetClaimDetail)
		}

		// Claim actions - use query parameter for no_rawat to avoid wildcard issues
		// e.g., /claim-action/status?no_rawat=2025/12/29/000045
		claimAction := vedika.Group("/claim-action")
		{
			claimAction.POST("/status", r.permMiddleware.RequirePermission("vedika.claim.update_status"), r.workbenchHandler.UpdateStatus)
			claimAction.POST("/diagnosis", r.permMiddleware.RequirePermission("vedika.claim.edit_medical_data"), r.workbenchHandler.UpdateDiagnosis)
			claimAction.POST("/procedure", r.permMiddleware.RequirePermission("vedika.claim.edit_medical_data"), r.workbenchHandler.UpdateProcedure)
			claimAction.POST("/documents", r.permMiddleware.RequirePermission("vedika.claim.upload_document"), r.workbenchHandler.UploadDocument)
			claimAction.GET("/resume", r.permMiddleware.RequirePermission("vedika.claim.read_resume"), r.workbenchHandler.GetResume)
		}
	}
}
