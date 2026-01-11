# Folder Structure Documentation

Dokumentasi struktur folder untuk SIMRS project.

---

## Root Level

```
SIMRS/
├── backend/          # Go backend server
├── Frontend/         # React frontend app
└── Docs/             # All documentation (backend + frontend)
```

---

## Backend Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
│
├── internal/                 # Private packages
│   ├── auth/                 # Authentication domain
│   │   ├── entity/           # Domain models
│   │   │   ├── user.go       # User, UserWithPermissions
│   │   │   ├── role.go       # Role
│   │   │   ├── permission.go # Permission, UserPermissionOverride
│   │   │   └── session.go    # LoginSession
│   │   │
│   │   ├── repository/       # Data access interfaces + MySQL impl
│   │   │   ├── interfaces.go # Repository interfaces
│   │   │   ├── user_mysql.go
│   │   │   ├── role_mysql.go
│   │   │   ├── permission_mysql.go
│   │   │   └── session_mysql.go
│   │   │
│   │   ├── service/          # Business logic
│   │   │   └── services.go   # AuthService, PermissionService, SessionService
│   │   │
│   │   └── handler/          # HTTP layer
│   │       ├── auth_handler.go   # HTTP handlers
│   │       ├── router.go         # Route setup
│   │       ├── dto/
│   │       │   └── dto.go        # Request/response DTOs
│   │       └── middleware/
│   │           └── middleware.go # JWT, Permission middleware
│   │
│   └── common/               # Shared utilities
│       ├── config/
│       │   └── config.go     # Environment config loader
│       └── database/
│           └── mysql.go      # Database connection
│
├── migrations/               # SQL migrations
│   ├── 001_init_schema.sql   # Create tables
│   └── 002_seed_data.sql     # Seed test data
│
├── pkg/                      # Public packages
│   ├── jwt/
│   │   └── jwt.go            # JWT token utilities
│   ├── password/
│   │   └── bcrypt.go         # Password hashing
│   └── response/
│       └── response.go       # API response helpers
│
├── .env                      # Environment config (not in git)
├── .env.example              # Environment template
├── .gitignore
└── go.mod                    # Go dependencies
```

---

## Frontend Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx    # Login form (connected to API)
│   │   │   └── SignUpForm.tsx
│   │   ├── common/
│   │   │   ├── ProtectedRoute.tsx # Auth-protected wrapper
│   │   │   ├── PageMeta.tsx
│   │   │   └── ScrollToTop.tsx
│   │   ├── form/                  # Form components
│   │   ├── ui/                    # UI components (TailAdmin)
│   │   └── ...
│   │
│   ├── config/
│   │   └── api.ts                 # API endpoints config
│   │
│   ├── context/
│   │   └── AuthContext.tsx        # Auth state management
│   │
│   ├── hooks/
│   │   └── useAuth.ts             # Auth hook
│   │
│   ├── layout/
│   │   └── AppLayout.tsx          # Dashboard layout
│   │
│   ├── pages/
│   │   ├── AuthPages/
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   └── Sessions.tsx       # Session management
│   │   ├── Dashboard/
│   │   │   └── Home.tsx
│   │   └── ...
│   │
│   ├── services/
│   │   └── authService.ts         # Auth API client
│   │
│   ├── App.tsx                    # Main app + routes
│   └── main.tsx                   # Entry point
│
├── public/                        # Static assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Docs Structure

```
Docs/
├── README.md              # Project overview
├── api-auth.md            # Auth API documentation
├── database-schema.md     # Database schema docs
└── folder-structure.md    # This file
```

---

## Architecture Pattern

### Clean Architecture (Backend)

```
┌─────────────────────────────────────────────────────┐
│                    Handler Layer                     │
│         (HTTP handlers, middleware, DTOs)           │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Service Layer                      │
│              (Business logic, rules)                │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                 Repository Layer                     │
│            (Data access, MySQL impl)                │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Entity Layer                       │
│               (Domain models)                       │
└─────────────────────────────────────────────────────┘
```

### Domain Organization

Setiap domain (auth, pasien, billing, dll) memiliki struktur:
- `entity/` - Domain models
- `repository/` - Data access
- `service/` - Business logic
- `handler/` - HTTP layer
