"use server";

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from './session';

// Helper to get user ID
async function requireUser() {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error("Unauthorized: Please log in.");
  }
  return session.userId as string;
}

// User Actions
export async function createUser(name: string, email: string, passwordHash: string) {
  if (!name || !email || !passwordHash) {
    throw new Error("Missing required fields: name, email, or password.");
  }
  if (!email.includes('@')) {
    throw new Error("Invalid email format.");
  }

  return await prisma.user.create({
    data: { name, email, password: passwordHash }
  });
}

// Task Actions
export async function getTasks() {
  const userId = await requireUser();
  
  return await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createTask(data: { title: string; description?: string; dueDate?: Date; priority: string; tags: string[] }) {
  const userId = await requireUser();

  if (!data.title || data.title.trim() === '') {
    throw new Error("Task title cannot be empty.");
  }

  const task = await prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim(),
      dueDate: data.dueDate,
      priority: data.priority || 'Med',
      tags: data.tags || [],
      userId
    }
  });
  revalidatePath('/');
  return task;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const userId = await requireUser();

  if (!taskId || !status) {
    throw new Error("Task ID and status are required.");
  }

  const task = await prisma.task.update({
    where: { id: taskId, userId }, // Ensure the user owns it
    data: { status }
  });
  revalidatePath('/');
  return task;
}

export async function deleteTask(taskId: string) {
  const userId = await requireUser();

  if (!taskId) {
    throw new Error("Task ID is required for deletion.");
  }

  await prisma.task.delete({
    where: { id: taskId, userId } // Ensure the user owns it
  });
  revalidatePath('/');
}

export async function syncTasks(localTasks: any[]) {
  const userId = await requireUser();

  if (!localTasks || localTasks.length === 0) return { success: true, count: 0 };

  const taskData = localTasks.map(task => ({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    priority: task.priority || 'Med',
    status: task.status || 'todo',
    tags: task.tags || [],
    userId,
  }));

  const result = await prisma.task.createMany({
    data: taskData
  });

  revalidatePath('/');
  return { success: true, count: result.count };
}
