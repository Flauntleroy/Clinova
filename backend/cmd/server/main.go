// Package main is the entry point for the SIMRS Authentication Service.
package main

import (
	"log"

	"github.com/clinova/simrs/backend/internal/auth/handler"
	"github.com/clinova/simrs/backend/internal/auth/repository"
	"github.com/clinova/simrs/backend/internal/auth/service"
	"github.com/clinova/simrs/backend/internal/common/config"
	"github.com/clinova/simrs/backend/internal/common/database"
	"github.com/clinova/simrs/backend/pkg/jwt"
	"github.com/clinova/simrs/backend/pkg/password"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := database.NewMySQLConnection(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Connected to database:", cfg.Database.DBName)

	// Initialize repositories
	userRepo := repository.NewMySQLUserRepository(db)
	roleRepo := repository.NewMySQLRoleRepository(db)
	permissionRepo := repository.NewMySQLPermissionRepository(db)
	sessionRepo := repository.NewMySQLSessionRepository(db)

	_ = roleRepo // Available for future role management

	// Initialize utilities
	jwtManager := jwt.NewManager(cfg.JWT.Secret, cfg.JWT.AccessTokenExpiry, cfg.JWT.RefreshTokenExpiry)
	passwordHasher := password.NewHasher(cfg.Bcrypt.Cost)

	// Initialize services
	authService := service.NewAuthService(userRepo, sessionRepo, permissionRepo, jwtManager, passwordHasher)
	sessionService := service.NewSessionService(sessionRepo, userRepo)
	permissionService := service.NewPermissionService(permissionRepo, userRepo)

	// Initialize router
	router := handler.NewRouter(jwtManager, authService, sessionService, permissionService)

	// Start server
	addr := ":" + cfg.Server.Port
	log.Printf("Starting SIMRS Auth Service on %s", addr)
	log.Println("API Endpoints:")
	log.Println("  POST /auth/login")
	log.Println("  POST /auth/logout")
	log.Println("  POST /auth/refresh")
	log.Println("  GET  /auth/me")
	log.Println("  GET  /auth/sessions")
	log.Println("  POST /auth/sessions/:id/revoke")

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
