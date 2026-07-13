"use client";

import { useState, useEffect } from "react";
import { validateDataIntegrity } from "@/lib/validation";
import type {
  ValidationResult,
  Task,
  Requirement,
  TestCase,
  Bug,
  Goal,
  Milestone,
  KeyResult,
} from "../types";

/**
 * Validation hook.
 * Validates all loaded data for integrity after initialization.
 * Filters out corrupt data objects and records validation results.
 */
export function useValidation(
  isInitialized: boolean,
  tasks: Task[],
  requirements: Requirement[],
  testCases: TestCase[],
  bugs: Bug[],
  goals: Goal[],
  milestones: Milestone[],
  keyResults: KeyResult[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>,
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>,
  setBugs: React.Dispatch<React.SetStateAction<Bug[]>>,
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>,
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>,
  setKeyResults: React.Dispatch<React.SetStateAction<KeyResult[]>>
) {
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [showValidationBanner, setShowValidationBanner] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    const results: ValidationResult[] = [];
    const allResults: ValidationResult[] = [];

    const dataTypes: {
      key: string;
      data: unknown[];
      setter: React.Dispatch<React.SetStateAction<unknown[]>>;
      fallback: unknown[];
    }[] = [
      {
        key: "Task",
        data: tasks,
        setter: setTasks as React.Dispatch<React.SetStateAction<unknown[]>>,
        fallback: [],
      },
      {
        key: "Requirement",
        data: requirements,
        setter: setRequirements as React.Dispatch<
          React.SetStateAction<unknown[]>
        >,
        fallback: [],
      },
      {
        key: "TestCase",
        data: testCases,
        setter: setTestCases as React.Dispatch<React.SetStateAction<unknown[]>>,
        fallback: [],
      },
      {
        key: "Bug",
        data: bugs,
        setter: setBugs as React.Dispatch<React.SetStateAction<unknown[]>>,
        fallback: [],
      },
      {
        key: "Goal",
        data: goals,
        setter: setGoals as React.Dispatch<React.SetStateAction<unknown[]>>,
        fallback: [],
      },
      {
        key: "Milestone",
        data: milestones,
        setter: setMilestones as React.Dispatch<
          React.SetStateAction<unknown[]>
        >,
        fallback: [],
      },
      {
        key: "KeyResult",
        data: keyResults,
        setter: setKeyResults as React.Dispatch<
          React.SetStateAction<unknown[]>
        >,
        fallback: [],
      },
    ];

    for (const { key, data, setter, fallback } of dataTypes) {
      if (data.length === 0) continue;

      const result = validateDataIntegrity(
        data,
        key as Parameters<typeof validateDataIntegrity>[1]
      );
      allResults.push(result);
      if (result.errors.length > 0) {
        results.push(result);

        // Filter out invalid items (those with errors)
        const invalidIds = new Set(result.errors.map((e) => e.id));
        const validData = data.filter(
          (item: unknown) =>
            typeof (item as Record<string, unknown>)?.id === "string" &&
            !invalidIds.has((item as Record<string, unknown>).id as string)
        );

        if (validData.length > 0) {
          setter(validData);
        } else {
          // If all data is invalid, use fallback
          setter(fallback);
        }
      }
    }

    const totalIssues = allResults.filter((r) => !r.isValid).length;
    console.log("[useValidation] 数据完整性校验完成:", {
      totalTypes: allResults.length,
      validTypes: allResults.filter((r) => r.isValid).length,
      totalIssues,
      issues: allResults
        .filter((r) => !r.isValid)
        .map((r) => ({ type: r.type, errors: r.errors.length })),
    });

    if (results.length > 0) {
      setValidationResults(results);
      setShowValidationBanner(true);
    }
  }, [isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    validationResults,
    setValidationResults,
    showValidationBanner,
    setShowValidationBanner,
  };
}
