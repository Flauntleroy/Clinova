package handler

import (
	"github.com/gin-gonic/gin"

	"github.com/clinova/simrs/backend/internal/vedika/service"
	"github.com/clinova/simrs/backend/pkg/audit"
	"github.com/clinova/simrs/backend/pkg/response"
)

// DashboardHandler handles dashboard HTTP requests.
type DashboardHandler struct {
	dashboardSvc *service.DashboardService
}

// NewDashboardHandler creates a new dashboard handler.
func NewDashboardHandler(dashboardSvc *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardSvc: dashboardSvc}
}

// GetDashboard handles GET /admin/vedika/dashboard
// Returns summary cards with rencana, pengajuan, and maturasi counts.
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	actor := getActor(c)
	ip := c.ClientIP()

	summary, err := h.dashboardSvc.GetDashboardSummary(c.Request.Context(), actor, ip)
	if err != nil {
		handleVedikaError(c, err)
		return
	}

	response.Success(c, gin.H{
		"period":  summary.Period,
		"summary": summary,
	})
}

// GetDashboardTrend handles GET /admin/vedika/dashboard/trend
// Returns daily aggregation data for charts.
func (h *DashboardHandler) GetDashboardTrend(c *gin.Context) {
	actor := getActor(c)
	ip := c.ClientIP()

	trend, err := h.dashboardSvc.GetDashboardTrend(c.Request.Context(), actor, ip)
	if err != nil {
		handleVedikaError(c, err)
		return
	}

	response.Success(c, gin.H{
		"trend": trend,
	})
}

// getActor extracts audit actor from gin context.
func getActor(c *gin.Context) audit.Actor {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")

	return audit.Actor{
		UserID:   userID.(string),
		Username: username.(string),
	}
}
