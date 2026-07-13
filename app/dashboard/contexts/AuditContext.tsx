"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AuditLogEntry } from "../types";

interface AuditContextType {
  auditLogs: AuditLogEntry[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
  addAuditLog: (log: AuditLogEntry) => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider = ({ children }: { children: ReactNode }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const addAuditLog = useCallback((log: AuditLogEntry) => {
    setAuditLogs((prev) => [log, ...prev].slice(0, 1000));
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