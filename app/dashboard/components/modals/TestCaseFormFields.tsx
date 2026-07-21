"use client";

import type { FormFields, Requirement } from "../../types";
import { COLORS } from "../../constants";

const EXECUTOR_OPTIONS = [
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

interface TestCaseFormFieldsProps {
  formData: FormFields;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  requirements: Requirement[];
}

export default function TestCaseFormFields({
  formData,
  setFormData,
  requirements,
}: TestCaseFormFieldsProps) {
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
          <option value="PENDING">Pending</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-test-steps"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Test Steps (one per line)
        </label>
        <textarea
          id="modal-test-steps"
          value={formData.steps}
          onChange={(e) =>
            setFormData({ ...formData, steps: e.target.value })
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
          placeholder="Step 1: ...&#10;Step 2: ..."
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-expected-result"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Expected Result
        </label>
        <textarea
          id="modal-expected-result"
          value={formData.expectedResult}
          onChange={(e) =>
            setFormData({
              ...formData,
              expectedResult: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
            minHeight: "60px",
            resize: "vertical",
          }}
          placeholder="Describe the expected outcome..."
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-test-related-req"
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
          id="modal-test-related-req"
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
          htmlFor="modal-assignee"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Executor
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
          <option value="">Select an executor...</option>
          {EXECUTOR_OPTIONS.map((option) => (
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
    </>
  );
}
