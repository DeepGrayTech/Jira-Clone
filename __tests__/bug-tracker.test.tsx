import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BugTracker from "../app/dashboard/components/BugTracker";
import type { Bug, Task, Requirement } from "../app/dashboard/types";

const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Login Page Development",
    description: "Implement login page with authentication",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "数据大厨",
    tags: ["frontend"],
    dueDate: "2024-02-01",
    createdAt: "2024-01-01T09:00:00Z",
    comments: [],
  },
];

const mockRequirements: Requirement[] = [
  {
    id: "r1",
    title: "User Authentication",
    description: "Implement secure user authentication system",
    status: "APPROVED",
    priority: "HIGH",
    acceptanceCriteria: ["Acceptance criteria 1"],
    requester: "客户A",
    executor: "数据大厨",
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
];

const mockBugs: Bug[] = [
  {
    id: "bug1",
    title: "Login page crash on special characters",
    description: "Page crashes when entering special characters",
    stepsToReproduce: ["Open login", "Enter @#$%", "Click login"],
    expectedBehavior: "Should handle special characters",
    actualBehavior: "Page crashes",
    severity: "CRITICAL",
    priority: "URGENT",
    status: "IN_PROGRESS",
    reporter: "客户A",
    assignee: "数据大厨",
    verifier: "测试人员A",
    relatedTaskId: "t1",
    relatedRequirementId: "r1",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-11T14:30:00Z",
    comments: [],
  },
  {
    id: "bug2",
    title: "Task drag drop not working",
    description: "Task status does not persist after drag",
    stepsToReproduce: ["Drag task", "Refresh page"],
    expectedBehavior: "Status should persist",
    actualBehavior: "Status reverts",
    severity: "HIGH",
    priority: "HIGH",
    status: "RESOLVED",
    reporter: "Bug猎手",
    assignee: "像素魔法师",
    verifier: "Bug猎手",
    relatedTaskId: "t1",
    createdAt: "2024-01-09T11:00:00Z",
    updatedAt: "2024-01-12T16:00:00Z",
    resolvedAt: "2024-01-12T16:00:00Z",
    resolution: "Fixed persistence",
    comments: [],
  },
];

const mockOnUpdateBug = jest.fn();
const mockOnDeleteBug = jest.fn();
const mockOnAddBugComment = jest.fn();
const mockOnCreateBug = jest.fn();
const mockOnEditBug = jest.fn();

describe("BugTracker Component", () => {
  describe("Verifier Dropdown", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const setup = () => {
      render(
        <BugTracker
          bugs={mockBugs}
          tasks={mockTasks}
          requirements={mockRequirements}
          onCreateBug={mockOnCreateBug}
          onEditBug={mockOnEditBug}
          onUpdateBug={mockOnUpdateBug}
          onDeleteBug={mockOnDeleteBug}
          onAddBugComment={mockOnAddBugComment}
        />
      );
    };

    it("should render BugTracker with bug cards", async () => {
      setup();

      await waitFor(() => {
        expect(screen.getByText("Bug Tracker")).toBeInTheDocument();
      });
    });

    it("should render verifier dropdown when bug is selected", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText("Assign Verifier (验证人)")
        ).toBeInTheDocument();
      });
    });

    it("should contain all 17 verifier options including default", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select");
        const options = dropdown?.querySelectorAll("option");
        expect(options?.length).toBe(17);
      });
    });

    it("should contain customer group options in dropdown", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select");
        const options = dropdown?.querySelectorAll("option");
        const optionValues = Array.from(options || []).map((opt) => opt.getAttribute("value"));

        expect(optionValues).toContain("客户A");
        expect(optionValues).toContain("客户B");
        expect(optionValues).toContain("客户C");
      });
    });

    it("should contain tester group options in dropdown", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        const optionValues = options.map((opt) => opt.getAttribute("value"));

        expect(optionValues).toContain("测试人员A");
        expect(optionValues).toContain("测试人员B");
        expect(optionValues).toContain("测试人员");
      });
    });

    it("should contain all team member options in dropdown", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        const optionValues = options.map((opt) => opt.getAttribute("value"));

        const teamMembers = [
          "需求粉碎机",
          "系统拆弹专家",
          "像素魔法师",
          "数据大厨",
          "配色狂魔",
          "代码找茬王",
          "规矩守护者",
          "Bug猎手",
          "文档整理控",
          "管理员",
        ];

        teamMembers.forEach((member) => {
          expect(optionValues).toContain(member);
        });
      });
    });

    it("should show default selected value from bug data", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;
        expect(dropdown.value).toBe("测试人员A");
      });
    });

    it("should call onUpdateBug when selecting a different verifier", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;

        fireEvent.change(dropdown, { target: { value: "客户B" } });

        expect(mockOnUpdateBug).toHaveBeenCalledTimes(1);
        expect(mockOnUpdateBug).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "bug1",
            verifier: "客户B",
          })
        );
      });
    });

    it("should call onUpdateBug with undefined when clearing verifier", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;

        fireEvent.change(dropdown, { target: { value: "" } });

        expect(mockOnUpdateBug).toHaveBeenCalledTimes(1);
        expect(mockOnUpdateBug).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "bug1",
            verifier: undefined,
          })
        );
      });
    });

    it("should update verifier for different bugs correctly", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(screen.getByText("Task drag drop not working"));
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;
        expect(dropdown.value).toBe("Bug猎手");

        fireEvent.change(dropdown, { target: { value: "像素魔法师" } });

        expect(mockOnUpdateBug).toHaveBeenCalledTimes(1);
        expect(mockOnUpdateBug).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "bug2",
            verifier: "像素魔法师",
          })
        );
      });
    });

    it("should verify verifier label and description are displayed correctly", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText("Assign Verifier (验证人)")
        ).toBeInTheDocument();
        expect(
          screen.getByText("验证人负责在Bug修复后进行测试验证")
        ).toBeInTheDocument();
      });
    });

    it("should close bug details when clicking close button", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText("Assign Verifier (验证人)")
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("×"));

      await waitFor(() => {
        expect(
          screen.queryByText("Assign Verifier (验证人)")
        ).not.toBeInTheDocument();
      });
    });

    it("should have a Save button in bug details", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        expect(screen.getByText("Save")).toBeInTheDocument();
      });
    });

    it("should call onUpdateBug when clicking Save button", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const saveButton = screen.getByText("Save");
        fireEvent.click(saveButton);

        expect(mockOnUpdateBug).toHaveBeenCalledTimes(1);
        expect(mockOnUpdateBug).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "bug1",
          })
        );
      });
    });

    it("should show save success message after clicking Save", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
      });
    });

    it("should select verifier from customer group", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;

        fireEvent.change(dropdown, { target: { value: "客户C" } });

        expect(dropdown.value).toBe("客户C");
        expect(mockOnUpdateBug).toHaveBeenCalledWith(
          expect.objectContaining({
            verifier: "客户C",
          })
        );
      });
    });

    it("should select verifier from tester group", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;

        fireEvent.change(dropdown, { target: { value: "测试人员B" } });

        expect(dropdown.value).toBe("测试人员B");
        expect(mockOnUpdateBug).toHaveBeenCalledWith(
          expect.objectContaining({
            verifier: "测试人员B",
          })
        );
      });
    });

    it("should select verifier from team member group", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;

        fireEvent.change(dropdown, { target: { value: "需求粉碎机" } });

        expect(dropdown.value).toBe("需求粉碎机");
        expect(mockOnUpdateBug).toHaveBeenCalledWith(
          expect.objectContaining({
            verifier: "需求粉碎机",
          })
        );
      });
    });

    it("should update verifier display immediately after selection", async () => {
      setup();

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Login page crash on special characters")
        );
      });

      await waitFor(() => {
        const verifierSection = screen.getByText("Assign Verifier (验证人)").parentElement?.parentElement;
        const dropdown = verifierSection?.querySelector("select") as HTMLSelectElement;
        expect(dropdown.value).toBe("测试人员A");

        fireEvent.change(dropdown, { target: { value: "代码找茬王" } });

        expect(dropdown.value).toBe("代码找茬王");
      });
    });
  });
});
