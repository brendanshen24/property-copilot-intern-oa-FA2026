import { describe, expect, test } from "vitest";
import { filterProperties, parseFilter } from "../backend/src/filter";
import { SEED_PROPERTIES } from "../backend/src/seed-data";
import type { Property } from "../backend/src/types";

// Seed data lacks geo attributes; tests here do not need them.
const PROPERTIES = SEED_PROPERTIES as Property[];

describe("filterProperties", () => {
  test("rent range is inclusive on both ends", () => {
    const result = filterProperties(PROPERTIES, { minRent: 2000, maxRent: 3000 });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.rent).toBeGreaterThanOrEqual(2000);
      expect(p.rent).toBeLessThanOrEqual(3000);
    }
  });

  test("bedrooms filter is a minimum", () => {
    const result = filterProperties(PROPERTIES, { bedrooms: 3 });
    expect(result.every((p) => p.bedrooms >= 3)).toBe(true);
  });

  test("property type matches exactly", () => {
    const result = filterProperties(PROPERTIES, { propertyType: "condo" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.propertyType === "condo")).toBe(true);
  });

  test("filters compose: combining rent and bedrooms narrows the result", () => {
    const rentOnly = filterProperties(PROPERTIES, { maxRent: 3000 });
    const both = filterProperties(PROPERTIES, { maxRent: 3000, bedrooms: 2 });
    expect(both.length).toBeLessThanOrEqual(rentOnly.length);
    expect(both.every((p) => p.rent <= 3000 && p.bedrooms >= 2)).toBe(true);
  });

  test("no filters returns everything", () => {
    expect(filterProperties(PROPERTIES, {})).toHaveLength(PROPERTIES.length);
  });

  describe("bathrooms filter", () => {
    test("filters by minimum bathrooms", () => {
      const result = filterProperties(PROPERTIES, { bathrooms: 2 });
      expect(result.every((p) => p.bathrooms >= 2)).toBe(true);
    });

    test("combines with other filters", () => {
      const rentAndBed = filterProperties(PROPERTIES, { maxRent: 3000, bedrooms: 2 });
      const all = filterProperties(PROPERTIES, { maxRent: 3000, bedrooms: 2, bathrooms: 1 });
      expect(all.length).toBeLessThanOrEqual(rentAndBed.length);
      expect(all.every((p) => p.rent <= 3000 && p.bedrooms >= 2 && p.bathrooms >= 1)).toBe(true);
    });
  });

  describe("propertyType filter", () => {
    test("filters by exact property type", () => {
      const result = filterProperties(PROPERTIES, { propertyType: "condo" });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.propertyType === "condo")).toBe(true);
    });

    test("filters by different property types", () => {
      const apartments = filterProperties(PROPERTIES, { propertyType: "apartment" });
      const houses = filterProperties(PROPERTIES, { propertyType: "house" });
      const townhouses = filterProperties(PROPERTIES, { propertyType: "townhouse" });

      expect(apartments.every((p) => p.propertyType === "apartment")).toBe(true);
      expect(houses.every((p) => p.propertyType === "house")).toBe(true);
      expect(townhouses.every((p) => p.propertyType === "townhouse")).toBe(true);
    });

    test("combines with other filters", () => {
      const rentOnly = filterProperties(PROPERTIES, { maxRent: 3000 });
      const rentAndType = filterProperties(PROPERTIES, { maxRent: 3000, propertyType: "house" });
      expect(rentAndType.length).toBeLessThanOrEqual(rentOnly.length);
      expect(rentAndType.every((p) => p.rent <= 3000 && p.propertyType === "house")).toBe(true);
    });

    test("combines with bedrooms and bathrooms", () => {
      const result = filterProperties(PROPERTIES, { 
        propertyType: "house", 
        bedrooms: 2, 
        bathrooms: 1 
      });
      expect(result.every((p) => 
        p.propertyType === "house" && p.bedrooms >= 2 && p.bathrooms >= 1
      )).toBe(true);
    });
  });

  describe("city filter", () => {
    test("filters by exact city", () => {
      const result = filterProperties(PROPERTIES, { city: "Vancouver" });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.city === "Vancouver")).toBe(true);
    });

    test("filters by different cities", () => {
      const vancouver = filterProperties(PROPERTIES, { city: "Vancouver" });
      const richmond = filterProperties(PROPERTIES, { city: "Richmond" });
      const burnaby = filterProperties(PROPERTIES, { city: "Burnaby" });
      const surrey = filterProperties(PROPERTIES, { city: "Surrey" });

      expect(vancouver.every((p) => p.city === "Vancouver")).toBe(true);
      expect(richmond.every((p) => p.city === "Richmond")).toBe(true);
      expect(burnaby.every((p) => p.city === "Burnaby")).toBe(true);
      expect(surrey.every((p) => p.city === "Surrey")).toBe(true);
    });

    test("combines with other filters", () => {
      const rentOnly = filterProperties(PROPERTIES, { maxRent: 3000 });
      const rentAndCity = filterProperties(PROPERTIES, { maxRent: 3000, city: "Burnaby" });
      expect(rentAndCity.length).toBeLessThanOrEqual(rentOnly.length);
      expect(rentAndCity.every((p) => p.rent <= 3000 && p.city === "Burnaby")).toBe(true);
    });
  });
});

describe("parseFilter", () => {
  test("parses valid query params", () => {
    expect(
      parseFilter({ minRent: "1500", maxRent: "3000", bedrooms: "2", bathrooms: "1.5", propertyType: "house" })
    ).toEqual({ minRent: 1500, maxRent: 3000, bedrooms: 2, bathrooms: 1.5, propertyType: "house" });
  });

  test("ignores invalid property type and absent fields", () => {
    expect(parseFilter({ propertyType: "castle" })).toEqual({});
    expect(parseFilter({})).toEqual({});
  });

  describe("propertyType parsing", () => {
    test("accepts all valid property types", () => {
      expect(parseFilter({ propertyType: "apartment" })).toEqual({ propertyType: "apartment" });
      expect(parseFilter({ propertyType: "condo" })).toEqual({ propertyType: "condo" });
      expect(parseFilter({ propertyType: "house" })).toEqual({ propertyType: "house" });
      expect(parseFilter({ propertyType: "townhouse" })).toEqual({ propertyType: "townhouse" });
    });

    test("rejects invalid property types", () => {
      expect(parseFilter({ propertyType: "castle" })).toEqual({});
      expect(parseFilter({ propertyType: "APARTMENT" })).toEqual({});
      expect(parseFilter({ propertyType: "studio" })).toEqual({});
      expect(parseFilter({ propertyType: "" })).toEqual({});
    });

    test("preserves propertyType with other valid filters", () => {
      const result = parseFilter({ 
        minRent: "1500", 
        bedrooms: "2", 
        propertyType: "condo" 
      });
      expect(result).toEqual({ minRent: 1500, bedrooms: 2, propertyType: "condo" });
    });
  });

  describe("city parsing", () => {
    test("accepts all valid cities", () => {
      expect(parseFilter({ city: "Vancouver" })).toEqual({ city: "Vancouver" });
      expect(parseFilter({ city: "Richmond" })).toEqual({ city: "Richmond" });
      expect(parseFilter({ city: "Burnaby" })).toEqual({ city: "Burnaby" });
      expect(parseFilter({ city: "Surrey" })).toEqual({ city: "Surrey" });
    });

    test("rejects invalid cities", () => {
      expect(parseFilter({ city: "Victoria" })).toEqual({});
      expect(parseFilter({ city: "VANCOUVER" })).toEqual({});
      expect(parseFilter({ city: "" })).toEqual({});
    });

    test("preserves city with other valid filters", () => {
      const result = parseFilter({ 
        minRent: "1500", 
        bedrooms: "2", 
        city: "Vancouver" 
      });
      expect(result).toEqual({ minRent: 1500, bedrooms: 2, city: "Vancouver" });
    });
  });
});
