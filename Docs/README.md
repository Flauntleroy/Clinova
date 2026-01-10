# SIMRS - Sistem Informasi Manajemen Rumah Sakit

Production-grade Hospital Information System dengan Clean Architecture.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go + Gin + MySQL |
| Frontend | React + TypeScript + TailAdmin |
| Database | MySQL (rsaz_sik) |
| Auth | JWT (Access + Refresh Tokens) |

## Project Structure

```
SIMRS/
├── backend/                    # Go API Server
│   ├── cmd/server/             # Entry point
│   ├── internal/
│   │   ├── auth/               # Authentication domain
│   │   │   ├── entity/         # User, Role, Permission, Session
│   │   │   ├── repository/     # Data access layer
│   │   │   ├── service/        # Business logic
│   │   │   └── handler/        # HTTP handlers + middleware
│   │   └── common/             # Shared utilities
│   ├── migrations/             # SQL migrations
│   └── pkg/                    # Reusable packages
│
├── Frontend/                   # React + TailAdmin
│   └── src/
│       ├── components/         # UI components
│       ├── context/            # React context (Auth)
│       ├── services/           # API clients
│       └── pages/              # Route pages
│
└── Docs/                       # Documentation
    ├── README.md               # This file
    └── api-auth.md             # Auth API documentation
```

## Quick Start

### 1. Database Setup
```bash
mysql -u root -p rsaz_sik < backend/migrations/001_init_schema.sql
mysql -u root -p rsaz_sik < backend/migrations/002_seed_data.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env    # Edit DB credentials
go run cmd/server/main.go
# Server runs on http://localhost:8080
```

### 3. Frontend
```bash
cd Frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Test Users

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | Administrator |
| doctor1 | password123 | Doctor |
| nurse1 | password123 | Nurse |
| billing1 | password123 | Billing Staff |

## API Documentation

- [Authentication API](./api-auth.md)

## Features

### Implemented
- [x] User authentication (login/logout)
- [x] JWT tokens (access + refresh)
- [x] Role-based access control (RBAC)
- [x] Permission system (domain.action format)
- [x] Session management (multi-device support)
- [x] Protected routes (frontend)

### Planned
- [ ] Patient management
- [ ] Billing system
- [ ] Pharmacy module
- [ ] Laboratory module
