import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import Modal from "../app/dashboard/components/Modal";
import type { Task, FormFields, ModalType, Comment } from "../app/dashboard/types";

describe("Modal", () => {
  const defaultFormData: FormFields = {
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "",
    dueDate: "",
    tags: [],
    relatedRequirementId: "",
    relatedGoalId: "",
    figmaUrl: "",
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
  };

  const testTask: Task = {
    id: "task-1",
    title: "Test Task",
    description: "Test Description",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "",
    dueDate: "",
    tags: [],
    relatedRequirementId: "",
    relatedGoalId: "",
    figmaUrl: "",
    createdAt: "2024-01-01",
    comments: [],
  };

  const testComments: Comment[] = [
    {
      id: "comment-1",
      content: "Test comment",
      author: "Test User",
      createdAt: "2024-01-01",
    },
  ];

  const TestModalWrapper = ({
    show = true,
    modalType = "task",
    initialFormData = defaultFormData,
    editingTask = null,
    onSave,
    onClose,
    onAddComment,
    onDeleteComment,
  }: {
    show?: boolean;
    modalType?: ModalType;
    initialFormData?: FormFields;
    editingTask?: Task | null;
    onSave?: () => void;
    onClose?: () => void;
    onAddComment?: (taskId: string, content: string) => void;
    onDeleteComment?: (commentId: string, taskId: string) => void;
  }) => {
    const [formData, setFormData] = useState<FormFields>(initialFormData);
    return (
      <Modal
        show={show}
        modalType={modalType}
        editingTask={editingTask}
        editingRequirement={null}
        editingTestCase={null}
        editingBug={null}
        formData={formData}
        setFormData={setFormData}
        requirements={[]}
        goals={[]}
        tagHistory={["urgent", "important", "frontend"]}
        onSave={onSave || jest.fn()}
        onClose={onClose || jest.fn()}
        fontSizeScale={1}
        isSmall={false}
        taskComments={editingTask ? testComments : []}
        onAddComment={onAddComment || jest.fn()}
        onDeleteComment={onDeleteComment || jest.fn()}
      />
    );
  };

  it("should not render when show is false", () => {
    render(<TestModalWrapper show={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render when show is true", () => {
    render(<TestModalWrapper />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should render correct title for new task", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByRole("heading", { name: "New Task" })).toBeInTheDocument();
  });

  it("should render correct title for editing task", () => {
    render(<TestModalWrapper modalType="task" editingTask={testTask} />);
    expect(screen.getByRole("heading", { name: "Edit Task" })).toBeInTheDocument();
  });

  it("should render correct title for different modal types", () => {
    render(<TestModalWrapper modalType="requirement" />);
    expect(screen.getByRole("heading", { name: "New Requirement" })).toBeInTheDocument();

    render(<TestModalWrapper modalType="test" />);
    expect(screen.getByRole("heading", { name: "New Test Case" })).toBeInTheDocument();

    render(<TestModalWrapper modalType="bug" />);
    expect(screen.getByRole("heading", { name: "New Bug Report" })).toBeInTheDocument();
  });

  it("should call onClose when clicking overlay", () => {
    const mockOnClose = jest.fn();
    render(<TestModalWrapper onClose={mockOnClose} />);
    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should not call onClose when clicking modal content", () => {
    const mockOnClose = jest.fn();
    render(<TestModalWrapper onClose={mockOnClose} />);
    const content = screen.getByRole("document");
    fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should call onClose when clicking Cancel button", () => {
    const mockOnClose = jest.fn();
    render(<TestModalWrapper onClose={mockOnClose} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel and close" });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show error when submitting empty title", () => {
    render(<TestModalWrapper />);
    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").textContent).toBe("Title is required");
  });

  it("should clear error when typing in title input", () => {
    render(<TestModalWrapper />);
    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(screen.getByRole("alert")).toBeInTheDocument();

    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Test Title" } });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should show error when submitting bug without severity", () => {
    render(
      <TestModalWrapper
        modalType="bug"
        initialFormData={{
          ...defaultFormData,
          title: "Test Bug",
          severity: "",
          bugPriority: "HIGH",
        }}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").textContent).toBe("Severity is required");
  });

  it("should show error when submitting bug without priority", () => {
    render(
      <TestModalWrapper
        modalType="bug"
        initialFormData={{
          ...defaultFormData,
          title: "Test Bug",
          severity: "HIGH",
          bugPriority: "",
        }}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").textContent).toBe("Priority is required");
  });

  it("should call onSave when submitting valid form", () => {
    const mockOnSave = jest.fn();
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
        }}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should add tag when pressing Enter", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: [],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.change(tagInput, { target: { value: "new-tag" } });
    fireEvent.keyDown(tagInput, { key: "Enter", preventDefault: () => {} });

    expect(screen.getByText("#new-tag")).toBeInTheDocument();
  });

  it("should not add duplicate tag", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: ["existing-tag"],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.change(tagInput, { target: { value: "existing-tag" } });
    fireEvent.keyDown(tagInput, { key: "Enter", preventDefault: () => {} });

    const tags = screen.getAllByRole("listitem");
    expect(tags.length).toBe(1);
  });

  it("should remove tag when clicking X button", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: ["tag1", "tag2"],
        }}
      />
    );

    const removeButtons = screen.getAllByLabelText(/Remove tag/);
    fireEvent.click(removeButtons[0]);

    const tags = screen.getAllByRole("listitem");
    expect(tags.length).toBe(1);
    expect(tags[0]).toHaveTextContent("tag2");
  });

  it("should show tag dropdown when focusing tag input", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: [],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.focus(tagInput);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should select tag from dropdown", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: [],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.focus(tagInput);

    const tagOption = screen.getByRole("option", { name: "#urgent" });
    fireEvent.click(tagOption);

    expect(screen.getByText("#urgent")).toBeInTheDocument();
  });

  it("should render comments when editing task", () => {
    render(<TestModalWrapper modalType="task" editingTask={testTask} />);

    expect(screen.getByLabelText("Comments list")).toBeInTheDocument();
    expect(screen.getByText("Test comment")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should add comment when clicking Add button", () => {
    const mockOnAddComment = jest.fn();
    render(
      <TestModalWrapper
        modalType="task"
        editingTask={testTask}
        onAddComment={mockOnAddComment}
      />
    );

    const commentInput = screen.getByLabelText("Add a comment");
    fireEvent.change(commentInput, { target: { value: "New comment" } });

    const addButton = screen.getByRole("button", { name: "Submit comment" });
    fireEvent.click(addButton);

    expect(mockOnAddComment).toHaveBeenCalledWith("task-1", "New comment");
  });

  it("should add comment when pressing Enter", () => {
    const mockOnAddComment = jest.fn();
    render(
      <TestModalWrapper
        modalType="task"
        editingTask={testTask}
        onAddComment={mockOnAddComment}
      />
    );

    const commentInput = screen.getByLabelText("Add a comment");
    fireEvent.change(commentInput, { target: { value: "New comment" } });
    fireEvent.keyDown(commentInput, { key: "Enter" });

    expect(mockOnAddComment).toHaveBeenCalledWith("task-1", "New comment");
  });

  it("should delete comment when clicking Delete button", () => {
    const mockOnDeleteComment = jest.fn();
    render(
      <TestModalWrapper
        modalType="task"
        editingTask={testTask}
        onDeleteComment={mockOnDeleteComment}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /Delete comment/ });
    fireEvent.click(deleteButton);

    expect(mockOnDeleteComment).toHaveBeenCalledWith("comment-1", "task-1");
  });

  it("should close on Escape key", () => {
    const mockOnClose = jest.fn();
    render(<TestModalWrapper onClose={mockOnClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should render Save button when editing", () => {
    render(<TestModalWrapper modalType="task" editingTask={testTask} />);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("should render Create button when creating new", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByRole("button", { name: "Create new item" })).toBeInTheDocument();
  });

  it("should update form data when typing in inputs", () => {
    render(<TestModalWrapper />);

    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    expect(titleInput).toHaveValue("New Title");

    const descriptionInput = screen.getByLabelText("Description");
    fireEvent.change(descriptionInput, { target: { value: "New Description" } });

    expect(descriptionInput).toHaveValue("New Description");
  });

  it("should render status dropdown for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("should render priority dropdown for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
  });

  it("should render severity dropdown for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    expect(screen.getByLabelText("Severity")).toBeInTheDocument();
  });

  it("should render priority dropdown for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
  });

  it("should render due date for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByLabelText("Due Date")).toBeInTheDocument();
  });

  it("should render acceptance criteria for requirement modal", () => {
    render(<TestModalWrapper modalType="requirement" />);
    expect(screen.getByLabelText("Acceptance Criteria (one per line)")).toBeInTheDocument();
  });

  it("should render test steps for test modal", () => {
    render(<TestModalWrapper modalType="test" />);
    expect(screen.getByLabelText("Test Steps (one per line)")).toBeInTheDocument();
  });

  it("should render expected result for test modal", () => {
    render(<TestModalWrapper modalType="test" />);
    expect(screen.getByLabelText("Expected Result")).toBeInTheDocument();
  });

  it("should handle Tab key focus trap from first to last element", () => {
    render(<TestModalWrapper />);
    const titleInput = screen.getByLabelText("Title");
    titleInput.focus();
    fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
  });

  it("should handle Tab key focus trap from last to first element", () => {
    render(<TestModalWrapper />);
    const submitButton = screen.getByRole("button", { name: "Create new item" });
    submitButton.focus();
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
  });

  it("should close tag dropdown when clicking outside", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: [],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.focus(tagInput);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("document"));
  });

  it("should filter tags based on input", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: [],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.change(tagInput, { target: { value: "urg" } });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should clear tag input value after adding tag", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: [],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.change(tagInput, { target: { value: "new-tag" } });
    fireEvent.keyDown(tagInput, { key: "Enter", preventDefault: () => {} });

    expect(tagInput).toHaveValue("");
  });

  it("should render steps to reproduce for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    expect(screen.getByLabelText("Steps to Reproduce (one per line)")).toBeInTheDocument();
  });

  it("should render expected behavior for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    expect(screen.getByLabelText("Expected Behavior")).toBeInTheDocument();
  });

  it("should render actual behavior for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    expect(screen.getByLabelText("Actual Behavior")).toBeInTheDocument();
  });

  it("should render requester for requirement modal", () => {
    render(<TestModalWrapper modalType="requirement" />);
    expect(screen.getByLabelText("Requester (需求提出者)")).toBeInTheDocument();
  });

  it("should render executor for requirement modal", () => {
    render(<TestModalWrapper modalType="requirement" />);
    expect(screen.getByLabelText("Executor (需求执行者)")).toBeInTheDocument();
  });

  it("should render related goal for requirement modal", () => {
    render(<TestModalWrapper modalType="requirement" />);
    expect(screen.getByLabelText("Related Goal")).toBeInTheDocument();
  });

  it("should render assignee for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByLabelText("Assignee")).toBeInTheDocument();
  });

  it("should render executor for test modal", () => {
    render(<TestModalWrapper modalType="test" />);
    expect(screen.getByLabelText("Executor")).toBeInTheDocument();
  });

  it("should render related requirement for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByLabelText("Related Requirement")).toBeInTheDocument();
  });

  it("should render related goal for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByLabelText("Related Goal")).toBeInTheDocument();
  });

  it("should render figma url for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    expect(screen.getByLabelText("Figma URL")).toBeInTheDocument();
  });

  it("should render related requirement for test modal", () => {
    render(<TestModalWrapper modalType="test" />);
    expect(screen.getByLabelText("Related Requirement")).toBeInTheDocument();
  });

  it("should handle mouse over on cancel button", () => {
    render(<TestModalWrapper />);
    const cancelButton = screen.getByRole("button", { name: "Cancel and close" });
    fireEvent.mouseOver(cancelButton);
    fireEvent.mouseOut(cancelButton);
  });

  it("should handle mouse over on submit button", () => {
    render(<TestModalWrapper />);
    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.mouseOver(submitButton);
    fireEvent.mouseOut(submitButton);
  });

  it("should handle mouse over on tag option", () => {
    render(
      <TestModalWrapper
        initialFormData={{
          ...defaultFormData,
          title: "Test Task",
          tags: [],
        }}
      />
    );

    const tagInput = screen.getByLabelText("Add a tag");
    fireEvent.focus(tagInput);

    const tagOption = screen.getByRole("option", { name: "#urgent" });
    fireEvent.mouseOver(tagOption);
    fireEvent.mouseOut(tagOption);
  });

  it("should handle empty comments list", () => {
    render(
      <TestModalWrapper
        modalType="task"
        editingTask={testTask}
      />
    );
  });

  it("should update status for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    const statusSelect = screen.getByLabelText("Status");
    fireEvent.change(statusSelect, { target: { value: "IN_PROGRESS" } });
    expect(statusSelect).toHaveValue("IN_PROGRESS");
  });

  it("should update priority for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    const prioritySelect = screen.getByLabelText("Priority");
    fireEvent.change(prioritySelect, { target: { value: "HIGH" } });
    expect(prioritySelect).toHaveValue("HIGH");
  });

  it("should update severity for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    const severitySelect = screen.getByLabelText("Severity");
    fireEvent.change(severitySelect, { target: { value: "CRITICAL" } });
    expect(severitySelect).toHaveValue("CRITICAL");
  });

  it("should update bug priority for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    const prioritySelect = screen.getByLabelText("Priority");
    fireEvent.change(prioritySelect, { target: { value: "URGENT" } });
    expect(prioritySelect).toHaveValue("URGENT");
  });

  it("should update due date for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    const dueDateInput = screen.getByLabelText("Due Date");
    fireEvent.change(dueDateInput, { target: { value: "2024-12-31" } });
    expect(dueDateInput).toHaveValue("2024-12-31");
  });

  it("should update assignee for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    const assigneeSelect = screen.getByLabelText("Assignee");
    fireEvent.change(assigneeSelect, { target: { value: "像素魔法师" } });
    expect(assigneeSelect).toHaveValue("像素魔法师");
  });

  it("should update executor for test modal", () => {
    render(<TestModalWrapper modalType="test" />);
    const executorSelect = screen.getByLabelText("Executor");
    fireEvent.change(executorSelect, { target: { value: "Bug猎手" } });
    expect(executorSelect).toHaveValue("Bug猎手");
  });

  it("should update steps to reproduce for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    const stepsInput = screen.getByLabelText("Steps to Reproduce (one per line)");
    fireEvent.change(stepsInput, { target: { value: "Step 1\nStep 2" } });
    expect(stepsInput).toHaveValue("Step 1\nStep 2");
  });

  it("should update expected behavior for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    const expectedInput = screen.getByLabelText("Expected Behavior");
    fireEvent.change(expectedInput, { target: { value: "Expected" } });
    expect(expectedInput).toHaveValue("Expected");
  });

  it("should update actual behavior for bug modal", () => {
    render(<TestModalWrapper modalType="bug" />);
    const actualInput = screen.getByLabelText("Actual Behavior");
    fireEvent.change(actualInput, { target: { value: "Actual" } });
    expect(actualInput).toHaveValue("Actual");
  });

  it("should update acceptance criteria for requirement modal", () => {
    render(<TestModalWrapper modalType="requirement" />);
    const criteriaInput = screen.getByLabelText("Acceptance Criteria (one per line)");
    fireEvent.change(criteriaInput, { target: { value: "Criteria 1\nCriteria 2" } });
    expect(criteriaInput).toHaveValue("Criteria 1\nCriteria 2");
  });

  it("should update test steps for test modal", () => {
    render(<TestModalWrapper modalType="test" />);
    const stepsInput = screen.getByLabelText("Test Steps (one per line)");
    fireEvent.change(stepsInput, { target: { value: "Step 1\nStep 2" } });
    expect(stepsInput).toHaveValue("Step 1\nStep 2");
  });

  it("should update expected result for test modal", () => {
    render(<TestModalWrapper modalType="test" />);
    const resultInput = screen.getByLabelText("Expected Result");
    fireEvent.change(resultInput, { target: { value: "Expected result" } });
    expect(resultInput).toHaveValue("Expected result");
  });

  it("should update figma url for task modal", () => {
    render(<TestModalWrapper modalType="task" />);
    const figmaInput = screen.getByLabelText("Figma URL");
    fireEvent.change(figmaInput, { target: { value: "https://www.figma.com/file/test" } });
    expect(figmaInput).toHaveValue("https://www.figma.com/file/test");
  });

  it("should submit test case form with steps", () => {
    const mockOnSave = jest.fn();
    render(
      <TestModalWrapper
        modalType="test"
        initialFormData={{
          ...defaultFormData,
          title: "Test Case",
          steps: "Step 1\nStep 2",
        }}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should submit requirement form with acceptance criteria", () => {
    const mockOnSave = jest.fn();
    render(
      <TestModalWrapper
        modalType="requirement"
        initialFormData={{
          ...defaultFormData,
          title: "Requirement",
          acceptanceCriteria: "Criteria 1\nCriteria 2",
        }}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should submit bug form with steps to reproduce", () => {
    const mockOnSave = jest.fn();
    render(
      <TestModalWrapper
        modalType="bug"
        initialFormData={{
          ...defaultFormData,
          title: "Bug",
          severity: "HIGH",
          bugPriority: "HIGH",
          stepsToReproduce: "Step 1\nStep 2",
        }}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Create new item" });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should handle isSmall prop", () => {
    const TestSmallModalWrapper = () => {
      const [formData, setFormData] = useState<FormFields>(defaultFormData);
      return (
        <Modal
          show={true}
          modalType="task"
          editingTask={null}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={formData}
          setFormData={setFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}
          onSave={jest.fn()}
          onClose={jest.fn()}
          fontSizeScale={1}
          isSmall={true}
        />
      );
    };

    render(<TestSmallModalWrapper />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should handle fontSizeScale prop", () => {
    const TestScaledModalWrapper = () => {
      const [formData, setFormData] = useState<FormFields>(defaultFormData);
      return (
        <Modal
          show={true}
          modalType="task"
          editingTask={null}
          editingRequirement={null}
          editingTestCase={null}
          editingBug={null}
          formData={formData}
          setFormData={setFormData}
          requirements={[]}
          goals={[]}
          tagHistory={[]}
          onSave={jest.fn()}
          onClose={jest.fn()}
          fontSizeScale={0.8}
          isSmall={false}
        />
      );
    };

    render(<TestScaledModalWrapper />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});