"use client";

import { useEffect, useState } from "react";
import { fetchProperties } from "@/lib/api";
import type { Property, PropertyFilter } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";
import { MapPanelWrapper } from "@/components/MapPanelWrapper";
import { FilterBar } from "@/components/FilterBar";

type LoadState = "loading" | "error" | "ready";

export function BrowseContent() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PropertyFilter>({});
  const [isFiltering, setIsFiltering] = useState(false);

  // Load properties when filter changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState(properties.length === 0 ? "loading" : "ready");
      setIsFiltering(true);
      try {
        const data = await fetchProperties(filter);
        if (!cancelled) {
          setProperties(data);
          setState("ready");
          // Clear activeId if the active property is no longer in results
          if (activeId && !data.some((p) => p.id === activeId)) {
            setActiveId(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load listings");
          setState("error");
        }
      } finally {
        setIsFiltering(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filter, activeId]);

  const handleFilterChange = (newFilter: PropertyFilter) => {
    setFilter(newFilter);
    setActiveId(null);
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Browse rentals</h1>
        <p className="text-sm text-gray-600">
          Metro Vancouver listings. Filter by price, bedrooms, bathrooms, and sync with the map.
        </p>
      </div>

      {state === "error" ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load listings: {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Left column: Filters and List */}
        <div className="space-y-4">
          <FilterBar onFilterChange={handleFilterChange} disabled={isFiltering} />

          {state === "loading" ? (
            <p className="text-sm text-gray-600">Loading listings…</p>
          ) : null}

          {state === "ready" ? (
            <div>
              {properties.length === 0 ? (
                <p className="text-sm text-gray-600">No listings match your filters.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">
                    {properties.length} listing{properties.length === 1 ? "" : "s"}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        active={property.id === activeId}
                        onSelect={setActiveId}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Right column: Map */}
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)]">
          {state === "ready" ? (
            <MapPanelWrapper properties={properties} activeId={activeId} onSelect={setActiveId} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
