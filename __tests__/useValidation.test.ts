import { renderHook, act } from "@testing-library/react";
import { useValidation } from "../app/dashboard/hooks/useValidation";
import { validateDataIntegrity } from "../lib/validation";

jest.mock("../lib/validation", () => ({
  validateDataIntegrity: jest.fn(),
}));

describe("useValidation Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSetters = {
    setTasks: jest.fn(),
    setRequirements: jest.fn(),
    setTestCases: jest.fn(),
    setBugs: jest.fn(),
    setGoals: jest.fn(),
    setMilestones: jest.fn(),
    setKeyResults: jest.fn(),
  };

  it("should not validate when not initialized", () => {
    const { result } = renderHook(() =>
      useValidation(
        false,
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        mockSetters.setTasks,
        mockSetters.setRequirements,
        mockSetters.setTestCases,
        mockSetters.setBugs,
        mockSetters.setGoals,
        mockSetters.setMilestones,
        mockSetters.setKeyResults
      )
    );

    expect(result.current.validationResults).toEqual([]);
    expect(result.current.showValidationBanner).toBe(true);
    expect(validateDataIntegrity).not.toHaveBeenCalled();
  });

  it("should validate data when initialized", () => {
    (validateDataIntegrity as jest.Mock).mockReturnValue({
      type: "Task",
      isValid: true,
      errors: [],
    });

    const { result, rerender } = renderHook(
      ({ isInitialized }) =>
        useValidation(
          isInitialized,
          [{ id: "1", title: "Test", status: "TODO", priority: "MEDIUM" }],
          [],
          [],
          [],
          [],
          [],
          [],
          mockSetters.setTasks,
          mockSetters.setRequirements,
          mockSetters.setTestCases,
          mockSetters.setBugs,
          mockSetters.setGoals,
          mockSetters.setMilestones,
          mockSetters.setKeyResults
        ),
      {
        initialProps: { isInitialized: false },
      }
    );

    rerender({ isInitialized: true });

    expect(validateDataIntegrity).toHaveBeenCalled();
  });

  it("should handle validation errors and filter invalid data", () => {
    (validateDataIntegrity as jest.Mock).mockReturnValue({
      type: "Task",
      isValid: false,
      errors: [{ type: "Task", field: "title", message: "Title is required", id: "invalid-1" }],
    });

    const mockSetTasks = jest.fn();

    const { result, rerender } = renderHook(
      ({ isInitialized }) =>
        useValidation(
          isInitialized,
          [
            { id: "invalid-1", title: "", status: "TODO", priority: "MEDIUM" },
            { id: "valid-1", title: "Valid Task", status: "TODO", priority: "MEDIUM" },
          ],
          [],
          [],
          [],
          [],
          [],
          [],
          mockSetTasks,
          mockSetters.setRequirements,
          mockSetters.setTestCases,
          mockSetters.setBugs,
          mockSetters.setGoals,
          mockSetters.setMilestones,
          mockSetters.setKeyResults
        ),
      {
        initialProps: { isInitialized: false },
      }
    );

    rerender({ isInitialized: true });

    expect(mockSetTasks).toHaveBeenCalled();
    expect(result.current.validationResults.length).toBeGreaterThan(0);
    expect(result.current.showValidationBanner).toBe(true);
  });

  it("should reset to fallback when all data is invalid", () => {
    (validateDataIntegrity as jest.Mock).mockReturnValue({
      type: "Task",
      isValid: false,
      errors: [
        { type: "Task", field: "title", message: "Title is required", id: "invalid-1" },
        { type: "Task", field: "title", message: "Title is required", id: "invalid-2" },
      ],
    });

    const mockSetTasks = jest.fn();

    const { rerender } = renderHook(
      ({ isInitialized }) =>
        useValidation(
          isInitialized,
          [
            { id: "invalid-1", title: "", status: "TODO", priority: "MEDIUM" },
            { id: "invalid-2", title: "", status: "TODO", priority: "MEDIUM" },
          ],
          [],
          [],
          [],
          [],
          [],
          [],
          mockSetTasks,
          mockSetters.setRequirements,
          mockSetters.setTestCases,
          mockSetters.setBugs,
          mockSetters.setGoals,
          mockSetters.setMilestones,
          mockSetters.setKeyResults
        ),
      {
        initialProps: { isInitialized: false },
      }
    );

    rerender({ isInitialized: true });

    expect(mockSetTasks).toHaveBeenCalledWith([]);
  });

  it("should handle empty data arrays", () => {
    (validateDataIntegrity as jest.Mock).mockReturnValue({
      type: "Task",
      isValid: true,
      errors: [],
    });

    const { rerender } = renderHook(
      ({ isInitialized }) =>
        useValidation(
          isInitialized,
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          mockSetters.setTasks,
          mockSetters.setRequirements,
          mockSetters.setTestCases,
          mockSetters.setBugs,
          mockSetters.setGoals,
          mockSetters.setMilestones,
          mockSetters.setKeyResults
        ),
      {
        initialProps: { isInitialized: false },
      }
    );

    rerender({ isInitialized: true });

    expect(validateDataIntegrity).not.toHaveBeenCalled();
  });

  it("should allow manual control of validation banner", () => {
    const { result } = renderHook(() =>
      useValidation(
        false,
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        mockSetters.setTasks,
        mockSetters.setRequirements,
        mockSetters.setTestCases,
        mockSetters.setBugs,
        mockSetters.setGoals,
        mockSetters.setMilestones,
        mockSetters.setKeyResults
      )
    );

    act(() => {
      result.current.setShowValidationBanner(false);
    });

    expect(result.current.showValidationBanner).toBe(false);
  });

  it("should allow manual control of validation results", () => {
    const { result } = renderHook(() =>
      useValidation(
        false,
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        mockSetters.setTasks,
        mockSetters.setRequirements,
        mockSetters.setTestCases,
        mockSetters.setBugs,
        mockSetters.setGoals,
        mockSetters.setMilestones,
        mockSetters.setKeyResults
      )
    );

    const mockResults = [
      {
        type: "Test",
        isValid: false,
        errors: [{ type: "Test", field: "test", message: "Test error", id: "test-1" }],
      },
    ];

    act(() => {
      result.current.setValidationResults(mockResults);
    });

    expect(result.current.validationResults).toEqual(mockResults);
  });
});