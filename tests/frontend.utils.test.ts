import { describe, expect, test } from "vitest";
import { cn } from "../lib/utils";

describe("cn utility", () => {
  test("merges single class", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  test("merges multiple classes", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  test("handles conditional classes", () => {
    const result = cn("text-red-500", false && "bg-blue-500", true && "font-bold");
    expect(result).toContain("text-red-500");
    expect(result).toContain("font-bold");
    expect(result).not.toContain("bg-blue-500");
  });

  test("resolves tailwind conflicts correctly", () => {
    const result = cn("px-2", "px-4");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  test("handles object notation", () => {
    const result = cn({
      "text-red-500": true,
      "text-blue-500": false,
      "font-bold": true
    });
    expect(result).toContain("text-red-500");
    expect(result).toContain("font-bold");
    expect(result).not.toContain("text-blue-500");
  });

  test("handles array input", () => {
    const result = cn(["text-red-500", "font-bold"]);
    expect(result).toContain("text-red-500");
    expect(result).toContain("font-bold");
  });

  test("handles empty input", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
  });

  test("handles undefined and null", () => {
    const result = cn("text-red-500", undefined, null, "font-bold");
    expect(result).toContain("text-red-500");
    expect(result).toContain("font-bold");
  });
});
