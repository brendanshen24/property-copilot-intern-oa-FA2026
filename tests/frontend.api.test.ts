import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { fetchProperties, fetchProperty } from "../lib/api";
import type { Property, PropertyFilter } from "../lib/types";

const mockProperty: Property = {
  id: "1",
  title: "Test Property",
  description: "Test Description",
  rent: 2000,
  bedrooms: 2,
  bathrooms: 1,
  propertyType: "apartment",
  squareFeet: 800,
  street: "123 Main St",
  city: "Vancouver",
  province: "BC",
  postalCode: "V6B 1A1",
  lat: 49.2827,
  lng: -123.1207,
  geohash: "c23nbq",
  geohashPrefix: "c23n",
  images: ["https://example.com/image.jpg"],
  createdAt: "2024-01-01T00:00:00Z"
};

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("fetchProperties", () => {
  test("fetches properties without filters", async () => {
    const mockResponse = { properties: [mockProperty] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await fetchProperties();
    expect(result).toEqual([mockProperty]);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/properties"),
      expect.any(Object)
    );
  });

  test("fetches properties with rent filter", async () => {
    const mockResponse = { properties: [mockProperty] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const filter: PropertyFilter = { minRent: 1500, maxRent: 2500 };
    await fetchProperties(filter);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("minRent=1500"),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("maxRent=2500"),
      expect.any(Object)
    );
  });

  test("fetches properties with bedroom filter", async () => {
    const mockResponse = { properties: [mockProperty] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const filter: PropertyFilter = { bedrooms: 2 };
    await fetchProperties(filter);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("bedrooms=2"),
      expect.any(Object)
    );
  });

  test("fetches properties with property type filter", async () => {
    const mockResponse = { properties: [mockProperty] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const filter: PropertyFilter = { propertyType: "condo" };
    await fetchProperties(filter);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("propertyType=condo"),
      expect.any(Object)
    );
  });

  test("fetches properties with city filter", async () => {
    const mockResponse = { properties: [mockProperty] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const filter: PropertyFilter = { city: "Richmond" };
    await fetchProperties(filter);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("city=Richmond"),
      expect.any(Object)
    );
  });

  test("fetches properties with multiple filters", async () => {
    const mockResponse = { properties: [mockProperty] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const filter: PropertyFilter = {
      minRent: 1500,
      maxRent: 2500,
      bedrooms: 2,
      bathrooms: 1,
      propertyType: "apartment",
      city: "Vancouver"
    };
    await fetchProperties(filter);

    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toContain("minRent=1500");
    expect(callUrl).toContain("maxRent=2500");
    expect(callUrl).toContain("bedrooms=2");
    expect(callUrl).toContain("bathrooms=1");
    expect(callUrl).toContain("propertyType=apartment");
    expect(callUrl).toContain("city=Vancouver");
  });

  test("throws on failed response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" })
    });

    await expect(fetchProperties()).rejects.toThrow("Server error");
  });

  test("throws with generic error when response is not JSON", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => { throw new Error("Not JSON"); }
    });

    await expect(fetchProperties()).rejects.toThrow("Request failed (404)");
  });

  test("handles Content-Type header correctly", async () => {
    const mockResponse = { properties: [mockProperty] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    await fetchProperties();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { "Content-Type": "application/json" }
      })
    );
  });
});

describe("fetchProperty", () => {
  test("fetches a single property by ID", async () => {
    const mockResponse = { property: mockProperty };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await fetchProperty("1");
    expect(result).toEqual(mockProperty);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/properties/1"),
      expect.any(Object)
    );
  });

  test("throws on failed response for single property", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Property not found" })
    });

    await expect(fetchProperty("nonexistent")).rejects.toThrow("Property not found");
  });

  test("uses the correct API base URL", async () => {
    const mockResponse = { property: mockProperty };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    await fetchProperty("1");

    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toMatch(/^http/);
    expect(callUrl).toContain("/properties/1");
  });
});
