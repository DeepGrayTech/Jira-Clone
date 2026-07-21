import {
  NO_EPIC_FILTER,
  matchesEpicFilter,
  epicIdForCreate,
} from "../app/dashboard/constants";

describe("Epic filter helpers", () => {
  describe("matchesEpicFilter", () => {
    it("should match everything when filter is null (All Epics)", () => {
      expect(matchesEpicFilter(undefined, null)).toBe(true);
      expect(matchesEpicFilter("", null)).toBe(true);
      expect(matchesEpicFilter("epic-1", null)).toBe(true);
    });

    it("should match only cards with no epic when filter is NO_EPIC_FILTER", () => {
      expect(matchesEpicFilter(undefined, NO_EPIC_FILTER)).toBe(true);
      expect(matchesEpicFilter("", NO_EPIC_FILTER)).toBe(true);
      expect(matchesEpicFilter("epic-1", NO_EPIC_FILTER)).toBe(false);
    });

    it("should match only cards of the selected epic", () => {
      expect(matchesEpicFilter("epic-1", "epic-1")).toBe(true);
      expect(matchesEpicFilter("epic-2", "epic-1")).toBe(false);
      expect(matchesEpicFilter(undefined, "epic-1")).toBe(false);
    });
  });

  describe("epicIdForCreate", () => {
    it("should return undefined for All Epics and No Epic filters", () => {
      expect(epicIdForCreate(null)).toBeUndefined();
      expect(epicIdForCreate(NO_EPIC_FILTER)).toBeUndefined();
    });

    it("should return the epic id for a concrete epic filter", () => {
      expect(epicIdForCreate("epic-1")).toBe("epic-1");
    });
  });
});
