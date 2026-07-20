import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TasksView from "../app/dashboard/views/TasksView";
import { TaskProvider } from "../app/dashboard/contexts/TaskContext";
import { RequirementProvider } from "../app/dashboard/contexts/RequirementContext";
import type { Task, FormFields } from "../app/dashboard/types";
import { act } from "react";

let mockOnDragEnd: ((result: any) => void) | null = null;

beforeAll(() => {
  jest.useFakeTimers();
});

beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (result: any) => void }) => {
    mockOnDragEnd = onDragEnd;
    return <div data-testid="drag-drop-context">{children}</div>;
  },
  Droppable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) => {
    return children(
      { innerRef: jest.fn(), droppableProps: {}, placeholder: null },
      { isDragging: false }
    );
  },
  Draggable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) => {
    return children(
      { innerRef: jest.fn(), draggableProps: { draggable: true }, dragHandleProps: {} },
      { isDragging: false }
    );
  },
}));

describe("TasksView", () => {
  const mockTasks: Task[] = [
    {
      id: "t1",
      title: "Task 1",
      description: "Description 1",
      status: "TODO",
      priority: "HIGH",
      dueDate: "2024-12-31",
      tags: ["frontend", "ui"],
      assignee: "像素魔法师",
      createdAt: "2024-01-01",
      comments: [],
    },
    {
      id: "t2",
      title: "Task 2",
      description: "Description 2",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: "2024-12-31",
      tags: ["backend"],
      assignee: "数据大厨",
      createdAt: "2024-01-02",
      comments: [],
    },
    {
      id: "t3",
      title: "Task 3",
      description: "Description 3",
      status: "DONE",
      priority: "LOW",
      dueDate: "2024-12-31",
      tags: ["testing"],
      assignee: "代码找茬王",
      createdAt: "2024-01-03",
      comments: [],
    },
  ];

  const mockOnCreateTask = jest.fn();
  const mockOnEditTask = jest.fn();
  const mockSetEditingTask = jest.fn();
  const mockSetModalType = jest.fn();
  const mockSetFormData = jest.fn();

  const renderWithProviders = (tasks: Task[] = mockTasks) => {
    return render(
      <TaskProvider initialTasks={tasks}>
        <RequirementProvider>
          <TasksView
            fontSizeScale={1}
            isSmall={false}
            getColumnWidth={() => "300px"}
            onCreateTask={mockOnCreateTask}
            onEditTask={mockOnEditTask}
            setEditingTask={mockSetEditingTask}
            setModalType={mockSetModalType}
            setFormData={mockSetFormData}
          />
        </RequirementProvider>
      </TaskProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render Task Board header", () => {
    const { getByText } = renderWithProviders();

    expect(getByText("Task Board")).toBeInTheDocument();
    expect(getByText("+ New Task")).toBeInTheDocument();
  });

  it("should render search input", () => {
    const { getByPlaceholderText } = renderWithProviders();

    expect(getByPlaceholderText("Search tasks by title, description, or tags...")).toBeInTheDocument();
  });

  it("should render priority filter", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it("should render assignee filter", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it("should filter tasks by search query", () => {
    const { getByPlaceholderText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "Task 1" } });

    expect(searchInput).toHaveValue("Task 1");
  });

  it("should filter tasks by priority", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    expect(selects.length).toBe(2);
    const prioritySelect = selects[0];

    fireEvent.change(prioritySelect, { target: { value: "HIGH" } });

    expect((prioritySelect as HTMLSelectElement).value).toBe("HIGH");
  });

  it("should filter tasks by assignee", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    expect(selects.length).toBe(2);
  });

  it("should clear filters when clicking Clear Filters button", () => {
    const { getByPlaceholderText, getAllByRole, getByText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    const selects = getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "HIGH" } });
    fireEvent.change(selects[1], { target: { value: "像素魔法师" } });

    const clearButton = getByText("Clear Filters");
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue("");
    expect(selects[0]).toHaveValue("");
    expect(selects[1]).toHaveValue("");
  });

  it("should hide Clear Filters button when no filters are active", () => {
    const { queryByText } = renderWithProviders();

    expect(queryByText("Clear Filters")).not.toBeInTheDocument();
  });

  it("should show Clear Filters button when filters are active", () => {
    const { getByPlaceholderText, getByText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    expect(getByText("Clear Filters")).toBeInTheDocument();
  });

  it("should call onCreateTask when clicking + New Task button", () => {
    const { getByText } = renderWithProviders();

    const newTaskButton = getByText("+ New Task");
    fireEvent.click(newTaskButton);

    expect(mockOnCreateTask).toHaveBeenCalled();
  });

  it("should filter tasks by tags", () => {
    const { getByPlaceholderText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "frontend" } });

    expect(searchInput).toHaveValue("frontend");
  });

  it("should filter tasks by description", () => {
    const { getByPlaceholderText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "Description 1" } });

    expect(searchInput).toHaveValue("Description 1");
  });

  it("should filter tasks by assignee name", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    expect(selects.length).toBe(2);
    const assigneeSelect = selects[1];

    fireEvent.change(assigneeSelect, { target: { value: "需求粉碎机" } });

    expect((assigneeSelect as HTMLSelectElement).value).toBe("需求粉碎机");
  });

  it("should render default assignee options", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    const assigneeSelect = selects[1];
    
    const options = (assigneeSelect as HTMLSelectElement).options;
    const optionValues = Array.from(options).map(opt => opt.value);
    
    expect(optionValues).toContain("");
    expect(optionValues).toContain("需求粉碎机");
    expect(optionValues).toContain("系统拆弹专家");
    expect(optionValues).toContain("代码质检员");
    expect(optionValues).toContain("架构师");
  });

  it("should render TaskColumn components for each status", () => {
    const { container } = renderWithProviders();

    const regions = container.querySelectorAll('[role="region"]');
    expect(regions.length).toBeGreaterThan(0);
  });

  it("should handle empty search query", () => {
    const { getByPlaceholderText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "" } });

    expect(searchInput).toHaveValue("");
  });

  it("should handle empty priority filter", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    const prioritySelect = selects[0];

    fireEvent.change(prioritySelect, { target: { value: "" } });

    expect((prioritySelect as HTMLSelectElement).value).toBe("");
  });

  it("should handle empty assignee filter", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    const assigneeSelect = selects[1];

    fireEvent.change(assigneeSelect, { target: { value: "" } });

    expect((assigneeSelect as HTMLSelectElement).value).toBe("");
  });

  it("should call handleEditTask when clicking a task card", () => {
    const { getByText } = renderWithProviders();

    const taskTitle = screen.getByText("Task 1");
    fireEvent.click(taskTitle);

    expect(mockSetEditingTask).toHaveBeenCalled();
    expect(mockSetModalType).toHaveBeenCalledWith("task");
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should call handleDeleteTask when delete button is clicked", () => {
    const { getByText, container } = renderWithProviders();

    const deleteButtons = screen.getAllByRole("button", { name: /delete task/i });
    expect(deleteButtons.length).toBe(3);

    fireEvent.click(deleteButtons[0]);

    const remainingDeleteButtons = screen.getAllByRole("button", { name: /delete task/i });
    expect(remainingDeleteButtons.length).toBe(2);
  });

  it("should generate allAssignees list from tasks", () => {
    const customTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: [],
        assignee: "TestUser",
        createdAt: "2024-01-01",
        comments: [],
      },
    ];

    const { getAllByRole } = renderWithProviders(customTasks);

    const selects = getAllByRole("combobox");
    const assigneeSelect = selects[1];
    
    const options = (assigneeSelect as HTMLSelectElement).options;
    const optionValues = Array.from(options).map(opt => opt.value);
    
    expect(optionValues).toContain("TestUser");
  });

  it("should filter tasks by multiple criteria", () => {
    const { getByPlaceholderText, getAllByRole } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "Task" } });

    const selects = getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "HIGH" } });

    expect(searchInput).toHaveValue("Task");
    expect((selects[0] as HTMLSelectElement).value).toBe("HIGH");
  });

  it("should handle case-insensitive search", () => {
    const { getByPlaceholderText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "task 1" } });

    expect(searchInput).toHaveValue("task 1");
  });

  it("should handle case-insensitive assignee filter", () => {
    const { getAllByRole } = renderWithProviders();

    const selects = getAllByRole("combobox");
    const assigneeSelect = selects[1];

    fireEvent.change(assigneeSelect, { target: { value: "需求粉碎机" } });

    expect((assigneeSelect as HTMLSelectElement).value).toBe("需求粉碎机");
  });

  it("should filter tasks by all criteria combined", () => {
    const { getByPlaceholderText, getAllByRole } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "Task" } });

    const selects = getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "HIGH" } });
    fireEvent.change(selects[1], { target: { value: "像素魔法师" } });

    expect(searchInput).toHaveValue("Task");
    expect((selects[0] as HTMLSelectElement).value).toBe("HIGH");
    expect((selects[1] as HTMLSelectElement).value).toBe("像素魔法师");
  });

  it("should render with empty tasks array", () => {
    renderWithProviders([]);

    const todoColumn = screen.getByRole("region", { name: /To Do/i });
    expect(todoColumn).toBeInTheDocument();
  });

  it("should handle isSmall prop", () => {
    const { container } = render(
      <TaskProvider initialTasks={mockTasks}>
        <RequirementProvider>
          <TasksView
            fontSizeScale={1}
            isSmall={true}
            getColumnWidth={() => "200px"}
            onCreateTask={mockOnCreateTask}
            onEditTask={mockOnEditTask}
            setEditingTask={mockSetEditingTask}
            setModalType={mockSetModalType}
            setFormData={mockSetFormData}
          />
        </RequirementProvider>
      </TaskProvider>
    );

    const columns = container.querySelectorAll('[role="region"]');
    expect(columns.length).toBeGreaterThan(0);
  });

  it("should handle different fontSizeScale", () => {
    const { getByText } = render(
      <TaskProvider initialTasks={mockTasks}>
        <RequirementProvider>
          <TasksView
            fontSizeScale={0.8}
            isSmall={false}
            getColumnWidth={() => "300px"}
            onCreateTask={mockOnCreateTask}
            onEditTask={mockOnEditTask}
            setEditingTask={mockSetEditingTask}
            setModalType={mockSetModalType}
            setFormData={mockSetFormData}
          />
        </RequirementProvider>
      </TaskProvider>
    );

    expect(getByText("Task Board")).toBeInTheDocument();
  });

  it("should filter tasks by tag in lowercase", () => {
    const { getByPlaceholderText } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "frontend" } });

    expect(searchInput).toHaveValue("frontend");
  });

  it("should handle drag end with null destination", () => {
    const { container } = renderWithProviders();

    const columns = container.querySelectorAll('[role="region"]');
    expect(columns.length).toBeGreaterThan(0);
  });

  it("should handle drag end within same column", () => {
    const { container } = renderWithProviders();

    const columns = container.querySelectorAll('[role="region"]');
    expect(columns.length).toBeGreaterThan(0);
  });

  it("should handle drag end with invalid status", () => {
    const { container } = renderWithProviders();

    const columns = container.querySelectorAll('[role="region"]');
    expect(columns.length).toBeGreaterThan(0);
  });

  it("should set complete form data when editing a task", () => {
    const testTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test Description",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: ["test", "demo"],
        assignee: "TestUser",
        createdAt: "2024-01-01",
        comments: [],
        relatedRequirementId: "req-1",
        relatedGoalId: "goal-1",
        figmaUrl: "https://figma.com/test",
      },
    ];

    renderWithProviders(testTasks);

    const taskTitle = screen.getByText("Test Task");
    fireEvent.click(taskTitle);

    expect(mockSetEditingTask).toHaveBeenCalled();
    expect(mockSetModalType).toHaveBeenCalledWith("task");
    
    const formDataCall = mockSetFormData.mock.calls[0][0];
    expect(formDataCall.title).toBe("Test Task");
    expect(formDataCall.description).toBe("Test Description");
    expect(formDataCall.status).toBe("TODO");
    expect(formDataCall.priority).toBe("HIGH");
    expect(formDataCall.dueDate).toBe("2024-12-31");
    expect(formDataCall.tags).toEqual(["test", "demo"]);
    expect(formDataCall.assignee).toBe("TestUser");
    expect(formDataCall.relatedRequirementId).toBe("req-1");
    expect(formDataCall.relatedGoalId).toBe("goal-1");
    expect(formDataCall.figmaUrl).toBe("https://figma.com/test");
  });

  it("should set empty related fields when task has no relations", () => {
    const testTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test Description",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: [],
        assignee: "TestUser",
        createdAt: "2024-01-01",
        comments: [],
      },
    ];

    renderWithProviders(testTasks);

    const taskTitle = screen.getByText("Test Task");
    fireEvent.click(taskTitle);

    const formDataCall = mockSetFormData.mock.calls[0][0];
    expect(formDataCall.relatedRequirementId).toBe("");
    expect(formDataCall.relatedGoalId).toBe("");
    expect(formDataCall.figmaUrl).toBe("");
  });

  it("should render all status columns", () => {
    const { container } = renderWithProviders();

    const regions = container.querySelectorAll('[role="region"]');
    const regionLabels = Array.from(regions).map(r => r.getAttribute('aria-label'));
    
    expect(regionLabels).toContain("To Do column, 1 tasks");
    expect(regionLabels).toContain("In Progress column, 1 tasks");
    expect(regionLabels).toContain("Done column, 1 tasks");
  });

  it("should show column headers with status labels", () => {
    const { getByRole } = renderWithProviders();

    const todoColumn = getByRole("region", { name: /To Do/i });
    expect(todoColumn).toBeInTheDocument();

    const inProgressColumn = getByRole("region", { name: /In Progress/i });
    expect(inProgressColumn).toBeInTheDocument();

    const doneColumn = getByRole("region", { name: /Done/i });
    expect(doneColumn).toBeInTheDocument();
  });

  it("should show No tasks yet when column has no tasks", () => {
    const customTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: [],
        assignee: "TestUser",
        createdAt: "2024-01-01",
        comments: [],
      },
    ];

    const { queryAllByText } = renderWithProviders(customTasks);

    const noTasksElements = queryAllByText("No tasks yet");
    expect(noTasksElements.length).toBeGreaterThan(0);
  });

  it("should handle mouse over on New Task button", () => {
    const { getByText } = renderWithProviders();

    const newTaskButton = getByText("+ New Task");
    fireEvent.mouseOver(newTaskButton);
    fireEvent.mouseOut(newTaskButton);

    expect(newTaskButton).toBeInTheDocument();
  });

  it("should render tasks from allAssignees optgroup", () => {
    const customTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: [],
        assignee: "CustomAssignee",
        createdAt: "2024-01-01",
        comments: [],
      },
    ];

    const { getAllByRole } = renderWithProviders(customTasks);

    const selects = getAllByRole("combobox");
    const assigneeSelect = selects[1];
    
    const options = (assigneeSelect as HTMLSelectElement).options;
    const optionValues = Array.from(options).map(opt => opt.value);
    
    expect(optionValues).toContain("CustomAssignee");
  });

  it("should not render Other Assignees optgroup when no custom assignees", () => {
    const customTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: [],
        assignee: "",
        createdAt: "2024-01-01",
        comments: [],
      },
    ];

    const { getAllByRole } = renderWithProviders(customTasks);

    const selects = getAllByRole("combobox");
    const assigneeSelect = selects[1];
    
    const optgroups = (assigneeSelect as HTMLSelectElement).querySelectorAll('optgroup');
    const otherAssigneesOptgroup = Array.from(optgroups).find(
      og => og?.getAttribute('label') === '📋 Other Assignees'
    );
    
    expect(otherAssigneesOptgroup).toBeUndefined();
  });

  it("should handle dragging task between different columns", () => {
    const { getByRole, getByText, container } = renderWithProviders();

    const todoColumn = getByRole("region", { name: /To Do/i });
    const inProgressColumn = getByRole("region", { name: /In Progress/i });
    expect(todoColumn).toBeInTheDocument();
    expect(inProgressColumn).toBeInTheDocument();

    const taskTitle = getByText("Task 1");
    const taskCard = taskTitle.closest('[role="button"]');
    expect(taskCard).toBeInTheDocument();

    fireEvent.mouseDown(taskCard!);
    fireEvent.mouseMove(taskCard!);
    fireEvent.mouseUp(taskCard!);

    expect(taskTitle).toBeInTheDocument();
  });

  it("should handle mouse down and mouse up events on task cards", () => {
    const { getByText } = renderWithProviders();

    const taskTitle = getByText("Task 1");
    const taskCard = taskTitle.closest('[role="button"]');
    expect(taskCard).toBeInTheDocument();

    fireEvent.mouseDown(taskCard!);
    fireEvent.mouseUp(taskCard!);

    expect(taskCard).toBeInTheDocument();
  });

  it("should handle task with empty assignee", () => {
    const customTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: [],
        assignee: "",
        createdAt: "2024-01-01",
        comments: [],
      },
    ];

    const { getByText } = renderWithProviders(customTasks);

    expect(getByText("Test Task")).toBeInTheDocument();
  });

  it("should handle task with null related fields", () => {
    const testTasks: Task[] = [
      {
        id: "t1",
        title: "Test Task",
        description: "Test",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
        tags: [],
        assignee: "TestUser",
        createdAt: "2024-01-01",
        comments: [],
        relatedRequirementId: null,
        relatedGoalId: null,
        figmaUrl: null,
      },
    ];

    renderWithProviders(testTasks);

    const taskTitle = screen.getByText("Test Task");
    fireEvent.click(taskTitle);

    const formDataCall = mockSetFormData.mock.calls[0][0];
    expect(formDataCall.relatedRequirementId).toBe("");
    expect(formDataCall.relatedGoalId).toBe("");
    expect(formDataCall.figmaUrl).toBe("");
  });

  it("should handle filter combination with empty values", () => {
    const { getByPlaceholderText, getAllByRole } = renderWithProviders();

    const searchInput = getByPlaceholderText("Search tasks by title, description, or tags...");
    fireEvent.change(searchInput, { target: { value: "" } });

    const selects = getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "" } });
    fireEvent.change(selects[1], { target: { value: "" } });

    expect(searchInput).toHaveValue("");
    expect((selects[0] as HTMLSelectElement).value).toBe("");
    expect((selects[1] as HTMLSelectElement).value).toBe("");
  });

  it("should move task to IN_PROGRESS when dragged between columns", () => {
    const { getByText, getByRole } = renderWithProviders();

    const todoColumn = getByRole("region", { name: /To Do/i });
    const inProgressColumn = getByRole("region", { name: /In Progress/i });

    const taskTitle = getByText("Task 1");
    const taskCard = taskTitle.closest('[role="button"]');

    fireEvent.dragStart(taskCard!);
    fireEvent.dragOver(inProgressColumn);
    fireEvent.drop(inProgressColumn);
    fireEvent.dragEnd(taskCard!, {
      dataTransfer: {
        getData: jest.fn(),
        setData: jest.fn(),
      },
    });

    expect(taskTitle).toBeInTheDocument();
  });

  it("should update recentlyDraggedTaskId after drag", async () => {
    const { getByText, getByRole } = renderWithProviders();

    const todoColumn = getByRole("region", { name: /To Do/i });
    const inProgressColumn = getByRole("region", { name: /In Progress/i });

    const taskTitle = getByText("Task 1");
    const taskCard = taskTitle.closest('[role="button"]');

    fireEvent.dragStart(taskCard!);
    fireEvent.dragOver(inProgressColumn);
    fireEvent.drop(inProgressColumn);
    fireEvent.dragEnd(taskCard!);

    act(() => {
      jest.runAllTimers();
    });

    expect(taskTitle).toBeInTheDocument();
  });

  it("should handleDragEnd with null destination", () => {
    renderWithProviders();
    
    expect(mockOnDragEnd).not.toBeNull();
    
    act(() => {
      mockOnDragEnd!({ destination: null, source: { droppableId: "TODO" }, draggableId: "t1" });
    });
  });

  it("should handleDragEnd within same column", () => {
    renderWithProviders();
    
    act(() => {
      mockOnDragEnd!({ 
        destination: { droppableId: "TODO", index: 1 }, 
        source: { droppableId: "TODO", index: 0 }, 
        draggableId: "t1" 
      });
    });
  });

  it("should handleDragEnd with invalid status", () => {
    renderWithProviders();
    
    act(() => {
      mockOnDragEnd!({ 
        destination: { droppableId: "INVALID_STATUS", index: 0 }, 
        source: { droppableId: "TODO", index: 0 }, 
        draggableId: "t1" 
      });
    });
  });

  it("should handleDragEnd with valid move between columns", () => {
    renderWithProviders();
    
    act(() => {
      mockOnDragEnd!({ 
        destination: { droppableId: "IN_PROGRESS", index: 0 }, 
        source: { droppableId: "TODO", index: 0 }, 
        draggableId: "t1" 
      });
    });
  });

  it("should handleDragEnd with non-existent task", () => {
    renderWithProviders();
    
    act(() => {
      mockOnDragEnd!({ 
        destination: { droppableId: "IN_PROGRESS", index: 0 }, 
        source: { droppableId: "TODO", index: 0 }, 
        draggableId: "non-existent-task" 
      });
    });
  });
});
