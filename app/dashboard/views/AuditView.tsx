"use client";

import { useState, useMemo } from "react";
import { COLORS } from "../constants";
import { useAuditLogs } from "../contexts/AuditContext";
import type { AuditAction, AuditTarget } from "../types";

interface AuditViewProps {
  fontSizeScale: number;
}

export default function AuditView({ fontSizeScale }: AuditViewProps) {
  const { auditLogs } = useAuditLogs();

  const [filterAction, setFilterAction] = useState<AuditAction | "">("");
  const [filterTarget, setFilterTarget] = useState<AuditTarget | "">("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filterAction && log.action !== filterAction) return false;
      if (filterTarget && log.target !== filterTarget) return false;
      if (filterStartDate && log.timestamp < filterStartDate) return false;
      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setDate(endDate.getDate() + 1);
        if (new Date(log.timestamp) >= endDate) return false;
      }
      return true;
    });
  }, [auditLogs, filterAction, filterTarget, filterStartDate, filterEndDate]);

  const getActionColor = (action: AuditAction) => {
    const colors: Record<AuditAction, string> = {
      CREATE: COLORS.auditCreate,
      UPDATE: COLORS.auditUpdate,
      DELETE: COLORS.auditDelete,
      LOGIN: COLORS.auditLogin,
      LOGOUT: COLORS.auditLogout,
      EXPORT: COLORS.auditExport,
      IMPORT: COLORS.auditImport,
      CLEAR: COLORS.auditClear,
    };
    return colors[action];
  };

  const getTargetColor = (target: AuditTarget) => {
    const colors: Record<AuditTarget, string> = {
      TASK: COLORS.auditTask,
      REQUIREMENT: COLORS.auditRequirement,
      TEST_CASE: COLORS.auditTestCase,
      BUG: COLORS.auditBug,
      GOAL: COLORS.auditGoal,
      MILESTONE: COLORS.auditMilestone,
      KEY_RESULT: COLORS.auditKeyResult,
      SYSTEM: COLORS.auditSystem,
    };
    return colors[target];
  };

  const actionLabels: Record<AuditAction, string> = {
    CREATE: "Create",
    UPDATE: "Update",
    DELETE: "Delete",
    LOGIN: "Login",
    LOGOUT: "Logout",
    EXPORT: "Export",
    IMPORT: "Import",
    CLEAR: "Clear",
  };

  const targetLabels: Record<AuditTarget, string> = {
    TASK: "Task",
    REQUIREMENT: "Requirement",
    TEST_CASE: "Test Case",
    BUG: "Bug",
    GOAL: "Goal",
    MILESTONE: "Milestone",
    KEY_RESULT: "Key Result",
    SYSTEM: "System",
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: `${28 * fontSizeScale}px`,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Audit Logs
          </h1>
          <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: "14px" }}>
            ISO 27001 compliant security audit trail
          </p>
        </div>
        <div
          style={{
            padding: "10px 20px",
            background: "#eff6ff",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6b7280" }}>Total entries: </span>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#3b82f6" }}>
            {auditLogs.length}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value as AuditAction | "")}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "13px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Actions</option>
          {Object.entries(actionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value as AuditTarget | "")}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "13px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Targets</option>
          {Object.entries(targetLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "13px",
          }}
        />

        <input
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "13px",
          }}
        />

        {(filterAction || filterTarget || filterStartDate || filterEndDate) && (
          <button
            onClick={() => {
              setFilterAction("");
              setFilterTarget("");
              setFilterStartDate("");
              setFilterEndDate("");
            }}
            style={{
              padding: "10px 12px",
              background: COLORS.buttonSecondary,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          border: `1px solid ${COLORS.border}`,
          borderRadius: "8px",
        }}
      >
        {filteredLogs.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: COLORS.textSecondary,
            }}
          >
            <p style={{ fontSize: "14px" }}>No audit logs found</p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  position: "sticky",
                  top: 0,
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}
                >
                  Timestamp
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}
                >
                  Action
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}
                >
                  Target
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}
                >
                  Details
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}
                >
                  User
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: COLORS.textSecondary,
                    }}
                  >
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#ffffff",
                        background: getActionColor(log.action),
                      }}
                    >
                      {actionLabels[log.action]}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: getTargetColor(log.target),
                        background: `${getTargetColor(log.target)}20`,
                      }}
                    >
                      {targetLabels[log.target]}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: COLORS.text,
                    }}
                  >
                    {log.details}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: COLORS.textSecondary,
                    }}
                  >
                    {log.username}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}