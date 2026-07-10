"use client";

import { useEffect } from "react";
import { encryptData } from "@/lib/encryption";
import { STORAGE_KEYS } from "../constants";
import type {
  Task,
  Requirement,
  TestCase,
  Bug,
  Goal,
  Milestone,
  KeyResult,
  Agent,
  AgentTaskAssignment,
  Comment,
  AuditLogEntry,
} from "../types";

/**
 * Persistence hook.
 * Auto-saves all data to localStorage with encryption on change.
 * Each effect is guarded by isInitialized to prevent empty array overwrite.
 */
export function usePersistence(
  tasks: Task[],
  requirements: Requirement[],
  testCases: TestCase[],
  bugs: Bug[],
  goals: Goal[],
  milestones: Milestone[],
  keyResults: KeyResult[],
  tagHistory: string[],
  comments: Comment[],
  agents: Agent[],
  agentAssignments: AgentTaskAssignment[],
  auditLogs: AuditLogEntry[],
  isInitialized: boolean,
  setTagHistory: React.Dispatch<React.SetStateAction<string[]>>
) {
  useEffect(() => {
    if (!isInitialized) return;
    encryptData(tasks).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.TASKS, encrypted);
    });
  }, [tasks, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(requirements).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, encrypted);
    });
  }, [requirements, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(testCases).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.TEST_CASES, encrypted);
    });
  }, [testCases, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(bugs).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.BUGS, encrypted);
    });
  }, [bugs, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(goals).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.GOALS, encrypted);
    });
  }, [goals, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(milestones).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.MILESTONES, encrypted);
    });
  }, [milestones, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(keyResults).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.KEY_RESULTS, encrypted);
    });
  }, [keyResults, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(tagHistory).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.TAG_HISTORY, encrypted);
    });
  }, [tagHistory, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(comments).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.COMMENTS, encrypted);
    });
  }, [comments, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(agents).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.AGENTS, encrypted);
    });
  }, [agents, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(agentAssignments).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.AGENT_ASSIGNMENTS, encrypted);
    });
  }, [agentAssignments, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    encryptData(auditLogs).then((encrypted) => {
      if (encrypted !== null)
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, encrypted);
    });
  }, [auditLogs, isInitialized]);

  /**
   * Tag history collector: Automatically collects unique tags from all tasks.
   * Maintains a cumulative history of tags for autocomplete suggestions.
   */
  useEffect(() => {
    const allTags = [...new Set(tasks.flatMap((t) => t.tags))];
    setTagHistory((prev) => {
      const existingTags = new Set(prev);
      const newTags = allTags.filter((tag) => !existingTags.has(tag));
      if (newTags.length === 0) return prev;
      return [...prev, ...newTags];
    });
  }, [tasks]);
}
