"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Circle,
  PauseCircle,
} from "lucide-react";
import type { Agent } from "../types";

interface AgentNodeProps extends NodeProps {
  data: {
    agent: Agent;
  };
}

const AgentNode = memo(({ data, selected }: AgentNodeProps) => {
  const { agent } = data;

  const getStatusColor = () => {
    switch (agent.status) {
      case "WORKING":
        return "#f97316";
      case "COMPLETED":
        return "#22c55e";
      case "FAILED":
        return "#ef4444";
      case "IDLE":
        return "#6b7280";
      case "PAUSED":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case "WORKING":
        return <Clock size={14} />;
      case "COMPLETED":
        return <CheckCircle size={14} />;
      case "FAILED":
        return <XCircle size={14} />;
      case "IDLE":
        return <Circle size={14} />;
      case "PAUSED":
        return <PauseCircle size={14} />;
      default:
        return <Circle size={14} />;
    }
  };

  const getStatusText = () => {
    switch (agent.status) {
      case "WORKING":
        return "Working";
      case "COMPLETED":
        return "Completed";
      case "FAILED":
        return "Failed";
      case "IDLE":
        return "Idle";
      case "PAUSED":
        return "Paused";
      default:
        return "Idle";
    }
  };

  const totalTasks = agent.tasksCompleted + agent.tasksFailed;
  const completionRate =
    totalTasks > 0 ? Math.round((agent.tasksCompleted / totalTasks) * 100) : 0;

  return (
    <div
      role="article"
      aria-label={`Agent ${agent.nickname}: ${agent.name}, status: ${getStatusText()}, completion rate: ${completionRate}%`}
      style={{
        width: "180px",
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        background: selected ? "#f8fafc" : "#ffffff",
        border: `2px solid ${selected ? agent.color : "#e2e8f0"}`,
        borderRadius: "10px",
        padding: "12px",
        boxShadow: selected
          ? `0 0 0 3px ${agent.color}20, 0 6px 16px rgba(0,0,0,0.1)`
          : "0 3px 8px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
        position: "relative",
      }}
    >
      {agent.status === "WORKING" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
            animation: "pulseProgress 2s ease-in-out infinite",
            borderRadius: "12px 12px 0 0",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: agent.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "12px",
            boxShadow: `0 3px 8px ${agent.color}30`,
          }}
        >
          {agent.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              color: agent.color,
            }}
          >
            {agent.nickname}
          </h4>
          <p style={{ margin: "1px 0 0 0", fontSize: "9px", color: "#94a3b8" }}>
            {agent.name}
          </p>
        </div>
        <div
          aria-label={`Status: ${getStatusText()}`}
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: getStatusColor(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            animation:
              agent.status === "WORKING"
                ? "pulseDot 1.5s ease-in-out infinite"
                : "none",
          }}
        >
          {getStatusIcon()}
        </div>
      </div>

      <p
        style={{
          margin: "0 0 8px 0",
          fontSize: "9px",
          color: "#64748b",
          lineHeight: "1.3",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {agent.description}
      </p>

      {agent.skills && agent.skills.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3px",
            marginBottom: "8px",
          }}
        >
          {agent.skills.map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: "8px",
                padding: "2px 6px",
                borderRadius: "3px",
                background: `${agent.color}10`,
                color: agent.color,
                border: `1px solid ${agent.color}30`,
                whiteSpace: "nowrap",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            background: "#f0fdf4",
            padding: "4px",
            borderRadius: "4px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              color: "#22c55e",
            }}
          >
            {agent.tasksCompleted}
          </p>
          <p style={{ margin: 0, fontSize: "8px", color: "#94a3b8" }}>Done</p>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            background: "#fef2f2",
            padding: "4px",
            borderRadius: "4px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              color: "#ef4444",
            }}
          >
            {agent.tasksFailed}
          </p>
          <p style={{ margin: 0, fontSize: "8px", color: "#94a3b8" }}>Failed</p>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            background: `${agent.color}10`,
            padding: "4px",
            borderRadius: "4px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              color: agent.color,
            }}
          >
            {completionRate}%
          </p>
          <p style={{ margin: 0, fontSize: "8px", color: "#94a3b8" }}>Rate</p>
        </div>
      </div>

      {totalTasks > 0 && (
        <div>
          <div
            style={{
              height: "3px",
              background: "#e2e8f0",
              borderRadius: "1px",
              overflow: "hidden",
            }}
            role="progressbar"
            aria-valuenow={completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Completion rate: ${completionRate}%`}
          >
            <div
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${agent.color}, ${agent.color}cc)`,
                borderRadius: "1px",
                width: `${completionRate}%`,
                transition: "width 0.5s ease-out",
              }}
            />
          </div>
        </div>
      )}

      {agent.currentTask && (
        <div
          style={{
            marginTop: "6px",
            padding: "5px",
            background: `${agent.color}08`,
            border: `1px solid ${agent.color}20`,
            borderRadius: "4px",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Zap size={10} style={{ color: agent.color }} />
            <span
              style={{ fontSize: "8px", color: agent.color, fontWeight: 600 }}
            >
              Working:
            </span>
          </div>
          <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#334155" }}>
            {agent.currentTask}
          </p>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: agent.color,
          border: "2px solid white",
          width: "12px",
          height: "12px",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: agent.color,
          border: "2px solid white",
          width: "12px",
          height: "12px",
        }}
      />
    </div>
  );
});

AgentNode.displayName = "AgentNode";

export default AgentNode;
