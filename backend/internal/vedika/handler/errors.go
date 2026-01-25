package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/clinova/simrs/backend/internal/vedika/repository"
	"github.com/clinova/simrs/backend/pkg/response"
)

// handleVedikaError handles common Vedika errors and returns appropriate HTTP responses.
func handleVedikaError(c *gin.Context, err error) {
	if errors.Is(err, repository.ErrSettingNotFound) {
		// Extract setting name from error
		settingName := "unknown"
		if strings.Contains(err.Error(), "active_period") {
			settingName = "active_period"
		} else if strings.Contains(err.Error(), "allowed_carabayar") {
			settingName = "allowed_carabayar"
		}

		response.Error(c, http.StatusServiceUnavailable, "VEDIKA_SETTINGS_MISSING",
			"Required setting '"+settingName+"' is not configured. Please contact administrator.")
		return
	}

	// Generic error
	// Log to console for easier debugging since we can't see server logs easily
	println("VEDIKA_ERROR:", err.Error())
	response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
}
