# Jira Clone - Design Specification

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | AI Assistant | Initial version |

---

## 1. Overview

### 1.1 Purpose
Jira Clone is a task management kanban application that allows users to create, edit, and manage tasks across three stages: To Do, In Progress, and Done.

### 1.2 Scope
- Task creation and editing
- Kanban board view
- Tag system with history
- Data persistence via localStorage
- Jest unit testing

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14.2.4 |
| Language | TypeScript | - |
| Styling | Tailwind CSS | - |
| Testing | Jest + React Testing Library | - |
| Storage | Browser localStorage | - |

### 2.2 Component Structure

```
Dashboard (page.tsx)
├── Header
│   ├── Title: "Jira Clone"
│   ├── Status: "Saved locally" indicator
│   └── Navigation: Tasks / Requirements / Testing tabs
├── TaskBoard
│   ├── Column: To Do
│   ├── Column: In Progress
│   └── Column: Done
└── Modal (Create/Edit Task)
    ├── Form Fields
    └── Tag Input with Dropdown
```

---

## 3. Data Models

### 3.1 Task

```typescript
interface Task {
  id: string;           // Timestamp-based unique ID
  title: string;        // Task title (required)
  description: string;  // Task description
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;      // ISO date string
  tags: string[];       // Array of tag strings
  assignee: string;     // Team member name
  relatedRequirementId?: string;
}
```

### 3.2 Requirement

```typescript
interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "DRAFT" | "REVIEW" | "APPROVED" | "IMPLEMENTED";
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 TestCase

```typescript
interface TestCase {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  status: "PENDING" | "PASS" | "FAIL";
}
```

---

## 4. Core Features

### 4.1 Task Management

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Create Task | Click "New Task" button to open modal | Modal with form fields |
| Edit Task | Click task card to open edit modal | Prefilled form with existing data |
| Delete Task | Click "Delete" button on task card | Filter out task from array |
| Drag & Drop | Move tasks between columns | Click status dropdown to change |
| Priority | Color-coded priority indicators | CSS background colors |

### 4.2 Tag System

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Add Tag | Input text + Enter or click "+ Add Tag" | Push to tags array |
| Remove Tag | Click × on tag | Filter out tag from array |
| Tag History | Previously used tags stored in localStorage | useEffect collects tags from all tasks |
| Dropdown | Shows tag history when input is focused | Conditional rendering |
| Filter | Real-time filtering by input text | Array filter on tagHistory |
| Click to Add | Select tag from dropdown to add | onClick adds tag to task |

### 4.3 Data Persistence

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Auto-save | Save on every data change | useEffect with dependency array |
| Load on Mount | Restore data when component mounts | useLayoutEffect on initial render |
| Initialization Guard | Prevent empty array from overwriting existing data | isInitialized flag |
| Error Handling | try-catch around localStorage operations | Console.error on failure |

### 4.4 Testing

| Test Category | Test Cases | File |
|---------------|------------|------|
| Task Management | 4 | __tests__/dashboard.test.tsx |
| Tag Functionality | 3 | __tests__/dashboard.test.tsx |
| Local Storage | 3 | __tests__/dashboard.test.tsx |
| View Navigation | 1 | __tests__/dashboard.test.tsx |

---

## 5. Local Storage Keys

| Key | Description | Data Type |
|-----|-------------|-----------|
| `jira-clone-tasks` | Task data | JSON array |
| `jira-clone-requirements` | Requirements data | JSON array |
| `jira-clone-test-cases` | Test case data | JSON array |
| `jira-clone-tag-history` | Tag history | JSON array |

---

## 6. State Management

### 6.1 React State Variables

| State | Type | Purpose |
|-------|------|---------|
| `tasks` | Task[] | All tasks in the system |
| `requirements` | Requirement[] | All requirements |
| `testCases` | TestCase[] | All test cases |
| `viewMode` | "TASKS" \| "REQUIREMENTS" \| "TESTING" | Current active view |
| `showModal` | boolean | Show/hide create/edit modal |
| `editingTask` | Task \| null | Task being edited |
| `formData` | FormFields | Current form input values |
| `newTagInput` | string | Tag input field value |
| `tagHistory` | string[] | Previously used tags |
| `showTagDropdown` | boolean | Show/hide tag dropdown |
| `isInitialized` | boolean | Whether data has been loaded |

### 6.2 useEffect Hooks

| Hook | Dependency | Purpose |
|------|------------|---------|
| Load Data | [] | Load from localStorage on mount |
| Save Tasks | [tasks, isInitialized] | Save tasks to localStorage |
| Save Requirements | [requirements, isInitialized] | Save requirements to localStorage |
| Save TestCases | [testCases, isInitialized] | Save test cases to localStorage |
| Collect Tags | [tasks, isInitialized] | Collect tags for history |

---

## 7. UI Design

### 7.1 Color Scheme

| Element | Color | CSS Value |
|---------|-------|-----------|
| Primary | Blue | #2563eb |
| Background | Gray-50 | #f9fafb |
| Card | White | #ffffff |
| Priority-Low | Gray | #9ca3af |
| Priority-Medium | Blue | #60a5fa |
| Priority-High | Orange | #fb923c |
| Priority-Urgent | Red | #f87171 |

### 7.2 Layout

- **Header**: Fixed top, white background, shadow
- **Board**: Horizontal flex, overflow-x auto
- **Column**: min-width 360px, gray-100 background
- **Task Card**: White background, border, shadow
- **Modal**: Centered, white background, shadow

---

## 8. Today's Changes (2026-07-03)

### 8.1 Feature Additions

1. **Tag Dropdown**: Added tag history dropdown with filtering
   - Component: `app/dashboard/page.tsx`
   - Lines: 1904-2055
   - Features: Auto-complete, click-to-add, filtering

2. **Jest Testing**: Configured Jest + React Testing Library
   - Files: `jest.config.js`, `jest.setup.js`, `__tests__/dashboard.test.tsx`
   - 11 test cases covering core functionality

### 8.2 Bug Fixes

1. **localStorage Persistence**: Fixed page refresh data loss
   - Root cause: useEffect execution order causing empty array overwrite
   - Solution: Added `isInitialized` guard flag
   - Component: `app/dashboard/page.tsx`
   - Lines: 121, 152-156, 171-176, 169-176, 178-185

2. **Tag Input**: Fixed tag input interaction
   - Removed setTimeout that blocked input
   - Added e.stopPropagation() to prevent event bubbling

### 8.3 Improvements

1. **Page Title**: Changed from "Product Management System" to "Jira Clone"
   - Component: `app/dashboard/page.tsx`
   - Line: 587

2. **README.md**: Updated with new features and testing info

3. **DESIGN_SPEC.md**: Created comprehensive design specification

### 8.4 Test Results

```
Test Suites: 1 passed
Tests:       11 passed
Time:        1.437 s
```

---

## 9. Future Enhancements

- [ ] Backend API for cloud sync
- [ ] User authentication
- [ ] Real-time collaboration
- [ ] Advanced search and filtering
- [ ] Data export/import
- [ ] Mobile responsive design
- [ ] Dark mode
