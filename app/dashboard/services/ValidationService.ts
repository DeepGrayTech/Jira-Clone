import type { Task, Requirement, TestCase, Bug, Goal, Milestone, KeyResult, ValidationError, ValidationResult } from "../types";
import { isValidTaskStatus, isValidTaskPriority, isValidRequirementStatus, isValidRequirementPriority, isValidTestCaseStatus } from "../types";

export class ValidationService {
  validateTaskData(taskData: Partial<Task>): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!taskData.title || !taskData.title.trim()) {
      errors.push({
        id: taskData.id || "N/A",
        type: "Task",
        field: "title",
        message: "Title is required",
        severity: "error",
      });
    }
    
    if (taskData.status && !isValidTaskStatus(taskData.status)) {
      errors.push({
        id: taskData.id || "N/A",
        type: "Task",
        field: "status",
        message: `Invalid status: ${taskData.status}`,
        severity: "error",
      });
    }
    
    if (taskData.priority && !isValidTaskPriority(taskData.priority)) {
      errors.push({
        id: taskData.id || "N/A",
        type: "Task",
        field: "priority",
        message: `Invalid priority: ${taskData.priority}`,
        severity: "error",
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      validCount: errors.length === 0 ? 1 : 0,
      totalCount: 1,
      type: "Task",
    };
  }

  validateRequirementData(reqData: Partial<Requirement>): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!reqData.title || !reqData.title.trim()) {
      errors.push({
        id: reqData.id || "N/A",
        type: "Requirement",
        field: "title",
        message: "Title is required",
        severity: "error",
      });
    }
    
    if (reqData.status && !isValidRequirementStatus(reqData.status)) {
      errors.push({
        id: reqData.id || "N/A",
        type: "Requirement",
        field: "status",
        message: `Invalid status: ${reqData.status}`,
        severity: "error",
      });
    }
    
    if (reqData.priority && !isValidRequirementPriority(reqData.priority)) {
      errors.push({
        id: reqData.id || "N/A",
        type: "Requirement",
        field: "priority",
        message: `Invalid priority: ${reqData.priority}`,
        severity: "error",
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      validCount: errors.length === 0 ? 1 : 0,
      totalCount: 1,
      type: "Requirement",
    };
  }

  validateTestCaseData(tcData: Partial<TestCase>): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!tcData.title || !tcData.title.trim()) {
      errors.push({
        id: tcData.id || "N/A",
        type: "TestCase",
        field: "title",
        message: "Title is required",
        severity: "error",
      });
    }
    
    if (tcData.status && !isValidTestCaseStatus(tcData.status)) {
      errors.push({
        id: tcData.id || "N/A",
        type: "TestCase",
        field: "status",
        message: `Invalid status: ${tcData.status}`,
        severity: "error",
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      validCount: errors.length === 0 ? 1 : 0,
      totalCount: 1,
      type: "TestCase",
    };
  }

  validateBugData(bugData: Partial<Bug>): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!bugData.title || !bugData.title.trim()) {
      errors.push({
        id: bugData.id || "N/A",
        type: "Bug",
        field: "title",
        message: "Title is required",
        severity: "error",
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      validCount: errors.length === 0 ? 1 : 0,
      totalCount: 1,
      type: "Bug",
    };
  }

  validateGoalData(goalData: Partial<Goal>): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!goalData.title || !goalData.title.trim()) {
      errors.push({
        id: goalData.id || "N/A",
        type: "Goal",
        field: "title",
        message: "Title is required",
        severity: "error",
      });
    }
    
    if (!goalData.startDate || !goalData.endDate) {
      errors.push({
        id: goalData.id || "N/A",
        type: "Goal",
        field: "dates",
        message: "Start and end dates are required",
        severity: "error",
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      validCount: errors.length === 0 ? 1 : 0,
      totalCount: 1,
      type: "Goal",
    };
  }
}