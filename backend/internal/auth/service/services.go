// Package service contains the business logic layer for authentication.
package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/clinova/simrs/backend/internal/auth/entity"
	"github.com/clinova/simrs/backend/internal/auth/repository"
	"github.com/clinova/simrs/backend/pkg/audit"
	"github.com/clinova/simrs/backend/pkg/jwt"
	"github.com/clinova/simrs/backend/pkg/password"
)

var (
	ErrInvalidCredentials  = errors.New("invalid username or password")
	ErrUserNotFound        = errors.New("user not found")
	ErrUserInactive        = errors.New("user account is inactive")
	ErrSessionRevoked      = errors.New("session has been revoked")
	ErrSessionNotFound     = errors.New("session not found")
	ErrInvalidRefreshToken = errors.New("invalid refresh token")
)

// AuthService handles authentication operations.
type AuthService struct {
	userRepo       repository.UserRepository
	sessionRepo    repository.SessionRepository
	permissionRepo repository.PermissionRepository
	jwtManager     *jwt.Manager
	passwordHasher *password.Hasher
	auditLogger    *audit.Logger
}

func NewAuthService(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
	permissionRepo repository.PermissionRepository,
	jwtManager *jwt.Manager,
	passwordHasher *password.Hasher,
	auditLogger *audit.Logger,
) *AuthService {
	return &AuthService{
		userRepo:       userRepo,
		sessionRepo:    sessionRepo,
		permissionRepo: permissionRepo,
		jwtManager:     jwtManager,
		passwordHasher: passwordHasher,
		auditLogger:    auditLogger,
	}
}

type LoginRequest struct {
	Username   string
	Password   string
	DeviceInfo string
	IPAddress  string
}

type LoginResponse struct {
	User      *UserInfo
	Tokens    *jwt.TokenPair
	SessionID string
}

type UserInfo struct {
	ID          string
	Username    string
	Email       string
	IsActive    bool
	LastLoginAt *time.Time
	Roles       []string
	Permissions []string
}

func (s *AuthService) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	user, err := s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if err := s.passwordHasher.Verify(req.Password, user.PasswordHash); err != nil {
		return nil, ErrInvalidCredentials
	}

	if !user.IsActive {
		return nil, ErrUserInactive
	}

	sessionID := uuid.New().String()
	tokens, err := s.jwtManager.GenerateTokenPair(user.ID, sessionID)
	if err != nil {
		return nil, err
	}

	session := &entity.LoginSession{
		ID:               sessionID,
		UserID:           user.ID,
		RefreshTokenHash: jwt.HashToken(tokens.RefreshToken),
		DeviceInfo:       req.DeviceInfo,
		IPAddress:        req.IPAddress,
	}

	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return nil, err
	}

	s.userRepo.UpdateLastLogin(ctx, user.ID)

	roles, _ := s.userRepo.GetRolesByUserID(ctx, user.ID)
	roleNames := make([]string, len(roles))
	for i, r := range roles {
		roleNames[i] = r.Name
	}

	perms, _ := s.permissionRepo.GetEffectivePermissions(ctx, user.ID)
	permCodes := make([]string, 0)
	for code, allowed := range perms {
		if allowed {
			permCodes = append(permCodes, code)
		}
	}

	result := &LoginResponse{
		User: &UserInfo{
			ID:          user.ID,
			Username:    user.Username,
			Email:       user.Email,
			IsActive:    user.IsActive,
			LastLoginAt: user.LastLoginAt,
			Roles:       roleNames,
			Permissions: permCodes,
		},
		Tokens:    tokens,
		SessionID: sessionID,
	}

	// Audit log for login
	if s.auditLogger != nil {
		if err := s.auditLogger.LogInsert(audit.InsertParams{
			Module: "auth",
			Entity: audit.Entity{
				Table:      "login_sessions",
				PrimaryKey: map[string]string{"id": sessionID},
			},
			InsertedData: map[string]interface{}{
				"id":          sessionID,
				"user_id":     user.ID,
				"device_info": req.DeviceInfo,
				"ip_address":  req.IPAddress,
			},
			BusinessKey: user.Username,
			Actor:       audit.Actor{UserID: user.ID, Username: user.Username},
			IP:          req.IPAddress,
			Summary:     fmt.Sprintf("Pengguna %s berhasil login dari IP %s", user.Username, req.IPAddress),
		}); err != nil {
			log.Printf("Gagal menulis audit log login: %v", err)
		}
	}

	return result, nil
}

func (s *AuthService) Logout(ctx context.Context, sessionID string) error {
	return s.sessionRepo.Revoke(ctx, sessionID)
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*jwt.TokenPair, error) {
	claims, err := s.jwtManager.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	tokenHash := jwt.HashToken(refreshToken)
	session, err := s.sessionRepo.GetByRefreshTokenHash(ctx, tokenHash)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, ErrSessionNotFound
	}
	if !session.IsActive() {
		return nil, ErrSessionRevoked
	}

	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	if !user.IsActive {
		return nil, ErrUserInactive
	}

	s.sessionRepo.Revoke(ctx, session.ID)

	newSessionID := uuid.New().String()
	tokens, err := s.jwtManager.GenerateTokenPair(user.ID, newSessionID)
	if err != nil {
		return nil, err
	}

	newSession := &entity.LoginSession{
		ID:               newSessionID,
		UserID:           user.ID,
		RefreshTokenHash: jwt.HashToken(tokens.RefreshToken),
		DeviceInfo:       session.DeviceInfo,
		IPAddress:        session.IPAddress,
	}

	if err := s.sessionRepo.Create(ctx, newSession); err != nil {
		return nil, err
	}

	return tokens, nil
}

func (s *AuthService) GetCurrentUser(ctx context.Context, userID string) (*entity.UserWithPermissions, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	roles, _ := s.userRepo.GetRolesByUserID(ctx, userID)
	perms, _ := s.permissionRepo.GetEffectivePermissions(ctx, userID)

	return &entity.UserWithPermissions{
		User:                 *user,
		Roles:                roles,
		EffectivePermissions: perms,
	}, nil
}

// PermissionCache is a request-scoped cache for user permissions.
type PermissionCache struct {
	mu          sync.RWMutex
	permissions map[string]map[string]bool
}

func NewPermissionCache() *PermissionCache {
	return &PermissionCache{permissions: make(map[string]map[string]bool)}
}

func (c *PermissionCache) Get(userID string) (map[string]bool, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	perms, exists := c.permissions[userID]
	return perms, exists
}

func (c *PermissionCache) Set(userID string, perms map[string]bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.permissions[userID] = perms
}

// PermissionService handles permission resolution.
type PermissionService struct {
	permissionRepo repository.PermissionRepository
	userRepo       repository.UserRepository
}

func NewPermissionService(permRepo repository.PermissionRepository, userRepo repository.UserRepository) *PermissionService {
	return &PermissionService{permissionRepo: permRepo, userRepo: userRepo}
}

func (s *PermissionService) ResolveUserPermissions(ctx context.Context, cache *PermissionCache, userID string) (map[string]bool, error) {
	if perms, exists := cache.Get(userID); exists {
		return perms, nil
	}
	perms, err := s.permissionRepo.GetEffectivePermissions(ctx, userID)
	if err != nil {
		return nil, err
	}
	cache.Set(userID, perms)
	return perms, nil
}

func (s *PermissionService) HasPermission(ctx context.Context, cache *PermissionCache, userID, code string) (bool, error) {
	perms, err := s.ResolveUserPermissions(ctx, cache, userID)
	if err != nil {
		return false, err
	}
	return perms[code], nil
}

func (s *PermissionService) HasAnyPermission(ctx context.Context, cache *PermissionCache, userID string, codes []string) (bool, error) {
	perms, err := s.ResolveUserPermissions(ctx, cache, userID)
	if err != nil {
		return false, err
	}
	for _, code := range codes {
		if perms[code] {
			return true, nil
		}
	}
	return false, nil
}

func (s *PermissionService) HasAllPermissions(ctx context.Context, cache *PermissionCache, userID string, codes []string) (bool, error) {
	perms, err := s.ResolveUserPermissions(ctx, cache, userID)
	if err != nil {
		return false, err
	}
	for _, code := range codes {
		if !perms[code] {
			return false, nil
		}
	}
	return true, nil
}

func (s *PermissionService) GetUserWithPermissions(ctx context.Context, cache *PermissionCache, userID string) (*entity.UserWithPermissions, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	roles, _ := s.userRepo.GetRolesByUserID(ctx, userID)
	perms, err := s.ResolveUserPermissions(ctx, cache, userID)
	if err != nil {
		return nil, err
	}
	return &entity.UserWithPermissions{User: *user, Roles: roles, EffectivePermissions: perms}, nil
}

// SessionService handles login session management.
type SessionService struct {
	sessionRepo repository.SessionRepository
	userRepo    repository.UserRepository
	auditLogger *audit.Logger
}

func NewSessionService(sessionRepo repository.SessionRepository, userRepo repository.UserRepository, auditLogger *audit.Logger) *SessionService {
	return &SessionService{sessionRepo: sessionRepo, userRepo: userRepo, auditLogger: auditLogger}
}

func (s *SessionService) GetUserSessions(ctx context.Context, userID string) ([]entity.LoginSession, error) {
	return s.sessionRepo.GetActiveByUserID(ctx, userID)
}

func (s *SessionService) GetSessionByID(ctx context.Context, sessionID string) (*entity.LoginSession, error) {
	return s.sessionRepo.GetByID(ctx, sessionID)
}

func (s *SessionService) RevokeSession(ctx context.Context, requestingUserID, sessionID string, isAdmin bool) error {
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return err
	}
	if session == nil {
		return ErrSessionNotFound
	}
	if session.UserID != requestingUserID && !isAdmin {
		return ErrSessionNotFound
	}

	if err := s.sessionRepo.Revoke(ctx, sessionID); err != nil {
		return err
	}

	// Audit log for session revocation
	if s.auditLogger != nil {
		reqUser, _ := s.userRepo.GetByID(ctx, requestingUserID)
		username := "unknown"
		if reqUser != nil {
			username = reqUser.Username
		}

		if err := s.auditLogger.LogDelete(audit.DeleteParams{
			Module: "auth",
			Entity: audit.Entity{
				Table:      "login_sessions",
				PrimaryKey: map[string]string{"id": sessionID},
			},
			DeletedData: map[string]interface{}{
				"id":          sessionID,
				"user_id":     session.UserID,
				"device_info": session.DeviceInfo,
			},
			Where:       map[string]interface{}{"id": sessionID},
			BusinessKey: sessionID,
			Actor:       audit.Actor{UserID: requestingUserID, Username: username},
			IP:          session.IPAddress,
			Summary:     fmt.Sprintf("Sesi login %s dibatalkan oleh %s", sessionID[:8], username),
		}); err != nil {
			log.Printf("Gagal menulis audit log revoke session: %v", err)
		}
	}

	return nil
}

func (s *SessionService) UpdateSessionActivity(ctx context.Context, sessionID string) error {
	return s.sessionRepo.UpdateLastSeen(ctx, sessionID)
}
