import { EpicService } from "./EpicService";

describe("EpicService", () => {
  let service: EpicService;

  beforeEach(() => {
    service = new EpicService();
  });

  describe("validateEpic", () => {
    it("should return valid for a complete epic", () => {
      const result = service.validateEpic({
        title: "Valid Epic Title",
        description: "Valid description",
        color: "#3b82f6",
        status: "ACTIVE",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return error for empty title", () => {
      const result = service.validateEpic({
        title: "",
        description: "Description",
        color: "#3b82f6",
        status: "ACTIVE",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("title");
    });

    it("should return error for title exceeding 255 characters", () => {
      const longTitle = "A".repeat(256);
      const result = service.validateEpic({
        title: longTitle,
        description: "Description",
        color: "#3b82f6",
        status: "ACTIVE",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("title");
    });

    it("should return warning for description exceeding 2000 characters", () => {
      const longDescription = "A".repeat(2001);
      const result = service.validateEpic({
        title: "Valid Title",
        description: longDescription,
        color: "#3b82f6",
        status: "ACTIVE",
      });

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe("description");
    });

    it("should return error for invalid color format", () => {
      const result = service.validateEpic({
        title: "Valid Title",
        description: "Description",
        color: "invalid-color",
        status: "ACTIVE",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("color");
    });

    it("should accept valid hex color", () => {
      const result = service.validateEpic({
        title: "Valid Title",
        description: "Description",
        color: "#FF5733",
        status: "ACTIVE",
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe("isValidColor", () => {
    it("should return true for valid hex color", () => {
      expect(service.isValidColor("#3b82f6")).toBe(true);
      expect(service.isValidColor("#FF5733")).toBe(true);
      expect(service.isValidColor("#ffffff")).toBe(true);
    });

    it("should return false for invalid color", () => {
      expect(service.isValidColor("red")).toBe(false);
      expect(service.isValidColor("#FFF")).toBe(false);
      expect(service.isValidColor("#FFFF")).toBe(false);
      expect(service.isValidColor("")).toBe(false);
    });
  });

  describe("createEpic", () => {
    it("should create a valid epic with default values", () => {
      const epic = service.createEpic("Test Epic");

      expect(epic.id).toBeDefined();
      expect(epic.title).toBe("Test Epic");
      expect(epic.description).toBe("");
      expect(epic.color).toBe("#3b82f6");
      expect(epic.status).toBe("ACTIVE");
      expect(epic.createdAt).toBeDefined();
      expect(epic.updatedAt).toBeDefined();
    });

    it("should create a valid epic with custom description and color", () => {
      const epic = service.createEpic("Custom Epic", "Custom description", "#ef4444");

      expect(epic.title).toBe("Custom Epic");
      expect(epic.description).toBe("Custom description");
      expect(epic.color).toBe("#ef4444");
    });

    it("should trim title and description", () => {
      const epic = service.createEpic("  Trimmed Title  ", "  Trimmed Description  ");

      expect(epic.title).toBe("Trimmed Title");
      expect(epic.description).toBe("Trimmed Description");
    });
  });

  describe("generateId", () => {
    it("should generate a unique ID", () => {
      const id1 = service.generateId();
      const id2 = service.generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs with 'epic-' prefix", () => {
      const id = service.generateId();
      expect(id).toMatch(/^epic-/);
    });

    it("should generate IDs with timestamp, random part and counter", () => {
      const id = service.generateId();
      expect(id).toMatch(/^epic-\d+-\w+-\d+$/);
    });
  });

  describe("generateUniqueId", () => {
    it("should generate an ID not in existing IDs", () => {
      const existingIds = ["epic-1234567890-abc-123", "epic-1234567891-def-456"];
      const newId = service.generateUniqueId(existingIds);

      expect(newId).toBeDefined();
      expect(newId).toMatch(/^epic-/);
      expect(existingIds).not.toContain(newId);
    });

    it("should handle collision and generate a new ID", () => {
      const mockGenerateId = jest.spyOn(service, "generateId");
      mockGenerateId.mockReturnValueOnce("collision-id");
      mockGenerateId.mockReturnValueOnce("collision-id");
      mockGenerateId.mockReturnValueOnce("unique-id-123");

      const existingIds = ["collision-id"];
      const newId = service.generateUniqueId(existingIds);

      expect(newId).toBe("unique-id-123");
      expect(mockGenerateId).toHaveBeenCalled();

      mockGenerateId.mockRestore();
    });
  });

  describe("updateEpic", () => {
    it("should update epic with new values", () => {
      const originalEpic = {
        id: "epic1",
        title: "Original Title",
        description: "Original Description",
        color: "#3b82f6",
        status: "ACTIVE",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      const updatedEpic = service.updateEpic(originalEpic, {
        title: "Updated Title",
        description: "Updated Description",
      });

      expect(updatedEpic.title).toBe("Updated Title");
      expect(updatedEpic.description).toBe("Updated Description");
      expect(updatedEpic.color).toBe("#3b82f6");
      expect(updatedEpic.createdAt).toBe("2026-01-01T00:00:00Z");
      expect(updatedEpic.updatedAt).not.toBe("2026-01-01T00:00:00Z");
    });

    it("should preserve unchanged fields", () => {
      const originalEpic = {
        id: "epic1",
        title: "Title",
        description: "Description",
        color: "#3b82f6",
        status: "ACTIVE",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      const updatedEpic = service.updateEpic(originalEpic, { color: "#ef4444" });

      expect(updatedEpic.title).toBe("Title");
      expect(updatedEpic.description).toBe("Description");
      expect(updatedEpic.color).toBe("#ef4444");
      expect(updatedEpic.status).toBe("ACTIVE");
    });
  });

  describe("archiveEpic", () => {
    it("should set status to ARCHIVED", () => {
      const epic = {
        id: "epic1",
        title: "Title",
        description: "Description",
        color: "#3b82f6",
        status: "ACTIVE",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      const archivedEpic = service.archiveEpic(epic);

      expect(archivedEpic.status).toBe("ARCHIVED");
      expect(archivedEpic.updatedAt).not.toBe("2026-01-01T00:00:00Z");
    });
  });

  describe("activateEpic", () => {
    it("should set status to ACTIVE", () => {
      const epic = {
        id: "epic1",
        title: "Title",
        description: "Description",
        color: "#3b82f6",
        status: "ARCHIVED",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      const activatedEpic = service.activateEpic(epic);

      expect(activatedEpic.status).toBe("ACTIVE");
      expect(activatedEpic.updatedAt).not.toBe("2026-01-01T00:00:00Z");
    });
  });

  describe("getActiveEpics", () => {
    it("should return only active epics", () => {
      const epics = [
        { id: "epic1", title: "Active 1", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "", updatedAt: "" },
        { id: "epic2", title: "Archived", description: "", color: "#3b82f6", status: "ARCHIVED", createdAt: "", updatedAt: "" },
        { id: "epic3", title: "Active 2", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "", updatedAt: "" },
      ];

      const activeEpics = service.getActiveEpics(epics);

      expect(activeEpics).toHaveLength(2);
      expect(activeEpics.every((e) => e.status === "ACTIVE")).toBe(true);
    });
  });

  describe("sortEpicsByDate", () => {
    it("should sort epics in descending order by default", () => {
      const epics = [
        { id: "epic1", title: "Oldest", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z", updatedAt: "" },
        { id: "epic2", title: "Newest", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "2026-01-03T00:00:00Z", updatedAt: "" },
        { id: "epic3", title: "Middle", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "2026-01-02T00:00:00Z", updatedAt: "" },
      ];

      const sorted = service.sortEpicsByDate(epics);

      expect(sorted[0].title).toBe("Newest");
      expect(sorted[1].title).toBe("Middle");
      expect(sorted[2].title).toBe("Oldest");
    });

    it("should sort epics in ascending order when specified", () => {
      const epics = [
        { id: "epic1", title: "Oldest", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z", updatedAt: "" },
        { id: "epic2", title: "Newest", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "2026-01-03T00:00:00Z", updatedAt: "" },
        { id: "epic3", title: "Middle", description: "", color: "#3b82f6", status: "ACTIVE", createdAt: "2026-01-02T00:00:00Z", updatedAt: "" },
      ];

      const sorted = service.sortEpicsByDate(epics, true);

      expect(sorted[0].title).toBe("Oldest");
      expect(sorted[1].title).toBe("Middle");
      expect(sorted[2].title).toBe("Newest");
    });
  });
});