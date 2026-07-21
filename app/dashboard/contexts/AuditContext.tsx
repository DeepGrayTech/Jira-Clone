"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { encryptData } from "@/lib/encryption";
import type { AuditLogEntry } from "../types";
import { createAuditLogApi } from "../services/api";
import { STORAGE_KEYS } from "../constants";

function persistAuditLogs(logs: AuditLogEntry[]) {
  try {
    const payload = JSON.stringify(logs);
    encryptData(payload).then((encrypted) => {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, encrypted || payload);
    });
  } catch (error) {
    console.error("[AuditContext] 持久化到 localStorage 失败:", error);
  }
}

interface AuditContextType {
  auditLogs: AuditLogEntry[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
  addAuditLog: (log: AuditLogEntry) => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider = ({ children }: { children: ReactNode }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const auditLogsRef = useRef(auditLogs);
  auditLogsRef.current = auditLogs;

  const addAuditLog = useCallback(async (log: AuditLogEntry) => {
    try {
      await createAuditLogApi(log);
    } catch (error) {
      console.warn("[AuditContext] addAuditLog API 失败:", error instanceof Error ? error.message : error);
    }
    setAuditLogs((prev) => {
      const next = [log, ...prev].slice(0, 1000);
      persistAuditLogs(next);
      return next;
    });
  }, []);

  return (
    <AuditContext.Provider
      value={{ auditLogs, setAuditLogs, addAuditLog }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAuditLogs = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAuditLogs must be used within AuditProvider");
  }
  return context;
};
