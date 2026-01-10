// Package response provides standardized API response structures.
package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

const (
	ErrCodeInvalidCredentials = "INVALID_CREDENTIALS"
	ErrCodeUserNotFound       = "USER_NOT_FOUND"
	ErrCodeUserInactive       = "USER_INACTIVE"
	ErrCodeInvalidToken       = "INVALID_TOKEN"
	ErrCodeExpiredToken       = "EXPIRED_TOKEN"
	ErrCodeSessionRevoked     = "SESSION_REVOKED"
	ErrCodePermissionDenied   = "PERMISSION_DENIED"
	ErrCodeValidationError    = "VALIDATION_ERROR"
	ErrCodeInternalError      = "INTERNAL_ERROR"
)

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{Success: true, Data: data})
}

func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{Success: true, Message: message, Data: data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{Success: true, Data: data})
}

func Error(c *gin.Context, statusCode int, code, message string) {
	c.JSON(statusCode, Response{Success: false, Error: &ErrorInfo{Code: code, Message: message}})
}

func BadRequest(c *gin.Context, code, message string) {
	Error(c, http.StatusBadRequest, code, message)
}

func Unauthorized(c *gin.Context, code, message string) {
	Error(c, http.StatusUnauthorized, code, message)
}

func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, ErrCodePermissionDenied, message)
}

func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, "NOT_FOUND", message)
}

func InternalServerError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, ErrCodeInternalError, message)
}
