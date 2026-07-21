"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { Task } from "../types";
import { createTaskApi, updateTaskApi, deleteTaskApi } from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistTasks(tasks: Task[]) {
  try {
    const payload = JSON.stringify(tasks);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.TASKS, encrypted || payload);
    });
  } catch (error) {
    console.error("[TaskContext] 持久化到 localStorage 失败:", error);
  }
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ 
  children, 
  initialTasks = [] 
}: { 
  children: ReactNode; 
  initialTasks?: Task[]; 
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const addTask = useCallback(async (task: Task) => {
    console.log("[TaskContext] addTask | taskId=", task.id, "| title=", task.title, "| assignee=", task.assignee);
    try {
      const created = await createTaskApi(task);
      setTasks((prev) => {
        const next = [...prev, created];
        persistTasks(next);
        return next;
      });
      console.log("[TaskContext] addTask 完成 | 任务总数:", tasksRef.current.length + 1);
    } catch (error) {
      console.warn("[TaskContext] addTask API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setTasks((prev) => {
        const next = [...prev, task];
        persistTasks(next);
        return next;
      });
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    console.log("[TaskContext] updateTask | taskId=", id, "| updates=", updates);
    setTasks((prev) => {
      const next = prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );
      persistTasks(next);
      return next;
    });
    try {
      const updated = await updateTaskApi(id, updates);
      setTasks((prev) => {
        const next = prev.map((task) => (task.id === id ? updated : task));
        persistTasks(next);
        return next;
      });
    } catch (error) {
      console.warn("[TaskContext] updateTask API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const beforeCount = tasksRef.current.length;
    setTasks((prev) => {
      const next = prev.filter((task) => task.id !== id);
      persistTasks(next);
      return next;
    });
    try {
      await deleteTaskApi(id);
      console.log(`[TaskContext] DELETE task | id=${id} | before=${beforeCount} | deleted=${1}`);
    } catch (error) {
      console.warn("[TaskContext] deleteTask API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const getTaskById = useCallback(
    (id: string) => {
      return tasksRef.current.find((task) => task.id === id);
    },
    []
  );

  return (
    <TaskContext.Provider
      value={{ tasks, setTasks, addTask, updateTask, deleteTask, getTaskById }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
};
