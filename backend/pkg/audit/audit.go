// Package audit provides file-based audit logging for business operations.
// Audit logs are written as NDJSON (Newline Delimited JSON) to daily-rotated files.
package audit

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Operation types for audit logging.
const (
	OpInsert = "INSERT"
	OpUpdate = "UPDATE"
	OpDelete = "DELETE"
)

// Actor represents the user performing the action.
type Actor struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
}

// Entity represents the database entity being modified.
type Entity struct {
	Table      string            `json:"table"`
	PrimaryKey map[string]string `json:"primary_key"`
}

// SQLContext provides logical representation of the data change (not raw SQL).
type SQLContext struct {
	Operation      string                  `json:"operation"`
	ChangedColumns map[string]ColumnChange `json:"changed_columns,omitempty"` // For UPDATE
	InsertedData   map[string]interface{}  `json:"inserted_data,omitempty"`   // For INSERT
	DeletedData    map[string]interface{}  `json:"deleted_data,omitempty"`    // For DELETE
	Where          map[string]interface{}  `json:"where,omitempty"`           // Logical WHERE
}

// ColumnChange represents old and new values for an UPDATE operation.
type ColumnChange struct {
	Old interface{} `json:"old"`
	New interface{} `json:"new"`
}

// Log represents a single audit log entry.
type Log struct {
	Timestamp   string     `json:"ts"`
	Level       string     `json:"level"`
	Module      string     `json:"module"`
	Action      string     `json:"action"`
	Entity      Entity     `json:"entity"`
	SQLContext  SQLContext `json:"sql_context"`
	BusinessKey string     `json:"business_key"`
	Actor       Actor      `json:"actor"`
	IP          string     `json:"ip"`
	Summary     string     `json:"summary"`
}

// Logger handles writing audit logs to files.
type Logger struct {
	baseDir     string
	mu          sync.Mutex
	currentDate string
	file        *os.File
}

// NewLogger creates a new audit logger with the specified base directory.
func NewLogger(baseDir string) (*Logger, error) {
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create audit log directory: %w", err)
	}
	return &Logger{baseDir: baseDir}, nil
}

// getFile returns the current log file, rotating if needed.
func (l *Logger) getFile() (*os.File, error) {
	today := time.Now().Format("2006-01-02")

	if l.file != nil && l.currentDate == today {
		return l.file, nil
	}

	// Close old file if exists
	if l.file != nil {
		l.file.Close()
	}

	// Open new file
	filename := fmt.Sprintf("audit-%s.json", today)
	path := filepath.Join(l.baseDir, filename)

	file, err := os.OpenFile(path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to open audit log file: %w", err)
	}

	l.file = file
	l.currentDate = today
	return file, nil
}

// write writes a single audit log entry to the file.
func (l *Logger) write(log Log) error {
	l.mu.Lock()
	defer l.mu.Unlock()

	file, err := l.getFile()
	if err != nil {
		return err
	}

	log.Timestamp = time.Now().Format(time.RFC3339)
	log.Level = "AUDIT"

	data, err := json.Marshal(log)
	if err != nil {
		return fmt.Errorf("failed to marshal audit log: %w", err)
	}

	if _, err := file.Write(append(data, '\n')); err != nil {
		return fmt.Errorf("failed to write audit log: %w", err)
	}

	return nil
}

// LogInsert logs an INSERT operation.
func (l *Logger) LogInsert(params InsertParams) error {
	return l.write(Log{
		Module: params.Module,
		Action: OpInsert,
		Entity: params.Entity,
		SQLContext: SQLContext{
			Operation:    OpInsert,
			InsertedData: params.InsertedData,
		},
		BusinessKey: params.BusinessKey,
		Actor:       params.Actor,
		IP:          params.IP,
		Summary:     params.Summary,
	})
}

// LogUpdate logs an UPDATE operation.
func (l *Logger) LogUpdate(params UpdateParams) error {
	return l.write(Log{
		Module: params.Module,
		Action: OpUpdate,
		Entity: params.Entity,
		SQLContext: SQLContext{
			Operation:      OpUpdate,
			ChangedColumns: params.ChangedColumns,
			Where:          params.Where,
		},
		BusinessKey: params.BusinessKey,
		Actor:       params.Actor,
		IP:          params.IP,
		Summary:     params.Summary,
	})
}

// LogDelete logs a DELETE operation.
func (l *Logger) LogDelete(params DeleteParams) error {
	return l.write(Log{
		Module: params.Module,
		Action: OpDelete,
		Entity: params.Entity,
		SQLContext: SQLContext{
			Operation:   OpDelete,
			DeletedData: params.DeletedData,
			Where:       params.Where,
		},
		BusinessKey: params.BusinessKey,
		Actor:       params.Actor,
		IP:          params.IP,
		Summary:     params.Summary,
	})
}

// Close closes the current log file.
func (l *Logger) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.file != nil {
		err := l.file.Close()
		l.file = nil
		return err
	}
	return nil
}

// InsertParams contains parameters for logging an INSERT operation.
type InsertParams struct {
	Module       string
	Entity       Entity
	InsertedData map[string]interface{}
	BusinessKey  string
	Actor        Actor
	IP           string
	Summary      string // Must be in Bahasa Indonesia
}

// UpdateParams contains parameters for logging an UPDATE operation.
type UpdateParams struct {
	Module         string
	Entity         Entity
	ChangedColumns map[string]ColumnChange
	Where          map[string]interface{}
	BusinessKey    string
	Actor          Actor
	IP             string
	Summary        string // Must be in Bahasa Indonesia
}

// DeleteParams contains parameters for logging a DELETE operation.
type DeleteParams struct {
	Module      string
	Entity      Entity
	DeletedData map[string]interface{}
	Where       map[string]interface{}
	BusinessKey string
	Actor       Actor
	IP          string
	Summary     string // Must be in Bahasa Indonesia
}
