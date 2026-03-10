# 📋 Task Manager API

A RESTful API for managing projects and tasks, built with **NestJS**, **TypeORM**, and **PostgreSQL**.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM |
| Auth | JWT (Access + Refresh Token) |
| Validation | class-validator / class-transformer |
| Documentation | Swagger / OpenAPI |
| Package Manager | pnpm |

---

## 📁 Project Structure

```
src/
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser() — extract authenticated user from request
│   │   ├── public.decorator.ts         # @Public() — bypass JwtAuthGuard for open routes
│   │   └── roles.decorator.ts          # @Roles() — restrict access by user role
│   ├── dto/
│   │   ├── pagination.dto.ts           # Shared base pagination DTO
│   │   └── paginated-response.dto.ts   # Paginated response wrapper with meta
│   ├── filters/
│   │   └── http-exception.filter.ts    # Global HTTP exception filter
│   └── interceptors/
│       └── response.interceptor.ts     # Global response wrapper interceptor
│
├── config/
│   ├── app.config.ts                   # App port, environment, global prefix
│   ├── database.config.ts              # PostgreSQL connection config
│   └── jwt.config.ts                   # JWT secrets and expiry config
│
├── database/
│   ├── migrations/                     # TypeORM migration files (auto-generated)
│   └── data-source.ts                  # TypeORM DataSource for CLI usage
│
├── modules/
│   ├── auth/
│   │   ├── dto/                        # register.dto, login.dto, auth-response.dto
│   │   ├── guards/                     # JwtAuthGuard, JwtRefreshGuard, RolesGuard
│   │   ├── strategies/                 # JwtAccessStrategy, JwtRefreshStrategy
│   │   ├── auth.controller.ts          # Auth endpoints (register, login, refresh, logout, me)
│   │   ├── auth.module.ts
│   │   └── auth.service.ts             # Core auth logic — token generation & hashing
│   │
│   ├── users/
│   │   ├── dto/
│   │   ├── entities/user.entity.ts     # User entity with @BeforeInsert password hashing
│   │   ├── users.module.ts
│   │   ├── users.repository.ts
│   │   └── users.service.ts
│   │
│   ├── projects/
│   │   ├── dto/                        # create-project, update-project, query-project
│   │   ├── entities/project.entity.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.module.ts
│   │   ├── projects.repository.ts      # Custom queries using QueryBuilder
│   │   └── projects.service.ts
│   │
│   └── tasks/
│       ├── dto/                        # create-task, update-task, query-task
│       ├── entities/task.entity.ts
│       ├── tasks.controller.ts
│       ├── tasks.module.ts
│       ├── tasks.repository.ts         # Custom queries with date range filter support
│       └── tasks.service.ts            # Status transition validation logic
│
├── app.module.ts                       # Root module — global guards registered via APP_GUARD
└── main.ts                             # Bootstrap — Swagger setup, global pipes & filters
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd task-manager
pnpm install
```

### 2. Setup environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your values:

```env
APP_PORT=3000
APP_ENV=development
APP_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=task_manager

# Generate secrets using:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Setup database

**Option A — Docker (recommended)**

```bash
docker run --name task-manager-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=task_manager \
  -p 5432:5432 \
  -d postgres:15
```

**Option B — Local PostgreSQL**

```bash
psql -U postgres -c "CREATE DATABASE task_manager;"
```

### 4. Run migrations

```bash
# Generate migration files from entities
pnpm migration:generate src/database/migrations/InitSchema

# Apply all pending migrations
pnpm migration:run
```

### 5. Start the server

```bash
# Development with watch mode
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

Server is running at: `http://localhost:3000/api/v1`

---

## 📖 API Documentation

Swagger UI is available in non-production environments:

```
http://localhost:3000/docs
```

OpenAPI JSON spec (import into Postman / Insomnia):

```
http://localhost:3000/docs-json
```

---

## 🔐 Authentication

The API uses **JWT Bearer Tokens** with **Refresh Token Rotation**.

### Flow

```
1. POST /auth/register  or  POST /auth/login
        ↓
   Receive { accessToken (15m), refreshToken (7d) }
        ↓
2. Attach to every protected request:
   Authorization: Bearer <accessToken>
        ↓
3. When accessToken expires (401 response):
   POST /auth/refresh  with  Authorization: Bearer <refreshToken>
        ↓
   Receive a brand new token pair
        ↓
4. POST /auth/logout  →  refreshToken is invalidated in DB
```

### Token TTL

| Token | TTL |
|-------|-----|
| Access Token | 15 minutes |
| Refresh Token | 7 days |

### User Roles

| Role | Description |
|------|-------------|
| `member` | Default role assigned on registration |
| `admin` | Can delete projects |

---

## 🗺 API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ Public | Register a new account |
| `POST` | `/auth/login` | ❌ Public | Login with email & password |
| `POST` | `/auth/refresh` | 🔄 Refresh Token | Obtain a new token pair |
| `POST` | `/auth/logout` | ✅ Access Token | Logout and invalidate refresh token |
| `GET` | `/auth/me` | ✅ Access Token | Get current user profile |

### Projects

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/projects` | ✅ | Any | Create a new project |
| `GET` | `/projects` | ✅ | Any | Get all projects (paginated) |
| `GET` | `/projects/:id` | ✅ | Any | Get project details with tasks |
| `GET` | `/projects/:id/stats` | ✅ | Any | Get task count breakdown by status |
| `PATCH` | `/projects/:id` | ✅ | Any | Update a project |
| `DELETE` | `/projects/:id` | ✅ | **ADMIN** | Delete a project (cascades to tasks) |

### Tasks

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/tasks` | ✅ | Any | Create a new task |
| `GET` | `/tasks` | ✅ | Any | Get all tasks (paginated) |
| `GET` | `/tasks/:id` | ✅ | Any | Get task details |
| `PATCH` | `/tasks/:id` | ✅ | Any | Update a task |
| `PATCH` | `/tasks/:id/status` | ✅ | Any | Quick-update task status only |
| `DELETE` | `/tasks/:id` | ✅ | Any | Delete a task |

---

## 🔍 Pagination & Filter

All `GET` list endpoints support pagination, filtering, and sorting via query parameters.

### Common Query Params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Current page number |
| `limit` | number | `10` | Items per page (max: 100) |
| `sortOrder` | `ASC` \| `DESC` | `DESC` | Sort direction |

### Project-specific Filters

| Param | Type | Description |
|-------|------|-------------|
| `status` | `active` \| `archived` \| `completed` | Filter by project status |
| `search` | string | Search by project name (case-insensitive) |
| `sortBy` | `name` \| `createdAt` \| `updatedAt` \| `status` | Field to sort by |

### Task-specific Filters

| Param | Type | Description |
|-------|------|-------------|
| `status` | `todo` \| `in_progress` \| `in_review` \| `done` \| `cancelled` | Filter by task status |
| `priority` | `low` \| `medium` \| `high` \| `urgent` | Filter by priority level |
| `projectId` | UUID | Filter tasks belonging to a specific project |
| `search` | string | Search by task title (case-insensitive) |
| `dueDateFrom` | YYYY-MM-DD | Filter tasks due on or after this date |
| `dueDateTo` | YYYY-MM-DD | Filter tasks due on or before this date |
| `sortBy` | `title` \| `status` \| `priority` \| `dueDate` \| `createdAt` \| `updatedAt` | Field to sort by |

### Examples

```bash
# Projects: search with pagination and sorting
GET /api/v1/projects?search=website&page=1&limit=5&sortBy=name&sortOrder=ASC

# Tasks: combine multiple filters
GET /api/v1/tasks?status=todo&priority=high&sortBy=dueDate&sortOrder=ASC

# Tasks: date range filter (Q1 2024)
GET /api/v1/tasks?dueDateFrom=2024-01-01&dueDateTo=2024-03-31

# Tasks: all tasks belonging to a specific project
GET /api/v1/tasks?projectId=a1b2c3d4-e5f6-7890-abcd-ef1234567890&page=2&limit=10
```

### Paginated Response Shape

```json
{
  "success": true,
  "data": {
    "data": [ ...items ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 42,
      "totalPages": 5,
      "hasPreviousPage": false,
      "hasNextPage": true
    }
  },
  "timestamp": "2024-01-15T09:00:00.000Z"
}
```

---

## ✅ Task Status Transitions

Tasks cannot jump freely between statuses — they must follow a defined flow:

```
todo ──────────────────────────────────────────────────┐
  └─→ in_progress ──────────────────────────────────── ┤
            └─→ in_review ──→ done (terminal)           ├──→ cancelled (terminal)
                    └─→ in_progress                     │
```

| From | Allowed Transitions |
|------|---------------------|
| `todo` | `in_progress`, `cancelled` |
| `in_progress` | `in_review`, `todo`, `cancelled` |
| `in_review` | `done`, `in_progress`, `cancelled` |
| `done` | *(terminal — no further transitions)* |
| `cancelled` | *(terminal — no further transitions)* |

---

## 📦 Standard Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T09:00:00.000Z"
}
```

### Error

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T09:00:00.000Z",
  "path": "/api/v1/tasks",
  "method": "POST",
  "message": "Validation failed"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — validation error or invalid status transition |
| `401` | Unauthorized — missing or expired token |
| `403` | Forbidden — insufficient role permissions |
| `404` | Not Found |
| `409` | Conflict — duplicate project name |
| `500` | Internal Server Error |

---

## 🧰 Migration Commands

```bash
# Generate a new migration file from entity changes
pnpm migration:generate src/database/migrations/<MigrationName>

# Apply all pending migrations
pnpm migration:run

# Revert the most recently applied migration
pnpm migration:revert

# Show the status of all migrations (applied / pending)
pnpm migration:show
```

---

## 🔧 Available Scripts

```bash
pnpm start:dev      # Start in development mode with hot reload
pnpm start:debug    # Start in debug mode
pnpm build          # Compile TypeScript to JavaScript
pnpm start:prod     # Run the compiled production build
pnpm lint           # Run ESLint and auto-fix issues
```