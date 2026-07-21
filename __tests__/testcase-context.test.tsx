import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import { TestCaseProvider, useTestCases } from "../app/dashboard/contexts/TestCaseContext";
import type { TestCase } from "../app/dashboard/types";

jest.mock("../app/dashboard/services/api", () => ({
  createTestCaseApi: jest.fn(async (tc: TestCase) => tc),
  updateTestCaseApi: jest.fn(async (_id: string, updates: Partial<TestCase>) => ({ id: _id, ...updates })),
  deleteTestCaseApi: jest.fn(async () => undefined),
}));

describe("TestCaseContext", () => {
  const testCase: TestCase = {
    id: "tc-1",
    requirementId: "req-1",
    title: "Test Case 1",
    description: "Test Description",
    status: "PENDING",
    steps: ["Step 1", "Step 2"],
    expectedResult: "Expected Result",
    actualResult: "",
  };

  const TestComponent = ({ 
    onRender, 
    onAction 
  }: { 
    onRender?: (context: ReturnType<typeof useTestCases>) => void;
    onAction?: (context: ReturnType<typeof useTestCases>) => void;
  }) => {
    const context = useTestCases();
    if (onRender) onRender(context);
    return (
      <div>
        <button onClick={() => onAction?.(context)} data-testid="action-btn">
          Action
        </button>
        <span data-testid="tc-count">{context.testCases.length}</span>
        {context.testCases.map((tc) => (
          <div key={tc.id} data-testid={`tc-${tc.id}`}>
            <span data-testid={`tc-${tc.id}-title`}>{tc.title}</span>
            <span data-testid={`tc-${tc.id}-status`}>{tc.status}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderWithProvider = (component: React.ReactNode) => {
    return render(<TestCaseProvider>{component}</TestCaseProvider>);
  };

  it("should initialize with empty testCases array", () => {
    renderWithProvider(<TestComponent />);
    expect(screen.getByTestId("tc-count").textContent).toBe("0");
  });

  it("should add a test case", async () => {
    let addTestCase: (tc: TestCase) => Promise<void>;

    renderWithProvider(
      <TestComponent onRender={(ctx) => { addTestCase = ctx.addTestCase; }} />
    );

    expect(screen.getByTestId("tc-count").textContent).toBe("0");

    await act(async () => {
      await addTestCase(testCase);
    });

    expect(screen.getByTestId("tc-count").textContent).toBe("1");
    expect(screen.getByTestId("tc-tc-1-title").textContent).toBe("Test Case 1");
  });

  it("should update a test case", async () => {
    let addTestCase: (tc: TestCase) => Promise<void>;
    let updateTestCase: (id: string, updates: Partial<TestCase>) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addTestCase = ctx.addTestCase; 
          updateTestCase = ctx.updateTestCase;
        }} 
      />
    );

    await act(async () => {
      await addTestCase(testCase);
    });

    expect(screen.getByTestId("tc-tc-1-status").textContent).toBe("PENDING");

    await act(async () => {
      await updateTestCase("tc-1", { status: "PASSED", actualResult: "Actual Result" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("tc-tc-1-status").textContent).toBe("PASSED");
    });
  });

  it("should delete a test case", async () => {
    let addTestCase: (tc: TestCase) => Promise<void>;
    let deleteTestCase: (id: string) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addTestCase = ctx.addTestCase; 
          deleteTestCase = ctx.deleteTestCase;
        }} 
      />
    );

    await act(async () => {
      await addTestCase(testCase);
    });

    expect(screen.getByTestId("tc-count").textContent).toBe("1");

    await act(async () => {
      await deleteTestCase("tc-1");
    });

    expect(screen.getByTestId("tc-count").textContent).toBe("0");
    expect(screen.queryByTestId("tc-tc-1")).not.toBeInTheDocument();
  });

  it("should get test case by id", async () => {
    let addTestCase: (tc: TestCase) => Promise<void>;
    let foundTestCase: TestCase | undefined;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { addTestCase = ctx.addTestCase; }} 
        onAction={(ctx) => {
          foundTestCase = ctx.getTestCaseById("tc-1");
        }}
      />
    );

    await act(async () => {
      await addTestCase(testCase);
    });

    fireEvent.click(screen.getByTestId("action-btn"));

    expect(foundTestCase).toBeDefined();
    expect(foundTestCase!.id).toBe("tc-1");
    expect(foundTestCase!.title).toBe("Test Case 1");
  });

  it("should return undefined for non-existent test case id", () => {
    let foundTestCase: TestCase | undefined;

    renderWithProvider(
      <TestComponent 
        onAction={(ctx) => {
          foundTestCase = ctx.getTestCaseById("non-existent");
        }}
      />
    );

    fireEvent.click(screen.getByTestId("action-btn"));

    expect(foundTestCase).toBeUndefined();
  });

  it("should throw error when useTestCases is used outside TestCaseProvider", () => {
    const TestComponentOutside = () => {
      useTestCases();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutside />);
    }).toThrow("useTestCases must be used within TestCaseProvider");
  });

  it("should handle multiple test cases", async () => {
    let addTestCase: (tc: TestCase) => Promise<void>;

    renderWithProvider(
      <TestComponent onRender={(ctx) => { addTestCase = ctx.addTestCase; }} />
    );

    await act(async () => {
      await addTestCase(testCase);
      await addTestCase({ ...testCase, id: "tc-2", title: "Test Case 2" });
      await addTestCase({ ...testCase, id: "tc-3", title: "Test Case 3" });
    });

    expect(screen.getByTestId("tc-count").textContent).toBe("3");
    expect(screen.getByTestId("tc-tc-1-title").textContent).toBe("Test Case 1");
    expect(screen.getByTestId("tc-tc-2-title").textContent).toBe("Test Case 2");
    expect(screen.getByTestId("tc-tc-3-title").textContent).toBe("Test Case 3");
  });

  it("should update only the specified test case", async () => {
    let addTestCase: (tc: TestCase) => Promise<void>;
    let updateTestCase: (id: string, updates: Partial<TestCase>) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addTestCase = ctx.addTestCase; 
          updateTestCase = ctx.updateTestCase;
        }} 
      />
    );

    await act(async () => {
      await addTestCase(testCase);
      await addTestCase({ ...testCase, id: "tc-2", title: "Test Case 2" });
    });

    await act(async () => {
      await updateTestCase("tc-1", { status: "FAILED" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("tc-tc-1-status").textContent).toBe("FAILED");
      expect(screen.getByTestId("tc-tc-2-status").textContent).toBe("PENDING");
    });
  });

  it("should delete only the specified test case", async () => {
    let addTestCase: (tc: TestCase) => Promise<void>;
    let deleteTestCase: (id: string) => Promise<void>;

    renderWithProvider(
      <TestComponent 
        onRender={(ctx) => { 
          addTestCase = ctx.addTestCase; 
          deleteTestCase = ctx.deleteTestCase;
        }} 
      />
    );

    await act(async () => {
      await addTestCase(testCase);
      await addTestCase({ ...testCase, id: "tc-2", title: "Test Case 2" });
      await addTestCase({ ...testCase, id: "tc-3", title: "Test Case 3" });
    });

    await act(async () => {
      await deleteTestCase("tc-2");
    });

    expect(screen.getByTestId("tc-count").textContent).toBe("2");
    expect(screen.getByTestId("tc-tc-1-title").textContent).toBe("Test Case 1");
    expect(screen.getByTestId("tc-tc-3-title").textContent).toBe("Test Case 3");
    expect(screen.queryByTestId("tc-tc-2")).not.toBeInTheDocument();
  });
});
