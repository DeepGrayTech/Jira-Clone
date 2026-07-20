import { render, screen, fireEvent } from "@testing-library/react";
import TestCaseCard from "../app/dashboard/components/TestCaseCard";
import type { TestCase, Requirement } from "../app/dashboard/types";

const mockTestCase: TestCase = {
  id: "tc-1",
  title: "Test Case",
  description: "Test description",
  status: "PENDING",
  priority: "MEDIUM",
  preconditions: ["Precondition 1"],
  testSteps: ["Step 1"],
  expectedResults: ["Result 1"],
  tags: ["tag1"],
};

const mockRequirement: Requirement = {
  id: "req-1",
  title: "Related Requirement",
  description: "",
  status: "DRAFT",
  priority: "MEDIUM",
  tags: [],
  acceptanceCriteria: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("TestCaseCard", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render test case card", () => {
    render(
      <TestCaseCard
        testCase={mockTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Test Case")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should render related requirement", () => {
    render(
      <TestCaseCard
        testCase={mockTestCase}
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Related: Related Requirement")).toBeInTheDocument();
  });

  it("should call onEdit when card is clicked", () => {
    render(
      <TestCaseCard
        testCase={mockTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Test case: Test Case/ }));

    expect(mockOnEdit).toHaveBeenCalledWith(mockTestCase);
  });

  it("should call onEdit when Enter key is pressed", () => {
    render(
      <TestCaseCard
        testCase={mockTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const card = screen.getByRole("button", { name: /Test case: Test Case/ });
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

    expect(mockOnEdit).toHaveBeenCalledWith(mockTestCase);
  });

  it("should call onEdit when Space key is pressed", () => {
    render(
      <TestCaseCard
        testCase={mockTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const card = screen.getByRole("button", { name: /Test case: Test Case/ });
    fireEvent.keyDown(card, { key: " ", code: "Space" });

    expect(mockOnEdit).toHaveBeenCalledWith(mockTestCase);
  });

  it("should call onDelete when Delete button is clicked", () => {
    render(
      <TestCaseCard
        testCase={mockTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("Delete"));

    expect(mockOnDelete).toHaveBeenCalledWith("tc-1");
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it("should render FAILED status", () => {
    const failedTestCase: TestCase = {
      ...mockTestCase,
      status: "FAILED",
      errorMessage: "Assertion failed",
      actualResult: "Actual value",
      errorLog: "Error stack trace",
    };

    const { container } = render(
      <TestCaseCard
        testCase={failedTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it("should render BLOCKED status", () => {
    const blockedTestCase: TestCase = {
      ...mockTestCase,
      status: "BLOCKED",
    };

    const { container } = render(
      <TestCaseCard
        testCase={blockedTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it("should handle different status styles", () => {
    const statuses: TestCase["status"][] = ["PENDING", "PASSED", "FAILED", "BLOCKED"];
    
    statuses.forEach((status) => {
      const { unmount } = render(
        <TestCaseCard
          testCase={{ ...mockTestCase, status }}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText("Test Case")).toBeInTheDocument();
      unmount();
    });
  });

  it("should render in small mode", () => {
    render(
      <TestCaseCard
        testCase={mockTestCase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isSmall={true}
      />
    );

    expect(screen.getByText("Test Case")).toBeInTheDocument();
  });

  it("should handle test case without description", () => {
    render(
      <TestCaseCard
        testCase={{ ...mockTestCase, description: "" }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  it("should render executor and executedAt when provided", () => {
    const testCaseWithMeta: TestCase = {
      ...mockTestCase,
      executor: "John",
      executedAt: "2024-01-15",
    };

    render(
      <TestCaseCard
        testCase={testCaseWithMeta}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("👤 John")).toBeInTheDocument();
    expect(screen.getByText("📅 2024-01-15")).toBeInTheDocument();
  });

  it("should handle test case without executor and executedAt", () => {
    render(
      <TestCaseCard
        testCase={{ ...mockTestCase, executor: undefined, executedAt: undefined }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Test Case")).toBeInTheDocument();
  });
});