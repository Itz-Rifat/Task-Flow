# TaskFlow API Documentation

Base URL: `http://localhost:5000`

All API routes are prefixed with `/api`.

## Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Use `Content-Type: application/json` for requests with JSON bodies.

## Auth Endpoints

### Register User

`POST /api/auth/register`

Request body:

```json
{
  "name": "Rifat Hasan Nazim",
  "email": "rifathasan1875@gmail.com",
  "password": "123456"
}
```

Returns `201 Created` with a JWT token and the created user.

### Login User

`POST /api/auth/login`

Request body:

```json
{
  "email": "rifathasan1875@gmail.com",
  "password": "123456"
}
```

Returns `200 OK` with a JWT token and the authenticated user.

## User Endpoints

### Search Users

`GET /api/users?search=alex`

Protected. The `search` query parameter is optional and matches user names or email addresses.

Returns `200 OK` with an array of matching users.

## Project Endpoints

### Get User Projects

`GET /api/projects`

Protected. Returns projects owned by or shared with the authenticated user, including task counts and owner information.

Returns `200 OK`.

### Create Project

`POST /api/projects`

Protected.

Request body:

```json
{
  "title": "TaskFlow Release v1",
  "description": "Full-stack Kanban application build"
}
```

Returns `201 Created` with the new project.

## Task Endpoints

### Get Project Tasks

`GET /api/projects/:projectId/tasks`

Protected. Supported optional query parameters:

- `status`: `TODO`, `IN_PROGRESS`, or `DONE`
- `priority`: `LOW`, `MEDIUM`, or `HIGH`
- `search`: searches task titles

Non-owners receive only tasks assigned to themselves. Results are ordered by priority (`HIGH`, `MEDIUM`, `LOW`), then earliest due date. Tasks without due dates are placed after dated tasks and use newest creation time as the fallback.

Returns `200 OK`.

### Create Task

`POST /api/projects/:projectId/tasks`

Protected. Project owners only.

Request body:

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

`description`, `status`, `priority`, `assigned_to`, and `due_date` are optional. Returns `201 Created`.

### Update Task

`PATCH /api/tasks/:taskId`

Protected. The project owner or assigned user may update a task. Assignment changes are restricted to the project owner.

Request body supports partial updates:

```json
{
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "assigned_to": "user-456",
  "due_date": "2026-08-28"
}
```

Returns `200 OK` with the updated task.

### Delete Task

`DELETE /api/tasks/:taskId`

Protected. The project owner or assigned user may delete the task.

Returns `200 OK`:

```json
{
  "message": "Task deleted successfully",
  "id": "task-002"
}
```

## Common Errors

- `400 Bad Request`: invalid request body or query value
- `401 Unauthorized`: missing or invalid JWT
- `403 Forbidden`: authenticated user lacks permission
- `404 Not Found`: resource does not exist or is not accessible
- `500 Internal Server Error`: unexpected server error

## Postman Collection

A ready-to-import collection is available at [`postman_collection.json`](postman_collection.json). Set `base_url` to `http://localhost:5000` and `jwt_token` to a token returned by login.
