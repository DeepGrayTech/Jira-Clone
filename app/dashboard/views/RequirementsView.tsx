"use client";

import { useState, useMemo } from "react";
import RequirementCard from "../components/RequirementCard";
import { COLORS, REQUIREMENT_STATUS_LABELS } from "../constants";
import { useRequirements } from "../contexts/RequirementContext";
import type { Requirement, FormFields } from "../types";
import { isValidRequirementStatus } from "../types";

interface RequirementsViewProps {
  fontSizeScale: number;
  isSmall: boolean;
  getColumnWidth: () => string;
  onCreateRequirement: () => void;
  onEditRequirement: (req: Requirement) => void;
  setEditingRequirement: React.Dispatch<React.SetStateAction<Requirement | null>>;
  setModalType: React.Dispatch<React.SetStateAction<"task" | "requirement" | "test" | "bug">>;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RequirementsView({
  fontSizeScale,
  isSmall,
  getColumnWidth,
  onCreateRequirement,
  onEditRequirement,
  setEditingRequirement,
  setModalType,
  setFormData,
  setShowModal,
}: RequirementsViewProps) {
  const { requirements, deleteRequirement } = useRequirements();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesSearch =
        searchQuery === "" ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "" || req.status === filterStatus;
      const matchesPriority =
        filterPriority === "" || req.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requirements, searchQuery, filterStatus, filterPriority]);

  const getRequirementsByStatus = (status: Requirement["status"]): Requirement[] => {
    return filteredRequirements.filter((req) => req.status === status);
  };

  const handleEditRequirement = (req: Requirement) => {
    setEditingRequirement(req);
    setModalType("requirement");
    setFormData({
      title: req.title,
      description: req.description,
      status: req.status,
      priority: req.priority,
      dueDate: "",
      tags: [],
      assignee: req.executor || "",
      relatedRequirementId: "",
      figmaUrl: "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: req.acceptanceCriteria.join("\n"),
      requester: req.requester,
      executor: req.executor,
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleDeleteRequirement = (reqId: string) => {
    deleteRequirement(reqId);
  };

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
        <h2
          style={{
            margin: 0,
            fontSize: `${22 * fontSizeScale}px`,
            fontWeight: 700,
          }}
        >
          Product Requirements
        </h2>
        <button
          onClick={onCreateRequirement}
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
          + New Requirement
        </button>
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
            placeholder="Search requirements by title or description..."
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
          {Object.keys(REQUIREMENT_STATUS_LABELS).map((status) => (
            <option key={status} value={status}>
              {REQUIREMENT_STATUS_LABELS[status as keyof typeof REQUIREMENT_STATUS_LABELS]}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
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
        {(Object.keys(REQUIREMENT_STATUS_LABELS) as Requirement["status"][]).map((status) => (
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
              {REQUIREMENT_STATUS_LABELS[status]}
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: `${13 * fontSizeScale}px`,
                  color: COLORS.textSecondary,
                  fontWeight: 400,
                }}
              >
                ({getRequirementsByStatus(status).length})
              </span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {getRequirementsByStatus(status).length === 0 && (
                <p
                  style={{
                    margin: 0,
                    color: COLORS.textSecondary,
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No requirements yet
                </p>
              )}
              {getRequirementsByStatus(status).map((req) => (
                <RequirementCard
                  key={req.id}
                  requirement={req}
                  onEdit={() => handleEditRequirement(req)}
                  onDelete={() => handleDeleteRequirement(req.id)}
                  onAddTest={() => {}}
                  fontSizeScale={fontSizeScale}
                  isSmall={isSmall}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}