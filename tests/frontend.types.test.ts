import { describe, expect, test } from "vitest";
import type { Property, PropertyFilter, PropertyType, City } from "../lib/types";

describe("Frontend Types", () => {
  describe("PropertyType", () => {
    test("valid property types", () => {
      const types: PropertyType[] = ["apartment", "condo", "house", "townhouse"];
      expect(types).toHaveLength(4);
    });

    test("PropertyFilter accepts valid property types", () => {
      const filter: PropertyFilter = { propertyType: "apartment" };
      expect(filter.propertyType).toBe("apartment");
    });
  });

  describe("City", () => {
    test("valid cities", () => {
      const cities: City[] = ["Vancouver", "Richmond", "Burnaby", "Surrey"];
      expect(cities).toHaveLength(4);
    });

    test("PropertyFilter accepts valid cities", () => {
      const filter: PropertyFilter = { city: "Vancouver" };
      expect(filter.city).toBe("Vancouver");
    });
  });

  describe("PropertyFilter", () => {
    test("all filter properties are optional", () => {
      const emptyFilter: PropertyFilter = {};
      expect(Object.keys(emptyFilter)).toHaveLength(0);
    });

    test("accepts minRent and maxRent", () => {
      const filter: PropertyFilter = { minRent: 1000, maxRent: 3000 };
      expect(filter.minRent).toBe(1000);
      expect(filter.maxRent).toBe(3000);
    });

    test("accepts bedrooms and bathrooms", () => {
      const filter: PropertyFilter = { bedrooms: 2, bathrooms: 1.5 };
      expect(filter.bedrooms).toBe(2);
      expect(filter.bathrooms).toBe(1.5);
    });

    test("accepts propertyType and city", () => {
      const filter: PropertyFilter = { propertyType: "house", city: "Burnaby" };
      expect(filter.propertyType).toBe("house");
      expect(filter.city).toBe("Burnaby");
    });

    test("accepts bbox", () => {
      const filter: PropertyFilter = { bbox: "49.26,-123.14,49.3,-123.1" };
      expect(filter.bbox).toBe("49.26,-123.14,49.3,-123.1");
    });

    test("accepts all filters together", () => {
      const filter: PropertyFilter = {
        minRent: 1500,
        maxRent: 2500,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        city: "Vancouver",
        bbox: "49.26,-123.14,49.3,-123.1"
      };
      
      expect(filter.minRent).toBe(1500);
      expect(filter.maxRent).toBe(2500);
      expect(filter.bedrooms).toBe(2);
      expect(filter.bathrooms).toBe(1);
      expect(filter.propertyType).toBe("apartment");
      expect(filter.city).toBe("Vancouver");
      expect(filter.bbox).toBeDefined();
    });
  });

  describe("Property", () => {
    test("Property object has all required fields", () => {
      const property: Property = {
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

      expect(property.id).toBe("1");
      expect(property.title).toBe("Test Property");
      expect(property.rent).toBe(2000);
      expect(property.bedrooms).toBe(2);
      expect(property.images).toHaveLength(1);
    });

    test("Property supports multiple images", () => {
      const property: Property = {
        id: "1",
        title: "Test",
        description: "Test",
        rent: 2000,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        squareFeet: 800,
        street: "123 Main",
        city: "Vancouver",
        province: "BC",
        postalCode: "V6B",
        lat: 49.28,
        lng: -123.12,
        geohash: "c23",
        geohashPrefix: "c2",
        images: ["img1.jpg", "img2.jpg", "img3.jpg"],
        createdAt: "2024-01-01T00:00:00Z"
      };

      expect(property.images).toHaveLength(3);
    });

    test("Property supports studio (0 bedrooms)", () => {
      const property: Property = {
        id: "1",
        title: "Studio",
        description: "Test",
        rent: 1500,
        bedrooms: 0,
        bathrooms: 1,
        propertyType: "condo",
        squareFeet: 500,
        street: "123 Main",
        city: "Richmond",
        province: "BC",
        postalCode: "V6B",
        lat: 49.16,
        lng: -123.07,
        geohash: "c23",
        geohashPrefix: "c2",
        images: ["img.jpg"],
        createdAt: "2024-01-01T00:00:00Z"
      };

      expect(property.bedrooms).toBe(0);
    });

    test("Property supports fractional bathrooms", () => {
      const property: Property = {
        id: "1",
        title: "Test",
        description: "Test",
        rent: 2000,
        bedrooms: 2,
        bathrooms: 2.5,
        propertyType: "house",
        squareFeet: 1200,
        street: "123 Main",
        city: "Burnaby",
        province: "BC",
        postalCode: "V5B",
        lat: 49.24,
        lng: -122.98,
        geohash: "c23",
        geohashPrefix: "c2",
        images: ["img.jpg"],
        createdAt: "2024-01-01T00:00:00Z"
      };

      expect(property.bathrooms).toBe(2.5);
    });

    test("Property supports all property types", () => {
      const types: PropertyType[] = ["apartment", "condo", "house", "townhouse"];
      
      types.forEach((type) => {
        const property: Property = {
          id: "1",
          title: "Test",
          description: "Test",
          rent: 2000,
          bedrooms: 2,
          bathrooms: 1,
          propertyType: type,
          squareFeet: 800,
          street: "123 Main",
          city: "Vancouver",
          province: "BC",
          postalCode: "V6B",
          lat: 49.28,
          lng: -123.12,
          geohash: "c23",
          geohashPrefix: "c2",
          images: ["img.jpg"],
          createdAt: "2024-01-01T00:00:00Z"
        };

        expect(property.propertyType).toBe(type);
      });
    });
  });
});
