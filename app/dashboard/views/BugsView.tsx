"use client";

import BugTracker from "../components/BugTracker";
import { useBugs } from "../contexts/BugContext";
import { useTasks } from "../contexts/TaskContext";
import { useRequirements } from "../contexts/RequirementContext";
import type { Bug } from "../types";

interface BugsViewProps {
  onCreateBug: () => void;
  onEditBug: (bug: Bug) => void;
}

export default function BugsView({ onCreateBug, onEditBug }: BugsViewProps) {
  const { bugs, updateBug, deleteBug } = useBugs();
  const { tasks } = useTasks();
  const { requirements } = useRequirements();

  const handleUpdateBug = (bug: Bug) => {
    updateBug(bug.id, bug);
  };

  const handleDeleteBug = (bugId: string) => {
    deleteBug(bugId);
  };

  const handleAddBugComment = (bugId: string, content: string, author: string) => {
    const bug = bugs.find((b) => b.id === bugId);
    if (bug) {
      const updatedBug: Bug = {
        ...bug,
        comments: [
          ...bug.comments,
          {
            id: Date.now().toString(),
            bugId,
            author,
            content,
            createdAt: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      updateBug(bugId, updatedBug);
    }
  };

  return (
    <BugTracker
      bugs={bugs}
      tasks={tasks}
      requirements={requirements}
      onCreateBug={onCreateBug}
      onEditBug={onEditBug}
      onUpdateBug={handleUpdateBug}
      onDeleteBug={handleDeleteBug}
      onAddBugComment={handleAddBugComment}
    />
  );
}