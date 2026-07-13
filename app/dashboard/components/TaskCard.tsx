"use client";

import { Draggable } from "@hello-pangea/dnd";
import { useEffect, useRef } from "react";
import type { Task, Requirement } from "../types";
import { COLORS } from "../constants";

interface TaskCardProps {
  task: Task;
  index: number;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  relatedRequirement?: Requirement;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  fontSizeScale: number;
  isSmall: boolean;
  isRecentlyDragged: boolean;
}

const getTaskPriorityStyle = (priority: Task["priority"]) => {
  const styles: Record<Task["priority"], { color: string; bgColor: string }> = {
    LOW: { color: "#166534", bgColor: "#dcfce7" },
    MEDIUM: { color: "#854d0e", bgColor: "#fef9c3" },
    HIGH: { color: "#c2410c", bgColor: "#fed7aa" },
    URGENT: { color: "#991b1b", bgColor: "#fee2e2" },
  };
  return styles[priority];
};

export default function TaskCard({
  task,
  index,
  isDragging,
  setIsDragging,
  relatedRequirement,
  onEdit,
  onDelete,
  fontSizeScale,
  isSmall,
  isRecentlyDragged,
}: TaskCardProps) {
  const priorityStyle = getTaskPriorityStyle(task.priority);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRecentlyDragged && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [isRecentlyDragged]);

  return (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={(el) => {
            provided.innerRef(el);
            if (el) {
              (cardRef as React.MutableRefObject<HTMLDivElement>).current = el;
            }
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          draggable={true}
          role="button"
          tabIndex={0}
          aria-label={`Task: ${task.title}, Priority: ${task.priority}, Status: ${task.assignee}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isDragging) onEdit(task);
            }
          }}
          style={{
            ...provided.draggableProps.style,
            background: COLORS.cardBackground,
            padding: isSmall ? "8px" : "12px",
            borderRadius: "8px",
            border: isRecentlyDragged
              ? `3px solid ${COLORS.buttonPrimary}`
              : `1px solid ${COLORS.border}`,
            boxShadow: snapshot.isDragging
              ? "0 8px 25px rgba(0,0,0,0.2)"
              : isRecentlyDragged
              ? "0 0 0 3px rgba(59, 130, 246, 0.3)"
              : "0 2px 4px rgba(0,0,0,0.05)",
            cursor: "grab",
            opacity: snapshot.isDragging ? 0.8 : 1,
            animation: isRecentlyDragged ? "flashBorder 0.5s ease-in-out 3" : "none",
          }}
          onMouseDown={() => setIsDragging(false)}
          onMouseMove={() => setIsDragging(true)}
          onClick={() => !isDragging && onEdit(task)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: isSmall ? "6px" : "8px",
              gap: "6px",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: `${13 * fontSizeScale}px`,
                fontWeight: 600,
                color: COLORS.text,
                flex: 1,
                lineHeight: "1.3",
              }}
            >
              {task.title}
            </h4>
            <span
              role="status"
              aria-label={`Priority: ${task.priority}`}
              style={{
                fontSize: "9px",
                padding: "2px 6px",
                borderRadius: "3px",
                background: priorityStyle.bgColor,
                color: priorityStyle.color,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "11px",
                color: COLORS.textSecondary,
                lineHeight: "1.4",
              }}
            >
              {task.description}
            </p>
          )}

          {relatedRequirement && (
            <div
              style={{
                marginBottom: "8px",
                padding: "4px 8px",
                background: "#f0fdf4",
                borderRadius: "4px",
                fontSize: "11px",
                color: "#166534",
              }}
            >
              Req: {relatedRequirement.title}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            {task.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "10px",
                  padding: "2px 5px",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  borderRadius: "3px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: COLORS.textSecondary,
            }}
          >
            <span>👤 {task.assignee}</span>
            {task.dueDate && <span>📅 {task.dueDate}</span>}
          </div>

          {task.figmaUrl && (
            <div
              style={{
                marginTop: "8px",
                padding: "4px 8px",
                background: "#fff7ed",
                borderRadius: "4px",
                fontSize: "11px",
                border: "1px solid #fed7aa",
              }}
            >
              <a
                href={task.figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#c2410c",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                aria-label={`View Figma design: ${task.figmaUrl}`}
              >
                🎨 Figma
              </a>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            aria-label={`Delete task: ${task.title}`}
            style={{
              marginTop: "8px",
              padding: "3px 8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: COLORS.buttonDanger,
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            Delete
          </button>
        </div>
      )}
    </Draggable>
  );
}
