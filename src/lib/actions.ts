"use server";

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

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
export async function getTasks(userId: string) {
  if (!userId) {
    throw new Error("User ID is required to fetch tasks.");
  }
  return await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createTask(data: { title: string; description?: string; dueDate?: Date; priority: string; tags: string[]; userId: string }) {
  if (!data.title || data.title.trim() === '') {
    throw new Error("Task title cannot be empty.");
  }
  if (!data.userId) {
    throw new Error("User ID is required to create a task.");
  }

  const task = await prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim(),
      dueDate: data.dueDate,
      priority: data.priority || 'Med',
      tags: data.tags || [],
      userId: data.userId
    }
  });
  revalidatePath('/');
  return task;
}

export async function updateTaskStatus(taskId: string, status: string) {
  if (!taskId || !status) {
    throw new Error("Task ID and status are required.");
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status }
  });
  revalidatePath('/');
  return task;
}

export async function deleteTask(taskId: string) {
  if (!taskId) {
    throw new Error("Task ID is required for deletion.");
  }

  await prisma.task.delete({
    where: { id: taskId }
  });
  revalidatePath('/');
}
