"use client";

import { useState, useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TaskColumn from "../components/TaskColumn";
import { COLORS, STATUS_LABELS } from "../constants";
import { useTasks } from "../contexts/TaskContext";
import { useRequirements } from "../contexts/RequirementContext";
import { useEpics } from "../contexts/EpicContext";
import type { Task, FormFields } from "../types";
import { isValidTaskStatus } from "../types";

interface TasksViewProps {
  fontSizeScale: number;
  isSmall: boolean;
  getColumnWidth: () => string;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  setModalType: React.Dispatch<
    React.SetStateAction<"task" | "requirement" | "test" | "bug">
  >;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentEpicId: string | null;
}

export default function TasksView({
  fontSizeScale,
  isSmall,
  getColumnWidth,
  onCreateTask,
  onEditTask,
  setEditingTask,
  setModalType,
  setFormData,
  setShowModal,
  currentEpicId,
}: TasksViewProps) {
  const { tasks, setTasks, deleteTask } = useTasks();
  const { requirements } = useRequirements();
  const { epics } = useEpics();

  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [recentlyDraggedTaskId, setRecentlyDraggedTaskId] = useState<
    string | null
  >(null);

  const allAssignees = useMemo(() => {
    return [...new Set(tasks.map((t) => t.assignee))].filter(Boolean);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesPriority =
        filterPriority === "" || task.priority === filterPriority;
      const matchesAssignee =
        filterAssignee === "" ||
        task.assignee.toLowerCase().includes(filterAssignee.toLowerCase());

      const matchesEpic =
        currentEpicId === null || task.epicId === currentEpicId;

      return matchesSearch && matchesPriority && matchesAssignee && matchesEpic;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee, currentEpicId]);

  const getFilteredTasksByStatus = (status: Task["status"]): Task[] => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalType("task");
    setShowModal(true);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: [...task.tags],
      assignee: task.assignee,
      relatedRequirementId: task.relatedRequirementId || "",
      relatedGoalId: task.relatedGoalId || "",
      figmaUrl: task.figmaUrl || "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    if (!isValidTaskStatus(destination.droppableId)) return;

    setTasks((prev) => {
      const task = prev.find((t) => t.id === result.draggableId);
      if (!task) return prev;

      return prev.map((t) =>
        t.id === result.draggableId
          ? { ...t, status: destination.droppableId as Task["status"] }
          : t
      );
    });

    setRecentlyDraggedTaskId(result.draggableId);
    setTimeout(() => setRecentlyDraggedTaskId(null), 500);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isSmall ? "12px" : "20px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: `${22 * fontSizeScale}px`,
            fontWeight: 700,
          }}
        >
          Task Board
        </h2>
        <button
          onClick={onCreateTask}
          style={{
            padding: "10px 24px",
            background: COLORS.buttonPrimary,
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = COLORS.buttonPrimaryHover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = COLORS.buttonPrimary;
          }}
        >
          + New Task
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: isSmall ? "100%" : "200px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, or tags..."
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          style={{
            padding: "10px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Assignees</option>
          <optgroup label="👤 Agents">
            <option value="需求粉碎机">需求粉碎机</option>
            <option value="系统拆弹专家">系统拆弹专家</option>
            <option value="代码质检员">代码质检员</option>
            <option value="架构师">架构师</option>
            <option value="管理员">管理员</option>
          </optgroup>
          {allAssignees.length > 0 && (
            <optgroup label="📋 Other Assignees">
              {allAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {(searchQuery || filterPriority || filterAssignee) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterPriority("");
              setFilterAssignee("");
            }}
            style={{
              padding: "10px 12px",
              background: COLORS.buttonSecondary,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: isSmall ? "12px" : "16px",
            overflowX: "auto",
            paddingBottom: "12px",
          }}
        >
          {(Object.keys(STATUS_LABELS) as Task["status"][]).map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={getFilteredTasksByStatus(status)}
              requirements={requirements}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              getColumnWidth={getColumnWidth}
              fontSizeScale={fontSizeScale}
              isSmall={isSmall}
              recentlyDraggedTaskId={recentlyDraggedTaskId}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
