"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { Task, Requirement } from "../types";
import { COLORS, STATUS_LABELS } from "../constants";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  status: Task["status"];
  tasks: Task[];
  requirements: Requirement[];
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  getColumnWidth: () => string;
  fontSizeScale: number;
  isSmall: boolean;
  recentlyDraggedTaskId: string | null;
}

export default function TaskColumn({
  status,
  tasks,
  requirements,
  isDragging,
  setIsDragging,
  onEditTask,
  onDeleteTask,
  getColumnWidth,
  fontSizeScale,
  isSmall,
  recentlyDraggedTaskId,
}: TaskColumnProps) {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          role="region"
          aria-label={`${STATUS_LABELS[status]} column, ${tasks.length} tasks`}
          style={{
            minWidth: getColumnWidth(),
            width: isSmall ? "95%" : "280px",
            maxWidth: "300px",
            background: COLORS.columnBackground,
            borderRadius: "12px",
            padding: isSmall ? "10px" : "16px",
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              margin: `0 0 ${16 * fontSizeScale}px 0`,
              fontSize: `${18 * fontSizeScale}px`,
              fontWeight: 700,
              color: COLORS.text,
              paddingBottom: `${12 * fontSizeScale}px`,
              borderBottom: "2px solid #d1d5db",
            }}
          >
            {STATUS_LABELS[status]}
            <span
              style={{
                marginLeft: "8px",
                fontSize: `${14 * fontSizeScale}px`,
                color: COLORS.textSecondary,
                fontWeight: 400,
              }}
            >
              ({tasks.length})
            </span>
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {tasks.length === 0 && (
              <p
                style={{
                  margin: 0,
                  color: COLORS.textSecondary,
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No tasks yet
              </p>
            )}
            {tasks.map((task, index) => {
              const relatedRequirement = task.relatedRequirementId
                ? requirements.find((r) => r.id === task.relatedRequirementId)
                : undefined;
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  relatedRequirement={relatedRequirement}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  fontSizeScale={fontSizeScale}
                  isSmall={isSmall}
                  isRecentlyDragged={task.id === recentlyDraggedTaskId}
                />
              );
            })}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}
