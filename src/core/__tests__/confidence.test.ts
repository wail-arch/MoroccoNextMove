import { describe, expect, it } from "vitest";
import {
  effectiveTier,
  oldestDate,
  weakestTier,
} from "../engine/confidence";

describe("weakestTier", () => {
  it("a chain is as trustworthy as its weakest link", () => {
    expect(
      weakestTier(["official-live", "cached-verified", "estimated-flagged"]),
    ).toBe("estimated-flagged");
    expect(weakestTier(["official-live", "cached-verified"])).toBe(
      "cached-verified",
    );
    expect(weakestTier(["official-live"])).toBe("official-live");
  });
});

describe("effectiveTier staleness", () => {
  it("keeps recently verified cached data at its tier", () => {
    expect(effectiveTier("cached-verified", "2026-05-01", "2026-06-11")).toBe(
      "cached-verified",
    );
  });

  it("degrades cached data that nobody has verified in ~9 months", () => {
    expect(effectiveTier("cached-verified", "2025-01-01", "2026-06-11")).toBe(
      "estimated-flagged",
    );
  });

  it("never upgrades estimated data", () => {
    expect(effectiveTier("estimated-flagged", "2026-06-10", "2026-06-11")).toBe(
      "estimated-flagged",
    );
  });
});

describe("oldestDate", () => {
  it("returns the oldest verification date", () => {
    expect(oldestDate(["2026-05-01", "2026-01-15", "2026-06-01"])).toBe(
      "2026-01-15",
    );
  });
});
