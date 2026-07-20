"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Epic } from "../types";

interface EpicContextType {
  epics: Epic[];
  currentEpicId: string | null;
  setEpics: React.Dispatch<React.SetStateAction<Epic[]>>;
  setCurrentEpicId: React.Dispatch<React.SetStateAction<string | null>>;
  addEpic: (epic: Epic) => void;
  updateEpic: (id: string, updates: Partial<Epic>) => void;
  deleteEpic: (id: string) => void;
  getEpicById: (id: string) => Epic | undefined;
  setCurrentEpic: (epicId: string | null) => void;
}

const EpicContext = createContext<EpicContextType | undefined>(undefined);

export const EpicProvider = ({ 
  children, 
  initialEpics = [],
  initialCurrentEpicId = null
}: { 
  children: ReactNode; 
  initialEpics?: Epic[];
  initialCurrentEpicId?: string | null;
}) => {
  const [epics, setEpics] = useState<Epic[]>(initialEpics);
  const [currentEpicId, setCurrentEpicId] = useState<string | null>(initialCurrentEpicId);

  const addEpic = useCallback((epic: Epic) => {
    console.log(`[EpicContext] addEpic | START | id=${epic.id} | title="${epic.title}" | currentEpicsCount=${epics.length}`);
    setEpics((prev) => {
      const newEpics = [...prev, epic];
      console.log(`[EpicContext] addEpic | COMPLETE | newEpicsCount=${newEpics.length}`);
      return newEpics;
    });
  }, [epics.length]);

  const updateEpic = useCallback((id: string, updates: Partial<Epic>) => {
    setEpics((prev) => {
      const targetEpic = prev.find((e) => e.id === id);
      const changedFields = targetEpic ? Object.keys(updates).filter((key) => updates[key as keyof Epic] !== targetEpic![key as keyof Epic]) : [];
      console.log(`[EpicContext] UPDATE epic | id=${id} | changedFields=[${changedFields.join(', ')}] | updates=${JSON.stringify(updates)}`);
      return prev.map((epic) =>
        epic.id === id ? { ...epic, ...updates, updatedAt: new Date().toISOString() } : epic
      );
    });
  }, []);

  const deleteEpic = useCallback((id: string) => {
    setEpics((prev) => {
      const beforeCount = prev.length;
      const after = prev.filter((epic) => epic.id !== id);
      const afterCount = after.length;
      const wasCurrent = currentEpicId === id;
      console.log(`[EpicContext] DELETE epic | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=${beforeCount - afterCount} | wasCurrent=${wasCurrent}`);
      return after;
    });
    if (currentEpicId === id) {
      console.log(`[EpicContext] Resetting currentEpicId to null (deleted epic was selected)`);
      setCurrentEpicId(null);
    }
  }, [currentEpicId]);

  const getEpicById = useCallback(
    (id: string) => {
      return epics.find((epic) => epic.id === id);
    },
    [epics]
  );

  const setCurrentEpic = useCallback((epicId: string | null) => {
    console.log(`[EpicContext] setCurrentEpic | changing | from=${currentEpicId} | to=${epicId}`);
    setCurrentEpicId(epicId);
    console.log(`[EpicContext] setCurrentEpic | COMPLETE | currentEpicId=${epicId}`);
  }, [currentEpicId]);

  return (
    <EpicContext.Provider
      value={{ 
        epics, 
        currentEpicId,
        setEpics, 
        setCurrentEpicId,
        addEpic, 
        updateEpic, 
        deleteEpic, 
        getEpicById,
        setCurrentEpic
      }}
    >
      {children}
    </EpicContext.Provider>
  );
};

export const useEpics = () => {
  const context = useContext(EpicContext);
  if (!context) {
    throw new Error("useEpics must be used within EpicProvider");
  }
  return context;
};