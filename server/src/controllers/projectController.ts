import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const projects = await prisma.projects.findMany({
      where: {
        OR: [
          { owner_id: userId },
          { tasks: { some: { assigned_to: userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }

    const { title, description } = parseResult.data;
    const userId = req.user!.userId;

    const project = await prisma.projects.create({
      data: {
        title,
        description,
        owner_id: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.userId;
    const { status, priority, search } = req.query;

    const project = await prisma.projects.findFirst({
      where: {
        id: projectId,
        OR: [
          { owner_id: userId },
          { tasks: { some: { assigned_to: userId } } },
        ],
      },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const whereClause: any = {
      project_id: projectId,
    };

    // If the user is NOT the project owner, show ONLY tasks assigned to this user
    if (project.owner_id !== userId) {
      whereClause.assigned_to = userId;
    }

    if (status && typeof status === 'string' && ['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      whereClause.status = status;
    }

    if (priority && typeof priority === 'string' && ['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      whereClause.priority = priority;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const tasks = await prisma.tasks.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.userId;

    const createTaskSchema = z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
      assigned_to: z.string().nullable().optional(),
      due_date: z.string().nullable().optional(),
    });

    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }

    const { title, description, status, priority, assigned_to, due_date } = parseResult.data;

    const project = await prisma.projects.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (project.owner_id !== userId) {
      return res.status(403).json({ error: 'Only the project owner can create tasks' });
    }

    const task = await prisma.tasks.create({
      data: {
        project_id: projectId,
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        assigned_to: assigned_to || null,
        due_date: due_date ? new Date(due_date) : null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};
