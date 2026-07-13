"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TestCase } from "../types";

interface TestCaseContextType {
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  addTestCase: (tc: TestCase) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  getTestCaseById: (id: string) => TestCase | undefined;
}

const TestCaseContext = createContext<TestCaseContextType | undefined>(undefined);

export const TestCaseProvider = ({ children }: { children: ReactNode }) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const addTestCase = useCallback((tc: TestCase) => {
    setTestCases((prev) => [...prev, tc]);
  }, []);

  const updateTestCase = useCallback((id: string, updates: Partial<TestCase>) => {
    setTestCases((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      )
    );
  }, []);

  const deleteTestCase = useCallback((id: string) => {
    setTestCases((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTestCaseById = useCallback(
    (id: string) => {
      return testCases.find((t) => t.id === id);
    },
    [testCases]
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