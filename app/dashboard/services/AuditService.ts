import type { AuditAction, AuditTarget, AuditLogEntry } from "../types";

export class AuditService {
  private MAX_ENTRIES = 1000;

  logAction(
    action: AuditAction,
    target: AuditTarget,
    targetId: string,
    details: string,
    username?: string
  ): AuditLogEntry {
    const newLog: AuditLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      target,
      targetId,
      details,
      username: username || "Unknown",
    };
    return newLog;
  }

  truncateLogs(logs: AuditLogEntry[]): AuditLogEntry[] {
    return logs.slice(0, this.MAX_ENTRIES);
  }
}