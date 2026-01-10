// Package entity defines the core domain entities for authentication.
package entity

import "time"

// User represents an authenticated user in the system.
type User struct {
	ID           string     `json:"id"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	IsActive     bool       `json:"is_active"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// UserWithPermissions extends User with resolved effective permissions.
type UserWithPermissions struct {
	User
	Roles                []Role          `json:"roles"`
	EffectivePermissions map[string]bool `json:"-"`
}

// Can checks if the user has a specific permission.
func (u *UserWithPermissions) Can(permissionCode string) bool {
	if u.EffectivePermissions == nil {
		return false
	}
	return u.EffectivePermissions[permissionCode]
}

// HasRole checks if the user has a specific role by name.
func (u *UserWithPermissions) HasRole(roleName string) bool {
	for _, role := range u.Roles {
		if role.Name == roleName {
			return true
		}
	}
	return false
}

// GetPermissionCodes returns a slice of all effective permission codes.
func (u *UserWithPermissions) GetPermissionCodes() []string {
	codes := make([]string, 0, len(u.EffectivePermissions))
	for code, allowed := range u.EffectivePermissions {
		if allowed {
			codes = append(codes, code)
		}
	}
	return codes
}
