## TaskFlow - Full-Stack Kanban & Project Management Dashboard

TaskFlow is a simplified, high-performance Kanban & Project Management dashboard built for the Full-Stack Developer technical assessment.

It cleanly separates concerns between a **Next.js Frontend** (App Router, RSC, TanStack Query) and a standalone **Node.js/Express Backend** backed by **PostgreSQL** (via Prisma ORM).

---

## Technical Architecture & Stack

- **Frontend**: Next.js 16 (App Router, RSC), React 19, TanStack React Query v5, Tailwind CSS v4, `@hello-pangea/dnd`, Lucide Icons.
- **Backend**: Node.js, Express.js (REST API Architecture), JWT Auth Middleware (`Bearer` token format), `bcryptjs` password hashing, `zod` input validation.
- **Database**: PostgreSQL (Prisma ORM schema with foreign key constraints and performance indexes on `project_id`, `assigned_to`, `status`, and `priority`).

---

## Repository Structure


```text
Octabrain/
├── client/                       # Next.js App Router frontend
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   ├── components/           # KanbanBoard, TaskCard, ProjectsList, Navbar
│   │   ├── lib/                  # API client, QueryProvider, AuthContext
│   │   └── types/                # TypeScript interfaces
│   ├── .env.local                # Local only, not committed
│   └── package.json
│
├── server/                       # Express REST API backend
│   ├── prisma/                   # PostgreSQL schema and seed script
│   ├── src/
│   │   ├── controllers/          # Auth, project, and task controllers
│   │   ├── middleware/           # JWT auth and error handling
│   │   ├── routes/               # API routes
│   │   └── index.ts              # Server entry point
│   ├── .env.example              # Environment variable template
│   └── package.json
│
└── docs/
      └── postman_collection.json   # Postman REST API collection
```


## Local Environment Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database running locally or remote (e.g. Neon / Local Postgres)

---

### 1. Backend Setup (`server/`)

1. Navigate to server folder:
   ```bash
   cd server
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and set your PostgreSQL connection string:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow?schema=public"
   JWT_SECRET="super-secret-taskflow-jwt-key-2026"
   ```

3. Setup Database (Apply Schema & Seed Data):
   ```bash
   npm run db:setup
   ```
   > **Note**: `npm run db:setup` applies the relational Prisma schema with `prisma db push` and runs `prisma/seed.ts` to populate initial users, projects, and tasks. This command resets seeded data, so do not run it against a database containing data you need to keep.

4. Start Backend Server:
   ```bash
   npm run dev
   ```
   Server will run at `http://localhost:5000`.

---

### 2. Frontend Setup (`client/`)

1. Open a new terminal and navigate to client folder:
   ```bash
   cd client
   ```

2. Configure environment variables:
   Ensure `.env.local` contains:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

3. Install dependencies & launch dev server:
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:3000`.

---

## Demo Login Credentials

You can use the automatically seeded demo accounts to log in instantly:

- **Email**: `rifathasan1875@gmail.com`
- **Password**: `123456`

Environment files are intentionally excluded from Git. Copy `server/.env.example` to `server/.env` and create `client/.env.local` locally.

*(Alternatively, create a new account using the Registration page)*

---

## 📚 Comprehensive API Documentation

Your repository includes two complete forms of API documentation as required by the PRD:
1. **Postman Collection Export**: Located at [`docs/postman_collection.json`](docs/postman_collection.json) (ready to import directly into Postman).
2. **REST API Reference**: Detailed below with headers, request bodies, query parameters, and response schemas.

---

### Authentication Endpoints (Public)

#### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Rifat Hasan Nazim",
    "email": "rifathasan1875@gmail.com",
    "password": "123456"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm7...",
      "name": "Rifat Hasan Nazim",
      "email": "rifathasan1875@gmail.com"
    }
  }
  ```

#### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "rifathasan1875@gmail.com",
    "password": "123456"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm7...",
      "name": "Rifat Hasan Nazim",
      "email": "rifathasan1875@gmail.com"
    }
  }
  ```

---

### User & Project Endpoints (Protected - Require `Authorization: Bearer <token>`)

#### 3. Search Users
- **Endpoint**: `GET /api/users`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters**: `?search=alex` (optional name/email search string)
- **Success Response** (`200 OK`):
  ```json
  [
    {
      "id": "cm7...",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    }
  ]
  ```

#### 4. Fetch Projects
- **Endpoint**: `GET /api/projects`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Description**: Returns all projects owned by or assigned/shared with the authenticated user.
- **Success Response** (`200 OK`):
  ```json
  [
    {
      "id": "proj-123",
      "title": "TaskFlow App Launch",
      "description": "Full-stack Kanban application build",
      "owner_id": "cm7...",
      "created_at": "2026-08-21T11:00:00.000Z",
      "_count": { "tasks": 5 },
      "owner": { "id": "cm7...", "name": "Rifat", "email": "rifat@example.com" }
    }
  ]
  ```

#### 5. Create Project
- **Endpoint**: `POST /api/projects`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "title": "TaskFlow Release v1",
    "description": "Full-stack Kanban application build"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "id": "proj-124",
    "title": "TaskFlow Release v1",
    "description": "Full-stack Kanban application build",
    "owner_id": "cm7...",
    "created_at": "2026-08-21T12:00:00.000Z"
  }
  ```

---

### Task Endpoints (Protected - Require `Authorization: Bearer <token>`)

#### 6. Fetch Project Tasks
- **Endpoint**: `GET /api/projects/:id/tasks`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters (Optional Filters)**:
  - `status`: `TODO` | `IN_PROGRESS` | `DONE`
  - `priority`: `LOW` | `MEDIUM` | `HIGH`
  - `search`: Filter by task title string
- **Note**: Non-owners fetching tasks receive strictly tasks assigned to them (`assigned_to = userId`).
- **Success Response** (`200 OK`):
  ```json
  [
    {
      "id": "task-001",
      "project_id": "proj-123",
      "title": "Setup JWT Authentication",
      "description": "Create signup and login routes",
      "status": "DONE",
      "priority": "HIGH",
      "assigned_to": "user-456",
      "due_date": "2026-08-25T00:00:00.000Z",
      "created_at": "2026-08-21T11:30:00.000Z",
      "assignee": { "name": "Sarah Connor", "email": "sarah@example.com" }
    }
  ]
  ```

#### 7. Create Task
- **Endpoint**: `POST /api/projects/:id/tasks`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Note**: Restricted to Project Owners only.
- **Request Body**:
  ```json
  {
    "title": "Implement Drag & Drop Kanban",
    "description": "Use @hello-pangea/dnd for column movement",
    "status": "TODO",
    "priority": "HIGH",
    "assigned_to": "user-456",
    "due_date": "2026-08-28"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "id": "task-002",
    "project_id": "proj-123",
    "title": "Implement Drag & Drop Kanban",
    "description": "Use @hello-pangea/dnd for column movement",
    "status": "TODO",
    "priority": "HIGH",
    "assigned_to": "user-456",
    "due_date": "2026-08-28T00:00:00.000Z",
    "created_at": "2026-08-21T12:15:00.000Z"
  }
  ```

#### 8. Update Task (PATCH)
- **Endpoint**: `PATCH /api/tasks/:id`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body** (partial fields allowed):
  ```json
  {
    "status": "IN_PROGRESS",
    "priority": "MEDIUM"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "id": "task-002",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM"
  }
  ```

#### 9. Delete Task
- **Endpoint**: `DELETE /api/tasks/:id`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Success Response** (`200 OK`):
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```

---

## ✨ Features & Architecture Highlights

1. **State Management & Data Synchronization (TanStack Query)**:
   - Client-side data fetching with `@tanstack/react-query`.
   - Optimistic UI updates when dragging tasks across columns or changing status.
   - Cache invalidation (`queryClient.invalidateQueries`) on task creation, edit, or deletion.

2. **React Server Components (RSC) vs Client Components**:
   - Layout shells and initial loads powered by RSC for fast initial page load and SEO.
   - Interactive elements (`KanbanBoard`, modals, search filters) encapsulated in Client Components (`'use client'`).

3. **Database Integrity & Security**:
   - Foreign key constraints with `onDelete: Cascade` / `SetNull`.
   - Indexed database fields (`project_id`, `assigned_to`, `status`, `priority`) for optimized query performance.
   - Parameterized queries via Prisma ORM preventing SQL Injection.

4. **UI & Aesthetic Design**:
   - Built with modern glassmorphism design system, dark mode, smooth hover micro-animations, priority color badges, and interactive column drag-and-drop feedback.
