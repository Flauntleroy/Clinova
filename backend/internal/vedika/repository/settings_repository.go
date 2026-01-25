// Package repository contains data access layer for Vedika module.
package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/clinova/simrs/backend/internal/vedika/entity"
)

var (
	// ErrSettingNotFound indicates a required setting is missing.
	ErrSettingNotFound = errors.New("required vedika setting not found")
)

// SettingsRepository handles mera_settings access.
type SettingsRepository interface {
	GetActivePeriod(ctx context.Context) (string, error)
	GetAllowedCarabayar(ctx context.Context) ([]string, error)
	GetLegacyWebAppURL(ctx context.Context) (string, error)
}

// MySQLSettingsRepository implements SettingsRepository using MySQL.
type MySQLSettingsRepository struct {
	db *sql.DB
}

// NewMySQLSettingsRepository creates a new settings repository.
func NewMySQLSettingsRepository(db *sql.DB) *MySQLSettingsRepository {
	return &MySQLSettingsRepository{db: db}
}

// getSetting retrieves a single setting value from mera_settings.
func (r *MySQLSettingsRepository) getSetting(ctx context.Context, key string) (*entity.VedikaSetting, error) {
	query := `
		SELECT module, setting_key, setting_value, value_type, is_active
		FROM mera_settings
		WHERE module = 'vedika' AND setting_key = ? AND is_active = 1
		LIMIT 1
	`

	var setting entity.VedikaSetting
	var settingValue sql.NullString

	err := r.db.QueryRowContext(ctx, query, key).Scan(
		&setting.Module,
		&setting.SettingKey,
		&settingValue,
		&setting.ValueType,
		&setting.IsActive,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("%w: %s", ErrSettingNotFound, key)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get setting %s: %w", key, err)
	}

	if settingValue.Valid {
		setting.SettingValue = settingValue.String
	}

	return &setting, nil
}

// GetActivePeriod returns the active claim period (format: YYYY-MM).
func (r *MySQLSettingsRepository) GetActivePeriod(ctx context.Context) (string, error) {
	setting, err := r.getSetting(ctx, "active_period")
	if err != nil {
		return "", err
	}

	// Value is stored as JSON string, e.g., "\"2026-01\""
	var period string
	if err := json.Unmarshal([]byte(setting.SettingValue), &period); err != nil {
		return "", fmt.Errorf("invalid active_period format: %w", err)
	}

	return period, nil
}

// GetAllowedCarabayar returns the list of allowed payment methods.
func (r *MySQLSettingsRepository) GetAllowedCarabayar(ctx context.Context) ([]string, error) {
	setting, err := r.getSetting(ctx, "allowed_carabayar")
	if err != nil {
		return nil, err
	}

	// Value is stored as JSON array, e.g., "[\"BPJ\"]"
	var carabayar []string
	if err := json.Unmarshal([]byte(setting.SettingValue), &carabayar); err != nil {
		return nil, fmt.Errorf("invalid allowed_carabayar format: %w", err)
	}

	return carabayar, nil
}

// GetLegacyWebAppURL returns the base URL for the legacy web application.
func (r *MySQLSettingsRepository) GetLegacyWebAppURL(ctx context.Context) (string, error) {
	setting, err := r.getSetting(ctx, "legacy_webapp_url")
	if err != nil {
		return "", err
	}

	// Value is stored as JSON string, e.g., "\"http://192.168.0.3/webapps/berkasrawat/\""
	var url string
	if err := json.Unmarshal([]byte(setting.SettingValue), &url); err != nil {
		return "", fmt.Errorf("invalid legacy_webapp_url format: %w", err)
	}

	return url, nil
}
