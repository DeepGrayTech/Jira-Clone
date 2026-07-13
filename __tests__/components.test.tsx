import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import RequirementCard from "../app/dashboard/components/RequirementCard";
import TestCaseCard from "../app/dashboard/components/TestCaseCard";
import DashboardNavigation from "../app/dashboard/components/DashboardNavigation";
import LoginForm from "../app/dashboard/components/LoginForm";
import TaskCard from "../app/dashboard/components/TaskCard";
import TaskColumn from "../app/dashboard/components/TaskColumn";
import type { Requirement, TestCase, Task } from "../app/dashboard/types";

describe("Component Tests", () => {
  describe("RequirementCard", () => {
    const mockRequirement: Requirement = {
      id: "req-1",
      title: "Test Requirement",
      description: "Test Description",
      source: "ISO 9001:2015",
      priority: "HIGH",
      status: "DRAFT",
      acceptanceCriteria: ["Criteria 1", "Criteria 2"],
      createdAt: "2026-07-12T10:00:00Z",
      updatedAt: "2026-07-12T10:00:00Z",
      requester: "Alice",
      executor: "Bob",
    };

    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should render requirement card with title and description", () => {
      render(<RequirementCard requirement={mockRequirement} onEdit={mockOnEdit} onDelete={mockOnDelete} isSmall={false} fontSizeScale={1} />);

      expect(screen.getByText("Test Requirement")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("should display priority and status badges", () => {
      render(<RequirementCard requirement={mockRequirement} onEdit={mockOnEdit} onDelete={mockOnDelete} isSmall={false} fontSizeScale={1} />);

      expect(screen.getByText("HIGH")).toBeInTheDocument();
      expect(screen.getByText("Draft")).toBeInTheDocument();
    });

    it("should call onEdit when card is clicked", () => {
      render(<RequirementCard requirement={mockRequirement} onEdit={mockOnEdit} onDelete={mockOnDelete} isSmall={false} fontSizeScale={1} />);

      fireEvent.click(screen.getByText("Test Requirement"));

      expect(mockOnEdit).toHaveBeenCalledWith(mockRequirement);
    });
  });

  describe("TestCaseCard", () => {
    const mockTestCase: TestCase = {
      id: "tc-1",
      requirementId: "req-1",
      title: "Test Case",
      description: "Test Description",
      steps: ["Step 1", "Step 2"],
      expectedResult: "Expected Result",
      status: "PENDING",
    };

    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should render test case card with title", () => {
      render(<TestCaseCard testCase={mockTestCase} onEdit={mockOnEdit} onDelete={mockOnDelete} isSmall={false} />);

      expect(screen.getByText("Test Case")).toBeInTheDocument();
    });

    it("should display status badge", () => {
      render(<TestCaseCard testCase={mockTestCase} onEdit={mockOnEdit} onDelete={mockOnDelete} isSmall={false} />);

      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("should call onEdit when card is clicked", () => {
      render(<TestCaseCard testCase={mockTestCase} onEdit={mockOnEdit} onDelete={mockOnDelete} isSmall={false} />);

      fireEvent.click(screen.getByText("Test Case"));

      expect(mockOnEdit).toHaveBeenCalledWith(mockTestCase);
    });
  });

  describe("DashboardNavigation", () => {
    const mockOnViewChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should render all navigation items", () => {
      render(<DashboardNavigation currentView="TASKS" onViewChange={mockOnViewChange} fontSizeScale={1} />);

      expect(screen.getByText("Tasks")).toBeInTheDocument();
      expect(screen.getByText("Requirements")).toBeInTheDocument();
      expect(screen.getByText("Testing")).toBeInTheDocument();
      expect(screen.getByText("Bugs")).toBeInTheDocument();
      expect(screen.getByText("Goals")).toBeInTheDocument();
      expect(screen.getByText("Audit")).toBeInTheDocument();
    });

    it("should call onViewChange when navigation item is clicked", () => {
      render(<DashboardNavigation currentView="TASKS" onViewChange={mockOnViewChange} fontSizeScale={1} />);

      fireEvent.click(screen.getByText("Requirements"));

      expect(mockOnViewChange).toHaveBeenCalledWith("REQUIREMENTS");
    });
  });

  describe("LoginForm", () => {
    const mockOnLogin = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();

      const localStorageMock = (() => {
        let store: Record<string, string> = {};
        return {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => {
            store[key] = value.toString();
          },
          removeItem: (key: string) => {
            delete store[key];
          },
          clear: () => {
            store = {};
          },
          length: () => Object.keys(store).length,
          key: (index: number) => Object.keys(store)[index] || null,
        };
      })();
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
        writable: true,
      });
    });

    it("should render login form with email and password fields", () => {
      render(<LoginForm onLogin={mockOnLogin} />);

      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
    });

    it("should render login and register buttons", () => {
      render(<LoginForm onLogin={mockOnLogin} />);

      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });
  });

  describe("TaskCard", () => {
    const mockTask: Task = {
      id: "task-1",
      title: "Test Task",
      description: "Test Description",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "2026-12-31",
      tags: ["frontend", "bug"],
      assignee: "John",
      comments: [],
      createdAt: "2026-07-12T10:00:00Z",
    };

    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockSetIsDragging = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const renderWithDnD = (component: React.ReactNode) => {
      return render(
        <DragDropContext onDragEnd={() => {}}>
          {component}
        </DragDropContext>
      );
    };

    it("should render task card with title and description", () => {
      renderWithDnD(
        <Droppable droppableId="TODO">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard
                task={mockTask}
                index={0}
                isDragging={false}
                setIsDragging={mockSetIsDragging}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                fontSizeScale={1}
                isSmall={false}
                isRecentlyDragged={false}
              />
            </div>
          )}
        </Droppable>
      );

      expect(screen.getByText("Test Task")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("should display priority badge", () => {
      renderWithDnD(
        <Droppable droppableId="TODO">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard
                task={mockTask}
                index={0}
                isDragging={false}
                setIsDragging={mockSetIsDragging}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                fontSizeScale={1}
                isSmall={false}
                isRecentlyDragged={false}
              />
            </div>
          )}
        </Droppable>
      );

      expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    });

    it("should display tags correctly", () => {
      renderWithDnD(
        <Droppable droppableId="TODO">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard
                task={mockTask}
                index={0}
                isDragging={false}
                setIsDragging={mockSetIsDragging}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                fontSizeScale={1}
                isSmall={false}
                isRecentlyDragged={false}
              />
            </div>
          )}
        </Droppable>
      );

      expect(screen.getByText("#frontend")).toBeInTheDocument();
      expect(screen.getByText("#bug")).toBeInTheDocument();
    });

    it("should display assignee and due date", () => {
      renderWithDnD(
        <Droppable droppableId="TODO">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard
                task={mockTask}
                index={0}
                isDragging={false}
                setIsDragging={mockSetIsDragging}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                fontSizeScale={1}
                isSmall={false}
                isRecentlyDragged={false}
              />
            </div>
          )}
        </Droppable>
      );

      expect(screen.getByText("👤 John")).toBeInTheDocument();
      expect(screen.getByText("📅 2026-12-31")).toBeInTheDocument();
    });

    it("should call onEdit when card is clicked", () => {
      renderWithDnD(
        <Droppable droppableId="TODO">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard
                task={mockTask}
                index={0}
                isDragging={false}
                setIsDragging={mockSetIsDragging}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                fontSizeScale={1}
                isSmall={false}
                isRecentlyDragged={false}
              />
            </div>
          )}
        </Droppable>
      );

      fireEvent.click(screen.getByText("Test Task"));

      expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
    });

    it("should call onDelete when delete button is clicked", () => {
      renderWithDnD(
        <Droppable droppableId="TODO">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard
                task={mockTask}
                index={0}
                isDragging={false}
                setIsDragging={mockSetIsDragging}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                fontSizeScale={1}
                isSmall={false}
                isRecentlyDragged={false}
              />
            </div>
          )}
        </Droppable>
      );

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe("TaskColumn", () => {
    const mockTasks: Task[] = [
      {
        id: "task-1",
        title: "Task 1",
        description: "Desc 1",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "2026-12-31",
        tags: [],
        assignee: "John",
        comments: [],
        createdAt: "2026-07-12T10:00:00Z",
      },
      {
        id: "task-2",
        title: "Task 2",
        description: "Desc 2",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2026-12-31",
        tags: [],
        assignee: "Jane",
        comments: [],
        createdAt: "2026-07-12T10:00:00Z",
      },
    ];

    const mockRequirements: Requirement[] = [];
    const mockOnEditTask = jest.fn();
    const mockOnDeleteTask = jest.fn();
    const mockSetIsDragging = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const renderWithDnD = (component: React.ReactNode) => {
      return render(
        <DragDropContext onDragEnd={() => {}}>
          {component}
        </DragDropContext>
      );
    };

    it("should render column title and task count", () => {
      renderWithDnD(
        <TaskColumn
          status="TODO"
          tasks={mockTasks}
          requirements={mockRequirements}
          isDragging={false}
          setIsDragging={mockSetIsDragging}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
          getColumnWidth={() => "280px"}
          fontSizeScale={1}
          isSmall={false}
          recentlyDraggedTaskId={null}
        />
      );

      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("(2)")).toBeInTheDocument();
    });

    it("should render all tasks in the column", () => {
      renderWithDnD(
        <TaskColumn
          status="TODO"
          tasks={mockTasks}
          requirements={mockRequirements}
          isDragging={false}
          setIsDragging={mockSetIsDragging}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
          getColumnWidth={() => "280px"}
          fontSizeScale={1}
          isSmall={false}
          recentlyDraggedTaskId={null}
        />
      );

      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });

    it("should render empty state when no tasks", () => {
      renderWithDnD(
        <TaskColumn
          status="TODO"
          tasks={[]}
          requirements={mockRequirements}
          isDragging={false}
          setIsDragging={mockSetIsDragging}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
          getColumnWidth={() => "280px"}
          fontSizeScale={1}
          isSmall={false}
          recentlyDraggedTaskId={null}
        />
      );

      expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    });

    it("should display correct priority badges for tasks", () => {
      renderWithDnD(
        <TaskColumn
          status="TODO"
          tasks={mockTasks}
          requirements={mockRequirements}
          isDragging={false}
          setIsDragging={mockSetIsDragging}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
          getColumnWidth={() => "280px"}
          fontSizeScale={1}
          isSmall={false}
          recentlyDraggedTaskId={null}
        />
      );

      expect(screen.getByText("MEDIUM")).toBeInTheDocument();
      expect(screen.getByText("HIGH")).toBeInTheDocument();
    });
  });
});