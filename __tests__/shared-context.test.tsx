import { render, screen, act } from "@testing-library/react";
import { SharedProvider, useShared } from "../app/dashboard/contexts/SharedContext";
import type { Comment, OperationLog } from "../app/dashboard/types";

const TestComponent = ({
  onRender,
}: {
  onRender: (context: ReturnType<typeof useShared>) => void;
}) => {
  const context = useShared();
  if (onRender) onRender(context);
  return (
    <div>
      <div data-testid="comment-count">{context.comments.length}</div>
      <div data-testid="tag-count">{context.tagHistory.length}</div>
      <div data-testid="log-count">{context.operationLogs.length}</div>
    </div>
  );
};

describe("SharedContext", () => {
  it("should initialize with empty state", () => {
    render(
      <SharedProvider>
        <TestComponent />
      </SharedProvider>
    );

    expect(screen.getByTestId("comment-count").textContent).toBe("0");
    expect(screen.getByTestId("tag-count").textContent).toBe("0");
    expect(screen.getByTestId("log-count").textContent).toBe("0");
  });

  it("should add a comment", () => {
    let addComment: (comment: Comment) => void;

    render(
      <SharedProvider>
        <TestComponent onRender={(ctx) => { addComment = ctx.addComment; }} />
      </SharedProvider>
    );

    const testComment: Comment = {
      id: "comment-1",
      taskId: "task-1",
      author: "testuser",
      content: "Test comment",
      createdAt: new Date().toISOString(),
    };

    act(() => {
      addComment(testComment);
    });

    expect(screen.getByTestId("comment-count").textContent).toBe("1");
  });

  it("should delete a comment", () => {
    let addComment: (comment: Comment) => void;
    let deleteComment: (commentId: string) => void;

    render(
      <SharedProvider>
        <TestComponent onRender={(ctx) => { addComment = ctx.addComment; deleteComment = ctx.deleteComment; }} />
      </SharedProvider>
    );

    const testComment: Comment = {
      id: "comment-1",
      taskId: "task-1",
      author: "testuser",
      content: "Test comment",
      createdAt: new Date().toISOString(),
    };

    act(() => {
      addComment(testComment);
    });

    expect(screen.getByTestId("comment-count").textContent).toBe("1");

    act(() => {
      deleteComment("comment-1");
    });

    expect(screen.getByTestId("comment-count").textContent).toBe("0");
  });

  it("should log an operation", () => {
    let logOperation: (action: string, target: string, details: string) => void;

    render(
      <SharedProvider>
        <TestComponent onRender={(ctx) => { logOperation = ctx.logOperation; }} />
      </SharedProvider>
    );

    act(() => {
      logOperation("CREATE", "Task", "Created task 'Test Task'");
    });

    expect(screen.getByTestId("log-count").textContent).toBe("1");
  });

  it("should limit operation logs to 100 entries", () => {
    let logOperation: (action: string, target: string, details: string) => void;

    render(
      <SharedProvider>
        <TestComponent onRender={(ctx) => { logOperation = ctx.logOperation; }} />
      </SharedProvider>
    );

    act(() => {
      for (let i = 0; i < 105; i++) {
        logOperation("TEST", "Test", `Test ${i}`);
      }
    });

    expect(screen.getByTestId("log-count").textContent).toBe("100");
  });

  it("should allow manual state updates via setComments", () => {
    let setComments: React.Dispatch<React.SetStateAction<Comment[]>>;

    render(
      <SharedProvider>
        <TestComponent onRender={(ctx) => { setComments = ctx.setComments; }} />
      </SharedProvider>
    );

    const testComments: Comment[] = [
      {
        id: "comment-1",
        taskId: "task-1",
        author: "testuser",
        content: "Test comment",
        createdAt: new Date().toISOString(),
      },
    ];

    act(() => {
      setComments(testComments);
    });

    expect(screen.getByTestId("comment-count").textContent).toBe("1");
  });

  it("should allow manual state updates via setTagHistory", () => {
    let setTagHistory: React.Dispatch<React.SetStateAction<string[]>>;

    render(
      <SharedProvider>
        <TestComponent onRender={(ctx) => { setTagHistory = ctx.setTagHistory; }} />
      </SharedProvider>
    );

    act(() => {
      setTagHistory(["tag1", "tag2", "tag3"]);
    });

    expect(screen.getByTestId("tag-count").textContent).toBe("3");
  });

  it("should throw error when useShared is used outside SharedProvider", () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useShared must be used within SharedProvider");
  });
});