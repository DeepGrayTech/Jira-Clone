"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Bug } from "../types";

interface BugContextType {
  bugs: Bug[];
  setBugs: React.Dispatch<React.SetStateAction<Bug[]>>;
  addBug: (bug: Bug) => void;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  deleteBug: (id: string) => void;
  getBugById: (id: string) => Bug | undefined;
}

const BugContext = createContext<BugContextType | undefined>(undefined);

export const BugProvider = ({ children }: { children: ReactNode }) => {
  const [bugs, setBugs] = useState<Bug[]>([]);

  const addBug = useCallback((bug: Bug) => {
    setBugs((prev) => [...prev, bug]);
  }, []);

  const updateBug = useCallback((id: string, updates: Partial<Bug>) => {
    setBugs((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      )
    );
  }, []);

  const deleteBug = useCallback((id: string) => {
    setBugs((prev) => {
      const beforeCount = prev.length;
      const after = prev.filter((b) => b.id !== id);
      const afterCount = after.length;
      console.log(`[BugContext] DELETE bug | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=${beforeCount - afterCount}`);
      return after;
    });
  }, []);

  const getBugById = useCallback(
    (id: string) => {
      return bugs.find((b) => b.id === id);
    },
    [bugs]
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