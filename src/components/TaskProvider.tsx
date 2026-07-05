"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import db, { LocalTask } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getTasks, createTask, updateTaskStatus, deleteTask, syncTasks } from '@/lib/actions';
import { logout } from '@/lib/auth-actions';

type TaskContextType = {
  tasks: any[];
  isAuth: boolean;
  isLoading: boolean;
  addTask: (data: any) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
  setAuth: (val: boolean) => void;
  logoutUser: () => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children, initialIsAuth }: { children: React.ReactNode, initialIsAuth: boolean }) {
  const [isAuth, setAuth] = useState(initialIsAuth);
  const [serverTasks, setServerTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const localTasks = useLiveQuery(() => db.tasks.toArray()) || [];

  const fetchServerTasks = useCallback(async () => {
    if (!isAuth) return;
    try {
      const data = await getTasks();
      setServerTasks(data);
    } catch (error) {
      console.error("Failed to fetch server tasks", error);
    }
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) {
      fetchServerTasks().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [isAuth, fetchServerTasks]);

  const tasks = isAuth ? serverTasks : localTasks;

  const addTask = async (data: any) => {
    if (isAuth) {
      await createTask(data);
      await fetchServerTasks();
    } else {
      await db.tasks.add({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        title: data.title,
        description: data.description,
        status: 'todo',
        priority: data.priority || 'Med',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        tags: data.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (isAuth) {
      await updateTaskStatus(id, status);
      await fetchServerTasks();
    } else {
      await db.tasks.update(id, { status, updatedAt: new Date() });
    }
  };

  const removeTask = async (id: string) => {
    if (isAuth) {
      await deleteTask(id);
      await fetchServerTasks();
    } else {
      await db.tasks.delete(id);
    }
  };

  const syncLocalToCloud = async () => {
    if (!isAuth) return;
    const allLocal = await db.tasks.toArray();
    if (allLocal.length > 0) {
      await syncTasks(allLocal);
      await db.tasks.clear();
      await fetchServerTasks();
    }
  };

  const logoutUser = async () => {
    await logout();
    setAuth(false);
    setServerTasks([]);
  };

  return (
    <TaskContext.Provider value={{ tasks, isAuth, isLoading, addTask, updateStatus, removeTask, syncLocalToCloud, setAuth, logoutUser }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
