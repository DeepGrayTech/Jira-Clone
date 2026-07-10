/**
 * Subagent Bridge - 用于在调用 subagent 时更新 workflow 实时状态
 * 
 * 使用方法:
 * 1. 调用 subagent 前: dispatchAgent('agent-3', '实现GoalTracker边界条件')
 * 2. 调用 subagent 后: completeAgent('agent-3')
 */

const STORAGE_KEY = 'jira-clone-active-agents';

interface ActiveAgent {
  agentId: string;
  taskName: string;
  timestamp: number;
}

// 子智能体类型到 Agent ID 的映射
const SUBAGENT_TO_AGENT_MAP: Record<string, string> = {
  'general_purpose_task': 'agent-3',   // 像素魔法师 - 通用开发
  'search': 'agent-3',                  // 像素魔法师
  'senior-frontend-engineer': 'agent-3', // 像素魔法师
  'senior-backend-engineer': 'agent-4',  // 数据大厨
  'code-reviewer': 'agent-6',           // 代码找茬王
  'test-engineer': 'agent-6',           // 代码找茬王
  'requirements-analyst': 'agent-1',    // 需求粉碎机
  'architecture-task-splitter': 'agent-2', // 系统拆弹专家
  'ui-designer': 'agent-5',             // 配色狂魔
  'compliance-engineer': 'agent-7',     // 规矩守护者
  'document-manager': 'agent-9',        // 文档整理控
};

/**
 * 派发一个 agent 任务（在调用 subagent 前调用）
 * @param agentId - Agent 的 ID (如 'agent-3')
 * @param taskName - 任务名称
 */
export function dispatchAgent(agentId: string, taskName: string): void {
  if (typeof window === 'undefined') return;
  if (!agentId || !agentId.trim() || !taskName || !taskName.trim()) {
    console.warn('[SubagentBridge] dispatchAgent: agentId and taskName must be non-empty strings.');
    return;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const activeAgents: ActiveAgent[] = raw ? JSON.parse(raw) : [];
    // 移除该 agent 的旧条目
    const filtered = activeAgents.filter((a) => a.agentId !== agentId);
    filtered.push({ agentId, taskName, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log(`[SubagentBridge] Dispatched ${agentId}: ${taskName}`);
  } catch (e) {
    console.error('[SubagentBridge] dispatchAgent error:', e);
  }
}

/**
 * 完成一个 agent 任务（在 subagent 完成后调用）
 * @param agentId - Agent 的 ID
 */
export function completeAgent(agentId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const activeAgents: ActiveAgent[] = JSON.parse(raw);
    const filtered = activeAgents.filter((a) => a.agentId !== agentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log(`[SubagentBridge] Completed ${agentId}`);
  } catch (e) {
    console.error('[SubagentBridge] completeAgent error:', e);
  }
}

/**
 * 根据子智能体类型派发任务
 * @param subagentType - 子智能体类型 (如 'senior-frontend-engineer')
 * @param taskName - 任务名称
 */
export function dispatchBySubagentType(subagentType: string, taskName: string): string | null {
  const agentId = SUBAGENT_TO_AGENT_MAP[subagentType];
  if (!agentId) {
    console.warn(`[SubagentBridge] Unknown subagent type: ${subagentType}`);
    return null;
  }
  dispatchAgent(agentId, taskName);
  return agentId;
}

/**
 * 清除所有活跃 agent
 */
export function clearAllAgents(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
