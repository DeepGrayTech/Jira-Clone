"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Goal, Milestone, KeyResult } from "../types";

interface GoalContextType {
  goals: Goal[];
  milestones: Milestone[];
  keyResults: KeyResult[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  setKeyResults: React.Dispatch<React.SetStateAction<KeyResult[]>>;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  addKeyResult: (keyResult: KeyResult) => void;
  updateKeyResult: (id: string, updates: Partial<KeyResult>) => void;
  deleteKeyResult: (id: string) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);

  const addGoal = useCallback((goal: Goal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      )
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const beforeCount = prev.length;
      const after = prev.filter((g) => g.id !== id);
      const afterCount = after.length;
      console.log(`[GoalContext] DELETE goal | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=${beforeCount - afterCount}`);
      return after;
    });
    setMilestones((prev) => {
      const beforeCount = prev.length;
      const after = prev.filter((m) => m.goalId !== id);
      const afterCount = after.length;
      if (beforeCount !== afterCount) {
        console.log(`[GoalContext] DELETE milestones | goalId=${id} | deleted=${beforeCount - afterCount}`);
      }
      return after;
    });
    setKeyResults((prev) => {
      const beforeCount = prev.length;
      const after = prev.filter((kr) => kr.goalId !== id);
      const afterCount = after.length;
      if (beforeCount !== afterCount) {
        console.log(`[GoalContext] DELETE keyResults | goalId=${id} | deleted=${beforeCount - afterCount}`);
      }
      return after;
    });
  }, []);

  const addMilestone = useCallback((milestone: Milestone) => {
    setMilestones((prev) => [...prev, milestone]);
  }, []);

  const updateMilestone = useCallback((id: string, updates: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      )
    );
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addKeyResult = useCallback((keyResult: KeyResult) => {
    setKeyResults((prev) => [...prev, keyResult]);
  }, []);

  const updateKeyResult = useCallback((id: string, updates: Partial<KeyResult>) => {
    setKeyResults((prev) =>
      prev.map((kr) =>
        kr.id === id ? { ...kr, ...updates } : kr
      )
    );
  }, []);

  const deleteKeyResult = useCallback((id: string) => {
    setKeyResults((prev) => prev.filter((kr) => kr.id !== id));
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