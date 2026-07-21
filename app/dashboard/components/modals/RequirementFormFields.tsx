"use client";

import type { FormFields, Goal } from "../../types";
import { COLORS } from "../../constants";

const PERSON_OPTIONS = [
  { value: "需求粉碎机", label: "👤 需求粉碎机 (Requirements Analyst)" },
  { value: "系统拆弹专家", label: "👤 系统拆弹专家 (Architecture Task Splitter)" },
  { value: "像素魔法师", label: "👤 像素魔法师 (Senior Frontend Engineer)" },
  { value: "数据大厨", label: "👤 数据大厨 (Senior Backend Engineer)" },
  { value: "配色狂魔", label: "👤 配色狂魔 (UI Designer)" },
  { value: "代码找茬王", label: "👤 代码找茬王 (Code Reviewer)" },
  { value: "规矩守护者", label: "👤 规矩守护者 (Compliance Engineer)" },
  { value: "Bug猎手", label: "👤 Bug猎手 (Test Engineer)" },
  { value: "文档整理控", label: "👤 文档整理控 (Document Manager)" },
];

interface RequirementFormFieldsProps {
  formData: FormFields;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  goals: Goal[];
}

export default function RequirementFormFields({
  formData,
  setFormData,
  goals,
}: RequirementFormFieldsProps) {
  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-status"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Status
        </label>
        <select
          id="modal-status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">In Review</option>
          <option value="APPROVED">Approved</option>
          <option value="IMPLEMENTED">Implemented</option>
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-priority"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Priority
        </label>
        <select
          id="modal-priority"
          value={formData.priority}
          onChange={(e) =>
            setFormData({ ...formData, priority: e.target.value })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-acceptance-criteria"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Acceptance Criteria (one per line)
        </label>
        <textarea
          id="modal-acceptance-criteria"
          value={formData.acceptanceCriteria}
          onChange={(e) =>
            setFormData({
              ...formData,
              acceptanceCriteria: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
            minHeight: "100px",
            resize: "vertical",
          }}
          placeholder="Criteria 1: ...&#10;Criteria 2: ..."
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-requester"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Requester (需求提出者)
        </label>
        <select
          id="modal-requester"
          value={formData.requester}
          onChange={(e) =>
            setFormData({ ...formData, requester: e.target.value })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        >
          <option value="">Select requester...</option>
          {PERSON_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              style={{ backgroundColor: "#ffffff" }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-executor"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Executor (需求执行者)
        </label>
        <select
          id="modal-executor"
          value={formData.executor}
          onChange={(e) =>
            setFormData({ ...formData, executor: e.target.value })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        >
          <option value="">Select executor...</option>
          {PERSON_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              style={{ backgroundColor: "#ffffff" }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-req-related-goal"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Related Goal
        </label>
        <select
          id="modal-req-related-goal"
          value={formData.relatedGoalId}
          onChange={(e) =>
            setFormData({
              ...formData,
              relatedGoalId: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">None</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title} ({goal.type})
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
