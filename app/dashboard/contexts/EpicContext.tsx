"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { Epic } from "../types";
import { createEpicApi, updateEpicApi, deleteEpicApi } from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistEpics(epics: Epic[]) {
  try {
    const payload = JSON.stringify(epics);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.EPICS, encrypted || payload);
    });
  } catch (error) {
    console.error("[EpicContext] 持久化到 localStorage 失败:", error);
  }
}

interface EpicContextType {
  epics: Epic[];
  currentEpicId: string | null;
  setEpics: React.Dispatch<React.SetStateAction<Epic[]>>;
  setCurrentEpicId: React.Dispatch<React.SetStateAction<string | null>>;
  addEpic: (epic: Epic) => Promise<void>;
  updateEpic: (id: string, updates: Partial<Epic>) => Promise<void>;
  deleteEpic: (id: string) => Promise<void>;
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
  const epicsRef = useRef(epics);
  const currentEpicIdRef = useRef(currentEpicId);
  epicsRef.current = epics;
  currentEpicIdRef.current = currentEpicId;

  const addEpic = useCallback(async (epic: Epic) => {
    console.log(`[EpicContext] addEpic | START | id=${epic.id} | title="${epic.title}" | currentEpicsCount=${epicsRef.current.length}`);
    try {
      const created = await createEpicApi(epic);
      setEpics((prev) => {
        const next = [...prev, created];
        persistEpics(next);
        console.log(`[EpicContext] addEpic | COMPLETE | newEpicsCount=${next.length}`);
        return next;
      });
    } catch (error) {
      console.warn("[EpicContext] addEpic API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setEpics((prev) => {
        const next = [...prev, epic];
        persistEpics(next);
        return next;
      });
    }
  }, []);

  const updateEpic = useCallback(async (id: string, updates: Partial<Epic>) => {
    setEpics((prev) => {
      const next = prev.map((epic) => (
        epic.id === id ? { ...epic, ...updates, updatedAt: new Date().toISOString() } : epic
      ));
      persistEpics(next);
      return next;
    });

    try {
      const updated = await updateEpicApi(id, updates);
      setEpics((prev) => {
        const next = prev.map((epic) => (epic.id === id ? updated : epic));
        persistEpics(next);
        return next;
      });
    } catch (error) {
      console.warn("[EpicContext] updateEpic API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteEpic = useCallback(async (id: string) => {
    const beforeCount = epicsRef.current.length;
    const wasCurrent = currentEpicIdRef.current === id;
    setEpics((prev) => {
      const next = prev.filter((epic) => epic.id !== id);
      persistEpics(next);
      return next;
    });
    if (currentEpicIdRef.current === id) {
      console.log(`[EpicContext] Resetting currentEpicId to null (deleted epic was selected)`);
      setCurrentEpicId(null);
    }
    try {
      await deleteEpicApi(id);
      const afterCount = epicsRef.current.length - 1;
      console.log(`[EpicContext] DELETE epic | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=1 | wasCurrent=${wasCurrent}`);
    } catch (error) {
      console.warn("[EpicContext] deleteEpic API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const getEpicById = useCallback(
    (id: string) => {
      return epicsRef.current.find((epic) => epic.id === id);
    },
    []
  );

  const setCurrentEpic = useCallback((epicId: string | null) => {
    console.log(`[EpicContext] setCurrentEpic | changing | from=${currentEpicIdRef.current} | to=${epicId}`);
    setCurrentEpicId(epicId);
    console.log(`[EpicContext] setCurrentEpic | COMPLETE | currentEpicId=${epicId}`);
  }, []);

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
