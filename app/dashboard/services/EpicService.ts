import type { Epic, ValidationResult, ValidationError } from "../types";

export class EpicService {
  validateEpic(epic: Partial<Epic>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!epic.title || epic.title.trim().length === 0) {
      errors.push({
        id: "validation-epic-title",
        type: "EPIC",
        field: "title",
        message: "Epic title is required",
        severity: "error",
      });
    } else if (epic.title.length > 255) {
      errors.push({
        id: "validation-epic-title-length",
        type: "EPIC",
        field: "title",
        message: "Epic title cannot exceed 255 characters",
        severity: "error",
      });
    }

    if (epic.description && epic.description.length > 2000) {
      warnings.push({
        id: "validation-epic-description-length",
        type: "EPIC",
        field: "description",
        message: "Epic description exceeds recommended length of 2000 characters",
        severity: "warning",
      });
    }

    if (epic.color && !this.isValidColor(epic.color)) {
      errors.push({
        id: "validation-epic-color",
        type: "EPIC",
        field: "color",
        message: "Invalid color format. Must be a valid hex color code",
        severity: "error",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validCount: errors.length === 0 ? 1 : 0,
      totalCount: 1,
      type: "EPIC",
    };
  }

  isValidColor(color: string): boolean {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
  }

  generateId(): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 11);
    const counter = Math.floor(Math.random() * 1000);
    return `epic-${timestamp}-${randomPart}-${counter}`;
  }

  createEpic(title: string, description: string = "", color: string = "#3b82f6", existingIds: string[] = []): Epic {
    console.log(`[EpicService] createEpic | START | title="${title}" | description="${description}" | color=${color} | existingIdsCount=${existingIds.length}`);
    
    const now = new Date().toISOString();
    console.log(`[EpicService] createEpic | timestamp=${now}`);
    
    const id = existingIds.length > 0 ? this.generateUniqueId(existingIds) : this.generateId();
    console.log(`[EpicService] createEpic | generated id=${id}`);
    
    const epic: Epic = {
      id,
      title: title.trim(),
      description: description.trim(),
      color,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    
    console.log(`[EpicService] createEpic | COMPLETE | id=${epic.id} | title="${epic.title}" | status=${epic.status}`);
    
    return epic;
  }

  generateUniqueId(existingIds: string[]): string {
    let id = this.generateId();
    let attempts = 0;
    const maxAttempts = 10;
    while (existingIds.includes(id) && attempts < maxAttempts) {
      id = this.generateId();
      attempts++;
    }
    return id;
  }

  updateEpic(epic: Epic, updates: Partial<Epic>): Epic {
    return {
      ...epic,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  archiveEpic(epic: Epic): Epic {
    return this.updateEpic(epic, { status: "ARCHIVED" });
  }

  activateEpic(epic: Epic): Epic {
    return this.updateEpic(epic, { status: "ACTIVE" });
  }

  getActiveEpics(epics: Epic[]): Epic[] {
    return epics.filter((epic) => epic.status === "ACTIVE");
  }

  sortEpicsByDate(epics: Epic[], ascending: boolean = false): Epic[] {
    return [...epics].sort((a, b) => {
      const comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return ascending ? comparison : -comparison;
    });
  }
}