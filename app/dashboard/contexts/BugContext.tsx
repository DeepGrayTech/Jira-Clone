"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { Bug } from "../types";
import { createBugApi, updateBugApi, deleteBugApi } from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistBugs(bugs: Bug[]) {
  try {
    const payload = JSON.stringify(bugs);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.BUGS, encrypted || payload);
    });
  } catch (error) {
    console.error("[BugContext] 持久化到 localStorage 失败:", error);
  }
}

interface BugContextType {
  bugs: Bug[];
  setBugs: React.Dispatch<React.SetStateAction<Bug[]>>;
  addBug: (bug: Bug) => Promise<void>;
  updateBug: (id: string, updates: Partial<Bug>) => Promise<void>;
  deleteBug: (id: string) => Promise<void>;
  getBugById: (id: string) => Bug | undefined;
}

const BugContext = createContext<BugContextType | undefined>(undefined);

export const BugProvider = ({ children }: { children: ReactNode }) => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const bugsRef = useRef(bugs);
  bugsRef.current = bugs;

  const addBug = useCallback(async (bug: Bug) => {
    try {
      const created = await createBugApi(bug);
      setBugs((prev) => {
        const next = [...prev, created];
        persistBugs(next);
        return next;
      });
    } catch (error) {
      console.warn("[BugContext] addBug API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setBugs((prev) => {
        const next = [...prev, bug];
        persistBugs(next);
        return next;
      });
    }
  }, []);

  const updateBug = useCallback(async (id: string, updates: Partial<Bug>) => {
    setBugs((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      persistBugs(next);
      return next;
    });
    try {
      const updated = await updateBugApi(id, updates);
      setBugs((prev) => {
        const next = prev.map((b) => (b.id === id ? updated : b));
        persistBugs(next);
        return next;
      });
    } catch (error) {
      console.warn("[BugContext] updateBug API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteBug = useCallback(async (id: string) => {
    const beforeCount = bugsRef.current.length;
    setBugs((prev) => {
      const next = prev.filter((b) => b.id !== id);
      persistBugs(next);
      return next;
    });
    try {
      await deleteBugApi(id);
      const afterCount = bugsRef.current.length - 1;
      console.log(`[BugContext] DELETE bug | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=1`);
    } catch (error) {
      console.warn("[BugContext] deleteBug API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const getBugById = useCallback(
    (id: string) => {
      return bugsRef.current.find((b) => b.id === id);
    },
    []
  );

  return (
    <BugContext.Provider
      value={{ bugs, setBugs, addBug, updateBug, deleteBug, getBugById }}
    >
      {children}
    </BugContext.Provider>
  );
};

export const useBugs = () => {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error("useBugs must be used within BugProvider");
  }
  return context;
};
