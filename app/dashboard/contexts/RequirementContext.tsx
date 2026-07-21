"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { Requirement } from "../types";
import {
  createRequirementApi,
  updateRequirementApi,
  deleteRequirementApi,
} from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistRequirements(requirements: Requirement[]) {
  try {
    const payload = JSON.stringify(requirements);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, encrypted || payload);
    });
  } catch (error) {
    console.error("[RequirementContext] 持久化到 localStorage 失败:", error);
  }
}

interface RequirementContextType {
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  addRequirement: (req: Requirement) => Promise<void>;
  updateRequirement: (id: string, updates: Partial<Requirement>) => Promise<void>;
  deleteRequirement: (id: string) => Promise<void>;
  getRequirementById: (id: string) => Requirement | undefined;
}

const RequirementContext = createContext<RequirementContextType | undefined>(undefined);

export const RequirementProvider = ({ children }: { children: ReactNode }) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const requirementsRef = useRef(requirements);
  requirementsRef.current = requirements;

  const addRequirement = useCallback(async (req: Requirement) => {
    try {
      const created = await createRequirementApi(req);
      setRequirements((prev) => {
        const next = [...prev, created];
        persistRequirements(next);
        return next;
      });
    } catch (error) {
      console.warn("[RequirementContext] addRequirement API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setRequirements((prev) => {
        const next = [...prev, req];
        persistRequirements(next);
        return next;
      });
    }
  }, []);

  const updateRequirement = useCallback(async (id: string, updates: Partial<Requirement>) => {
    setRequirements((prev) => {
      const next = prev.map((req) => (req.id === id ? { ...req, ...updates } : req));
      persistRequirements(next);
      return next;
    });
    try {
      const updated = await updateRequirementApi(id, updates);
      setRequirements((prev) => {
        const next = prev.map((req) => (req.id === id ? updated : req));
        persistRequirements(next);
        return next;
      });
    } catch (error) {
      console.warn("[RequirementContext] updateRequirement API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteRequirement = useCallback(async (id: string) => {
    const beforeCount = requirementsRef.current.length;
    setRequirements((prev) => {
      const next = prev.filter((req) => req.id !== id);
      persistRequirements(next);
      return next;
    });
    try {
      await deleteRequirementApi(id);
      const afterCount = requirementsRef.current.length - 1;
      console.log(`[RequirementContext] DELETE requirement | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=1`);
    } catch (error) {
      console.warn("[RequirementContext] deleteRequirement API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const getRequirementById = useCallback(
    (id: string) => {
      return requirementsRef.current.find((req) => req.id === id);
    },
    []
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
