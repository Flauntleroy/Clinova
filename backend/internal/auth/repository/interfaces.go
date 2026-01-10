// Package repository defines interfaces for data access.
package repository

import (
	"context"

	"github.com/clinova/simrs/backend/internal/auth/entity"
)

// UserRepository defines the interface for user data access.
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetByUsername(ctx context.Context, username string) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	UpdateLastLogin(ctx context.Context, userID string) error
	GetRolesByUserID(ctx context.Context, userID string) ([]entity.Role, error)
	AssignRole(ctx context.Context, userID, roleID string) error
	RemoveRole(ctx context.Context, userID, roleID string) error
}

// RoleRepository defines the interface for role data access.
type RoleRepository interface {
	Create(ctx context.Context, role *entity.Role) error
	GetByID(ctx context.Context, id string) (*entity.Role, error)
	GetByName(ctx context.Context, name string) (*entity.Role, error)
	GetAll(ctx context.Context) ([]entity.Role, error)
	Update(ctx context.Context, role *entity.Role) error
	Delete(ctx context.Context, id string) error
	GetPermissionsByRoleID(ctx context.Context, roleID string) ([]entity.Permission, error)
	AssignPermission(ctx context.Context, roleID, permissionID string) error
	RemovePermission(ctx context.Context, roleID, permissionID string) error
}

// PermissionRepository defines the interface for permission data access.
type PermissionRepository interface {
	Create(ctx context.Context, permission *entity.Permission) error
	GetByID(ctx context.Context, id string) (*entity.Permission, error)
	GetByCode(ctx context.Context, code string) (*entity.Permission, error)
	GetByDomain(ctx context.Context, domain string) ([]entity.Permission, error)
	GetAll(ctx context.Context) ([]entity.Permission, error)
	GetEffectivePermissions(ctx context.Context, userID string) (map[string]bool, error)
	GetUserOverrides(ctx context.Context, userID string) ([]entity.UserPermissionOverride, error)
	SetUserOverride(ctx context.Context, userID, permissionID, overrideType string) error
	RemoveUserOverride(ctx context.Context, userID, permissionID string) error
}

// SessionRepository defines the interface for login session data access.
type SessionRepository interface {
	Create(ctx context.Context, session *entity.LoginSession) error
	GetByID(ctx context.Context, id string) (*entity.LoginSession, error)
	GetByRefreshTokenHash(ctx context.Context, hash string) (*entity.LoginSession, error)
	GetActiveByUserID(ctx context.Context, userID string) ([]entity.LoginSession, error)
	GetAllByUserID(ctx context.Context, userID string) ([]entity.LoginSession, error)
	UpdateLastSeen(ctx context.Context, sessionID string) error
	Revoke(ctx context.Context, sessionID string) error
	RevokeAllByUserID(ctx context.Context, userID string) error
}
