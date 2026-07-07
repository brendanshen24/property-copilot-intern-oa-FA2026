import { describe, expect, test, vi } from "vitest";
import { route } from "../backend/src/router";
import * as properties from "../backend/src/properties";

vi.mock("../backend/src/properties");

describe("router /properties", () => {
  test("calls listAllProperties when no bbox is provided", async () => {
    const mockList = vi.mocked(properties.listAllProperties);
    mockList.mockResolvedValue([]);

    await route({
      method: "GET",
      path: "/properties",
      query: {}
    });

    expect(mockList).toHaveBeenCalled();
  });

  test("calls queryByBoundingBox when valid bbox is provided", async () => {
    const mockQuery = vi.mocked(properties.queryByBoundingBox);
    mockQuery.mockResolvedValue([]);

    await route({
      method: "GET",
      path: "/properties",
      query: { bbox: "49.2,-123.2,49.3,-123.1" }
    });

    expect(mockQuery).toHaveBeenCalledWith({
      minLat: 49.2,
      minLng: -123.2,
      maxLat: 49.3,
      maxLng: -123.1
    });
  });

  test("falls back to listAllProperties when bbox is invalid", async () => {
    const mockList = vi.mocked(properties.listAllProperties);
    const mockQuery = vi.mocked(properties.queryByBoundingBox);
    mockList.mockResolvedValue([]);
    mockQuery.mockClear();

    await route({
      method: "GET",
      path: "/properties",
      query: { bbox: "invalid,box" }
    });

    expect(mockList).toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
