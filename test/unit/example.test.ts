import { describe, it, expect } from "vitest";

describe("Example Unit Test", () => {
  it("should pass basic assertion", () => {
    expect(true).toBe(true);
  });

  it("should perform math operations correctly", () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
  });
});
