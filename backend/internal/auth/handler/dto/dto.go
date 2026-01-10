package dto

import "time"

type LoginRequest struct {
	Username string `json:"username" binding:"required,min=1"`
	Password string `json:"password" binding:"required,min=1"`
}

type LoginResponse struct {
	User    UserResponse  `json:"user"`
	Tokens  TokenResponse `json:"tokens"`
	Session SessionBrief  `json:"session"`
}

type TokenResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	TokenType    string    `json:"token_type"`
	ExpiresAt    time.Time `json:"expires_at"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type RefreshTokenResponse struct {
	Tokens TokenResponse `json:"tokens"`
}

type UserResponse struct {
	ID          string      `json:"id"`
	Username    string      `json:"username"`
	Email       string      `json:"email"`
	IsActive    bool        `json:"is_active"`
	LastLoginAt *time.Time  `json:"last_login_at,omitempty"`
	Roles       []RoleBrief `json:"roles"`
	Permissions []string    `json:"permissions"`
}

type RoleBrief struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SessionBrief struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

type MeResponse struct {
	User UserResponse `json:"user"`
}

type SessionListResponse struct {
	Sessions []SessionResponse `json:"sessions"`
	Total    int               `json:"total"`
}

type SessionResponse struct {
	ID         string     `json:"id"`
	DeviceInfo string     `json:"device_info,omitempty"`
	IPAddress  string     `json:"ip_address,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	LastSeenAt time.Time  `json:"last_seen_at"`
	IsCurrent  bool       `json:"is_current"`
	IsActive   bool       `json:"is_active"`
	RevokedAt  *time.Time `json:"revoked_at,omitempty"`
}
