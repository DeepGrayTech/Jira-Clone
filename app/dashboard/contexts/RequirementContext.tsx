"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Requirement } from "../types";

interface RequirementContextType {
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  addRequirement: (req: Requirement) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  getRequirementById: (id: string) => Requirement | undefined;
}

const RequirementContext = createContext<RequirementContextType | undefined>(undefined);

export const RequirementProvider = ({ children }: { children: ReactNode }) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  const addRequirement = useCallback((req: Requirement) => {
    setRequirements((prev) => [...prev, req]);
  }, []);

  const updateRequirement = useCallback((id: string, updates: Partial<Requirement>) => {
    setRequirements((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      )
    );
  }, []);

  const deleteRequirement = useCallback((id: string) => {
    setRequirements((prev) => {
      const beforeCount = prev.length;
      const after = prev.filter((req) => req.id !== id);
      const afterCount = after.length;
      console.log(`[RequirementContext] DELETE requirement | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=${beforeCount - afterCount}`);
      return after;
    });
  }, []);

  const getRequirementById = useCallback(
    (id: string) => {
      return requirements.find((req) => req.id === id);
    },
    [requirements]
  );

  return (
    <RequirementContext.Provider
      value={{ requirements, setRequirements, addRequirement, updateRequirement, deleteRequirement, getRequirementById }}
    >
      {children}
    </RequirementContext.Provider>
  );
};

export const useRequirements = () => {
  const context = useContext(RequirementContext);
  if (!context) {
    throw new Error("useRequirements must be used within RequirementProvider");
  }
  return context;
};