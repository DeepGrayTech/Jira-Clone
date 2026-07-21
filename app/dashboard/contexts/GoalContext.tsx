"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { Goal, Milestone, KeyResult } from "../types";
import {
  createGoalApi,
  updateGoalApi,
  deleteGoalApi,
  createMilestoneApi,
  updateMilestoneApi,
  deleteMilestoneApi,
  createKeyResultApi,
  updateKeyResultApi,
  deleteKeyResultApi,
} from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistGoals(goals: Goal[]) {
  try {
    const payload = JSON.stringify(goals);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.GOALS, encrypted || payload);
    });
  } catch (error) {
    console.error("[GoalContext] persistGoals 失败:", error);
  }
}

function persistMilestones(milestones: Milestone[]) {
  try {
    const payload = JSON.stringify(milestones);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.MILESTONES, encrypted || payload);
    });
  } catch (error) {
    console.error("[GoalContext] persistMilestones 失败:", error);
  }
}

function persistKeyResults(keyResults: KeyResult[]) {
  try {
    const payload = JSON.stringify(keyResults);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.KEY_RESULTS, encrypted || payload);
    });
  } catch (error) {
    console.error("[GoalContext] persistKeyResults 失败:", error);
  }
}

interface GoalContextType {
  goals: Goal[];
  milestones: Milestone[];
  keyResults: KeyResult[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  setKeyResults: React.Dispatch<React.SetStateAction<KeyResult[]>>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (milestone: Milestone) => Promise<void>;
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  addKeyResult: (keyResult: KeyResult) => Promise<void>;
  updateKeyResult: (id: string, updates: Partial<KeyResult>) => Promise<void>;
  deleteKeyResult: (id: string) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const goalsRef = useRef(goals);
  const milestonesRef = useRef(milestones);
  const keyResultsRef = useRef(keyResults);
  goalsRef.current = goals;
  milestonesRef.current = milestones;
  keyResultsRef.current = keyResults;

  const addGoal = useCallback(async (goal: Goal) => {
    try {
      const created = await createGoalApi(goal);
      setGoals((prev) => {
        const next = [...prev, created];
        persistGoals(next);
        return next;
      });
    } catch (error) {
      console.warn("[GoalContext] addGoal API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setGoals((prev) => {
        const next = [...prev, goal];
        persistGoals(next);
        return next;
      });
    }
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, ...updates } : g));
      persistGoals(next);
      return next;
    });
    try {
      const updated = await updateGoalApi(id, updates);
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? updated : g));
        persistGoals(next);
        return next;
      });
    } catch (error) {
      console.warn("[GoalContext] updateGoal API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const beforeGoals = goalsRef.current.length;
    const beforeMilestones = milestonesRef.current.length;
    const beforeKeyResults = keyResultsRef.current.length;
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      persistGoals(next);
      return next;
    });
    setMilestones((prev) => {
      const next = prev.filter((m) => m.goalId !== id);
      persistMilestones(next);
      return next;
    });
    setKeyResults((prev) => {
      const next = prev.filter((kr) => kr.goalId !== id);
      persistKeyResults(next);
      return next;
    });
    try {
      await deleteGoalApi(id);
      const afterGoals = goalsRef.current.length;
      console.log(`[GoalContext] DELETE goal | id=${id} | before=${beforeGoals} | after=${afterGoals} | deleted=${beforeGoals - afterGoals}`);
      const afterMilestones = milestonesRef.current.length;
      if (beforeMilestones !== afterMilestones) {
        console.log(`[GoalContext] DELETE milestones | goalId=${id} | deleted=${beforeMilestones - afterMilestones}`);
      }
      const afterKeyResults = keyResultsRef.current.length;
      if (beforeKeyResults !== afterKeyResults) {
        console.log(`[GoalContext] DELETE keyResults | goalId=${id} | deleted=${beforeKeyResults - afterKeyResults}`);
      }
    } catch (error) {
      console.warn("[GoalContext] deleteGoal API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const addMilestone = useCallback(async (milestone: Milestone) => {
    try {
      const created = await createMilestoneApi({
        title: milestone.title,
        dueDate: milestone.dueDate,
        status: milestone.completed ? "COMPLETED" : "PENDING",
        goalId: milestone.goalId,
      });
      setMilestones((prev) => {
        const next = [...prev, created];
        persistMilestones(next);
        return next;
      });
    } catch (error) {
      console.warn("[GoalContext] addMilestone API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setMilestones((prev) => {
        const next = [...prev, milestone];
        persistMilestones(next);
        return next;
      });
    }
  }, []);

  const updateMilestone = useCallback(async (id: string, updates: Partial<Milestone>) => {
    setMilestones((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      persistMilestones(next);
      return next;
    });
    try {
      const payload: Partial<{ title?: string; dueDate?: string; status?: string }> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
      if (updates.completed !== undefined) {
        payload.status = updates.completed ? "COMPLETED" : "PENDING";
      } else if (updates.status !== undefined) {
        payload.status = updates.status;
      }
      const updated = await updateMilestoneApi(id, payload);
      setMilestones((prev) => {
        const next = prev.map((m) => (m.id === id ? updated : m));
        persistMilestones(next);
        return next;
      });
    } catch (error) {
      console.warn("[GoalContext] updateMilestone API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteMilestone = useCallback(async (id: string) => {
    setMilestones((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persistMilestones(next);
      return next;
    });
    try {
      await deleteMilestoneApi(id);
    } catch (error) {
      console.warn("[GoalContext] deleteMilestone API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const addKeyResult = useCallback(async (keyResult: KeyResult) => {
    try {
      const created = await createKeyResultApi({
        title: keyResult.title,
        target: keyResult.targetValue,
        current: keyResult.currentValue,
        status: keyResult.status,
        goalId: keyResult.goalId,
      });
      setKeyResults((prev) => {
        const next = [...prev, created];
        persistKeyResults(next);
        return next;
      });
    } catch (error) {
      console.warn("[GoalContext] addKeyResult API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setKeyResults((prev) => {
        const next = [...prev, keyResult];
        persistKeyResults(next);
        return next;
      });
    }
  }, []);

  const updateKeyResult = useCallback(async (id: string, updates: Partial<KeyResult>) => {
    setKeyResults((prev) => {
      const next = prev.map((kr) => (kr.id === id ? { ...kr, ...updates } : kr));
      persistKeyResults(next);
      return next;
    });
    try {
      const payload: Partial<{ title?: string; target?: number; current?: number; status?: string }> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.targetValue !== undefined) payload.target = updates.targetValue;
      if (updates.currentValue !== undefined) payload.current = updates.currentValue;
      if (updates.status !== undefined) payload.status = updates.status;
      const updated = await updateKeyResultApi(id, payload);
      setKeyResults((prev) => {
        const next = prev.map((kr) => (kr.id === id ? updated : kr));
        persistKeyResults(next);
        return next;
      });
    } catch (error) {
      console.warn("[GoalContext] updateKeyResult API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteKeyResult = useCallback(async (id: string) => {
    setKeyResults((prev) => {
      const next = prev.filter((kr) => kr.id !== id);
      persistKeyResults(next);
      return next;
    });
    try {
      await deleteKeyResultApi(id);
    } catch (error) {
      console.warn("[GoalContext] deleteKeyResult API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  return (
    <GoalContext.Provider
      value={{
        goals,
        milestones,
        keyResults,
        setGoals,
        setMilestones,
        setKeyResults,
        addGoal,
        updateGoal,
        deleteGoal,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        addKeyResult,
        updateKeyResult,
        deleteKeyResult,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error("useGoals must be used within GoalProvider");
  }
  return context;
};
