import { useState, useEffect, useRef, useCallback } from "react";
import type { Agent } from "../types";

interface UseAgentLiveStatusOptions {
  /** 轮询间隔（毫秒），默认 2000 */
  pollingInterval?: number;
  /** 条目过期时间（毫秒），默认 30000 */
  expiryTime?: number;
  /** localStorage 键名，默认 'jira-clone-active-agents' */
  storageKey?: string;
}

interface UseAgentLiveStatusReturn {
  /** 是否处于实时模式 */
  liveMode: boolean;
  /** 设置实时模式开关 */
  setLiveMode: (value: boolean) => void;
  /** 当前活跃路径（用于连接线动画） */
  activePath: string[];
  /** 根据活跃状态更新后的 agents */
  applyLiveStatus: (agents: Agent[]) => Agent[];
}

export default function useAgentLiveStatus(
  options?: UseAgentLiveStatusOptions
): UseAgentLiveStatusReturn {
  const {
    pollingInterval = 2000,
    expiryTime = 30000,
    storageKey = 'jira-clone-active-agents',
  } = options || {};

  const [liveMode, setLiveMode] = useState(true);
  const [activePath, setActivePath] = useState<string[]>([]);

  // 轮询逻辑
  useEffect(() => {
    if (!liveMode) {
      setActivePath([]);
      return;
    }

    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
          setActivePath([]);
          return;
        }
        const activeAgents = JSON.parse(raw);
        const now = Date.now();
        const valid = activeAgents.filter(
          (item: { agentId: string; taskName: string; timestamp: number }) =>
            now - item.timestamp < expiryTime
        );
        const activeIds = valid.map((item: { agentId: string }) => item.agentId);
        setActivePath(activeIds);
      } catch (e) {
        // 无效 JSON 时静默处理
        setActivePath([]);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [liveMode, pollingInterval, expiryTime, storageKey]);

  const applyLiveStatus = useCallback((agents: Agent[]): Agent[] => {
    if (!liveMode) return agents;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return agents.map(a => ({ ...a, status: 'IDLE' as const, currentTask: undefined }));

      const activeAgents = JSON.parse(raw);
      const now = Date.now();
      const valid = activeAgents.filter(
        (item: { agentId: string; taskName: string; timestamp: number }) =>
          now - item.timestamp < expiryTime
      );
      const activeIds = new Set(valid.map((item: { agentId: string }) => item.agentId));

      return agents.map(a => {
        const active = valid.find((item: { agentId: string }) => item.agentId === a.id);
        return {
          ...a,
          status: activeIds.has(a.id) ? 'WORKING' as const : 'IDLE' as const,
          currentTask: active ? active.taskName : undefined,
        };
      });
    } catch {
      return agents.map(a => ({ ...a, status: 'IDLE' as const, currentTask: undefined }));
    }
  }, [liveMode, storageKey, expiryTime]);

  return { liveMode, setLiveMode, activePath, applyLiveStatus };
}
