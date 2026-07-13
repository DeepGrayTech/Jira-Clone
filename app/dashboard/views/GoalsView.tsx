"use client";

import GoalTracker from "../components/GoalTracker";
import { useGoals } from "../contexts/GoalContext";
import { useTasks } from "../contexts/TaskContext";
import { useRequirements } from "../contexts/RequirementContext";
import type { Goal } from "../types";

interface GoalsViewProps {
  onCreateGoal: (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string, expectedUpdatedAt?: string) => void;
}

export default function GoalsView({
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalsViewProps) {
  const { goals, milestones, keyResults } = useGoals();
  const { tasks } = useTasks();
  const { requirements } = useRequirements();

  return (
    <GoalTracker
      goals={goals}
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