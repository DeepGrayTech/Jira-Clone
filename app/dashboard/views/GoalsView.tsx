"use client";

import GoalTracker from "../components/GoalTracker";
import { useGoals } from "../contexts/GoalContext";
import { useTasks } from "../contexts/TaskContext";
import { useRequirements } from "../contexts/RequirementContext";
import { matchesEpicFilter } from "../constants";
import type { Goal } from "../types";

interface GoalsViewProps {
  onCreateGoal: (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string, expectedUpdatedAt?: string) => void;
  currentEpicId: string | null;
}

export default function GoalsView({
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  currentEpicId,
}: GoalsViewProps) {
  const { goals, milestones, keyResults } = useGoals();
  const { tasks } = useTasks();
  const { requirements } = useRequirements();

  const filteredGoals = goals.filter((goal) =>
    matchesEpicFilter(goal.epicId, currentEpicId)
  );

  return (
    <GoalTracker
      goals={filteredGoals}
      tasks={tasks}
      requirements={requirements}
      milestones={milestones}
      keyResults={keyResults}
      onCreateGoal={onCreateGoal}
      onUpdateGoal={onUpdateGoal}
      onDeleteGoal={onDeleteGoal}
    />
  );
}