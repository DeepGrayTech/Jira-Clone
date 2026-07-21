"use client";

import { useLayoutEffect } from "react";
import { decryptData } from "@/lib/encryption";
import { STORAGE_KEYS, DATA_VERSION } from "../constants";
import {
  getDefaultTasks,
  getDefaultRequirements,
  getDefaultTestCases,
  getDefaultGoals,
  getDefaultMilestones,
  getDefaultKeyResults,
  getDefaultBugs,
  getDefaultAuditLogs,
  getDefaultComments,
  getDefaultEpics,
  getDefaultTagHistory,
} from "../data/default-data";
import {
  fetchTasks,
  fetchRequirements,
  fetchTestCases,
  fetchBugs,
  fetchGoals,
  fetchEpics,
  fetchAuditLogs,
  fetchComments,
  ApiError,
} from "../services/api";
import type {
  Task,
  Requirement,
  TestCase,
  Bug,
  Goal,
  Milestone,
  KeyResult,
  Comment,
  AuditLogEntry,
  Epic,
} from "../types";

/**
 * Data loading hook.
 * Loads all persisted data on mount. Strategy:
 * 1. Try loading from the backend API first.
 * 2. If the API fails (e.g. offline), fall back to localStorage.
 * 3. If localStorage is empty, use default data.
 */
export function useDataLoader(
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>,
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>,
  setBugs: React.Dispatch<React.SetStateAction<Bug[]>>,
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>,
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>,
  setKeyResults: React.Dispatch<React.SetStateAction<KeyResult[]>>,
  setTagHistory: React.Dispatch<React.SetStateAction<string[]>>,
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>,
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>,
  setEpics?: React.Dispatch<React.SetStateAction<Epic[]>>
) {
  const MAX_AUDIT_LOG_ENTRIES = 1000;

  useLayoutEffect(() => {
    let cancelled = false;

    const loadFromLocalStorage = async () => {
      const savedDataVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
      if (savedDataVersion !== DATA_VERSION) {
        localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
      }

      const loadArray = async <T,>(
        key: string,
        fallback: () => T[],
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        mergeDefaults = true
      ): Promise<T[]> => {
        const raw = localStorage.getItem(key);
        if (!raw) {
          const defaults = fallback();
          setter(defaults);
          return defaults;
        }

        let parsed: T[] | null = null;
        const decrypted = await decryptData<T[]>(raw);
        if (decrypted) {
          parsed = decrypted;
        } else {
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = null;
          }
        }

        if (!Array.isArray(parsed)) {
          const defaults = fallback();
          setter(defaults);
          return defaults;
        }

        if (mergeDefaults) {
          const defaults = fallback();
          const existingIds = new Set(parsed.map((item: any) => item.id));
          const merged = [...parsed];
          defaults.forEach((def) => {
            if (!existingIds.has((def as any).id)) {
              merged.push(def);
            }
          });
          setter(merged as T[]);
          return merged as T[];
        }

        setter(parsed);
        return parsed;
      };

      await loadArray(STORAGE_KEYS.TASKS, getDefaultTasks, setTasks);
      await loadArray(
        STORAGE_KEYS.REQUIREMENTS,
        getDefaultRequirements,
        setRequirements
      );
      await loadArray(
        STORAGE_KEYS.TEST_CASES,
        getDefaultTestCases,
        setTestCases
      );
      await loadArray(
        STORAGE_KEYS.TAG_HISTORY,
        getDefaultTagHistory,
        setTagHistory,
        false
      );
      await loadArray(STORAGE_KEYS.COMMENTS, getDefaultComments, setComments);
      await loadArray(STORAGE_KEYS.BUGS, getDefaultBugs, setBugs);
      await loadArray(STORAGE_KEYS.GOALS, getDefaultGoals, setGoals);
      await loadArray(
        STORAGE_KEYS.MILESTONES,
        getDefaultMilestones,
        setMilestones
      );
      await loadArray(
        STORAGE_KEYS.KEY_RESULTS,
        getDefaultKeyResults,
        setKeyResults
      );

      const rawAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (rawAuditLogs) {
        const decrypted = await decryptData<AuditLogEntry[]>(rawAuditLogs);
        if (decrypted) {
          setAuditLogs(decrypted.slice(0, MAX_AUDIT_LOG_ENTRIES));
        } else {
          try {
            setAuditLogs(
              JSON.parse(rawAuditLogs).slice(0, MAX_AUDIT_LOG_ENTRIES)
            );
          } catch {
            setAuditLogs(getDefaultAuditLogs());
          }
        }
      } else {
        setAuditLogs(getDefaultAuditLogs());
      }

      if (setEpics) {
        await loadArray(STORAGE_KEYS.EPICS, getDefaultEpics, setEpics);
      }

      console.log("[useDataLoader] 已从 localStorage 加载数据");
    };

    const loadFromApi = async () => {
      const [tasks, requirements, testCases, bugs, goals, epics, auditLogs] =
        await Promise.all([
          fetchTasks(),
          fetchRequirements(),
          fetchTestCases(),
          fetchBugs(),
          fetchGoals(),
          setEpics ? fetchEpics() : Promise.resolve([]),
          fetchAuditLogs(),
        ]);

      setTasks(tasks);
      setRequirements(requirements);
      setTestCases(testCases);
      setBugs(bugs);
      setGoals(goals);
      setAuditLogs(auditLogs.slice(0, MAX_AUDIT_LOG_ENTRIES));
      // Comments are loaded per-task on demand via fetchComments(taskId)

      if (setEpics) {
        setEpics(epics);
      }

      // Expand milestones/keyResults from goal relations into flat state
      const milestones: Milestone[] = [];
      const keyResults: KeyResult[] = [];
      for (const goal of goals) {
        if (goal.milestones) {
          milestones.push(...goal.milestones);
        }
        if (goal.keyResults) {
          keyResults.push(...goal.keyResults);
        }
      }
      setMilestones(milestones);
      setKeyResults(keyResults);

      console.log("[useDataLoader] 已从 API 加载数据", {
        taskCount: tasks.length,
        requirementCount: requirements.length,
        testCaseCount: testCases.length,
        bugCount: bugs.length,
        goalCount: goals.length,
      });
    };

    const loadData = async () => {
      try {
        await loadFromApi();
      } catch (error) {
        const reason =
          error instanceof ApiError ? `${error.status}: ${error.message}` : "unknown";
        console.warn("[useDataLoader] API 加载失败，回退到 localStorage:", reason);
        await loadFromLocalStorage();
      }

      if (!cancelled) {
        setIsInitialized(true);
      }
    };

    loadData();

    // Cross-tab sync: keep legacy behaviour so multiple tabs stay in sync when
    // another tab is still using localStorage.
    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;
      const decryptAndSet = async <T,>(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        fallback: () => T[]
      ) => {
        const raw = event.newValue;
        if (raw === null) {
          setter(fallback());
          return;
        }
        const decrypted = await decryptData<T[]>(raw);
        setter(decrypted ?? fallback());
      };

      switch (event.key) {
        case STORAGE_KEYS.TASKS:
          decryptAndSet(setTasks, getDefaultTasks);
          break;
        case STORAGE_KEYS.REQUIREMENTS:
          decryptAndSet(setRequirements, getDefaultRequirements);
          break;
        case STORAGE_KEYS.TEST_CASES:
          decryptAndSet(setTestCases, getDefaultTestCases);
          break;
        case STORAGE_KEYS.BUGS:
          decryptAndSet(setBugs, getDefaultBugs);
          break;
        case STORAGE_KEYS.GOALS:
          decryptAndSet(setGoals, getDefaultGoals);
          break;
        case STORAGE_KEYS.MILESTONES:
          decryptAndSet(setMilestones, getDefaultMilestones);
          break;
        case STORAGE_KEYS.KEY_RESULTS:
          decryptAndSet(setKeyResults, getDefaultKeyResults);
          break;
        case STORAGE_KEYS.COMMENTS:
          decryptAndSet(setComments, getDefaultComments);
          break;
        case STORAGE_KEYS.AUDIT_LOGS:
          decryptAndSet(setAuditLogs, getDefaultAuditLogs);
          break;
        case STORAGE_KEYS.EPICS:
          if (setEpics) decryptAndSet(setEpics, getDefaultEpics);
          break;
        case STORAGE_KEYS.TAG_HISTORY:
          decryptAndSet(setTagHistory, getDefaultTagHistory);
          break;
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
}
