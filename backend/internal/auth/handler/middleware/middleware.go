// Package middleware provides HTTP middleware.
package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/clinova/simrs/backend/internal/auth/service"
	"github.com/clinova/simrs/backend/pkg/jwt"
	"github.com/clinova/simrs/backend/pkg/response"
)

const (
	ContextKeyUserID    = "user_id"
	ContextKeySessionID = "session_id"
	ContextKeyPermCache = "permission_cache"
)

type JWTMiddleware struct {
	jwtManager     *jwt.Manager
	sessionService *service.SessionService
}

func NewJWTMiddleware(jwtManager *jwt.Manager, sessionService *service.SessionService) *JWTMiddleware {
	return &JWTMiddleware{jwtManager: jwtManager, sessionService: sessionService}
}

func (m *JWTMiddleware) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, response.ErrCodeInvalidToken, "Missing authorization header")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Unauthorized(c, response.ErrCodeInvalidToken, "Invalid authorization header format")
			c.Abort()
			return
		}

		claims, err := m.jwtManager.ValidateAccessToken(parts[1])
		if err != nil {
			if err == jwt.ErrExpiredToken {
				response.Unauthorized(c, response.ErrCodeExpiredToken, "Token has expired")
			} else {
				response.Unauthorized(c, response.ErrCodeInvalidToken, "Invalid token")
			}
			c.Abort()
			return
		}

		session, err := m.sessionService.GetSessionByID(c.Request.Context(), claims.SessionID)
		if err != nil || session == nil || !session.IsActive() {
			response.Unauthorized(c, response.ErrCodeSessionRevoked, "Session has been revoked")
			c.Abort()
			return
		}

		go m.sessionService.UpdateSessionActivity(c.Request.Context(), claims.SessionID)

		c.Set(ContextKeyUserID, claims.UserID)
		c.Set(ContextKeySessionID, claims.SessionID)
		c.Set(ContextKeyPermCache, service.NewPermissionCache())

		c.Next()
	}
}

func GetUserID(c *gin.Context) string {
	if userID, exists := c.Get(ContextKeyUserID); exists {
		return userID.(string)
	}
	return ""
}

func GetSessionID(c *gin.Context) string {
	if sessionID, exists := c.Get(ContextKeySessionID); exists {
		return sessionID.(string)
	}
	return ""
}

func GetPermissionCache(c *gin.Context) *service.PermissionCache {
	if cache, exists := c.Get(ContextKeyPermCache); exists {
		return cache.(*service.PermissionCache)
	}
	return nil
}

type PermissionMiddleware struct {
	permissionService *service.PermissionService
}

func NewPermissionMiddleware(permissionService *service.PermissionService) *PermissionMiddleware {
	return &PermissionMiddleware{permissionService: permissionService}
}

func (m *PermissionMiddleware) RequirePermission(permissionCode string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := GetUserID(c)
		if userID == "" {
			response.Unauthorized(c, response.ErrCodeInvalidToken, "Authentication required")
			c.Abort()
			return
		}

		cache := GetPermissionCache(c)
		if cache == nil {
			cache = service.NewPermissionCache()
			c.Set(ContextKeyPermCache, cache)
		}

		has, err := m.permissionService.HasPermission(c.Request.Context(), cache, userID, permissionCode)
		if err != nil {
			response.InternalServerError(c, "Failed to check permissions")
			c.Abort()
			return
		}
		if !has {
			response.Forbidden(c, "Permission denied")
			c.Abort()
			return
		}

		c.Next()
	}
}

func (m *PermissionMiddleware) RequireAnyPermission(codes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := GetUserID(c)
		if userID == "" {
			response.Unauthorized(c, response.ErrCodeInvalidToken, "Authentication required")
			c.Abort()
			return
		}

		cache := GetPermissionCache(c)
		if cache == nil {
			cache = service.NewPermissionCache()
			c.Set(ContextKeyPermCache, cache)
		}

		has, err := m.permissionService.HasAnyPermission(c.Request.Context(), cache, userID, codes)
		if err != nil {
			response.InternalServerError(c, "Failed to check permissions")
			c.Abort()
			return
		}
		if !has {
			response.Forbidden(c, "Permission denied")
			c.Abort()
			return
		}

		c.Next()
	}
}
