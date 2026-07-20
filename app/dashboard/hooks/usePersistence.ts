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
  Comment,
  AuditLogEntry,
  Epic,
} from "../types";

function formatTime(date: Date): string {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

async function saveWithLog<T>(
  data: T[],
  storageKey: string,
  dataName: string
): Promise<void> {
  const startTime = Date.now();
  const startTimeFormatted = formatTime(new Date(startTime));
  const itemCount = data.length;
  const rawSize = new Blob([JSON.stringify(data)]).size;

  console.log(`[usePersistence] 开始保存 ${dataName}`, {
    timestamp: startTimeFormatted,
    startTime: startTime,
    itemCount: itemCount,
    rawSizeBytes: rawSize,
    rawSizeKB: (rawSize / 1024).toFixed(2),
    storageKey: storageKey,
  });

  try {
    const encrypted = await encryptData(data);
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    if (encrypted !== null) {
      localStorage.setItem(storageKey, encrypted);
      const encryptedSize = encrypted.length;

      console.log(`[usePersistence] ${dataName} 保存成功`, {
        timestamp: formatTime(new Date(endTime)),
        endTime: endTime,
        durationMs: durationMs,
        durationSec: (durationMs / 1000).toFixed(2),
        itemCount: itemCount,
        rawSizeBytes: rawSize,
        rawSizeKB: (rawSize / 1024).toFixed(2),
        encryptedSizeBytes: encryptedSize,
        encryptedSizeKB: (encryptedSize / 1024).toFixed(2),
        compressionRatio: ((encryptedSize / rawSize) * 100).toFixed(1) + "%",
        storageKey: storageKey,
      });
    } else {
      console.warn(`[usePersistence] ${dataName} 加密失败，跳过保存`, {
        timestamp: formatTime(new Date(endTime)),
        endTime: endTime,
        durationMs: durationMs,
        itemCount: itemCount,
        storageKey: storageKey,
      });
    }
  } catch (error) {
    const endTime = Date.now();
    console.error(`[usePersistence] ${dataName} 保存异常`, {
      timestamp: formatTime(new Date(endTime)),
      endTime: endTime,
      durationMs: endTime - startTime,
      itemCount: itemCount,
      storageKey: storageKey,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

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
  auditLogs: AuditLogEntry[],
  isInitialized: boolean,
  setTagHistory: React.Dispatch<React.SetStateAction<string[]>>,
  epics?: Epic[]
) {
  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(tasks, STORAGE_KEYS.TASKS, "tasks");
  }, [tasks, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(requirements, STORAGE_KEYS.REQUIREMENTS, "requirements");
  }, [requirements, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(testCases, STORAGE_KEYS.TEST_CASES, "testCases");
  }, [testCases, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(bugs, STORAGE_KEYS.BUGS, "bugs");
  }, [bugs, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(goals, STORAGE_KEYS.GOALS, "goals");
  }, [goals, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(milestones, STORAGE_KEYS.MILESTONES, "milestones");
  }, [milestones, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(keyResults, STORAGE_KEYS.KEY_RESULTS, "keyResults");
  }, [keyResults, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(tagHistory, STORAGE_KEYS.TAG_HISTORY, "tagHistory");
  }, [tagHistory, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(comments, STORAGE_KEYS.COMMENTS, "comments");
  }, [comments, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveWithLog(auditLogs, STORAGE_KEYS.AUDIT_LOGS, "auditLogs");
  }, [auditLogs, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !epics) return;
    saveWithLog(epics, STORAGE_KEYS.EPICS, "epics");
  }, [epics, isInitialized]);

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
