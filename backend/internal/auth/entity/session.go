package entity

import "time"

// LoginSession represents an active or revoked login session.
type LoginSession struct {
	ID               string     `json:"id"`
	UserID           string     `json:"user_id"`
	RefreshTokenHash string     `json:"-"`
	DeviceInfo       string     `json:"device_info,omitempty"`
	IPAddress        string     `json:"ip_address,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	LastSeenAt       time.Time  `json:"last_seen_at"`
	RevokedAt        *time.Time `json:"revoked_at,omitempty"`
}

func (s *LoginSession) IsActive() bool {
	return s.RevokedAt == nil
}

func (s *LoginSession) IsExpired(maxAge time.Duration) bool {
	return time.Since(s.CreatedAt) > maxAge
}
