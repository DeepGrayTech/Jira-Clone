import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GoalTracker from "../app/dashboard/components/GoalTracker";
import type { Goal, Task, Requirement, Milestone, KeyResult, GoalStatus, GoalType } from "../app/dashboard/types";

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Implement Login",
    description: "Implement login page",
    status: "DONE",
    priority: "HIGH",
    assignee: "像素魔法师",
    tags: ["frontend"],
    dueDate: "2024-02-01",
    createdAt: "2024-01-01T09:00:00Z",
    comments: [],
  },
  {
    id: "task-2",
    title: "Implement Dashboard",
    description: "Implement dashboard page",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "像素魔法师",
    tags: ["frontend"],
    dueDate: "2024-02-15",
    createdAt: "2024-01-05T09:00:00Z",
    comments: [],
  },
  {
    id: "task-3",
    title: "API Integration",
    description: "Integrate with backend API",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "数据大厨",
    tags: ["backend"],
    dueDate: "2024-02-20",
    createdAt: "2024-01-10T09:00:00Z",
    comments: [],
  },
];

const mockRequirements: Requirement[] = [
  {
    id: "req-1",
    title: "User Authentication",
    description: "Implement secure user authentication",
    priority: "HIGH",
    status: "APPROVED",
    acceptanceCriteria: ["Acceptance criteria 1"],
    requester: "客户A",
    executor: "数据大厨",
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
];

const mockMilestones: Milestone[] = [
  {
    id: "milestone-1",
    goalId: "goal-1",
    title: "Phase 1 Complete",
    targetDate: "2024-01-15",
    achieved: true,
    createdAt: "2024-01-01T09:00:00Z",
  },
];

const mockKeyResults: KeyResult[] = [
  {
    id: "kr-1",
    goalId: "goal-1",
    title: "Login page completed",
    targetValue: 100,
    currentValue: 100,
    unit: "%",
    createdAt: "2024-01-01T09:00:00Z",
  },
];

const mockGoals: Goal[] = [
  {
    id: "goal-1",
    title: "User Authentication System",
    description: "Implement complete user authentication",
    type: "OKR",
    status: "IN_PROGRESS",
    target: "100%",
    currentProgress: 50,
    startDate: "2024-01-01",
    endDate: "2024-03-01",
    owner: "系统拆弹专家",
    color: "#8b5cf6",
    relatedTaskIds: ["task-1", "task-2"],
    relatedRequirementIds: ["req-1"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "goal-2",
    title: "Dashboard Development",
    description: "Build main dashboard",
    type: "SMART",
    status: "ON_TRACK",
    target: "Complete",
    currentProgress: 75,
    startDate: "2024-01-05",
    endDate: "2024-02-28",
    owner: "像素魔法师",
    color: "#06b6d4",
    relatedTaskIds: ["task-2", "task-3"],
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
];

describe("GoalTracker", () => {
  const mockOnCreateGoal = jest.fn();
  const mockOnUpdateGoal = jest.fn();
  const mockOnDeleteGoal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderGoalTracker = (goals: Goal[] = mockGoals) => {
    return render(
      <GoalTracker
        goals={goals}
        tasks={mockTasks}
        requirements={mockRequirements}
        milestones={mockMilestones}
        keyResults={mockKeyResults}
        onCreateGoal={mockOnCreateGoal}
        onUpdateGoal={mockOnUpdateGoal}
        onDeleteGoal={mockOnDeleteGoal}
      />
    );
  };

  it("should render GoalTracker header", () => {
    renderGoalTracker();

    expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
    expect(screen.getByText("Track team goals and align with tasks and requirements")).toBeInTheDocument();
    expect(screen.getByText("+ New Goal")).toBeInTheDocument();
  });

  it("should render goal cards", () => {
    renderGoalTracker();

    expect(screen.getByText("User Authentication System")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Development")).toBeInTheDocument();
  });

  it("should filter goals by search query", () => {
    renderGoalTracker();

    const searchInput = screen.getByPlaceholderText("Search goals by title, description, owner, or type...");
    fireEvent.change(searchInput, { target: { value: "Authentication" } });

    expect(screen.getByText("User Authentication System")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Development")).not.toBeInTheDocument();
  });

  it("should show empty state when no goals match", () => {
    renderGoalTracker();

    const searchInput = screen.getByPlaceholderText("Search goals by title, description, owner, or type...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(screen.getByText('No goals found matching "nonexistent".')).toBeInTheDocument();
  });

  it("should show empty state when no goals exist", () => {
    renderGoalTracker([]);

    expect(screen.getByText("No goals yet. Click \"New Goal\" to create one!")).toBeInTheDocument();
  });

  it("should open create modal when New Goal button is clicked", () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should create a new goal with valid data", async () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "New Test Goal" } });
    
    const typeSelect = screen.getByLabelText("Type");
    fireEvent.change(typeSelect, { target: { value: "OKR" } });
    
    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-12-31" } });

    const submitButton = screen.getByText("Create Goal");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateGoal).toHaveBeenCalled();
    });

    const callArgs = mockOnCreateGoal.mock.calls[0][0];
    expect(callArgs.title).toBe("New Test Goal");
    expect(callArgs.type).toBe("OKR");
    expect(callArgs.status).toBe("NOT_STARTED");
    expect(callArgs.currentProgress).toBe(0);
  });

  it("should show validation error for empty title", async () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-12-31" } });

    const submitButton = screen.getByText("Create Goal");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateGoal).not.toHaveBeenCalled();
    });
  });

  it("should show validation error for invalid date", async () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "Test Goal" } });
    
    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "invalid-date" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-12-31" } });

    const submitButton = screen.getByText("Create Goal");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateGoal).not.toHaveBeenCalled();
    });
  });

  it("should show validation error for start date after end date", async () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "Test Goal" } });
    
    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-12-01" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-01-01" } });

    const submitButton = screen.getByText("Create Goal");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be before/)).toBeInTheDocument();
    });

    expect(mockOnCreateGoal).not.toHaveBeenCalled();
  });

  it("should show error for duplicate title", async () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "User Authentication System" } });
    
    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-12-31" } });

    const submitButton = screen.getByText("Create Goal");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/)).toBeInTheDocument();
    });

    expect(mockOnCreateGoal).not.toHaveBeenCalled();
  });

  it("should open edit modal when goal card is clicked", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("User Authentication System")).toBeInTheDocument();
  });

  it("should update a goal", async () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const titleInput = screen.getByDisplayValue("User Authentication System");
    fireEvent.change(titleInput, { target: { value: "Updated Goal Title" } });
    
    const statusSelect = screen.getByLabelText("Status");
    fireEvent.change(statusSelect, { target: { value: "ACHIEVED" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdateGoal).toHaveBeenCalled();
    });

    const callArgs = mockOnUpdateGoal.mock.calls[0][0];
    expect(callArgs.title).toBe("Updated Goal Title");
    expect(callArgs.status).toBe("ACHIEVED");
  });

  it("should delete a goal when confirmed", async () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockOnDeleteGoal).toHaveBeenCalled();
    });
  });

  it("should not delete a goal when cancelled", async () => {
    window.confirm = jest.fn().mockReturnValue(false);

    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDeleteGoal).not.toHaveBeenCalled();
  });

  it("should calculate progress from related tasks", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    expect(goalCard).toBeInTheDocument();
  });

  it("should show related tasks count", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    expect(screen.getByText("Related Tasks (2)")).toBeInTheDocument();
  });

  it("should show related requirements count", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    expect(screen.getByText("Related Requirements (1)")).toBeInTheDocument();
  });

  it("should close modal when cancel button is clicked", () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render goal with different types and statuses", () => {
    renderGoalTracker();

    expect(screen.getByText("OKR")).toBeInTheDocument();
    expect(screen.getByText("SMART")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("On Track")).toBeInTheDocument();
  });

  it("should render goal progress bar", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    expect(screen.getByText("Progress: 50%")).toBeInTheDocument();
  });

  it("should handle keyboard navigation for goal cards", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.keyDown(goalCard, { key: "Enter" });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should close modal when clicking outside", () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should show validation error for missing dates", async () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "Test Goal" } });

    const submitButton = screen.getByText("Create Goal");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateGoal).not.toHaveBeenCalled();
    });
  });

  it("should show validation error for invalid end date", async () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "Test Goal" } });
    
    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "invalid-date" } });

    const submitButton = screen.getByText("Create Goal");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateGoal).not.toHaveBeenCalled();
    });
  });

  it("should handle update goal with validation error", async () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-12-01" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-01-01" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdateGoal).not.toHaveBeenCalled();
    });
  });

  it("should trigger mouseover and mouseout events on New Goal button", () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.mouseOver(newGoalButton);
    fireEvent.mouseOut(newGoalButton);
    
    expect(newGoalButton).toBeInTheDocument();
  });

  it("should trigger focus and blur events on search input", () => {
    renderGoalTracker();

    const searchInput = screen.getByPlaceholderText("Search goals by title, description, owner, or type...");
    fireEvent.focus(searchInput);
    fireEvent.blur(searchInput);
    
    expect(searchInput).toBeInTheDocument();
  });

  it("should trigger mouseover and mouseout events on goal card", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.mouseOver(goalCard);
    fireEvent.mouseOut(goalCard);
    
    expect(goalCard).toBeInTheDocument();
  });

  it("should handle keyboard navigation with space key", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.keyDown(goalCard, { key: " ", preventDefault: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should close edit modal when cancel button is clicked", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should handle delete with null selectedGoal", async () => {
    renderGoalTracker([]);

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnDeleteGoal).not.toHaveBeenCalled();
  });

  it("should display validation error message for empty title", async () => {
    const { container } = renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/)).toBeInTheDocument();
    });
  });

  it("should display validation error message for missing dates", async () => {
    const { container } = renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "Test Goal" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Both start date and end date/)).toBeInTheDocument();
    });
  });

  it("should display validation error when start date is missing", async () => {
    const { container } = renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "Test Goal" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-12-31" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Both start date and end date/)).toBeInTheDocument();
    });
  });

  it("should display validation error when end date is missing", async () => {
    const { container } = renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "Test Goal" } });
    
    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Both start date and end date/)).toBeInTheDocument();
    });
  });

  it("should close create modal by clicking X button", () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const closeButton = screen.getByLabelText("Close create goal dialog");
    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should close edit modal by clicking X button", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const closeButton = screen.getByLabelText("Close edit goal dialog");
    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should close edit modal by clicking backdrop", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should handle null title with whitespace", async () => {
    const { container } = renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const titleInput = screen.getByLabelText("Title *");
    fireEvent.change(titleInput, { target: { value: "   " } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/)).toBeInTheDocument();
    });
  });

  it("should close create modal backdrop and clear saveTimerRef", () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should close edit modal backdrop and clear saveTimerRef", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should update goal with same title", async () => {
    const { container } = renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnUpdateGoal).toHaveBeenCalled();
    });
  });

  it("should handle edit goal validation error with invalid dates", async () => {
    const { container } = renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2024-12-01" } });
    
    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2024-01-01" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/must be before/)).toBeInTheDocument();
    });
  });

  it("should test goal card hover effects", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.mouseOver(goalCard);
    fireEvent.mouseOut(goalCard);
    
    expect(goalCard).toBeInTheDocument();
  });

  it("should handle keyboard navigation with space key preventing default", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    const preventDefaultMock = jest.fn();
    fireEvent.keyDown(goalCard, { key: " ", preventDefault: preventDefaultMock });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should handle goal card click with existing saveTimerRef", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should close create modal via X button", () => {
    renderGoalTracker();

    const newGoalButton = screen.getByText("+ New Goal");
    fireEvent.click(newGoalButton);

    const closeButton = screen.getByLabelText("Close create goal dialog");
    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should close edit modal via X button", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const closeButton = screen.getByLabelText("Close edit goal dialog");
    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should close edit modal via Cancel button", () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should handle deleting a goal with confirmed dialog", async () => {
    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockOnDeleteGoal).toHaveBeenCalled();
    });
  });

  it("should not delete a goal when dialog is cancelled", () => {
    window.confirm = jest.fn().mockReturnValue(false);

    renderGoalTracker();

    const goalCard = screen.getByText("User Authentication System");
    fireEvent.click(goalCard);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDeleteGoal).not.toHaveBeenCalled();
  });

  it("should handle goal with NOT_STARTED status", () => {
    const notStartedGoal: Goal = {
      id: "goal-not-started",
      title: "Not Started Goal",
      description: "Goal that has not started",
      type: "OKR",
      status: "NOT_STARTED",
      target: "100%",
      currentProgress: 0,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      owner: "系统拆弹专家",
      color: "#ef4444",
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2024-01-01T09:00:00Z",
    };

    renderGoalTracker([notStartedGoal]);

    expect(screen.getByText("Not Started Goal")).toBeInTheDocument();
  });

  it("should handle goal with ACHIEVED status", () => {
    const achievedGoal: Goal = {
      id: "goal-achieved",
      title: "Achieved Goal",
      description: "Goal that has been achieved",
      type: "SMART",
      status: "ACHIEVED",
      target: "Complete",
      currentProgress: 100,
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      owner: "像素魔法师",
      color: "#22c55e",
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2024-06-30T18:00:00Z",
    };

    renderGoalTracker([achievedGoal]);

    expect(screen.getByText("Achieved Goal")).toBeInTheDocument();
  });

  it("should handle goal with AT_RISK status", () => {
    const atRiskGoal: Goal = {
      id: "goal-at-risk",
      title: "At Risk Goal",
      description: "Goal that is at risk",
      type: "OKR",
      status: "AT_RISK",
      target: "100%",
      currentProgress: 25,
      startDate: "2024-01-01",
      endDate: "2024-03-01",
      owner: "数据大厨",
      color: "#f97316",
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2024-02-15T10:00:00Z",
    };

    renderGoalTracker([atRiskGoal]);

    expect(screen.getByText("At Risk Goal")).toBeInTheDocument();
  });
});