"use client";

import { useState, useMemo } from "react";
import TestCaseCard from "../components/TestCaseCard";
import { COLORS, TEST_CASE_STATUS_LABELS, matchesEpicFilter } from "../constants";
import { useTestCases } from "../contexts/TestCaseContext";
import { useRequirements } from "../contexts/RequirementContext";
import { useEpics } from "../contexts/EpicContext";
import type { TestCase, FormFields } from "../types";

interface TestingViewProps {
  fontSizeScale: number;
  isSmall: boolean;
  getColumnWidth: () => string;
  onCreateTestCase: () => void;
  onEditTestCase: (tc: TestCase) => void;
  setEditingTestCase: React.Dispatch<React.SetStateAction<TestCase | null>>;
  setModalType: React.Dispatch<React.SetStateAction<"task" | "requirement" | "test" | "bug">>;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentEpicId: string | null;
}

export default function TestingView({
  fontSizeScale,
  isSmall,
  getColumnWidth,
  onCreateTestCase,
  onEditTestCase,
  setEditingTestCase,
  setModalType,
  setFormData,
  setShowModal,
  currentEpicId,
}: TestingViewProps) {
  const { testCases, deleteTestCase } = useTestCases();
  const { requirements } = useRequirements();
  const { epics } = useEpics();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRequirement, setFilterRequirement] = useState("");

  const filteredTestCases = useMemo(() => {
    return testCases.filter((tc) => {
      const matchesSearch =
        searchQuery === "" ||
        tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "" || tc.status === filterStatus;
      const matchesRequirement =
        filterRequirement === "" || tc.requirementId === filterRequirement;

      const matchesEpic = matchesEpicFilter(tc.epicId, currentEpicId);

      return matchesSearch && matchesStatus && matchesRequirement && matchesEpic;
    });
  }, [testCases, searchQuery, filterStatus, filterRequirement, currentEpicId]);

  const getTestCasesByStatus = (status: TestCase["status"]): TestCase[] => {
    return filteredTestCases.filter((tc) => tc.status === status);
  };

  const handleEditTestCase = (tc: TestCase) => {
    setEditingTestCase(tc);
    setModalType("test");
    setFormData({
      title: tc.title,
      description: tc.description,
      status: tc.status,
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: tc.executor || "",
      relatedRequirementId: tc.requirementId,
      relatedGoalId: "",
      figmaUrl: "",
      steps: tc.steps.join("\n"),
      expectedResult: tc.expectedResult,
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
      epicId: tc.epicId || "",
    });
    setShowModal(true);
  };

  const handleDeleteTestCase = (tcId: string) => {
    deleteTestCase(tcId);
  };

  const passedCount = testCases.filter((tc) => tc.status === "PASSED").length;
  const failedCount = testCases.filter((tc) => tc.status === "FAILED").length;
  const pendingCount = testCases.filter((tc) => tc.status === "PENDING").length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: `${22 * fontSizeScale}px`,
              fontWeight: 700,
            }}
          >
            Test Cases
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: COLORS.textSecondary }}>
            Track test execution and verify requirements
          </p>
        </div>
        <button
          onClick={onCreateTestCase}
          style={{
            padding: "10px 24px",
            background: COLORS.buttonPrimary,
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = COLORS.buttonPrimaryHover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = COLORS.buttonPrimary;
          }}
        >
          + New Test Case
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div
          style={{
            flex: 1,
            background: "#dcfce7",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#16a34a" }}>
            {passedCount}
          </span>
          <span
            style={{ marginLeft: "8px", fontSize: "14px", color: "#6b7280" }}
          >
            Passed
          </span>
        </div>
        <div
          style={{
            flex: 1,
            background: "#fee2e2",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#dc2626" }}>
            {failedCount}
          </span>
          <span
            style={{ marginLeft: "8px", fontSize: "14px", color: "#6b7280" }}
          >
            Failed
          </span>
        </div>
        <div
          style={{
            flex: 1,
            background: "#fef9c3",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#eab308" }}>
            {pendingCount}
          </span>
          <span
            style={{ marginLeft: "8px", fontSize: "14px", color: "#6b7280" }}
          >
            Pending
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test cases by title or description..."
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Statuses</option>
          {Object.keys(TEST_CASE_STATUS_LABELS).map((status) => (
            <option key={status} value={status}>
              {TEST_CASE_STATUS_LABELS[status as keyof typeof TEST_CASE_STATUS_LABELS]}
            </option>
          ))}
        </select>
        <select
          value={filterRequirement}
          onChange={(e) => setFilterRequirement(e.target.value)}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Requirements</option>
          {requirements.map((req) => (
            <option key={req.id} value={req.id}>
              {req.title}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          gap: isSmall ? "12px" : "16px",
          overflowX: "auto",
          paddingBottom: "12px",
        }}
      >
        {(Object.keys(TEST_CASE_STATUS_LABELS) as TestCase["status"][]).map((status) => (
          <div
            key={status}
            style={{
              minWidth: getColumnWidth(),
              width: isSmall ? "95%" : "280px",
              maxWidth: "300px",
              background: COLORS.columnBackground,
              borderRadius: "12px",
              padding: isSmall ? "10px" : "16px",
              flexShrink: 0,
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: `${16 * fontSizeScale}px`,
                fontWeight: 700,
                color: COLORS.text,
                paddingBottom: "10px",
                borderBottom: "2px solid #d1d5db",
              }}
            >
              {TEST_CASE_STATUS_LABELS[status]}
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: `${13 * fontSizeScale}px`,
                  color: COLORS.textSecondary,
                  fontWeight: 400,
                }}
              >
                ({getTestCasesByStatus(status).length})
              </span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {getTestCasesByStatus(status).length === 0 && (
                <p
                  style={{
                    margin: 0,
                    color: COLORS.textSecondary,
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No test cases yet
                </p>
              )}
              {getTestCasesByStatus(status).map((tc) => {
                const relatedRequirement = tc.requirementId
                  ? requirements.find((r) => r.id === tc.requirementId)
                  : undefined;
                return (
                  <TestCaseCard
                      key={tc.id}
                      testCase={tc}
                      requirement={relatedRequirement}
                      onEdit={() => handleEditTestCase(tc)}
                      onDelete={() => handleDeleteTestCase(tc.id)}
                      fontSizeScale={fontSizeScale}
                      isSmall={isSmall}
                    />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}