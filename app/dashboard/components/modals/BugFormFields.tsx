"use client";

import type { FormFields } from "../../types";
import { COLORS } from "../../constants";

interface BugFormFieldsProps {
  formData: FormFields;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
}

export default function BugFormFields({
  formData,
  setFormData,
}: BugFormFieldsProps) {
  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-bug-severity"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Severity
        </label>
        <select
          id="modal-bug-severity"
          value={formData.severity}
          onChange={(e) =>
            setFormData({ ...formData, severity: e.target.value })
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
          <option value="">Select severity...</option>
          <option value="CRITICAL">CRITICAL - 系统崩溃、数据丢失、安全漏洞</option>
          <option value="HIGH">HIGH - 核心功能不可用，无替代方案</option>
          <option value="MEDIUM">MEDIUM - 功能部分不可用，有替代方案</option>
          <option value="LOW">LOW - 轻微问题，不影响核心功能</option>
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-bug-priority"
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
          id="modal-bug-priority"
          value={formData.bugPriority}
          onChange={(e) =>
            setFormData({ ...formData, bugPriority: e.target.value })
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
          <option value="">Select priority...</option>
          <option value="URGENT">URGENT - 需立即修复，阻塞发布或影响大量用户</option>
          <option value="HIGH">HIGH - 应在当前迭代内优先修复</option>
          <option value="MEDIUM">MEDIUM - 可在下一迭代修复</option>
          <option value="LOW">LOW - 可在后续版本中修复</option>
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-steps-to-reproduce"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Steps to Reproduce (one per line)
        </label>
        <textarea
          id="modal-steps-to-reproduce"
          value={formData.stepsToReproduce}
          onChange={(e) =>
            setFormData({ ...formData, stepsToReproduce: e.target.value })
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
          htmlFor="modal-expected-behavior"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Expected Behavior
        </label>
        <textarea
          id="modal-expected-behavior"
          value={formData.expectedBehavior}
          onChange={(e) =>
            setFormData({ ...formData, expectedBehavior: e.target.value })
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
          placeholder="Describe what should happen..."
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="modal-actual-behavior"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Actual Behavior
        </label>
        <textarea
          id="modal-actual-behavior"
          value={formData.actualBehavior}
          onChange={(e) =>
            setFormData({ ...formData, actualBehavior: e.target.value })
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
          placeholder="Describe what actually happens..."
        />
      </div>
    </>
  );
}
