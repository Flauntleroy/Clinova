package entity

import "time"

// Permission represents a business action that can be authorized.
// Format: domain.action (e.g., billing.read, patient.create)
type Permission struct {
	ID          string    `json:"id"`
	Code        string    `json:"code"`
	Domain      string    `json:"domain"`
	Action      string    `json:"action"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// UserPermissionOverride represents per-user permission overrides.
type UserPermissionOverride struct {
	UserID       string      `json:"user_id"`
	PermissionID string      `json:"permission_id"`
	Permission   *Permission `json:"permission,omitempty"`
	Type         string      `json:"type"` // "grant" or "revoke"
	CreatedAt    time.Time   `json:"created_at"`
}

const (
	OverrideTypeGrant  = "grant"
	OverrideTypeRevoke = "revoke"
)
