import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { getProjects, createProject, getProjectTasks, createTask } from '../controllers/projectController';
import { updateTask, deleteTask } from '../controllers/taskController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Auth Routes (Public)
router.post('/auth/register', register);
router.post('/auth/login', login);

// Project & Task Routes (Protected)
router.get('/projects', authenticateJWT, getProjects);
router.post('/projects', authenticateJWT, createProject);
router.get('/projects/:id/tasks', authenticateJWT, getProjectTasks);
router.post('/projects/:id/tasks', authenticateJWT, createTask);
router.patch('/tasks/:id', authenticateJWT, updateTask);
router.delete('/tasks/:id', authenticateJWT, deleteTask);

export default router;
