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


Octabrain/
├── client/                 # Next.js App Router Frontend
│   ├── src/
│   │   ├── app/            # App Router pages (RSC initial shells + Client components)
│   │   ├── components/     # KanbanBoard, TaskCard, ProjectsList, Navbar
│   │   ├── lib/            # Axios API client, TanStack QueryProvider, AuthContext
│   │   └── types/          # TypeScript interfaces
│   ├── .env.local
│   └── package.json
│
├── server/                 # Express REST API Backend
│   ├── prisma/             # PostgreSQL schema.prisma & seed.ts script
│   ├── src/
│   │   ├── controllers/    # authController, projectController, taskController
│   │   ├── middleware/     # JWT Auth middleware, global error handler
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   ├── .env
│   └── package.json
│
└── docs/
    └── postman_collection.json # Exported Postman REST API Collection




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

## API Documentation

A complete, ready-to-import Postman collection is located at [`docs/postman_collection.json`](file:///e:/Programming%20Hero/Octabrain/docs/postman_collection.json).

### Core REST Endpoints Summary:

#### Auth Routes (Public)
- `POST /api/auth/register` — User signup & password hashing (bcrypt).
- `POST /api/auth/login` — Authentication & JWT emission.

#### Project & Task Routes (Protected via JWT `Authorization: Bearer <token>`)
- `GET /api/projects` — Fetch projects owned by or assigned to user.
- `POST /api/projects` — Create project.
- `GET /api/projects/:id/tasks` — Fetch tasks (supports query filtering: `?status=IN_PROGRESS&priority=HIGH&search=title`).
- `POST /api/projects/:id/tasks` — Create task.
- `PATCH /api/tasks/:id` — Update status, priority, or assignee (used for drag & drop column status updates).
- `DELETE /api/tasks/:id` — Delete task.

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
