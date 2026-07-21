import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import { BugProvider, useBugs } from "../app/dashboard/contexts/BugContext";
import type { Bug } from "../app/dashboard/types";

jest.mock("../app/dashboard/services/api", () => ({
  createBugApi: jest.fn(async (bug: Bug) => bug),
  updateBugApi: jest.fn(async (_id: string, updates: Partial<Bug>) => ({ id: _id, ...updates })),
  deleteBugApi: jest.fn(async () => undefined),
}));

describe("BugContext", () => {
  const testBug: Bug = {
    id: "bug-1",
    title: "Test Bug",
    description: "Test Description",
    status: "REPORTED",
    severity: "HIGH",
    priority: "HIGH",
    stepsToReproduce: [],
    expectedBehavior: "",
    actualBehavior: "",
    reporter: "Test Reporter",
    assignee: "Test User",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    comments: [],
  };

  const TestComponent = ({ 
    onRender, 
    onAction 
  }: { 
    onRender?: (context: ReturnType<typeof useBugs>) => void;
    onAction?: (context: ReturnType<typeof useBugs>) => void;
  }) => {
    const context = useBugs();
    if (onRender) onRender(context);
    return (
      <div>
        <button onClick={() => onAction?.(context)} data-testid="action-btn">
          Action
        </button>
        <span data-testid="bug-count">{context.bugs.length}</span>
        {context.bugs.map((bug) => (
          <div key={bug.id} data-testid={`bug-${bug.id}`}>
            <span data-testid={`bug-${bug.id}-title`}>{bug.title}</span>
            <span data-testid={`bug-${bug.id}-status`}>{bug.status}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderWithProvider = (component: React.ReactNode) => {
    return render(<BugProvider>{component}</BugProvider>);
  };

  it("should initialize with empty bugs array", () => {
    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId("bug-count").textContent).toBe("0");
  });

  it("should add a bug", async () => {
    let addBug: (bug: Bug) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { addBug = ctx.addBug; }} 
      />
    );

    expect(screen.getByTestId("bug-count").textContent).toBe("0");

    await act(async () => {
      await addBug(testBug);
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("1");
    expect(screen.getByTestId("bug-bug-1-title").textContent).toBe("Test Bug");
  });

  it("should update a bug", async () => {
    let addBug: (bug: Bug) => Promise<void>;
    let updateBug: (id: string, updates: Partial<Bug>) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          updateBug = ctx.updateBug;
        }} 
      />
    );

    await act(async () => {
      await addBug(testBug);
    });

    expect(screen.getByTestId("bug-bug-1-status").textContent).toBe("REPORTED");

    await act(async () => {
      await updateBug("bug-1", { status: "IN_PROGRESS", description: "Updated Description" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("bug-bug-1-status").textContent).toBe("IN_PROGRESS");
    });
  });

  it("should delete a bug", async () => {
    let addBug: (bug: Bug) => Promise<void>;
    let deleteBug: (id: string) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          deleteBug = ctx.deleteBug;
        }} 
      />
    );

    await act(async () => {
      await addBug(testBug);
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("1");

    await act(async () => {
      await deleteBug("bug-1");
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("0");
    expect(screen.queryByTestId("bug-bug-1")).not.toBeInTheDocument();
  });

  it("should get bug by id", async () => {
    let addBug: (bug: Bug) => Promise<void>;
    let foundBug: Bug | undefined;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
        }} 
        onAction={(ctx) => {
          foundBug = ctx.getBugById("bug-1");
        }}
      />
    );

    await act(async () => {
      await addBug(testBug);
    });

    fireEvent.click(screen.getByTestId("action-btn"));

    expect(foundBug).toBeDefined();
    expect(foundBug!.id).toBe("bug-1");
    expect(foundBug!.title).toBe("Test Bug");
  });

  it("should return undefined for non-existent bug id", () => {
    let foundBug: Bug | undefined;

    renderWithProvider(
      <TestComponent 
        onAction={(ctx) => {
          foundBug = ctx.getBugById("non-existent");
        }}
      />
    );

    fireEvent.click(screen.getByTestId("action-btn"));

    expect(foundBug).toBeUndefined();
  });

  it("should throw error when useBugs is used outside BugProvider", () => {
    const TestComponentOutside = () => {
      useBugs();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutside />);
    }).toThrow("useBugs must be used within BugProvider");
  });

  it("should handle multiple bugs", async () => {
    let addBug: (bug: Bug) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
        }} 
      />
    );

    await act(async () => {
      await addBug(testBug);
      await addBug({ ...testBug, id: "bug-2", title: "Test Bug 2" });
      await addBug({ ...testBug, id: "bug-3", title: "Test Bug 3" });
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("3");
    expect(screen.getByTestId("bug-bug-1-title").textContent).toBe("Test Bug");
    expect(screen.getByTestId("bug-bug-2-title").textContent).toBe("Test Bug 2");
    expect(screen.getByTestId("bug-bug-3-title").textContent).toBe("Test Bug 3");
  });

  it("should update only the specified bug", async () => {
    let addBug: (bug: Bug) => Promise<void>;
    let updateBug: (id: string, updates: Partial<Bug>) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          updateBug = ctx.updateBug;
        }} 
      />
    );

    await act(async () => {
      await addBug(testBug);
      await addBug({ ...testBug, id: "bug-2", title: "Test Bug 2" });
    });

    await act(async () => {
      await updateBug("bug-1", { status: "RESOLVED" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("bug-bug-1-status").textContent).toBe("RESOLVED");
      expect(screen.getByTestId("bug-bug-2-status").textContent).toBe("REPORTED");
    });
  });

  it("should delete only the specified bug", async () => {
    let addBug: (bug: Bug) => Promise<void>;
    let deleteBug: (id: string) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          deleteBug = ctx.deleteBug;
        }} 
      />
    );

    await act(async () => {
      await addBug(testBug);
      await addBug({ ...testBug, id: "bug-2", title: "Test Bug 2" });
      await addBug({ ...testBug, id: "bug-3", title: "Test Bug 3" });
    });

    await act(async () => {
      await deleteBug("bug-2");
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("2");
    expect(screen.getByTestId("bug-bug-1-title").textContent).toBe("Test Bug");
    expect(screen.getByTestId("bug-bug-3-title").textContent).toBe("Test Bug 3");
    expect(screen.queryByTestId("bug-bug-2")).not.toBeInTheDocument();
  });
});
