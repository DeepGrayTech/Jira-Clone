"use client";

import type { FormFields, Requirement, Goal } from "../../types";
import { COLORS } from "../../constants";
import TagInput from "./TagInput";

const ASSIGNEE_OPTIONS = [
  { value: "需求粉碎机", label: "👤 需求粉碎机 (Requirements Analyst)" },
  { value: "系统拆弹专家", label: "👤 系统拆弹专家 (Architecture Task Splitter)" },
  { value: "像素魔法师", label: "👤 像素魔法师 (Senior Frontend Engineer)" },
  { value: "数据大厨", label: "👤 数据大厨 (Senior Backend Engineer)" },
  { value: "配色狂魔", label: "👤 配色狂魔 (UI Designer)" },
  { value: "代码找茬王", label: "👤 代码找茬王 (Code Reviewer)" },
  { value: "规矩守护者", label: "👤 规矩守护者 (Compliance Engineer)" },
  { value: "Bug猎手", label: "👤 Bug猎手 (Test Engineer)" },
  { value: "文档整理控", label: "👤 文档整理控 (Document Manager)" },
  { value: "管理员", label: "👤 管理员 (Admin)" },
];

interface TaskFormFieldsProps {
  formData: FormFields;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  requirements: Requirement[];
  goals: Goal[];
  tagHistory: string[];
}

export default function TaskFormFields({
  formData,
  setFormData,
  requirements,
  goals,
  tagHistory,
}: TaskFormFieldsProps) {
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
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
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
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-due-date"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Due Date
        </label>
        <input
          id="modal-due-date"
          type="date"
          value={formData.dueDate}
          onChange={(e) =>
            setFormData({ ...formData, dueDate: e.target.value })
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
        />
      </div>

      <TagInput
        formData={formData}
        setFormData={setFormData}
        tagHistory={tagHistory}
      />

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-assignee"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Assignee
        </label>
        <select
          id="modal-assignee"
          value={formData.assignee}
          onChange={(e) =>
            setFormData({ ...formData, assignee: e.target.value })
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
          <option value="">Select an assignee...</option>
          {ASSIGNEE_OPTIONS.map((option) => (
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
          htmlFor="modal-related-requirement"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Related Requirement
        </label>
        <select
          id="modal-related-requirement"
          value={formData.relatedRequirementId}
          onChange={(e) =>
            setFormData({
              ...formData,
              relatedRequirementId: e.target.value,
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
          {requirements.map((req) => (
            <option key={req.id} value={req.id}>
              {req.title}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-related-goal"
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
          id="modal-related-goal"
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

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-figma-url"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Figma URL
        </label>
        <input
          id="modal-figma-url"
          type="url"
          value={formData.figmaUrl}
          onChange={(e) =>
            setFormData({ ...formData, figmaUrl: e.target.value })
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
          placeholder="https://www.figma.com/file/..."
        />
      </div>
    </>
  );
}
