import { render, screen, act, waitFor } from "@testing-library/react";
import { TaskProvider, useTasks } from "../app/dashboard/contexts/TaskContext";
import type { Task } from "../app/dashboard/types";

jest.mock("../app/dashboard/services/api", () => ({
  createTaskApi: jest.fn(async (task: Task) => task),
  updateTaskApi: jest.fn(async (_id: string, updates: Partial<Task>) => ({ id: _id, ...updates })),
  deleteTaskApi: jest.fn(async () => undefined),
}));

const TestComponent = ({
  onRender,
}: {
  onRender?: (context: ReturnType<typeof useTasks>) => void;
}) => {
  const context = useTasks();
  if (onRender) onRender(context);
  return (
    <div>
      <div data-testid="task-count">{context.tasks.length}</div>
      {context.tasks.map((task) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span data-testid={`task-${task.id}-title`}>{task.title}</span>
          <span data-testid={`task-${task.id}-status`}>{task.status}</span>
        </div>
      ))}
    </div>
  );
};

const testTask: Task = {
  id: "task-1",
  title: "Test Task",
  description: "Test description",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: new Date().toISOString(),
  tags: ["tag1"],
  assignee: "tester",
  createdAt: new Date().toISOString(),
  comments: [],
};

describe("TaskContext", () => {
  it("should initialize with empty tasks", () => {
    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    expect(screen.getByTestId("task-count").textContent).toBe("0");
  });

  it("should initialize with initial tasks", () => {
    render(
      <TaskProvider initialTasks={[testTask]}>
        <TestComponent />
      </TaskProvider>
    );

    expect(screen.getByTestId("task-count").textContent).toBe("1");
    expect(screen.getByTestId("task-task-1-title").textContent).toBe("Test Task");
  });

  it("should add a task", async () => {
    let addTask: (task: Task) => Promise<void>;

    render(
      <TaskProvider>
        <TestComponent onRender={(ctx) => { addTask = ctx.addTask; }} />
      </TaskProvider>
    );

    await act(async () => {
      await addTask(testTask);
    });

    expect(screen.getByTestId("task-count").textContent).toBe("1");
    expect(screen.getByTestId("task-task-1-title").textContent).toBe("Test Task");
  });

  it("should update a task", async () => {
    let addTask: (task: Task) => Promise<void>;
    let updateTask: (id: string, updates: Partial<Task>) => Promise<void>;

    render(
      <TaskProvider>
        <TestComponent onRender={(ctx) => { addTask = ctx.addTask; updateTask = ctx.updateTask; }} />
      </TaskProvider>
    );

    await act(async () => {
      await addTask(testTask);
    });

    expect(screen.getByTestId("task-task-1-status").textContent).toBe("TODO");

    await act(async () => {
      await updateTask("task-1", { status: "IN_PROGRESS", priority: "HIGH" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("task-task-1-status").textContent).toBe("IN_PROGRESS");
    });
  });

  it("should delete a task", async () => {
    let addTask: (task: Task) => Promise<void>;
    let deleteTask: (id: string) => Promise<void>;

    render(
      <TaskProvider>
        <TestComponent onRender={(ctx) => { addTask = ctx.addTask; deleteTask = ctx.deleteTask; }} />
      </TaskProvider>
    );

    await act(async () => {
      await addTask(testTask);
    });

    expect(screen.getByTestId("task-count").textContent).toBe("1");

    await act(async () => {
      await deleteTask("task-1");
    });

    expect(screen.getByTestId("task-count").textContent).toBe("0");
    expect(screen.queryByTestId("task-task-1")).not.toBeInTheDocument();
  });

  it("should get task by id", async () => {
    let addTask: (task: Task) => Promise<void>;
    let getTaskById!: (id: string) => Task | undefined;

    render(
      <TaskProvider>
        <TestComponent onRender={(ctx) => { addTask = ctx.addTask; getTaskById = ctx.getTaskById; }} />
      </TaskProvider>
    );

    await act(async () => {
      await addTask(testTask);
    });

    const found = getTaskById("task-1");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Test Task");
  });

  it("should return undefined for non-existent task", () => {
    let getTaskById!: (id: string) => Task | undefined;

    render(
      <TaskProvider>
        <TestComponent onRender={(ctx) => { getTaskById = ctx.getTaskById; }} />
      </TaskProvider>
    );

    const found = getTaskById("non-existent");
    expect(found).toBeUndefined();
  });

  it("should allow manual state updates via setTasks", () => {
    let setTasks: React.Dispatch<React.SetStateAction<Task[]>>;

    render(
      <TaskProvider>
        <TestComponent onRender={(ctx) => { setTasks = ctx.setTasks; }} />
      </TaskProvider>
    );

    act(() => {
      setTasks([testTask]);
    });

    expect(screen.getByTestId("task-count").textContent).toBe("1");
  });

  it("should handle multiple tasks", async () => {
    let addTask: (task: Task) => Promise<void>;

    render(
      <TaskProvider>
        <TestComponent onRender={(ctx) => { addTask = ctx.addTask; }} />
      </TaskProvider>
    );

    await act(async () => {
      await addTask(testTask);
      await addTask({
        ...testTask,
        id: "task-2",
        title: "Second Task",
      });
    });

    expect(screen.getByTestId("task-count").textContent).toBe("2");
    expect(screen.getByTestId("task-task-2-title").textContent).toBe("Second Task");
  });

  it("should throw error when useTasks is used outside TaskProvider", () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTasks must be used within TaskProvider");
  });
});
