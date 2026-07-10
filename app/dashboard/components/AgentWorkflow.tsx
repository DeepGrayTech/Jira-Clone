"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  Edge,
  Node,
  SmoothStepEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, Pause, RotateCcw, RefreshCw, Activity } from "lucide-react";
import AgentNode from "./AgentNode";
import type { Agent } from "../types";
import useAgentLiveStatus from "../hooks/useAgentLiveStatus";

interface AgentWorkflowProps {
  agents: Agent[];
  onAgentUpdate: (agents: Agent[]) => void;
}

const nodeTypes = {
  agent: AgentNode,
};

const AgentWorkflow = ({ agents, onAgentUpdate }: AgentWorkflowProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const {
    liveMode,
    setLiveMode,
    activePath: liveActivePath,
    applyLiveStatus,
  } = useAgentLiveStatus();

  const [manualActivePath, setManualActivePath] = useState<string[]>([]);

  const activePath = liveMode ? liveActivePath : manualActivePath;

  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  useEffect(() => {
    if (liveMode) {
      onAgentUpdate(applyLiveStatus(agentsRef.current));
    }
  }, [liveMode, liveActivePath, applyLiveStatus, onAgentUpdate]);

  useEffect(() => {
    const nodePositions: Record<string, { x: number; y: number }> = {
      "agent-7": { x: 30, y: 30 },
      "agent-1": { x: 250, y: 30 },
      "agent-2": { x: 470, y: 30 },
      "agent-9": { x: 690, y: 30 },
      "agent-3": { x: 30, y: 270 },
      "agent-4": { x: 360, y: 270 },
      "agent-5": { x: 690, y: 270 },
      "agent-6": { x: 150, y: 510 },
      "agent-8": { x: 480, y: 510 },
    };

    const initialNodes: Node[] = agents.map((agent) => ({
      id: agent.id,
      type: "agent" as const,
      position: nodePositions[agent.id] || { x: 100, y: 100 },
      data: { agent },
    }));

    const initialEdges: Edge[] = [
      {
        id: "e7-1",
        source: "agent-7",
        target: "agent-1",
        type: "smoothstep",
        animated: true,
        style: { strokeWidth: 2, stroke: "#f59e0b", strokeDasharray: "6 4" },
      },
      {
        id: "e1-2",
        source: "agent-1",
        target: "agent-2",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e2-3",
        source: "agent-2",
        target: "agent-3",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e2-4",
        source: "agent-2",
        target: "agent-4",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e2-5",
        source: "agent-2",
        target: "agent-5",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e3-6",
        source: "agent-3",
        target: "agent-6",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e4-6",
        source: "agent-4",
        target: "agent-6",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e5-6",
        source: "agent-5",
        target: "agent-6",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e6-8",
        source: "agent-6",
        target: "agent-8",
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#cbd5e1" },
      },
      {
        id: "e9-1-docs",
        source: "agent-9",
        target: "agent-1",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
      {
        id: "e9-2-docs",
        source: "agent-9",
        target: "agent-2",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
      {
        id: "e9-3-docs",
        source: "agent-9",
        target: "agent-3",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
      {
        id: "e9-4-docs",
        source: "agent-9",
        target: "agent-4",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
      {
        id: "e9-5-docs",
        source: "agent-9",
        target: "agent-5",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
      {
        id: "e9-6-docs",
        source: "agent-9",
        target: "agent-6",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
      {
        id: "e9-7-docs",
        source: "agent-9",
        target: "agent-7",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
      {
        id: "e9-8-docs",
        source: "agent-9",
        target: "agent-8",
        type: "default",
        animated: true,
        style: { strokeWidth: 1.5, stroke: "#14b8a6", strokeDasharray: "5 3" },
      },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [agents]);

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: false }, eds));
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const agentId = node.id;
    setManualActivePath((prev) => {
      if (prev.includes(agentId)) {
        return prev.filter((id) => id !== agentId);
      }
      return [...prev, agentId];
    });
  }, []);

  const handleStartAnimation = useCallback(() => {
    setLiveMode(false);
    setIsAnimating(true);
    const workflowPath = [
      "agent-1",
      "agent-2",
      "agent-3",
      "agent-4",
      "agent-5",
      "agent-6",
      "agent-7",
      "agent-8",
      "agent-9",
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= workflowPath.length) {
        clearInterval(interval);
        animationIntervalRef.current = null;
        setIsAnimating(false);
        setManualActivePath([]);
        onAgentUpdate(agentsRef.current.map((a) => ({ ...a, status: "IDLE" })));
        return;
      }

      const currentAgentId = workflowPath[currentIndex];
      setManualActivePath([currentAgentId]);

      onAgentUpdate(
        agentsRef.current.map((a) => ({
          ...a,
          status: a.id === currentAgentId ? "WORKING" : "IDLE",
          currentTask:
            a.id === currentAgentId ? "Processing workflow..." : undefined,
        }))
      );

      currentIndex++;
    }, 1500);

    animationIntervalRef.current = interval;
  }, [onAgentUpdate]);

  const handlePauseAnimation = useCallback(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setIsAnimating(false);
    setManualActivePath([]);
    onAgentUpdate(
      agentsRef.current.map((a) => ({
        ...a,
        status: "IDLE",
        currentTask: undefined,
      }))
    );
  }, [onAgentUpdate]);

  const handleReset = useCallback(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setIsAnimating(false);
    setManualActivePath([]);
    onAgentUpdate(
      agentsRef.current.map((a) => ({
        ...a,
        status: "IDLE",
        currentTask: undefined,
        tasksCompleted: 0,
        tasksFailed: 0,
      }))
    );
  }, [onAgentUpdate]);

  const handleCompleteWorkflow = useCallback(() => {
    onAgentUpdate(
      agentsRef.current.map((a) => ({
        ...a,
        status: "COMPLETED",
        currentTask: undefined,
        tasksCompleted: a.tasksCompleted + 1,
      }))
    );
    setManualActivePath([]);
  }, [onAgentUpdate]);

  const animatedEdges = useMemo(() => {
    return edges.map((edge) => {
      const isActive = activePath.includes(edge.source);
      return {
        ...edge,
        animated: isActive,
        style: {
          ...edge.style,
          strokeWidth: isActive ? 4 : 2,
          stroke: isActive ? "#3b82f6" : "#cbd5e1",
          animationDuration: "0.5s",
        },
      };
    });
  }, [edges, activePath]);

  const nodesWithUpdatedData = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        agent: agents.find((a) => a.id === node.id) || node.data.agent,
      },
    }));
  }, [nodes, agents]);

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      <div
        role="toolbar"
        aria-label="Agent workflow controls"
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          background: "rgba(255,255,255,0.95)",
          padding: "8px 16px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleStartAnimation}
          disabled={isAnimating}
          aria-label={isAnimating ? "Workflow animation running" : "Start workflow animation"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 7px",
            background: isAnimating ? "#e2e8f0" : "#22c55e",
            color: isAnimating ? "#64748b" : "#ffffff",
            border: "none",
            borderRadius: "3px",
            fontSize: "9px",
            fontWeight: 600,
            cursor: isAnimating ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <Play size={10} />
          {isAnimating ? "Running..." : "Start"}
        </button>

        <button
          onClick={handlePauseAnimation}
          disabled={!isAnimating}
          aria-label={!isAnimating ? "Workflow animation paused" : "Pause workflow animation"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 7px",
            background: !isAnimating ? "#e2e8f0" : "#f97316",
            color: !isAnimating ? "#64748b" : "#ffffff",
            border: "none",
            borderRadius: "3px",
            fontSize: "9px",
            fontWeight: 600,
            cursor: !isAnimating ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <Pause size={10} />
          Pause
        </button>

        <button
          onClick={handleReset}
          aria-label="Reset workflow to initial state"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 7px",
            background: "#64748b",
            color: "#ffffff",
            border: "none",
            borderRadius: "3px",
            fontSize: "9px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <RotateCcw size={10} />
          Reset
        </button>

        <button
          onClick={handleCompleteWorkflow}
          aria-label="Mark all agents as completed"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 7px",
            background: "#3b82f6",
            color: "#ffffff",
            border: "none",
            borderRadius: "3px",
            fontSize: "9px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <RefreshCw size={10} />
          Complete
        </button>

        <button
          onClick={() => setLiveMode(!liveMode)}
          aria-label={liveMode ? "Turn off live mode" : "Turn on live mode"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 7px",
            background: liveMode ? "#8b5cf6" : "#e2e8f0",
            color: liveMode ? "#ffffff" : "#64748b",
            border: "none",
            borderRadius: "3px",
            fontSize: "9px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Activity size={10} />
          {liveMode ? "Live: ON" : "Live: OFF"}
        </button>

        <div
          style={{
            marginLeft: "6px",
            paddingLeft: "6px",
            borderLeft: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />
              <span style={{ fontSize: "8px", color: "#64748b" }}>Idle</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#f97316",
                  animation: "pulseDot 1.5s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: "8px", color: "#64748b" }}>Working</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />
              <span style={{ fontSize: "8px", color: "#64748b" }}>
                Completed
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
              <span style={{ fontSize: "8px", color: "#64748b" }}>Failed</span>
            </div>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodesWithUpdatedData}
        edges={animatedEdges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={{ smoothstep: SmoothStepEdge }}
        fitView
        aria-label="Agent workflow visualization diagram"
        style={{ background: "#f8fafc" }}
      >
        <Background gap={16} color="#e2e8f0" />
        <Controls />
        <MiniMap
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default AgentWorkflow;
