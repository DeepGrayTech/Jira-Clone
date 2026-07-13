"use client";

import type { TestCase, Requirement } from "../types";
import { COLORS, TEST_CASE_STATUS_LABELS } from "../constants";

interface TestCaseCardProps {
  testCase: TestCase;
  requirement?: Requirement;
  onEdit: (test: TestCase) => void;
  onDelete: (testId: string) => void;
  fontSizeScale?: number;
  isSmall?: boolean;
}

export default function TestCaseCard({
  testCase,
  requirement,
  onEdit,
  onDelete,
  fontSizeScale = 1,
  isSmall = false,
}: TestCaseCardProps) {
  const getStatusStyle = () => {
    const styles = {
      PASSED: { bg: "#dcfce7", color: "#166534" },
      FAILED: { bg: "#fee2e2", color: "#991b1b" },
      BLOCKED: { bg: "#fef9c3", color: "#854d0e" },
      PENDING: { bg: "#f3f4f6", color: "#4b5563" },
    };
    return styles[testCase.status] ?? { bg: "#f3f4f6", color: "#4b5563" };
  };

  const statusStyle = getStatusStyle();

  return (
    <div
      key={testCase.id}
      role="button"
      tabIndex={0}
      aria-label={`Test case: ${testCase.title}, Status: ${
        TEST_CASE_STATUS_LABELS[testCase.status]
      }`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(testCase);
        }
      }}
      style={{
        background: COLORS.cardBackground,
        padding: isSmall ? "8px" : "12px",
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        cursor: "pointer",
      }}
      onClick={() => onEdit(testCase)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: isSmall ? "6px" : "8px",
          gap: "6px",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: `${13 * fontSizeScale}px`,
            fontWeight: 600,
            color: COLORS.text,
            flex: 1,
            lineHeight: "1.3",
          }}
        >
          {testCase.title}
        </h4>
        <span
          role="status"
          aria-label={`Status: ${TEST_CASE_STATUS_LABELS[testCase.status]}`}
          style={{
            fontSize: "9px",
            padding: "2px 6px",
            borderRadius: "3px",
            background: statusStyle.bg,
            color: statusStyle.color,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {TEST_CASE_STATUS_LABELS[testCase.status]}
        </span>
      </div>

      {testCase.description && (
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "11px",
            color: COLORS.textSecondary,
            lineHeight: "1.4",
          }}
        >
          {testCase.description}
        </p>
      )}

      {requirement && (
        <div
          style={{
            marginBottom: "8px",
            padding: "4px 8px",
            background: "#f0fdf4",
            borderRadius: "4px",
            fontSize: "11px",
            color: "#166534",
          }}
        >
          Related: {requirement.title}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px",
          color: COLORS.textSecondary,
        }}
      >
        {testCase.executor && <span>👤 {testCase.executor}</span>}
        {testCase.executedAt && <span>📅 {testCase.executedAt}</span>}
      </div>

      {testCase.status === "FAILED" && (
        <div
          style={{
            marginBottom: "12px",
            padding: "12px",
            background: "#fef2f2",
            borderRadius: "6px",
            border: "1px solid #fecaca",
          }}
        >
          {testCase.errorMessage && (
            <div
              style={{
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#991b1b",
              }}
            >
              ❌ Error: {testCase.errorMessage}
            </div>
          )}

          {testCase.actualResult && (
            <div
              style={{
                marginBottom: "8px",
                fontSize: "13px",
                color: COLORS.textSecondary,
              }}
            >
              <strong style={{ color: "#dc2626" }}>Actual Result:</strong>{" "}
              {testCase.actualResult}
            </div>
          )}

          {testCase.errorLog && (
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                backgroundColor: "#f8fafc",
                padding: "8px",
                borderRadius: "4px",
                maxHeight: "150px",
                overflowY: "auto",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
              }}
            >
              <strong
                style={{
                  color: "#991b1b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                📋 Error Log:
              </strong>
              {testCase.errorLog}
            </div>
          )}
        </div>
      )}

      {testCase.status === "BLOCKED" && (
        <div
          style={{
            marginBottom: "12px",
            padding: "12px",
            background: "#fef9c3",
            borderRadius: "6px",
            border: "1px solid #fde047",
            fontSize: "13px",
            color: "#854d0e",
          }}
        >
          ⚠️ This test case is blocked. Please resolve the dependencies before
          executing.
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(testCase.id);
        }}
        aria-label={`Delete test case: ${testCase.title}`}
        style={{
          marginTop: "8px",
          padding: "3px 8px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: COLORS.buttonDanger,
          borderRadius: "3px",
          cursor: "pointer",
          fontSize: "10px",
          fontWeight: 600,
        }}
      >
        Delete
      </button>
    </div>
  );
}
