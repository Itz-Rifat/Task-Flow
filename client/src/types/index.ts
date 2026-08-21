export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string | null;
  due_date?: string | null;
  created_at: string;
  assignee?: User | null;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  owner_id: string;
  created_at: string;
  owner?: User;
  _count?: {
    tasks: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
