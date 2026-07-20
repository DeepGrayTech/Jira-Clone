﻿﻿﻿import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Modal from "../app/dashboard/components/Modal";
import GoalTracker from "../app/dashboard/components/GoalTracker";
import { useWindow } from "../app/dashboard/hooks/useWindow";
import { useDataLoader } from "../app/dashboard/hooks/useDataLoader";
import { usePersistence } from "../app/dashboard/hooks/usePersistence";
import type { Goal, Requirement, Task, Milestone, KeyResult, FormFields, ModalType } from "../app/dashboard/types";

describe("Additional Component Tests", () => {
  describe("Modal", () => {
    const mockFormData: FormFields = {
      title: "Test Task",
      description: "Test Description",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      steps: "",
      expectedResult: "",
      relatedRequirementId: "",
      relatedGoalId: "",
      figmaUrl: "",
    };

    const mockSetFormData = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should not render when show is false", () => {
      render(
        <Modal
          show={false}
          modalType="task"
          editingTask={null}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={mockFormData}
          setFormData={mockSetFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}

          onSave={mockOnSave}
          onClose={mockOnClose}
          fontSizeScale={1}
          isSmall={false}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render modal with title when show is true", () => {
      render(
        <Modal
          show={true}
          modalType="task"
          editingTask={null}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={mockFormData}
          setFormData={mockSetFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}

          onSave={mockOnSave}
          onClose={mockOnClose}
          fontSizeScale={1}
          isSmall={false}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("New Task")).toBeInTheDocument();
    });

    it("should render Edit Task title when editingTask is provided", () => {
      const mockTask: Task = {
        id: "task-1",
        title: "Existing Task",
        description: "Desc",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        tags: [],
        assignee: "",
        comments: [],
        createdAt: "2026-07-12T10:00:00Z",
      };

      render(
        <Modal
          show={true}
          modalType="task"
          editingTask={mockTask}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={mockFormData}
          setFormData={mockSetFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}

          onSave={mockOnSave}
          onClose={mockOnClose}
          fontSizeScale={1}
          isSmall={false}
        />
      );

      expect(screen.getByText("Edit Task")).toBeInTheDocument();
    });

    it("should call onClose when cancel button is clicked", () => {
      render(
        <Modal
          show={true}
          modalType="task"
          editingTask={null}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={mockFormData}
          setFormData={mockSetFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}

          onSave={mockOnSave}
          onClose={mockOnClose}
          fontSizeScale={1}
          isSmall={false}
        />
      );

      fireEvent.click(screen.getByText("Cancel"));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call onClose when overlay is clicked", () => {
      render(
        <Modal
          show={true}
          modalType="task"
          editingTask={null}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={mockFormData}
          setFormData={mockSetFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}

          onSave={mockOnSave}
          onClose={mockOnClose}
          fontSizeScale={1}
          isSmall={false}
        />
      );

      const overlay = screen.getByRole("dialog");
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should render title and description inputs", () => {
      render(
        <Modal
          show={true}
          modalType="task"
          editingTask={null}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={mockFormData}
          setFormData={mockSetFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}

          onSave={mockOnSave}
          onClose={mockOnClose}
          fontSizeScale={1}
          isSmall={false}
        />
      );

      expect(screen.getByLabelText("Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    describe("Comments", () => {
      const mockTaskWithComments: Task = {
        id: "task-1",
        title: "Task with Comments",
        description: "Desc",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        tags: [],
        assignee: "",
        comments: [
          {
            id: "comment-1",
            taskId: "task-1",
            author: "testuser",
            content: "First comment",
            createdAt: "2026-07-12T10:00:00Z",
          },
          {
            id: "comment-2",
            taskId: "task-1",
            author: "admin",
            content: "Second comment",
            createdAt: "2026-07-12T11:00:00Z",
          },
        ],
        createdAt: "2026-07-12T09:00:00Z",
      };

      const mockTaskWithoutComments: Task = {
        id: "task-2",
        title: "Task without Comments",
        description: "Desc",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        tags: [],
        assignee: "",
        comments: [],
        createdAt: "2026-07-12T09:00:00Z",
      };

      const mockOnAddComment = jest.fn();
      const mockOnDeleteComment = jest.fn();

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should show comments section when editing a task", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={mockTaskWithComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={mockTaskWithComments.comments}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        expect(screen.getByText("Comments (2)")).toBeInTheDocument();
      });

      it("should display existing comments", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={mockTaskWithComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={mockTaskWithComments.comments}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        expect(screen.getByText("First comment")).toBeInTheDocument();
        expect(screen.getByText("Second comment")).toBeInTheDocument();
        expect(screen.getByText("testuser")).toBeInTheDocument();
        expect(screen.getByText("admin")).toBeInTheDocument();
      });

      it("should show 'No comments yet' message when task has no comments", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={mockTaskWithoutComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={[]}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        expect(screen.getByText("No comments yet. Add a comment below.")).toBeInTheDocument();
      });

      it("should add comment when Add button is clicked", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={mockTaskWithComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={mockTaskWithComments.comments}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        const commentInput = screen.getByPlaceholderText("Add a comment...");
        fireEvent.change(commentInput, { target: { value: "New comment" } });
        fireEvent.click(screen.getByText("Add"));

        expect(mockOnAddComment).toHaveBeenCalledWith("task-1", "New comment");
      });

      it("should add comment when Enter key is pressed", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={mockTaskWithComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={mockTaskWithComments.comments}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        const commentInput = screen.getByPlaceholderText("Add a comment...");
        fireEvent.change(commentInput, { target: { value: "New comment via enter" } });
        fireEvent.keyDown(commentInput, { key: "Enter", code: "Enter", shiftKey: false });

        expect(mockOnAddComment).toHaveBeenCalledWith("task-1", "New comment via enter");
      });

      it("should not add empty comment", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={mockTaskWithComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={mockTaskWithComments.comments}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        const commentInput = screen.getByPlaceholderText("Add a comment...");
        fireEvent.change(commentInput, { target: { value: "   " } });
        fireEvent.click(screen.getByText("Add"));

        expect(mockOnAddComment).not.toHaveBeenCalled();
      });

      it("should delete comment when Delete button is clicked", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={mockTaskWithComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={mockTaskWithComments.comments}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);

        expect(mockOnDeleteComment).toHaveBeenCalledWith("comment-1", "task-1");
      });

      it("should not show comments section when not editing a task", () => {
        render(
          <Modal
            show={true}
            modalType="task"
            editingTask={null}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={[]}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        expect(screen.queryByText("Comments")).not.toBeInTheDocument();
      });

      it("should not show comments section for non-task modal types", () => {
        render(
          <Modal
            show={true}
            modalType="bug"
            editingTask={mockTaskWithComments}
            editingRequirement={null}
            editingTestCase={null}
            editingBug={null}
            formData={mockFormData}
            setFormData={mockSetFormData}
            requirements={[]}
          goals={[]}
            tagHistory={[]}
  
            onSave={mockOnSave}
            onClose={mockOnClose}
            fontSizeScale={1}
            isSmall={false}
            taskComments={mockTaskWithComments.comments}
            onAddComment={mockOnAddComment}
            onDeleteComment={mockOnDeleteComment}
          />
        );

        expect(screen.queryByText("Comments")).not.toBeInTheDocument();
      });
    });
  });

  describe("GoalTracker", () => {
    const mockGoals: Goal[] = [
      {
        id: "goal-1",
        title: "Increase User Engagement",
        description: "Increase daily active users by 20%",
        type: "OKR",
        status: "IN_PROGRESS",
        target: "20% increase",
        currentProgress: 50,
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        owner: "需求粉碎机",
        color: "#2563eb",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-07-12T00:00:00Z",
      },
      {
        id: "goal-2",
        title: "Launch Mobile App",
        description: "Release iOS and Android apps",
        type: "PROJECT",
        status: "NOT_STARTED",
        target: "Q4 launch",
        currentProgress: 0,
        startDate: "2026-07-01",
        endDate: "2026-12-31",
        owner: "像素魔法师",
        color: "#ec4899",
        createdAt: "2026-07-01T00:00:00Z",
        updatedAt: "2026-07-01T00:00:00Z",
      },
    ];

    const mockTasks: Task[] = [];
    const mockRequirements: Requirement[] = [];
    const mockMilestones: Milestone[] = [];
    const mockKeyResults: KeyResult[] = [];

    const mockOnCreateGoal = jest.fn();
    const mockOnUpdateGoal = jest.fn();
    const mockOnDeleteGoal = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should render header and goal cards", () => {
      render(
        <GoalTracker
          goals={mockGoals}
          tasks={mockTasks}
          requirements={mockRequirements}
          milestones={mockMilestones}
          keyResults={mockKeyResults}
          onCreateGoal={mockOnCreateGoal}
          onUpdateGoal={mockOnUpdateGoal}
          onDeleteGoal={mockOnDeleteGoal}
        />
      );

      expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      expect(screen.getByText("Increase User Engagement")).toBeInTheDocument();
      expect(screen.getByText("Launch Mobile App")).toBeInTheDocument();
    });

    it("should display goal progress", () => {
      render(
        <GoalTracker
          goals={mockGoals}
          tasks={mockTasks}
          requirements={mockRequirements}
          milestones={mockMilestones}
          keyResults={mockKeyResults}
          onCreateGoal={mockOnCreateGoal}
          onUpdateGoal={mockOnUpdateGoal}
          onDeleteGoal={mockOnDeleteGoal}
        />
      );

      expect(screen.getAllByText("50%").length).toBeGreaterThan(0);
      expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
    });

    it("should render empty state when no goals", () => {
      render(
        <GoalTracker
          goals={[]}
          tasks={mockTasks}
          requirements={mockRequirements}
          milestones={mockMilestones}
          keyResults={mockKeyResults}
          onCreateGoal={mockOnCreateGoal}
          onUpdateGoal={mockOnUpdateGoal}
          onDeleteGoal={mockOnDeleteGoal}
        />
      );

      expect(screen.getByText("No goals yet. Click \"New Goal\" to create one!")).toBeInTheDocument();
    });

    it("should render New Goal button", () => {
      render(
        <GoalTracker
          goals={mockGoals}
          tasks={mockTasks}
          requirements={mockRequirements}
          milestones={mockMilestones}
          keyResults={mockKeyResults}
          onCreateGoal={mockOnCreateGoal}
          onUpdateGoal={mockOnUpdateGoal}
          onDeleteGoal={mockOnDeleteGoal}
        />
      );

      expect(screen.getByRole("button", { name: "Create new goal" })).toBeInTheDocument();
    });

    it("should filter goals by search query", () => {
      render(
        <GoalTracker
          goals={mockGoals}
          tasks={mockTasks}
          requirements={mockRequirements}
          milestones={mockMilestones}
          keyResults={mockKeyResults}
          onCreateGoal={mockOnCreateGoal}
          onUpdateGoal={mockOnUpdateGoal}
          onDeleteGoal={mockOnDeleteGoal}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search goals by title, description, owner, or type...");
      fireEvent.change(searchInput, { target: { value: "Mobile" } });

      expect(screen.getByText("Launch Mobile App")).toBeInTheDocument();
      expect(screen.queryByText("Increase User Engagement")).not.toBeInTheDocument();
    });
  });

});

describe("Custom Hooks", () => {
  describe("useWindow", () => {
    it("should be a function", () => {
      expect(typeof useWindow).toBe("function");
    });
  });

  describe("useDataLoader", () => {
    it("should be a function", () => {
      expect(typeof useDataLoader).toBe("function");
    });
  });

  describe("usePersistence", () => {
    it("should be a function", () => {
      expect(typeof usePersistence).toBe("function");
    });
  });
});