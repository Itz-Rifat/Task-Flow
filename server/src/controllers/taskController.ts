import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assigned_to: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
});

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id as string;
    const userId = req.user!.userId;

    const parseResult = updateTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }

    const existingTask = await prisma.tasks.findUnique({
      where: { id: taskId },
      include: { project: { select: { owner_id: true } } },
    });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (existingTask.project.owner_id !== userId && existingTask.assigned_to !== userId) {
      return res.status(403).json({ error: 'You do not have access to this task' });
    }

    const updateData: any = {};
    const { title, description, status, priority, assigned_to, due_date } = parseResult.data;

    if (assigned_to !== undefined && existingTask.project.owner_id !== userId) {
      return res.status(403).json({ error: 'Only the project owner can change task assignments' });
    }

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;

    const updatedTask = await prisma.tasks.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id as string;
    const userId = req.user!.userId;

    const existingTask = await prisma.tasks.findUnique({
      where: { id: taskId },
      include: { project: { select: { owner_id: true } } },
    });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (existingTask.project.owner_id !== userId && existingTask.assigned_to !== userId) {
      return res.status(403).json({ error: 'You do not have access to this task' });
    }

    await prisma.tasks.delete({
      where: { id: taskId },
    });

    return res.status(200).json({ message: 'Task deleted successfully', id: taskId });
  } catch (error) {
    next(error);
  }
};
