import { render, screen, act, fireEvent } from "@testing-library/react";
import { BugProvider, useBugs } from "../app/dashboard/contexts/BugContext";
import type { Bug } from "../app/dashboard/types";

describe("BugContext", () => {
  const testBug: Bug = {
    id: "bug-1",
    title: "Test Bug",
    description: "Test Description",
    status: "OPEN",
    severity: "HIGH",
    priority: "HIGH",
    assignee: "Test User",
    createdAt: "2024-01-01",
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

  it("should add a bug", () => {
    let addBug: (bug: Bug) => void;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { addBug = ctx.addBug; }} 
      />
    );

    expect(screen.getByTestId("bug-count").textContent).toBe("0");

    act(() => {
      addBug(testBug);
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("1");
    expect(screen.getByTestId("bug-bug-1-title").textContent).toBe("Test Bug");
  });

  it("should update a bug", () => {
    let addBug: (bug: Bug) => void;
    let updateBug: (id: string, updates: Partial<Bug>) => void;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          updateBug = ctx.updateBug;
        }} 
      />
    );

    act(() => {
      addBug(testBug);
    });

    expect(screen.getByTestId("bug-bug-1-status").textContent).toBe("OPEN");

    act(() => {
      updateBug("bug-1", { status: "IN_PROGRESS", description: "Updated Description" });
    });

    expect(screen.getByTestId("bug-bug-1-status").textContent).toBe("IN_PROGRESS");
  });

  it("should delete a bug", () => {
    let addBug: (bug: Bug) => void;
    let deleteBug: (id: string) => void;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          deleteBug = ctx.deleteBug;
        }} 
      />
    );

    act(() => {
      addBug(testBug);
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("1");

    act(() => {
      deleteBug("bug-1");
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("0");
    expect(screen.queryByTestId("bug-bug-1")).not.toBeInTheDocument();
  });

  it("should get bug by id", () => {
    let addBug: (bug: Bug) => void;
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

    act(() => {
      addBug(testBug);
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

  it("should handle multiple bugs", () => {
    let addBug: (bug: Bug) => void;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
        }} 
      />
    );

    act(() => {
      addBug(testBug);
      addBug({ ...testBug, id: "bug-2", title: "Test Bug 2" });
      addBug({ ...testBug, id: "bug-3", title: "Test Bug 3" });
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("3");
    expect(screen.getByTestId("bug-bug-1-title").textContent).toBe("Test Bug");
    expect(screen.getByTestId("bug-bug-2-title").textContent).toBe("Test Bug 2");
    expect(screen.getByTestId("bug-bug-3-title").textContent).toBe("Test Bug 3");
  });

  it("should update only the specified bug", () => {
    let addBug: (bug: Bug) => void;
    let updateBug: (id: string, updates: Partial<Bug>) => void;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          updateBug = ctx.updateBug;
        }} 
      />
    );

    act(() => {
      addBug(testBug);
      addBug({ ...testBug, id: "bug-2", title: "Test Bug 2" });
    });

    act(() => {
      updateBug("bug-1", { status: "RESOLVED" });
    });

    expect(screen.getByTestId("bug-bug-1-status").textContent).toBe("RESOLVED");
    expect(screen.getByTestId("bug-bug-2-status").textContent).toBe("OPEN");
  });

  it("should delete only the specified bug", () => {
    let addBug: (bug: Bug) => void;
    let deleteBug: (id: string) => void;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addBug = ctx.addBug; 
          deleteBug = ctx.deleteBug;
        }} 
      />
    );

    act(() => {
      addBug(testBug);
      addBug({ ...testBug, id: "bug-2", title: "Test Bug 2" });
      addBug({ ...testBug, id: "bug-3", title: "Test Bug 3" });
    });

    act(() => {
      deleteBug("bug-2");
    });

    expect(screen.getByTestId("bug-count").textContent).toBe("2");
    expect(screen.getByTestId("bug-bug-1-title").textContent).toBe("Test Bug");
    expect(screen.getByTestId("bug-bug-3-title").textContent).toBe("Test Bug 3");
    expect(screen.queryByTestId("bug-bug-2")).not.toBeInTheDocument();
  });
});