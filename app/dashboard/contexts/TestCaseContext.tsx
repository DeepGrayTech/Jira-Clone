"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { TestCase } from "../types";
import {
  createTestCaseApi,
  updateTestCaseApi,
  deleteTestCaseApi,
} from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistTestCases(testCases: TestCase[]) {
  try {
    const payload = JSON.stringify(testCases);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.TEST_CASES, encrypted || payload);
    });
  } catch (error) {
    console.error("[TestCaseContext] 持久化到 localStorage 失败:", error);
  }
}

interface TestCaseContextType {
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  addTestCase: (tc: TestCase) => Promise<void>;
  updateTestCase: (id: string, updates: Partial<TestCase>) => Promise<void>;
  deleteTestCase: (id: string) => Promise<void>;
  getTestCaseById: (id: string) => TestCase | undefined;
}

const TestCaseContext = createContext<TestCaseContextType | undefined>(undefined);

export const TestCaseProvider = ({ children }: { children: ReactNode }) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const testCasesRef = useRef(testCases);
  testCasesRef.current = testCases;

  const addTestCase = useCallback(async (tc: TestCase) => {
    try {
      const created = await createTestCaseApi(tc);
      setTestCases((prev) => {
        const next = [...prev, created];
        persistTestCases(next);
        return next;
      });
    } catch (error) {
      console.warn("[TestCaseContext] addTestCase API 失败，回退到本地状态:", error instanceof Error ? error.message : error);
      setTestCases((prev) => {
        const next = [...prev, tc];
        persistTestCases(next);
        return next;
      });
    }
  }, []);

  const updateTestCase = useCallback(async (id: string, updates: Partial<TestCase>) => {
    setTestCases((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      persistTestCases(next);
      return next;
    });
    try {
      const updated = await updateTestCaseApi(id, updates);
      setTestCases((prev) => {
        const next = prev.map((t) => (t.id === id ? updated : t));
        persistTestCases(next);
        return next;
      });
    } catch (error) {
      console.warn("[TestCaseContext] updateTestCase API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const deleteTestCase = useCallback(async (id: string) => {
    const beforeCount = testCasesRef.current.length;
    setTestCases((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persistTestCases(next);
      return next;
    });
    try {
      await deleteTestCaseApi(id);
      const afterCount = testCasesRef.current.length - 1;
      console.log(`[TestCaseContext] DELETE testCase | id=${id} | before=${beforeCount} | after=${afterCount} | deleted=1`);
    } catch (error) {
      console.warn("[TestCaseContext] deleteTestCase API 失败，保留本地状态:", error instanceof Error ? error.message : error);
    }
  }, []);

  const getTestCaseById = useCallback(
    (id: string) => {
      return testCasesRef.current.find((t) => t.id === id);
    },
    []
  );

  return (
    <TestCaseContext.Provider
      value={{ testCases, setTestCases, addTestCase, updateTestCase, deleteTestCase, getTestCaseById }}
    >
      {children}
    </TestCaseContext.Provider>
  );
};

export const useTestCases = () => {
  const context = useContext(TestCaseContext);
  if (!context) {
    throw new Error("useTestCases must be used within TestCaseProvider");
  }
  return context;
};
