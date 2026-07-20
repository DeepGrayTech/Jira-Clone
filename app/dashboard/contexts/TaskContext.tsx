"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Task } from "../types";

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
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

  const addTask = useCallback((task: Task) => {
    console.log("[TaskContext] addTask | taskId=", task.id, "| title=", task.title, "| assignee=", task.assignee);
    setTasks((prev) => {
      const newTasks = [...prev, task];
      console.log("[TaskContext] addTask 完成 | 任务总数:", newTasks.length);
      return newTasks;
    });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    console.log("[TaskContext] updateTask | taskId=", id, "| updates=", updates);
    setTasks((prev) => {
      const newTasks = prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );
      const updatedTask = newTasks.find(t => t.id === id);
      console.log("[TaskContext] updateTask 完成 | 更新后的任务:", updatedTask);
      return newTasks;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const beforeCount = prev.length;
      const after = prev.filter((task) => task.id !== id);
      const afterCount = after.length;
      console.log(`[TaskContext] DELETE task | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=${beforeCount - afterCount}`);
      return after;
    });
  }, []);

  const getTaskById = useCallback(
    (id: string) => {
      return tasks.find((task) => task.id === id);
    },
    [tasks]
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